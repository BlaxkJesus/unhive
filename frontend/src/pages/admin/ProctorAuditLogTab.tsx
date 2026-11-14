import React, { useState, useEffect } from 'react';
import { API, API_BASE_URL } from '../../config/api';
import { Download, RefreshCw } from 'lucide-react';

interface ProctorAuditLogTabProps {
  token: string;
  onAlert: (msg: string) => void;
}

export const ProctorAuditLogTab: React.FC<ProctorAuditLogTabProps> = ({ token, onAlert }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.getAuditLogs(token, {
        actionType: actionFilter,
        search: searchQuery || undefined,
      });
      if (res?.data) {
        setLogs(res.data);
      }
    } catch (err: any) {
      onAlert(`❌ Failed to load audit trail: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [token, actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  const handleExportCSV = () => {
    const sp = new URLSearchParams();
    if (actionFilter !== 'all') sp.append('actionType', actionFilter);
    if (searchQuery) sp.append('search', searchQuery);
    const qs = sp.toString();
    const url = `${API_BASE_URL}/admin/audit-logs/export-csv${qs ? `?${qs}` : ''}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `proctor-security-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onAlert('✓ Chief Proctor security audit CSV exported.');
      })
      .catch((err) => onAlert(`❌ Export failed: ${err.message}`));
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'DISPUTE_VERDICT':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#FCA5A5', border: '#EF4444' };
      case 'VENDOR_SUSPENDED':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: '#DC2626' };
      case 'VENDOR_REINSTATED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: '#10B981' };
      case 'COURIER_PROVISIONED':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: '#3B82F6' };
      case 'CAMPUS_POLICY_UPDATED':
      case 'CURFEW_OVERRIDE_TOGGLED':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#FCD34D', border: '#F59E0B' };
      case 'BURSARY_BATCH_RECONCILED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: '#059669' };
      default:
        return { bg: '#1E293B', text: '#94A3B8', border: '#334155' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Chief Proctor Security & Disciplinary Audit Trail
          </h2>
          <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: '4px 0 0' }}>
            Immutable, timestamped record of administrative verdicts, store suspensions, and security overrides
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              background: '#3B82F6',
              border: 'none',
              borderRadius: '10px',
              padding: '9px 16px',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={15} />
            <span>Export Audit Log CSV</span>
          </button>
          <button
            onClick={loadLogs}
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
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Actions' },
            { id: 'DISPUTE_VERDICT', label: 'Disputes' },
            { id: 'VENDOR_SUSPENDED', label: 'Suspensions' },
            { id: 'VENDOR_REINSTATED', label: 'Reinstatements' },
            { id: 'COURIER_PROVISIONED', label: 'Couriers' },
            { id: 'CAMPUS_POLICY_UPDATED', label: 'Policies' },
            { id: 'BURSARY_BATCH_RECONCILED', label: 'Bursary' },
          ].map((cat) => {
            const active = actionFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActionFilter(cat.id)}
                style={{
                  background: active ? '#1E293B' : '#11192C',
                  border: active ? '1.5px solid #F59E0B' : '1px solid #1E293B',
                  color: active ? '#FFFFFF' : '#94A3B8',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search order #, store, or proctor notes..."
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
          <button
            type="submit"
            style={{
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#F8FAFC',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Audit Log Chronological Feed */}
      <div
        style={{
          background: '#11192C',
          border: '1px solid #1E293B',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748B', fontSize: '13px' }}>
            No security audit records found for the selected category.
          </div>
        ) : (
          logs.map((log) => {
            const style = getActionColor(log.actionType);
            return (
              <div
                key={log.id}
                style={{
                  background: '#0F172A',
                  border: '1px solid #1E293B',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: style.bg,
                        color: style.text,
                        border: `1px solid ${style.border}`,
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.4px',
                      }}
                    >
                      {log.actionType.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>
                      Proctor: <strong style={{ color: '#F8FAFC' }}>{log.proctorName}</strong>
                    </span>
                    {log.targetId && (
                      <span
                        style={{
                          background: '#1E293B',
                          color: '#CBD5E1',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {log.targetId}
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                  {log.summary}
                </div>

                {log.details && (
                  <div
                    style={{
                      background: '#162035',
                      borderLeft: '3px solid #3B82F6',
                      borderRadius: '0 8px 8px 0',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: '#CBD5E1',
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                    }}
                  >
                    "{log.details}"
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
