'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { placementsAPI, studentsAPI } from '@/lib/api';

export default function PlacementProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [student, setStudent] = useState<any>(null);
    const [eligibility, setEligibility] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const studentRes = await studentsAPI.me();
            const s = studentRes.data;
            if (s && s.student_id) {
                setStudent(s);
                const [profileRes, eligRes] = await Promise.allSettled([
                    placementsAPI.getProfile(s.student_id),
                    placementsAPI.checkEligibility(s.student_id),
                ]);
                if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
                if (eligRes.status === 'fulfilled') setEligibility(eligRes.value.data);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const acceptPolicy = async () => {
        if (!student) return;
        try {
            await placementsAPI.acceptPolicy(student.student_id);
            loadData();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    return (
        <>
            <div className="top-bar"><h1 className="top-bar-title">Placement Profile</h1></div>
            <div className="page-content">
                {/* Eligibility Check */}
                {eligibility && (
                    <div className={`card mb-24`} style={{
                        borderColor: eligibility.is_eligible ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
                    }}>
                        <div className="card-body" style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 'var(--radius-lg)',
                                    background: eligibility.is_eligible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 28,
                                }}>
                                    {eligibility.is_eligible ? '✅' : '⚠️'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                                        {eligibility.is_eligible ? 'Eligible for Placements' : 'Not Eligible'}
                                    </h3>
                                    {eligibility.issues?.length > 0 && (
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {eligibility.issues.map((issue: string, i: number) => (
                                                <li key={i} style={{ fontSize: 13, color: 'var(--danger-400)', marginBottom: 2 }}>
                                                    ⋅ {issue}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid-2">
                    {/* Profile Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">📋 Profile Details</h3>
                        </div>
                        <div className="card-body">
                            {profile ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <StatusRow label="Policy Accepted" value={profile.policy_accepted ? 'Yes' : 'No'} color={profile.policy_accepted ? 'var(--accent-400)' : 'var(--danger-400)'} />
                                    <StatusRow label="Placement Status" value={profile.placement_status || 'N/A'} />
                                    <StatusRow label="PEP Fee Paid" value={`₹${profile.pep_fee_paid || 0}`} />
                                    <StatusRow label="Fee Status" value={profile.pep_fee_status || 'N/A'} />
                                    <StatusRow label="Registration Date" value={profile.registration_date ? new Date(profile.registration_date).toLocaleDateString() : 'Not registered'} />
                                    <StatusRow label="Last Updated" value={profile.last_updated ? new Date(profile.last_updated).toLocaleString() : 'N/A'} />
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 20 }}>
                                    <p className="text-muted mb-16">No placement profile yet</p>
                                    <button className="btn btn-primary" onClick={acceptPolicy}>
                                        Accept Policy & Register
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Policy Acceptance */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">📜 Placement Policy</h3>
                        </div>
                        <div className="card-body">
                            <div style={{
                                padding: 20,
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                marginBottom: 20,
                                maxHeight: 300,
                                overflowY: 'auto',
                            }}>
                                <h4 style={{ marginBottom: 12, fontSize: 15, fontWeight: 700 }}>Terms & Conditions</h4>
                                <ol style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 20 }}>
                                    <li>Students must maintain minimum CGPA requirements as set by the university.</li>
                                    <li>Students with active backlogs may be temporarily debarred from placements.</li>
                                    <li>Once registered, students must participate in drives they sign up for.</li>
                                    <li>Duty leave will be provided for placement drives with proper documentation.</li>
                                    <li>All documents submitted must be genuine and verifiable.</li>
                                    <li>Offer acceptance is binding; students cannot back out without proper reason.</li>
                                    <li>An applicable PEP fee must be paid for placement registration.</li>
                                    <li>Independent offers must be reported and verified through the portal.</li>
                                </ol>
                            </div>
                            {profile && !profile.policy_accepted && (
                                <button className="btn btn-accent w-full" onClick={acceptPolicy}>
                                    ✓ Accept Policy
                                </button>
                            )}
                            {profile?.policy_accepted && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '12px 16px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--accent-400)',
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}>
                                    ✓ Policy accepted on {profile.registration_date ? new Date(profile.registration_date).toLocaleDateString() : 'N/A'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatusRow({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}
