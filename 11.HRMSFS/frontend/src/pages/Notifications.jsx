import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import { api } from '../api/client';
import { Bell, Mail, AlertCircle, CheckCircle, Clock, Activity, Download } from 'lucide-react';
import { SummaryCard, StatusBreakdown, InfoPanel, QuickActions } from '../components/PageDashboard';

export default function Notifications() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const load = async () => { setLoading(true); try { setData(await api.get('/notifications?limit=500')); } catch (e) { console.error(e); } setLoading(false); };
    useEffect(() => { load(); }, []);

    // Stats
    const unread = data.filter(n => !n.is_read);
    const read = data.filter(n => n.is_read);
    const today = new Date().toISOString().split('T')[0];
    const todayNotifs = data.filter(n => (n.created_at || '').startsWith(today));

    // Type distribution
    const typeCount = {};
    data.forEach(n => { const t = n.type || n.notification_type || 'General'; typeCount[t] = (typeCount[t] || 0) + 1; });

    const filteredData = filter === 'all' ? data : filter === 'unread' ? unread : read;

    const columns = [
        { header: 'ID', accessor: 'notification_id', width: '60px' },
        { header: 'Title', accessor: 'title' },
        { header: 'Message', accessor: 'message' },
        { header: 'Type', accessor: 'type', width: '120px', render: r => <span className="badge">{r.type || r.notification_type || '—'}</span> },
        { header: 'Read', accessor: 'is_read', width: '80px', render: r => r.is_read ? <CheckCircle size={14} style={{ color: '#2d8a4e' }} /> : <Clock size={14} style={{ color: '#999' }} /> },
        { header: 'Time', accessor: 'created_at', width: '170px', render: r => r.created_at ? new Date(r.created_at).toLocaleString() : '—' },
    ];

    return (
        <>
            <Header title="Notifications" subtitle="Alerts & Messages" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Notifications</h1><p className="page-subtitle">{data.length} total notifications</p></div>
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={Bell} label="Total" value={data.length} sub={`${todayNotifs.length} today`} trend="neutral" />
                    <SummaryCard icon={Mail} label="Unread" value={unread.length} sub="Needs attention" trend={unread.length > 5 ? 'up' : 'neutral'} />
                    <SummaryCard icon={CheckCircle} label="Read" value={read.length} sub="Acknowledged" trend="up" />
                    <SummaryCard icon={AlertCircle} label="Types" value={Object.keys(typeCount).length} sub="Notification types" trend="neutral" />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'Refresh', icon: Activity, onClick: load },
                            { label: 'Export', icon: Download, onClick: () => alert('Coming soon') },
                        ]} />

                        <div className="filter-pills">
                            <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({data.length})</button>
                            <button className={`filter-pill ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>Unread ({unread.length})</button>
                            <button className={`filter-pill ${filter === 'read' ? 'active' : ''}`} onClick={() => setFilter('read')}>Read ({read.length})</button>
                        </div>

                        <DataTable columns={columns} data={filteredData} loading={loading} searchPlaceholder="Search notifications..." />
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Read Status" icon={Activity}>
                            <StatusBreakdown items={[
                                { label: 'Unread', count: unread.length, color: '#333' },
                                { label: 'Read', count: read.length, color: '#ccc' },
                            ]} />
                        </InfoPanel>

                        <InfoPanel title="By Type" icon={Bell}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {Object.entries(typeCount).slice(0, 8).map(([type, count]) => (
                                    <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{type}</span>
                                        <span className="status-count">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(typeCount).length === 0 && <div className="empty-state" style={{ padding: 10 }}><p>No data</p></div>}
                            </div>
                        </InfoPanel>
                    </div>
                </div>
            </div>
        </>
    );
}
