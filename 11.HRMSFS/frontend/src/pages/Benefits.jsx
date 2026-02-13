import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, Heart, Shield, Users, Download, Activity } from 'lucide-react';
import { SummaryCard, StatusBreakdown, InfoPanel, QuickActions } from '../components/PageDashboard';

export default function Benefits() {
    const [tab, setTab] = useState('plans');
    const [plans, setPlans] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});
    const [editId, setEditId] = useState(null);

    const load = async () => {
        setLoading(true); try {
            const [p, e] = await Promise.all([api.get('/benefits/plans?limit=500'), api.get('/benefits/enrollments?limit=500')]);
            setPlans(p); setEnrollments(e);
        } catch (e) { console.error(e); } setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => {
        if (tab === 'plans') setForm({ name: '', type: 'health', description: '', employer_contribution: '', employee_contribution: '', is_active: true });
        if (tab === 'enrollments') setForm({ emp_id: '', plan_id: '', coverage_start: '', coverage_end: '', status: 'active' });
        setEditId(null); setModal('create');
    };
    const save = async () => {
        try {
            const p = { ...form };
            if (tab === 'plans') {
                if (p.employer_contribution) p.employer_contribution = Number(p.employer_contribution); else delete p.employer_contribution;
                if (p.employee_contribution) p.employee_contribution = Number(p.employee_contribution); else delete p.employee_contribution;
                modal === 'create' ? await api.post('/benefits/plans', p) : await api.put(`/benefits/plans/${editId}`, p);
            }
            if (tab === 'enrollments') {
                p.emp_id = Number(p.emp_id); p.plan_id = Number(p.plan_id);
                modal === 'create' ? await api.post('/benefits/enrollments', p) : await api.put(`/benefits/enrollments/${editId}`, p);
            }
            setModal(null); load();
        } catch (e) { alert(e.message); }
    };

    // Stats
    const activePlans = plans.filter(p => p.is_active);
    const activeEnrollments = enrollments.filter(e => e.status === 'active');
    const planTypes = {}; plans.forEach(p => { planTypes[p.type] = (planTypes[p.type] || 0) + 1; });
    const totalContrib = plans.reduce((s, p) => s + Number(p.employer_contribution || 0), 0);

    const planCols = [
        { header: 'ID', accessor: 'plan_id', width: '60px' },
        { header: 'Name', accessor: 'name' },
        { header: 'Type', accessor: 'type', width: '100px' },
        { header: 'Employer', accessor: 'employer_contribution', width: '100px', render: r => r.employer_contribution ? `₹${Number(r.employer_contribution).toLocaleString()}` : '—' },
        { header: 'Employee', accessor: 'employee_contribution', width: '100px', render: r => r.employee_contribution ? `₹${Number(r.employee_contribution).toLocaleString()}` : '—' },
        { header: 'Active', accessor: 'is_active', width: '80px', render: r => <span className={`badge ${r.is_active ? 'badge-active' : 'badge-inactive'}`}>{r.is_active ? 'Yes' : 'No'}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.plan_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/benefits/plans/${r.plan_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const enrollCols = [
        { header: 'ID', accessor: 'enrollment_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Plan ID', accessor: 'plan_id', width: '80px' },
        { header: 'Start', accessor: 'coverage_start', width: '110px' },
        { header: 'End', accessor: 'coverage_end', width: '110px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.enrollment_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/benefits/enrollments/${r.enrollment_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const map = { plans: { cols: planCols, data: plans }, enrollments: { cols: enrollCols, data: enrollments } };
    const cur = map[tab];

    return (
        <>
            <Header title="Benefits" subtitle="Employee Wellness" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Benefits</h1><p className="page-subtitle">Plans & Enrollments</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New</button>
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={Shield} label="Plans" value={plans.length} sub={`${activePlans.length} active`} trend="neutral" />
                    <SummaryCard icon={Users} label="Enrollments" value={enrollments.length} sub={`${activeEnrollments.length} active`} trend="up" />
                    <SummaryCard icon={Heart} label="Employer Cost" value={`₹${(totalContrib / 1000).toFixed(0)}K`} sub="Total contributions" trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'Add Plan', icon: Shield, onClick: () => { setTab('plans'); openCreate(); } },
                            { label: 'Enroll', icon: Users, onClick: () => { setTab('enrollments'); openCreate(); } },
                            { label: 'Export', icon: Download, onClick: () => alert('Coming soon') },
                        ]} />

                        <div className="tabs">
                            <button className={`tab ${tab === 'plans' ? 'active' : ''}`} onClick={() => setTab('plans')}>Plans</button>
                            <button className={`tab ${tab === 'enrollments' ? 'active' : ''}`} onClick={() => setTab('enrollments')}>Enrollments</button>
                        </div>
                        <DataTable columns={cur.cols} data={cur.data} loading={loading} searchPlaceholder={`Search ${tab}...`} />
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Plan Types" icon={Activity}>
                            <StatusBreakdown items={Object.entries(planTypes).map(([type, count]) => ({
                                label: type.charAt(0).toUpperCase() + type.slice(1),
                                count,
                                color: type === 'health' ? '#333' : type === 'dental' ? '#888' : '#ccc',
                            }))} />
                        </InfoPanel>

                        <InfoPanel title="Coverage" icon={Shield}>
                            <div className="stat-row" style={{ border: '1px solid var(--border-color)' }}>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{activeEnrollments.length}</div>
                                    <div className="stat-row-label">Active</div>
                                </div>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{enrollments.length - activeEnrollments.length}</div>
                                    <div className="stat-row-label">Expired</div>
                                </div>
                            </div>
                        </InfoPanel>
                    </div>
                </div>

                {modal && tab === 'plans' && (
                    <Modal title={modal === 'create' ? 'New Plan' : 'Edit Plan'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name || ''} onChange={e => onChange('name', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Type</label>
                                <select className="form-select" value={form.type || 'health'} onChange={e => onChange('type', e.target.value)}>
                                    <option value="health">Health</option><option value="dental">Dental</option><option value="vision">Vision</option><option value="life">Life</option><option value="retirement">Retirement</option>
                                </select></div>
                            <div className="form-group"><label className="form-label">Employer Contribution</label><input className="form-input" type="number" value={form.employer_contribution || ''} onChange={e => onChange('employer_contribution', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Employee Contribution</label><input className="form-input" type="number" value={form.employee_contribution || ''} onChange={e => onChange('employee_contribution', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="2" value={form.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
                    </Modal>
                )}
                {modal && tab === 'enrollments' && (
                    <Modal title={modal === 'create' ? 'New Enrollment' : 'Edit Enrollment'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Enroll' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id || ''} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Plan ID *</label><input className="form-input" type="number" value={form.plan_id || ''} onChange={e => onChange('plan_id', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Start</label><input className="form-input" type="date" value={form.coverage_start || ''} onChange={e => onChange('coverage_start', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">End</label><input className="form-input" type="date" value={form.coverage_end || ''} onChange={e => onChange('coverage_end', e.target.value)} /></div>
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
}
