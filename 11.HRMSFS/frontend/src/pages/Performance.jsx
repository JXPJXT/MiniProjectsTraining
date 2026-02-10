import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';

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
            const [r, g, f] = await Promise.all([api.get('/performance-reviews?limit=500'), api.get('/performance-goals?limit=500'), api.get('/performance-feedback?limit=500')]);
            setReviews(r); setGoals(g); setFeedback(f);
        } catch (e) { console.error(e); } setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const openCreate = () => {
        if (tab === 'reviews') setForm({ emp_id: '', reviewer_id: '', period_start: '', period_end: '', overall_rating: '', status: 'draft', comments: '' });
        if (tab === 'goals') setForm({ emp_id: '', title: '', target_date: '', progress_percentage: 0, status: 'active' });
        if (tab === 'feedback') setForm({ emp_id: '', giver_id: '', feedback_text: '', feedback_date: '', is_anonymous: false });
        setEditId(null); setModal('create');
    };

    const save = async () => {
        try {
            const p = { ...form }; p.emp_id = Number(p.emp_id);
            if (tab === 'reviews') {
                if (p.reviewer_id) p.reviewer_id = Number(p.reviewer_id); else delete p.reviewer_id; if (p.overall_rating) p.overall_rating = Number(p.overall_rating); else delete p.overall_rating;
                modal === 'create' ? await api.post('/performance-reviews', p) : await api.put(`/performance-reviews/${editId}`, p);
            }
            if (tab === 'goals') {
                if (p.progress_percentage) p.progress_percentage = Number(p.progress_percentage);
                modal === 'create' ? await api.post('/performance-goals', p) : await api.put(`/performance-goals/${editId}`, p);
            }
            if (tab === 'feedback') {
                if (p.giver_id) p.giver_id = Number(p.giver_id); else delete p.giver_id;
                modal === 'create' ? await api.post('/performance-feedback', p) : await api.put(`/performance-feedback/${editId}`, p);
            }
            setModal(null); load();
        } catch (e) { alert(e.message); }
    };

    const revCols = [
        { header: 'ID', accessor: 'review_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Reviewer', accessor: 'reviewer_id', width: '80px' },
        { header: 'Period', key: 'period', render: r => `${r.period_start || ''} → ${r.period_end || ''}` },
        { header: 'Rating', accessor: 'overall_rating', width: '70px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.review_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/performance-reviews/${r.review_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const goalCols = [
        { header: 'ID', accessor: 'goal_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Title', accessor: 'title' },
        { header: 'Target', accessor: 'target_date', width: '110px' },
        { header: 'Progress', accessor: 'progress_percentage', width: '80px', render: r => `${r.progress_percentage || 0}%` },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.goal_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/performance-goals/${r.goal_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const fbCols = [
        { header: 'ID', accessor: 'feedback_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Giver', accessor: 'giver_id', width: '80px' },
        { header: 'Date', accessor: 'feedback_date', width: '110px' },
        { header: 'Feedback', accessor: 'feedback_text' },
        { header: 'Anon', accessor: 'is_anonymous', width: '60px', render: r => r.is_anonymous ? 'Yes' : 'No' },
    ];

    const tableMap = { reviews: { cols: revCols, data: reviews }, goals: { cols: goalCols, data: goals }, feedback: { cols: fbCols, data: feedback } };
    const cur = tableMap[tab];

    return (
        <>
            <Header title="Performance" subtitle="Reviews & Goals" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Performance</h1><p className="page-subtitle">Reviews, goals & feedback</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New</button>
                </div>
                <div className="tabs">
                    {['reviews', 'goals', 'feedback'].map(t => (
                        <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                    ))}
                </div>
                <DataTable columns={cur.cols} data={cur.data} loading={loading} searchPlaceholder={`Search ${tab}...`} />
                {modal && tab === 'reviews' && (
                    <Modal title={modal === 'create' ? 'New Review' : 'Edit Review'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id || ''} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Reviewer ID</label><input className="form-input" type="number" value={form.reviewer_id || ''} onChange={e => onChange('reviewer_id', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Period Start *</label><input className="form-input" type="date" value={form.period_start || ''} onChange={e => onChange('period_start', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Period End *</label><input className="form-input" type="date" value={form.period_end || ''} onChange={e => onChange('period_end', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Rating (1-5)</label><input className="form-input" type="number" min="1" max="5" step="0.5" value={form.overall_rating || ''} onChange={e => onChange('overall_rating', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-select" value={form.status || 'draft'} onChange={e => onChange('status', e.target.value)}>
                                    <option value="draft">Draft</option><option value="submitted">Submitted</option><option value="completed">Completed</option>
                                </select></div>
                        </div>
                        <div className="form-group"><label className="form-label">Comments</label><input className="form-input" value={form.comments || ''} onChange={e => onChange('comments', e.target.value)} /></div>
                    </Modal>
                )}
                {modal && tab === 'goals' && (
                    <Modal title={modal === 'create' ? 'New Goal' : 'Edit Goal'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id || ''} onChange={e => onChange('emp_id', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title || ''} onChange={e => onChange('title', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Target Date</label><input className="form-input" type="date" value={form.target_date || ''} onChange={e => onChange('target_date', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Progress %</label><input className="form-input" type="number" min="0" max="100" value={form.progress_percentage || 0} onChange={e => onChange('progress_percentage', e.target.value)} /></div>
                        </div>
                    </Modal>
                )}
                {modal && tab === 'feedback' && (
                    <Modal title="New Feedback" onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Submit</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id || ''} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.feedback_date || ''} onChange={e => onChange('feedback_date', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Feedback *</label><textarea className="form-input" rows="3" value={form.feedback_text || ''} onChange={e => onChange('feedback_text', e.target.value)} /></div>
                    </Modal>
                )}
            </div>
        </>
    );
}
