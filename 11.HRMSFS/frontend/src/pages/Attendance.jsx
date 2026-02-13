import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, CalendarDays, Clock, UserCheck, UserX, AlertTriangle, Download, Activity, Timer } from 'lucide-react';
import { SummaryCard, StatusBreakdown, ActivityTimeline, InfoPanel, MiniBarChart, QuickActions } from '../components/PageDashboard';

const EMPTY = { emp_id: '', record_date: '', shift_id: '', clock_in: '', clock_out: '', total_hours: '', overtime_hours: '0', status: 'present', remarks: '', approved: false };

export default function Attendance() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [editId, setEditId] = useState(null);
    const [filter, setFilter] = useState('all');

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

    // Computed stats
    const present = data.filter(a => a.status === 'present');
    const absent = data.filter(a => a.status === 'absent');
    const late = data.filter(a => a.status === 'late');
    const halfDay = data.filter(a => a.status === 'half-day');
    const totalHours = data.reduce((s, a) => s + Number(a.total_hours || 0), 0);
    const avgHours = data.length > 0 ? (totalHours / data.length).toFixed(1) : '0';
    const totalOT = data.reduce((s, a) => s + Number(a.overtime_hours || 0), 0);

    // Daily attendance breakdown (last 7 unique days)
    const dateMap = {};
    data.forEach(a => {
        if (!a.record_date) return;
        if (!dateMap[a.record_date]) dateMap[a.record_date] = 0;
        if (a.status === 'present' || a.status === 'late') dateMap[a.record_date]++;
    });
    const sortedDates = Object.keys(dateMap).sort().slice(-7);
    const barData = sortedDates.map(d => dateMap[d]);
    const barLabels = sortedDates.map(d => { const parts = d.split('-'); return `${parts[1]}/${parts[2]}`; });

    // Recent records
    const recentRecords = data.slice(-5).reverse().map(a => ({
        title: `Emp #${a.emp_id} — ${a.status}`,
        sub: `${a.clock_in || '—'} → ${a.clock_out || '—'}`,
        time: a.record_date || '',
        color: a.status === 'present' ? '#2d8a4e' : a.status === 'absent' ? '#d1242f' : '#e09b24',
    }));

    // Filter data
    const filteredData = filter === 'all' ? data : data.filter(a => a.status === filter);

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
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Attendance</h1><p className="page-subtitle">{data.length} records tracked</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Record</button>
                </div>

                {/* Summary Cards */}
                <div className="summary-grid">
                    <SummaryCard icon={UserCheck} label="Present" value={present.length} sub={`${Math.round(data.length > 0 ? (present.length / data.length) * 100 : 0)}% attendance`} trend="up" />
                    <SummaryCard icon={UserX} label="Absent" value={absent.length} sub="Unexcused absences" trend={absent.length > 2 ? 'down' : 'neutral'} />
                    <SummaryCard icon={AlertTriangle} label="Late" value={late.length} sub="Tardiness count" trend={late.length > 0 ? 'down' : 'neutral'} />
                    <SummaryCard icon={Clock} label="Avg Hours" value={avgHours} sub={`${totalOT}h overtime total`} trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'Mark Attendance', icon: Plus, onClick: openCreate },
                            { label: 'Export Report', icon: Download, onClick: () => alert('Export feature — coming soon') },
                        ]} />

                        <div className="filter-pills">
                            {['all', 'present', 'absent', 'late', 'half-day'].map(f => (
                                <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                    {f === 'all' ? 'All' : f === 'half-day' ? 'Half Day' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        <DataTable columns={columns} data={filteredData} loading={loading} searchPlaceholder="Search attendance..." />
                    </div>

                    <div className="page-aside">
                        {/* Daily Trend */}
                        <InfoPanel title="Daily Trend" icon={CalendarDays}>
                            {barData.length > 0 ? (
                                <MiniBarChart bars={barData} labels={barLabels} height={60} />
                            ) : (
                                <div className="empty-state" style={{ padding: 20 }}><p>No data yet</p></div>
                            )}
                        </InfoPanel>

                        {/* Status Breakdown */}
                        <InfoPanel title="Status Distribution" icon={Activity}>
                            <StatusBreakdown items={[
                                { label: 'Present', count: present.length, color: '#333' },
                                { label: 'Absent', count: absent.length, color: '#ccc' },
                                { label: 'Late', count: late.length, color: '#888' },
                                { label: 'Half Day', count: halfDay.length, color: '#aaa' },
                            ]} />
                        </InfoPanel>

                        {/* Hours Summary */}
                        <InfoPanel title="Hours Summary" icon={Timer}>
                            <div className="stat-row" style={{ border: '1px solid var(--border-color)' }}>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{totalHours.toFixed(0)}</div>
                                    <div className="stat-row-label">Total Hrs</div>
                                </div>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{totalOT}</div>
                                    <div className="stat-row-label">OT Hrs</div>
                                </div>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{avgHours}</div>
                                    <div className="stat-row-label">Avg/Day</div>
                                </div>
                            </div>
                        </InfoPanel>

                        {/* Recent Activity */}
                        <InfoPanel title="Recent Records" icon={CalendarDays}>
                            {recentRecords.length > 0 ? (
                                <ActivityTimeline items={recentRecords} />
                            ) : (
                                <div className="empty-state" style={{ padding: 20 }}><p>No records yet</p></div>
                            )}
                        </InfoPanel>
                    </div>
                </div>

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
