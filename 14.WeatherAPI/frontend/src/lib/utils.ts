// ============================================
// Utility functions for the Weather Monitor
// ============================================

import { AQICategoryInfo } from './types';

/**
 * Get AQI category information based on US AQI value
 */
export function getAQICategory(aqi: number | null): AQICategoryInfo {
    if (aqi === null || aqi === undefined) {
        return {
            label: 'Good',
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.15)',
            textColor: '#10b981',
            range: [0, 50],
            advice: 'Air quality data unavailable.',
        };
    }
    if (aqi <= 50) {
        return {
            label: 'Good',
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.15)',
            textColor: '#10b981',
            range: [0, 50],
            advice: 'Air quality is satisfactory. Enjoy outdoor activities!',
        };
    }
    if (aqi <= 100) {
        return {
            label: 'Moderate',
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.15)',
            textColor: '#f59e0b',
            range: [51, 100],
            advice: 'Acceptable air quality. Sensitive individuals should limit prolonged outdoor exertion.',
        };
    }
    if (aqi <= 150) {
        return {
            label: 'Unhealthy for Sensitive',
            color: '#f97316',
            bgColor: 'rgba(249, 115, 22, 0.15)',
            textColor: '#f97316',
            range: [101, 150],
            advice: 'People with respiratory conditions, elderly, and children should reduce outdoor activity.',
        };
    }
    if (aqi <= 200) {
        return {
            label: 'Unhealthy',
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.15)',
            textColor: '#ef4444',
            range: [151, 200],
            advice: 'Everyone may experience health effects. Avoid prolonged outdoor exertion.',
        };
    }
    if (aqi <= 300) {
        return {
            label: 'Very Unhealthy',
            color: '#8b5cf6',
            bgColor: 'rgba(139, 92, 246, 0.15)',
            textColor: '#8b5cf6',
            range: [201, 300],
            advice: 'Health alert! Everyone should avoid outdoor activity. Wear N95 masks outside.',
        };
    }
    return {
        label: 'Hazardous',
        color: '#991b1b',
        bgColor: 'rgba(153, 27, 27, 0.15)',
        textColor: '#991b1b',
        range: [301, 500],
        advice: 'Health emergency! Do NOT go outside. Keep windows and doors closed.',
    };
}

/**
 * Format temperature with degree symbol
 */
export function formatTemp(temp: number | null, unit: string = '°C'): string {
    if (temp === null || temp === undefined) return '--';
    return `${Math.round(temp)}${unit}`;
}

/**
 * Format wind speed
 */
export function formatWind(speed: number | null): string {
    if (speed === null || speed === undefined) return '--';
    return `${Math.round(speed)} km/h`;
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format time for display
 */
export function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Get wind direction as compass text
 */
export function getWindDirection(degrees: number | null): string {
    if (degrees === null || degrees === undefined) return '--';
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return dirs[index];
}

/**
 * Get relative time string
 */
export function getRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

/**
 * Get severity color for alerts
 */
export function getSeverityColor(severity: string): { bg: string; text: string; border: string } {
    switch (severity) {
        case 'extreme':
            return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
        case 'high':
            return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' };
        case 'moderate':
            return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' };
        case 'low':
            return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
        default:
            return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' };
    }
}

/**
 * Classify heat level for Rajasthan
 */
export function getHeatLevel(temp: number | null): { label: string; color: string } {
    if (temp === null) return { label: 'Unknown', color: '#6b7280' };
    if (temp >= 47) return { label: 'Extreme Heat 🔥', color: '#991b1b' };
    if (temp >= 44) return { label: 'Severe Heat', color: '#dc2626' };
    if (temp >= 42) return { label: 'Heatwave', color: '#ef4444' };
    if (temp >= 38) return { label: 'Very Hot', color: '#f97316' };
    if (temp >= 33) return { label: 'Hot', color: '#f59e0b' };
    if (temp >= 25) return { label: 'Warm', color: '#eab308' };
    if (temp >= 15) return { label: 'Pleasant', color: '#22c55e' };
    if (temp >= 5) return { label: 'Cool', color: '#3b82f6' };
    return { label: 'Cold', color: '#6366f1' };
}

/**
 * CN utility for className merging
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}
