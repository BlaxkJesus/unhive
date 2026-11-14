import React, { useState, useEffect } from 'react';
import { API } from '../../config/api';
import { ShieldCheck, Clock, Save, AlertTriangle, RefreshCw } from 'lucide-react';

interface CampusRulesTabProps {
  campusId: string;
  token: string;
  onAlert: (msg: string) => void;
}

export const CampusRulesTab: React.FC<CampusRulesTabProps> = ({ campusId, token, onAlert }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState<any>({
    curfewHourStart: 21,
    curfewMinuteStart: 0,
    curfewHourEnd: 8,
    curfewSundayHourEnd: 10,
    isCurfewActiveOverride: false,
    porterLodgeOnly: true,
    baseCourierFee: 250,
    platformTechFee: 100,
    noticeMessage: 'Deliveries close at 9:00 PM daily. Resumes 8:00 AM (10:00 AM Sundays) at porter lodges.',
  });
  const [curfewStatus, setCurfewStatus] = useState<any>(null);

  const loadPolicy = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.getCampusPolicy(campusId, token);
      if (res?.data) {
        setPolicy(res.data.policy);
        setCurfewStatus(res.data.curfewStatus);
      }
    } catch (err: any) {
      console.warn('Could not load campus policy', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicy();
  }, [campusId, token]);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const res = await API.updateCampusPolicy(campusId, policy, token);
      if (res?.data) {
        setPolicy(res.data);
        onAlert('✓ Campus delivery policy and curfew rules updated & deployed to fleet.');
        const curfewRes = await API.getPublicCurfewStatus(campusId);
        if (curfewRes?.data) setCurfewStatus(curfewRes.data);
      }
    } catch (err: any) {
      onAlert(`❌ Failed to update policy: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEmergencyLockdown = async () => {
    if (!token) return;
    const newOverride = !policy.isCurfewActiveOverride;
    try {
      const res = await API.toggleCurfewOverride(campusId, newOverride, token);
      if (res?.data) {
        setCurfewStatus(res.data);
        setPolicy((prev: any) => ({ ...prev, isCurfewActiveOverride: newOverride }));
        onAlert(
          newOverride
            ? '🚨 Emergency Proctor Lockdown ACTIVATED: All cross-hall delivery dispatch locked!'
            : '✓ Emergency Proctor Lockdown RELEASED: Standard curfew schedule restored.'
        );
      }
    } catch (err: any) {
      onAlert(`❌ Lockdown toggle failed: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Live Curfew Status Banner */}
      <div
        style={{
          background: curfewStatus?.isCurfewActive
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.25))'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.2))',
          border: curfewStatus?.isCurfewActive ? '1.5px solid #EF4444' : '1.5px solid #10B981',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: curfewStatus?.isCurfewActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              {curfewStatus?.isCurfewActive ? '🌙' : '☀️'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: curfewStatus?.isCurfewActive ? '#EF4444' : '#10B981',
                    color: '#FFFFFF',
                  }}
                >
                  {curfewStatus?.isCurfewActive ? 'Curfew Active (Dispatch Paused)' : 'Deliveries Open'}
                </span>
                {policy.isCurfewActiveOverride && (
                  <span
                    style={{
                      background: '#7F1D1D',
                      color: '#FCA5A5',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #EF4444',
                    }}
                  >
                    EMERGENCY LOCKDOWN OVERRIDE
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 0' }}>
                {curfewStatus?.curfewReason || 'Campus Delivery Window Status'}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleToggleEmergencyLockdown}
              style={{
                background: policy.isCurfewActiveOverride ? '#10B981' : '#EF4444',
                border: 'none',
                borderRadius: '10px',
                padding: '9px 16px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertTriangle size={14} />
              <span>
                {policy.isCurfewActiveOverride ? 'Release Lockdown' : 'Force Emergency Lockdown'}
              </span>
            </button>
            <button
              onClick={loadPolicy}
              disabled={loading}
              style={{
                background: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '9px 12px',
                color: '#94A3B8',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#0F172A', borderRadius: '10px', padding: '12px 14px', border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>NIGHT CURFEW START</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FCD34D', marginTop: '2px' }}>
              {policy.curfewHourStart}:00 PM (21:00)
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>Cross-hall dispatch cutoff</div>
          </div>
          <div style={{ background: '#0F172A', borderRadius: '10px', padding: '12px 14px', border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>WEEKDAY RESUMPTION</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#34D399', marginTop: '2px' }}>
              {policy.curfewHourEnd}:00 AM (Mon - Sat)
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>Morning dispatch window opens</div>
          </div>
          <div style={{ background: '#0F172A', borderRadius: '10px', padding: '12px 14px', border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>SUNDAY RESUMPTION</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#60A5FA', marginTop: '2px' }}>
              {policy.curfewSundayHourEnd}:00 AM (Sundays)
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>Post-chapel service hours</div>
          </div>
          <div style={{ background: '#0F172A', borderRadius: '10px', padding: '12px 14px', border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>NEXT WINDOW TRANSITION</div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {curfewStatus?.resumesAtText || '9:00 PM Tonight'}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>Scheduled status change</div>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form
        onSubmit={handleSavePolicy}
        style={{
          background: '#11192C',
          border: '1px solid #1E293B',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1E293B', paddingBottom: '14px' }}>
          <Clock size={18} color="#F59E0B" />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Campus Delivery Curfew & Residence Hall Policies
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
              CURFEW START TIME (EVENING CUTOFF)
            </label>
            <select
              value={policy.curfewHourStart}
              onChange={(e) => setPolicy({ ...policy, curfewHourStart: Number(e.target.value) })}
              style={{
                width: '100%',
                background: '#162035',
                border: '1px solid #23314E',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value={20}>8:00 PM (20:00)</option>
              <option value={21}>9:00 PM (21:00) — Standard Campus Curfew</option>
              <option value={22}>10:00 PM (22:00)</option>
            </select>
            <span style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px', display: 'block' }}>
              At this hour, buyers are informed deliveries will resume in the morning and couriers cannot accept jobs.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
              WEEKDAY RESUMPTION HOUR (MON - SAT)
            </label>
            <select
              value={policy.curfewHourEnd}
              onChange={(e) => setPolicy({ ...policy, curfewHourEnd: Number(e.target.value) })}
              style={{
                width: '100%',
                background: '#162035',
                border: '1px solid #23314E',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value={7}>7:00 AM (07:00)</option>
              <option value={8}>8:00 AM (08:00) — Standard Morning Window</option>
              <option value={9}>9:00 AM (09:00)</option>
            </select>
            <span style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px', display: 'block' }}>
              Morning hour when runner dispatch unfreezes and orders are delivered.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
              SUNDAY RESUMPTION HOUR (POST-CHAPEL)
            </label>
            <select
              value={policy.curfewSundayHourEnd}
              onChange={(e) => setPolicy({ ...policy, curfewSundayHourEnd: Number(e.target.value) })}
              style={{
                width: '100%',
                background: '#162035',
                border: '1px solid #23314E',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value={9}>9:00 AM (09:00)</option>
              <option value={10}>10:00 AM (10:00) — Sunday Worship Clearance</option>
              <option value={11}>11:00 AM (11:00)</option>
              <option value={12}>12:00 PM (12:00)</option>
            </select>
            <span style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px', display: 'block' }}>
              Dispatches pause Sunday mornings to respect campus religious and chapel services.
            </span>
          </div>
        </div>

        {/* Hostel Drop-off Policy Toggle */}
        <div
          style={{
            background: '#162035',
            border: '1px solid #23314E',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#10B981" />
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                Zero-Room-Entry Policy (Ground-Floor Porter Lodge Desk Only)
              </span>
            </div>
            <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '4px 0 0', lineHeight: 1.4 }}>
              Mandates that student runners drop orders exclusively at the hall porter lodge desk. Runners never enter student room blocks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPolicy({ ...policy, porterLodgeOnly: !policy.porterLodgeOnly })}
            style={{
              background: policy.porterLodgeOnly ? '#10B981' : '#334155',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              color: policy.porterLodgeOnly ? '#0B1120' : '#CBD5E1',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {policy.porterLodgeOnly ? 'Enforced (Active)' : 'Doorstep Permitted'}
          </button>
        </div>

        {/* Financial Fee Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
              BASE COURIER RUNNER ALLOWANCE (₦)
            </label>
            <input
              type="number"
              min={100}
              step={50}
              value={policy.baseCourierFee}
              onChange={(e) => setPolicy({ ...policy, baseCourierFee: Number(e.target.value) })}
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
              Standard allowance paid to student courier upon PIN release (Default: ₦250).
            </span>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
              ESCROW PLATFORM TECH FEE (₦)
            </label>
            <input
              type="number"
              min={50}
              step={25}
              value={policy.platformTechFee}
              onChange={(e) => setPolicy({ ...policy, platformTechFee: Number(e.target.value) })}
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
              Retained platform fee covering SMS/OTP and Paystack escrow operations (Default: ₦100).
            </span>
          </div>
        </div>

        {/* Notice Message */}
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
            CAMPUS NIGHT CURFEW BROADCAST BANNER
          </label>
          <input
            type="text"
            value={policy.noticeMessage || ''}
            onChange={(e) => setPolicy({ ...policy, noticeMessage: e.target.value })}
            placeholder="Deliveries close at 9:00 PM daily. Resumes 8:00 AM (10:00 AM Sundays)."
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: '#10B981',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              color: '#0B1120',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Deploy Policy to Campus Fleet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
