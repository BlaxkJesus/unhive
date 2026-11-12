import React, { useState } from 'react';
import { CreditCard, Building2, Smartphone, ShieldCheck, X, CheckCircle2, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { API } from '../../config/api';

interface PaystackDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerEmail: string;
  reference: string;
  onSuccess: (data: { reference: string; channel: string }) => void;
}

export const PaystackDemoModal: React.FC<PaystackDemoModalProps> = ({
  isOpen,
  onClose,
  amount,
  customerEmail,
  reference,
  onSuccess,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'card' | 'transfer' | 'opay'>('card');
  const [cardNumber, setCardNumber] = useState('4084 0840 8408 4084');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('408');
  const [cardPin, setCardPin] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFillTestCard = () => {
    setCardNumber('4084 0840 8408 4084');
    setCardExpiry('12/28');
    setCardCvv('408');
    setCardPin('1234');
    setError(null);
  };

  const handlePay = async () => {
    setError(null);
    setIsProcessing(true);
    setProcessingStage('Connecting to Paystack Sandbox...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setProcessingStage('Authorizing with Central Bank Interswitch Switch...');

      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingStage('Locking funds in UniHive Zero-Trust Escrow Vault...');

      // Call backend demo Paystack checkout to lock escrow atomically
      const res = await API.demoPaystackCheckout(reference, selectedChannel);

      if (res && res.success) {
        setIsSuccess(true);
        setProcessingStage('Payment Approved! Dual-Escrow Lock Secured.');

        await new Promise((resolve) => setTimeout(resolve, 900));
        setIsProcessing(false);
        onSuccess({ reference, channel: selectedChannel });
      } else {
        throw new Error(res?.message || 'Payment simulation failed');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || 'Payment processing failed. Please retry.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 16, 35, 0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 195, 247, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Paystack Official Branded Header */}
        <div
          style={{
            background: '#0A1023',
            color: '#FFFFFF',
            padding: '20px 24px',
            position: 'relative',
            borderBottom: '2px solid #00C3F7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Paystack Logo Glyph */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#00C3F7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A1023',
                  fontWeight: 900,
                  fontSize: '18px',
                  boxShadow: '0 2px 8px rgba(0, 195, 247, 0.4)',
                }}
              >
                P
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px', color: '#FFFFFF' }}>
                  PAYSTACK <span style={{ color: '#00C3F7', fontWeight: 700 }}>CHECKOUT</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  UniHive Escrow Vault • RUN Ede Hub
                </div>
              </div>
            </div>

            {/* Test Mode Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid #F59E0B',
                  color: '#FBBF24',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  letterSpacing: '0.4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>⚡</span>
                <span>DEMO TEST MODE</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  color: '#CBD5E1',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Amount & Account Banner */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>TOTAL AMOUNT</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                ₦{amount.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>CUSTOMER</div>
              <div style={{ fontSize: '12px', color: '#38BDF8', fontWeight: 700 }}>
                {customerEmail || 'buyer@run.edu.ng'}
              </div>
            </div>
          </div>
        </div>

        {/* Channels Selector & Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: '320px' }}>
          {/* Channel Tabs Sidebar */}
          <div
            style={{
              width: '130px',
              backgroundColor: '#F8FAFC',
              borderRight: '1px solid #E2E8F0',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {[
              { id: 'card', label: 'Card', icon: CreditCard },
              { id: 'transfer', label: 'Transfer', icon: Building2 },
              { id: 'opay', label: 'OPay', icon: Smartphone },
            ].map((tab) => {
              const active = selectedChannel === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedChannel(tab.id as any);
                    setError(null);
                  }}
                  disabled={isProcessing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: active ? '#0A1023' : 'transparent',
                    color: active ? '#FFFFFF' : '#475569',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={15} color={active ? '#00C3F7' : '#64748B'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div style={{ marginTop: 'auto', padding: '8px 4px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '10px', color: '#10B981', fontWeight: 700 }}>
                <ShieldCheck size={12} />
                <span>Secured</span>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
            {/* CARD CHANNEL */}
            {selectedChannel === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                    ENTER CARD DETAILS
                  </span>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    style={{
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#2563EB',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Sparkles size={11} />
                    <span>Auto-Fill Test Card</span>
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>
                    CARD NUMBER
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4084 0840 8408 4084"
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      EXPIRY
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      disabled={isProcessing}
                      style={{
                        width: '100%',
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'center',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      disabled={isProcessing}
                      style={{
                        width: '100%',
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'center',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      PIN
                    </label>
                    <input
                      type="password"
                      value={cardPin}
                      onChange={(e) => setCardPin(e.target.value)}
                      placeholder="••••"
                      maxLength={4}
                      disabled={isProcessing}
                      style={{
                        width: '100%',
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'center',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '11px',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Lock size={12} color="#16A34A" />
                  <span>Held in Escrow until ground-floor porter inspection handshake.</span>
                </div>
              </div>
            )}

            {/* TRANSFER CHANNEL */}
            {selectedChannel === 'transfer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                  BANK TRANSFER (PAYSTACK VIRTUAL ACCOUNT)
                </span>
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748B' }}>Bank:</span>
                    <strong style={{ color: '#0F172A' }}>Wema Bank / Paystack Titan</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748B' }}>Account Number:</span>
                    <strong style={{ color: '#0284C7', fontSize: '14px', letterSpacing: '1px' }}>9928374610</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748B' }}>Beneficiary:</span>
                    <strong style={{ color: '#0F172A' }}>UniHive Escrow - RUN</strong>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                  In demo mode, clicking the button below will immediately simulate receipt of your bank transfer.
                </div>
              </div>
            )}

            {/* OPAY CHANNEL */}
            {selectedChannel === 'opay' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                  INSTANT OPAY WALLET CHECKOUT
                </span>
                <div
                  style={{
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 800,
                    }}
                  >
                    O
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#065F46' }}>
                      OPay Digital Services
                    </div>
                    <div style={{ fontSize: '11px', color: '#047857' }}>
                      Instant Direct Wallet Debit (0812 345 0001)
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                  Charges your OPay student wallet balance and moves ₦{amount.toLocaleString()} into UniHive Escrow Vault.
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  color: '#DC2626',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {/* Processing Overlay inside Content */}
            {isProcessing && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#0A1023',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {isSuccess ? (
                  <CheckCircle2 size={18} color="#10B981" />
                ) : (
                  <Loader2 size={18} color="#00C3F7" className="animate-spin" />
                )}
                <span style={{ color: isSuccess ? '#34D399' : '#00C3F7' }}>{processingStage}</span>
              </div>
            )}

            {/* Pay Button */}
            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isSuccess
                    ? '#10B981'
                    : '#0284C7',
                  color: '#0A1023',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0, 195, 247, 0.35)',
                  transition: 'all 0.15s ease',
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing Demo Payment...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={16} color="#0A1023" />
                    <span>Payment Confirmed!</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>
                      Pay ₦{amount.toLocaleString()}{' '}
                      {selectedChannel === 'transfer' ? '(Simulate Transfer)' : ''}
                    </span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#F1F5F9',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: '#64748B',
          }}
        >
          <span>🔒 256-bit SSL Escrow Protection</span>
          <span>Paystack Demo Gateway • Reference: {reference}</span>
        </div>
      </div>
    </div>
  );
};
