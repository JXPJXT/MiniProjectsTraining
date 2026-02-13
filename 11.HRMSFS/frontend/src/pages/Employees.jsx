import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, Users, UserCheck, UserX, Download, Building2, CalendarDays, Activity } from 'lucide-react';
import { SummaryCard, StatusBreakdown, ActivityTimeline, InfoPanel, QuickActions } from '../components/PageDashboard';

const EMPTY = {
    employee_code: '', first_name: '', last_name: '', email: '',
    phone: '', hire_date: '', status: 'active', dept_id: '', position_id: '',
};

export default function Employees() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [editId, setEditId] = useState(null);
    const [filter, setFilter] = useState('all');

    const load = async () => {
        setLoading(true);
        try {
            setData(await api.get('/employees/?limit=500'));
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setModal('create'); };
    const openEdit = (row) => {
        setForm({ ...row });
        setEditId(row.emp_id);
        setModal('edit');
    };

    const save = async () => {
        try {
            const payload = { ...form };
            if (payload.dept_id === '') delete payload.dept_id;
            else payload.dept_id = Number(payload.dept_id);
            if (payload.position_id === '') delete payload.position_id;
            else payload.position_id = Number(payload.position_id);

            if (modal === 'create') {
                await api.post('/employees/', payload);
            } else {
                await api.put(`/employees/${editId}`, payload);
            }
            setModal(null);
            load();
        } catch (e) { alert('Error: ' + e.message); }
    };

    const remove = async (id) => {
        if (!confirm('Delete this employee?')) return;
        try {
            await api.delete(`/employees/${id}`);
            load();
        } catch (e) { alert('Error: ' + e.message); }
    };

    // Computed stats
    const active = data.filter(e => e.status === 'active');
    const inactive = data.filter(e => e.status === 'inactive');
    const terminated = data.filter(e => e.status === 'terminated');

    // Department distribution
    const deptCount = {};
    data.forEach(e => {
        const dept = e.dept_id ? `Dept #${e.dept_id}` : 'Unassigned';
        deptCount[dept] = (deptCount[dept] || 0) + 1;
    });

    // Recent hires
    const recentHires = [...data]
        .sort((a, b) => new Date(b.hire_date || 0) - new Date(a.hire_date || 0))
        .slice(0, 5)
        .map(e => ({
            title: `${e.first_name} ${e.last_name}`,
            sub: e.email || 'No email',
            time: e.hire_date || '',
            color: e.status === 'active' ? '#2d8a4e' : '#999',
        }));

    // Filter data
    const filteredData = filter === 'all' ? data : data.filter(e => e.status === filter);

    const columns = [
        { header: 'Code', accessor: 'employee_code', width: '100px' },
        { header: 'Name', key: 'name', render: r => `${r.first_name} ${r.last_name}` },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Hire Date', accessor: 'hire_date', width: '110px' },
        {
            header: 'Status', accessor: 'status', width: '100px',
            render: r => <span className={`badge badge-${r.status}`}>{r.status}</span>
        },
        {
            header: '', key: 'actions', width: '80px',
            render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); remove(r.emp_id); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const formFields = (
        <>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Employee Code *</label>
                    <input className="form-input" value={form.employee_code} onChange={e => onChange('employee_code', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => onChange('status', e.target.value)}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="terminated">Terminated</option>
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-input" value={form.first_name} onChange={e => onChange('first_name', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-input" value={form.last_name} onChange={e => onChange('last_name', e.target.value)} />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => onChange('email', e.target.value)} />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone || ''} onChange={e => onChange('phone', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Hire Date *</label>
                    <input className="form-input" type="date" value={form.hire_date} onChange={e => onChange('hire_date', e.target.value)} />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Department ID</label>
                    <input className="form-input" type="number" value={form.dept_id || ''} onChange={e => onChange('dept_id', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Position ID</label>
                    <input className="form-input" type="number" value={form.position_id || ''} onChange={e => onChange('position_id', e.target.value)} />
                </div>
            </div>
        </>
    );

    return (
        <>
            <Header title="Employees" subtitle="People Management" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Employees</h1>
                        <p className="page-subtitle">{data.length} total records</p>
                    </div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Employee</button>
                </div>

                {/* Summary Cards */}
                <div className="summary-grid">
                    <SummaryCard icon={Users} label="Total Employees" value={data.length} sub="Across all departments" trend="neutral" />
                    <SummaryCard icon={UserCheck} label="Active" value={active.length} sub={`${Math.round(data.length > 0 ? (active.length / data.length) * 100 : 0)}% of workforce`} trend="up" />
                    <SummaryCard icon={UserX} label="Inactive" value={inactive.length} sub="On leave or suspended" trend={inactive.length > 0 ? 'down' : 'neutral'} />
                    <SummaryCard icon={Building2} label="Departments" value={Object.keys(deptCount).length} sub="Active org units" trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        {/* Quick Actions */}
                        <QuickActions actions={[
                            { label: 'Add Employee', icon: Plus, onClick: openCreate },
                            { label: 'Export CSV', icon: Download, onClick: () => alert('Export feature — coming soon') },
                        ]} />

                        {/* Filter Pills */}
                        <div className="filter-pills">
                            {['all', 'active', 'inactive', 'terminated'].map(f => (
                                <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        <DataTable
                            columns={columns}
                            data={filteredData}
                            loading={loading}
                            searchPlaceholder="Search employees..."
                        />
                    </div>

                    <div className="page-aside">
                        {/* Status Breakdown */}
                        <InfoPanel title="Status Overview" icon={Activity}>
                            <StatusBreakdown items={[
                                { label: 'Active', count: active.length, color: '#333' },
                                { label: 'Inactive', count: inactive.length, color: '#999' },
                                { label: 'Terminated', count: terminated.length, color: '#ccc' },
                            ]} />
                        </InfoPanel>

                        {/* Department Distribution */}
                        <InfoPanel title="By Department" icon={Building2}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {Object.entries(deptCount).slice(0, 8).map(([dept, count]) => (
                                    <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem' }}>{dept}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="progress-bar" style={{ width: 60, marginTop: 0 }}>
                                                <div className="progress-fill" style={{ width: `${(count / data.length) * 100}%` }} />
                                            </div>
                                            <span className="status-count">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </InfoPanel>

                        {/* Recent Hires */}
                        <InfoPanel title="Recent Hires" icon={CalendarDays}>
                            {recentHires.length > 0 ? (
                                <ActivityTimeline items={recentHires} />
                            ) : (
                                <div className="empty-state" style={{ padding: 20 }}><p>No employees yet</p></div>
                            )}
                        </InfoPanel>
                    </div>
                </div>

                {modal && (
                    <Modal
                        title={modal === 'create' ? 'New Employee' : 'Edit Employee'}
                        onClose={() => setModal(null)}
                        footer={
                            <>
                                <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                                <button className="btn btn-primary" onClick={save}>
                                    {modal === 'create' ? 'Create' : 'Update'}
                                </button>
                            </>
                        }
                    >
                        {formFields}
                    </Modal>
                )}
            </div>
        </>
    );
}
