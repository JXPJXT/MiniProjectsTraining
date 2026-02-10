import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import { api } from '../api/client';

export default function Audit() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { (async () => { setLoading(true); try { setData(await api.get('/audit-trail?limit=500')); } catch (e) { console.error(e); } setLoading(false); })(); }, []);

    const columns = [
        { header: 'ID', accessor: 'audit_id', width: '60px' },
        { header: 'Table', accessor: 'table_name', width: '140px' },
        { header: 'Record ID', accessor: 'record_id', width: '80px' },
        {
            header: 'Action', accessor: 'action', width: '100px', render: r => {
                const cls = r.action === 'INSERT' ? 'badge-active' : r.action === 'UPDATE' ? 'badge-pending' : 'badge-inactive';
                return <span className={`badge ${cls}`}>{r.action}</span>;
            }
        },
        { header: 'Changed By', accessor: 'changed_by', width: '100px' },
        { header: 'Changed At', accessor: 'changed_at', width: '160px' },
        { header: 'IP Address', accessor: 'ip_address', width: '130px' },
    ];

    return (
        <>
            <Header title="Audit Trail" subtitle="System Logs" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Audit Trail</h1><p className="page-subtitle">{data.length} entries</p></div>
                </div>
                <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search audit logs..." />
            </div>
        </>
    );
}
