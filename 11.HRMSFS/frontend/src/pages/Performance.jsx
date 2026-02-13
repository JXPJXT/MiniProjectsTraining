import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, Target, Star, MessageSquare, Award, Activity, Download, TrendingUp } from 'lucide-react';
import { SummaryCard, StatusBreakdown, ActivityTimeline, InfoPanel, QuickActions } from '../components/PageDashboard';

export default function Performance() {
    const [tab, setTab] = useState('reviews');
    const [reviews, setReviews] = useState([]);
    const [goals, setGoals] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});
    const [editId, setEditId] = useState(null);

    const load = async () => {
        setLoading(true); try {
            const [r, g, f] = await Promise.all([
                api.get('/performance/reviews?limit=500'),
                api.get('/performance/goals?limit=500'),
                api.get('/performance/feedback?limit=500'),
            ]);
            setReviews(r); setGoals(g); setFeedback(f);
        } catch (e) { console.error(e); } setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => {
        if (tab === 'reviews') setForm({ emp_id: '', reviewer_id: '', review_period: '', overall_rating: '', strengths: '', improvements: '', status: 'draft' });
        if (tab === 'goals') setForm({ emp_id: '', title: '', description: '', target_date: '', status: 'not_started', progress: 0 });
        if (tab === 'feedback') setForm({ from_emp_id: '', to_emp_id: '', feedback_type: 'peer', comments: '', rating: '', is_anonymous: false });
        setEditId(null); setModal('create');
    };
    const save = async () => {
        try {
            const p = { ...form };
            if (tab === 'reviews') {
                p.emp_id = Number(p.emp_id); if (p.reviewer_id) p.reviewer_id = Number(p.reviewer_id); if (p.overall_rating) p.overall_rating = Number(p.overall_rating);
                modal === 'create' ? await api.post('/performance/reviews', p) : await api.put(`/performance/reviews/${editId}`, p);
            }
            if (tab === 'goals') {
                p.emp_id = Number(p.emp_id); if (p.progress) p.progress = Number(p.progress);
                modal === 'create' ? await api.post('/performance/goals', p) : await api.put(`/performance/goals/${editId}`, p);
            }
            if (tab === 'feedback') {
                p.from_emp_id = Number(p.from_emp_id); p.to_emp_id = Number(p.to_emp_id); if (p.rating) p.rating = Number(p.rating);
                modal === 'create' ? await api.post('/performance/feedback', p) : await api.put(`/performance/feedback/${editId}`, p);
            }
            setModal(null); load();
        } catch (e) { alert(e.message); }
    };

    // Stats
    const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + Number(r.overall_rating || 0), 0) / reviews.length).toFixed(1) : '—';
    const completedGoals = goals.filter(g => g.status === 'completed');
    const inProgressGoals = goals.filter(g => g.status === 'in_progress');
    const avgProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + Number(g.progress || 0), 0) / goals.length) : 0;

    // Goal status counts
    const goalStatuses = {};
    goals.forEach(g => { goalStatuses[g.status] = (goalStatuses[g.status] || 0) + 1; });

    const recentActivity = reviews.slice(-5).reverse().map(r => ({
        title: `Emp #${r.emp_id} — ${r.overall_rating || 'N/A'} rating`,
        sub: r.review_period || 'No period',
        color: Number(r.overall_rating) >= 4 ? '#2d8a4e' : Number(r.overall_rating) >= 2.5 ? '#333' : '#d1242f',
    }));

    const reviewCols = [
        { header: 'ID', accessor: 'review_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Reviewer', accessor: 'reviewer_id', width: '80px' },
        { header: 'Period', accessor: 'review_period' },
        { header: 'Rating', accessor: 'overall_rating', width: '80px', render: r => <span className="badge">{r.overall_rating || '—'}</span> },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.review_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/performance/reviews/${r.review_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const goalCols = [
        { header: 'ID', accessor: 'goal_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Title', accessor: 'title' },
        { header: 'Target', accessor: 'target_date', width: '110px' },
        { header: 'Progress', accessor: 'progress', width: '80px', render: r => `${r.progress || 0}%` },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.goal_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/performance/goals/${r.goal_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const feedbackCols = [
        { header: 'ID', accessor: 'feedback_id', width: '60px' },
        { header: 'From', accessor: 'from_emp_id', width: '80px' },
        { header: 'To', accessor: 'to_emp_id', width: '80px' },
        { header: 'Type', accessor: 'feedback_type', width: '100px' },
        { header: 'Rating', accessor: 'rating', width: '80px', render: r => r.rating || '—' },
        { header: 'Comments', accessor: 'comments' },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.feedback_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/performance/feedback/${r.feedback_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const map = { reviews: { cols: reviewCols, data: reviews }, goals: { cols: goalCols, data: goals }, feedback: { cols: feedbackCols, data: feedback } };
    const cur = map[tab];

    return (
        <>
            <Header title="Performance" subtitle="Reviews & Goals" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Performance</h1><p className="page-subtitle">Reviews, Goals & Feedback</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New</button>
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={Star} label="Avg Rating" value={avgRating} sub={`${reviews.length} reviews`} trend={Number(avgRating) >= 3.5 ? 'up' : 'neutral'} />
                    <SummaryCard icon={Target} label="Goals" value={goals.length} sub={`${completedGoals.length} completed`} trend="up" />
                    <SummaryCard icon={TrendingUp} label="Avg Progress" value={`${avgProgress}%`} sub={`${inProgressGoals.length} in progress`} trend="up" />
                    <SummaryCard icon={MessageSquare} label="Feedback" value={feedback.length} sub="Peer & manager" trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'New Review', icon: Star, onClick: () => { setTab('reviews'); openCreate(); } },
                            { label: 'Set Goal', icon: Target, onClick: () => { setTab('goals'); openCreate(); } },
                            { label: 'Export', icon: Download, onClick: () => alert('Coming soon') },
                        ]} />

                        <div className="tabs">
                            <button className={`tab ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>Reviews</button>
                            <button className={`tab ${tab === 'goals' ? 'active' : ''}`} onClick={() => setTab('goals')}>Goals</button>
                            <button className={`tab ${tab === 'feedback' ? 'active' : ''}`} onClick={() => setTab('feedback')}>Feedback</button>
                        </div>
                        <DataTable columns={cur.cols} data={cur.data} loading={loading} searchPlaceholder={`Search ${tab}...`} />
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Goal Progress" icon={Activity}>
                            <StatusBreakdown items={[
                                { label: 'Completed', count: completedGoals.length, color: '#333' },
                                { label: 'In Progress', count: inProgressGoals.length, color: '#888' },
                                { label: 'Not Started', count: goalStatuses.not_started || 0, color: '#ccc' },
                            ]} />
                        </InfoPanel>

                        <InfoPanel title="Rating Distribution" icon={Award}>
                            <div className="stat-row" style={{ border: '1px solid var(--border-color)' }}>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{reviews.filter(r => Number(r.overall_rating) >= 4).length}</div>
                                    <div className="stat-row-label">High (4+)</div>
                                </div>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{reviews.filter(r => Number(r.overall_rating) >= 2.5 && Number(r.overall_rating) < 4).length}</div>
                                    <div className="stat-row-label">Mid</div>
                                </div>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{reviews.filter(r => Number(r.overall_rating) < 2.5).length}</div>
                                    <div className="stat-row-label">Low</div>
                                </div>
                            </div>
                        </InfoPanel>

                        <InfoPanel title="Recent Reviews" icon={Star}>
                            {recentActivity.length > 0 ? (
                                <ActivityTimeline items={recentActivity} />
                            ) : (
                                <div className="empty-state" style={{ padding: 20 }}><p>No reviews yet</p></div>
                            )}
                        </InfoPanel>
                    </div>
                </div>

                {/* Modals */}
                {modal && tab === 'reviews' && (
                    <Modal title={modal === 'create' ? 'New Review' : 'Edit Review'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id || ''} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Reviewer ID</label><input className="form-input" type="number" value={form.reviewer_id || ''} onChange={e => onChange('reviewer_id', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Period</label><input className="form-input" value={form.review_period || ''} onChange={e => onChange('review_period', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Rating (1-5)</label><input className="form-input" type="number" min="1" max="5" step="0.5" value={form.overall_rating || ''} onChange={e => onChange('overall_rating', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Strengths</label><textarea className="form-input" rows="2" value={form.strengths || ''} onChange={e => onChange('strengths', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Improvements</label><textarea className="form-input" rows="2" value={form.improvements || ''} onChange={e => onChange('improvements', e.target.value)} /></div>
                    </Modal>
                )}
                {modal && tab === 'goals' && (
                    <Modal title={modal === 'create' ? 'New Goal' : 'Edit Goal'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id || ''} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Target Date</label><input className="form-input" type="date" value={form.target_date || ''} onChange={e => onChange('target_date', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title || ''} onChange={e => onChange('title', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="2" value={form.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Progress (%)</label><input className="form-input" type="number" min="0" max="100" value={form.progress || 0} onChange={e => onChange('progress', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-select" value={form.status || 'not_started'} onChange={e => onChange('status', e.target.value)}>
                                    <option value="not_started">Not Started</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                                </select></div>
                        </div>
                    </Modal>
                )}
                {modal && tab === 'feedback' && (
                    <Modal title={modal === 'create' ? 'New Feedback' : 'Edit Feedback'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Submit' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">From Emp ID *</label><input className="form-input" type="number" value={form.from_emp_id || ''} onChange={e => onChange('from_emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">To Emp ID *</label><input className="form-input" type="number" value={form.to_emp_id || ''} onChange={e => onChange('to_emp_id', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Type</label>
                                <select className="form-select" value={form.feedback_type || 'peer'} onChange={e => onChange('feedback_type', e.target.value)}>
                                    <option value="peer">Peer</option><option value="manager">Manager</option><option value="self">Self</option><option value="360">360°</option>
                                </select></div>
                            <div className="form-group"><label className="form-label">Rating</label><input className="form-input" type="number" min="1" max="5" step="0.5" value={form.rating || ''} onChange={e => onChange('rating', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Comments</label><textarea className="form-input" rows="3" value={form.comments || ''} onChange={e => onChange('comments', e.target.value)} /></div>
                    </Modal>
                )}
            </div>
        </>
    );
}
