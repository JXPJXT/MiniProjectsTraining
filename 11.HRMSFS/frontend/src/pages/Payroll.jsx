import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, Wallet, CreditCard, TrendingUp, DollarSign, Download, Activity, BarChart3 } from 'lucide-react';
import { SummaryCard, StatusBreakdown, ActivityTimeline, InfoPanel, QuickActions } from '../components/PageDashboard';

const EMPTY = { period_start: '', period_end: '', frequency: 'monthly', status: 'draft' };

export default function Payroll() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [editId, setEditId] = useState(null);
    const [tab, setTab] = useState('runs');
    const [payslips, setPayslips] = useState([]);

    const load = async () => {
        setLoading(true); try {
            setData(await api.get('/payroll-runs?limit=500'));
            setPayslips(await api.get('/payslips?limit=500'));
        } catch (e) { console.error(e); } setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setModal('create'); };
    const openEdit = (r) => { setForm({ ...r }); setEditId(r.run_id); setModal('edit'); };
    const save = async () => {
        try {
            const p = { ...form };
            modal === 'create' ? await api.post('/payroll-runs', p) : await api.put(`/payroll-runs/${editId}`, p); setModal(null); load();
        } catch (e) { alert(e.message); }
    };
    const remove = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/payroll-runs/${id}`); load(); } catch (e) { alert(e.message); } };

    // Stats
    const completed = data.filter(r => r.status === 'completed');
    const processed = data.filter(r => r.status === 'processed');
    const draft = data.filter(r => r.status === 'draft');
    const totalGross = payslips.reduce((s, p) => s + Number(p.gross_salary || 0), 0);
    const totalNet = payslips.reduce((s, p) => s + Number(p.net_pay || 0), 0);
    const totalDeductions = payslips.reduce((s, p) => s + Number(p.total_deductions || 0), 0);

    const recentActivity = data.slice(-5).reverse().map(r => ({
        title: `Run #${r.run_id} — ${r.status}`,
        sub: `${r.period_start} → ${r.period_end}`,
        color: r.status === 'completed' ? '#2d8a4e' : r.status === 'processed' ? '#333' : '#999',
    }));

    const runCols = [
        { header: 'ID', accessor: 'run_id', width: '60px' },
        { header: 'Period Start', accessor: 'period_start', width: '120px' },
        { header: 'Period End', accessor: 'period_end', width: '120px' },
        { header: 'Frequency', accessor: 'frequency', width: '100px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); remove(r.run_id); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const slipCols = [
        { header: 'ID', accessor: 'payslip_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Gross', accessor: 'gross_salary', width: '100px', render: r => `₹${Number(r.gross_salary).toLocaleString()}` },
        { header: 'Deductions', accessor: 'total_deductions', width: '100px', render: r => `₹${Number(r.total_deductions || 0).toLocaleString()}` },
        { header: 'Net Pay', accessor: 'net_pay', width: '100px', render: r => `₹${Number(r.net_pay).toLocaleString()}` },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
    ];

    return (
        <>
            <Header title="Payroll" subtitle="Compensation" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Payroll</h1><p className="page-subtitle">Manage pay runs & payslips</p></div>
                    {tab === 'runs' && <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Run</button>}
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={Wallet} label="Total Runs" value={data.length} sub={`${completed.length} completed`} trend="neutral" />
                    <SummaryCard icon={DollarSign} label="Total Gross" value={`₹${(totalGross / 1000).toFixed(0)}K`} sub={`${payslips.length} payslips`} trend="up" />
                    <SummaryCard icon={CreditCard} label="Net Disbursed" value={`₹${(totalNet / 1000).toFixed(0)}K`} sub="Total net pay" trend="up" />
                    <SummaryCard icon={TrendingUp} label="Deductions" value={`₹${(totalDeductions / 1000).toFixed(0)}K`} sub="Tax, PF, etc." trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'New Run', icon: Plus, onClick: openCreate },
                            { label: 'Export', icon: Download, onClick: () => alert('Export — coming soon') },
                        ]} />

                        <div className="tabs">
                            <button className={`tab ${tab === 'runs' ? 'active' : ''}`} onClick={() => setTab('runs')}>Pay Runs</button>
                            <button className={`tab ${tab === 'slips' ? 'active' : ''}`} onClick={() => setTab('slips')}>Payslips</button>
                        </div>
                        {tab === 'runs' && <DataTable columns={runCols} data={data} loading={loading} searchPlaceholder="Search pay runs..." />}
                        {tab === 'slips' && <DataTable columns={slipCols} data={payslips} loading={loading} searchPlaceholder="Search payslips..." />}
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Run Status" icon={Activity}>
                            <StatusBreakdown items={[
                                { label: 'Draft', count: draft.length, color: '#ccc' },
                                { label: 'Processed', count: processed.length, color: '#888' },
                                { label: 'Completed', count: completed.length, color: '#333' },
                            ]} />
                        </InfoPanel>

                        <InfoPanel title="Pay Summary" icon={BarChart3}>
                            <div className="stat-row" style={{ border: '1px solid var(--border-color)' }}>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{payslips.length}</div>
                                    <div className="stat-row-label">Slips</div>
                                </div>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">₹{payslips.length > 0 ? Math.round(totalNet / payslips.length).toLocaleString() : 0}</div>
                                    <div className="stat-row-label">Avg Net</div>
                                </div>
                            </div>
                        </InfoPanel>

                        <InfoPanel title="Recent Runs" icon={Wallet}>
                            {recentActivity.length > 0 ? (
                                <ActivityTimeline items={recentActivity} />
                            ) : (
                                <div className="empty-state" style={{ padding: 20 }}><p>No runs yet</p></div>
                            )}
                        </InfoPanel>
                    </div>
                </div>

                {modal && (
                    <Modal title={modal === 'create' ? 'New Pay Run' : 'Edit Pay Run'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Period Start *</label><input className="form-input" type="date" value={form.period_start} onChange={e => onChange('period_start', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Period End *</label><input className="form-input" type="date" value={form.period_end} onChange={e => onChange('period_end', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Frequency</label>
                                <select className="form-select" value={form.frequency || 'monthly'} onChange={e => onChange('frequency', e.target.value)}>
                                    <option value="monthly">Monthly</option><option value="bi-weekly">Bi-weekly</option><option value="weekly">Weekly</option>
                                </select></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-select" value={form.status} onChange={e => onChange('status', e.target.value)}>
                                    <option value="draft">Draft</option><option value="processed">Processed</option><option value="completed">Completed</option>
                                </select></div>
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
}
