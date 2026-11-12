import React, { useState } from 'react';
import {
  Smartphone,
  Copy,
  Check,
  X,
  Wifi,
  ShieldCheck,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface MobileLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleMobilePreview?: () => void;
}

export const MobileLinkModal: React.FC<MobileLinkModalProps> = ({
  isOpen,
  onClose,
  onToggleMobilePreview,
}) => {
  const [copied, setCopied] = useState(false);
  const [linkMode, setLinkMode] = useState<'public' | 'wifi'>('public');

  if (!isOpen) return null;

  // The active public tunnel URL (works across any cellular data / network)
  const publicTunnelUrl = 'https://aa0894d9764d93.lhr.life';

  // The active LAN IP address of this machine on the local Wi-Fi network
  const lanIp = '10.86.67.215';
  const port = '3000';
  const localWifiUrl = `http://${lanIp}:${port}`;

  const mobileUrl = linkMode === 'public' ? publicTunnelUrl : localWifiUrl;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    mobileUrl
  )}&color=0F2B5C&bgcolor=FFFFFF&margin=8`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '480px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 43, 92, 0.35)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient badge */}
        <div
          style={{
            padding: '24px 24px 18px 24px',
            background: '#0F2B5C',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F2B5C',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Smartphone size={22} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.3px' }}>
                Open UniHive™ on Your Phone
              </div>
              <div style={{ fontSize: '11px', color: '#93C5FD', fontWeight: 600 }}>
                Live Local Network Access (Wi-Fi)
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <Wifi size={12} />
            <span>Connected to Local Wi-Fi Network</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: '#F1F5F9',
              padding: '4px',
              borderRadius: '12px',
              gap: '4px',
            }}
          >
            <button
              onClick={() => setLinkMode('public')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: linkMode === 'public' ? '#0F2B5C' : 'transparent',
                color: linkMode === 'public' ? '#FFFFFF' : '#475569',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🌐 Public Cloud Link (Any Phone)
            </button>
            <button
              onClick={() => setLinkMode('wifi')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: linkMode === 'wifi' ? '#0F2B5C' : 'transparent',
                color: linkMode === 'wifi' ? '#FFFFFF' : '#475569',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              📶 Same Wi-Fi (LAN)
            </button>
          </div>

          {/* QR Code Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: '#F8FAFC',
              border: '1.5px dashed #CBD5E1',
              borderRadius: '20px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                padding: '12px',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                marginBottom: '12px',
                border: '1px solid #E2E8F0',
                display: 'inline-block',
              }}
            >
              <img
                src={qrCodeUrl}
                alt="UniHive Mobile QR Code"
                width={190}
                height={190}
                style={{
                  display: 'block',
                  borderRadius: '8px',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F2B5C', fontWeight: 800, fontSize: '13px' }}>
              <QrCode size={15} color="#F59E0B" />
              <span>Point Phone Camera at QR Code</span>
            </div>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '4px 0 0 0', maxWidth: '280px' }}>
              Your phone camera will automatically detect the link and open the UniHive PWA directly.
            </p>
          </div>

          {/* Direct URL Box */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '6px' }}>
              Direct Mobile Link (Type in Phone Browser)
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#F1F5F9',
                padding: '8px 10px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
              }}
            >
              <div
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0F2B5C',
                  userSelect: 'all',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {mobileUrl}
              </div>

              <button
                onClick={handleCopy}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: copied ? '#059669' : '#0F2B5C',
                  color: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Quick Steps Instructions */}
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '14px',
              padding: '12px 14px',
              fontSize: '11.5px',
              color: '#1E40AF',
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={14} color="#2563EB" />
              <span>Easy 3-Step Setup:</span>
            </div>
            <ol style={{ margin: 0, paddingLeft: '18px' }}>
              <li>
                {linkMode === 'public'
                  ? 'Works anywhere on cellular data (MTN, Airtel, etc.) or any Wi-Fi.'
                  : 'Ensure your phone is connected to the same Wi-Fi router.'}
              </li>
              <li>
                Scan the QR code or visit{' '}
                <strong style={{ color: '#0F2B5C', wordBreak: 'break-all' }}>{mobileUrl}</strong> in Safari or Chrome.
              </li>
              <li>Tap any role persona (Buyer, Vendor, Courier) for instant 1-tap testing!</li>
            </ol>
          </div>

          {/* PC Mobile Preview Alternative Button */}
          {onToggleMobilePreview && (
            <button
              onClick={() => {
                onToggleMobilePreview();
                onClose();
              }}
              style={{
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={14} color="#F59E0B" />
              <span>Or Toggle Mobile Phone Screen Preview on this PC</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
