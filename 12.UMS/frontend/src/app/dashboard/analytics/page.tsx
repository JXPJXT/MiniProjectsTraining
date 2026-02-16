'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { HiOutlineChartBar, HiOutlineDownload } from 'react-icons/hi';

export default function AnalyticsPage() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stream, setStream] = useState('');
    const [batchYear, setBatchYear] = useState('');

    useEffect(() => { loadReport(); }, [stream, batchYear]);

    const loadReport = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (stream) params.stream = stream;
            if (batchYear) params.batch_year = parseInt(batchYear);
            const res = await adminAPI.placementReport(params);
            setReport(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const placementRate = report ? (report.total_students > 0 ? Math.round((report.placed / report.total_students) * 100) : 0) : 0;

    return (
        <>
            <div className="top-bar">
                <h1 className="top-bar-title">Analytics & Reports</h1>
            </div>
            <div className="page-content">
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <select className="form-select" value={stream} onChange={(e) => setStream(e.target.value)} style={{ width: 180 }}>
                        <option value="">All Streams</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="IT">IT</option>
                    </select>
                    <select className="form-select" value={batchYear} onChange={(e) => setBatchYear(e.target.value)} style={{ width: 180 }}>
                        <option value="">All Batches</option>
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
                ) : !report ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <h3 className="empty-state-title">No Data Available</h3>
                    </div>
                ) : (
                    <div className="animate-in">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-card-header">
                                    <div className="stat-card-icon primary">📊</div>
                                    <span className="stat-card-label">Total Students</span>
                                </div>
                                <div className="stat-card-value">{report.total_students}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-header">
                                    <div className="stat-card-icon accent">✅</div>
                                    <span className="stat-card-label">Placed</span>
                                </div>
                                <div className="stat-card-value">{report.placed}</div>
                                <div className="stat-card-sub">{placementRate}% placement rate</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-header">
                                    <div className="stat-card-icon warning">⏳</div>
                                    <span className="stat-card-label">Unplaced</span>
                                </div>
                                <div className="stat-card-value">{report.unplaced}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-header">
                                    <div className="stat-card-icon accent">🤝</div>
                                    <span className="stat-card-label">Offers Accepted</span>
                                </div>
                                <div className="stat-card-value">{report.offers_accepted}</div>
                            </div>
                        </div>

                        {/* Placement Rate Bar */}
                        <div className="card mb-24">
                            <div className="card-header">
                                <h3 className="card-title">Placement Rate</h3>
                                <span style={{ fontSize: 24, fontWeight: 800, color: placementRate >= 80 ? 'var(--accent-400)' : placementRate >= 50 ? 'var(--warning-400)' : 'var(--danger-400)' }}>
                                    {placementRate}%
                                </span>
                            </div>
                            <div className="card-body">
                                <div className="progress-bar" style={{ height: 16 }}>
                                    <div className="progress-bar-fill" style={{
                                        width: `${placementRate}%`,
                                        background: placementRate >= 80
                                            ? 'linear-gradient(90deg, var(--accent-500), var(--accent-400))'
                                            : placementRate >= 50
                                                ? 'linear-gradient(90deg, var(--warning-500), var(--warning-400))'
                                                : 'linear-gradient(90deg, var(--danger-500), var(--danger-400))',
                                    }} />
                                </div>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Student Details</h3>
                                <span className="badge badge-neutral">{report.students?.length || 0} students</span>
                            </div>
                            <div className="table-container" style={{ border: 'none' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Reg No</th>
                                            <th>Name</th>
                                            <th>Stream</th>
                                            <th>CGPA</th>
                                            <th>Drives</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(report.students || []).map((s: any) => (
                                            <tr key={s.student_id}>
                                                <td style={{ fontFamily: 'monospace' }}>{s.reg_no || '-'}</td>
                                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.full_name}</td>
                                                <td>{s.stream || '-'}</td>
                                                <td style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{s.cgpa || '-'}</td>
                                                <td>{s.drive_count}</td>
                                                <td>
                                                    <span className={`badge ${s.is_placed ? 'badge-accent' : 'badge-warning'}`}>
                                                        {s.is_placed ? 'Placed' : 'Unplaced'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
