'use client';

import { useState, useEffect } from 'react';
import { auditAPI } from '@/lib/api';
import { HiOutlineSearch } from 'react-icons/hi';

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [entityFilter, setEntityFilter] = useState('');

    useEffect(() => { loadLogs(); }, [entityFilter]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const params: any = { limit: 100 };
            if (entityFilter) params.entity = entityFilter;
            const res = await auditAPI.logs(params);
            setLogs(res.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const actionColors: Record<string, string> = {
        create: 'var(--accent-500)',
        update: 'var(--warning-500)',
        delete: 'var(--danger-500)',
        verify: 'var(--primary-500)',
        review: 'var(--primary-400)',
    };

    const getActionColor = (action: string) => {
        for (const [key, color] of Object.entries(actionColors)) {
            if (action.includes(key)) return color;
        }
        return 'var(--primary-500)';
    };

    return (
        <>
            <div className="top-bar">
                <h1 className="top-bar-title">Audit Logs</h1>
            </div>
            <div className="page-content">
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <select className="form-select" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} style={{ width: 240 }}>
                        <option value="">All Entities</option>
                        <option value="users">Users</option>
                        <option value="students">Students</option>
                        <option value="placement_drives">Drives</option>
                        <option value="placement_profiles">Profiles</option>
                        <option value="student_drive_map">Registrations</option>
                        <option value="document_verifications">Verifications</option>
                        <option value="duty_leave_requests">Duty Leave</option>
                        <option value="independent_offers">Independent Offers</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3 className="empty-state-title">No Audit Logs</h3>
                        <p className="empty-state-text">No actions have been recorded yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {logs.map((log: any) => (
                            <div key={log.id} className="card">
                                <div className="card-body" style={{ padding: '14px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            background: getActionColor(log.action),
                                            flexShrink: 0,
                                        }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{log.action}</span>
                                                <span className="badge badge-neutral">{log.entity}</span>
                                                {log.entity_id && <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{log.entity_id}</span>}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                    Actor: {log.actor_id?.slice(0, 8)}...
                                                </span>
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                    {new Date(log.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        {(log.old_data || log.new_data) && (
                                            <details style={{ fontSize: 12 }}>
                                                <summary style={{ cursor: 'pointer', color: 'var(--primary-400)' }}>Details</summary>
                                                <div style={{ marginTop: 8, padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', maxHeight: 200, overflow: 'auto' }}>
                                                    {log.old_data && <div><strong>Before:</strong> <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>{JSON.stringify(log.old_data, null, 2)}</pre></div>}
                                                    {log.new_data && <div><strong>After:</strong> <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>{JSON.stringify(log.new_data, null, 2)}</pre></div>}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
