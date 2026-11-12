import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Check, ShoppingBag, Store, Bike } from 'lucide-react';
import { MobileStatusBar } from '../components/common/MobileStatusBar';

interface SignupRoleSelectionProps {
  onNavigate: (screenId: string) => void;
}

export const SignupRoleSelection: React.FC<SignupRoleSelectionProps> = ({ onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'vendor'>('buyer');
  const [name, setName] = useState('Amaka Okafor');
  const [phone, setPhone] = useState('0814 382 9102');
  const [email, setEmail] = useState('amaka.okafor@run.edu.ng');
  const [matric, setMatric] = useState('RUN/IFT/22/13182');
  const [room, setRoom] = useState('Room 204');
  const [hall, setHall] = useState('Queen Esther Hall (Female)');

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '430px',
        margin: '0 auto',
        minHeight: '844px',
        background: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <MobileStatusBar />

      {/* Top Nav */}
      <div
        style={{
          padding: '8px 20px 12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => onNavigate('08_login')}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} color="#0F2B5C" />
        </button>

        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F2B5C' }}>
          Redeemer's University (RUN) Registration
        </div>

        <div
          onClick={() => onNavigate('01_home')}
          style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB', cursor: 'pointer' }}
        >
          Explore
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 30px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Title Section */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', letterSpacing: '0.5px', marginBottom: '4px' }}>
            JOIN UNIHIVE NETWORK
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F2B5C', marginBottom: '4px' }}>
            Create Your Campus Account
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
            Select your primary role below. You can easily switch or add roles anytime.
          </div>
        </div>

        {/* Campus Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 800, color: '#2563EB', letterSpacing: '0.4px', marginBottom: '8px' }}>
            <span>🎓</span>
            <span>SELECT UNIVERSITY CAMPUS</span>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏛️</span>
              <span>Redeemer's University (RUN), Ede</span>
            </div>
            <ChevronDown size={14} color="#64748B" />
          </div>

          <div style={{ fontSize: '11px', color: '#64748B' }}>
            Hostels and student couriers will be scoped to this campus.
          </div>
        </div>

        {/* Step 1: Basic Info */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#0F2B5C',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              1
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.4px' }}>
              BASIC STUDENT PROFILE INFO
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.3px', marginBottom: '4px' }}>
                FULL LEGAL NAME
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.3px', marginBottom: '4px' }}>
                  RUN INSTITUTIONAL EMAIL
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@run.edu.ng"
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.3px', marginBottom: '4px' }}>
                  RUN MATRIC NO.
                </div>
                <input
                  type="text"
                  value={matric}
                  onChange={(e) => setMatric(e.target.value)}
                  placeholder="RUN/IFT/22/13182"
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.3px', marginBottom: '4px' }}>
                  WHATSAPP PHONE
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.3px', marginBottom: '4px' }}>
                  ROOM NO.
                </div>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.3px', marginBottom: '4px' }}>
                RUN HALL OF RESIDENCE
              </div>
              <select
                value={hall}
                onChange={(e) => setHall(e.target.value)}
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <optgroup label="Female Halls">
                  <option value="Queen Esther Hall (Female)">Queen Esther Hall (Female)</option>
                  <option value="Deborah Hall (Female)">Deborah Hall (Female)</option>
                  <option value="Guest House (Female)">Guest House (Female)</option>
                  <option value="Dorcas Hall (Female)">Dorcas Hall (Female)</option>
                </optgroup>
                <optgroup label="Male Halls">
                  <option value="Prophet Moses Hall (Male)">Prophet Moses Hall (Male)</option>
                  <option value="Joshua Hall (Male)">Joshua Hall (Male)</option>
                  <option value="Peter Hostel (Male)">Peter Hostel (Male)</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Choose Primary Role */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#0F2B5C',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                2
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.4px' }}>
                CHOOSE PRIMARY ROLE ON CAMPUS
              </span>
            </div>

            <span
              style={{
                background: '#ECFDF5',
                color: '#059669',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              Multi-role active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Role 1: Student Buyer */}
            <div
              onClick={() => setSelectedRole('buyer')}
              style={{
                border: selectedRole === 'buyer' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                background: selectedRole === 'buyer' ? '#EFF6FF' : '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: '#1D4ED8',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShoppingBag size={20} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Student Customer / Buyer</span>
                  <span
                    style={{
                      background: '#DBEAFE',
                      color: '#1D4ED8',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Instant Entry
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                  Browse & buy items safely. Paystack escrow holds money until you inspect at the Porter's Lodge.
                </div>
              </div>

              {selectedRole === 'buyer' && (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Role 2: Campus Merchant */}
            <div
              onClick={() => setSelectedRole('vendor')}
              style={{
                border: selectedRole === 'vendor' ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                background: selectedRole === 'vendor' ? '#FFFBEB' : '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: '#F59E0B',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Store size={20} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Campus Merchant / Vendor</span>
                  <span
                    style={{
                      background: '#FEF3C7',
                      color: '#D97706',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Direct Bank Auto-Payout
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                  Sell sneakers, thrift, buttery food or tech. Releases escrow directly to your bank upon 4-digit PIN verification.
                </div>
              </div>

              {selectedRole === 'vendor' && (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#F59E0B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Role 3: Contracted Logistics Fleet Info Card */}
            <div
              style={{
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: '#475569',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bike size={20} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Logistics Fleet (Contracted Partner)</span>
                  <span
                    style={{
                      background: '#E2E8F0',
                      color: '#475569',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Fleet Provided
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4, marginBottom: '6px' }}>
                  Courier operations are fulfilled by our contracted campus logistics partner. Individual student registration is closed; runner accounts are provisioned directly by logistics dispatch.
                </div>
                <div
                  onClick={() => onNavigate('08_login')}
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#2563EB',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Contracted Runner? Sign In to Dispatch ➔
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={() => {
            if (selectedRole === 'vendor') onNavigate('06_vendor');
            else onNavigate('01_home');
          }}
          style={{
            width: '100%',
            background: '#0F2B5C',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '16px',
            padding: '14px',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15, 43, 92, 0.25)',
          }}
        >
          Complete Registration →
        </button>
      </div>
    </div>
  );
};
