import React, { useState } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Lock,
  User,
  Store,
  Bike,
  Search,
  Eye,
  ShieldAlert,
} from 'lucide-react';

interface DisputeMediationDeskProps {
  disputes: any[];
  onResolve: (
    disputeId: string,
    action: 'refund_buyer' | 'release_to_vendor',
    notes: string
  ) => Promise<void>;
  loading: boolean;
  onRefresh: () => void;
  resolutionMessage?: string | null;
  onClearMessage?: () => void;
}

export const DisputeMediationDesk: React.FC<DisputeMediationDeskProps> = ({
  disputes,
  onResolve,
  loading,
  onRefresh,
  resolutionMessage,
  onClearMessage,
}) => {
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'open' | 'refunded' | 'released_to_vendor'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [proctorNotes, setProctorNotes] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Filtered disputes
  const filteredDisputes = disputes.filter((d) => {
    const matchesFilter =
      filterStatus === 'all' ? true : d.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (d.orderNumber && d.orderNumber.toLowerCase().includes(q)) ||
      (d.buyerName && d.buyerName.toLowerCase().includes(q)) ||
      (d.vendorName && d.vendorName.toLowerCase().includes(q)) ||
      (d.reason && d.reason.toLowerCase().includes(q)) ||
      (d.buyer?.matricNumber && d.buyer.matricNumber.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  // Current active dispute
  const currentDispute =
    disputes.find((d) => d.id === selectedDisputeId) ||
    filteredDisputes[0] ||
    disputes[0] ||
    null;

  // Key KPI Metrics for Header
  const totalOpen = disputes.filter((d) => d.status === 'open').length;
  const totalRefunded = disputes.filter((d) => d.status === 'refunded').length;
  const totalReleased = disputes.filter(
    (d) => d.status === 'released_to_vendor'
  ).length;
  const capitalAtRisk = disputes
    .filter((d) => d.status === 'open')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Quick Preset Handlers
  const applyPreset = (presetText: string) => {
    setProctorNotes(presetText);
  };

  const handleExecuteResolution = async (
    action: 'refund_buyer' | 'release_to_vendor'
  ) => {
    if (!currentDispute) return;
    const defaultNotes =
      action === 'refund_buyer'
        ? 'Physical inspection verified mismatch. 100% Escrow refund executed to student.'
        : 'Dispute mediation resolved: Funds released to vendor after physical review.';

    setActionInProgress(action);
    try {
      await onResolve(
        currentDispute.id,
        action,
        proctorNotes.trim() || defaultNotes
      );
      setProctorNotes('');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: '#F8FAFC',
        fontFamily: 'var(--font-main, sans-serif)',
      }}
    >
      {/* 1. Header & Mediation Metrics Banner */}
      <div
        style={{
          background: 'linear-gradient(180deg, #111C33 0%, #0F172A 100%)',
          border: '1px solid #1E293B',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
              }}
            >
              <ShieldAlert size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
                  Zero-Trust Dispute Mediation Desk
                </h2>
                <span
                  style={{
                    background:
                      totalOpen > 0
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(16, 185, 129, 0.2)',
                    border:
                      totalOpen > 0
                        ? '1px solid #EF4444'
                        : '1px solid #10B981',
                    color: totalOpen > 0 ? '#FCA5A5' : '#6EE7B7',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '20px',
                  }}
                >
                  {totalOpen > 0
                    ? `${totalOpen} Active Case${totalOpen === 1 ? '' : 's'} Locked`
                    : 'All Hostels Clear'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                Ground-Floor Porter Lodge physical inspections, PIN lockout arbitration & Paystack 1-click escrow reversals.
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              background: '#1E293B',
              border: '1px solid #334155',
              color: '#94A3B8',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {loading ? 'Refreshing...' : 'Sync Vault Ledger'}
          </button>
        </div>

        {/* Metric Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
          }}
        >
          <div
            style={{
              background: '#0B1120',
              border: '1px solid #1E293B',
              borderRadius: '12px',
              padding: '14px 18px',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 600 }}>
              Frozen Escrow Capital
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#F59E0B',
                marginTop: '4px',
              }}
            >
              ₦{capitalAtRisk.toLocaleString()}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
              Locked in Paystack Subaccount Vault
            </div>
          </div>

          <div
            style={{
              background: '#0B1120',
              border: '1px solid #1E293B',
              borderRadius: '12px',
              padding: '14px 18px',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 600 }}>
              Open Lockout Cases
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: totalOpen > 0 ? '#EF4444' : '#10B981',
                marginTop: '4px',
              }}
            >
              {totalOpen} Pending
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
              Awaiting Chief Proctor Ruling
            </div>
          </div>

          <div
            style={{
              background: '#0B1120',
              border: '1px solid #1E293B',
              borderRadius: '12px',
              padding: '14px 18px',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 600 }}>
              Refunded to Students
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#60A5FA',
                marginTop: '4px',
              }}
            >
              {totalRefunded} Cases
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
              100% reversed via Paystack
            </div>
          </div>

          <div
            style={{
              background: '#0B1120',
              border: '1px solid #1E293B',
              borderRadius: '12px',
              padding: '14px 18px',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 600 }}>
              Released to Merchants
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#10B981',
                marginTop: '4px',
              }}
            >
              {totalReleased} Released
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
              Settled to Vendor OPay Accounts
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Notification Banner */}
      {resolutionMessage && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10B981',
            borderRadius: '12px',
            padding: '14px 20px',
            color: '#A7F3D0',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#10B981" />
            <span>{resolutionMessage}</span>
          </div>
          {onClearMessage && (
            <button
              onClick={onClearMessage}
              style={{
                background: 'none',
                border: 'none',
                color: '#A7F3D0',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* 2. Main Mediation Workspace: Split View */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Queue & Filters */}
        <div
          style={{
            background: '#0F172A',
            border: '1px solid #1E293B',
            borderRadius: '16px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              color="#64748B"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              type="text"
              placeholder="Search Order #, student, merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#0B1120',
                border: '1px solid #23314E',
                borderRadius: '10px',
                padding: '9px 12px 9px 36px',
                fontSize: '12.5px',
                color: '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            {[
              { id: 'all', label: 'All Cases' },
              { id: 'open', label: 'Open' },
              { id: 'refunded', label: 'Refunded' },
              { id: 'released_to_vendor', label: 'Released' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                style={{
                  background:
                    filterStatus === tab.id ? '#1E293B' : 'transparent',
                  border:
                    filterStatus === tab.id
                      ? '1px solid #3B82F6'
                      : '1px solid #1E293B',
                  color: filterStatus === tab.id ? '#FFFFFF' : '#94A3B8',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dispute List Items */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxHeight: '700px',
              overflowY: 'auto',
            }}
          >
            {filteredDisputes.length === 0 ? (
              <div
                style={{
                  background: '#0B1120',
                  border: '1px solid #1E293B',
                  borderRadius: '12px',
                  padding: '30px 16px',
                  textAlign: 'center',
                  color: '#64748B',
                  fontSize: '12.5px',
                }}
              >
                No disputes matching this filter.
              </div>
            ) : (
              filteredDisputes.map((d) => {
                const isSelected = currentDispute?.id === d.id;
                const isLocked =
                  d.status === 'open' ||
                  d.category === 'pin_lockout' ||
                  d.pinAttemptsCount >= 3;

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDisputeId(d.id)}
                    style={{
                      background: isSelected ? '#162035' : '#0B1120',
                      border: isSelected
                        ? '1.5px solid #F59E0B'
                        : isLocked && d.status === 'open'
                        ? '1px solid rgba(239, 68, 68, 0.4)'
                        : '1px solid #1E293B',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                        }}
                      >
                        #{d.orderNumber}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          background:
                            d.status === 'open'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : d.status === 'refunded'
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)',
                          color:
                            d.status === 'open'
                              ? '#FCA5A5'
                              : d.status === 'refunded'
                              ? '#93C5FD'
                              : '#6EE7B7',
                          border:
                            d.status === 'open'
                              ? '1px solid rgba(239, 68, 68, 0.4)'
                              : d.status === 'refunded'
                              ? '1px solid rgba(59, 130, 246, 0.4)'
                              : '1px solid rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        {d.status === 'open'
                          ? 'Escrow Frozen'
                          : d.status === 'refunded'
                          ? 'Refunded'
                          : 'Settled'}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#94A3B8',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        {d.buyerName} ➔ {d.vendorName}
                      </span>
                      <strong style={{ color: '#F59E0B' }}>
                        ₦{(d.amount || 0).toLocaleString()}
                      </strong>
                    </div>

                    <p
                      style={{
                        fontSize: '11.5px',
                        color: '#CBD5E1',
                        margin: '0 0 10px 0',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {d.reason}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '10.5px',
                        color: '#64748B',
                        borderTop: '1px solid #1E293B',
                        paddingTop: '8px',
                      }}
                    >
                      <span>
                        {d.location?.hostelName || 'Hostel Reception Desk'}
                      </span>
                      <span>
                        {d.createdAt
                          ? new Date(d.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Deep Case File Inspector */}
        {currentDispute ? (
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            {/* Case Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                borderBottom: '1px solid #1E293B',
                paddingBottom: '18px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      margin: 0,
                      color: '#FFFFFF',
                    }}
                  >
                    Case File: #{currentDispute.orderNumber}
                  </h3>
                  <span
                    style={{
                      background: '#1E293B',
                      color: '#F59E0B',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                    }}
                  >
                    Tag: {currentDispute.packageTag || 'RUN-PKG'}
                  </span>
                  <span
                    style={{
                      background:
                        currentDispute.category === 'pin_lockout'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                      border:
                        currentDispute.category === 'pin_lockout'
                          ? '1px solid #EF4444'
                          : '1px solid #F59E0B',
                      color:
                        currentDispute.category === 'pin_lockout'
                          ? '#FCA5A5'
                          : '#FCD34D',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {currentDispute.category === 'pin_lockout'
                      ? '3-PIN Lockout'
                      : currentDispute.category === 'wrong_item'
                      ? 'Wrong Item / Size'
                      : 'Physical Inspection Flag'}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#94A3B8',
                    marginTop: '6px',
                  }}
                >
                  Location:{' '}
                  <strong style={{ color: '#F8FAFC' }}>
                    {currentDispute.location?.campusName || "Redeemer's University"}
                  </strong>{' '}
                  • {currentDispute.location?.porterLodgeName} (Zero-Room-Entry Ground Floor)
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Escrow Vault Value
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#F59E0B',
                  }}
                >
                  ₦{(currentDispute.amount || 0).toLocaleString()}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    color:
                      currentDispute.status === 'open'
                        ? '#EF4444'
                        : '#10B981',
                    fontWeight: 700,
                  }}
                >
                  ●{' '}
                  {currentDispute.status === 'open'
                    ? 'PAYSTACK ESCROW FROZEN'
                    : currentDispute.status === 'refunded'
                    ? 'REVERSED TO STUDENT'
                    : 'RELEASED TO MERCHANT'}
                </span>
              </div>
            </div>

            {/* Financial Breakdown Pill */}
            <div
              style={{
                background: '#0B1120',
                border: '1px solid #1E293B',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Item Subtotal
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  ₦{(currentDispute.itemSubtotal || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                  Merchant Share
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Courier Runner
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#60A5FA',
                  }}
                >
                  ₦{(currentDispute.deliveryFee || 250).toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                  Student Dispatch
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Platform Tech Fee
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#10B981',
                  }}
                >
                  ₦{(currentDispute.platformFee || 100).toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                  UniHive Treasury
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  PIN Attempts
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color:
                      currentDispute.pinAttemptsCount >= 3
                        ? '#EF4444'
                        : '#F59E0B',
                  }}
                >
                  {currentDispute.pinAttemptsCount || 3} / 3 Attempts
                </div>
                <div style={{ fontSize: '10px', color: '#EF4444' }}>
                  {currentDispute.pinAttemptsCount >= 3
                    ? 'Security Lockout'
                    : 'Within limit'}
                </div>
              </div>
            </div>

            {/* Tri-Party Credentials (Buyer, Merchant, Courier) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px',
              }}
            >
              {/* Student Buyer */}
              <div
                style={{
                  background: '#11192C',
                  border: '1px solid #1E293B',
                  borderRadius: '12px',
                  padding: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#60A5FA',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  <User size={14} /> Student Buyer
                </div>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  {currentDispute.buyer?.fullName || currentDispute.buyerName}
                </div>
                <div
                  style={{
                    fontSize: '11.5px',
                    color: '#F59E0B',
                    fontWeight: 600,
                    marginTop: '2px',
                  }}
                >
                  Matric: {currentDispute.buyer?.matricNumber || 'RUN/2023/STU/001'}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#94A3B8',
                    marginTop: '4px',
                  }}
                >
                  {currentDispute.buyer?.hostelName} (
                  {currentDispute.buyer?.roomNumber})
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#64748B',
                    marginTop: '2px',
                  }}
                >
                  Phone: {currentDispute.buyer?.phone}
                </div>
              </div>

              {/* Campus Merchant */}
              <div
                style={{
                  background: '#11192C',
                  border: '1px solid #1E293B',
                  borderRadius: '12px',
                  padding: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#C084FC',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  <Store size={14} /> Campus Merchant
                </div>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  {currentDispute.vendor?.businessName || currentDispute.vendorName}
                </div>
                <div
                  style={{
                    fontSize: '11.5px',
                    color: '#10B981',
                    fontWeight: 600,
                    marginTop: '2px',
                  }}
                >
                  Bank: {currentDispute.vendor?.bankName || 'OPay'}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#94A3B8',
                    marginTop: '4px',
                  }}
                >
                  Acc: {currentDispute.vendor?.accountNumber || '8123450002'}
                </div>
                <div
                  style={{
                    fontSize: '10.5px',
                    color: '#64748B',
                    fontFamily: 'monospace',
                    marginTop: '2px',
                  }}
                >
                  Sub: {currentDispute.vendor?.subaccountCode || 'ACCT_vendor_sub'}
                </div>
              </div>

              {/* Student Runner */}
              <div
                style={{
                  background: '#11192C',
                  border: '1px solid #1E293B',
                  borderRadius: '12px',
                  padding: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#FCD34D',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  <Bike size={14} /> Student Courier
                </div>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  {currentDispute.courier?.fullName || 'David Adeleke'}
                </div>
                <div
                  style={{
                    fontSize: '11.5px',
                    color: '#94A3B8',
                    fontWeight: 600,
                    marginTop: '2px',
                  }}
                >
                  Matric: {currentDispute.courier?.matricNumber || 'RUN/2023/LAW/054'}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#10B981',
                    marginTop: '4px',
                  }}
                >
                  Rating: ★ {currentDispute.courier?.rating || 4.9} (
                  {currentDispute.courier?.totalTrips || 12} drops)
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#64748B',
                    marginTop: '2px',
                  }}
                >
                  Phone: {currentDispute.courier?.phone || '08098765432'}
                </div>
              </div>
            </div>

            {/* Photographic Evidence & Inspection Proof */}
            <div
              style={{
                background: '#0B1120',
                border: '1px solid #1E293B',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Eye size={15} color="#F59E0B" /> Physical Evidence & Inspection Proof
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Captured at Ground-Floor Porter Lodge
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {currentDispute.evidenceUrls?.map((url: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxImage(url)}
                    style={{
                      width: '140px',
                      height: '100px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #334155',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={url}
                      alt="Dispute inspection proof"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = '1')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = '0')
                      }
                    >
                      <Eye size={20} color="#FFFFFF" />
                    </div>
                  </div>
                ))}

                {/* Evidence Note */}
                <div
                  style={{
                    flex: 1,
                    minWidth: '220px',
                    background: '#162035',
                    border: '1px solid #23314E',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '12px',
                    color: '#CBD5E1',
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: '#FCD34D' }}>Porter Desk Finding: </strong>
                  {currentDispute.reason}
                </div>
              </div>
            </div>

            {/* Tri-Party Statements Accordion */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div
                style={{
                  background: '#11192C',
                  border: '1px solid #1E293B',
                  borderRadius: '10px',
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: '#60A5FA',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  🗣️ Student Buyer Testimony
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#CBD5E1',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  "{currentDispute.buyerStatement}"
                </p>
              </div>

              <div
                style={{
                  background: '#11192C',
                  border: '1px solid #1E293B',
                  borderRadius: '10px',
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: '#C084FC',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  🏪 Merchant Response
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#CBD5E1',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  "{currentDispute.merchantStatement}"
                </p>
              </div>

              <div
                style={{
                  background: '#11192C',
                  border: '1px solid #1E293B',
                  borderRadius: '10px',
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: '#FCD34D',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  🏃 Runner Porter Desk Custody Log
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#CBD5E1',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  "{currentDispute.courierNotes}"
                </p>
              </div>
            </div>

            {/* Audit Trail Timeline */}
            {currentDispute.timeline && currentDispute.timeline.length > 0 && (
              <div
                style={{
                  background: '#0B1120',
                  border: '1px solid #1E293B',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    marginBottom: '14px',
                  }}
                >
                  Custody Audit Trail & Verification Events
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    paddingLeft: '18px',
                  }}
                >
                  {/* Vertical rule line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '5px',
                      top: '6px',
                      bottom: '6px',
                      width: '2px',
                      background: '#1E293B',
                    }}
                  />

                  {currentDispute.timeline.map((step: any, idx: number) => {
                    const isFailed =
                      step.status === 'failed' || step.status === 'locked' || step.status === 'disputed';
                    return (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: '-18px',
                            top: '3px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: isFailed ? '#EF4444' : '#10B981',
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: isFailed ? '#FCA5A5' : '#F8FAFC',
                            }}
                          >
                            {step.event}
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#94A3B8',
                              marginTop: '2px',
                            }}
                          >
                            {step.description}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#64748B',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {step.timestamp
                            ? new Date(step.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chief Proctor Mediation Terminal (Action Center) */}
            <div
              style={{
                background: 'linear-gradient(180deg, #162035 0%, #0F172A 100%)',
                border: '1.5px solid #23314E',
                borderRadius: '14px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Lock size={16} color="#F59E0B" /> Chief Proctor Ruling & Escrow Release
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#94A3B8',
                    fontStyle: 'italic',
                  }}
                >
                  Logged as Proctor O. Adeleke
                </span>
              </div>

              {currentDispute.status === 'open' ? (
                <>
                  {/* Preset quick pills */}
                  <div style={{ marginBottom: '10px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#94A3B8',
                        marginBottom: '6px',
                      }}
                    >
                      Quick Mediation Presets:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        'Physical inspection at Porter Lodge confirms wrong size/item. Full student refund approved.',
                        'PIN Lockout investigated; buyer identity verified via RUN Matric ID, releasing funds to merchant.',
                        'Item refused by student; package safely returned to vendor inventory, issuing Paystack reversal.',
                        'Damaged box confirmed at porter desk. Student refund authorized.',
                      ].map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          style={{
                            background: '#0B1120',
                            border: '1px solid #1E293B',
                            color: '#94A3B8',
                            fontSize: '10.5px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          + {preset.substring(0, 42)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes input */}
                  <textarea
                    rows={3}
                    placeholder="Enter official mediation findings & proctor justification for Paystack ledger audit..."
                    value={proctorNotes}
                    onChange={(e) => setProctorNotes(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0B1120',
                      border: '1px solid #23314E',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      marginBottom: '16px',
                      outline: 'none',
                    }}
                  />

                  {/* Two High-Impact Actions */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                    }}
                  >
                    <button
                      onClick={() => handleExecuteResolution('refund_buyer')}
                      disabled={loading || actionInProgress !== null}
                      style={{
                        background:
                          actionInProgress === 'refund_buyer'
                            ? '#7F1D1D'
                            : 'rgba(239, 68, 68, 0.2)',
                        border: '1.5px solid #EF4444',
                        color: '#FCA5A5',
                        padding: '13px 16px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <RotateCcw size={16} />
                      {actionInProgress === 'refund_buyer'
                        ? 'Executing Reversal...'
                        : '↩ 100% Paystack Reversal to Student'}
                    </button>

                    <button
                      onClick={() => handleExecuteResolution('release_to_vendor')}
                      disabled={loading || actionInProgress !== null}
                      style={{
                        background:
                          actionInProgress === 'release_to_vendor'
                            ? '#064E3B'
                            : 'rgba(16, 185, 129, 0.2)',
                        border: '1.5px solid #10B981',
                        color: '#6EE7B7',
                        padding: '13px 16px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <CheckCircle2 size={16} />
                      {actionInProgress === 'release_to_vendor'
                        ? 'Releasing Funds...'
                        : '✓ Authorize Merchant & Runner Payout'}
                    </button>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    background:
                      currentDispute.status === 'refunded'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(16, 185, 129, 0.15)',
                    border:
                      currentDispute.status === 'refunded'
                        ? '1px solid #3B82F6'
                        : '1px solid #10B981',
                    borderRadius: '10px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 800,
                      color:
                        currentDispute.status === 'refunded'
                          ? '#93C5FD'
                          : '#6EE7B7',
                      marginBottom: '4px',
                    }}
                  >
                    ✓ Case Resolved ({currentDispute.status === 'refunded' ? '100% Student Refund' : 'Merchant Payout Released'})
                  </div>
                  <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                    <strong>Proctor Ruling:</strong> {currentDispute.resolutionNotes || 'Arbitration settled by Chief Proctor Adeleke.'}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#64748B',
                      marginTop: '6px',
                    }}
                  >
                    Resolved at:{' '}
                    {currentDispute.resolvedAt
                      ? new Date(currentDispute.resolvedAt).toLocaleString()
                      : 'Recently'}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center',
              color: '#64748B',
            }}
          >
            <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
              No Case Selected
            </div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>
              Select a dispute from the queue on the left to inspect physical evidence and mediate.
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Full Evidence Inspection */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '85vw',
              maxHeight: '85vh',
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '14px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderBottom: '1px solid #1E293B',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                Ground-Floor Porter Lodge Physical Inspection Proof
              </span>
              <button
                onClick={() => setLightboxImage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <img
              src={lightboxImage}
              alt="Full size evidence"
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
