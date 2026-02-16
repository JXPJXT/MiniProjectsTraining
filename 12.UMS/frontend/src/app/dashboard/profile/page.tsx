'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { studentsAPI } from '@/lib/api';
import { HiOutlineUser, HiOutlineMail, HiOutlineCode, HiOutlineStar } from 'react-icons/hi';

export default function ProfilePage() {
    const { user } = useAuth();
    const [student, setStudent] = useState<any>(null);
    const [contact, setContact] = useState<any>(null);
    const [skills, setSkills] = useState<any[]>([]);
    const [prefs, setPrefs] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('info');

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const res = await studentsAPI.me();
            const s = res.data;
            if (s && s.student_id) {
                setStudent(s);
                const [contactRes, skillsRes, prefsRes] = await Promise.allSettled([
                    studentsAPI.getContact(s.student_id),
                    studentsAPI.getSkills(s.student_id),
                    studentsAPI.getPreferences(s.student_id),
                ]);
                if (contactRes.status === 'fulfilled') setContact(contactRes.value.data);
                if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value.data || []);
                if (prefsRes.status === 'fulfilled') setPrefs(prefsRes.value.data);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    if (!student) {
        return (
            <>
                <div className="top-bar"><h1 className="top-bar-title">My Profile</h1></div>
                <div className="page-content">
                    <div className="empty-state">
                        <div className="empty-state-icon">👤</div>
                        <h3 className="empty-state-title">No Profile Found</h3>
                        <p className="empty-state-text">Your student profile has not been created yet. Contact admin or TPC for assistance.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="top-bar"><h1 className="top-bar-title">My Profile</h1></div>
            <div className="page-content">
                {/* Profile Header */}
                <div className="card mb-24">
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '28px 24px' }}>
                        <div style={{
                            width: 72,
                            height: 72,
                            borderRadius: 'var(--radius-xl)',
                            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 28,
                            fontWeight: 800,
                            color: 'white',
                            flexShrink: 0,
                        }}>
                            {student.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{student.full_name}</h2>
                            <div style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <span>📋 {student.reg_no}</span>
                                <span>🎓 {student.program} — {student.stream}</span>
                                <span>📊 CGPA: <strong style={{ color: 'var(--primary-400)' }}>{student.cgpa || 'N/A'}</strong></span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <span className={`badge ${student.status === 'active' ? 'badge-accent' : 'badge-danger'}`}>{student.status}</span>
                                <span className="badge badge-primary">{student.batch_start_year}-{student.batch_end_year}</span>
                                {student.backlog_count > 0 && <span className="badge badge-danger">{student.backlog_count} backlogs</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tabs">
                    <button className={`tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>Basic Info</button>
                    <button className={`tab ${tab === 'contact' ? 'active' : ''}`} onClick={() => setTab('contact')}>Contact</button>
                    <button className={`tab ${tab === 'skills' ? 'active' : ''}`} onClick={() => setTab('skills')}>Skills</button>
                    <button className={`tab ${tab === 'prefs' ? 'active' : ''}`} onClick={() => setTab('prefs')}>Preferences</button>
                </div>

                {tab === 'info' && (
                    <div className="card">
                        <div className="card-body">
                            <div className="grid-2">
                                <InfoRow label="Student ID" value={student.student_id} />
                                <InfoRow label="Registration No" value={student.reg_no} />
                                <InfoRow label="Full Name" value={student.full_name} />
                                <InfoRow label="Program" value={student.program} />
                                <InfoRow label="Stream" value={student.stream} />
                                <InfoRow label="CGPA" value={student.cgpa} />
                                <InfoRow label="Backlogs" value={student.backlog_count} />
                                <InfoRow label="Status" value={student.status} />
                                <InfoRow label="Batch" value={`${student.batch_start_year}-${student.batch_end_year}`} />
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'contact' && (
                    <div className="card">
                        <div className="card-body">
                            {contact ? (
                                <div className="grid-2">
                                    <InfoRow label="Email" value={contact.email} />
                                    <InfoRow label="Mobile" value={contact.mobile} />
                                    <InfoRow label="WhatsApp" value={contact.whatsapp} />
                                    <InfoRow label="LinkedIn" value={contact.linkedin_url} />
                                    <InfoRow label="Microsoft ID" value={contact.microsoft_id} />
                                </div>
                            ) : (
                                <p className="text-muted">No contact details added yet</p>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'skills' && (
                    <div className="card">
                        <div className="card-body">
                            {skills.length === 0 ? (
                                <p className="text-muted">No skills added yet</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {skills.map((s: any) => (
                                        <div key={s.id} style={{
                                            padding: '14px 16px',
                                            background: 'var(--bg-glass)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border-color)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.skill_name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                    Level: {s.skill_level || 'N/A'} • Exp: {s.experience_years || 0} yrs
                                                    {s.certification && ` • Cert: ${s.certification}`}
                                                </div>
                                            </div>
                                            <span className={`badge ${s.status === 'approved' ? 'badge-accent' : s.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                                {s.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'prefs' && (
                    <div className="card">
                        <div className="card-body">
                            {prefs ? (
                                <div>
                                    <div className="mb-16">
                                        <label className="form-label">Preferred Locations</label>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {(prefs.job_locations || []).map((loc: string) => (
                                                <span key={loc} className="badge badge-primary">{loc}</span>
                                            ))}
                                            {(prefs.job_locations || []).length === 0 && <span className="text-muted text-sm">Not set</span>}
                                        </div>
                                    </div>
                                    <div className="mb-16">
                                        <label className="form-label">Employment Types</label>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {(prefs.employment_types || []).map((t: string) => (
                                                <span key={t} className="badge badge-accent">{t}</span>
                                            ))}
                                            {(prefs.employment_types || []).length === 0 && <span className="text-muted text-sm">Not set</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Job Profiles</label>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {(prefs.job_profiles || []).map((p: string) => (
                                                <span key={p} className="badge badge-warning">{p}</span>
                                            ))}
                                            {(prefs.job_profiles || []).length === 0 && <span className="text-muted text-sm">Not set</span>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted">No preferences set yet</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function InfoRow({ label, value }: { label: string; value: any }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                {label}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                {value || <span style={{ color: 'var(--text-muted)' }}>—</span>}
            </div>
        </div>
    );
}
