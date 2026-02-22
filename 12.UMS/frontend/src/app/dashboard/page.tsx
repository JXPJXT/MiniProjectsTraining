'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI, studentsAPI, drivesAPI, notificationsAPI } from '@/lib/api';
import {
    HiOutlineUserGroup,
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineCheckCircle,
    HiOutlineBell,
    HiOutlineTrendingUp,
    HiOutlineClipboardList,
    HiOutlineAcademicCap,
    HiOutlineClock,
} from 'react-icons/hi';

export default function DashboardPage() {
    const { user } = useAuth();
    const role = user?.role || 'student';

    const getDashboardTitle = () => {
        switch (role) {
            case 'admin':
            case 'super_admin': return 'Admin Dashboard';
            case 'tpc': return 'TPC Dashboard';
            case 'faculty': return 'Faculty Dashboard';
            default: return 'My Dashboard';
        }
    };

    const renderDashboard = () => {
        switch (role) {
            case 'admin':
            case 'super_admin':
            case 'tpc':
                return <AdminDashboard />;
            case 'faculty':
                return <FacultyDashboard />;
            default:
                return <StudentDashboard />;
        }
    };

    return (
        <>
            <div className="top-bar">
                <h1 className="top-bar-title">{getDashboardTitle()}</h1>
                <div className="top-bar-actions">
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Welcome, <strong style={{ color: 'var(--primary-400)' }}>{user?.email}</strong>
                        <span className="badge badge-primary" style={{ marginLeft: 8, fontSize: 10 }}>
                            {role.replace('_', ' ').toUpperCase()}
                        </span>
                    </span>
                </div>
            </div>
            <div className="page-content">
                {renderDashboard()}
            </div>
        </>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* ADMIN / TPC DASHBOARD                                     */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadDashboard(); }, []);

    const loadDashboard = async () => {
        try {
            const res = await adminAPI.dashboard();
            setStats(res.data);
        } catch (err) { console.error('Dashboard load error', err); }
        finally { setLoading(false); }
    };

    if (loading) return <LoadingState />;
    if (!stats) return <EmptyState text="Failed to load dashboard data" />;

    return (
        <div className="animate-in">
            <div className="stats-grid">
                <StatCard icon={<HiOutlineUserGroup />} label="Total Users" value={stats.user_stats?.total || 0} sub={`${stats.user_stats?.student || 0} students`} variant="primary" />
                <StatCard icon={<HiOutlineBriefcase />} label="Active Drives" value={stats.drive_stats?.open || 0} sub={`${stats.drive_stats?.total || 0} total`} variant="accent" />
                <StatCard icon={<HiOutlineDocumentText />} label="Pending Reviews" value={stats.document_stats?.pending || 0} sub={`${stats.document_stats?.approved || 0} approved`} variant="warning" />
                <StatCard icon={<HiOutlineCheckCircle />} label="Placed" value={stats.placement_stats?.selected || 0} sub={`${stats.placement_stats?.offers_accepted || 0} accepted`} variant="accent" />
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">📊 Placement Funnel</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <ProgressItem label="Registrations" value={stats.placement_stats?.registered || 0} max={stats.user_stats?.student || 1} color="var(--primary-500)" />
                            <ProgressItem label="Selected" value={stats.placement_stats?.selected || 0} max={stats.placement_stats?.registered || 1} color="var(--accent-500)" />
                            <ProgressItem label="Offers Accepted" value={stats.placement_stats?.offers_accepted || 0} max={stats.placement_stats?.selected || 1} color="var(--warning-500)" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">🕐 Recent Activity</h3>
                    </div>
                    <div className="card-body">
                        {(stats.recent_audit_logs || []).length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent activity</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {(stats.recent_audit_logs || []).slice(0, 6).map((log: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-glass)' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-500)', flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{log.action.replace(/_/g, ' ')}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.entity} • {new Date(log.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: 24 }}>
                <div className="card-header">
                    <h3 className="card-title">👥 User Distribution</h3>
                </div>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                        {Object.entries(stats.user_stats || {}).filter(([key]) => key !== 'total').map(([role, count]) => (
                            <div key={role} style={{ padding: '16px 12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>{count as number}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 4, letterSpacing: '0.5px' }}>{(role as string).replace('_', ' ')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* FACULTY DASHBOARD                                         */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function FacultyDashboard() {
    const [drives, setDrives] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadFacultyData(); }, []);

    const loadFacultyData = async () => {
        try {
            const [drivesRes, notifsRes] = await Promise.allSettled([
                drivesAPI.list({ status: 'open' }),
                notificationsAPI.list({ limit: 5, unread_only: true }),
            ]);
            if (drivesRes.status === 'fulfilled') setDrives(drivesRes.value.data?.data || []);
            if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="animate-in">
            <div className="stats-grid">
                <StatCard icon={<HiOutlineBriefcase />} label="Active Drives" value={drives.length} sub="Open for registration" variant="primary" />
                <StatCard icon={<HiOutlineBell />} label="Notifications" value={notifications.length} sub="Unread" variant="warning" />
                <StatCard icon={<HiOutlineAcademicCap />} label="Role" value="Faculty" sub="Duty leave approvals" variant="accent" />
                <StatCard icon={<HiOutlineClock />} label="Semester" value="Jan-May '26" sub="2025-26 Batch" variant="primary" />
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">🏢 Active Drives</h3>
                    </div>
                    <div className="card-body">
                        {drives.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No active drives currently</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {drives.slice(0, 6).map((drive: any) => (
                                    <DriveItem key={drive.drive_id} drive={drive} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">🔔 Notifications</h3>
                    </div>
                    <div className="card-body">
                        {notifications.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All caught up!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {notifications.map((n: any) => (
                                    <NotificationItem key={n.id} notification={n} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* STUDENT DASHBOARD                                         */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function StudentDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [completeness, setCompleteness] = useState<any>(null);
    const [drives, setDrives] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadStudentData(); }, []);

    const loadStudentData = async () => {
        try {
            const [profileRes, completenessRes, drivesRes, notifsRes] = await Promise.allSettled([
                studentsAPI.me(),
                studentsAPI.myCompleteness(),
                drivesAPI.eligible(),
                notificationsAPI.list({ limit: 5, unread_only: true }),
            ]);
            if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
            if (completenessRes.status === 'fulfilled') setCompleteness(completenessRes.value.data);
            if (drivesRes.status === 'fulfilled') setDrives(drivesRes.value.data?.data || []);
            if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="animate-in">
            <div className="stats-grid">
                <StatCard icon={<HiOutlineClipboardList />} label="Profile" value={`${completeness?.percentage || 0}%`} sub={`${completeness?.completed || 0}/${completeness?.total || 5} sections`} variant="primary" />
                <StatCard icon={<HiOutlineBriefcase />} label="Eligible Drives" value={drives.length} sub="Open now" variant="accent" />
                <StatCard icon={<HiOutlineBell />} label="Notifications" value={notifications.length} sub="Unread" variant="warning" />
                <StatCard icon={<HiOutlineTrendingUp />} label="CGPA" value={profile?.cgpa || 'N/A'} sub={profile?.stream || 'Update profile'} variant="primary" />
            </div>

            {completeness && completeness.percentage < 100 && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header">
                        <h3 className="card-title">📋 Complete Your Profile</h3>
                        <span className="badge badge-warning">{completeness.percentage}%</span>
                    </div>
                    <div className="card-body">
                        <div className="progress-bar" style={{ marginBottom: 16 }}>
                            <div className="progress-bar-fill" style={{ width: `${completeness.percentage}%` }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                            {Object.entries(completeness.sections || {}).map(([key, done]) => (
                                <div key={key} style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: done ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                                    border: `1px solid ${done ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}`,
                                }}>
                                    <span style={{ color: done ? 'var(--accent-400)' : 'var(--danger-400)', fontSize: 14 }}>{done ? '✓' : '✗'}</span>
                                    <span style={{ fontSize: 12, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{key.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid-2">
                <div className="card">
                    <div className="card-header"><h3 className="card-title">🏢 Available Drives</h3></div>
                    <div className="card-body">
                        {drives.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No eligible drives right now</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {drives.slice(0, 5).map((drive: any) => (
                                    <DriveItem key={drive.drive_id} drive={drive} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><h3 className="card-title">🔔 Notifications</h3></div>
                    <div className="card-body">
                        {notifications.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All caught up!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {notifications.map((n: any) => (
                                    <NotificationItem key={n.id} notification={n} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* SHARED COMPONENTS                                         */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function LoadingState() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 }}>
            <div className="spinner" />
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="empty-state">
            <p className="empty-state-text">{text}</p>
        </div>
    );
}

function StatCard({ icon, label, value, sub, variant }: {
    icon: React.ReactNode; label: string; value: any; sub: string; variant: string;
}) {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <div className={`stat-card-icon ${variant}`}>{icon}</div>
                <span className="stat-card-label">{label}</span>
            </div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-sub">{sub}</div>
        </div>
    );
}

function ProgressItem({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const percent = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value} / {max}</span>
            </div>
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${percent}%`, background: color }} />
            </div>
        </div>
    );
}

function DriveItem({ drive }: { drive: any }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
        }}>
            <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{drive.company_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{drive.drive_type} • {drive.drive_date || 'TBD'}</div>
            </div>
            <span className={`badge badge-${drive.status === 'open' ? 'accent' : 'ghost'}`}>{drive.status}</span>
        </div>
    );
}

function NotificationItem({ notification }: { notification: any }) {
    return (
        <div style={{
            padding: '10px 14px', background: 'rgba(99, 102, 241, 0.04)',
            borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary-500)',
        }}>
            <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{notification.payload?.message || notification.type}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(notification.created_at).toLocaleString()}</div>
        </div>
    );
}
