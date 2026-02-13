import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, UserSearch, FileText, Send, CheckCircle, Clock, Download, Activity, Users } from 'lucide-react';
import { SummaryCard, StatusBreakdown, ActivityTimeline, InfoPanel, QuickActions, MiniDonut } from '../components/PageDashboard';

export default function Recruitment() {
    const [tab, setTab] = useState('candidates');
    const [candidates, setCandidates] = useState([]);
    const [requisitions, setRequisitions] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});
    const [editId, setEditId] = useState(null);

    const load = async () => {
        setLoading(true); try {
            const [c, r, a] = await Promise.all([
                api.get('/recruitment/candidates?limit=500'),
                api.get('/recruitment/requisitions?limit=500'),
                api.get('/recruitment/applications?limit=500'),
            ]);
            setCandidates(c); setRequisitions(r); setApplications(a);
        } catch (e) { console.error(e); } setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => {
        if (tab === 'candidates') setForm({ first_name: '', last_name: '', email: '', phone: '', resume_url: '', status: 'new', source: '' });
        if (tab === 'requisitions') setForm({ title: '', dept_id: '', position_id: '', openings: 1, priority: 'medium', status: 'open' });
        if (tab === 'applications') setForm({ candidate_id: '', requisition_id: '', stage: 'applied', applied_date: '' });
        setEditId(null); setModal('create');
    };
    const save = async () => {
        try {
            const p = { ...form };
            if (tab === 'candidates') {
                modal === 'create' ? await api.post('/recruitment/candidates', p) : await api.put(`/recruitment/candidates/${editId}`, p);
            }
            if (tab === 'requisitions') {
                if (p.dept_id) p.dept_id = Number(p.dept_id); else delete p.dept_id;
                if (p.position_id) p.position_id = Number(p.position_id); else delete p.position_id;
                if (p.openings) p.openings = Number(p.openings);
                modal === 'create' ? await api.post('/recruitment/requisitions', p) : await api.put(`/recruitment/requisitions/${editId}`, p);
            }
            if (tab === 'applications') {
                p.candidate_id = Number(p.candidate_id); p.requisition_id = Number(p.requisition_id);
                modal === 'create' ? await api.post('/recruitment/applications', p) : await api.put(`/recruitment/applications/${editId}`, p);
            }
            setModal(null); load();
        } catch (e) { alert(e.message); }
    };

    // Stats
    const openReqs = requisitions.filter(r => r.status === 'open');
    const totalOpenings = requisitions.reduce((s, r) => s + Number(r.openings || 0), 0);
    const stageCount = {};
    applications.forEach(a => { stageCount[a.stage] = (stageCount[a.stage] || 0) + 1; });
    const stageColors = { applied: '#ccc', screening: '#aaa', interview: '#888', offered: '#555', hired: '#333', rejected: '#e0e0e0' };
    const donutSegments = Object.entries(stageCount).map(([stage, count]) => ({
        pct: applications.length > 0 ? (count / applications.length) * 100 : 0,
        color: stageColors[stage] || '#999',
    }));

    const recentApps = applications.slice(-5).reverse().map(a => ({
        title: `Candidate #${a.candidate_id}`,
        sub: `Requisition #${a.requisition_id} — ${a.stage}`,
        color: a.stage === 'hired' ? '#2d8a4e' : a.stage === 'rejected' ? '#d1242f' : '#333',
    }));

    const candCols = [
        { header: 'ID', accessor: 'candidate_id', width: '60px' },
        { header: 'Name', key: 'name', render: r => `${r.first_name || ''} ${r.last_name || ''}`.trim() },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Source', accessor: 'source', width: '100px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.candidate_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/recruitment/candidates/${r.candidate_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const reqCols = [
        { header: 'ID', accessor: 'requisition_id', width: '60px' },
        { header: 'Title', accessor: 'title' },
        { header: 'Dept', accessor: 'dept_id', width: '80px' },
        { header: 'Openings', accessor: 'openings', width: '80px' },
        { header: 'Priority', accessor: 'priority', width: '80px', render: r => <span className={`badge badge-${r.priority}`}>{r.priority}</span> },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.requisition_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/recruitment/requisitions/${r.requisition_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const appCols = [
        { header: 'ID', accessor: 'application_id', width: '60px' },
        { header: 'Candidate', accessor: 'candidate_id', width: '80px' },
        { header: 'Requisition', accessor: 'requisition_id', width: '80px' },
        { header: 'Stage', accessor: 'stage', width: '100px', render: r => <span className={`badge badge-${r.stage}`}>{r.stage}</span> },
        { header: 'Applied', accessor: 'applied_date', width: '110px' },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.application_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/recruitment/applications/${r.application_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const map = { candidates: { cols: candCols, data: candidates }, requisitions: { cols: reqCols, data: requisitions }, applications: { cols: appCols, data: applications } };
    const cur = map[tab];

    return (
        <>
            <Header title="Recruitment" subtitle="Talent Acquisition" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Recruitment</h1><p className="page-subtitle">Pipeline & Candidates</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New</button>
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={Users} label="Candidates" value={candidates.length} sub="In talent pool" trend="up" />
                    <SummaryCard icon={FileText} label="Open Reqs" value={openReqs.length} sub={`${totalOpenings} total openings`} trend="up" />
                    <SummaryCard icon={Send} label="Applications" value={applications.length} sub="Submitted" trend="neutral" />
                    <SummaryCard icon={CheckCircle} label="Hired" value={stageCount.hired || 0} sub="Successful placements" trend="up" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'Add Candidate', icon: UserSearch, onClick: () => { setTab('candidates'); openCreate(); } },
                            { label: 'New Requisition', icon: FileText, onClick: () => { setTab('requisitions'); openCreate(); } },
                            { label: 'Export', icon: Download, onClick: () => alert('Coming soon') },
                        ]} />

                        <div className="tabs">
                            <button className={`tab ${tab === 'candidates' ? 'active' : ''}`} onClick={() => setTab('candidates')}>Candidates</button>
                            <button className={`tab ${tab === 'requisitions' ? 'active' : ''}`} onClick={() => setTab('requisitions')}>Requisitions</button>
                            <button className={`tab ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')}>Applications</button>
                        </div>
                        <DataTable columns={cur.cols} data={cur.data} loading={loading} searchPlaceholder={`Search ${tab}...`} />
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Pipeline Stages" icon={Activity}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div className="donut-wrapper">
                                    <MiniDonut segments={donutSegments.length > 0 ? donutSegments : [{ pct: 100, color: 'var(--border-color)' }]} />
                                    <div className="donut-center-text">
                                        <div className="donut-center-value">{applications.length}</div>
                                        <div className="donut-center-label">Apps</div>
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    {Object.entries(stageCount).map(([stage, count]) => (
                                        <div key={stage} className="status-legend-item" style={{ marginBottom: 4 }}>
                                            <span className="status-dot" style={{ background: stageColors[stage] || '#999' }} />
                                            <span style={{ textTransform: 'capitalize' }}>{stage}</span>
                                            <span className="status-count">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </InfoPanel>

                        <InfoPanel title="Req Priority" icon={Clock}>
                            <StatusBreakdown items={[
                                { label: 'High', count: requisitions.filter(r => r.priority === 'high').length, color: '#333' },
                                { label: 'Medium', count: requisitions.filter(r => r.priority === 'medium').length, color: '#888' },
                                { label: 'Low', count: requisitions.filter(r => r.priority === 'low').length, color: '#ccc' },
                            ]} />
                        </InfoPanel>

                        <InfoPanel title="Recent Applications" icon={Send}>
                            {recentApps.length > 0 ? (
                                <ActivityTimeline items={recentApps} />
                            ) : (
                                <div className="empty-state" style={{ padding: 20 }}><p>No applications yet</p></div>
                            )}
                        </InfoPanel>
                    </div>
                </div>

                {/* Modals */}
                {modal && tab === 'candidates' && (
                    <Modal title={modal === 'create' ? 'New Candidate' : 'Edit Candidate'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.first_name || ''} onChange={e => onChange('first_name', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.last_name || ''} onChange={e => onChange('last_name', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email || ''} onChange={e => onChange('email', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone || ''} onChange={e => onChange('phone', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Source</label><input className="form-input" value={form.source || ''} onChange={e => onChange('source', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Resume URL</label><input className="form-input" value={form.resume_url || ''} onChange={e => onChange('resume_url', e.target.value)} /></div>
                    </Modal>
                )}
                {modal && tab === 'requisitions' && (
                    <Modal title={modal === 'create' ? 'New Requisition' : 'Edit Requisition'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title || ''} onChange={e => onChange('title', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Dept ID</label><input className="form-input" type="number" value={form.dept_id || ''} onChange={e => onChange('dept_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Openings</label><input className="form-input" type="number" value={form.openings || 1} onChange={e => onChange('openings', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Priority</label>
                                <select className="form-select" value={form.priority || 'medium'} onChange={e => onChange('priority', e.target.value)}>
                                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                                </select></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-select" value={form.status || 'open'} onChange={e => onChange('status', e.target.value)}>
                                    <option value="open">Open</option><option value="closed">Closed</option><option value="on_hold">On Hold</option>
                                </select></div>
                        </div>
                    </Modal>
                )}
                {modal && tab === 'applications' && (
                    <Modal title={modal === 'create' ? 'New Application' : 'Edit Application'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Submit' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Candidate ID *</label><input className="form-input" type="number" value={form.candidate_id || ''} onChange={e => onChange('candidate_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Requisition ID *</label><input className="form-input" type="number" value={form.requisition_id || ''} onChange={e => onChange('requisition_id', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Stage</label>
                                <select className="form-select" value={form.stage || 'applied'} onChange={e => onChange('stage', e.target.value)}>
                                    <option value="applied">Applied</option><option value="screening">Screening</option><option value="interview">Interview</option><option value="offered">Offered</option><option value="hired">Hired</option><option value="rejected">Rejected</option>
                                </select></div>
                            <div className="form-group"><label className="form-label">Applied Date</label><input className="form-input" type="date" value={form.applied_date || ''} onChange={e => onChange('applied_date', e.target.value)} /></div>
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
}
