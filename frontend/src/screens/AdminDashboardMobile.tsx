import React, { useState } from 'react';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { UniHiveLogo } from '../components/common/UniHiveLogo';
import { MobileStatusBar } from '../components/common/MobileStatusBar';

interface AdminDashboardMobileProps {
  onNavigate: (screenId: string) => void;
}

export const AdminDashboardMobile: React.FC<AdminDashboardMobileProps> = ({ onNavigate }) => {
  const [disputeStatus, setDisputeStatus] = useState<'pending' | 'refunded' | 'released'>('pending');

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '430px',
        margin: '0 auto',
        minHeight: '844px',
        background: '#0B1120',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <MobileStatusBar dark />

      {/* Header */}
      <div style={{ padding: '8px 20px 14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UniHiveLogo size={38} variant="white" />
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                Uni <span style={{ color: '#F59E0B' }}>Hive</span> Admin
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>
                RUN Campus Operations
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '9999px',
            }}
          >
            Live Escrow
          </div>
        </div>

        {/* Campus Dropdown */}
        <div
          style={{
            background: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            fontWeight: 700,
            color: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800 }}>CAMPUS:</span>
            <span>Redeemer's Univ (Ede)</span>
          </div>
          <ChevronDown size={14} color="#94A3B8" />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 30px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* 4 KPI Grid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {/* Escrow Vault */}
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #A855F7',
              borderRadius: '18px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#C084FC', letterSpacing: '0.4px', marginBottom: '4px' }}>
              ESCROW VAULT
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
              ₦1,428,500
            </div>
            <div style={{ fontSize: '10px', color: '#C084FC', fontWeight: 600 }}>
              28 Orders Locked
            </div>
          </div>

          {/* Platform Rev */}
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #F59E0B',
              borderRadius: '18px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#FBBF24', letterSpacing: '0.4px', marginBottom: '4px' }}>
              PLATFORM REV
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
              ₦184,200
            </div>
            <div style={{ fontSize: '10px', color: '#FBBF24', fontWeight: 600 }}>
              1,842 Orders (₦100)
            </div>
          </div>

          {/* Online Couriers */}
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #10B981',
              borderRadius: '18px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#34D399', letterSpacing: '0.4px', marginBottom: '4px' }}>
              ONLINE COURIERS
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
              34 Runners
            </div>
            <div style={{ fontSize: '10px', color: '#34D399', fontWeight: 600 }}>
              14 Joshua • 12 Queen Esther
            </div>
          </div>

          {/* Active Stores */}
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #3B82F6',
              borderRadius: '18px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#60A5FA', letterSpacing: '0.4px', marginBottom: '4px' }}>
              ACTIVE STORES
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
              124 Stores
            </div>
            <div style={{ fontSize: '10px', color: '#60A5FA', fontWeight: 600 }}>
              482 Verified Items
            </div>
          </div>
        </div>

        {/* Priority Dispute Card */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1.5px solid #EF4444',
            borderRadius: '20px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontSize: '11px', fontWeight: 800 }}>
              <AlertTriangle size={14} color="#EF4444" />
              <span>PRIORITY DISPUTE</span>
            </div>
            <span
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
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
            #RUN-4812 • Air Jordan 4 (₦24,000)
          </div>

          <div style={{ fontSize: '11px', color: '#CBD5E1', lineHeight: 1.45, marginBottom: '14px' }}>
            Buyer at Joshua Hall desk refused delivery: "Box has size 41 instead of size 44 advertised."
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => setDisputeStatus('refunded')}
              style={{
                background: disputeStatus === 'refunded' ? '#991B1B' : '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {disputeStatus === 'refunded' ? '✓ Refunded' : 'Refund Buyer 100%'}
            </button>

            <button
              onClick={() => setDisputeStatus('released')}
              style={{
                background: disputeStatus === 'released' ? '#047857' : '#1E293B',
                color: '#FFFFFF',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {disputeStatus === 'released' ? '✓ Released' : 'Release to Vendor'}
            </button>
          </div>
        </div>

        {/* Active Dispatches */}
        <div
          style={{
            background: '#0F172A',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid #1E293B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
              Active Dispatches
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B' }}>
              4 Live In-Transit
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Row 1 */}
            <div
              style={{
                background: '#1E293B',
                borderRadius: '14px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>
                  #RUN-4829 • Nike AF1
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                  To: Queen Esther Porter Desk
                </div>
              </div>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#FBBF24',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                Waiting PIN
              </span>
            </div>

            {/* Row 2 */}
            <div
              style={{
                background: '#1E293B',
                borderRadius: '14px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>
                  #RUN-4830 • Oraimo Charger
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                  To: Joshua Hall
                </div>
              </div>
              <span
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#60A5FA',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                In Transit
              </span>
            </div>
          </div>
        </div>

        {/* Contracted Logistics Fleet */}
        <div
          style={{
            background: '#0F172A',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid #1E293B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
              Contracted Logistics Fleet
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981' }}>
              SwiftDrop Active
            </span>
          </div>

          <div
            style={{
              background: '#1E293B',
              borderRadius: '14px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>SwiftDrop Campus Fleet</div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>34 Runners • All 7 Hostels Covered</div>
            </div>

            <div
              onClick={() => onNavigate('10_admin_desktop')}
              style={{
                background: '#10B981',
                color: '#0B1120',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Fleet Hub →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
