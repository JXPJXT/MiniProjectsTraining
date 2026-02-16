'use client';

import { useState, useEffect } from 'react';
import { notificationsAPI } from '@/lib/api';
import { HiOutlineCheckCircle } from 'react-icons/hi';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadNotifications(); }, []);

    const loadNotifications = async () => {
        try {
            const res = await notificationsAPI.list({ limit: 100 });
            setNotifications(res.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const markRead = async (id: number) => {
        try {
            await notificationsAPI.markRead(id);
            loadNotifications();
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            loadNotifications();
        } catch (err) { console.error(err); }
    };

    const getTypeIcon = (type: string) => {
        const map: Record<string, string> = {
            drive_registration: '📋',
            selection_result: '🎉',
            document_verification: '📄',
            new_message: '💬',
            broadcast: '📢',
        };
        return map[type] || '🔔';
    };

    const getTypeColor = (type: string) => {
        const map: Record<string, string> = {
            drive_registration: 'var(--primary-500)',
            selection_result: 'var(--accent-500)',
            document_verification: 'var(--warning-500)',
            new_message: 'var(--primary-400)',
            broadcast: 'var(--danger-500)',
        };
        return map[type] || 'var(--primary-500)';
    };

    return (
        <>
            <div className="top-bar">
                <h1 className="top-bar-title">Notifications</h1>
                <div className="top-bar-actions">
                    <button className="btn btn-ghost" onClick={markAllRead}>
                        <HiOutlineCheckCircle /> Mark All Read
                    </button>
                </div>
            </div>
            <div className="page-content">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔔</div>
                        <h3 className="empty-state-title">No Notifications</h3>
                        <p className="empty-state-text">You&apos;re all caught up!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {notifications.map((n: any) => (
                            <div
                                key={n.id}
                                className="card"
                                onClick={() => !n.read && markRead(n.id)}
                                style={{
                                    cursor: n.read ? 'default' : 'pointer',
                                    opacity: n.read ? 0.7 : 1,
                                }}
                            >
                                <div className="card-body" style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                        <div style={{
                                            fontSize: 24,
                                            width: 44,
                                            height: 44,
                                            borderRadius: 'var(--radius-md)',
                                            background: `${getTypeColor(n.type)}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            {getTypeIcon(n.type)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span className={`badge ${n.read ? 'badge-neutral' : 'badge-primary'}`}>
                                                    {n.type.replace('_', ' ')}
                                                </span>
                                                {!n.read && <div className="notification-dot" style={{ position: 'static' }} />}
                                            </div>
                                            <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                                                {n.payload?.message || 'New notification'}
                                            </p>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                {new Date(n.created_at).toLocaleString()}
                                            </span>
                                        </div>
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
