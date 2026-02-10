import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const EMPTY = { emp_id: '', leave_type: 'annual', start_date: '', end_date: '', days_requested: '', status: 'pending', remarks: '' };

export default function Leave() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [editId, setEditId] = useState(null);

    const load = async () => { setLoading(true); try { setData(await api.get('/leave-requests?limit=500')); } catch (e) { console.error(e); } setLoading(false); };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setModal('create'); };
    const openEdit = (r) => { setForm({ ...r }); setEditId(r.id); setModal('edit'); };
    const save = async () => {
        try {
            const p = { ...form }; p.emp_id = Number(p.emp_id); if (p.days_requested) p.days_requested = Number(p.days_requested); else delete p.days_requested;
            modal === 'create' ? await api.post('/leave-requests', p) : await api.put(`/leave-requests/${editId}`, p); setModal(null); load();
        } catch (e) { alert(e.message); }
    };
    const remove = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/leave-requests/${id}`); load(); } catch (e) { alert(e.message); } };

    const columns = [
        { header: 'ID', accessor: 'id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Type', accessor: 'leave_type', width: '100px' },
        { header: 'From', accessor: 'start_date', width: '110px' },
        { header: 'To', accessor: 'end_date', width: '110px' },
        { header: 'Days', accessor: 'days_requested', width: '60px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); remove(r.id); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    return (
        <>
            <Header title="Leave" subtitle="Leave Management" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Leave Requests</h1><p className="page-subtitle">{data.length} requests</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Request</button>
                </div>
                <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search leave requests..." />
                {modal && (
                    <Modal title={modal === 'create' ? 'New Leave Request' : 'Edit Leave Request'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Submit' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Leave Type</label>
                                <select className="form-select" value={form.leave_type} onChange={e => onChange('leave_type', e.target.value)}>
                                    <option value="annual">Annual</option><option value="sick">Sick</option><option value="casual">Casual</option><option value="maternity">Maternity</option><option value="paternity">Paternity</option><option value="unpaid">Unpaid</option>
                                </select></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Start Date *</label><input className="form-input" type="date" value={form.start_date} onChange={e => onChange('start_date', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">End Date *</label><input className="form-input" type="date" value={form.end_date} onChange={e => onChange('end_date', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Days</label><input className="form-input" type="number" step="0.5" value={form.days_requested || ''} onChange={e => onChange('days_requested', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-select" value={form.status} onChange={e => onChange('status', e.target.value)}>
                                    <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
                                </select></div>
                        </div>
                        <div className="form-group"><label className="form-label">Remarks</label><input className="form-input" value={form.remarks || ''} onChange={e => onChange('remarks', e.target.value)} /></div>
                    </Modal>
                )}
            </div>
        </>
    );
}
