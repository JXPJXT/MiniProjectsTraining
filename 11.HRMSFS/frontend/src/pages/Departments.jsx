import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const EMPTY = { dept_name: '', location: '', parent_dept_id: '', manager_emp_id: '' };

export default function Departments() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [editId, setEditId] = useState(null);

    const load = async () => { setLoading(true); try { setData(await api.get('/departments?limit=500')); } catch (e) { console.error(e); } setLoading(false); };
    useEffect(() => { load(); }, []);

    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setModal('create'); };
    const openEdit = (r) => { setForm({ ...r }); setEditId(r.dept_id); setModal('edit'); };

    const save = async () => {
        try {
            const p = { ...form };
            ['parent_dept_id', 'manager_emp_id'].forEach(k => { if (p[k] === '') delete p[k]; else p[k] = Number(p[k]); });
            modal === 'create' ? await api.post('/departments', p) : await api.put(`/departments/${editId}`, p);
            setModal(null); load();
        } catch (e) { alert(e.message); }
    };

    const remove = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/departments/${id}`); load(); } catch (e) { alert(e.message); } };

    const columns = [
        { header: 'ID', accessor: 'dept_id', width: '60px' },
        { header: 'Name', accessor: 'dept_name' },
        { header: 'Location', accessor: 'location' },
        { header: 'Manager ID', accessor: 'manager_emp_id', width: '100px' },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); remove(r.dept_id); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    return (
        <>
            <Header title="Departments" subtitle="Organization Structure" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Departments</h1><p className="page-subtitle">{data.length} departments</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Department</button>
                </div>
                <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search departments..." />
                {modal && (
                    <Modal title={modal === 'create' ? 'New Department' : 'Edit Department'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Department Name *</label><input className="form-input" value={form.dept_name} onChange={e => onChange('dept_name', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location || ''} onChange={e => onChange('location', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Parent Dept ID</label><input className="form-input" type="number" value={form.parent_dept_id || ''} onChange={e => onChange('parent_dept_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Manager Emp ID</label><input className="form-input" type="number" value={form.manager_emp_id || ''} onChange={e => onChange('manager_emp_id', e.target.value)} /></div>
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
}
