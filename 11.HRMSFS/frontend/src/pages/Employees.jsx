import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const EMPTY = {
    employee_code: '', first_name: '', last_name: '', email: '',
    phone: '', hire_date: '', status: 'active', dept_id: '', position_id: '',
};

export default function Employees() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // 'create' | 'edit'
    const [form, setForm] = useState({ ...EMPTY });
    const [editId, setEditId] = useState(null);

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
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Employees</h1>
                        <p className="page-subtitle">{data.length} records</p>
                    </div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Employee</button>
                </div>

                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    searchPlaceholder="Search employees..."
                />

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
