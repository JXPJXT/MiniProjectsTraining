// ============================================
// Monsoon Tracker Component
// Cumulative rainfall vs historical normals
// ============================================

'use client';

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
} from 'recharts';
import type { DailyAggregate } from '@/lib/types';
import { MONSOON_NORMALS } from '@/lib/types';

interface MonsoonTrackerProps {
    forecast: DailyAggregate[];
    cityName: string;
}

export function MonsoonTracker({ forecast, cityName }: MonsoonTrackerProps) {
    const normals = MONSOON_NORMALS[cityName];

    // Calculate cumulative rainfall from forecast data
    const cumulativeRain = forecast.reduce((sum, d) => sum + (d.precipitation_sum || 0), 0);

    // Monthly comparison data
    const months = ['June', 'July', 'August', 'September'];
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const isMonsoonSeason = months.includes(currentMonth);

    const comparisonData = normals
        ? months.map((month) => ({
            month: month.slice(0, 3),
            normal: normals[month] || 0,
            actual: month === currentMonth ? cumulativeRain : 0,
        }))
        : [];

    return (
        <div className="card monsoon-card">
            <h3 className="card-title">
                <span className="card-title-icon">🌧️</span>
                Monsoon Tracker — {cityName}
            </h3>

            {/* Summary stats */}
            <div className="monsoon-stats">
                <div className="monsoon-stat">
                    <span className="monsoon-stat-value">{cumulativeRain.toFixed(1)} mm</span>
                    <span className="monsoon-stat-label">7-Day Forecast Rain</span>
                </div>
                {normals && (
                    <>
                        <div className="monsoon-stat">
                            <span className="monsoon-stat-value">{normals.Total} mm</span>
                            <span className="monsoon-stat-label">Season Normal</span>
                        </div>
                        <div className="monsoon-stat">
                            <span className="monsoon-stat-value">
                                {isMonsoonSeason
                                    ? `${((cumulativeRain / (normals[currentMonth] || 1)) * 100).toFixed(0)}%`
                                    : '--'}
                            </span>
                            <span className="monsoon-stat-label">
                                {isMonsoonSeason ? 'vs Normal This Month' : 'Off Season'}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Monsoon chart */}
            {normals && comparisonData.length > 0 ? (
                <div className="monsoon-chart">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={comparisonData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}mm`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card-bg)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    color: 'var(--text)',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="normal" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Normal (mm)" opacity={0.6} />
                            <Bar dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual (mm)" />
                            {normals[currentMonth] && (
                                <ReferenceLine y={normals[currentMonth]} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Normal', fill: '#f59e0b', fontSize: 11 }} />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="monsoon-no-data">
                    <p>📊 Historical rainfall normals not available for {cityName}</p>
                    <p className="text-sm">Data is available for: Jaipur, Jodhpur, Udaipur, Bikaner, Ajmer, Kota</p>
                </div>
            )}

            {/* Rainfall forecast breakdown */}
            {forecast.some(d => d.precipitation_sum > 0) && (
                <div className="monsoon-daily-rain">
                    <h4 className="monsoon-daily-title">Daily Rainfall Forecast</h4>
                    <div className="monsoon-rain-bars">
                        {forecast.map((d) => {
                            const maxRain = Math.max(...forecast.map(f => f.precipitation_sum || 0), 1);
                            const pct = ((d.precipitation_sum || 0) / maxRain) * 100;
                            return (
                                <div key={d.date} className="monsoon-rain-bar-item">
                                    <div className="monsoon-rain-bar-container">
                                        <div
                                            className="monsoon-rain-bar"
                                            style={{ height: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="monsoon-rain-bar-label">
                                        {new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                                    </span>
                                    <span className="monsoon-rain-bar-value">
                                        {(d.precipitation_sum || 0).toFixed(1)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
