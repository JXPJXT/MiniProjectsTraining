import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, GraduationCap, BookOpen, Award, Users, Download, Activity } from 'lucide-react';
import { SummaryCard, StatusBreakdown, ActivityTimeline, InfoPanel, QuickActions } from '../components/PageDashboard';

export default function Training() {
    const [tab, setTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});
    const [editId, setEditId] = useState(null);

    const load = async () => {
        setLoading(true); try {
            const [c, e, s] = await Promise.all([
                api.get('/training/courses?limit=500'),
                api.get('/training/enrollments?limit=500'),
                api.get('/training/skills?limit=500'),
            ]);
            setCourses(c); setEnrollments(e); setSkills(s);
        } catch (e) { console.error(e); } setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => {
        if (tab === 'courses') setForm({ title: '', description: '', instructor: '', duration_hours: '', max_participants: '', is_mandatory: false, status: 'active' });
        if (tab === 'enrollments') setForm({ emp_id: '', course_id: '', enrollment_date: '', status: 'enrolled', completion_date: '', score: '' });
        if (tab === 'skills') setForm({ emp_id: '', skill_name: '', proficiency_level: 'beginner', certified: false });
        setEditId(null); setModal('create');
    };
    const save = async () => {
        try {
            const p = { ...form };
            if (tab === 'courses') {
                if (p.duration_hours) p.duration_hours = Number(p.duration_hours); else delete p.duration_hours;
                if (p.max_participants) p.max_participants = Number(p.max_participants); else delete p.max_participants;
                modal === 'create' ? await api.post('/training/courses', p) : await api.put(`/training/courses/${editId}`, p);
            }
            if (tab === 'enrollments') {
                p.emp_id = Number(p.emp_id); p.course_id = Number(p.course_id); if (p.score) p.score = Number(p.score);
                modal === 'create' ? await api.post('/training/enrollments', p) : await api.put(`/training/enrollments/${editId}`, p);
            }
            if (tab === 'skills') {
                p.emp_id = Number(p.emp_id);
                modal === 'create' ? await api.post('/training/skills', p) : await api.put(`/training/skills/${editId}`, p);
            }
            setModal(null); load();
        } catch (e) { alert(e.message); }
    };

    // Stats
    const activeCourses = courses.filter(c => c.status === 'active');
    const completedEnrollments = enrollments.filter(e => e.status === 'completed');
    const avgScore = completedEnrollments.length > 0 ? (completedEnrollments.reduce((s, e) => s + Number(e.score || 0), 0) / completedEnrollments.length).toFixed(1) : '—';
    const certifiedSkills = skills.filter(s => s.certified);

    const enrollmentByStatus = {};
    enrollments.forEach(e => { enrollmentByStatus[e.status] = (enrollmentByStatus[e.status] || 0) + 1; });

    const recentEnrollments = enrollments.slice(-5).reverse().map(e => ({
        title: `Emp #${e.emp_id} → Course #${e.course_id}`,
        sub: e.status,
        color: e.status === 'completed' ? '#2d8a4e' : '#333',
    }));

    const courseCols = [
        { header: 'ID', accessor: 'course_id', width: '60px' },
        { header: 'Title', accessor: 'title' },
        { header: 'Instructor', accessor: 'instructor', width: '120px' },
        { header: 'Hours', accessor: 'duration_hours', width: '70px' },
        { header: 'Max', accessor: 'max_participants', width: '60px' },
        { header: 'Mandatory', accessor: 'is_mandatory', width: '80px', render: r => r.is_mandatory ? 'Yes' : 'No' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.course_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/training/courses/${r.course_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const enrollCols = [
        { header: 'ID', accessor: 'enrollment_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Course ID', accessor: 'course_id', width: '80px' },
        { header: 'Enrolled', accessor: 'enrollment_date', width: '110px' },
        { header: 'Score', accessor: 'score', width: '70px', render: r => r.score || '—' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.enrollment_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/training/enrollments/${r.enrollment_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const skillCols = [
        { header: 'ID', accessor: 'skill_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Skill', accessor: 'skill_name' },
        { header: 'Level', accessor: 'proficiency_level', width: '100px' },
        { header: 'Certified', accessor: 'certified', width: '80px', render: r => r.certified ? 'Yes' : 'No' },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.skill_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/training/skills/${r.skill_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const map = { courses: { cols: courseCols, data: courses }, enrollments: { cols: enrollCols, data: enrollments }, skills: { cols: skillCols, data: skills } };
    const cur = map[tab];

    return (
        <>
            <Header title="Training" subtitle="L&D" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Training & Development</h1><p className="page-subtitle">Courses, Enrollments & Skills</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New</button>
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={BookOpen} label="Courses" value={courses.length} sub={`${activeCourses.length} active`} trend="neutral" />
                    <SummaryCard icon={Users} label="Enrollments" value={enrollments.length} sub={`${completedEnrollments.length} completed`} trend="up" />
                    <SummaryCard icon={Award} label="Avg Score" value={avgScore} sub="Completed learners" trend={Number(avgScore) >= 70 ? 'up' : 'neutral'} />
                    <SummaryCard icon={GraduationCap} label="Skills" value={skills.length} sub={`${certifiedSkills.length} certified`} trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'Add Course', icon: BookOpen, onClick: () => { setTab('courses'); openCreate(); } },
                            { label: 'Enroll', icon: Users, onClick: () => { setTab('enrollments'); openCreate(); } },
                            { label: 'Export', icon: Download, onClick: () => alert('Coming soon') },
                        ]} />

                        <div className="tabs">
                            <button className={`tab ${tab === 'courses' ? 'active' : ''}`} onClick={() => setTab('courses')}>Courses</button>
                            <button className={`tab ${tab === 'enrollments' ? 'active' : ''}`} onClick={() => setTab('enrollments')}>Enrollments</button>
                            <button className={`tab ${tab === 'skills' ? 'active' : ''}`} onClick={() => setTab('skills')}>Skills</button>
                        </div>
                        <DataTable columns={cur.cols} data={cur.data} loading={loading} searchPlaceholder={`Search ${tab}...`} />
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Enrollment Status" icon={Activity}>
                            <StatusBreakdown items={[
                                { label: 'Enrolled', count: enrollmentByStatus.enrolled || 0, color: '#888' },
                                { label: 'Completed', count: enrollmentByStatus.completed || 0, color: '#333' },
                                { label: 'Dropped', count: enrollmentByStatus.dropped || 0, color: '#ccc' },
                            ]} />
                        </InfoPanel>

                        <InfoPanel title="Score Overview" icon={Award}>
                            <div className="stat-row" style={{ border: '1px solid var(--border-color)' }}>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{completedEnrollments.filter(e => Number(e.score) >= 80).length}</div>
                                    <div className="stat-row-label">High (80+)</div>
                                </div>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{completedEnrollments.filter(e => Number(e.score) >= 50 && Number(e.score) < 80).length}</div>
                                    <div className="stat-row-label">Mid</div>
                                </div>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{completedEnrollments.filter(e => Number(e.score) < 50).length}</div>
                                    <div className="stat-row-label">Low</div>
                                </div>
                            </div>
                        </InfoPanel>

                        <InfoPanel title="Recent Enrollments" icon={GraduationCap}>
                            {recentEnrollments.length > 0 ? (
                                <ActivityTimeline items={recentEnrollments} />
                            ) : (
                                <div className="empty-state" style={{ padding: 20 }}><p>No enrollments yet</p></div>
                            )}
                        </InfoPanel>
                    </div>
                </div>

                {/* Modals */}
                {modal && tab === 'courses' && (
                    <Modal title={modal === 'create' ? 'New Course' : 'Edit Course'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title || ''} onChange={e => onChange('title', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="2" value={form.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Instructor</label><input className="form-input" value={form.instructor || ''} onChange={e => onChange('instructor', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Duration (hrs)</label><input className="form-input" type="number" value={form.duration_hours || ''} onChange={e => onChange('duration_hours', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Max Participants</label><input className="form-input" type="number" value={form.max_participants || ''} onChange={e => onChange('max_participants', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-select" value={form.status || 'active'} onChange={e => onChange('status', e.target.value)}>
                                    <option value="active">Active</option><option value="inactive">Inactive</option><option value="completed">Completed</option>
                                </select></div>
                        </div>
                    </Modal>
                )}
                {modal && tab === 'enrollments' && (
                    <Modal title={modal === 'create' ? 'New Enrollment' : 'Edit Enrollment'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Enroll' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id || ''} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Course ID *</label><input className="form-input" type="number" value={form.course_id || ''} onChange={e => onChange('course_id', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Enrollment Date</label><input className="form-input" type="date" value={form.enrollment_date || ''} onChange={e => onChange('enrollment_date', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-select" value={form.status || 'enrolled'} onChange={e => onChange('status', e.target.value)}>
                                    <option value="enrolled">Enrolled</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="dropped">Dropped</option>
                                </select></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Completion Date</label><input className="form-input" type="date" value={form.completion_date || ''} onChange={e => onChange('completion_date', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Score</label><input className="form-input" type="number" value={form.score || ''} onChange={e => onChange('score', e.target.value)} /></div>
                        </div>
                    </Modal>
                )}
                {modal && tab === 'skills' && (
                    <Modal title={modal === 'create' ? 'New Skill' : 'Edit Skill'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Add' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id || ''} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Skill Name *</label><input className="form-input" value={form.skill_name || ''} onChange={e => onChange('skill_name', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Proficiency Level</label>
                            <select className="form-select" value={form.proficiency_level || 'beginner'} onChange={e => onChange('proficiency_level', e.target.value)}>
                                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="expert">Expert</option>
                            </select></div>
                    </Modal>
                )}
            </div>
        </>
    );
}
