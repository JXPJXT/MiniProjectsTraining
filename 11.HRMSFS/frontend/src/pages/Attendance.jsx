import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const EMPTY = { emp_id: '', record_date: '', shift_id: '', clock_in: '', clock_out: '', total_hours: '', overtime_hours: '0', status: 'present', remarks: '', approved: false };

export default function Attendance() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [editId, setEditId] = useState(null);

    const load = async () => { setLoading(true); try { setData(await api.get('/attendance?limit=500')); } catch (e) { console.error(e); } setLoading(false); };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setModal('create'); };
    const openEdit = (r) => { setForm({ ...r }); setEditId(r.record_id); setModal('edit'); };
    const save = async () => {
        try {
            const p = { ...form }; p.emp_id = Number(p.emp_id); if (p.shift_id) p.shift_id = Number(p.shift_id); else delete p.shift_id; if (p.total_hours) p.total_hours = Number(p.total_hours); else delete p.total_hours; if (p.overtime_hours) p.overtime_hours = Number(p.overtime_hours);
            modal === 'create' ? await api.post('/attendance', p) : await api.put(`/attendance/${editId}`, p); setModal(null); load();
        } catch (e) { alert(e.message); }
    };
    const remove = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/attendance/${id}`); load(); } catch (e) { alert(e.message); } };

    const columns = [
        { header: 'ID', accessor: 'record_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Date', accessor: 'record_date', width: '110px' },
        { header: 'Clock In', accessor: 'clock_in' },
        { header: 'Clock Out', accessor: 'clock_out' },
        { header: 'Hours', accessor: 'total_hours', width: '70px' },
        { header: 'OT', accessor: 'overtime_hours', width: '60px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); remove(r.record_id); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    return (
        <>
            <Header title="Attendance" subtitle="Time Tracking" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Attendance</h1><p className="page-subtitle">{data.length} records</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Record</button>
                </div>
                <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search attendance..." />
                {modal && (
                    <Modal title={modal === 'create' ? 'New Attendance' : 'Edit Attendance'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.record_date} onChange={e => onChange('record_date', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Clock In</label><input className="form-input" type="datetime-local" value={form.clock_in || ''} onChange={e => onChange('clock_in', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Clock Out</label><input className="form-input" type="datetime-local" value={form.clock_out || ''} onChange={e => onChange('clock_out', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Total Hours</label><input className="form-input" type="number" step="0.5" value={form.total_hours || ''} onChange={e => onChange('total_hours', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-select" value={form.status} onChange={e => onChange('status', e.target.value)}>
                                    <option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="half-day">Half Day</option>
                                </select></div>
                        </div>
                        <div className="form-group"><label className="form-label">Remarks</label><input className="form-input" value={form.remarks || ''} onChange={e => onChange('remarks', e.target.value)} /></div>
                    </Modal>
                )}
            </div>
        </>
    );
}
