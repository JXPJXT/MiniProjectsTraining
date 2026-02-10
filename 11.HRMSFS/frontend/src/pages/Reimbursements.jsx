import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Reimbursements() {
    const [tab, setTab] = useState('claims');
    const [claims, setClaims] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});
    const [editId, setEditId] = useState(null);

    const load = async () => {
        setLoading(true); try {
            const [c, t] = await Promise.all([api.get('/reimbursements?limit=500'), api.get('/reimbursement-types?limit=500')]);
            setClaims(c); setTypes(t);
        } catch (e) { console.error(e); } setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const openCreate = () => {
        if (tab === 'claims') setForm({ emp_id: '', type_id: '', amount: '', claim_date: '', description: '', status: 'pending' });
        if (tab === 'types') setForm({ name: '', description: '', max_amount: '', requires_receipt: true, is_active: true });
        setEditId(null); setModal('create');
    };

    const save = async () => {
        try {
            const p = { ...form };
            if (tab === 'claims') {
                p.emp_id = Number(p.emp_id); if (p.type_id) p.type_id = Number(p.type_id); if (p.amount) p.amount = Number(p.amount);
                modal === 'create' ? await api.post('/reimbursements', p) : await api.put(`/reimbursements/${editId}`, p);
            }
            if (tab === 'types') {
                if (p.max_amount) p.max_amount = Number(p.max_amount); else delete p.max_amount;
                modal === 'create' ? await api.post('/reimbursement-types', p) : await api.put(`/reimbursement-types/${editId}`, p);
            }
            setModal(null); load();
        } catch (e) { alert(e.message); }
    };

    const claimCols = [
        { header: 'ID', accessor: 'claim_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Amount', accessor: 'amount', width: '100px', render: r => `₹${Number(r.amount || 0).toLocaleString()}` },
        { header: 'Date', accessor: 'claim_date', width: '110px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.claim_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/reimbursements/${r.claim_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const typeCols = [
        { header: 'ID', accessor: 'type_id', width: '60px' },
        { header: 'Name', accessor: 'name' },
        { header: 'Max Amount', accessor: 'max_amount', width: '100px', render: r => r.max_amount ? `₹${Number(r.max_amount).toLocaleString()}` : '—' },
        { header: 'Receipt', accessor: 'requires_receipt', width: '80px', render: r => r.requires_receipt ? 'Yes' : 'No' },
        { header: 'Active', accessor: 'is_active', width: '80px', render: r => <span className={`badge ${r.is_active ? 'badge-active' : 'badge-inactive'}`}>{r.is_active ? 'Yes' : 'No'}</span> },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.type_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/reimbursement-types/${r.type_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const map = { claims: { cols: claimCols, data: claims }, types: { cols: typeCols, data: types } };
    const cur = map[tab];

    return (
        <>
            <Header title="Reimbursements" subtitle="Expense Claims" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Reimbursements</h1><p className="page-subtitle">Claims & types</p></div>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New</button>
                </div>
                <div className="tabs">
                    <button className={`tab ${tab === 'claims' ? 'active' : ''}`} onClick={() => setTab('claims')}>Claims</button>
                    <button className={`tab ${tab === 'types' ? 'active' : ''}`} onClick={() => setTab('types')}>Types</button>
                </div>
                <DataTable columns={cur.cols} data={cur.data} loading={loading} searchPlaceholder={`Search ${tab}...`} />
                {modal && tab === 'types' && (
                    <Modal title={modal === 'create' ? 'New Type' : 'Edit Type'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name || ''} onChange={e => onChange('name', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Max Amount</label><input className="form-input" type="number" value={form.max_amount || ''} onChange={e => onChange('max_amount', e.target.value)} /></div>
                    </Modal>
                )}
                {modal && tab === 'claims' && (
                    <Modal title={modal === 'create' ? 'New Claim' : 'Edit Claim'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Submit' : 'Update'}</button></>}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" type="number" value={form.emp_id || ''} onChange={e => onChange('emp_id', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Amount *</label><input className="form-input" type="number" value={form.amount || ''} onChange={e => onChange('amount', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Claim Date</label><input className="form-input" type="date" value={form.claim_date || ''} onChange={e => onChange('claim_date', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="2" value={form.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
                    </Modal>
                )}
            </div>
        </>
    );
}
