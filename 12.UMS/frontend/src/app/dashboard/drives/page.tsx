'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { drivesAPI } from '@/lib/api';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineCalendar, HiOutlineLocationMarker } from 'react-icons/hi';

export default function DrivesPage() {
    const { user } = useAuth();
    const isAdmin = ['admin', 'super_admin', 'tpc'].includes(user?.role || '');
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({
        drive_code: '', company_name: '', drive_type: '', drive_date: '',
        venue: '', streams_eligible: '', registration_deadline: '',
    });

    useEffect(() => { loadDrives(); }, [search, statusFilter]);

    const loadDrives = async () => {
        try {
            const params: any = { limit: 100 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const res = await drivesAPI.list(params);
            setDrives(res.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const createDrive = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await drivesAPI.create(form);
            setShowCreate(false);
            setForm({ drive_code: '', company_name: '', drive_type: '', drive_date: '', venue: '', streams_eligible: '', registration_deadline: '' });
            loadDrives();
        } catch (err) { console.error(err); }
    };

    const registerForDrive = async (driveId: number) => {
        try {
            await drivesAPI.register(driveId);
            loadDrives();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Registration failed');
        }
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = { open: 'badge-accent', closed: 'badge-neutral', cancelled: 'badge-danger' };
        return map[status] || 'badge-neutral';
    };

    return (
        <>
            <div className="top-bar">
                <h1 className="top-bar-title">Placement Drives</h1>
                <div className="top-bar-actions">
                    {isAdmin && (
                        <button id="create-drive-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>
                            <HiOutlinePlus /> Create Drive
                        </button>
                    )}
                </div>
            </div>
            <div className="page-content">
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <HiOutlineSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            id="drive-search"
                            className="form-input"
                            placeholder="Search companies..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 40 }}
                        />
                    </div>
                    <select id="drive-status-filter" className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 160 }}>
                        <option value="">All Status</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
                ) : drives.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏢</div>
                        <h3 className="empty-state-title">No Drives Found</h3>
                        <p className="empty-state-text">No placement drives available at the moment.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                        {drives.map((drive: any) => (
                            <div key={drive.drive_id} className="card" style={{ cursor: 'pointer' }}>
                                <div className="card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div>
                                            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                                {drive.company_name}
                                            </h3>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{drive.drive_code}</span>
                                        </div>
                                        <span className={`badge ${getStatusBadge(drive.status)}`}>{drive.status}</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                        {drive.drive_type && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                                                <HiOutlineCalendar /> {drive.drive_type}
                                            </div>
                                        )}
                                        {drive.drive_date && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                                                <HiOutlineCalendar /> {new Date(drive.drive_date).toLocaleDateString()}
                                            </div>
                                        )}
                                        {drive.venue && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                                                <HiOutlineLocationMarker /> {drive.venue}
                                            </div>
                                        )}
                                        {drive.streams_eligible && (
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                Eligible: {drive.streams_eligible}
                                            </div>
                                        )}
                                    </div>

                                    {user?.role === 'student' && drive.status === 'open' && (
                                        <button className="btn btn-primary btn-sm w-full" onClick={() => registerForDrive(drive.drive_id)}>
                                            Register for Drive
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Create Placement Drive</h3>
                            <button className="btn-icon" onClick={() => setShowCreate(false)}>✕</button>
                        </div>
                        <form onSubmit={createDrive}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Drive Code</label>
                                        <input className="form-input" required value={form.drive_code} onChange={(e) => setForm({ ...form, drive_code: e.target.value })} placeholder="e.g. TCS-2026-01" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Company Name</label>
                                        <input className="form-input" required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Company name" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Drive Type</label>
                                        <select className="form-select" value={form.drive_type} onChange={(e) => setForm({ ...form, drive_type: e.target.value })}>
                                            <option value="">Select type</option>
                                            <option value="On-campus">On-campus</option>
                                            <option value="Off-campus">Off-campus</option>
                                            <option value="Virtual">Virtual</option>
                                            <option value="Pool">Pool Campus</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Drive Date</label>
                                        <input className="form-input" type="date" value={form.drive_date} onChange={(e) => setForm({ ...form, drive_date: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Venue</label>
                                    <input className="form-input" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Venue details" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Streams Eligible</label>
                                    <input className="form-input" value={form.streams_eligible} onChange={(e) => setForm({ ...form, streams_eligible: e.target.value })} placeholder="e.g. CSE, ECE, IT" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Registration Deadline</label>
                                    <input className="form-input" type="datetime-local" value={form.registration_deadline} onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Drive</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
