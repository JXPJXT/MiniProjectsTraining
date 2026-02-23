// ============================================
// Type definitions for the Weather Monitor
// ============================================

export interface City {
    id: string;
    name: string;
    state: string;
    latitude: number;
    longitude: number;
    elevation_m: number | null;
    is_default: boolean;
    is_active: boolean;
}

export interface WeatherData {
    id: string;
    city_id: string;
    recorded_at: string;
    temperature_2m: number | null;
    apparent_temperature: number | null;
    relative_humidity_2m: number | null;
    dewpoint_2m: number | null;
    precipitation: number;
    precipitation_probability: number | null;
    rain: number;
    wind_speed_10m: number | null;
    wind_direction_10m: number | null;
    wind_gusts_10m: number | null;
    weather_code: number | null;
    cloud_cover: number | null;
    visibility: number | null;
    surface_pressure: number | null;
    uv_index: number | null;
    is_forecast: boolean;
    city_name?: string;
    latitude?: number;
    longitude?: number;
}

export interface AirQualityData {
    id: string;
    city_id: string;
    recorded_at: string;
    pm2_5: number | null;
    pm10: number | null;
    dust: number | null;
    carbon_monoxide: number | null;
    nitrogen_dioxide: number | null;
    sulphur_dioxide: number | null;
    ozone: number | null;
    us_aqi: number | null;
    european_aqi: number | null;
    us_aqi_pm2_5: number | null;
    us_aqi_pm10: number | null;
    city_name?: string;
}

export interface DailyAggregate {
    id: string;
    city_id: string;
    date: string;
    temp_max: number | null;
    temp_min: number | null;
    temp_mean: number | null;
    apparent_temp_max: number | null;
    apparent_temp_min: number | null;
    precipitation_sum: number;
    precipitation_hours: number;
    rain_sum: number;
    precipitation_probability_max: number | null;
    wind_speed_max: number | null;
    wind_gusts_max: number | null;
    wind_direction_dominant: number | null;
    weather_code: number | null;
    sunrise: string | null;
    sunset: string | null;
    uv_index_max: number | null;
    aqi_mean: number | null;
    aqi_max: number | null;
    pm2_5_mean: number | null;
    pm10_mean: number | null;
    dust_mean: number | null;
    is_heatwave: boolean;
    is_dust_storm_risk: boolean;
    is_heavy_rain: boolean;
}

export interface Alert {
    id: string;
    city_id: string;
    alert_type: string;
    severity: 'low' | 'moderate' | 'high' | 'extreme';
    title: string;
    description: string | null;
    value: number | null;
    threshold: number | null;
    starts_at: string;
    expires_at: string | null;
    is_active: boolean;
    city_name?: string;
}

// AQI Category helpers
export type AQICategory = 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export interface AQICategoryInfo {
    label: AQICategory;
    color: string;
    bgColor: string;
    textColor: string;
    range: [number, number];
    advice: string;
}

// Weather code mapping
export const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
    0: { description: "Clear sky", icon: "☀️" },
    1: { description: "Mainly clear", icon: "🌤️" },
    2: { description: "Partly cloudy", icon: "⛅" },
    3: { description: "Overcast", icon: "☁️" },
    45: { description: "Foggy", icon: "🌫️" },
    48: { description: "Rime fog", icon: "🌫️" },
    51: { description: "Light drizzle", icon: "🌦️" },
    53: { description: "Moderate drizzle", icon: "🌦️" },
    55: { description: "Dense drizzle", icon: "🌧️" },
    61: { description: "Slight rain", icon: "🌦️" },
    63: { description: "Moderate rain", icon: "🌧️" },
    65: { description: "Heavy rain", icon: "🌧️" },
    80: { description: "Rain showers", icon: "🌦️" },
    81: { description: "Moderate showers", icon: "🌧️" },
    82: { description: "Violent showers", icon: "⛈️" },
    95: { description: "Thunderstorm", icon: "⛈️" },
    96: { description: "Thunderstorm + hail", icon: "⛈️" },
    99: { description: "Thunderstorm + heavy hail", icon: "⛈️" },
};

// Monsoon normal rainfall data (mm per month)
export const MONSOON_NORMALS: Record<string, Record<string, number>> = {
    Jaipur: { June: 54, July: 193, August: 182, September: 90, Total: 519 },
    Jodhpur: { June: 26, July: 103, August: 114, September: 48, Total: 291 },
    Udaipur: { June: 67, July: 228, August: 221, September: 108, Total: 624 },
    Bikaner: { June: 15, July: 72, August: 78, September: 30, Total: 195 },
    Ajmer: { June: 43, July: 163, August: 154, September: 68, Total: 428 },
    Kota: { June: 52, July: 215, August: 198, September: 102, Total: 567 },
};
