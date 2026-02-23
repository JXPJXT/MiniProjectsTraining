// ============================================
// Weather Charts Component — Temperature & precipitation over time
// ============================================

'use client';

import { useState } from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    ComposedChart,
    Line,
} from 'recharts';
import type { WeatherData, DailyAggregate } from '@/lib/types';
import { formatTemp } from '@/lib/utils';

interface WeatherChartsProps {
    hourlyData: WeatherData[];
    forecast: DailyAggregate[];
}

type ChartView = 'temperature' | 'precipitation' | 'wind';

export function WeatherCharts({ hourlyData, forecast }: WeatherChartsProps) {
    const [view, setView] = useState<ChartView>('temperature');

    // Prepare hourly chart data
    const chartData = hourlyData.map((d) => ({
        time: new Date(d.recorded_at).toLocaleTimeString('en-IN', { hour: '2-digit', hour12: true }),
        temp: d.temperature_2m,
        feelsLike: d.apparent_temperature,
        humidity: d.relative_humidity_2m,
        precipitation: d.precipitation,
        wind: d.wind_speed_10m,
        gusts: d.wind_gusts_10m,
        isForecast: d.is_forecast,
    }));

    // Prepare daily chart data for precipitation
    const dailyData = forecast.map((d) => ({
        date: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        tempMax: d.temp_max,
        tempMin: d.temp_min,
        precipitation: d.precipitation_sum,
        windMax: d.wind_speed_max,
        isHeatwave: d.is_heatwave,
    }));

    const renderChart = () => {
        if (!chartData.length && !dailyData.length) {
            return (
                <div className="card-empty" style={{ height: 250 }}>
                    <p>No chart data available</p>
                </div>
            );
        }

        switch (view) {
            case 'temperature':
                return (
                    <ResponsiveContainer width="100%" height={280}>
                        {chartData.length > 0 ? (
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                                <defs>
                                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}°`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card-bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--text)',
                                        fontSize: '13px',
                                    }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [formatTemp(value as number), '']}
                                />
                                <Area type="monotone" dataKey="temp" stroke="#f97316" fill="url(#tempGrad)" strokeWidth={2.5} name="Temperature" dot={false} />
                                <Area type="monotone" dataKey="feelsLike" stroke="#8b5cf6" fill="url(#feelsGrad)" strokeWidth={1.5} strokeDasharray="5 5" name="Feels Like" dot={false} />
                            </AreaChart>
                        ) : (
                            <ComposedChart data={dailyData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}°`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card-bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--text)',
                                    }}
                                />
                                <Bar dataKey="tempMax" fill="#f97316" radius={[4, 4, 0, 0]} name="Max Temp" />
                                <Bar dataKey="tempMin" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Min Temp" />
                            </ComposedChart>
                        )}
                    </ResponsiveContainer>
                );

            case 'precipitation':
                return (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={dailyData.length > 0 ? dailyData : chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                            <XAxis dataKey={dailyData.length > 0 ? "date" : "time"} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}mm`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card-bg)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    color: 'var(--text)',
                                }}
                            />
                            <Bar dataKey="precipitation" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Precipitation (mm)" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'wind':
                return (
                    <ResponsiveContainer width="100%" height={280}>
                        {chartData.length > 0 ? (
                            <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card-bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--text)',
                                    }}
                                />
                                <Area type="monotone" dataKey="gusts" fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth={1} name="Gusts (km/h)" dot={false} />
                                <Line type="monotone" dataKey="wind" stroke="#06b6d4" strokeWidth={2.5} name="Wind (km/h)" dot={false} />
                            </ComposedChart>
                        ) : (
                            <BarChart data={dailyData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card-bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--text)',
                                    }}
                                />
                                <Bar dataKey="windMax" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Max Wind (km/h)" />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div className="card chart-card">
            <div className="chart-header">
                <h3 className="card-title">
                    <span className="card-title-icon">📊</span>
                    Weather Trends
                </h3>
                <div className="chart-tabs">
                    {(['temperature', 'precipitation', 'wind'] as ChartView[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setView(tab)}
                            className={`chart-tab ${view === tab ? 'active' : ''}`}
                        >
                            {tab === 'temperature' ? '🌡️' : tab === 'precipitation' ? '🌧️' : '💨'}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="chart-body">
                {renderChart()}
            </div>
        </div>
    );
}
