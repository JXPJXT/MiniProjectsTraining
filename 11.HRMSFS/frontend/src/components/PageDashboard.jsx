import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Reusable summary card for mini-dashboards on each page
 */
export function SummaryCard({ icon: Icon, label, value, sub, trend, color }) {
    const trendIcon = trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />;
    const trendCls = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-neutral';

    return (
        <div className="summary-card" style={color ? { borderTop: `3px solid ${color}` } : {}}>
            <div className="summary-card-header">
                {Icon && <div className="summary-card-icon"><Icon size={18} /></div>}
                <div className={`summary-trend ${trendCls}`}>{trendIcon}</div>
            </div>
            <div className="summary-card-value">{value}</div>
            <div className="summary-card-label">{label}</div>
            {sub && <div className="summary-card-sub">{sub}</div>}
        </div>
    );
}

/**
 * Mini donut/ring chart for proportional stats
 */
export function MiniDonut({ segments, size = 64, strokeWidth = 8 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mini-donut">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth} />
            {segments.map((seg, i) => {
                const dash = (seg.pct / 100) * circumference;
                const el = (
                    <circle
                        key={i}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="butt"
                        style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                );
                offset += dash;
                return el;
            })}
        </svg>
    );
}

/**
 * Mini bar chart for weekly/time-based data
 */
export function MiniBarChart({ bars, labels, height = 50 }) {
    const max = Math.max(...bars, 1);
    return (
        <div className="mini-bar-chart" style={{ height }}>
            {bars.map((val, i) => (
                <div key={i} className="mini-bar-col">
                    <div
                        className="mini-bar-fill"
                        style={{ height: `${(val / max) * 100}%` }}
                        title={labels ? `${labels[i]}: ${val}` : `${val}`}
                    />
                    {labels && <span className="mini-bar-label">{labels[i]}</span>}
                </div>
            ))}
        </div>
    );
}

/**
 * Quick action button row
 */
export function QuickActions({ actions }) {
    return (
        <div className="quick-actions">
            {actions.map((a, i) => (
                <button key={i} className="quick-action-btn" onClick={a.onClick} title={a.label}>
                    {a.icon && <a.icon size={14} />}
                    <span>{a.label}</span>
                </button>
            ))}
        </div>
    );
}

/**
 * Status breakdown horizontal bar
 */
export function StatusBreakdown({ items }) {
    const total = items.reduce((s, i) => s + i.count, 0) || 1;
    return (
        <div className="status-breakdown">
            <div className="status-bar-track">
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="status-bar-segment"
                        style={{ width: `${(item.count / total) * 100}%`, background: item.color }}
                        title={`${item.label}: ${item.count}`}
                    />
                ))}
            </div>
            <div className="status-legend">
                {items.map((item, i) => (
                    <div key={i} className="status-legend-item">
                        <span className="status-dot" style={{ background: item.color }} />
                        <span>{item.label}</span>
                        <span className="status-count">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Activity timeline for recent actions
 */
export function ActivityTimeline({ items }) {
    return (
        <div className="activity-timeline">
            {items.map((item, i) => (
                <div key={i} className="timeline-item">
                    <div className="timeline-dot" style={item.color ? { background: item.color } : {}} />
                    <div className="timeline-content">
                        <div className="timeline-title">{item.title}</div>
                        <div className="timeline-sub">{item.sub}</div>
                    </div>
                    {item.time && <div className="timeline-time">{item.time}</div>}
                </div>
            ))}
        </div>
    );
}

/**
 * Info panel card used for right-side contextual details
 */
export function InfoPanel({ title, children, icon: Icon }) {
    return (
        <div className="info-panel">
            <div className="info-panel-header">
                {Icon && <Icon size={14} />}
                <span>{title}</span>
            </div>
            <div className="info-panel-body">
                {children}
            </div>
        </div>
    );
}
