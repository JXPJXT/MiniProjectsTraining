// ============================================
// 7-Day Forecast Card Component
// ============================================

'use client';

import type { DailyAggregate } from '@/lib/types';
import { WEATHER_CODES } from '@/lib/types';
import { formatTemp, formatDate } from '@/lib/utils';

interface ForecastCardProps {
    forecast: DailyAggregate[];
}

export function ForecastCard({ forecast }: ForecastCardProps) {
    if (!forecast.length) {
        return (
            <div className="card forecast-card">
                <h3 className="card-title">
                    <span className="card-title-icon">📅</span>
                    7-Day Forecast
                </h3>
                <div className="card-empty">
                    <p>No forecast data available</p>
                </div>
            </div>
        );
    }

    // Find temperature range for bar scaling
    const allTemps = forecast.flatMap(d => [d.temp_max, d.temp_min]).filter((t): t is number => t !== null);
    const globalMin = Math.min(...allTemps);
    const globalMax = Math.max(...allTemps);
    const range = globalMax - globalMin || 1;

    return (
        <div className="card forecast-card">
            <h3 className="card-title">
                <span className="card-title-icon">📅</span>
                7-Day Forecast
            </h3>

            <div className="forecast-list">
                {forecast.map((day, index) => {
                    const weatherInfo = WEATHER_CODES[day.weather_code ?? 0] || { description: 'Unknown', icon: '🌡️' };
                    const lowPct = ((day.temp_min ?? globalMin) - globalMin) / range * 100;
                    const highPct = ((day.temp_max ?? globalMax) - globalMin) / range * 100;

                    return (
                        <div key={day.date} className={`forecast-day ${index === 0 ? 'today' : ''}`}>
                            {/* Date */}
                            <div className="forecast-date">
                                <span className="forecast-day-name">
                                    {index === 0 ? 'Today' : formatDate(day.date)}
                                </span>
                                {/* Flags */}
                                <div className="forecast-flags">
                                    {day.is_heatwave && <span className="forecast-flag heat" title="Heatwave">🔥</span>}
                                    {day.is_dust_storm_risk && <span className="forecast-flag dust" title="Dust storm risk">🏜️</span>}
                                    {day.is_heavy_rain && <span className="forecast-flag rain" title="Heavy rain">🌊</span>}
                                </div>
                            </div>

                            {/* Weather icon */}
                            <div className="forecast-icon">{weatherInfo.icon}</div>

                            {/* Temperature bar */}
                            <div className="forecast-temp-bar-container">
                                <span className="forecast-temp-low">{formatTemp(day.temp_min)}</span>
                                <div className="forecast-temp-bar-bg">
                                    <div
                                        className="forecast-temp-bar"
                                        style={{
                                            left: `${lowPct}%`,
                                            width: `${highPct - lowPct}%`,
                                        }}
                                    />
                                </div>
                                <span className="forecast-temp-high">{formatTemp(day.temp_max)}</span>
                            </div>

                            {/* Precipitation */}
                            <div className="forecast-precip">
                                {day.precipitation_sum > 0 ? (
                                    <span className="forecast-precip-value">
                                        💧 {day.precipitation_sum.toFixed(1)}mm
                                    </span>
                                ) : (
                                    <span className="forecast-precip-none">--</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
