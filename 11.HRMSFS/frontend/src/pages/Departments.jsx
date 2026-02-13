import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, Building2, Users, Briefcase, Activity, Download } from 'lucide-react';
import { SummaryCard, StatusBreakdown, ActivityTimeline, InfoPanel, QuickActions } from '../components/PageDashboard';

export default function Departments() {
    const [tab, setTab] = useState('departments');
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});
    const [editId, setEditId] = useState(null);

    const load = async () => {
        setLoading(true); try {
            const [d, p] = await Promise.all([api.get('/departments/?limit=500'), api.get('/positions?limit=500')]);
            setDepartments(d); setPositions(p);
        } catch (e) { console.error(e); } setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => {
        if (tab === 'departments') setForm({ name: '', code: '', description: '', is_active: true });
        if (tab === 'positions') setForm({ title: '', dept_id: '', description: '', is_active: true, min_salary: '', max_salary: '' });
        setEditId(null); setModal('create');
    };

    const save = async () => {
        try {
            const p = { ...form };
            if (tab === 'departments') {
                modal === 'create' ? await api.post('/departments/', p) : await api.put(`/departments/${editId}`, p);
            }
            if (tab === 'positions') {
                if (p.dept_id) p.dept_id = Number(p.dept_id); else delete p.dept_id;
                if (p.min_salary) p.min_salary = Number(p.min_salary); else delete p.min_salary;
                if (p.max_salary) p.max_salary = Number(p.max_salary); else delete p.max_salary;
                modal === 'create' ? await api.post('/positions', p) : await api.put(`/positions/${editId}`, p);
            }
            setModal(null); load();
        } catch (e) { alert(e.message); }
    };

    // Stats
    const activeDepts = departments.filter(d => d.is_active);
    const activePositions = positions.filter(p => p.is_active);

    // Positions per department
    const posPerDept = {};
    positions.forEach(p => {
        const dk = p.dept_id ? `Dept #${p.dept_id}` : 'Unassigned';
        posPerDept[dk] = (posPerDept[dk] || 0) + 1;
    });

    const deptCols = [
        { header: 'ID', accessor: 'dept_id', width: '60px' },
        { header: 'Code', accessor: 'code', width: '100px' },
        { header: 'Name', accessor: 'name' },
        { header: 'Description', accessor: 'description' },
        { header: 'Active', accessor: 'is_active', width: '80px', render: r => <span className={`badge ${r.is_active ? 'badge-active' : 'badge-inactive'}`}>{r.is_active ? 'Yes' : 'No'}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.dept_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/departments/${r.dept_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const posCols = [
        { header: 'ID', accessor: 'position_id', width: '60px' },
        { header: 'Title', accessor: 'title' },
        { header: 'Dept ID', accessor: 'dept_id', width: '80px' },
        { header: 'Min Salary', accessor: 'min_salary', width: '100px', render: r => r.min_salary ? `₹${Number(r.min_salary).toLocaleString()}` : '—' },
        { header: 'Max Salary', accessor: 'max_salary', width: '100px', render: r => r.max_salary ? `₹${Number(r.max_salary).toLocaleString()}` : '—' },
        { header: 'Active', accessor: 'is_active', width: '80px', render: r => <span className={`badge ${r.is_active ? 'badge-active' : 'badge-inactive'}`}>{r.is_active ? 'Yes' : 'No'}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.position_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/positions/${r.position_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const map = { departments: { cols: deptCols, data: departments }, positions: { cols: posCols, data: positions } };
    const cur = map[tab];

    return (
        <>
            <Header title="Departments" subtitle="Organization" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Departments & Positions</h1><p className="page-subtitle">Organizational structure</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New</button>
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={Building2} label="Departments" value={departments.length} sub={`${activeDepts.length} active`} trend="neutral" />
                    <SummaryCard icon={Briefcase} label="Positions" value={positions.length} sub={`${activePositions.length} active`} trend="neutral" />
                    <SummaryCard icon={Users} label="Avg Positions" value={departments.length > 0 ? (positions.length / departments.length).toFixed(1) : 0} sub="Per department" trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'Add Department', icon: Building2, onClick: () => { setTab('departments'); openCreate(); } },
                            { label: 'Add Position', icon: Briefcase, onClick: () => { setTab('positions'); openCreate(); } },
                            { label: 'Export', icon: Download, onClick: () => alert('Coming soon') },
                        ]} />

                        <div className="tabs">
                            <button className={`tab ${tab === 'departments' ? 'active' : ''}`} onClick={() => setTab('departments')}>Departments</button>
                            <button className={`tab ${tab === 'positions' ? 'active' : ''}`} onClick={() => setTab('positions')}>Positions</button>
                        </div>
                        <DataTable columns={cur.cols} data={cur.data} loading={loading} searchPlaceholder={`Search ${tab}...`} />
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Overview" icon={Activity}>
                            <StatusBreakdown items={[
                                { label: 'Active Depts', count: activeDepts.length, color: '#333' },
                                { label: 'Inactive Depts', count: departments.length - activeDepts.length, color: '#ccc' },
                            ]} />
                        </InfoPanel>

                        <InfoPanel title="Positions Per Dept" icon={Building2}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {Object.entries(posPerDept).slice(0, 8).map(([dept, count]) => (
                                    <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem' }}>{dept}</span>
                                        <span className="status-count">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(posPerDept).length === 0 && <div className="empty-state" style={{ padding: 10 }}><p>No data</p></div>}
                            </div>
                        </InfoPanel>
                    </div>
                </div>

                {modal && tab === 'departments' && (
                    <Modal title={modal === 'create' ? 'New Department' : 'Edit Department'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name || ''} onChange={e => onChange('name', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Code</label><input className="form-input" value={form.code || ''} onChange={e => onChange('code', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="2" value={form.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
                    </Modal>
                )}
                {modal && tab === 'positions' && (
                    <Modal title={modal === 'create' ? 'New Position' : 'Edit Position'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title || ''} onChange={e => onChange('title', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Dept ID</label><input className="form-input" type="number" value={form.dept_id || ''} onChange={e => onChange('dept_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Min Salary</label><input className="form-input" type="number" value={form.min_salary || ''} onChange={e => onChange('min_salary', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Max Salary</label><input className="form-input" type="number" value={form.max_salary || ''} onChange={e => onChange('max_salary', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="2" value={form.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
                    </Modal>
                )}
            </div>
        </>
    );
}
