// ============================================
// Health Tips Component — AQI-based recommendations
// ============================================

'use client';

import type { AirQualityData, WeatherData } from '@/lib/types';
import { getAQICategory, getHeatLevel } from '@/lib/utils';

interface HealthTipsProps {
    aqi: AirQualityData | null;
    weather: WeatherData | null;
}

interface Tip {
    icon: string;
    title: string;
    description: string;
    color: string;
}

export function HealthTips({ aqi, weather }: HealthTipsProps) {
    const tips: Tip[] = [];
    const aqiCategory = getAQICategory(aqi?.us_aqi ?? null);
    const heatInfo = getHeatLevel(weather?.temperature_2m ?? null);

    // AQI-based tips
    if (aqi?.us_aqi !== null && aqi?.us_aqi !== undefined) {
        if (aqi.us_aqi > 150) {
            tips.push({
                icon: '😷',
                title: 'Wear a Mask',
                description: 'Use N95 masks when going outdoors. AQI is in the unhealthy range.',
                color: '#ef4444',
            });
        }
        if (aqi.us_aqi > 100) {
            tips.push({
                icon: '🚫',
                title: 'Limit Outdoor Exercise',
                description: 'Reduce prolonged outdoor exertion, especially for children and elderly.',
                color: '#f97316',
            });
        }
        if (aqi.us_aqi > 200) {
            tips.push({
                icon: '🏠',
                title: 'Stay Indoors',
                description: 'Keep windows closed. Use air purifiers if available.',
                color: '#dc2626',
            });
        }
    }

    // Dust-based tips (Thar Desert specific)
    if (aqi?.dust !== null && aqi?.dust !== undefined && aqi.dust > 100) {
        tips.push({
            icon: '🏜️',
            title: 'Thar Desert Dust',
            description: 'High dust levels detected. Cover your face outdoors. Protect eyes from sand particles.',
            color: '#d97706',
        });
    }

    // Heat-based tips
    if (weather?.temperature_2m !== null && weather?.temperature_2m !== undefined) {
        if (weather.temperature_2m > 42) {
            tips.push({
                icon: '🥤',
                title: 'Stay Hydrated',
                description: 'Drink water every 15-20 minutes. Avoid caffeine and alcohol. Carry ORS packets.',
                color: '#dc2626',
            });
            tips.push({
                icon: '🧊',
                title: 'Avoid Sun Exposure',
                description: 'Stay indoors between 11 AM - 4 PM. If outside, use umbrella and wet cloth on head.',
                color: '#f97316',
            });
        } else if (weather.temperature_2m > 38) {
            tips.push({
                icon: '🧴',
                title: 'Sun Protection',
                description: 'Apply SPF 30+ sunscreen. Wear light-colored, loose cotton clothes.',
                color: '#f59e0b',
            });
        }
    }

    // UV tips
    if (weather?.uv_index !== null && weather?.uv_index !== undefined && weather.uv_index > 8) {
        tips.push({
            icon: '🕶️',
            title: 'UV Protection',
            description: 'Wear UV-protective sunglasses. UV index is very high — risk of sunburn in minutes.',
            color: '#8b5cf6',
        });
    }

    // Humidity tips
    if (weather?.relative_humidity_2m !== null && weather?.relative_humidity_2m !== undefined) {
        if (weather.relative_humidity_2m > 80) {
            tips.push({
                icon: '💦',
                title: 'High Humidity',
                description: 'Muggy conditions expected. Stay in ventilated areas. Watch for heat exhaustion.',
                color: '#0ea5e9',
            });
        }
    }

    // Default good weather tip
    if (tips.length === 0) {
        tips.push({
            icon: '✅',
            title: 'Conditions are Good',
            description: 'Weather and air quality are within safe limits. Enjoy your day outdoors!',
            color: '#10b981',
        });
    }

    return (
        <div className="card health-tips-card">
            <h3 className="card-title">
                <span className="card-title-icon">🏥</span>
                Health Tips & Advisories
            </h3>

            <div className="tips-list">
                {tips.map((tip, i) => (
                    <div key={i} className="tip-item" style={{ borderLeftColor: tip.color }}>
                        <span className="tip-icon">{tip.icon}</span>
                        <div>
                            <h4 className="tip-title" style={{ color: tip.color }}>{tip.title}</h4>
                            <p className="tip-description">{tip.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
