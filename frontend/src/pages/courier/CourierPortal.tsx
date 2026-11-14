import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCampus } from '../../context/CampusContext';
import { useSocket } from '../../context/SocketContext';
import { API } from '../../config/api';
import {
  Phone,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Bike,
  Building2,
  RefreshCw,
  Sparkles,
  Store,
} from 'lucide-react';

export const CourierPortal: React.FC = () => {
  const { token, user } = useAuth();
  const { currentCampus } = useCampus();
  const { socket, isConnected } = useSocket();

  // Active Job State & Batch Manifest
  const [activeJob, setActiveJob] = useState<any>(null);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);

  // View Tab: 'active' (available + ongoing) vs 'completed' (history & payouts)
  const [courierTab, setCourierTab] = useState<'active' | 'completed'>('active');
  const [completedRuns, setCompletedRuns] = useState<any[]>([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);

  // Available Dispatch Orders Pool
  const [availableDeliveries, setAvailableDeliveries] = useState<any[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const [curfewStatus, setCurfewStatus] = useState<any>(null);

  // PIN verification state
  const [enteredPin, setEnteredPin] = useState(['', '', '', '']);
  const [pinAttemptsRemaining, setPinAttemptsRemaining] = useState(3);
  const [settlementResult, setSettlementResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [milestoneLoading, setMilestoneLoading] = useState(false);
  const [confirmingProductId, setConfirmingProductId] = useState<string | null>(null);

  // Real-time Shift Earnings and Runner Performance Stats
  const [courierStats, setCourierStats] = useState<{
    todayEarnings: number;
    lifetimeEarnings: number;
    completedRunsToday: number;
    totalTripsCompleted: number;
    rating: number;
    ratingCount?: number;
    bankAccounts?: Array<{
      id: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
      isPrimary?: boolean;
    }>;
    bankAccount: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    } | null;
  }>({
    todayEarnings: 0,
    lifetimeEarnings: 0,
    completedRunsToday: 0,
    totalTripsCompleted: 0,
    rating: 0,
    ratingCount: 0,
    bankAccounts: [],
    bankAccount: null,
  });

  // Courier Bank Account Management (Max 2 accounts)
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [bankNameInput, setBankNameInput] = useState('Access Bank');
  const [accountNumberInput, setAccountNumberInput] = useState('');
  const [accountNameInput, setAccountNameInput] = useState('');
  const [bankFormError, setBankFormError] = useState<string | null>(null);
  const [bankSuccessToast, setBankSuccessToast] = useState<string | null>(null);
  const [submittingBank, setSubmittingBank] = useState(false);

  const fetchCourierStats = async () => {
    if (!token) return;
    try {
      const res = await API.getCourierStats(token);
      if (res && res.data) {
        let localBanks: any[] = [];
        try {
          const raw = localStorage.getItem('unihive_courier_banks');
          if (raw) localBanks = JSON.parse(raw);
        } catch {}

        const serverBanks = res.data.bankAccounts || [];
        const combined = serverBanks.length > 0 ? serverBanks : localBanks;

        setCourierStats({
          ...res.data,
          bankAccounts: combined,
          bankAccount: combined[0] || null,
        });
      }
    } catch (err) {
      console.warn('Could not load courier stats', err);
    }
  };

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankFormError(null);

    const cleanNum = accountNumberInput.trim();
    if (!/^\d{10}$/.test(cleanNum)) {
      setBankFormError('Account number must be exactly 10 digits (Nigerian NUBAN)');
      return;
    }
    if (!accountNameInput.trim()) {
      setBankFormError('Please enter account holder full name');
      return;
    }

    const currentAccounts = courierStats.bankAccounts || [];
    if (currentAccounts.length >= 2) {
      setBankFormError('Maximum limit reached: You can only link up to 2 bank accounts.');
      return;
    }

    setSubmittingBank(true);
    try {
      const newAcc = {
        id: `bank-${Date.now()}`,
        bankName: bankNameInput.trim(),
        accountNumber: cleanNum,
        accountName: accountNameInput.trim(),
        isPrimary: currentAccounts.length === 0,
      };

      if (token) {
        try {
          await API.addCourierBankAccount(
            { bankName: newAcc.bankName, accountNumber: newAcc.accountNumber, accountName: newAcc.accountName },
            token
          );
        } catch (apiErr) {
          console.warn('API sync warning:', apiErr);
        }
      }

      const updated = [...currentAccounts, newAcc];
      localStorage.setItem('unihive_courier_banks', JSON.stringify(updated));
      setCourierStats((prev) => ({
        ...prev,
        bankAccounts: updated,
        bankAccount: prev.bankAccount || newAcc,
      }));

      setIsAddBankModalOpen(false);
      setAccountNumberInput('');
      setAccountNameInput('');
      setBankSuccessToast(`Bank account (${newAcc.bankName}) added and saved successfully!`);
      setTimeout(() => setBankSuccessToast(null), 4000);
    } catch (err: any) {
      setBankFormError(err.message || 'Failed to add bank account');
    } finally {
      setSubmittingBank(false);
    }
  };

  // Fetch completed runs history
  const fetchCompletedRuns = async () => {
    if (!token) return;
    setLoadingCompleted(true);
    try {
      const res = await API.getCompletedDeliveries(token);
      if (res && res.data) {
        setCompletedRuns(res.data);
      }
    } catch (err) {
      console.warn('Could not load completed deliveries', err);
    } finally {
      setLoadingCompleted(false);
    }
  };

  // Fetch available dispatch jobs
  const fetchAvailable = async () => {
    if (!token) return;
    setLoadingAvailable(true);
    try {
      const res = await API.getAvailableDeliveries(token, currentCampus?.id || 'campus-run-ede');
      if (res.data) {
        setAvailableDeliveries(res.data);
      }
    } catch (err) {
      console.warn('Could not load available deliveries', err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  // Fetch active courier jobs (Batch Manifest)
  const fetchActiveJob = async () => {
    if (!token) return;
    try {
      const res = await API.getActiveCourierJobs(token);
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setActiveJobs(res.data);
        setSelectedJobIndex((prev) => (prev >= res.data.length ? 0 : prev));
        setActiveJob(res.data[0]);
      } else {
        const singleRes = await API.getActiveCourierJob(token);
        if (singleRes && singleRes.data) {
          setActiveJobs([singleRes.data]);
          setSelectedJobIndex(0);
          setActiveJob(singleRes.data);
        } else {
          setActiveJobs([]);
          setActiveJob(null);
        }
      }
    } catch (err) {
      console.warn('Could not load active courier jobs', err);
    }
  };

  const fetchCurfew = async () => {
    try {
      const res = await API.getPublicCurfewStatus(currentCampus?.id || 'campus-run-ede');
      if (res?.data) {
        setCurfewStatus(res.data);
      }
    } catch (e) {
      console.warn('Could not load curfew in courier portal', e);
    }
  };

  useEffect(() => {
    fetchAvailable();
    fetchActiveJob();
    fetchCourierStats();
    fetchCompletedRuns();
    fetchCurfew();
  }, [token, currentCampus]);


  // Real-time socket events for courier
  useEffect(() => {
    if (!socket) return;

    const handleNewDelivery = (data: any) => {
      console.log('[Socket] New dispatch job available:', data);
      const payload = data.payload || data;
      const fee = payload.payoutForCourier ?? payload.courierFee ?? 500;
      setNewOrderAlert(`New delivery available for #${payload.orderNumber || 'RUN'} (Earn ₦${fee.toLocaleString()})`);
      setTimeout(() => setNewOrderAlert(null), 6000);
      setAvailableDeliveries((prev) => {
        if (prev.some((d) => d.orderId === payload.orderId || d.orderNumber === payload.orderNumber)) {
          return prev;
        }
        return [payload, ...prev];
      });
      fetchAvailable();
    };

    const handleClaimedDelivery = (data: any) => {
      console.log('[Socket] Dispatch job claimed:', data);
      const payload = data.payload || data;
      setAvailableDeliveries((prev) =>
        prev.filter((d) => d.orderId !== payload.orderId && d.orderNumber !== payload.orderNumber)
      );
    };

    const handleOrderStatus = (data: any) => {
      console.log('[Socket] Order status updated in courier portal:', data);
      const targetNum = data.orderNumber;
      const targetId = data.payload?.orderId || data.orderId;

      setActiveJobs((prevJobs) =>
        prevJobs.map((j) => {
          if (j.orderNumber === targetNum || j.id === targetId || j.masterOrderNumber === targetNum) {
            return {
              ...j,
              status: data.status,
              disputeReason: data.payload?.reason || data.reason || j.disputeReason,
            };
          }
          return j;
        })
      );

      if (activeJob && (activeJob.orderNumber === targetNum || activeJob.id === targetId || activeJob.masterOrderNumber === targetNum)) {
        setActiveJob((prev: any) => ({
          ...prev,
          status: data.status,
          disputeReason: data.payload?.reason || data.reason || prev?.disputeReason,
        }));
      }

      if (data.status === 'inspected_completed') {
        fetchCourierStats();
        fetchCompletedRuns();
        fetchActiveJob();
      }
    };

    socket.on('dispatch:new_available', handleNewDelivery);
    socket.on('dispatch:claimed', handleClaimedDelivery);
    socket.on('order:status_changed', handleOrderStatus);


    return () => {
      socket.off('dispatch:new_available', handleNewDelivery);
      socket.off('dispatch:claimed', handleClaimedDelivery);
      socket.off('order:status_changed', handleOrderStatus);
    };
  }, [socket, activeJob]);

  // Courier claims delivery from available pool
  const handleClaimRun = async (delivery: any) => {
    if (!token) return;

    if (curfewStatus?.isCurfewActive) {
      alert(
        `🌙 Campus Curfew Active (9:00 PM Cutoff).\n\nCouriers cannot accept delivery jobs during curfew hours per university residence hall security rules.\n\nDispatch resumes ${curfewStatus.resumesAtText || 'at 8:00 AM (10:00 AM on Sundays)'}.`
      );
      return;
    }

    setLoading(true);
    try {
      await API.acceptDelivery(delivery.orderId, token);
      await fetchActiveJob();
      setSettlementResult(null);
      setError(null);
      setPinAttemptsRemaining(3);
      setEnteredPin(['', '', '', '']);
      setAvailableDeliveries((prev) => prev.filter((d) => d.orderId !== delivery.orderId));
    } catch (err: any) {
      alert(err.message || 'Failed to claim delivery');
    } finally {
      setLoading(false);
    }
  };

  // Courier confirms pickup of a single product stop in a multi-item run
  const handleConfirmItemPickup = async (productId: string) => {
    if (!token || !activeJob?.id) return;
    setConfirmingProductId(productId);
    try {
      const res = await API.confirmItemPickup(activeJob.id, productId, token);
      if (res && res.success) {
        await fetchActiveJob();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to record pickup');
    } finally {
      setConfirmingProductId(null);
    }
  };

  // Milestone advance: In Transit -> At Porter Desk (advances all packages in the run)
  const handleAdvanceMilestone = async (milestone: 'in_transit' | 'at_porter_desk') => {
    if (!token) return;
    setMilestoneLoading(true);
    try {
      const jobsToUpdate = activeJobs.length > 0 ? activeJobs : (activeJob ? [activeJob] : []);
      await Promise.all(
        jobsToUpdate.map((j) => API.updateMilestone(j.id, milestone, token))
      );
      await fetchActiveJob();
    } catch (err: any) {
      alert(err.message || 'Failed to update milestone');
    } finally {
      setMilestoneLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const updated = [...enteredPin];
    updated[index] = val.slice(-1);
    setEnteredPin(updated);
  };

  const handleVerifyPin = async () => {
    const pin = enteredPin.join('');
    if (pin.length !== 4) {
      setError('Please enter a complete 4-digit PIN');
      return;
    }

    const currentTarget = (activeJobs.length > 0 ? activeJobs[selectedJobIndex] : null) || activeJob;
    if (!token || !currentTarget?.id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await API.verifyPin(currentTarget.id, pin, token);
      if (res.success && res.data) {
        setSettlementResult(res.data);
        fetchCourierStats();
        fetchCompletedRuns();
        const updatedJobsRes = await API.getActiveCourierJobs(token);
        if (updatedJobsRes && updatedJobsRes.data && Array.isArray(updatedJobsRes.data)) {
          setActiveJobs(updatedJobsRes.data);
          if (updatedJobsRes.data.length > 0) {
            setSelectedJobIndex(0);
            setActiveJob(updatedJobsRes.data[0]);
          } else {
            setActiveJob(null);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Incorrect PIN entered.');
      if (err.message?.includes('remaining')) {
        const matches = err.message.match(/(\d+) attempt/);
        if (matches && matches[1]) {
          setPinAttemptsRemaining(parseInt(matches[1], 10));
        }
      } else if (err.message?.includes('Security lock') || err.message?.includes('locked')) {
        setPinAttemptsRemaining(0);
        if (currentTarget) currentTarget.status = 'disputed';
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px 16px 96px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Runner Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '0.4px', marginBottom: '2px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
            <span>{currentCampus?.shortName || 'RUN'} DISPATCH NETWORK</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              {user?.fullName || 'David Adeleke'} (Runner)
            </span>
            <span
              style={{
                background: '#F1F5F9',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              Joshua Hall
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: isConnected ? '#ECFDF5' : '#FEF2F2',
            color: isConnected ? '#059669' : '#DC2626',
            border: `1px solid ${isConnected ? '#A7F3D0' : '#FECACA'}`,
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '9999px',
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isConnected ? '#059669' : '#DC2626' }} />
          <span>{isConnected ? 'Fleet Online' : 'Connecting...'}</span>
        </div>
      </div>

      {/* New Order Real-Time Toast Alert */}
      {newOrderAlert && (
        <div
          style={{
            background: '#0F2B5C',
            color: '#F8FAFC',
            padding: '12px 16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(15, 43, 92, 0.3)',
            animation: 'pulse 1.5s infinite',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700 }}>
            <Sparkles size={16} color="#F59E0B" />
            <span>{newOrderAlert}</span>
          </div>
          <button
            onClick={() => setNewOrderAlert(null)}
            style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Courier Shift Performance Card (Dark Slate Box matching Screen 7) */}
      <div
        style={{
          background: '#0F172A',
          borderRadius: '20px',
          padding: '16px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#F59E0B' }}>
            <Bike size={16} />
            <span>Courier Shift Performance</span>
          </div>
          <span
            style={{
              background: '#064E3B',
              color: '#34D399',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '9999px',
            }}
          >
            ₦500 Batch • ₦1,500 Express
          </span>
        </div>

        {/* 2 Subcards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div
            onClick={() => setCourierTab('completed')}
            style={{
              background: '#1E293B',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              border: courierTab === 'completed' ? '1px solid #10B981' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
            title="Click to view completed runs history"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>TODAY'S EARNINGS</div>
              <span style={{ fontSize: '9px', color: '#34D399', fontWeight: 800 }}>View Log →</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10B981', margin: '2px 0' }}>
              ₦{Number(courierStats.todayEarnings || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>
              {courierStats.completedRunsToday || 0} Campus Runs Completed
            </div>
          </div>
          <div style={{ background: '#1E293B', borderRadius: '12px', padding: '12px' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>RUNNER RATING</div>
            <div
              style={{
                fontSize: courierStats.rating > 0 ? '20px' : '15px',
                fontWeight: 800,
                color: courierStats.rating > 0 ? '#F59E0B' : '#94A3B8',
                margin: '2px 0',
              }}
            >
              {courierStats.rating > 0 ? `${Number(courierStats.rating).toFixed(1)} ★` : 'No ratings yet'}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>
              {courierStats.rating > 0
                ? `${courierStats.ratingCount || 1} Reviews • ${courierStats.totalTripsCompleted || 0} Trips`
                : `New Runner • ${courierStats.totalTripsCompleted || 0} Trips`}
            </div>
          </div>
        </div>

        {/* Bank Account Strip (Max 2 accounts with Add feature) */}
        <div
          style={{
            background: '#1E293B',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>🏦</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#E2E8F0', letterSpacing: '0.3px' }}>
                PAYOUT BANK ACCOUNTS ({(courierStats.bankAccounts || []).length}/2 LINKED)
              </span>
            </div>

            {(courierStats.bankAccounts || []).length < 2 ? (
              <button
                onClick={() => {
                  setBankFormError(null);
                  setIsAddBankModalOpen(true);
                }}
                style={{
                  background: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                + Add Bank Account
              </button>
            ) : (
              <span
                style={{
                  background: '#334155',
                  color: '#94A3B8',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '6px',
                }}
              >
                Max 2 Accounts
              </span>
            )}
          </div>

          {/* List of linked accounts */}
          {!courierStats.bankAccounts || courierStats.bankAccounts.length === 0 ? (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
                color: '#94A3B8',
                fontSize: '11px',
              }}
            >
              No payout account linked yet. Click "+ Add Bank Account" above to link your Nigerian bank account for instant escrow settlements.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {courierStats.bankAccounts.map((acc, idx) => (
                <div
                  key={acc.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    border: '1px solid #334155',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#F8FAFC' }}>
                      {acc.bankName} • {acc.accountNumber}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                      {acc.accountName} {acc.isPrimary && '• Primary Payout'}
                    </div>
                  </div>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34D399',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Verified
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Switcher: Active Dispatch vs Completed Runs Log */}
      <div
        style={{
          display: 'flex',
          background: '#F1F5F9',
          borderRadius: '14px',
          padding: '4px',
          gap: '6px',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => setCourierTab('active')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            background: courierTab === 'active' ? '#FFFFFF' : 'transparent',
            color: courierTab === 'active' ? '#0F2B5C' : '#64748B',
            fontWeight: courierTab === 'active' ? 800 : 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: courierTab === 'active' ? '0 2px 8px rgba(15, 43, 92, 0.08)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Bike size={16} color={courierTab === 'active' ? '#2563EB' : '#64748B'} />
          <span>Active & Available</span>
          {availableDeliveries.length > 0 && (
            <span
              style={{
                background: '#2563EB',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 900,
                padding: '1px 6px',
                borderRadius: '9999px',
              }}
            >
              {availableDeliveries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setCourierTab('completed')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            background: courierTab === 'completed' ? '#FFFFFF' : 'transparent',
            color: courierTab === 'completed' ? '#059669' : '#64748B',
            fontWeight: courierTab === 'completed' ? 800 : 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: courierTab === 'completed' ? '0 2px 8px rgba(5, 150, 105, 0.08)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <CheckCircle2 size={16} color={courierTab === 'completed' ? '#059669' : '#64748B'} />
          <span>Completed Runs</span>
          <span
            style={{
              background: courierTab === 'completed' ? '#D1FAE5' : '#E2E8F0',
              color: courierTab === 'completed' ? '#065F46' : '#64748B',
              fontSize: '10px',
              fontWeight: 900,
              padding: '1px 6px',
              borderRadius: '9999px',
            }}
          >
            {completedRuns.length}
          </span>
        </button>
      </div>

      {courierTab === 'active' ? (
        <>
          {/* Available Campus Dispatch Pool */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', animation: 'pulse 1.5s infinite' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
              Available Campus Deliveries ({availableDeliveries.length})
            </h3>
          </div>
          <button
            onClick={fetchAvailable}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
            }}
          >
            <RefreshCw size={12} className={loadingAvailable ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Option C: Curfew Lockout Alert for Couriers */}
        {curfewStatus?.isCurfewActive && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1.5px solid #EF4444',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: 800, fontSize: '12.5px' }}>
              <span>🌙 Campus Curfew Lockout Active (9:00 PM Cutoff)</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#F87171', lineHeight: 1.4 }}>
              Courier dispatches are paused during night curfew hours per university hall rules. Delivery acceptance resumes at <strong>8:00 AM (10:00 AM on Sundays)</strong>.
            </p>
          </div>
        )}

        {availableDeliveries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 10px', color: '#94A3B8', fontSize: '12px' }}>
            No pending runs waiting for pickup right now. You'll be notified automatically when an order is placed!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {availableDeliveries.map((delivery) => (
              <div
                key={delivery.orderId}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F2B5C' }}>
                      #{delivery.packageTag || delivery.orderNumber}
                    </span>
                    {delivery.packageTag && delivery.masterOrderNumber && delivery.packageTag !== delivery.masterOrderNumber && (
                      <span
                        style={{
                          background: '#0F2B5C',
                          color: '#FFFFFF',
                          fontSize: '9.5px',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '4px',
                        }}
                      >
                        TAG: {delivery.packageTag.split('-').pop()}
                      </span>
                    )}
                    <span
                      style={{
                        background: delivery.deliveryMode === 'batch_evening' ? '#EFF6FF' : '#FFFBEB',
                        color: delivery.deliveryMode === 'batch_evening' ? '#1E40AF' : '#92400E',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        border: `1px solid ${delivery.deliveryMode === 'batch_evening' ? '#BFDBFE' : '#FDE68A'}`,
                      }}
                    >
                      {delivery.deliveryMode === 'batch_evening' ? 'Evening Batch' : 'Express Delivery'}
                    </span>
                    <span
                      style={{
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      +₦{(delivery.payoutForCourier ?? delivery.courierFee ?? 500).toLocaleString()} Payout
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>
                    <strong>Vendor:</strong> {delivery.vendorName || 'Campus Vendor'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    <strong>Dropoff:</strong> {delivery.dropoffHostel} ({delivery.porterLodge})
                  </div>
                </div>

                <button
                  onClick={() => handleClaimRun(delivery)}
                  disabled={loading || curfewStatus?.isCurfewActive}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: curfewStatus?.isCurfewActive ? '#64748B' : '#059669',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: curfewStatus?.isCurfewActive ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: curfewStatus?.isCurfewActive ? 'none' : '0 2px 8px rgba(5, 150, 105, 0.25)',
                    opacity: curfewStatus?.isCurfewActive ? 0.75 : 1,
                  }}
                  title={curfewStatus?.isCurfewActive ? 'Dispatch paused due to campus curfew rules' : undefined}
                >
                  {curfewStatus?.isCurfewActive
                    ? '🔒 Curfew Lockout (8:00 AM)'
                    : `Claim Run & Earn ₦${(delivery.payoutForCourier ?? delivery.courierFee ?? 500).toLocaleString()}`}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Batch Run Manifest & Deliveries */}
      {(activeJob || activeJobs.length > 0) && (
        <>
          {/* Multi-Order Batch Manifest Banner */}
          {activeJobs.length > 1 && (
            <div
              style={{
                background: '#0F2B5C',
                borderRadius: '14px',
                padding: '16px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 14px rgba(15, 43, 92, 0.12)',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#60A5FA', letterSpacing: '0.5px' }}>
                  📦 BATCH HOSTEL DELIVERY MANIFEST
                </div>
                <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '2px' }}>
                  {activeJobs.length} Pooled Packages • {activeJobs[0]?.dropoffHostel?.split('•')[0] || 'Hostel Drop'}
                </div>
                <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>
                  Handover each item and verify each student's confidential 4-digit PIN individually.
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '10px', color: '#93C5FD', fontWeight: 700 }}>Total Run Fee</div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#34D399' }}>
                  ₦{activeJobs.reduce((sum, j) => sum + (j.runnerFee || 500), 0).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Horizontal Package Selector Tabs */}
          {activeJobs.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {activeJobs.map((job, idx) => {
                const isSelected = idx === selectedJobIndex;
                return (
                  <button
                    key={job.id}
                    onClick={() => {
                      setSelectedJobIndex(idx);
                      setActiveJob(job);
                      setEnteredPin(['', '', '', '']);
                      setError(null);
                      setSettlementResult(null);
                    }}
                    style={{
                      flexShrink: 0,
                      padding: '8px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left',
                      boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.15)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: isSelected ? '#2563EB' : '#E2E8F0',
                        color: isSelected ? '#FFFFFF' : '#64748B',
                        fontSize: '11px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#1E40AF' : '#1E293B' }}>
                        {job.recipientName}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                        {job.packageTag || job.orderNumber} • ₦{job.runnerFee || 500}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #A7F3D0',
              padding: '16px',
              boxShadow: '0 4px 14px rgba(15, 43, 92, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                Active Gig #{activeJob.packageTag || activeJob.orderNumber}
              </span>
              {activeJob.packageTag && activeJob.masterOrderNumber && activeJob.packageTag !== activeJob.masterOrderNumber && (
                <span
                  style={{
                    background: '#0F2B5C',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '4px',
                  }}
                >
                  TAG: {activeJob.packageTag.split('-').pop()}
                </span>
              )}
              <span
                style={{
                  background: activeJob.deliveryMode === 'batch_evening' ? '#EFF6FF' : '#FFFBEB',
                  color: activeJob.deliveryMode === 'batch_evening' ? '#1E40AF' : '#92400E',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: `1px solid ${activeJob.deliveryMode === 'batch_evening' ? '#BFDBFE' : '#FDE68A'}`,
                }}
              >
                {activeJob.deliveryMode === 'batch_evening' ? 'Evening Batch' : 'Express Delivery'}
              </span>
            </div>
            <span
              style={{
                background:
                  activeJob.status === 'inspected_completed'
                    ? '#ECFDF5'
                    : activeJob.status === 'at_porter_desk'
                    ? '#FEF3C7'
                    : '#EFF6FF',
                color:
                  activeJob.status === 'inspected_completed'
                    ? '#059669'
                    : activeJob.status === 'at_porter_desk'
                    ? '#B45309'
                    : '#1D4ED8',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
              }}
            >
              ● {activeJob.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Multi-Product Pickup Stops Progress Card */}
          {activeJob.items && activeJob.items.length > 0 && (
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '12px 14px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  paddingBottom: '6px',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px' }}>🚴</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Multi-Stop Pickup Run ({activeJob.pickedUpCount || activeJob.items.filter((i: any) => i.isPickedUp).length}/{activeJob.totalCount || activeJob.items.length} Picked Up)
                  </span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                  ORDER #{activeJob.masterOrderNumber || activeJob.orderNumber}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeJob.items.map((item: any, idx: number) => {
                  const isDone = Boolean(item.isPickedUp);
                  return (
                    <div
                      key={item.productId || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isDone ? '#F0FDF4' : '#FFFFFF',
                        border: isDone ? '1px solid #86EFAC' : '1px solid #CBD5E1',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: isDone ? '#059669' : '#0F2B5C',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {isDone ? '✓' : idx + 1}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 750,
                              color: isDone ? '#166534' : '#0F172A',
                              textDecoration: isDone ? 'line-through' : 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.title}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                            📍 {item.pickupHostel || 'Campus Vendor'} • {item.vendorName || 'Vendor'}
                          </div>
                        </div>
                      </div>

                      {isDone ? (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#15803D',
                            background: '#DCFCE7',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            flexShrink: 0,
                          }}
                        >
                          Picked Up ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConfirmItemPickup(item.productId)}
                          disabled={confirmingProductId === item.productId}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#0F2B5C',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 750,
                            cursor: 'pointer',
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {confirmingProductId === item.productId ? 'Confirming...' : 'Picked Up ✓'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Route Details */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '14px',
              padding: '14px',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#059669', letterSpacing: '0.4px' }}>
                ● PICKUP LOCATION (DONE ✓)
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {activeJob.pickupLocation}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Vendor: {activeJob.pickupVendor} (Sealed Package)</div>
            </div>

            <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#3B82F6', letterSpacing: '0.4px' }}>
                ● DROPOFF DESTINATION (GROUND-FLOOR RECEPTION)
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {activeJob.dropoffHostel}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Recipient: {activeJob.recipientName}</div>
            </div>

            {/* RUN Safety Rule Alert */}
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#DC2626',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              <ShieldAlert size={14} style={{ flexShrink: 0 }} />
              <span>RUN Safety Rule: Handover strictly at Porter's Lodge. No room entry permitted.</span>
            </div>
          </div>

          {/* Milestone Action Buttons */}
          {activeJob.status === 'in_transit' && (
            <div style={{ marginBottom: '14px' }}>
              <button
                onClick={() => handleAdvanceMilestone('at_porter_desk')}
                disabled={milestoneLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Building2 size={16} />
                <span>
                  {milestoneLoading ? 'Updating...' : 'Arrived at Porter Desk (Alert Buyer to Inspect)'}
                </span>
              </button>
              <div style={{ fontSize: '10px', color: '#64748B', textAlign: 'center', marginTop: '6px' }}>
                Broadcasting arrival alerts the student to come down to the ground-floor reception desk.
              </div>
            </div>
          )}

          {/* Call & WhatsApp Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <a
              href={`tel:${activeJob.recipientPhone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '10px',
                background: '#EFF6FF',
                color: '#1D4ED8',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid #BFDBFE',
              }}
            >
              <Phone size={14} />
              <span>Call {activeJob.recipientName?.split(' ')[0] || 'Buyer'}</span>
            </a>
            <a
              href={`https://wa.me/234${activeJob.recipientPhone?.replace(/^0/, '') || '8143829102'}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '10px',
                background: '#ECFDF5',
                color: '#059669',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid #A7F3D0',
              }}
            >
              <MessageSquare size={14} />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* 4-Digit Handshake PIN Entry Box */}
          {activeJob.status === 'at_porter_desk' && !settlementResult && (
            <div
              style={{
                background: '#FFFBEB',
                border: '1.5px solid #FDE68A',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                <Lock size={15} color="#D97706" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>
                  Enter Buyer's 4-Digit Delivery Code
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#B45309', marginBottom: '14px' }}>
                Ask {activeJob.recipientName?.split(' ')[0] || 'the student'} for the code after they inspect the items at the Porter's desk.
              </p>

              {/* 4-Digit Inputs */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={enteredPin[idx] || ''}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    style={{
                      width: '44px',
                      height: '52px',
                      borderRadius: '10px',
                      border: '2px solid #F59E0B',
                      background: '#FFFFFF',
                      textAlign: 'center',
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                ))}
              </div>

              {error && (
                <div
                  style={{
                    background: '#FEF2F2',
                    color: '#DC2626',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    marginBottom: '10px',
                    fontWeight: 600,
                  }}
                >
                  {error} (Attempts remaining: {pinAttemptsRemaining})
                </div>
              )}

              {(() => {
                const currentTarget = (activeJobs.length > 0 ? activeJobs[selectedJobIndex] : null) || activeJob;
                const buyerFee = currentTarget?.runnerFee ?? currentTarget?.courierFee ?? (currentTarget?.deliveryMode === 'express' ? 1500 : currentTarget?.deliveryMode === 'pickup' ? 0 : 500);
                const vendorAmount = currentTarget?.itemSubtotal || 18500;
                return (
                  <>
                    <button
                      onClick={handleVerifyPin}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#0F2B5C',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={16} color="#10B981" />
                      <span>
                        {loading
                          ? 'Verifying...'
                          : buyerFee > 0
                          ? `Confirm PIN & Collect ₦${buyerFee.toLocaleString()} Fee`
                          : 'Confirm PIN & Complete Free Pickup'}
                      </span>
                    </button>

                    <div style={{ fontSize: '10px', color: '#64748B', marginTop: '8px' }}>
                      Dual Settlement: Triggers ₦{vendorAmount.toLocaleString()} to vendor's OPay {buyerFee > 0 ? `& ₦${buyerFee.toLocaleString()} to your Kuda account.` : '(Self-pickup run).'}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Settlement Success Output */}
          {settlementResult && (
            <div
              style={{
                background: '#ECFDF5',
                border: '2px solid #10B981',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <CheckCircle2 size={44} color="#10B981" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#065F46' }}>
                Dual Settlement Executed Successfully!
              </h3>
              <p style={{ fontSize: '12px', color: '#047857', marginTop: '2px', marginBottom: '14px' }}>
                The 4-digit PIN matched. Funds have been atomically split via Paystack Subaccounts.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Your Runner Payout</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#10B981' }}>
                    +₦{(settlementResult.courierPayout?.amount || activeJob?.runnerFee || 500).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '9px', color: '#94A3B8' }}>Credited to Kuda Bank</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Vendor Payout</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F2B5C' }}>
                    +₦{(settlementResult.vendorPayout?.amount || 18500).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '9px', color: '#94A3B8' }}>Credited to OPay</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSettlementResult(null);
                  setEnteredPin(['', '', '', '']);
                  if (activeJobs.length > 0) {
                    setSelectedJobIndex(0);
                    setActiveJob(activeJobs[0]);
                  } else {
                    setActiveJob(null);
                    fetchAvailable();
                  }
                }}
                style={{
                  marginTop: '16px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                }}
              >
                {activeJobs.length > 0
                  ? `✓ Drop Verified! Proceed to Next Package (${activeJobs.length} Remaining) →`
                  : '✓ Run Complete! Check For More Campus Runs'}
              </button>
            </div>
          )}

          {/* Dispute or 3-Attempt Lockout State */}
          {(activeJob.status === 'disputed' || pinAttemptsRemaining === 0) && (
            <div
              style={{
                background: '#FEF2F2',
                border: '2px solid #EF4444',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <AlertTriangle size={44} color="#EF4444" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#991B1B' }}>
                Escrow Frozen: Dispute Escalated to Mediation
              </h3>
              <p style={{ fontSize: '12px', color: '#B91C1C', marginTop: '4px' }}>
                {activeJob.disputeReason ||
                  'This delivery has been frozen due to a customer inspection complaint or 3-attempt PIN security lockout.'}
              </p>
              <div
                style={{
                  marginTop: '12px',
                  background: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  border: '1px solid #FECACA',
                  fontSize: '11px',
                  color: '#7F1D1D',
                  textAlign: 'left',
                }}
              >
                <strong>Runner Instructions:</strong> Do not hand over item until authorized by Chief Proctor O. Adeleke. Please report to the Ground Floor Porter Reception or Admin Desk.
              </div>
              <button
                onClick={() => {
                  setActiveJob(null);
                  fetchAvailable();
                }}
                style={{
                  marginTop: '14px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #EF4444',
                  background: '#FFFFFF',
                  color: '#DC2626',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close & Return to Available Fleet Pool
              </button>
            </div>
          )}
        </div>
        </>
      )}
        </>
      ) : (
        /* Completed Runs & Dispatch History Section */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                Completed Dispatch Runs ({completedRuns.length})
              </h3>
            </div>
            <button
              onClick={fetchCompletedRuns}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              <RefreshCw size={12} className={loadingCompleted ? 'spin' : ''} /> Refresh
            </button>
          </div>

          {loadingCompleted ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '13px' }}>
              Loading completed runs...
            </div>
          ) : completedRuns.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E2E8F0',
                padding: '36px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                }}
              >
                <Bike size={26} />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                No Completed Runs Yet
              </h4>
              <p style={{ fontSize: '12px', color: '#64748B', maxWidth: '340px', margin: '0 auto 18px auto', lineHeight: 1.4 }}>
                Claim available jobs from the dispatch queue and complete the 4-digit PIN handshake with buyers to build your completed trips log and earn instant bank payouts!
              </p>
              <button
                onClick={() => setCourierTab('active')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                View Available Fleet Deliveries
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {completedRuns.map((run) => (
                <div
                  key={run.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    boxShadow: '0 2px 6px rgba(15, 43, 92, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F2B5C' }}>
                        #{run.masterOrderNumber || run.orderNumber}
                      </span>
                      {run.packageTag && (
                        <span
                          style={{
                            background: '#0F2B5C',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          TAG: {run.packageTag.split('-').pop()}
                        </span>
                      )}
                      <span
                        style={{
                          background: run.deliveryMode === 'express' ? '#FEF3C7' : '#EFF6FF',
                          color: run.deliveryMode === 'express' ? '#92400E' : '#1E40AF',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          border: `1px solid ${run.deliveryMode === 'express' ? '#FDE68A' : '#BFDBFE'}`,
                        }}
                      >
                        {run.deliveryMode === 'express' ? 'Express Delivery' : 'Hostel Batch'}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                        +₦{Number(run.courierFee || 500).toLocaleString()}
                      </div>
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 800,
                          color: '#059669',
                          background: '#ECFDF5',
                          padding: '2px 7px',
                          borderRadius: '9999px',
                          border: '1px solid #A7F3D0',
                        }}
                      >
                        ✓ Settled to Bank
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={13} color="#2563EB" />
                      <span><strong>Destination:</strong> {run.dropoffHostel} ({run.dropoffRoom})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Store size={13} color="#D97706" />
                      <span><strong>Vendor:</strong> {run.vendorName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px' }}>👤</span>
                      <span><strong>Buyer:</strong> {run.recipientName} ({run.recipientPhone})</span>
                    </div>
                  </div>

                  {run.items && run.items.length > 0 && (
                    <div
                      style={{
                        background: '#F8FAFC',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        fontSize: '11px',
                        color: '#334155',
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '4px', color: '#64748B' }}>
                        Delivered Items ({run.totalItemsCount || run.items.length}):
                      </div>
                      {run.items.map((item: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>• {item.quantity}x {item.title} {item.selectedSize ? `(${item.selectedSize})` : ''}</span>
                          <span style={{ fontWeight: 600 }}>₦{Number(item.subtotal || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '6px',
                      borderTop: '1px dashed #E2E8F0',
                      fontSize: '10.5px',
                      color: '#94A3B8',
                    }}
                  >
                    <span>Completed: {new Date(run.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(run.completedAt).toLocaleDateString()}</span>
                    {run.transferCode && <span>Ref: {run.transferCode}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Bank Account Modal (Strict max 2 accounts) */}
      {isAddBankModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🏦</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Link Courier Payout Bank
                </h3>
              </div>
              <button
                onClick={() => setIsAddBankModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.45 }}>
              Your delivery earnings will be credited directly to this account immediately upon handshake OTP match. You can save up to 2 accounts.
            </p>

            {bankFormError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  marginBottom: '14px',
                  fontWeight: 600,
                }}
              >
                {bankFormError}
              </div>
            )}

            <form onSubmit={handleAddBankAccount} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  BANK NAME
                </label>
                <select
                  value={bankNameInput}
                  onChange={(e) => setBankNameInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    background: '#F8FAFC',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="Access Bank">Access Bank</option>
                  <option value="GTBank (Guaranty Trust)">GTBank (Guaranty Trust)</option>
                  <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                  <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="Kuda Bank">Kuda Bank</option>
                  <option value="OPay">OPay</option>
                  <option value="Palmpay">Palmpay</option>
                  <option value="Stanbic IBTC">Stanbic IBTC</option>
                  <option value="Wema Bank (ALAT)">Wema Bank (ALAT)</option>
                  <option value="Fidelity Bank">Fidelity Bank</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  10-DIGIT NUBAN ACCOUNT NUMBER
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  placeholder="e.g. 0123456789"
                  value={accountNumberInput}
                  onChange={(e) => setAccountNumberInput(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    outline: 'none',
                    background: '#F8FAFC',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  ACCOUNT HOLDER FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Adeleke"
                  value={accountNameInput}
                  onChange={(e) => setAccountNameInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    background: '#F8FAFC',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddBankModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBank}
                  style={{
                    flex: 1.5,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#059669',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: submittingBank ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  {submittingBank ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {bankSuccessToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#064E3B',
            color: '#34D399',
            border: '1px solid #059669',
            borderRadius: '12px',
            padding: '12px 18px',
            fontWeight: 800,
            fontSize: '13px',
            zIndex: 10000,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }}
        >
          ✓ {bankSuccessToast}
        </div>
      )}
    </div>
  );
};
