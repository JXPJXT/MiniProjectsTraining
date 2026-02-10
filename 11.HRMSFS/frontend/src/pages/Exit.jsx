import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Exit() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ emp_id: '', conducted_by: '', interview_date: '', reason_for_leaving: '', feedback: '', suggestions: '', clearance_status: 'pending' });
    const [editId, setEditId] = useState(null);

    const load = async () => { setLoading(true); try { setData(await api.get('/exit-interviews?limit=500')); } catch (e) { console.error(e); } setLoading(false); };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => { setForm({ emp_id: '', conducted_by: '', interview_date: '', reason_for_leaving: '', feedback: '', suggestions: '', clearance_status: 'pending' }); setEditId(null); setModal('create'); };
    const openEdit = (r) => { setForm({ ...r }); setEditId(r.interview_id); setModal('edit'); };
    const save = async () => {
        try {
            const p = { ...form }; p.emp_id = Number(p.emp_id); if (p.conducted_by) p.conducted_by = Number(p.conducted_by); else delete p.conducted_by;
            modal === 'create' ? await api.post('/exit-interviews', p) : await api.put(`/exit-interviews/${editId}`, p); setModal(null); load();
        } catch (e) { alert(e.message); }
    };
    const remove = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/exit-interviews/${id}`); load(); } catch (e) { alert(e.message); } };

    const columns = [
        { header: 'ID', accessor: 'interview_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Date', accessor: 'interview_date', width: '110px' },
        { header: 'Reason', accessor: 'reason_for_leaving' },
        { header: 'Clearance', accessor: 'clearance_status', width: '110px', render: r => <span className={`badge badge-${r.clearance_status}`}>{r.clearance_status}</span> },
        { header: 'Settlement', accessor: 'final_settlement_done', width: '100px', render: r => r.final_settlement_done ? 'Done' : 'Pending' },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); remove(r.interview_id); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    return (
        <>
            <Header title="Exit" subtitle="Offboarding" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Exit Interviews</h1><p className="page-subtitle">{data.length} records</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Interview</button>
                </div>
                <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search exit interviews..." />
                {modal && (
                    <Modal title={modal === 'create' ? 'New Exit Interview' : 'Edit Exit Interview'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={form.interview_date || ''} onChange={e => onChange('interview_date', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Reason for Leaving</label><textarea className="form-input" rows="2" value={form.reason_for_leaving || ''} onChange={e => onChange('reason_for_leaving', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Feedback</label><textarea className="form-input" rows="2" value={form.feedback || ''} onChange={e => onChange('feedback', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Suggestions</label><textarea className="form-input" rows="2" value={form.suggestions || ''} onChange={e => onChange('suggestions', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Clearance Status</label>
                            <select className="form-select" value={form.clearance_status} onChange={e => onChange('clearance_status', e.target.value)}>
                                <option value="pending">Pending</option><option value="completed">Completed</option>
                            </select></div>
                    </Modal>
                )}
            </div>
        </>
    );
}
