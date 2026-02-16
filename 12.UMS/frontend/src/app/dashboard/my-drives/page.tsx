'use client';

import { useState, useEffect } from 'react';
import { drivesAPI } from '@/lib/api';

export default function MyDrivesPage() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadRegistrations(); }, []);

    const loadRegistrations = async () => {
        try {
            const res = await drivesAPI.myRegistrations();
            setRegistrations(res.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCancel = async (driveId: number) => {
        if (!confirm('Cancel registration?')) return;
        try {
            await drivesAPI.cancel(driveId);
            loadRegistrations();
        } catch (err) { console.error(err); }
    };

    const handleAcceptOffer = async (driveId: number) => {
        try {
            await drivesAPI.acceptOffer(driveId);
            loadRegistrations();
        } catch (err) { console.error(err); }
    };

    const handleRejectOffer = async (driveId: number) => {
        if (!confirm('Are you sure you want to reject this offer?')) return;
        try {
            await drivesAPI.rejectOffer(driveId);
            loadRegistrations();
        } catch (err) { console.error(err); }
    };

    const getStatusBadge = (reg: any) => {
        if (reg.selected && reg.offer_status === 'accepted') return { text: 'Offer Accepted', class: 'badge-accent' };
        if (reg.selected && reg.offer_status === 'rejected') return { text: 'Offer Rejected', class: 'badge-danger' };
        if (reg.selected) return { text: 'Selected!', class: 'badge-accent' };
        if (reg.participated) return { text: 'Participated', class: 'badge-primary' };
        if (reg.registered) return { text: 'Registered', class: 'badge-primary' };
        return { text: 'Pending', class: 'badge-neutral' };
    };

    return (
        <>
            <div className="top-bar"><h1 className="top-bar-title">My Drive Registrations</h1></div>
            <div className="page-content">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
                ) : registrations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3 className="empty-state-title">No Registrations</h3>
                        <p className="empty-state-text">You haven&apos;t registered for any placement drives yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {registrations.map((reg: any) => {
                            const drive = reg.placement_drives;
                            const status = getStatusBadge(reg);
                            return (
                                <div key={reg.id} className="card">
                                    <div className="card-body" style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div>
                                                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                                    {drive?.company_name || 'Unknown Company'}
                                                </h3>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                                                    <span>{drive?.drive_code}</span>
                                                    <span>{drive?.drive_type}</span>
                                                    {drive?.drive_date && <span>{new Date(drive.drive_date).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                            <span className={`badge ${status.class}`}>{status.text}</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {reg.registered && !reg.selected && (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleCancel(reg.drive_id)}>
                                                    Cancel Registration
                                                </button>
                                            )}
                                            {reg.selected && reg.offer_status === 'pending' && (
                                                <>
                                                    <button className="btn btn-accent btn-sm" onClick={() => handleAcceptOffer(reg.drive_id)}>
                                                        ✓ Accept Offer
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleRejectOffer(reg.drive_id)}>
                                                        ✗ Reject Offer
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
