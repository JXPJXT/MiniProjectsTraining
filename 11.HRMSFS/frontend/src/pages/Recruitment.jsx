import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Recruitment() {
    const [tab, setTab] = useState('candidates');
    const [candidates, setCandidates] = useState([]);
    const [requisitions, setRequisitions] = useState([]);
    const [applications, setApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});
    const [editId, setEditId] = useState(null);

    const load = async () => {
        setLoading(true); try {
            const [c, r, a, i] = await Promise.all([api.get('/candidates?limit=500'), api.get('/job-requisitions?limit=500'), api.get('/job-applications?limit=500'), api.get('/interviews?limit=500')]);
            setCandidates(c); setRequisitions(r); setApplications(a); setInterviews(i);
        } catch (e) { console.error(e); } setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const openCreate = () => {
        if (tab === 'candidates') setForm({ first_name: '', last_name: '', email: '', phone: '', source: '', status: 'new' });
        if (tab === 'requisitions') setForm({ title: '', openings: 1, posted_date: '', closing_date: '', status: 'open' });
        setEditId(null); setModal('create');
    };
    const openEdit = (r) => { setForm({ ...r }); setEditId(tab === 'candidates' ? r.candidate_id : r.requisition_id); setModal('edit'); };

    const save = async () => {
        try {
            const p = { ...form };
            if (tab === 'candidates') { modal === 'create' ? await api.post('/candidates', p) : await api.put(`/candidates/${editId}`, p); }
            if (tab === 'requisitions') { if (p.openings) p.openings = Number(p.openings); modal === 'create' ? await api.post('/job-requisitions', p) : await api.put(`/job-requisitions/${editId}`, p); }
            setModal(null); load();
        } catch (e) { alert(e.message); }
    };

    const candCols = [
        { header: 'ID', accessor: 'candidate_id', width: '60px' },
        { header: 'Name', key: 'name', render: r => `${r.first_name} ${r.last_name}` },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Source', accessor: 'source', width: '100px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/candidates/${r.candidate_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const reqCols = [
        { header: 'ID', accessor: 'requisition_id', width: '60px' },
        { header: 'Title', accessor: 'title' },
        { header: 'Openings', accessor: 'openings', width: '80px' },
        { header: 'Posted', accessor: 'posted_date', width: '110px' },
        { header: 'Closing', accessor: 'closing_date', width: '110px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/job-requisitions/${r.requisition_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const appCols = [
        { header: 'ID', accessor: 'application_id', width: '60px' },
        { header: 'Req ID', accessor: 'requisition_id', width: '80px' },
        { header: 'Candidate ID', accessor: 'candidate_id', width: '100px' },
        { header: 'Applied', accessor: 'applied_date', width: '110px' },
        { header: 'Stage', accessor: 'current_stage' },
        { header: 'Score', accessor: 'score', width: '70px' },
    ];

    const intCols = [
        { header: 'ID', accessor: 'interview_id', width: '60px' },
        { header: 'App ID', accessor: 'application_id', width: '80px' },
        { header: 'Interviewer', accessor: 'interviewer_id', width: '100px' },
        { header: 'Scheduled', accessor: 'scheduled_at' },
        { header: 'Rating', accessor: 'rating', width: '70px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
    ];

    const tableMap = { candidates: { cols: candCols, data: candidates }, requisitions: { cols: reqCols, data: requisitions }, applications: { cols: appCols, data: applications }, interviews: { cols: intCols, data: interviews } };
    const cur = tableMap[tab];

    return (
        <>
            <Header title="Recruitment" subtitle="Talent Acquisition" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Recruitment</h1><p className="page-subtitle">Manage hiring pipeline</p></div>
                    {(tab === 'candidates' || tab === 'requisitions') && <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New</button>}
                </div>
                <div className="tabs">
                    {['candidates', 'requisitions', 'applications', 'interviews'].map(t => (
                        <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                    ))}
                </div>
                <DataTable columns={cur.cols} data={cur.data} loading={loading} searchPlaceholder={`Search ${tab}...`} />
                {modal && tab === 'candidates' && (
                    <Modal title={modal === 'create' ? 'New Candidate' : 'Edit Candidate'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.first_name || ''} onChange={e => onChange('first_name', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.last_name || ''} onChange={e => onChange('last_name', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email || ''} onChange={e => onChange('email', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone || ''} onChange={e => onChange('phone', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Source</label><input className="form-input" value={form.source || ''} onChange={e => onChange('source', e.target.value)} /></div>
                        </div>
                    </Modal>
                )}
                {modal && tab === 'requisitions' && (
                    <Modal title={modal === 'create' ? 'New Requisition' : 'Edit Requisition'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title || ''} onChange={e => onChange('title', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Openings</label><input className="form-input" type="number" value={form.openings || 1} onChange={e => onChange('openings', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-select" value={form.status || 'open'} onChange={e => onChange('status', e.target.value)}>
                                    <option value="open">Open</option><option value="closed">Closed</option><option value="filled">Filled</option>
                                </select></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Posted Date</label><input className="form-input" type="date" value={form.posted_date || ''} onChange={e => onChange('posted_date', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Closing Date</label><input className="form-input" type="date" value={form.closing_date || ''} onChange={e => onChange('closing_date', e.target.value)} /></div>
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
}
