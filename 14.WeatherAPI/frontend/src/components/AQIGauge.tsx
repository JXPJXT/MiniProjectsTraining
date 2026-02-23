// ============================================
// AQI Gauge Component — Air Quality Index display
// ============================================

'use client';

import type { AirQualityData } from '@/lib/types';
import { getAQICategory } from '@/lib/utils';

interface AQIGaugeProps {
    aqi: AirQualityData | null;
}

export function AQIGauge({ aqi }: AQIGaugeProps) {
    const aqiValue = aqi?.us_aqi ?? null;
    const category = getAQICategory(aqiValue);

    // Calculate gauge rotation (0-300 AQI maps to 0-180 degrees)
    const rotation = aqiValue ? Math.min((aqiValue / 500) * 180, 180) : 0;

    return (
        <div className="card aqi-card">
            <h3 className="card-title">
                <span className="card-title-icon">💨</span>
                Air Quality Index
            </h3>

            <div className="aqi-gauge-container">
                {/* Semi-circular gauge */}
                <div className="aqi-gauge">
                    <svg viewBox="0 0 200 120" className="aqi-gauge-svg">
                        {/* Background arc segments */}
                        <path d="M 20 100 A 80 80 0 0 1 53.4 34.3" stroke="#10b981" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.3" />
                        <path d="M 53.4 34.3 A 80 80 0 0 1 100 20" stroke="#f59e0b" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.3" />
                        <path d="M 100 20 A 80 80 0 0 1 146.6 34.3" stroke="#f97316" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.3" />
                        <path d="M 146.6 34.3 A 80 80 0 0 1 180 100" stroke="#ef4444" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.3" />

                        {/* Needle */}
                        <line
                            x1="100"
                            y1="100"
                            x2="100"
                            y2="30"
                            stroke={category.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            transform={`rotate(${rotation - 90}, 100, 100)`}
                            style={{ transition: 'transform 1s ease-out' }}
                        />
                        <circle cx="100" cy="100" r="6" fill={category.color} />
                    </svg>

                    {/* Center value */}
                    <div className="aqi-value-display">
                        <span className="aqi-value" style={{ color: category.color }}>
                            {aqiValue !== null ? Math.round(aqiValue) : '--'}
                        </span>
                        <span className="aqi-label" style={{ color: category.color }}>
                            {category.label}
                        </span>
                    </div>
                </div>

                {/* Pollutant details */}
                <div className="aqi-details">
                    <div className="aqi-detail-row">
                        <span className="aqi-pollutant-name">PM2.5</span>
                        <div className="aqi-bar-container">
                            <div
                                className="aqi-bar"
                                style={{
                                    width: `${Math.min((aqi?.pm2_5 ?? 0) / 250 * 100, 100)}%`,
                                    backgroundColor: getAQICategory(aqi?.us_aqi_pm2_5 ?? null).color,
                                }}
                            />
                        </div>
                        <span className="aqi-pollutant-value">{aqi?.pm2_5?.toFixed(1) ?? '--'} µg/m³</span>
                    </div>
                    <div className="aqi-detail-row">
                        <span className="aqi-pollutant-name">PM10</span>
                        <div className="aqi-bar-container">
                            <div
                                className="aqi-bar"
                                style={{
                                    width: `${Math.min((aqi?.pm10 ?? 0) / 500 * 100, 100)}%`,
                                    backgroundColor: getAQICategory(aqi?.us_aqi_pm10 ?? null).color,
                                }}
                            />
                        </div>
                        <span className="aqi-pollutant-value">{aqi?.pm10?.toFixed(1) ?? '--'} µg/m³</span>
                    </div>
                    <div className="aqi-detail-row">
                        <span className="aqi-pollutant-name">Dust</span>
                        <div className="aqi-bar-container">
                            <div
                                className="aqi-bar"
                                style={{
                                    width: `${Math.min((aqi?.dust ?? 0) / 500 * 100, 100)}%`,
                                    backgroundColor: '#d97706',
                                }}
                            />
                        </div>
                        <span className="aqi-pollutant-value">{aqi?.dust?.toFixed(1) ?? '--'} µg/m³</span>
                    </div>
                    <div className="aqi-detail-row">
                        <span className="aqi-pollutant-name">Ozone</span>
                        <div className="aqi-bar-container">
                            <div
                                className="aqi-bar"
                                style={{
                                    width: `${Math.min((aqi?.ozone ?? 0) / 300 * 100, 100)}%`,
                                    backgroundColor: '#8b5cf6',
                                }}
                            />
                        </div>
                        <span className="aqi-pollutant-value">{aqi?.ozone?.toFixed(1) ?? '--'} µg/m³</span>
                    </div>
                </div>
            </div>

            {/* Health advice */}
            <div className="aqi-advice" style={{ backgroundColor: category.bgColor, borderColor: category.color + '33' }}>
                <span className="aqi-advice-icon">🏥</span>
                <p style={{ color: category.textColor }}>{category.advice}</p>
            </div>

            {/* EU AQI */}
            {aqi?.european_aqi !== null && aqi?.european_aqi !== undefined && (
                <div className="aqi-eu">
                    <span>EU AQI: <strong>{Math.round(aqi.european_aqi)}</strong></span>
                </div>
            )}
        </div>
    );
}
