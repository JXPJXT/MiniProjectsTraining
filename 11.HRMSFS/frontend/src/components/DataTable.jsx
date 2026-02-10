import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({
    columns,
    data,
    loading,
    searchPlaceholder = 'Search...',
    actions,        // React node for toolbar buttons
    onRowClick,
    emptyMessage = 'No records found',
    pageSize = 15,
}) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);

    // Client-side search across all string columns
    const filtered = data.filter(row =>
        columns.some(col => {
            const val = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
            return String(val ?? '').toLowerCase().includes(search.toLowerCase());
        })
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

    return (
        <div className="table-container fade-in">
            <div className="table-toolbar">
                <div className="table-search">
                    <Search />
                    <input
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0); }}
                    />
                </div>
                <div className="table-actions">{actions}</div>
            </div>

            {loading ? (
                <div className="loading"><div className="spinner" /> Loading</div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <h3>{emptyMessage}</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key || col.accessor} style={col.width ? { width: col.width } : {}}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.map((row, i) => (
                            <tr
                                key={row.id ?? row[columns[0]?.accessor] ?? i}
                                onClick={() => onRowClick?.(row)}
                                style={onRowClick ? { cursor: 'pointer' } : {}}
                            >
                                {columns.map(col => (
                                    <td key={col.key || col.accessor}>
                                        {col.render
                                            ? col.render(row)
                                            : typeof col.accessor === 'function'
                                                ? col.accessor(row)
                                                : row[col.accessor] ?? '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {!loading && filtered.length > 0 && (
                <div className="table-footer">
                    <span>
                        Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
                    </span>
                    <div className="pagination">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const p = page < 3 ? i : page - 2 + i;
                            if (p >= totalPages) return null;
                            return (
                                <button
                                    key={p}
                                    className={p === page ? 'active' : ''}
                                    onClick={() => setPage(p)}
                                >
                                    {p + 1}
                                </button>
                            );
                        })}
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
