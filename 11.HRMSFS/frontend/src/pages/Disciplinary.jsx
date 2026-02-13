import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, Scale, AlertTriangle, Shield, FileText, Download, Activity } from 'lucide-react';
import { SummaryCard, StatusBreakdown, ActivityTimeline, InfoPanel, QuickActions } from '../components/PageDashboard';

export default function Disciplinary() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ emp_id: '', issued_by: '', issue_date: '', violation_type: '', details: '', action_taken: '', outcome: '' });
    const [editId, setEditId] = useState(null);
    const [filter, setFilter] = useState('all');

    const load = async () => { setLoading(true); try { setData(await api.get('/disciplinary-actions?limit=500')); } catch (e) { console.error(e); } setLoading(false); };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => { setForm({ emp_id: '', issued_by: '', issue_date: '', violation_type: '', details: '', action_taken: '', outcome: '' }); setEditId(null); setModal('create'); };
    const openEdit = (r) => { setForm({ ...r }); setEditId(r.action_id); setModal('edit'); };
    const save = async () => {
        try {
            const p = { ...form }; p.emp_id = Number(p.emp_id); if (p.issued_by) p.issued_by = Number(p.issued_by); else delete p.issued_by;
            modal === 'create' ? await api.post('/disciplinary-actions', p) : await api.put(`/disciplinary-actions/${editId}`, p); setModal(null); load();
        } catch (e) { alert(e.message); }
    };
    const remove = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/disciplinary-actions/${id}`); load(); } catch (e) { alert(e.message); } };

    // Stats
    const violationTypes = {};
    data.forEach(d => { const v = d.violation_type || 'Other'; violationTypes[v] = (violationTypes[v] || 0) + 1; });
    const appealed = data.filter(d => d.appeal_status && d.appeal_status !== 'none');
    const uniqueEmployees = new Set(data.map(d => d.emp_id)).size;

    const recentActions = data.slice(-5).reverse().map(d => ({
        title: `Emp #${d.emp_id} — ${d.violation_type || 'N/A'}`,
        sub: d.action_taken || 'No action recorded',
        time: d.issue_date || '',
        color: d.appeal_status === 'none' ? '#333' : '#d1242f',
    }));

    const columns = [
        { header: 'ID', accessor: 'action_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Date', accessor: 'issue_date', width: '110px' },
        { header: 'Violation', accessor: 'violation_type', width: '130px' },
        { header: 'Action Taken', accessor: 'action_taken' },
        { header: 'Outcome', accessor: 'outcome', width: '120px' },
        { header: 'Appeal', accessor: 'appeal_status', width: '100px', render: r => <span className={`badge badge-${r.appeal_status === 'none' ? 'inactive' : 'pending'}`}>{r.appeal_status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); remove(r.action_id); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    return (
        <>
            <Header title="Disciplinary" subtitle="Compliance" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Disciplinary Actions</h1><p className="page-subtitle">{data.length} records</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Action</button>
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={Scale} label="Total Actions" value={data.length} sub="Disciplinary records" trend="neutral" />
                    <SummaryCard icon={AlertTriangle} label="Violations" value={Object.keys(violationTypes).length} sub="Unique types" trend="neutral" />
                    <SummaryCard icon={Shield} label="Appeals" value={appealed.length} sub="Filed appeals" trend={appealed.length > 0 ? 'up' : 'neutral'} />
                    <SummaryCard icon={FileText} label="Employees" value={uniqueEmployees} sub="With records" trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'New Action', icon: Plus, onClick: openCreate },
                            { label: 'Export', icon: Download, onClick: () => alert('Coming soon') },
                        ]} />
                        <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search actions..." />
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Violation Types" icon={Activity}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {Object.entries(violationTypes).slice(0, 8).map(([type, count]) => (
                                    <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{type}</span>
                                        <span className="status-count">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(violationTypes).length === 0 && <div className="empty-state" style={{ padding: 10 }}><p>No data</p></div>}
                            </div>
                        </InfoPanel>

                        <InfoPanel title="Appeal Status" icon={Shield}>
                            <StatusBreakdown items={[
                                { label: 'No Appeal', count: data.filter(d => d.appeal_status === 'none').length, color: '#333' },
                                { label: 'Pending', count: data.filter(d => d.appeal_status === 'pending').length, color: '#888' },
                                { label: 'Resolved', count: data.filter(d => d.appeal_status === 'resolved').length, color: '#ccc' },
                            ]} />
                        </InfoPanel>

                        <InfoPanel title="Recent Actions" icon={Scale}>
                            {recentActions.length > 0 ? (
                                <ActivityTimeline items={recentActions} />
                            ) : (
                                <div className="empty-state" style={{ padding: 20 }}><p>No actions yet</p></div>
                            )}
                        </InfoPanel>
                    </div>
                </div>

                {modal && (
                    <Modal title={modal === 'create' ? 'New Action' : 'Edit Action'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Issue Date *</label><input className="form-input" type="date" value={form.issue_date} onChange={e => onChange('issue_date', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Violation Type</label><input className="form-input" value={form.violation_type || ''} onChange={e => onChange('violation_type', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Details</label><textarea className="form-input" rows="2" value={form.details || ''} onChange={e => onChange('details', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Action Taken</label><input className="form-input" value={form.action_taken || ''} onChange={e => onChange('action_taken', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Outcome</label><input className="form-input" value={form.outcome || ''} onChange={e => onChange('outcome', e.target.value)} /></div>
                    </Modal>
                )}
            </div>
        </>
    );
}
