import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { Sun, Moon, Bell, Search } from 'lucide-react';

export default function Header({ title, subtitle }) {
    const { theme, toggle } = useTheme();
    const { user } = useAuth();
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const ref = useRef();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.get('/notifications?limit=20');
                setNotifications(data);
                setUnread(data.filter(n => n.status !== 'read').length);
            } catch {
                // Fallback demo notifications
                setNotifications([
                    { notification_id: 1, subject: 'Welcome to HRMS', type: 'system', status: 'unread', sent_at: new Date().toISOString() },
                    { notification_id: 2, subject: 'Leave request approved', type: 'leave', status: 'unread', sent_at: new Date().toISOString() },
                    { notification_id: 3, subject: 'Payroll processed for January', type: 'payroll', status: 'read', sent_at: new Date(Date.now() - 86400000).toISOString() },
                ]);
                setUnread(2);
            }
        };
        load();
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setNotifOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
        setUnread(0);
    };

    const timeAgo = (dt) => {
        const mins = Math.floor((Date.now() - new Date(dt)) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
        return `${Math.floor(mins / 1440)}d ago`;
    };

    return (
        <header className="header">
            <div className="header-left">
                <div>
                    <h2>{title}</h2>
                    {subtitle && <span className="header-breadcrumb">{subtitle}</span>}
                </div>
            </div>
            <div className="header-right">
                <div className="notif-wrapper" ref={ref}>
                    <button className="header-btn" onClick={() => setNotifOpen(!notifOpen)} title="Notifications">
                        <Bell size={16} />
                        {unread > 0 && <span className="notif-badge" />}
                    </button>

                    {notifOpen && (
                        <div className="notif-dropdown">
                            <div className="notif-dropdown-header">
                                <h4>Notifications</h4>
                                {unread > 0 && <span style={{ cursor: 'pointer' }} onClick={markAllRead}>Mark all read</span>}
                            </div>
                            {notifications.length === 0 ? (
                                <div className="notif-empty">No notifications</div>
                            ) : (
                                notifications.map(n => (
                                    <div className="notif-item" key={n.notification_id}>
                                        <span className={`notif-dot ${n.status === 'read' ? 'read' : ''}`} />
                                        <div className="notif-content">
                                            <p>{n.subject}</p>
                                            <span>{timeAgo(n.sent_at)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <button className="header-btn" onClick={toggle} title="Toggle theme">
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </button>
            </div>
        </header>
    );
}
