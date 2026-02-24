// ============================================
// Custom Hook: useWeatherData
// Fetches all weather, AQI, forecast, and alert data from Supabase
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-browser';
import type { City, WeatherData, AirQualityData, DailyAggregate, Alert } from '@/lib/types';

interface WeatherState {
    cities: City[];
    currentWeather: WeatherData | null;
    currentAQI: AirQualityData | null;
    forecast: DailyAggregate[];
    hourlyData: WeatherData[];
    alerts: Alert[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

export function useWeatherData(selectedCityId: string | null) {
    const [state, setState] = useState<WeatherState>({
        cities: [],
        currentWeather: null,
        currentAQI: null,
        forecast: [],
        hourlyData: [],
        alerts: [],
        loading: true,
        error: null,
        lastUpdated: null,
    });

    // Fetch list of cities
    const fetchCities = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('cities')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data || [];
        } catch (err: unknown) {
            console.error('Failed to fetch cities:', err);
            return [];
        }
    }, []);

    // Fetch current weather for a city (latest non-forecast record)
    const fetchCurrentWeather = useCallback(async (cityId: string) => {
        try {
            const { data, error } = await supabase
                .from('weather_data')
                .select('*')
                .eq('city_id', cityId)
                .eq('is_forecast', false)
                .order('recorded_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (err: unknown) {
            console.error('Failed to fetch current weather:', err);
            return null;
        }
    }, []);

    // Fetch current AQI
    const fetchCurrentAQI = useCallback(async (cityId: string) => {
        try {
            const { data, error } = await supabase
                .from('air_quality_data')
                .select('*')
                .eq('city_id', cityId)
                .order('recorded_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (err: unknown) {
            console.error('Failed to fetch AQI:', err);
            return null;
        }
    }, []);

    // Fetch 7-day forecast (daily aggregates)
    const fetchForecast = useCallback(async (cityId: string) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('daily_aggregates')
                .select('*')
                .eq('city_id', cityId)
                .gte('date', today)
                .order('date')
                .limit(7);

            if (error) throw error;
            return data || [];
        } catch (err: unknown) {
            console.error('Failed to fetch forecast:', err);
            return [];
        }
    }, []);

    // Fetch hourly data for charts (last 24h + next 24h)
    const fetchHourlyData = useCallback(async (cityId: string) => {
        try {
            const now = new Date();
            const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
            const future24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('weather_data')
                .select('*')
                .eq('city_id', cityId)
                .gte('recorded_at', past24h)
                .lte('recorded_at', future24h)
                .order('recorded_at');

            if (error) throw error;
            return data || [];
        } catch (err: unknown) {
            console.error('Failed to fetch hourly data:', err);
            return [];
        }
    }, []);

    // Fetch active alerts
    const fetchAlerts = useCallback(async (cityId?: string) => {
        try {
            let query = supabase
                .from('alerts')
                .select('*, cities(name)')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(20);

            if (cityId) {
                query = query.eq('city_id', cityId);
            }

            const { data, error } = await query;
            if (error) throw error;

            return (data || []).map((alert: Record<string, unknown>) => ({
                ...alert,
                city_name: (alert.cities as Record<string, string>)?.name || 'Unknown',
            })) as Alert[];
        } catch (err: unknown) {
            console.error('Failed to fetch alerts:', err);
            return [];
        }
    }, []);

    // Main data fetch
    const refreshData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const cities = await fetchCities();

            if (!selectedCityId && cities.length === 0) {
                setState(prev => ({
                    ...prev,
                    cities,
                    loading: false,
                    error: 'No cities found. Run the backend pipeline first.',
                }));
                return;
            }

            const cityId = selectedCityId || cities[0]?.id;

            if (!cityId) {
                setState(prev => ({ ...prev, cities, loading: false }));
                return;
            }

            // Fetch all data concurrently
            const [currentWeather, currentAQI, forecast, hourlyData, alerts] = await Promise.all([
                fetchCurrentWeather(cityId),
                fetchCurrentAQI(cityId),
                fetchForecast(cityId),
                fetchHourlyData(cityId),
                fetchAlerts(cityId),
            ]);

            setState({
                cities,
                currentWeather,
                currentAQI,
                forecast,
                hourlyData,
                alerts,
                loading: false,
                error: null,
                lastUpdated: new Date().toISOString(),
            });
        } catch (err: unknown) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: err instanceof Error ? err.message : 'Failed to fetch data',
            }));
        }
    }, [selectedCityId, fetchCities, fetchCurrentWeather, fetchCurrentAQI, fetchForecast, fetchHourlyData, fetchAlerts]);

    useEffect(() => {
        refreshData();
        // Auto-refresh every 10 minutes
        const interval = setInterval(refreshData, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [refreshData]);

    return { ...state, refreshData };
}
