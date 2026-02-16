'use client';

import { useState, useEffect } from 'react';
import { studentsAPI } from '@/lib/api';
import { HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [streamFilter, setStreamFilter] = useState('');

    useEffect(() => { loadStudents(); }, [search, streamFilter]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const params: any = { limit: 100 };
            if (search) params.search = search;
            if (streamFilter) params.stream = streamFilter;
            const res = await studentsAPI.list(params);
            setStudents(res.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = { active: 'badge-accent', inactive: 'badge-neutral', debarred: 'badge-danger', exit: 'badge-warning' };
        return map[status] || 'badge-neutral';
    };

    return (
        <>
            <div className="top-bar">
                <h1 className="top-bar-title">Students</h1>
            </div>
            <div className="page-content">
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <HiOutlineSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            id="student-search"
                            className="form-input"
                            placeholder="Search students by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 40 }}
                        />
                    </div>
                    <select id="stream-filter" className="form-select" value={streamFilter} onChange={(e) => setStreamFilter(e.target.value)} style={{ width: 180 }}>
                        <option value="">All Streams</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="IT">IT</option>
                        <option value="EE">EE</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Reg No</th>
                                    <th>Full Name</th>
                                    <th>Program</th>
                                    <th>Stream</th>
                                    <th>CGPA</th>
                                    <th>Backlogs</th>
                                    <th>Status</th>
                                    <th>Batch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No students found</td></tr>
                                ) : students.map((s: any) => (
                                    <tr key={s.student_id}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.reg_no}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.full_name}</td>
                                        <td>{s.program || '-'}</td>
                                        <td>{s.stream || '-'}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{s.cgpa || '-'}</td>
                                        <td>
                                            <span className={s.backlog_count > 0 ? 'text-danger' : 'text-accent'}>
                                                {s.backlog_count}
                                            </span>
                                        </td>
                                        <td><span className={`badge ${getStatusBadge(s.status)}`}>{s.status}</span></td>
                                        <td>{s.batch_start_year ? `${s.batch_start_year}-${s.batch_end_year}` : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
