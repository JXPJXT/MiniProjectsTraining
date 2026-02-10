import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const EMPTY = { name: '', start_time: '', end_time: '', break_duration: '', is_overnight: false };

export default function Shifts() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [editId, setEditId] = useState(null);

    const load = async () => { setLoading(true); try { setData(await api.get('/shifts?limit=500')); } catch (e) { console.error(e); } setLoading(false); };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setModal('create'); };
    const openEdit = (r) => { setForm({ ...r }); setEditId(r.shift_id); setModal('edit'); };
    const save = async () => {
        try {
            const p = { ...form }; if (p.break_duration) p.break_duration = Number(p.break_duration); else delete p.break_duration;
            modal === 'create' ? await api.post('/shifts', p) : await api.put(`/shifts/${editId}`, p); setModal(null); load();
        } catch (e) { alert(e.message); }
    };
    const remove = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/shifts/${id}`); load(); } catch (e) { alert(e.message); } };

    const columns = [
        { header: 'ID', accessor: 'shift_id', width: '60px' },
        { header: 'Name', accessor: 'name' },
        { header: 'Start', accessor: 'start_time', width: '100px' },
        { header: 'End', accessor: 'end_time', width: '100px' },
        { header: 'Break (min)', accessor: 'break_duration', width: '100px' },
        { header: 'Overnight', accessor: 'is_overnight', width: '90px', render: r => r.is_overnight ? 'Yes' : 'No' },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); remove(r.shift_id); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    return (
        <>
            <Header title="Shifts" subtitle="Shift Management" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Shifts</h1><p className="page-subtitle">{data.length} shifts configured</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Shift</button>
                </div>
                <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search shifts..." />
                {modal && (
                    <Modal title={modal === 'create' ? 'New Shift' : 'Edit Shift'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => onChange('name', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Start Time</label><input className="form-input" type="time" value={form.start_time || ''} onChange={e => onChange('start_time', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">End Time</label><input className="form-input" type="time" value={form.end_time || ''} onChange={e => onChange('end_time', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Break Duration (min)</label><input className="form-input" type="number" value={form.break_duration || ''} onChange={e => onChange('break_duration', e.target.value)} /></div>
                    </Modal>
                )}
            </div>
        </>
    );
}
