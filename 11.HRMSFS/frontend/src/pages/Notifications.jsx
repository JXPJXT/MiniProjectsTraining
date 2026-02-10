import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import { api } from '../api/client';

export default function Notifications() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { (async () => { setLoading(true); try { setData(await api.get('/notifications?limit=500')); } catch (e) { console.error(e); } setLoading(false); })(); }, []);

    const columns = [
        { header: 'ID', accessor: 'notification_id', width: '60px' },
        { header: 'Recipient', accessor: 'recipient_id', width: '80px' },
        { header: 'Subject', accessor: 'subject' },
        { header: 'Type', accessor: 'type', width: '100px' },
        { header: 'Priority', accessor: 'priority', width: '80px' },
        { header: 'Status', accessor: 'status', width: '100px', render: r => <span className={`badge badge-${r.status === 'read' ? 'completed' : 'pending'}`}>{r.status}</span> },
        { header: 'Sent', accessor: 'sent_at', width: '150px' },
    ];

    return (
        <>
            <Header title="Notifications" subtitle="Alerts & Messages" />
            <div className="page-content">
                <div className="page-header">
                    <div><h1 className="page-title">Notifications</h1><p className="page-subtitle">{data.length} notifications</p></div>
                </div>
                <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search notifications..." />
            </div>
        </>
    );
}
