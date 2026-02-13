import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, DoorOpen, UserMinus, CheckCircle, Clock, Download, Activity, MessageSquare } from 'lucide-react';
import { SummaryCard, StatusBreakdown, ActivityTimeline, InfoPanel, QuickActions } from '../components/PageDashboard';

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

    // Stats
    const pending = data.filter(d => d.clearance_status === 'pending');
    const completed = data.filter(d => d.clearance_status === 'completed');
    const settled = data.filter(d => d.final_settlement_done);

    // Reason distribution
    const reasonCount = {};
    data.forEach(d => { const r = d.reason_for_leaving || 'Not specified'; reasonCount[r] = (reasonCount[r] || 0) + 1; });

    const recentExits = data.slice(-5).reverse().map(d => ({
        title: `Emp #${d.emp_id}`,
        sub: d.reason_for_leaving || 'No reason given',
        time: d.interview_date || '',
        color: d.clearance_status === 'completed' ? '#2d8a4e' : '#999',
    }));

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
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Exit Interviews</h1><p className="page-subtitle">{data.length} records</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Interview</button>
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={DoorOpen} label="Total Exits" value={data.length} sub="Exit interviews" trend="neutral" />
                    <SummaryCard icon={Clock} label="Pending" value={pending.length} sub="Awaiting clearance" trend={pending.length > 0 ? 'up' : 'neutral'} />
                    <SummaryCard icon={CheckCircle} label="Completed" value={completed.length} sub="Clearance done" trend="up" />
                    <SummaryCard icon={UserMinus} label="Settled" value={settled.length} sub="Final settlement" trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'New Interview', icon: Plus, onClick: openCreate },
                            { label: 'Export', icon: Download, onClick: () => alert('Coming soon') },
                        ]} />
                        <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search exit interviews..." />
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Clearance Status" icon={Activity}>
                            <StatusBreakdown items={[
                                { label: 'Pending', count: pending.length, color: '#888' },
                                { label: 'Completed', count: completed.length, color: '#333' },
                            ]} />
                        </InfoPanel>

                        <InfoPanel title="Leaving Reasons" icon={MessageSquare}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {Object.entries(reasonCount).slice(0, 6).map(([reason, count]) => (
                                    <div key={reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reason}</span>
                                        <span className="status-count">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(reasonCount).length === 0 && <div className="empty-state" style={{ padding: 10 }}><p>No data</p></div>}
                            </div>
                        </InfoPanel>

                        <InfoPanel title="Recent Exits" icon={DoorOpen}>
                            {recentExits.length > 0 ? (
                                <ActivityTimeline items={recentExits} />
                            ) : (
                                <div className="empty-state" style={{ padding: 20 }}><p>No exits yet</p></div>
                            )}
                        </InfoPanel>
                    </div>
                </div>

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
