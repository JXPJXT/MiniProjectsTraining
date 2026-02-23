// ============================================
// Alerts Banner Component
// Shows active weather & AQI alerts
// ============================================

'use client';

import { useState } from 'react';
import type { Alert } from '@/lib/types';
import { getSeverityColor, getRelativeTime } from '@/lib/utils';

interface AlertsBannerProps {
    alerts: Alert[];
}

export function AlertsBanner({ alerts }: AlertsBannerProps) {
    const [expanded, setExpanded] = useState(false);

    if (!alerts.length) return null;

    const displayAlerts = expanded ? alerts : alerts.slice(0, 3);
    const severityOrder = ['extreme', 'high', 'moderate', 'low'];
    const sorted = [...displayAlerts].sort(
        (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
    );

    return (
        <div className="alerts-banner">
            <div className="alerts-header">
                <h3 className="alerts-title">
                    <span className="alerts-icon">🚨</span>
                    Active Alerts ({alerts.length})
                </h3>
                {alerts.length > 3 && (
                    <button onClick={() => setExpanded(!expanded)} className="alerts-toggle">
                        {expanded ? 'Show less' : `Show all (${alerts.length})`}
                    </button>
                )}
            </div>

            <div className="alerts-list">
                {sorted.map((alert) => {
                    const colors = getSeverityColor(alert.severity);
                    return (
                        <div
                            key={alert.id}
                            className={`alert-item ${colors.bg} ${colors.border}`}
                        >
                            <div className="alert-item-header">
                                <span className={`alert-severity-badge ${colors.text}`}>
                                    {alert.severity.toUpperCase()}
                                </span>
                                <span className="alert-time">
                                    {getRelativeTime(alert.starts_at)}
                                </span>
                            </div>
                            <h4 className={`alert-title ${colors.text}`}>{alert.title}</h4>
                            {alert.description && (
                                <p className="alert-description">{alert.description}</p>
                            )}
                            {alert.city_name && (
                                <span className="alert-city">📍 {alert.city_name}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
