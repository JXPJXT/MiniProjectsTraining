import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, CalendarOff, CheckCircle, XCircle, Clock, Download, Filter, CalendarDays, BarChart3 } from 'lucide-react';
import { SummaryCard, StatusBreakdown, ActivityTimeline, InfoPanel, MiniDonut, QuickActions } from '../components/PageDashboard';

const EMPTY = { emp_id: '', leave_type: 'annual', start_date: '', end_date: '', days_requested: '', status: 'pending', remarks: '' };

export default function Leave() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [editId, setEditId] = useState(null);
    const [filter, setFilter] = useState('all');

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

    // Computed stats
    const pending = data.filter(l => l.status === 'pending');
    const approved = data.filter(l => l.status === 'approved');
    const rejected = data.filter(l => l.status === 'rejected');
    const totalDays = data.reduce((s, l) => s + Number(l.days_requested || 0), 0);

    // Leave type distribution
    const typeCount = {};
    data.forEach(l => { typeCount[l.leave_type] = (typeCount[l.leave_type] || 0) + 1; });
    const typeColors = { annual: '#333', sick: '#888', casual: '#555', maternity: '#aaa', paternity: '#666', unpaid: '#bbb' };
    const donutSegments = Object.entries(typeCount).map(([type, count]) => ({
        pct: data.length > 0 ? (count / data.length) * 100 : 0,
        color: typeColors[type] || '#999',
    }));

    // Filter data
    const filteredData = filter === 'all' ? data : data.filter(l => l.status === filter);

    // Recent activity
    const recentActivity = data.slice(-5).reverse().map(l => ({
        title: `Emp #${l.emp_id} — ${l.leave_type} leave`,
        sub: `${l.start_date} → ${l.end_date}`,
        time: l.days_requested ? `${l.days_requested}d` : '',
        color: l.status === 'approved' ? '#2d8a4e' : l.status === 'rejected' ? '#d1242f' : '#999',
    }));

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
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Leave Management</h1><p className="page-subtitle">{data.length} total requests</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Request</button>
                </div>

                {/* Summary Cards */}
                <div className="summary-grid">
                    <SummaryCard icon={Clock} label="Pending" value={pending.length} sub="Awaiting approval" trend={pending.length > 3 ? 'up' : 'neutral'} />
                    <SummaryCard icon={CheckCircle} label="Approved" value={approved.length} sub={`${Math.round(data.length > 0 ? (approved.length / data.length) * 100 : 0)}% approval rate`} trend="up" />
                    <SummaryCard icon={XCircle} label="Rejected" value={rejected.length} sub="Declined requests" trend={rejected.length > 0 ? 'down' : 'neutral'} />
                    <SummaryCard icon={CalendarOff} label="Total Days" value={totalDays} sub="Days requested overall" trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        {/* Quick Actions */}
                        <QuickActions actions={[
                            { label: 'Apply Leave', icon: Plus, onClick: openCreate },
                            { label: 'Export Report', icon: Download, onClick: () => alert('Export feature — coming soon') },
                        ]} />

                        {/* Filter Pills */}
                        <div className="filter-pills">
                            {['all', 'pending', 'approved', 'rejected'].map(f => (
                                <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        <DataTable columns={columns} data={filteredData} loading={loading} searchPlaceholder="Search leave requests..." />
                    </div>

                    <div className="page-aside">
                        {/* Leave Type Distribution */}
                        <InfoPanel title="Leave Distribution" icon={BarChart3}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div className="donut-wrapper">
                                    <MiniDonut segments={donutSegments.length > 0 ? donutSegments : [{ pct: 100, color: 'var(--border-color)' }]} />
                                    <div className="donut-center-text">
                                        <div className="donut-center-value">{data.length}</div>
                                        <div className="donut-center-label">Total</div>
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    {Object.entries(typeCount).map(([type, count]) => (
                                        <div key={type} className="status-legend-item" style={{ marginBottom: 4 }}>
                                            <span className="status-dot" style={{ background: typeColors[type] || '#999' }} />
                                            <span style={{ textTransform: 'capitalize' }}>{type}</span>
                                            <span className="status-count">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </InfoPanel>

                        {/* Status Breakdown */}
                        <InfoPanel title="Status Overview" icon={Filter}>
                            <StatusBreakdown items={[
                                { label: 'Pending', count: pending.length, color: '#888' },
                                { label: 'Approved', count: approved.length, color: '#333' },
                                { label: 'Rejected', count: rejected.length, color: '#ccc' },
                            ]} />
                        </InfoPanel>

                        {/* Recent Activity */}
                        <InfoPanel title="Recent Activity" icon={CalendarDays}>
                            {recentActivity.length > 0 ? (
                                <ActivityTimeline items={recentActivity} />
                            ) : (
                                <div className="empty-state" style={{ padding: 20 }}><p>No recent activity</p></div>
                            )}
                        </InfoPanel>
                    </div>
                </div>

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
