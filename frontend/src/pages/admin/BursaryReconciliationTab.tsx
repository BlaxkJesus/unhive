import React, { useState, useEffect } from 'react';
import { API, API_BASE_URL } from '../../config/api';
import { Download, RefreshCw } from 'lucide-react';

interface BursaryReconciliationTabProps {
  campusId: string;
  token: string;
  onAlert: (msg: string) => void;
}

export const BursaryReconciliationTab: React.FC<BursaryReconciliationTabProps> = ({
  campusId,
  token,
  onAlert,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({
    summary: {
      totalEscrowInflow: 0,
      settledVendorTotal: 0,
      settledCourierTotal: 0,
      retainedTechFeeTotal: 0,
      activeVaultHeldBalance: 0,
      refundedTotal: 0,
      totalTransactionsCount: 0,
      settledBatchesCount: 0,
      pendingVaultBatchesCount: 0,
      currency: 'NGN',
    },
    batches: [],
  });
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SETTLED' | 'HELD_IN_VAULT' | 'REFUNDED_TO_BUYER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadReconciliation = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.getReconciliation(token, campusId);
      if (res?.data) {
        setData(res.data);
      }
    } catch (err: any) {
      onAlert(`❌ Failed to load financial reconciliation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReconciliation();
  }, [campusId, token]);

  const handleExportCSV = () => {
    // Direct authenticated browser download or window open
    const url = `${API_BASE_URL}/admin/reconciliation/export-csv?campusId=${encodeURIComponent(campusId)}`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `bursary-reconciliation-${campusId}-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onAlert('✓ Bursary settlement CSV downloaded successfully.');
      })
      .catch((err) => onAlert(`❌ CSV export failed: ${err.message}`));
  };

  const filteredBatches = data.batches.filter((b: any) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      b.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.courierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.vendorPayoutCode && b.vendorPayoutCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Enterprise Bursary Settlement & Payout Reconciliation
          </h2>
          <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: '4px 0 0' }}>
            Certified 3-way atomic escrow reconciliation for university bursary & internal audit
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              background: '#10B981',
              border: 'none',
              borderRadius: '10px',
              padding: '9px 16px',
              color: '#0B1120',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={15} />
            <span>Export Certified Bursary CSV</span>
          </button>
          <button
            onClick={loadReconciliation}
            disabled={loading}
            style={{
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '9px 14px',
              color: '#94A3B8',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Ledger Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#11192C', border: '1px solid #1E293B', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' }}>GROSS ESCROW INFLOW</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
            ₦{data.summary.totalEscrowInflow.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            Across {data.summary.totalTransactionsCount} student orders
          </div>
        </div>

        <div style={{ background: '#11192C', border: '1px solid #1E293B', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', letterSpacing: '0.5px' }}>SETTLED VENDOR DISBURSALS</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>
            ₦{data.summary.settledVendorTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            100% item value released upon PIN release
          </div>
        </div>

        <div style={{ background: '#11192C', border: '1px solid #1E293B', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#3B82F6', letterSpacing: '0.5px' }}>COURIER RUNNER ALLOWANCES</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#60A5FA', marginTop: '4px' }}>
            ₦{data.summary.settledCourierTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            ₦250 fee per completed porter drop
          </div>
        </div>

        <div style={{ background: '#11192C', border: '1px solid #1E293B', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#F59E0B', letterSpacing: '0.5px' }}>PLATFORM TECH RESERVES</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#FCD34D', marginTop: '4px' }}>
            ₦{data.summary.retainedTechFeeTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            ₦100 escrow tech retainer
          </div>
        </div>

        <div style={{ background: '#11192C', border: '1px solid #1E293B', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#F97316', letterSpacing: '0.5px' }}>ACTIVE VAULT HELD BALANCE</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#F97316', marginTop: '4px' }}>
            ₦{data.summary.activeVaultHeldBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            {data.summary.pendingVaultBatchesCount} orders in transit
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['ALL', 'SETTLED', 'HELD_IN_VAULT', 'REFUNDED_TO_BUYER'] as const).map((st) => {
            const active = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: active ? '#1E293B' : '#11192C',
                  border: active ? '1.5px solid #F59E0B' : '1px solid #1E293B',
                  color: active ? '#FFFFFF' : '#94A3B8',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {st.replace(/_/g, ' ')}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Search by Order #, Store, or Runner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: '#11192C',
            border: '1px solid #1E293B',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '12.5px',
            color: '#FFFFFF',
            outline: 'none',
            minWidth: '260px',
          }}
        />
      </div>

      {/* Transaction Batches Ledger Table */}
      <div
        style={{
          background: '#11192C',
          border: '1px solid #1E293B',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#0F172A', borderBottom: '1px solid #1E293B', color: '#94A3B8', fontWeight: 800 }}>
                <th style={{ padding: '14px 16px' }}>ORDER #</th>
                <th style={{ padding: '14px 16px' }}>MERCHANT / RUNNER</th>
                <th style={{ padding: '14px 16px' }}>GROSS INFLOW</th>
                <th style={{ padding: '14px 16px' }}>VENDOR (100%)</th>
                <th style={{ padding: '14px 16px' }}>COURIER (₦250)</th>
                <th style={{ padding: '14px 16px' }}>TECH FEE (₦100)</th>
                <th style={{ padding: '14px 16px' }}>PAYSTACK CODE</th>
                <th style={{ padding: '14px 16px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                    No financial transaction batches found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b: any) => {
                  const isSettled = b.status === 'SETTLED';
                  const isRefund = b.status === 'REFUNDED_TO_BUYER';
                  return (
                    <tr
                      key={b.orderId}
                      style={{
                        borderBottom: '1px solid #1E293B',
                        color: '#E2E8F0',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: 'monospace', color: '#FFFFFF' }}>
                        #{b.orderNumber}
                        <div style={{ fontSize: '10.5px', color: '#64748B', fontFamily: 'sans-serif', fontWeight: 500 }}>
                          {new Date(b.timestamp).toLocaleDateString()} {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{b.vendorName}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Runner: {b.courierName}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#FFFFFF' }}>
                        ₦{b.grossInflow.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#10B981' }}>
                        ₦{b.vendorSubtotal.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#60A5FA' }}>
                        ₦{b.courierDeliveryFee.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#FCD34D' }}>
                        ₦{b.platformTechFee.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '11px', color: '#94A3B8' }}>
                        {b.vendorPayoutCode}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isSettled
                              ? 'rgba(16, 185, 129, 0.15)'
                              : isRefund
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                            color: isSettled ? '#34D399' : isRefund ? '#FCA5A5' : '#FCD34D',
                            border: `1px solid ${isSettled ? '#10B981' : isRefund ? '#EF4444' : '#F59E0B'}`,
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
