import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Training() {
    const [tab, setTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});
    const [editId, setEditId] = useState(null);

    const load = async () => {
        setLoading(true); try {
            const [c, e, s] = await Promise.all([api.get('/training-courses?limit=500'), api.get('/training-enrollments?limit=500'), api.get('/skills?limit=500')]);
            setCourses(c); setEnrollments(e); setSkills(s);
        } catch (e) { console.error(e); } setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const openCreate = () => {
        if (tab === 'courses') setForm({ name: '', description: '', provider: '', duration_hours: '', start_date: '', end_date: '', max_capacity: '', is_mandatory: false });
        if (tab === 'skills') setForm({ name: '', category: '', description: '' });
        setEditId(null); setModal('create');
    };

    const save = async () => {
        try {
            const p = { ...form };
            if (tab === 'courses') {
                if (p.duration_hours) p.duration_hours = Number(p.duration_hours); else delete p.duration_hours; if (p.max_capacity) p.max_capacity = Number(p.max_capacity); else delete p.max_capacity;
                modal === 'create' ? await api.post('/training-courses', p) : await api.put(`/training-courses/${editId}`, p);
            }
            if (tab === 'skills') { modal === 'create' ? await api.post('/skills', p) : await api.put(`/skills/${editId}`, p); }
            setModal(null); load();
        } catch (e) { alert(e.message); }
    };

    const courseCols = [
        { header: 'ID', accessor: 'course_id', width: '60px' },
        { header: 'Name', accessor: 'name' },
        { header: 'Provider', accessor: 'provider' },
        { header: 'Hours', accessor: 'duration_hours', width: '70px' },
        { header: 'Start', accessor: 'start_date', width: '110px' },
        { header: 'End', accessor: 'end_date', width: '110px' },
        { header: 'Mandatory', accessor: 'is_mandatory', width: '90px', render: r => r.is_mandatory ? 'Yes' : 'No' },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.course_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/training-courses/${r.course_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const enrollCols = [
        { header: 'ID', accessor: 'enrollment_id', width: '60px' },
        { header: 'Emp ID', accessor: 'emp_id', width: '80px' },
        { header: 'Course ID', accessor: 'course_id', width: '80px' },
        { header: 'Enrolled', accessor: 'enrollment_date', width: '110px' },
        { header: 'Completed', accessor: 'completion_date', width: '110px' },
        { header: 'Score', accessor: 'score', width: '70px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status}`}>{r.status}</span> },
    ];

    const skillCols = [
        { header: 'ID', accessor: 'skill_id', width: '60px' },
        { header: 'Name', accessor: 'name' },
        { header: 'Category', accessor: 'category' },
        { header: 'Description', accessor: 'description' },
        {
            header: '', key: 'actions', width: '80px', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setForm({ ...r }); setEditId(r.skill_id); setModal('edit'); }}><Pencil size={13} /></button>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); api.delete(`/skills/${r.skill_id}`).then(load); }}><Trash2 size={13} /></button>
                </div>
            )
        },
    ];

    const map = { courses: { cols: courseCols, data: courses }, enrollments: { cols: enrollCols, data: enrollments }, skills: { cols: skillCols, data: skills } };
    const cur = map[tab];

    return (
        <>
            <Header title="Training" subtitle="Learning & Development" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Training</h1><p className="page-subtitle">Courses, enrollments & skills</p></div>
                    {(tab === 'courses' || tab === 'skills') && <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New</button>}
                </div>
                <div className="tabs">
                    {['courses', 'enrollments', 'skills'].map(t => (
                        <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                    ))}
                </div>
                <DataTable columns={cur.cols} data={cur.data} loading={loading} searchPlaceholder={`Search ${tab}...`} />
                {modal && tab === 'courses' && (
                    <Modal title={modal === 'create' ? 'New Course' : 'Edit Course'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name || ''} onChange={e => onChange('name', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="2" value={form.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Provider</label><input className="form-input" value={form.provider || ''} onChange={e => onChange('provider', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Duration (hrs)</label><input className="form-input" type="number" value={form.duration_hours || ''} onChange={e => onChange('duration_hours', e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.start_date || ''} onChange={e => onChange('start_date', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={form.end_date || ''} onChange={e => onChange('end_date', e.target.value)} /></div>
                        </div>
                    </Modal>
                )}
                {modal && tab === 'skills' && (
                    <Modal title={modal === 'create' ? 'New Skill' : 'Edit Skill'} onClose={() => setModal(null)}
                        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Create' : 'Update'}</button></>}>
                        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name || ''} onChange={e => onChange('name', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={form.category || ''} onChange={e => onChange('category', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
                    </Modal>
                )}
            </div>
        </>
    );
}
