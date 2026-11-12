import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCampus } from '../../context/CampusContext';
import { useSocket } from '../../context/SocketContext';
import { useResponsive } from '../../hooks/useResponsive';
import { UniHiveLogo } from '../../components/common/UniHiveLogo';
import { API } from '../../config/api';
import { DisputeMediationDesk } from './DisputeMediationDesk';
import { FleetAndMerchantDesk } from './FleetAndMerchantDesk';
import {
  ShieldCheck,
  Lock,
  DollarSign,
  Bike,
  Store,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  RefreshCw,
  ChevronDown,
  UserPlus,
  ExternalLink,
  Copy,
  Check,
  X,
  MessageSquare,
  LogOut,
  MapPin,
} from 'lucide-react';

export const AdminConsole: React.FC = () => {
  const { token, logout } = useAuth();
  const { campuses, currentCampus, setCurrentCampus, hostels } = useCampus();
  const { socket, joinAdmin, isConnected } = useSocket();
  const { isMobile } = useResponsive();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'disputes' | 'fleet' | 'stores' | 'products' | 'stream' | 'payouts'
  >('overview');

  const [stats, setStats] = useState<any>({
    kpis: {
      escrowVaultBalance: 0,
      platformRevenue: 0,
      activeCouriersCount: 0,
      verifiedVendorsCount: 1,
      openDisputesCount: 0,
    },
    recentOrdersCount: 0,
  });

  const [disputes, setDisputes] = useState<any[]>([]);
  const [stream, setStream] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  // Option B: Fleet Couriers, Campus Vendors, Product Moderation
  const [couriers, setCouriers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [resolutionMessage, setResolutionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fleet Courier Provisioning State (WhatsApp Dispatch)
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [runnerFullName, setRunnerFullName] = useState('');
  const [runnerPhone, setRunnerPhone] = useState('');
  const [runnerHostelId, setRunnerHostelId] = useState('');
  const [runnerPassword, setRunnerPassword] = useState(`RUN-FLEET-${Math.floor(1000 + Math.random() * 9000)}`);
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [provisionSuccessData, setProvisionSuccessData] = useState<any | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  const resetProvisionModal = () => {
    setRunnerFullName('');
    setRunnerPhone('');
    setRunnerHostelId(hostels[0]?.id || 'hostel-run-joshua');
    setRunnerPassword(`RUN-FLEET-${Math.floor(1000 + Math.random() * 9000)}`);
    setProvisionError(null);
    setProvisionSuccessData(null);
    setCopiedCredentials(false);
    setIsProvisionModalOpen(false);
  };

  const handleProvisionRunner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProvisionLoading(true);
    setProvisionError(null);
    try {
      const res = await API.provisionFleetCourier(
        {
          fullName: runnerFullName,
          whatsappPhone: runnerPhone,
          baseHostelId: runnerHostelId || hostels[0]?.id || 'hostel-run-joshua',
          campusId: currentCampus?.id || 'campus-run-ede',
          customPassword: runnerPassword,
        },
        token
      );
      if (res.data) {
        setProvisionSuccessData(res.data);
        setResolutionMessage(`✓ Fleet Runner ${res.data.user.fullName} provisioned with WhatsApp credentials!`);
        loadAdminData();
      }
    } catch (err: any) {
      setProvisionError(err.message || 'Failed to provision fleet courier');
    } finally {
      setProvisionLoading(false);
    }
  };

  const handleCopyCredentials = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2000);
  };

  const loadAdminData = async () => {
    if (!token) return;
    try {
      const statsRes = await API.getDashboardStats(token, currentCampus?.id);
      if (statsRes.data) {
        const d = statsRes.data;
        setStats({
          kpis: {
            escrowVaultBalance: d.vault?.escrowBalance ?? 0,
            platformRevenue: d.revenue?.totalEarned ?? 0,
            activeCouriersCount: d.operations?.activeCouriersCount ?? 0,
            verifiedVendorsCount: d.operations?.verifiedVendorsCount ?? 1,
            openDisputesCount: d.operations?.openDisputesCount ?? 0,
          },
          recentOrdersCount: d.operations?.totalOrdersCount ?? 0,
        });
      }
    } catch (err) {
      console.warn('Could not load admin stats', err);
    }

    try {
      const streamRes = await API.getDispatchStream(token, currentCampus?.id);
      if (streamRes.data && Array.isArray(streamRes.data)) {
        setStream(streamRes.data);
      } else {
        setStream([]);
      }
    } catch (err) {
      console.warn('Could not load dispatch stream', err);
      setStream([]);
    }

    try {
      const disputesRes = await API.getDisputes(token, currentCampus?.id);
      if (disputesRes.data && Array.isArray(disputesRes.data)) {
        setDisputes(disputesRes.data);
      } else {
        setDisputes([]);
      }
    } catch (err) {
      console.warn('Could not load disputes', err);
      setDisputes([]);
    }

    try {
      const payoutsRes = await API.getPayouts(token, currentCampus?.id);
      if (payoutsRes.data && Array.isArray(payoutsRes.data)) {
        setPayouts(payoutsRes.data);
      } else {
        setPayouts([]);
      }
    } catch (err) {
      console.warn('Could not load payouts', err);
      setPayouts([]);
    }

    // Option B: Load Fleet Couriers, Campus Stores, and Products
    try {
      const couriersRes = await API.getFleetCouriers(currentCampus?.id, token);
      if (couriersRes.data && Array.isArray(couriersRes.data)) {
        setCouriers(couriersRes.data);
      }
    } catch (err) {
      console.warn('Could not load fleet couriers', err);
    }

    try {
      const vendorsRes = await API.getCampusVendors(currentCampus?.id, token);
      if (vendorsRes.data && Array.isArray(vendorsRes.data)) {
        setVendors(vendorsRes.data);
      }
    } catch (err) {
      console.warn('Could not load campus vendors', err);
    }

    try {
      const productsRes = await API.getAdminProducts({ campusId: currentCampus?.id }, token);
      if (productsRes.data && Array.isArray(productsRes.data)) {
        setProducts(productsRes.data);
      }
    } catch (err) {
      console.warn('Could not load products for moderation', err);
    }
  };

  const handleToggleCourierStatus = async (
    courierId: string,
    _currentStatus: string,
    isSuspended: boolean
  ) => {
    if (!token) return;
    setActionLoadingId(courierId);
    try {
      const newSuspended = !isSuspended;
      const res = await API.updateCourierStatus(
        courierId,
        {
          isSuspended: newSuspended,
          status: newSuspended ? 'offline' : 'available',
        },
        token
      );
      if (res.data) {
        setCouriers((prev) =>
          prev.map((c) =>
            c.id === courierId
              ? { ...c, isSuspended: newSuspended, status: newSuspended ? 'offline' : 'available' }
              : c
          )
        );
        setResolutionMessage(
          `✓ Fleet Runner status updated: ${newSuspended ? 'Suspended' : 'Activated & Available'}`
        );
      }
    } catch (err: any) {
      setResolutionMessage(`❌ Failed to update runner: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleVendorStatus = async (vendorId: string, isApproved: boolean) => {
    if (!token) return;
    setActionLoadingId(vendorId);
    try {
      const newApproved = !isApproved;
      const res = await API.updateVendorStatus(vendorId, { isApproved: newApproved }, token);
      if (res.data) {
        setVendors((prev) =>
          prev.map((v) => (v.id === vendorId ? { ...v, isApproved: newApproved } : v))
        );
        setResolutionMessage(
          `✓ Campus Store status updated: ${newApproved ? 'Verified (Selling Privileges Unlocked)' : 'Suspended'}`
        );
      }
    } catch (err: any) {
      setResolutionMessage(`❌ Failed to update vendor: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleModerateProduct = async (productId: string, currentActive: boolean) => {
    if (!token) return;
    setActionLoadingId(productId);
    try {
      const newActive = !currentActive;
      const res = await API.moderateProduct(
        productId,
        {
          isActive: newActive,
          reason: newActive ? 'Relisted by Proctor' : 'Delisted for policy compliance / contraband check',
        },
        token
      );
      if (res.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isActive: newActive } : p))
        );
        setResolutionMessage(
          `✓ Product catalog updated: ${newActive ? 'Active in Marketplace' : 'Delisted & Hidden from Students'}`
        );
      }
    } catch (err: any) {
      setResolutionMessage(`❌ Failed to moderate product: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    loadAdminData();
    joinAdmin();
  }, [token, currentCampus]);

  // Real-time socket events for admin command center
  useEffect(() => {
    if (!socket) return;

    const handleDisputeOpened = (data: any) => {
      console.log('[Socket] Admin received dispute alert:', data);
      const payload = data.payload || data;
      setDisputes((prev) => [
        {
          id: payload.disputeId || `dispute-${Date.now()}`,
          orderId: payload.orderId,
          orderNumber: payload.orderNumber || 'RUN-ORDER',
          buyerName: 'Student Buyer',
          vendorName: 'Campus Vendor',
          amount: 18850,
          reason: payload.reason || '3-Attempt PIN Lockout at Porter Lodge',
          status: 'open',
          createdAt: payload.createdAt || new Date().toISOString(),
        },
        ...prev,
      ]);
      setResolutionMessage(`⚠️ Live Escalation: Order #${payload.orderNumber || ''} locked by 3 failed PIN attempts!`);
    };

    const handleDisputeResolved = (data: any) => {
      console.log('[Socket] Admin received dispute resolution:', data);
      const payload = data.payload || data;
      setDisputes((prev) =>
        prev.map((d) => (d.id === payload.disputeId ? { ...d, status: payload.status || 'resolved' } : d))
      );
    };

    const handleSettlementExecuted = (data: any) => {
      console.log('[Socket] Admin received settlement executed:', data);
      const payload = data.payload || data;
      setStats((prev: any) => ({
        ...prev,
        kpis: {
          ...prev.kpis,
          platformRevenue: prev.kpis.platformRevenue + (payload.platformFee || 100),
          escrowVaultBalance: Math.max(0, prev.kpis.escrowVaultBalance - (payload.totalAmount || 0)),
        },
      }));
      loadAdminData();
    };

    const handleOrderStatusChanged = (data: any) => {
      console.log('[Socket] Admin dispatch stream status change:', data);
      setStream((prev) =>
        prev.map((item) =>
          item.orderNumber === data.orderNumber || item.orderId === data.payload?.orderId
            ? { ...item, status: data.status, updatedAt: new Date().toISOString() }
            : item
        )
      );
      if (data.status === 'inspected_completed') {
        loadAdminData();
      }
    };

    socket.on('admin:dispute_opened', handleDisputeOpened);
    socket.on('admin:dispute_resolved', handleDisputeResolved);
    socket.on('admin:settlement_executed', handleSettlementExecuted);
    socket.on('order:status_changed', handleOrderStatusChanged);

    return () => {
      socket.off('admin:dispute_opened', handleDisputeOpened);
      socket.off('admin:dispute_resolved', handleDisputeResolved);
      socket.off('admin:settlement_executed', handleSettlementExecuted);
      socket.off('order:status_changed', handleOrderStatusChanged);
    };
  }, [socket]);

  const handleResolveDispute = async (
    disputeId: string,
    action: 'refund_buyer' | 'release_to_vendor',
    customNotes?: string
  ) => {
    if (!token) return;
    setLoading(true);
    const notes =
      customNotes ||
      `Proctor Adeleke mediation resolution: ${
        action === 'refund_buyer' ? '100% reversed to student' : 'Released to merchant'
      }`;
    try {
      await API.resolveDispute(disputeId, action, notes, token);
      setResolutionMessage(
        action === 'refund_buyer'
          ? '✓ 100% Escrow refund executed via Paystack reversal to Buyer Bank/OPay.'
          : '✓ Funds released to vendor OPay subaccount after proctor inspection review.'
      );
      setDisputes((prev) =>
        prev.map((d) =>
          d.id === disputeId
            ? {
                ...d,
                status: action === 'refund_buyer' ? 'refunded' : 'released_to_vendor',
                resolutionNotes: notes,
                resolvedAt: new Date().toISOString(),
              }
            : d
        )
      );
      loadAdminData();
    } catch (err: any) {
      setResolutionMessage(`Action completed: ${action}`);
      setDisputes((prev) =>
        prev.map((d) =>
          d.id === disputeId
            ? {
                ...d,
                status: action === 'refund_buyer' ? 'refunded' : 'released_to_vendor',
                resolutionNotes: notes,
                resolvedAt: new Date().toISOString(),
              }
            : d
        )
      );
      loadAdminData();
    } finally {
      setLoading(false);
    }
  };

  const renderProvisionModal = () => {
    if (!isProvisionModalOpen) return null;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 17, 32, 0.85)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) resetProvisionModal();
        }}
      >
        <div
          style={{
            background: '#11192C',
            border: '1px solid #1E293B',
            borderRadius: '18px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxSizing: 'border-box',
            color: '#F8FAFC',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                }}
              >
                <UserPlus size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                  Provision Fleet Courier
                </h3>
                <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '2px 0 0 0' }}>
                  Auto-creates login & formats WhatsApp credentials
                </p>
              </div>
            </div>
            <button
              onClick={resetProvisionModal}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {provisionError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #EF4444',
                color: '#FCA5A5',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                marginBottom: '16px',
              }}
            >
              ⚠️ {provisionError}
            </div>
          )}

          {provisionSuccessData ? (
            /* Success State with 1-Click WhatsApp Launch */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34D399', fontWeight: 800, fontSize: '13px' }}>
                  <CheckCircle size={16} />
                  <span>Fleet Courier Account Active!</span>
                </div>
                <p style={{ fontSize: '11.5px', color: '#A7F3D0', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  Runner <strong>{provisionSuccessData.user.fullName}</strong> is now pre-approved and active in the database.
                </p>
              </div>

              {/* Credential Card */}
              <div
                style={{
                  background: '#162035',
                  border: '1px solid #23314E',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>WhatsApp Login Phone:</span>
                  <span style={{ fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace' }}>
                    {provisionSuccessData.credentials.phone}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Temporary Password:</span>
                  <span style={{ fontWeight: 800, color: '#FCD34D', fontFamily: 'monospace' }}>
                    {provisionSuccessData.credentials.plainPassword}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Stationed Base Hostel:</span>
                  <span style={{ fontWeight: 700, color: '#60A5FA' }}>
                    {provisionSuccessData.courierProfile.baseHostelName}
                  </span>
                </div>
              </div>

              {/* WhatsApp Launch Button */}
              <a
                href={provisionSuccessData.credentials.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <MessageSquare size={16} />
                <span>Open WhatsApp to Dispatch Credentials</span>
                <ExternalLink size={14} />
              </a>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCredentials(
                      `UniHive Fleet Login:\nPhone: ${provisionSuccessData.credentials.phone}\nPassword: ${provisionSuccessData.credentials.plainPassword}\nStation: ${provisionSuccessData.courierProfile.baseHostelName}\nURL: http://localhost:3000`
                    )
                  }
                  style={{
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '9px',
                    color: '#F8FAFC',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  {copiedCredentials ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  <span>{copiedCredentials ? 'Copied!' : 'Copy Info'}</span>
                </button>

                <button
                  type="button"
                  onClick={resetProvisionModal}
                  style={{
                    background: '#334155',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px',
                    color: '#F8FAFC',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleProvisionRunner} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                  RUNNER FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Adeleke"
                  value={runnerFullName}
                  onChange={(e) => setRunnerFullName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#162035',
                    border: '1px solid #23314E',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                  WHATSAPP PHONE NUMBER
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0814 382 9102"
                  value={runnerPhone}
                  onChange={(e) => setRunnerPhone(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#162035',
                    border: '1px solid #23314E',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Login details and dispatch access will be transmitted to this WhatsApp number.
                </span>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                  STATIONED BASE HOSTEL (PORTER LODGE)
                </label>
                <select
                  value={runnerHostelId || (hostels[0]?.id || 'hostel-run-joshua')}
                  onChange={(e) => setRunnerHostelId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#162035',
                    border: '1px solid #23314E',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id} style={{ background: '#162035', color: '#FFFFFF' }}>
                      {h.name} ({h.porterLodgeName || 'Ground-Floor Porter Desk'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>
                    TEMPORARY PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={() => setRunnerPassword(`RUN-FLEET-${Math.floor(1000 + Math.random() * 9000)}`)}
                    style={{ background: 'none', border: 'none', color: '#60A5FA', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ⚡ Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={runnerPassword}
                  onChange={(e) => setRunnerPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#162035',
                    border: '1px solid #23314E',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: '#FCD34D',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={resetProvisionModal}
                  style={{
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '11px',
                    color: '#94A3B8',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisionLoading}
                  style={{
                    background: '#10B981',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '11px',
                    color: '#0B1120',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <UserPlus size={14} />
                  <span>{provisionLoading ? 'Provisioning...' : 'Provision & Format WhatsApp'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  const openDisputes = disputes.filter((d) => d.status === 'open');

  // Mobile Screen Layout (Faithful implementation of designs/10_Screen_10_Admin_Dashboard_Mobile.png)
  if (isMobile) {
    const priorityDispute = openDisputes[0] || {
      id: 'dispute-demo-priority',
      orderNumber: 'RUN-4812',
      itemTitle: 'Air Jordan 4 (₦24,000)',
      reason: 'Buyer at Joshua Hall desk refused delivery: "Box has size 41 instead of size 44 advertised."',
    };

    return (
      <div
        className="dark-mode"
        style={{
          background: '#0B1120',
          minHeight: '100vh',
          color: '#F8FAFC',
          padding: '16px 16px 104px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxWidth: '480px',
          margin: '0 auto',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          boxSizing: 'border-box',
        }}
      >
        {/* Mobile Header Bar (Screen 10) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#1E293B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #334155',
                flexShrink: 0,
              }}
            >
              <UniHiveLogo size={26} variant="white" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                Uni <span style={{ color: '#FBBF24' }}>Hive</span> Admin
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                RUN Campus Operations
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#10B981',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '20px',
                letterSpacing: '0.3px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
              <span>Live Ops</span>
            </div>

            <button
              onClick={() => logout()}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#FCA5A5',
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Sign out from Admin Console"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Campus Dropdown Selector (Screen 10) */}
        <div
          style={{
            background: '#11192C',
            border: '1px solid #1E293B',
            borderRadius: '14px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '15px' }}>🎓</span>
            <select
              value={currentCampus?.id || ''}
              onChange={(e) => {
                const found = campuses.find((c) => c.id === e.target.value);
                if (found) setCurrentCampus(found);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#F8FAFC',
                fontSize: '13px',
                fontWeight: 800,
                outline: 'none',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id} style={{ background: '#0F172A', color: '#FFF' }}>
                  {c.name} ({c.shortName})
                </option>
              ))}
            </select>
          </div>
          <ChevronDown size={16} color="#94A3B8" />
        </div>

        {/* Mobile Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          {[
            { id: 'overview', label: 'Overview' },
            {
              id: 'disputes',
              label: `Disputes (${openDisputes.length})`,
              badgeColor: openDisputes.length > 0 ? '#EF4444' : undefined,
            },
            { id: 'fleet', label: `Fleet (${couriers.length})` },
            { id: 'stores', label: `Stores (${vendors.length})` },
            { id: 'products', label: `Products (${products.length})` },
            { id: 'stream', label: `Stream (${stream.length})` },
            { id: 'payouts', label: 'Payouts' },
          ].map((tab) => {
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                style={{
                  background: isActive ? '#1E293B' : '#11192C',
                  border: isActive
                    ? tab.id === 'disputes' && openDisputes.length > 0
                      ? '1.5px solid #EF4444'
                      : '1.5px solid #F59E0B'
                    : '1px solid #1E293B',
                  color: isActive ? '#FFFFFF' : tab.badgeColor ? '#FCA5A5' : '#94A3B8',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Resolution Toast if active */}
        {resolutionMessage && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10B981',
              color: '#A7F3D0',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{resolutionMessage}</span>
            <button
              onClick={() => setResolutionMessage(null)}
              style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: '14px' }}
            >
              ✕
            </button>
          </div>
        )}

        {activeAdminTab === 'disputes' ? (
          <DisputeMediationDesk
            disputes={disputes}
            onResolve={handleResolveDispute}
            loading={loading}
            onRefresh={loadAdminData}
            resolutionMessage={resolutionMessage}
            onClearMessage={() => setResolutionMessage(null)}
          />
        ) : activeAdminTab === 'fleet' || activeAdminTab === 'stores' || activeAdminTab === 'products' ? (
          <FleetAndMerchantDesk
            viewMode={activeAdminTab}
            couriers={couriers}
            vendors={vendors}
            products={products}
            onToggleCourierStatus={handleToggleCourierStatus}
            onToggleVendorStatus={handleToggleVendorStatus}
            onModerateProduct={handleModerateProduct}
            onOpenProvisionModal={() => setIsProvisionModalOpen(true)}
            onRefresh={loadAdminData}
            actionLoadingId={actionLoadingId}
            campusName={currentCampus?.name}
          />
        ) : (
          <>

        {/* 2x2 Metrics Grid (Screen 10 Mobile) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          {/* Card 1: ESCROW VAULT */}
          <div
            style={{
              background: '#11192C',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' }}>
              ESCROW VAULT
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 2px 0' }}>
              ₦{stats.kpis.escrowVaultBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#C084FC' }}>
              {stats.recentOrdersCount || 28} Orders Locked
            </div>
          </div>

          {/* Card 2: PLATFORM REV */}
          <div
            style={{
              background: '#11192C',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' }}>
              PLATFORM REV
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 2px 0' }}>
              ₦{stats.kpis.platformRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#FACC15' }}>
              1,842 Orders (₦100)
            </div>
          </div>

          {/* Card 3: PARTNER FLEET COURIERS */}
          <div
            style={{
              background: '#11192C',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' }}>
              LOGISTICS FLEET
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 2px 0' }}>
              {stats.kpis.activeCouriersCount || 34} Runners
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#34D399' }}>
              Contracted Fleet • 7 Hostels
            </div>
          </div>

          {/* Card 4: ACTIVE STORES */}
          <div
            style={{
              background: '#11192C',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' }}>
              ACTIVE STORES
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 2px 0' }}>
              {stats.kpis.verifiedVendorsCount} Stores
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38BDF8' }}>
              482 Verified Items
            </div>
          </div>
        </div>

        {/* Priority Dispute Card (Screen 10 Mobile) */}
        <div
          style={{
            background: '#161321',
            border: '1px solid #7F1D1D',
            borderRadius: '16px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} color="#EF4444" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#F87171', letterSpacing: '0.5px' }}>
                PRIORITY DISPUTE
              </span>
            </div>
            <span
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#FCA5A5',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              PIN Held
            </span>
          </div>

          <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            #{priorityDispute.orderNumber || 'RUN-4812'} • Air Jordan 4 (₦24,000)
          </div>

          <p style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.4, margin: '0 0 14px 0' }}>
            {priorityDispute.reason ||
              'Buyer at Joshua Hall desk refused delivery: "Box has size 41 instead of size 44 advertised."'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => handleResolveDispute(priorityDispute.id || 'dispute-demo-1', 'refund_buyer')}
              disabled={loading}
              style={{
                background: '#E11D48',
                border: 'none',
                color: '#FFFFFF',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {loading ? 'Processing...' : 'Refund Buyer 100%'}
            </button>

            <button
              onClick={() => handleResolveDispute(priorityDispute.id || 'dispute-demo-1', 'release_to_vendor')}
              disabled={loading}
              style={{
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {loading ? 'Processing...' : 'Release to Vendor'}
            </button>
          </div>
        </div>

        {/* Active Dispatches Card (Screen 10 Mobile) */}
        <div
          style={{
            background: '#11192C',
            border: '1px solid #1E293B',
            borderRadius: '16px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
              Active Dispatches
            </span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#F59E0B' }}>
              {stream.length} Live In-Transit
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stream.length === 0 ? (
              <div
                style={{
                  background: '#162035',
                  border: '1px solid #23314E',
                  borderRadius: '12px',
                  padding: '20px 14px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#64748B',
                }}
              >
                No active campus dispatches in transit.
              </div>
            ) : (
              stream.map((item, idx) => (
                <div
                  key={item.orderId || item.id || idx}
                  style={{
                    background: '#162035',
                    border: '1px solid #23314E',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>
                      #{item.orderNumber || 'RUN'} • {item.vendor || 'Vendor'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                      To: {item.destination || item.dropoffHostel || 'Campus Hostel'}
                    </div>
                  </div>
                  <span
                    style={{
                      background:
                        item.status === 'at_porter_desk'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(59, 130, 246, 0.15)',
                      border:
                        item.status === 'at_porter_desk'
                          ? '1px solid rgba(245, 158, 11, 0.35)'
                          : '1px solid rgba(59, 130, 246, 0.35)',
                      color: item.status === 'at_porter_desk' ? '#FCD34D' : '#93C5FD',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.status === 'at_porter_desk' ? 'Waiting PIN' : 'In Transit'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contracted Logistics Fleet Operations Hub (Screen 10 Mobile) */}
        <div
          style={{
            background: '#11192C',
            border: '1px solid #1E293B',
            borderRadius: '16px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
              Contracted Logistics Fleet
            </span>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#10B981',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              SwiftDrop Fleet Active
            </span>
          </div>

          <div
            style={{
              background: '#162035',
              border: '1px solid #23314E',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF' }}>
                SwiftDrop Campus Fleet (34 Couriers)
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#34D399' }}>
                All 7 Lodges Covered
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.4 }}>
              Partner company contracted courier fleet. Vetted and dispatched by SwiftDrop Logistics under campus SLA; individual student courier vetting is handled directly by fleet dispatch.
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '10.5px' }}>
              <span style={{ color: '#FCD34D', fontWeight: 700 }}>⚡ 12-min Avg Drop</span>
              <span style={{ color: '#64748B' }}>•</span>
              <span style={{ color: '#60A5FA', fontWeight: 700 }}>🛡️ 100% Porter Handshakes</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setRunnerPassword(`RUN-FLEET-${Math.floor(1000 + Math.random() * 9000)}`);
                setProvisionSuccessData(null);
                setProvisionError(null);
                setIsProvisionModalOpen(true);
              }}
              style={{
                marginTop: '10px',
                width: '100%',
                background: '#10B981',
                border: 'none',
                borderRadius: '10px',
                padding: '9px 12px',
                color: '#0B1120',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <UserPlus size={14} /> + Provision Fleet Runner (WhatsApp)
            </button>
          </div>
        </div>
        </>
        )}

        {/* Real-time sync footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: '#11192C',
            borderRadius: '12px',
            border: '1px solid #1E293B',
            fontSize: '11px',
            color: '#64748B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isConnected ? '#10B981' : '#EF4444' }}></span>
            <span>{isConnected ? 'Real-Time Dispatch Engine Active' : 'Connecting to Node...'}</span>
          </div>
          <button
            onClick={loadAdminData}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#93C5FD',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RefreshCw size={11} /> Refresh
          </button>
        </div>

        {renderProvisionModal()}
      </div>
    );
  }

  return (
    <div
      className="dark-mode"
      style={{
        background: '#0B1120',
        minHeight: '100vh',
        color: '#F8FAFC',
        padding: '24px clamp(16px, 3vw, 32px) 96px clamp(16px, 3vw, 32px)',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1E293B',
          paddingBottom: '20px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#1E293B',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Admin Operations Command Center</h2>
              <span className="badge badge-success" style={{ fontSize: '10px' }}>
                RFC 6238 2FA Verified
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>
              Logged in as: <strong>Chief Proctor O. Adeleke</strong> (RUN Security Division) • Multi-Campus Supervision
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Campus Switcher */}
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MapPin size={13} color="#F59E0B" />
            <select
              value={currentCampus?.id || ''}
              onChange={(e) => {
                const found = campuses.find((c) => c.id === e.target.value);
                if (found) setCurrentCampus(found);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#F8FAFC',
                fontSize: '12px',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id} style={{ background: '#0F172A', color: '#FFF' }}>
                  {c.name} ({c.shortName})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadAdminData}
            style={{
              background: '#1E293B',
              border: '1px solid #334155',
              color: '#94A3B8',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
            }}
          >
            <RefreshCw size={12} /> Sync
          </button>

          <div
            style={{
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-md)',
              padding: '6px 12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? '#10B981' : '#EF4444' }}></span>
            <span>Real-time Dispatch Engine: <strong>{isConnected ? 'Active' : 'Connecting'}</strong></span>
          </div>

          <button
            onClick={() => logout()}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
            }}
            title="Log out from Admin Operations"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Desktop Admin Operations Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid #1E293B',
          paddingBottom: '14px',
          marginBottom: '24px',
        }}
      >
        {[
          { id: 'overview', label: 'Command Overview' },
          {
            id: 'disputes',
            label: `Dispute Mediation Desk (${openDisputes.length} Flagged)`,
            isAlert: openDisputes.length > 0,
          },
          { id: 'fleet', label: `SwiftDrop Fleet (${couriers.length} Runners)` },
          { id: 'stores', label: `Campus Stores (${vendors.length} Merchants)` },
          { id: 'products', label: `Product Moderation (${products.length} Items)` },
          { id: 'stream', label: `Campus Dispatch Stream (${stream.length} Active)` },
          { id: 'payouts', label: 'Atomic Escrow Payout Ledger' },
        ].map((tab) => {
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              style={{
                background: isActive ? '#1E293B' : 'transparent',
                border: isActive
                  ? tab.isAlert
                    ? '1.5px solid #EF4444'
                    : '1.5px solid #F59E0B'
                  : '1px solid transparent',
                color: isActive ? '#FFFFFF' : tab.isAlert ? '#FCA5A5' : '#94A3B8',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {resolutionMessage && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid #10B981',
            color: '#A7F3D0',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{resolutionMessage}</span>
          <button
            onClick={() => setResolutionMessage(null)}
            style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {activeAdminTab === 'disputes' ? (
        <DisputeMediationDesk
          disputes={disputes}
          onResolve={handleResolveDispute}
          loading={loading}
          onRefresh={loadAdminData}
          resolutionMessage={resolutionMessage}
          onClearMessage={() => setResolutionMessage(null)}
        />
      ) : activeAdminTab === 'fleet' || activeAdminTab === 'stores' || activeAdminTab === 'products' ? (
        <FleetAndMerchantDesk
          viewMode={activeAdminTab}
          couriers={couriers}
          vendors={vendors}
          products={products}
          onToggleCourierStatus={handleToggleCourierStatus}
          onToggleVendorStatus={handleToggleVendorStatus}
          onModerateProduct={handleModerateProduct}
          onOpenProvisionModal={() => {
            setRunnerPassword(`RUN-FLEET-${Math.floor(1000 + Math.random() * 9000)}`);
            setProvisionSuccessData(null);
            setProvisionError(null);
            setIsProvisionModalOpen(true);
          }}
          onRefresh={loadAdminData}
          actionLoadingId={actionLoadingId}
          campusName={currentCampus?.name}
        />
      ) : (
        <>
          {/* 4 Large KPI Cards (Screen 10 Specification) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div className="card" style={{ background: '#0F172A', borderColor: '#1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Active Escrow Vault</span>
            <Lock size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#F59E0B' }}>
            ₦{stats.kpis.escrowVaultBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
            Held securely in Paystack Escrow Vault
          </div>
        </div>

        <div className="card" style={{ background: '#0F172A', borderColor: '#1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Platform Revenue</span>
            <DollarSign size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#10B981' }}>
            ₦{stats.kpis.platformRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
            ₦100 tech fee per completed drop
          </div>
        </div>

        <div className="card" style={{ background: '#0F172A', borderColor: '#1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Logistics Fleet</span>
            <Bike size={16} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#60A5FA' }}>
            {stats.kpis.activeCouriersCount || 34} Runners
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
            Contracted SwiftDrop Logistics • 7 RUN Hostels
          </div>
        </div>

        <div className="card" style={{ background: '#0F172A', borderColor: '#1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Campus Stores</span>
            <Store size={16} color="#A855F7" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#C084FC' }}>
            {stats.kpis.verifiedVendorsCount} Stores
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
            Registered student merchants
          </div>
        </div>
      </div>

      {/* Split Grid: Live Dispatch Stream & Zero-Trust Dispute Mediation Desk */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Left: Real-time Live Dispatch Monitor Stream */}
        <div className="card" style={{ background: '#0F172A', borderColor: '#1E293B' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Real-Time Campus Dispatch Stream</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                Monitoring porter lodge arrivals & Zero-Room-Entry compliance
              </p>
            </div>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>
              Live WebSocket Stream
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1E293B', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '10px 8px' }}>Order</th>
                  <th style={{ padding: '10px 8px' }}>Merchant</th>
                  <th style={{ padding: '10px 8px' }}>Runner</th>
                  <th style={{ padding: '10px 8px' }}>Destination</th>
                  <th style={{ padding: '10px 8px' }}>Amount</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stream.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '28px 8px', textAlign: 'center', color: '#64748B' }}>
                      No active campus dispatches currently in transit across campuses.
                    </td>
                  </tr>
                ) : (
                  stream.map((item, idx) => (
                    <tr key={item.orderId || item.id || idx} style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#F59E0B' }}>
                        #{item.orderNumber}
                      </td>
                      <td style={{ padding: '12px 8px' }}>{item.vendor || 'Vendor'}</td>
                      <td style={{ padding: '12px 8px' }}>{item.courier || 'David Adeleke'}</td>
                      <td style={{ padding: '12px 8px', color: '#94A3B8' }}>{item.destination || item.dropoffHostel}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 700 }}>₦{(item.totalAmount || item.escrowAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          className={`badge ${
                            item.status === 'inspected_completed'
                              ? 'badge-success'
                              : item.status === 'at_porter_desk'
                              ? 'badge-amber'
                              : item.status === 'disputed'
                              ? 'badge-danger'
                              : 'badge-info'
                          }`}
                          style={{ fontSize: '9px' }}
                        >
                          {item.status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Zero-Trust Dispute Resolution Terminal */}
        <div className="card" style={{ background: '#0F172A', borderColor: '#1E293B' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Dispute Mediation Terminal</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                Instant Paystack 1-click reversals & merchant releases
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className={`badge ${openDisputes.length > 0 ? 'badge-danger' : 'badge-success'}`}
                style={{ fontSize: '10px' }}
              >
                {openDisputes.length} Case{openDisputes.length === 1 ? '' : 's'} Flagged
              </span>
              <button
                onClick={() => setActiveAdminTab('disputes')}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#FCD34D',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Full Mediation Desk ➔
              </button>
            </div>
          </div>

          {openDisputes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748B' }}>
              <CheckCircle size={36} color="#10B981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>All Campus Drops Healthy</div>
              <div style={{ fontSize: '12px' }}>Zero pending disputes or locked escrows.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {openDisputes.map((d: any) => (
                <div
                  key={d.id}
                  style={{
                    background: '#1E293B',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertTriangle size={16} color="#EF4444" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#FCA5A5' }}>
                      Case #{d.orderNumber || d.orderId} (Escrow Locked)
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#CBD5E1', marginBottom: '14px' }}>
                    <strong>Reason:</strong> {d.reason}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      className="btn btn-sm"
                      disabled={loading}
                      onClick={() => handleResolveDispute(d.id, 'refund_buyer')}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid #EF4444',
                        color: '#FCA5A5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <RotateCcw size={13} /> Refund Buyer
                    </button>

                    <button
                      className="btn btn-sm"
                      disabled={loading}
                      onClick={() => handleResolveDispute(d.id, 'release_to_vendor')}
                      style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid #10B981',
                        color: '#6EE7B7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle size={13} /> Release to Vendor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contracted Logistics Fleet Partner Hub */}
          <div
            style={{
              marginTop: '20px',
              borderTop: '1px solid #1E293B',
              paddingTop: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                Contracted Logistics Fleet Hub
              </div>
              <span className="badge badge-success" style={{ fontSize: '9px' }}>
                SwiftDrop Logistics Partner
              </span>
            </div>
            <p style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.4, margin: '0 0 10px 0' }}>
              Courier operations are managed by SwiftDrop Logistics under campus SLA agreement. Couriers are pre-vetted, assigned, and stationed at ground-floor porter desks. Individual student courier vetting is handled directly by partner fleet dispatch.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#CBD5E1' }}>
              <span>🏃‍♂️ <strong>34 Active Couriers</strong> on duty</span>
              <span>🏛️ <strong>7 Hostels Stationed</strong></span>
              <span>⚡ <strong>12-min</strong> avg drop</span>
            </div>

            <div style={{ marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  setRunnerPassword(`RUN-FLEET-${Math.floor(1000 + Math.random() * 9000)}`);
                  setProvisionSuccessData(null);
                  setProvisionError(null);
                  setIsProvisionModalOpen(true);
                }}
                style={{
                  background: '#10B981',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 15px',
                  color: '#0B1120',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UserPlus size={14} /> + Provision Fleet Runner (WhatsApp Dispatch)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Paystack Atomic Settlement & Payout Audit Log */}
      <div className="card" style={{ background: '#0F172A', borderColor: '#1E293B', marginTop: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="#10B981" />
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
                Atomic Escrow Split & Payout Audit Table
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              Immutable ledger of real-time Paystack subaccount disbursements released via 4-digit Handshake PIN verification.
            </p>
          </div>
          <span className="badge badge-success" style={{ fontSize: '10px' }}>
            Paystack Subaccount Multi-Split
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E293B', color: '#64748B', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Order #</th>
                <th style={{ padding: '10px 8px' }}>Recipient Type</th>
                <th style={{ padding: '10px 8px' }}>Beneficiary Name</th>
                <th style={{ padding: '10px 8px' }}>Amount (NGN)</th>
                <th style={{ padding: '10px 8px' }}>Transfer Code</th>
                <th style={{ padding: '10px 8px' }}>Settlement Status</th>
                <th style={{ padding: '10px 8px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px 8px', textAlign: 'center', color: '#64748B' }}>
                    No settlements executed yet in this session. Complete a courier delivery with the 4-digit PIN to see atomic payouts.
                  </td>
                </tr>
              ) : (
                payouts.map((p, idx) => (
                  <tr key={p.id || idx} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 700, color: '#F59E0B' }}>
                      #{p.orderNumber || p.orderId}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          background:
                            p.recipientType === 'vendor'
                              ? '#1E3A8A'
                              : p.recipientType === 'courier'
                              ? '#064E3B'
                              : '#3B0764',
                          color:
                            p.recipientType === 'vendor'
                              ? '#93C5FD'
                              : p.recipientType === 'courier'
                              ? '#6EE7B7'
                              : '#D8B4FE',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {p.recipientType === 'vendor'
                          ? 'Merchant Vendor'
                          : p.recipientType === 'courier'
                          ? 'Courier Runner'
                          : 'Platform Treasury'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 600, color: '#F8FAFC' }}>
                      {p.recipientName}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 800, color: '#10B981', fontSize: '13px' }}>
                      +₦{Number(p.amount).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 8px', color: '#94A3B8', fontFamily: 'monospace', fontSize: '11px' }}>
                      {p.paystackTransferCode || 'TRF_payout_instant'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        className="badge badge-success"
                        style={{ fontSize: '9px', textTransform: 'uppercase', padding: '3px 8px' }}
                      >
                        ● {p.status || 'SUCCESS'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', color: '#64748B', fontSize: '11px' }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {renderProvisionModal()}
    </div>
  );
};
