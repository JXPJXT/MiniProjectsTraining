import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { api } from '../api/client';
import {
    Users, Building2, GraduationCap, Wallet,
    Clock, CalendarOff, UserSearch, BarChart3
} from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        employees: 0, departments: 0, positions: 0,
        leaveRequests: 0, attendance: 0, candidates: 0,
        courses: 0, payrollRuns: 0,
    });
    const [recentEmployees, setRecentEmployees] = useState([]);
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [emps, depts, pos, leaves, att, cands, courses, runs] = await Promise.all([
                    api.get('/employees/?limit=500'),
                    api.get('/departments?limit=500'),
                    api.get('/positions?limit=500'),
                    api.get('/leave-requests?limit=500'),
                    api.get('/attendance?limit=500'),
                    api.get('/candidates?limit=500'),
                    api.get('/training-courses?limit=500'),
                    api.get('/payroll-runs?limit=500'),
                ]);
                setStats({
                    employees: emps.length,
                    departments: depts.length,
                    positions: pos.length,
                    leaveRequests: leaves.length,
                    attendance: att.length,
                    candidates: cands.length,
                    courses: courses.length,
                    payrollRuns: runs.length,
                });
                setRecentEmployees(emps.slice(0, 6));
                setPendingLeaves(leaves.filter(l => l.status === 'pending').slice(0, 6));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return (
        <>
            <Header title="Dashboard" subtitle="Overview" />
            <div className="page-content"><div className="loading"><div className="spinner" /> Loading</div></div>
        </>
    );

    const cards = [
        { label: 'Employees', value: stats.employees, icon: Users },
        { label: 'Departments', value: stats.departments, icon: Building2 },
        { label: 'Leave Requests', value: stats.leaveRequests, icon: CalendarOff },
        { label: 'Candidates', value: stats.candidates, icon: UserSearch },
        { label: 'Attendance', value: stats.attendance, icon: Clock },
        { label: 'Courses', value: stats.courses, icon: GraduationCap },
        { label: 'Payroll Runs', value: stats.payrollRuns, icon: Wallet },
        { label: 'Positions', value: stats.positions, icon: BarChart3 },
    ];

    return (
        <>
            <Header title="Dashboard" subtitle="System Overview" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Overview</h1>
                        <p className="page-subtitle">Enterprise human resource metrics at a glance</p>
                    </div>
                </div>

                <div className="stats-grid">
                    {cards.map(c => (
                        <div className="stat-card" key={c.label}>
                            <div className="stat-label">{c.label}</div>
                            <div className="stat-value">{c.value}</div>
                        </div>
                    ))}
                </div>

                <div className="section-grid">
                    <div className="section-card">
                        <div className="section-card-header">
                            <h3>Recent Employees</h3>
                        </div>
                        <div className="section-card-body">
                            {recentEmployees.length === 0 ? (
                                <div className="empty-state"><p>No employees yet</p></div>
                            ) : recentEmployees.map(emp => (
                                <div className="list-item" key={emp.emp_id}>
                                    <div>
                                        <div className="list-item-title">{emp.first_name} {emp.last_name}</div>
                                        <div className="list-item-subtitle">{emp.email}</div>
                                    </div>
                                    <span className={`badge badge-${emp.status}`}>{emp.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-card-header">
                            <h3>Pending Leave Requests</h3>
                        </div>
                        <div className="section-card-body">
                            {pendingLeaves.length === 0 ? (
                                <div className="empty-state"><p>No pending leaves</p></div>
                            ) : pendingLeaves.map(l => (
                                <div className="list-item" key={l.id}>
                                    <div>
                                        <div className="list-item-title">{l.leave_type}</div>
                                        <div className="list-item-subtitle">{l.start_date} → {l.end_date}</div>
                                    </div>
                                    <span className="badge badge-pending">Pending</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
