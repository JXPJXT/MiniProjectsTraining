import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import { api } from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function Benefits() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ name: '', category: '', description: '', employer_contrib: '', employee_contrib: '', is_active: true });
    const [editId, setEditId] = useState(null);

    const load = async () => { setLoading(true); try { setData(await api.get('/benefits?limit=500')); } catch (e) { console.error(e); } setLoading(false); };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => { setForm({ name: '', category: '', description: '', employer_contrib: '', employee_contrib: '', is_active: true }); setEditId(null); setModal('create'); };
    const openEdit = (r) => { setForm({ ...r }); setEditId(r.benefit_id); setModal('edit'); };
    const save = async () => {
        try {
            const p = { ...form }; if (p.employer_contrib) p.employer_contrib = Number(p.employer_contrib); else delete p.employer_contrib; if (p.employee_contrib) p.employee_contrib = Number(p.employee_contrib); else delete p.employee_contrib;
            modal === 'create' ? await api.post('/benefits', p) : await api.put(`/benefits/${editId}`, p); setModal(null); load();
        } catch (e) { alert(e.message); }
    };
    const remove = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/benefits/${id}`); load(); } catch (e) { alert(e.message); } };

    const columns = [
        { header: 'ID', accessor: 'benefit_id', width: '60px' },
        { header: 'Name', accessor: 'name' },
        { header: 'Category', accessor: 'category', width: '120px' },
        { header: 'Employer', accessor: 'employer_contrib', width: '100px', render: r => r.employer_contrib ? `₹${Number(r.employer_contrib).toLocaleString()}` : '—' },
        { header: 'Employee', accessor: 'employee_contrib', width: '100px', render: r => r.employee_contrib ? `₹${Number(r.employee_contrib).toLocaleString()}` : '—' },
        { header: 'Active', accessor: 'is_active', width: '80px', render: r => <span className={`badge ${r.is_active ? 'badge-active' : 'badge-inactive'}`}>{r.is_active ? 'Yes' : 'No'}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); remove(r.benefit_id); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    return (
        <>
            <Header title="Benefits" subtitle="Employee Benefits" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Benefits</h1><p className="page-subtitle">{data.length} benefit plans</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Benefit</button>
                </div>
                <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search benefits..." />
                {modal && (
                    <Modal title={modal === 'create' ? 'New Benefit' : 'Edit Benefit'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => onChange('name', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={form.category || ''} onChange={e => onChange('category', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="2" value={form.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employer Contribution</label><input className="form-input" type="number" value={form.employer_contrib || ''} onChange={e => onChange('employer_contrib', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Employee Contribution</label><input className="form-input" type="number" value={form.employee_contrib || ''} onChange={e => onChange('employee_contrib', e.target.value)} /></div>
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
}
