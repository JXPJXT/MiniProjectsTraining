// ============================================
// Current Conditions Component
// Hero card showing live weather for selected city
// ============================================

'use client';

import type { WeatherData, City } from '@/lib/types';
import { WEATHER_CODES } from '@/lib/types';
import { formatTemp, formatWind, getWindDirection, getHeatLevel, formatTime } from '@/lib/utils';

interface CurrentConditionsProps {
    weather: WeatherData | null;
    city: City | null;
}

export function CurrentConditions({ weather, city }: CurrentConditionsProps) {
    if (!weather || !city) {
        return (
            <div className="card hero-card">
                <div className="card-empty">
                    <p className="empty-icon">🌤️</p>
                    <p>No weather data yet</p>
                    <p className="empty-desc">Run the backend pipeline to fetch data</p>
                </div>
            </div>
        );
    }

    const weatherInfo = WEATHER_CODES[weather.weather_code ?? 0] || { description: 'Unknown', icon: '🌡️' };
    const heatInfo = getHeatLevel(weather.temperature_2m);

    return (
        <div className="card hero-card">
            {/* Top Badge */}
            {weather.temperature_2m !== null && weather.temperature_2m > 42 && (
                <div className="hero-badge heatwave-badge">
                    🔥 HEATWAVE ALERT
                </div>
            )}

            <div className="hero-content">
                {/* Left: Temperature */}
                <div className="hero-temp-section">
                    <div className="hero-weather-icon">{weatherInfo.icon}</div>
                    <div className="hero-temp-display">
                        <span className="hero-temp" style={{ color: heatInfo.color }}>
                            {formatTemp(weather.temperature_2m)}
                        </span>
                        <span className="hero-feels-like">
                            Feels like {formatTemp(weather.apparent_temperature)}
                        </span>
                    </div>
                    <div className="hero-condition">
                        <span className="hero-condition-text">{weatherInfo.description}</span>
                        <span className="hero-heat-label" style={{ color: heatInfo.color }}>
                            {heatInfo.label}
                        </span>
                    </div>
                </div>

                {/* Right: Details grid */}
                <div className="hero-details">
                    <div className="detail-item">
                        <span className="detail-icon">💧</span>
                        <div>
                            <span className="detail-value">{weather.relative_humidity_2m ?? '--'}%</span>
                            <span className="detail-label">Humidity</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <span className="detail-icon">💨</span>
                        <div>
                            <span className="detail-value">{formatWind(weather.wind_speed_10m)}</span>
                            <span className="detail-label">{getWindDirection(weather.wind_direction_10m)} Wind</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <span className="detail-icon">🌧️</span>
                        <div>
                            <span className="detail-value">{weather.precipitation ?? 0} mm</span>
                            <span className="detail-label">Precipitation</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <span className="detail-icon">👁️</span>
                        <div>
                            <span className="detail-value">
                                {weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : '--'}
                            </span>
                            <span className="detail-label">Visibility</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <span className="detail-icon">☀️</span>
                        <div>
                            <span className="detail-value">{weather.uv_index?.toFixed(1) ?? '--'}</span>
                            <span className="detail-label">UV Index</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <span className="detail-icon">🔽</span>
                        <div>
                            <span className="detail-value">
                                {weather.surface_pressure ? `${weather.surface_pressure.toFixed(0)} hPa` : '--'}
                            </span>
                            <span className="detail-label">Pressure</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* City Info Footer */}
            <div className="hero-footer">
                <span className="hero-city-name">📍 {city.name}, {city.state}</span>
                <span className="hero-coords">
                    {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
                    {city.elevation_m && ` • ${city.elevation_m}m`}
                </span>
                <span className="hero-time">
                    Last reading: {formatTime(weather.recorded_at)}
                </span>
            </div>
        </div>
    );
}
