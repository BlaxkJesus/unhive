import React, { useState } from 'react';
import { ChevronDown, Bell, Lock, Zap, Bike, Store, Filter, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { UniHiveLogo } from '../components/common/UniHiveLogo';

interface AdminDashboardDesktopProps {
  onNavigate?: (screenId: string) => void;
}

export const AdminDashboardDesktop: React.FC<AdminDashboardDesktopProps> = () => {
  const [disputeResolved, setDisputeResolved] = useState<'pending' | 'refunded' | 'released'>('pending');

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#0B1120',
        color: '#F8FAFC',
        fontFamily: 'var(--font-main, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          background: '#0F172A',
          borderBottom: '1px solid #1E293B',
          padding: '14px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <UniHiveLogo size={42} variant="white" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>
                Uni<span style={{ color: '#F59E0B' }}>Hive</span>
              </span>
              <span
                style={{
                  background: '#1E293B',
                  color: '#94A3B8',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.5px',
                  border: '1px solid #334155',
                }}
              >
                ADMIN HQ
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              Campus Operations & Escrow Command Center
            </div>
          </div>
        </div>

        {/* Center Pill: Campus Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '9999px',
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#F8FAFC',
            }}
          >
            <span>Campus: <strong style={{ color: '#FFFFFF' }}>Redeemer's University (Ede)</strong></span>
            <span
              style={{
                background: '#064E3B',
                color: '#34D399',
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
              }}
            >
              Active
            </span>
            <ChevronDown size={14} color="#94A3B8" />
          </div>

          <div
            style={{
              background: 'rgba(6, 78, 59, 0.4)',
              border: '1px solid #059669',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#34D399',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
            <span>Escrow Vault: 100% Operational • Paystack Connected</span>
          </div>
        </div>

        {/* Right: Admin Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#1E293B',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13px',
            }}
          >
            AC
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>Dr. K. Alabi</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>RUN Logistics Proctors Lead</div>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Bell size={16} color="#94A3B8" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top 4 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {/* Card 1 */}
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '20px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#C084FC', letterSpacing: '0.4px' }}>
                ESCROW VAULT (LOCKED)
              </span>
              <div style={{ background: '#581C87', padding: '6px', borderRadius: '8px', color: '#E9D5FF' }}>
                <Lock size={14} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
              ₦1,428,500
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              28 Active Orders Awaiting PIN Handshake
            </div>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '20px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#FBBF24', letterSpacing: '0.4px' }}>
                UNIHIVE PLATFORM REVENUE
              </span>
              <div style={{ background: '#78350F', padding: '6px', borderRadius: '8px', color: '#FDE68A' }}>
                <Zap size={14} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
              ₦184,200
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ background: '#F59E0B', color: '#0F172A', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                ₦100/tx
              </span>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>1,842 Total RUN Orders Completed</span>
            </div>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '20px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#34D399', letterSpacing: '0.4px' }}>
                ONLINE COURIERS (RUNNERS)
              </span>
              <div style={{ background: '#064E3B', padding: '6px', borderRadius: '8px', color: '#6EE7B7' }}>
                <Bike size={14} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
              34 Active
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>• 14 Joshua</span>
              <span>• 12 Queen Esther link</span>
              <span>• 8 RUN Halls</span>
            </div>
          </div>

          {/* Card 4 */}
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '20px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#60A5FA', letterSpacing: '0.4px' }}>
                ACTIVE CAMPUS MERCHANTS
              </span>
              <div style={{ background: '#1E3A8A', padding: '6px', borderRadius: '8px', color: '#93C5FD' }}>
                <Store size={14} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
              124 Stores
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              482 Verified Items (Thrift, Food, Tech)
            </div>
          </div>
        </div>

        {/* Main Grid: Stream & Table Left, Dispute & Approvals Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: '24px' }}>
          {/* Left Column: Live Dispatch Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                background: '#0F172A',
                borderRadius: '24px',
                border: '1px solid #1E293B',
                padding: '24px',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                    <Zap size={18} color="#F59E0B" />
                    <span>Live Campus Dispatch Stream & Escrow Audit</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    Real-time tracking of inter-hostel deliveries & Porter's Lodge handshakes
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Auto-refresh: 5s</span>
                  <button
                    style={{
                      background: '#1E293B',
                      border: '1px solid #334155',
                      color: '#E2E8F0',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <Filter size={14} />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1E293B', color: '#94A3B8', fontSize: '11px', fontWeight: 800, letterSpacing: '0.4px' }}>
                      <th style={{ padding: '12px 10px' }}>ORDER & ITEM</th>
                      <th style={{ padding: '12px 10px' }}>BUYER & DESTINATION</th>
                      <th style={{ padding: '12px 10px' }}>COURIER RUNNER</th>
                      <th style={{ padding: '12px 10px' }}>ESCROW VALUE</th>
                      <th style={{ padding: '12px 10px' }}>HANDSHAKE STATUS</th>
                      <th style={{ padding: '12px 10px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1 */}
                    <tr style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 800, color: '#FFFFFF' }}>#RUN-4829</div>
                        <div style={{ fontSize: '12px', color: '#CBD5E1' }}>Nike Air Force 1 '07 (Size 43)</div>
                        <div style={{ fontSize: '11px', color: '#F43F5E' }}>Vendor: Tunde Kicks</div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Amaka Okafor</div>
                        <div style={{ fontSize: '11px', color: '#34D399' }}>
                          Queen Esther Porter Desk
                        </div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F59E0B', color: '#0F172A', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            SA
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Samuel A.</div>
                            <div style={{ fontSize: '10px', color: '#94A3B8' }}>Runner #12 • Joshua</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 800, color: '#FBBF24' }}>₦18,850</div>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>₦100 fee + ₦250 run</div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span
                          style={{
                            background: 'rgba(245, 158, 11, 0.15)',
                            border: '1px solid #F59E0B',
                            color: '#FBBF24',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          At Porter (Waiting PIN)
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                        <button
                          style={{
                            background: '#1E293B',
                            border: '1px solid #334155',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Audit
                        </button>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 800, color: '#FFFFFF' }}>#RUN-4830</div>
                        <div style={{ fontSize: '12px', color: '#CBD5E1' }}>Oraimo 65W Fast Charger</div>
                        <div style={{ fontSize: '11px', color: '#60A5FA' }}>Vendor: GadgetPlug</div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>David Adeleke</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Joshua Hall</div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3B82F6', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            TE
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Tobi E.</div>
                            <div style={{ fontSize: '10px', color: '#94A3B8' }}>Runner #08</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 800, color: '#FBBF24' }}>₦9,350</div>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>₦100 fee + ₦250 run</div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid #3B82F6',
                            color: '#60A5FA',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ↗ In Transit (~4m)
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                        <button
                          style={{
                            background: '#1E293B',
                            border: '1px solid #334155',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Track
                        </button>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 800, color: '#FFFFFF' }}>#RUN-4831</div>
                        <div style={{ fontSize: '12px', color: '#CBD5E1' }}>Jollof Rice & Turkey Buttery Combo</div>
                        <div style={{ fontSize: '11px', color: '#F59E0B' }}>Vendor: Central Buttery</div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Favour Oladipo</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Bishop Court Quarters</div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span
                          style={{
                            background: '#581C87',
                            color: '#E9D5FF',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          Merchant Direct
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 800, color: '#FBBF24' }}>₦3,850</div>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>₦100 platform fee</div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span
                          style={{
                            background: 'rgba(168, 85, 247, 0.15)',
                            border: '1px solid #A855F7',
                            color: '#C084FC',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Vendor En Route
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                        <button
                          style={{
                            background: '#1E293B',
                            border: '1px solid #334155',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Track
                        </button>
                      </td>
                    </tr>

                    {/* Row 4 */}
                    <tr>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 800, color: '#FFFFFF' }}>#RUN-4828</div>
                        <div style={{ fontSize: '12px', color: '#CBD5E1' }}>Vintage Corduroy Jacket</div>
                        <div style={{ fontSize: '11px', color: '#818CF8' }}>Vendor: ThriftZone RUN</div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Kemi Johnson</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Queen Esther Hall</div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#059669', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            BO
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Blessing O.</div>
                            <div style={{ fontSize: '10px', color: '#94A3B8' }}>Runner #04</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 800, color: '#34D399' }}>₦7,350</div>
                        <div style={{ fontSize: '10px', color: '#34D399' }}>Settled via Paystack</div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid #10B981',
                            color: '#34D399',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ✓ PIN Verified & Released
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                        <button
                          style={{
                            background: '#1E293B',
                            border: '1px solid #334155',
                            color: '#94A3B8',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Campus Logistics Parameters Panel */}
            <div
              style={{
                background: '#0F172A',
                borderRadius: '20px',
                border: '1px solid #1E293B',
                padding: '20px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px' }}>
                Campus Logistics Parameters & Policy Enforcement
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div style={{ background: '#1E293B', borderRadius: '14px', padding: '14px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.4px', marginBottom: '4px' }}>
                    HOSTEL COURIER FEE
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#34D399', marginBottom: '2px' }}>
                    ₦250 <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>/ run</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>100% credited directly to student courier</div>
                </div>

                <div style={{ background: '#1E293B', borderRadius: '14px', padding: '14px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.4px', marginBottom: '4px' }}>
                    UNIHIVE TECH PLATFORM FEE
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#FBBF24', marginBottom: '2px' }}>
                    ₦100 <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>/ transaction</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Retained in platform settlement vault</div>
                </div>

                <div style={{ background: '#1E293B', borderRadius: '14px', padding: '14px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.4px', marginBottom: '4px' }}>
                    PORTER SAFETY MANDATE
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#34D399', marginBottom: '4px' }}>
                    Zero-Room-Entry Active
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Staircase ascents strictly prohibited</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Escrow Dispute Case & Approvals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Priority Dispute Card */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1.5px solid #EF4444',
                borderRadius: '24px',
                padding: '22px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#EF4444', color: '#FFFFFF', padding: '6px', borderRadius: '8px' }}>
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>Escrow Dispute Case</div>
                    <div style={{ fontSize: '11px', color: '#FCA5A5' }}>Case #DISP-084 • Priority Action</div>
                  </div>
                </div>
                <span
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#F87171',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  PIN Held
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Item in Question:</span>
                  <span style={{ fontWeight: 800, color: '#FFFFFF' }}>Air Jordan 4 Retro (₦24,000)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Porter Location:</span>
                  <span style={{ fontWeight: 700, color: '#34D399' }}>Joshua Hall Desk</span>
                </div>
              </div>

              {/* Buyer's Claim */}
              <div
                style={{
                  background: '#0F172A',
                  border: '1px solid #1E293B',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#F87171', letterSpacing: '0.4px', marginBottom: '4px' }}>
                  BUYER'S CLAIM (NON-ACCEPTANCE):
                </div>
                <div style={{ fontSize: '12px', color: '#E2E8F0', fontStyle: 'italic', lineHeight: 1.45 }}>
                  "Vendor advertised size 44 in description, but the box handed over to the courier at the porter's lodge has size 41. I cannot accept or give the 4-digit code."
                </div>
              </div>

              <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.4px', marginBottom: '8px' }}>
                ADMIN EMERGENCY OVERRIDES:
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => setDisputeResolved('refunded')}
                  style={{
                    background: disputeResolved === 'refunded' ? '#991B1B' : '#EF4444',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={14} />
                  <span>{disputeResolved === 'refunded' ? '✓ Refunded ₦24,000 to Buyer' : 'Refund Buyer 100% (₦24,000 via Paystack)'}</span>
                </button>

                <button
                  onClick={() => setDisputeResolved('released')}
                  style={{
                    background: disputeResolved === 'released' ? '#047857' : '#1E293B',
                    color: '#FFFFFF',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Check size={14} />
                  <span>{disputeResolved === 'released' ? '✓ Escrow Released to Vendor' : 'Release to Vendor (Validate Description)'}</span>
                </button>
              </div>
            </div>

            {/* Pending Student Approvals */}
            <div
              style={{
                background: '#0F172A',
                borderRadius: '24px',
                border: '1px solid #1E293B',
                padding: '22px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>Pending Student Approvals</div>
                <span
                  style={{
                    background: '#78350F',
                    color: '#FDE68A',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  2 Pending
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Contracted Logistics Fleet Status */}
                <div style={{ background: '#1E293B', borderRadius: '16px', padding: '14px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>SwiftDrop Campus Logistics</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Contracted Partner Fleet</div>
                    </div>
                    <span style={{ background: '#064E3B', color: '#34D399', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                      Fleet Active
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#34D399', fontWeight: 700, marginBottom: '2px' }}>
                    34 Active Runners • All 7 RUN Hostels
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px', lineHeight: 1.35 }}>
                    Courier vetting is handled directly by SwiftDrop Logistics under campus SLA agreement. No student vetting required.
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', background: '#0F172A', color: '#FCD34D', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      ⚡ 12-min avg drop
                    </span>
                    <span style={{ fontSize: '10px', background: '#0F172A', color: '#60A5FA', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      🛡️ 99.4% Handshakes
                    </span>
                  </div>
                </div>

                {/* Approval 2 */}
                <div style={{ background: '#1E293B', borderRadius: '16px', padding: '14px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>Zainab Bello</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Store: Zee Bakes & Pastries</div>
                    </div>
                    <span style={{ background: '#78350F', color: '#FDE68A', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                      Menu Review
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>
                    OPay Bank: 8140••••921
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Compliance: Handbook Cleared
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
