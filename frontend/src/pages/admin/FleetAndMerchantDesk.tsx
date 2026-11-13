import React, { useState } from 'react';
import {
  Bike,
  Store,
  Tag,
  Search,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';

interface FleetAndMerchantDeskProps {
  viewMode: 'fleet' | 'stores' | 'products';
  couriers: any[];
  vendors: any[];
  products: any[];
  onToggleCourierStatus: (courierId: string, currentStatus: string, isSuspended: boolean) => Promise<void>;
  onToggleVendorStatus: (vendorId: string, isApproved: boolean) => Promise<void>;
  onModerateProduct: (productId: string, currentActive: boolean) => Promise<void>;
  onOpenProvisionModal: () => void;
  onRefresh: () => void;
  actionLoadingId?: string | null;
  campusName?: string;
}

export const FleetAndMerchantDesk: React.FC<FleetAndMerchantDeskProps> = ({
  viewMode,
  couriers,
  vendors,
  products,
  onToggleCourierStatus,
  onToggleVendorStatus,
  onModerateProduct,
  onOpenProvisionModal,
  onRefresh,
  actionLoadingId,
  campusName = "Redeemer's University (RUN)",
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');

  // Filtered Couriers
  const filteredCouriers = couriers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.fullName.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.baseHostelName.toLowerCase().includes(q) ||
      c.matricNumber.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return !c.isSuspended && c.status !== 'offline';
    if (statusFilter === 'suspended') return c.isSuspended;
    return true;
  });

  // Filtered Vendors
  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      v.businessName.toLowerCase().includes(q) ||
      v.ownerName.toLowerCase().includes(q) ||
      v.ownerMatric.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return v.isApproved && !v.isSuspended;
    if (statusFilter === 'pending') return !v.isApproved;
    if (statusFilter === 'suspended') return v.isSuspended;
    return true;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.vendorStoreName.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return p.isActive;
    if (statusFilter === 'suspended') return !p.isActive;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* View Header with Search & Controls */}
      <div
        style={{
          background: '#11192C',
          border: '1px solid #1E293B',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background:
                viewMode === 'fleet'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : viewMode === 'stores'
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(99, 102, 241, 0.15)',
              border: `1px solid ${
                viewMode === 'fleet'
                  ? 'rgba(16, 185, 129, 0.35)'
                  : viewMode === 'stores'
                  ? 'rgba(245, 158, 11, 0.35)'
                  : 'rgba(99, 102, 241, 0.35)'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: viewMode === 'fleet' ? '#10B981' : viewMode === 'stores' ? '#F59E0B' : '#818CF8',
            }}
          >
            {viewMode === 'fleet' && <Bike size={22} />}
            {viewMode === 'stores' && <Store size={22} />}
            {viewMode === 'products' && <Tag size={22} />}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
              {viewMode === 'fleet' && 'SwiftDrop Partner Logistics Fleet'}
              {viewMode === 'stores' && 'Campus Stores & Merchant KYC Desk'}
              {viewMode === 'products' && 'Product Moderation & Prohibited Items'}
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
              {viewMode === 'fleet' && `Supervising contracted runners across all hostels at ${campusName}`}
              {viewMode === 'stores' && 'Audit student merchant accounts, Paystack subaccounts, and store KYC'}
              {viewMode === 'products' && 'Inspect marketplace catalog items to enforce university hostel guidelines'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {viewMode === 'fleet' && (
            <button
              onClick={onOpenProvisionModal}
              style={{
                background: '#10B981',
                border: 'none',
                color: '#064E3B',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <UserPlus size={15} />
              <span>+ Provision Fleet Runner</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            style={{
              background: '#1E293B',
              border: '1px solid #334155',
              color: '#94A3B8',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            background: '#11192C',
            border: '1px solid #1E293B',
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: '1 1 200px',
            minWidth: '0',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Search size={15} color="#64748B" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              viewMode === 'fleet'
                ? 'Search runners by name, phone, hostel...'
                : viewMode === 'stores'
                ? 'Search stores by name, merchant, matric...'
                : 'Search products by title, store, category...'
            }
            style={{
              background: 'transparent',
              border: 'none',
              color: '#F8FAFC',
              fontSize: '12px',
              outline: 'none',
              width: '100%',
              minWidth: '0',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '11px', flexShrink: 0 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Pill Filters */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            maxWidth: '100%',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            ...(viewMode === 'stores' ? [{ id: 'pending', label: 'Pending Review' }] : []),
            { id: 'suspended', label: 'Suspended / Inactive' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              style={{
                background: statusFilter === pill.id ? '#1E293B' : '#0F172A',
                border: statusFilter === pill.id ? '1px solid #F59E0B' : '1px solid #1E293B',
                color: statusFilter === pill.id ? '#F8FAFC' : '#94A3B8',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. FLEET VIEW: SwiftDrop Contracted Runners Roster            */}
      {/* ============================================================== */}
      {viewMode === 'fleet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Logistics Partner Banner */}
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: '14px',
              padding: '14px 18px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🚴</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                  Contracted Partner: SwiftDrop Campus Logistics
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                  Zero student courier vetting required • Verified under University Service Level Agreement
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                ⚡ 12-min avg drop
              </span>
              <span
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60A5FA',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                🛡️ 99.4% Handshakes
              </span>
            </div>
          </div>

          {filteredCouriers.length === 0 ? (
            <div
              style={{
                background: '#11192C',
                border: '1px dashed #334155',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
                color: '#94A3B8',
              }}
            >
              <Bike size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>No Fleet Runners Found</div>
              <div style={{ fontSize: '12px', marginTop: '4px', marginBottom: '16px' }}>
                {searchQuery ? 'Try adjusting your search filters' : 'Provision your first fleet runner to receive campus orders'}
              </div>
              <button
                onClick={onOpenProvisionModal}
                style={{
                  background: '#10B981',
                  border: 'none',
                  color: '#064E3B',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                + Provision Fleet Runner
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: '12px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {filteredCouriers.map((c) => {
                const isLoading = actionLoadingId === c.id;
                const isOnline = !c.isSuspended && c.status !== 'offline';

                return (
                  <div
                    key={c.id}
                    style={{
                      background: '#11192C',
                      border: c.isSuspended ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #1E293B',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'border-color 0.2s',
                      width: '100%',
                      boxSizing: 'border-box',
                      minWidth: 0,
                    }}
                  >
                    {/* Top Row: Name & Status */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
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
                            fontWeight: 800,
                            color: '#F59E0B',
                            fontSize: '14px',
                            border: '1px solid #334155',
                          }}
                        >
                          {c.fullName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{c.fullName}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{c.matricNumber}</div>
                        </div>
                      </div>

                      <span
                        style={{
                          background: c.isSuspended
                            ? 'rgba(239, 68, 68, 0.15)'
                            : isOnline
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(148, 163, 184, 0.15)',
                          color: c.isSuspended ? '#EF4444' : isOnline ? '#10B981' : '#94A3B8',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {c.isSuspended ? 'Suspended' : c.status}
                      </span>
                    </div>

                    {/* Middle: Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Base Hostel:</span>
                        <strong style={{ color: '#F1F5F9' }}>{c.baseHostelName}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>WhatsApp / Phone:</span>
                        <strong style={{ color: '#10B981' }}>{c.phone}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Settlement Bank:</span>
                        <span style={{ color: '#94A3B8' }}>{c.bankName} • {c.accountNumber ? `••••${c.accountNumber.slice(-4)}` : 'OPay'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                        <span style={{ color: '#64748B' }}>Performance:</span>
                        <span style={{ color: '#F59E0B', fontWeight: 700 }}>
                          ★ {c.rating.toFixed(1)} • {c.totalTripsCompleted} Drops
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Action Buttons */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderTop: '1px solid #1E293B',
                        paddingTop: '10px',
                        marginTop: '4px',
                      }}
                    >
                      {c.whatsappPingLink ? (
                        <a
                          href={c.whatsappPingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10B981',
                            padding: '7px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>WhatsApp Ping</span>
                        </a>
                      ) : null}

                      <button
                        onClick={() => onToggleCourierStatus(c.id, c.status, c.isSuspended)}
                        disabled={isLoading}
                        style={{
                          flex: 1,
                          background: c.isSuspended
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                          border: c.isSuspended
                            ? '1px solid rgba(16, 185, 129, 0.4)'
                            : '1px solid rgba(239, 68, 68, 0.4)',
                          color: c.isSuspended ? '#A7F3D0' : '#FCA5A5',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                        }}
                      >
                        {isLoading ? (
                          <span>Updating...</span>
                        ) : c.isSuspended ? (
                          <>
                            <CheckCircle size={13} />
                            <span>Activate</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert size={13} />
                            <span>Suspend</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. STORES VIEW: Campus Merchant Stores & KYC Oversight        */}
      {/* ============================================================== */}
      {viewMode === 'stores' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredVendors.length === 0 ? (
            <div
              style={{
                background: '#11192C',
                border: '1px dashed #334155',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
                color: '#94A3B8',
              }}
            >
              <Store size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>No Campus Stores Found</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your search criteria</div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: '12px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {filteredVendors.map((v) => {
                const isLoading = actionLoadingId === v.id;

                return (
                  <div
                    key={v.id}
                    style={{
                      background: '#11192C',
                      border: v.isSuspended
                        ? '1px solid rgba(239, 68, 68, 0.4)'
                        : v.isApproved
                        ? '1px solid #1E293B'
                        : '1.5px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      width: '100%',
                      boxSizing: 'border-box',
                      minWidth: 0,
                    }}
                  >
                    {/* Header: Store Name & Category */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#F59E0B',
                            flexShrink: 0,
                          }}
                        >
                          <Store size={20} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', wordBreak: 'break-word' }}>{v.businessName}</div>
                          <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 700 }}>{v.category}</div>
                        </div>
                      </div>

                      <span
                        style={{
                          background: v.isSuspended
                            ? 'rgba(239, 68, 68, 0.15)'
                            : v.isApproved
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                          color: v.isSuspended ? '#EF4444' : v.isApproved ? '#10B981' : '#F59E0B',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          flexShrink: 0,
                        }}
                      >
                        {v.isSuspended ? 'SUSPENDED' : v.isApproved ? 'VERIFIED' : 'PENDING REVIEW'}
                      </span>
                    </div>

                    {/* Merchant Student KYC & Banking */}
                    <div style={{ background: '#0B1120', borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ color: '#64748B', flexShrink: 0 }}>Owner / Matric:</span>
                        <strong style={{ color: '#E2E8F0', wordBreak: 'break-word', textAlign: 'right' }}>{v.ownerName} ({v.ownerMatric})</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ color: '#64748B', flexShrink: 0 }}>Merchant Phone:</span>
                        <strong style={{ color: '#94A3B8' }}>{v.ownerPhone}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ color: '#64748B', flexShrink: 0 }}>Bank Settlement:</span>
                        <span style={{ color: '#38BDF8', wordBreak: 'break-word', textAlign: 'right' }}>{v.bankName} • {v.accountNumber}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ color: '#64748B', flexShrink: 0 }}>Paystack Subaccount:</span>
                        <span style={{ color: '#A78BFA', fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'right' }}>{v.paystackSubaccountCode}</span>
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#94A3B8', padding: '0 4px' }}>
                      <span>Catalog: <strong style={{ color: '#FFF' }}>{v.totalProductsCount} items</strong></span>
                      <span>Completed: <strong style={{ color: '#10B981' }}>{v.completedOrdersCount} orders</strong></span>
                      <span>Trust: <strong style={{ color: '#F59E0B' }}>{v.trustScore}%</strong></span>
                    </div>

                    {/* Bottom Action Controls */}
                    <div style={{ borderTop: '1px solid #1E293B', paddingTop: '10px', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onToggleVendorStatus(v.id, v.isApproved)}
                        disabled={isLoading}
                        style={{
                          flex: 1,
                          background: v.isApproved
                            ? 'rgba(239, 68, 68, 0.12)'
                            : 'rgba(16, 185, 129, 0.15)',
                          border: v.isApproved
                            ? '1px solid rgba(239, 68, 68, 0.35)'
                            : '1px solid rgba(16, 185, 129, 0.4)',
                          color: v.isApproved ? '#FCA5A5' : '#34D399',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        {isLoading ? (
                          <span>Updating...</span>
                        ) : v.isApproved ? (
                          <>
                            <ShieldAlert size={14} />
                            <span>Suspend Store</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={14} />
                            <span>Verify Store (Grant Selling)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. PRODUCTS VIEW: Catalog & Prohibited Items Moderation       */}
      {/* ============================================================== */}
      {viewMode === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredProducts.length === 0 ? (
            <div
              style={{
                background: '#11192C',
                border: '1px dashed #334155',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
                color: '#94A3B8',
              }}
            >
              <Tag size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>No Products Found</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your search criteria</div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: '12px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {filteredProducts.map((p) => {
                const isLoading = actionLoadingId === p.id;

                return (
                  <div
                    key={p.id}
                    style={{
                      background: '#11192C',
                      border: p.isActive ? '1px solid #1E293B' : '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      width: '100%',
                      boxSizing: 'border-box',
                      minWidth: 0,
                    }}
                  >
                    {/* Top Row: Product Info & Status */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '10px',
                          background: '#1E293B',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #334155',
                        }}
                      >
                        {p.images && p.images[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Tag size={22} color="#64748B" />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          {p.vendorStoreName} • {p.category}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
                          ₦{p.price.toLocaleString()}
                        </div>
                      </div>

                      <span
                        style={{
                          background: p.isActive
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                          color: p.isActive ? '#10B981' : '#F59E0B',
                          fontSize: '9.5px',
                          fontWeight: 800,
                          padding: '3px 7px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {p.isActive ? 'ACTIVE' : 'FLAGGED / DELISTED'}
                      </span>
                    </div>

                    {/* Description preview */}
                    {p.description && (
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: '#94A3B8',
                          lineHeight: 1.35,
                          background: '#0B1120',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          maxHeight: '44px',
                          overflow: 'hidden',
                        }}
                      >
                        {p.description}
                      </div>
                    )}

                    {/* Stock & Campus Compliance Check */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                      <span>Inventory Stock: <strong style={{ color: '#E2E8F0' }}>{p.stockQuantity} in stock</strong></span>
                      <span>Policy: <strong style={{ color: p.isActive ? '#10B981' : '#F59E0B' }}>{p.isActive ? 'Compliant' : 'Under Review'}</strong></span>
                    </div>

                    {/* Action Controls */}
                    <div style={{ borderTop: '1px solid #1E293B', paddingTop: '10px' }}>
                      <button
                        onClick={() => onModerateProduct(p.id, p.isActive)}
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          background: p.isActive
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(16, 185, 129, 0.15)',
                          border: p.isActive
                            ? '1px solid rgba(245, 158, 11, 0.35)'
                            : '1px solid rgba(16, 185, 129, 0.4)',
                          color: p.isActive ? '#FDE68A' : '#34D399',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        {isLoading ? (
                          <span>Updating...</span>
                        ) : p.isActive ? (
                          <>
                            <AlertTriangle size={14} />
                            <span>Flag & Delist Item (Hostel Compliance)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} />
                            <span>Approve & Relist to Marketplace</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
