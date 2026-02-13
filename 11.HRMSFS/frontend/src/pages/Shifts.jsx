import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, Clock, Sun, Moon, Users, Activity, Download } from 'lucide-react';
import { SummaryCard, StatusBreakdown, InfoPanel, QuickActions } from '../components/PageDashboard';

const EMPTY = { name: '', start_time: '', end_time: '', break_duration: 30, is_night_shift: false, is_active: true };

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
            const p = { ...form }; if (p.break_duration) p.break_duration = Number(p.break_duration);
            modal === 'create' ? await api.post('/shifts', p) : await api.put(`/shifts/${editId}`, p); setModal(null); load();
        } catch (e) { alert(e.message); }
    };
    const remove = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/shifts/${id}`); load(); } catch (e) { alert(e.message); } };

    // Stats
    const active = data.filter(s => s.is_active);
    const nightShifts = data.filter(s => s.is_night_shift);
    const dayShifts = data.filter(s => !s.is_night_shift);
    const avgBreak = data.length > 0 ? Math.round(data.reduce((s, d) => s + Number(d.break_duration || 0), 0) / data.length) : 0;

    const columns = [
        { header: 'ID', accessor: 'shift_id', width: '60px' },
        { header: 'Name', accessor: 'name' },
        { header: 'Start', accessor: 'start_time', width: '100px' },
        { header: 'End', accessor: 'end_time', width: '100px' },
        { header: 'Break', accessor: 'break_duration', width: '70px', render: r => `${r.break_duration || 0}m` },
        { header: 'Night', accessor: 'is_night_shift', width: '70px', render: r => r.is_night_shift ? <Moon size={14} /> : <Sun size={14} /> },
        { header: 'Active', accessor: 'is_active', width: '80px', render: r => <span className={`badge ${r.is_active ? 'badge-active' : 'badge-inactive'}`}>{r.is_active ? 'Yes' : 'No'}</span> },
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
            <Header title="Shifts" subtitle="Scheduling" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Shifts</h1><p className="page-subtitle">{data.length} shifts configured</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Shift</button>
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={Clock} label="Total Shifts" value={data.length} sub={`${active.length} active`} trend="neutral" />
                    <SummaryCard icon={Sun} label="Day Shifts" value={dayShifts.length} sub="Regular hours" trend="neutral" />
                    <SummaryCard icon={Moon} label="Night Shifts" value={nightShifts.length} sub="Overnight hours" trend="neutral" />
                    <SummaryCard icon={Clock} label="Avg Break" value={`${avgBreak}m`} sub="Per shift" trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'Add Shift', icon: Plus, onClick: openCreate },
                            { label: 'Export', icon: Download, onClick: () => alert('Coming soon') },
                        ]} />
                        <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search shifts..." />
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Shift Distribution" icon={Activity}>
                            <StatusBreakdown items={[
                                { label: 'Day', count: dayShifts.length, color: '#333' },
                                { label: 'Night', count: nightShifts.length, color: '#888' },
                            ]} />
                        </InfoPanel>

                        <InfoPanel title="Status" icon={Users}>
                            <div className="stat-row" style={{ border: '1px solid var(--border-color)' }}>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{active.length}</div>
                                    <div className="stat-row-label">Active</div>
                                </div>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{data.length - active.length}</div>
                                    <div className="stat-row-label">Inactive</div>
                                </div>
                            </div>
                        </InfoPanel>
                    </div>
                </div>

                {modal && (
                    <Modal title={modal === 'create' ? 'New Shift' : 'Edit Shift'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => onChange('name', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Start Time *</label><input className="form-input" type="time" value={form.start_time} onChange={e => onChange('start_time', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">End Time *</label><input className="form-input" type="time" value={form.end_time} onChange={e => onChange('end_time', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Break Duration (min)</label><input className="form-input" type="number" value={form.break_duration} onChange={e => onChange('break_duration', e.target.value)} /></div>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label className="form-label">Night Shift</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.is_night_shift} onChange={e => onChange('is_night_shift', e.target.checked)} />
                                    <span style={{ fontSize: '0.8rem' }}>Yes</span>
                                </label>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
}
