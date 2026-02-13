import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2, Monitor, Package, Wrench, AlertCircle, Download, Activity } from 'lucide-react';
import { SummaryCard, StatusBreakdown, ActivityTimeline, InfoPanel, QuickActions } from '../components/PageDashboard';

const EMPTY = { name: '', serial_number: '', model: '', assigned_to: '', assigned_date: '', status: 'available', condition: '', purchase_date: '', warranty_expiry: '' };

export default function Assets() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [editId, setEditId] = useState(null);
    const [filter, setFilter] = useState('all');

    const load = async () => { setLoading(true); try { setData(await api.get('/assets?limit=500')); } catch (e) { console.error(e); } setLoading(false); };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setModal('create'); };
    const openEdit = (r) => { setForm({ ...r }); setEditId(r.asset_id); setModal('edit'); };
    const save = async () => {
        try {
            const p = { ...form }; if (p.assigned_to) p.assigned_to = Number(p.assigned_to); else delete p.assigned_to;
            modal === 'create' ? await api.post('/assets', p) : await api.put(`/assets/${editId}`, p); setModal(null); load();
        } catch (e) { alert(e.message); }
    };
    const remove = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/assets/${id}`); load(); } catch (e) { alert(e.message); } };

    // Stats
    const available = data.filter(a => a.status === 'available');
    const assigned = data.filter(a => a.status === 'assigned');
    const maintenance = data.filter(a => a.status === 'maintenance');
    const retired = data.filter(a => a.status === 'retired');

    // Condition distribution
    const condCount = {};
    data.forEach(a => { const c = a.condition || 'Unknown'; condCount[c] = (condCount[c] || 0) + 1; });

    // Recent assets
    const recentAssets = [...data].sort((a, b) => new Date(b.purchase_date || 0) - new Date(a.purchase_date || 0)).slice(0, 5).map(a => ({
        title: a.name || 'Unnamed',
        sub: `${a.serial_number || 'No SN'} — ${a.status}`,
        time: a.purchase_date || '',
        color: a.status === 'available' ? '#2d8a4e' : a.status === 'assigned' ? '#333' : '#999',
    }));

    // Filter
    const filteredData = filter === 'all' ? data : data.filter(a => a.status === filter);

    const columns = [
        { header: 'ID', accessor: 'asset_id', width: '60px' },
        { header: 'Name', accessor: 'name' },
        { header: 'Serial', accessor: 'serial_number', width: '130px' },
        { header: 'Model', accessor: 'model', width: '120px' },
        { header: 'Assigned To', accessor: 'assigned_to', width: '100px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        { header: 'Condition', accessor: 'condition', width: '100px' },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); remove(r.asset_id); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    return (
        <>
            <Header title="Assets" subtitle="IT & Equipment" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Assets</h1><p className="page-subtitle">{data.length} assets tracked</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Asset</button>
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={Package} label="Total Assets" value={data.length} sub="Across all categories" trend="neutral" />
                    <SummaryCard icon={Monitor} label="Available" value={available.length} sub="Ready to assign" trend="up" />
                    <SummaryCard icon={Wrench} label="Maintenance" value={maintenance.length} sub="Under repair" trend={maintenance.length > 0 ? 'down' : 'neutral'} />
                    <SummaryCard icon={AlertCircle} label="Retired" value={retired.length} sub="End of life" trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'Add Asset', icon: Plus, onClick: openCreate },
                            { label: 'Export', icon: Download, onClick: () => alert('Coming soon') },
                        ]} />

                        <div className="filter-pills">
                            {['all', 'available', 'assigned', 'maintenance', 'retired'].map(f => (
                                <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        <DataTable columns={columns} data={filteredData} loading={loading} searchPlaceholder="Search assets..." />
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Status Overview" icon={Activity}>
                            <StatusBreakdown items={[
                                { label: 'Available', count: available.length, color: '#2d8a4e' },
                                { label: 'Assigned', count: assigned.length, color: '#333' },
                                { label: 'Maintenance', count: maintenance.length, color: '#888' },
                                { label: 'Retired', count: retired.length, color: '#ccc' },
                            ]} />
                        </InfoPanel>

                        <InfoPanel title="Condition" icon={Monitor}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {Object.entries(condCount).slice(0, 6).map(([cond, count]) => (
                                    <div key={cond} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{cond}</span>
                                        <span className="status-count">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(condCount).length === 0 && <div className="empty-state" style={{ padding: 10 }}><p>No data</p></div>}
                            </div>
                        </InfoPanel>

                        <InfoPanel title="Recent Assets" icon={Package}>
                            {recentAssets.length > 0 ? (
                                <ActivityTimeline items={recentAssets} />
                            ) : (
                                <div className="empty-state" style={{ padding: 20 }}><p>No assets yet</p></div>
                            )}
                        </InfoPanel>
                    </div>
                </div>

                {modal && (
                    <Modal title={modal === 'create' ? 'New Asset' : 'Edit Asset'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => onChange('name', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Serial Number</label><input className="form-input" value={form.serial_number || ''} onChange={e => onChange('serial_number', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Model</label><input className="form-input" value={form.model || ''} onChange={e => onChange('model', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Assigned To (Emp ID)</label><input className="form-input" type="number" value={form.assigned_to || ''} onChange={e => onChange('assigned_to', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-select" value={form.status} onChange={e => onChange('status', e.target.value)}>
                                    <option value="available">Available</option><option value="assigned">Assigned</option><option value="maintenance">Maintenance</option><option value="retired">Retired</option>
                                </select></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Condition</label><input className="form-input" value={form.condition || ''} onChange={e => onChange('condition', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Purchase Date</label><input className="form-input" type="date" value={form.purchase_date || ''} onChange={e => onChange('purchase_date', e.target.value)} /></div>
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
}
