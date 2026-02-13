import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Users, Building2, CalendarDays, Wallet, UserSearch, Target, GraduationCap, Clock, TrendingUp, TrendingDown } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [recentEmp, setRecentEmp] = useState([]);
    const [pendingLeave, setPendingLeave] = useState([]);
    const [payroll, setPayroll] = useState([]);
    const [training, setTraining] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [emp, dept, att, leave, shifts, runs, cands, reviews, courses, benefits, assets] = await Promise.allSettled([
                    api.get('/employees?limit=500'),
                    api.get('/departments?limit=500'),
                    api.get('/attendance?limit=500'),
                    api.get('/leave-requests?limit=500'),
                    api.get('/shifts?limit=500'),
                    api.get('/payroll-runs?limit=500'),
                    api.get('/candidates?limit=500'),
                    api.get('/performance-reviews?limit=500'),
                    api.get('/training-courses?limit=500'),
                    api.get('/benefits?limit=500'),
                    api.get('/assets?limit=500'),
                ]);

                const v = (r) => r.status === 'fulfilled' ? r.value : [];
                const employees = v(emp);
                const departments = v(dept);
                const attendance = v(att);
                const leaveReqs = v(leave);
                const allShifts = v(shifts);
                const payrollRuns = v(runs);
                const candidates = v(cands);
                const perfReviews = v(reviews);
                const allCourses = v(courses);
                const allBenefits = v(benefits);
                const allAssets = v(assets);

                const activeEmp = employees.filter(e => e.status === 'active').length;
                const pendingL = leaveReqs.filter(l => l.status === 'pending');
                const todayStr = new Date().toISOString().split('T')[0];
                const todayAtt = attendance.filter(a => a.record_date === todayStr);
                const presentToday = todayAtt.filter(a => a.status === 'present' || a.status === 'late').length;
                const avgRating = perfReviews.length > 0 ? (perfReviews.reduce((s, r) => s + Number(r.overall_rating || 0), 0) / perfReviews.length).toFixed(1) : '—';
                const openReqs = candidates.filter(c => c.status === 'new' || c.status === 'screening').length;
                const assignedAssets = allAssets.filter(a => a.status === 'assigned').length;

                setStats({
                    totalEmployees: employees.length,
                    activeEmployees: activeEmp,
                    departments: departments.length,
                    pendingLeave: pendingL.length,
                    todayPresent: presentToday,
                    todayTotal: employees.length,
                    attendanceRate: employees.length > 0 ? Math.round((presentToday / employees.length) * 100) : 0,
                    totalShifts: allShifts.length,
                    activePayrollRuns: payrollRuns.filter(r => r.status === 'processed' || r.status === 'completed').length,
                    totalPayrollRuns: payrollRuns.length,
                    openCandidates: openReqs,
                    totalCandidates: candidates.length,
                    avgPerformance: avgRating,
                    totalReviews: perfReviews.length,
                    activeCourses: allCourses.length,
                    totalBenefits: allBenefits.length,
                    assignedAssets: assignedAssets,
                    totalAssets: allAssets.length,
                });

                setRecentEmp(employees.slice(-5).reverse());
                setPendingLeave(pendingL.slice(0, 5));
                setPayroll(payrollRuns.slice(-5).reverse());
                setTraining(allCourses.slice(0, 5));
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };
        load();
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Mini chart data (simulated daily attendance for the week)
    const weekBars = [65, 78, 82, 70, 90, 45, 85];

    if (loading) return (
        <>
            <Header title="Dashboard" subtitle="Overview" />
            <div className="page-content"><div className="loading"><div className="spinner" /> Loading analytics...</div></div>
        </>
    );

    return (
        <>
            <Header title="Dashboard" subtitle="Overview" />
            <div className="page-content fade-in">
                {/* Greeting */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{greeting}, {user?.full_name?.split(' ')[0] || 'User'}</h1>
                        <p className="page-subtitle">Here's what's happening in your organization today</p>
                    </div>
                </div>

                {/* Primary Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Employees</div>
                        <div className="stat-value">{stats.totalEmployees || 0}</div>
                        <div className="stat-change">{stats.activeEmployees || 0} active</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Departments</div>
                        <div className="stat-value">{stats.departments || 0}</div>
                        <div className="stat-change">Organization units</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Today's Attendance</div>
                        <div className="stat-value">{stats.attendanceRate}%</div>
                        <div className="stat-change">{stats.todayPresent} / {stats.todayTotal} present</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending Leave</div>
                        <div className="stat-value">{stats.pendingLeave || 0}</div>
                        <div className="stat-change">Awaiting approval</div>
                    </div>
                </div>

                {/* KPI Row */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <span className="kpi-title">Recruitment Pipeline</span>
                            <UserSearch size={16} style={{ opacity: 0.3 }} />
                        </div>
                        <div className="kpi-value">{stats.openCandidates || 0}</div>
                        <div className="kpi-sub">open candidates of {stats.totalCandidates || 0} total</div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${stats.totalCandidates ? (stats.openCandidates / stats.totalCandidates) * 100 : 0}%` }} />
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <span className="kpi-title">Avg. Performance</span>
                            <Target size={16} style={{ opacity: 0.3 }} />
                        </div>
                        <div className="kpi-value">{stats.avgPerformance}/5</div>
                        <div className="kpi-sub">{stats.totalReviews} reviews completed</div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${stats.avgPerformance !== '—' ? (stats.avgPerformance / 5) * 100 : 0}%` }} />
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <span className="kpi-title">Asset Utilization</span>
                            <Clock size={16} style={{ opacity: 0.3 }} />
                        </div>
                        <div className="kpi-value">{stats.totalAssets > 0 ? Math.round((stats.assignedAssets / stats.totalAssets) * 100) : 0}%</div>
                        <div className="kpi-sub">{stats.assignedAssets} of {stats.totalAssets} assets assigned</div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${stats.totalAssets > 0 ? (stats.assignedAssets / stats.totalAssets) * 100 : 0}%` }} />
                        </div>
                    </div>
                </div>

                {/* Secondary Stats Row */}
                <div className="stats-grid" style={{ marginBottom: 32 }}>
                    <div className="stat-card">
                        <div className="stat-label">Payroll Runs</div>
                        <div className="stat-value">{stats.totalPayrollRuns || 0}</div>
                        <div className="stat-change">{stats.activePayrollRuns || 0} processed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Training Courses</div>
                        <div className="stat-value">{stats.activeCourses || 0}</div>
                        <div className="stat-change">Available programs</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Benefits Plans</div>
                        <div className="stat-value">{stats.totalBenefits || 0}</div>
                        <div className="stat-change">Active plans</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Shifts</div>
                        <div className="stat-value">{stats.totalShifts || 0}</div>
                        <div className="stat-change">Configured schedules</div>
                    </div>
                </div>

                {/* Weekly Attendance Chart Card */}
                <div className="kpi-grid" style={{ marginBottom: 32 }}>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <span className="kpi-title">Weekly Attendance Trend</span>
                            <TrendingUp size={16} style={{ opacity: 0.3 }} />
                        </div>
                        <div className="mini-chart">
                            {weekBars.map((h, i) => (
                                <div key={i} className="mini-bar" style={{ height: `${h}%` }} title={`${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}: ${h}%`} />
                            ))}
                        </div>
                        <div className="kpi-sub" style={{ marginTop: 8 }}>Mon — Sun preview</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <span className="kpi-title">Leave Distribution</span>
                            <CalendarDays size={16} style={{ opacity: 0.3 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                            {[{ label: 'Annual', pct: 45 }, { label: 'Sick', pct: 25 }, { label: 'Casual', pct: 20 }, { label: 'Other', pct: 10 }].map((item, i) => (
                                <div key={i} style={{ flex: '1 1 45%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span>{item.label}</span>
                                        <span style={{ color: 'var(--text-tertiary)' }}>{item.pct}%</span>
                                    </div>
                                    <div className="progress-bar" style={{ marginTop: 4 }}>
                                        <div className="progress-fill" style={{ width: `${item.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lists Section */}
                <div className="section-grid">
                    <div className="section-card">
                        <div className="section-card-header">
                            <h3>Recent Employees</h3>
                            <span className="badge badge-active">{recentEmp.length}</span>
                        </div>
                        <div className="section-card-body">
                            {recentEmp.length === 0 ? (
                                <div className="empty-state"><p>No employees yet</p></div>
                            ) : (
                                recentEmp.map(e => (
                                    <div className="list-item" key={e.emp_id}>
                                        <div>
                                            <div className="list-item-title">{e.first_name} {e.last_name}</div>
                                            <div className="list-item-subtitle">{e.email}</div>
                                        </div>
                                        <span className={`badge badge-${e.status}`}>{e.status}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-card-header">
                            <h3>Pending Leave Requests</h3>
                            <span className="badge badge-pending">{pendingLeave.length}</span>
                        </div>
                        <div className="section-card-body">
                            {pendingLeave.length === 0 ? (
                                <div className="empty-state"><p>No pending requests</p></div>
                            ) : (
                                pendingLeave.map(l => (
                                    <div className="list-item" key={l.id || l.leave_id}>
                                        <div>
                                            <div className="list-item-title">Emp #{l.emp_id} — {l.leave_type}</div>
                                            <div className="list-item-subtitle">{l.start_date} → {l.end_date}</div>
                                        </div>
                                        <span className="badge badge-pending">Pending</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="section-grid">
                    <div className="section-card">
                        <div className="section-card-header">
                            <h3>Recent Payroll Runs</h3>
                            <span className="badge badge-active">{payroll.length}</span>
                        </div>
                        <div className="section-card-body">
                            {payroll.length === 0 ? (
                                <div className="empty-state"><p>No payroll runs</p></div>
                            ) : (
                                payroll.map(r => (
                                    <div className="list-item" key={r.run_id}>
                                        <div>
                                            <div className="list-item-title">Run #{r.run_id}</div>
                                            <div className="list-item-subtitle">{r.period_start} → {r.period_end}</div>
                                        </div>
                                        <span className={`badge badge-${r.status}`}>{r.status}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-card-header">
                            <h3>Training Courses</h3>
                            <span className="badge badge-active">{training.length}</span>
                        </div>
                        <div className="section-card-body">
                            {training.length === 0 ? (
                                <div className="empty-state"><p>No courses available</p></div>
                            ) : (
                                training.map(c => (
                                    <div className="list-item" key={c.course_id}>
                                        <div>
                                            <div className="list-item-title">{c.name}</div>
                                            <div className="list-item-subtitle">{c.provider || 'Internal'} • {c.duration_hours || '—'}h</div>
                                        </div>
                                        <span className={`badge ${c.is_mandatory ? 'badge-active' : 'badge-pending'}`}>{c.is_mandatory ? 'Required' : 'Optional'}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
