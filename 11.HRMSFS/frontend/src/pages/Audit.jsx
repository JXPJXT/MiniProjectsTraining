import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import { api } from '../api/client';
import { FileSearch, Clock, User, Database, Activity, Download, Filter } from 'lucide-react';
import { SummaryCard, StatusBreakdown, InfoPanel, QuickActions } from '../components/PageDashboard';

export default function Audit() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const load = async () => { setLoading(true); try { setData(await api.get('/audit-logs?limit=500')); } catch (e) { console.error(e); } setLoading(false); };
    useEffect(() => { load(); }, []);

    // Stats
    const actionTypes = {};
    data.forEach(d => { const a = d.action || 'Unknown'; actionTypes[a] = (actionTypes[a] || 0) + 1; });
    const uniqueUsers = new Set(data.map(d => d.user_id || d.emp_id)).size;
    const uniqueTables = new Set(data.map(d => d.table_name || d.entity_type)).size;
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = data.filter(d => (d.timestamp || d.created_at || '').startsWith(today));

    const filteredData = filter === 'all' ? data : data.filter(d => (d.action || '').toLowerCase() === filter);

    const columns = [
        { header: 'ID', accessor: 'log_id', width: '60px' },
        { header: 'User', accessor: 'user_id', width: '80px' },
        { header: 'Action', accessor: 'action', width: '120px', render: r => <span className={`badge badge-${(r.action || '').toLowerCase()}`}>{r.action || '—'}</span> },
        { header: 'Entity', accessor: 'entity_type', width: '120px' },
        { header: 'Entity ID', accessor: 'entity_id', width: '80px' },
        { header: 'Details', accessor: 'details' },
        { header: 'Time', accessor: 'timestamp', width: '170px', render: r => r.timestamp ? new Date(r.timestamp).toLocaleString() : r.created_at || '—' },
    ];

    return (
        <>
            <Header title="Audit Trail" subtitle="System Logs" />
            <div className="page-content fade-in">
                <div className="page-header">
                    <div><h1 className="page-title">Audit Trail</h1><p className="page-subtitle">{data.length} log entries</p></div>
                </div>

                <div className="summary-grid">
                    <SummaryCard icon={FileSearch} label="Total Logs" value={data.length} sub={`${todayLogs.length} today`} trend="neutral" />
                    <SummaryCard icon={User} label="Users" value={uniqueUsers} sub="Unique actors" trend="neutral" />
                    <SummaryCard icon={Database} label="Entities" value={uniqueTables} sub="Tables affected" trend="neutral" />
                    <SummaryCard icon={Clock} label="Today" value={todayLogs.length} sub="Entries recorded" trend={todayLogs.length > 0 ? 'up' : 'neutral'} />
                </div>

                <div className="page-layout">
                    <div className="page-main">
                        <QuickActions actions={[
                            { label: 'Refresh', icon: Activity, onClick: load },
                            { label: 'Export', icon: Download, onClick: () => alert('Coming soon') },
                        ]} />

                        <div className="filter-pills">
                            <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                            {Object.keys(actionTypes).slice(0, 6).map(a => (
                                <button key={a} className={`filter-pill ${filter === a.toLowerCase() ? 'active' : ''}`} onClick={() => setFilter(a.toLowerCase())}>
                                    {a}
                                </button>
                            ))}
                        </div>

                        <DataTable columns={columns} data={filteredData} loading={loading} searchPlaceholder="Search audit logs..." />
                    </div>

                    <div className="page-aside">
                        <InfoPanel title="Action Types" icon={Activity}>
                            <StatusBreakdown items={Object.entries(actionTypes).slice(0, 8).map(([action, count]) => ({
                                label: action,
                                count,
                                color: action === 'CREATE' ? '#2d8a4e' : action === 'DELETE' ? '#d1242f' : action === 'UPDATE' ? '#333' : '#888',
                            }))} />
                        </InfoPanel>

                        <InfoPanel title="Overview" icon={Filter}>
                            <div className="stat-row" style={{ border: '1px solid var(--border-color)' }}>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{uniqueUsers}</div>
                                    <div className="stat-row-label">Users</div>
                                </div>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{Object.keys(actionTypes).length}</div>
                                    <div className="stat-row-label">Actions</div>
                                </div>
                                <div className="stat-row-item">
                                    <div className="stat-row-value">{uniqueTables}</div>
                                    <div className="stat-row-label">Entities</div>
                                </div>
                            </div>
                        </InfoPanel>
                    </div>
                </div>
            </div>
        </>
    );
}
