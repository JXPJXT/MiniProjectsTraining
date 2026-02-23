// ============================================
// API Route: On-demand data refresh
// POST /api/refresh — Triggers frontend cache invalidation
// ============================================

import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST() {
    try {
        // Simply verify database connectivity and return latest data timestamp
        const { data: latestWeather, error: weatherError } = await supabaseServer
            .from('weather_data')
            .select('recorded_at')
            .order('fetched_at', { ascending: false })
            .limit(1)
            .single();

        const { data: latestAQI, error: aqiError } = await supabaseServer
            .from('air_quality_data')
            .select('recorded_at')
            .order('fetched_at', { ascending: false })
            .limit(1)
            .single();

        const { count: alertCount } = await supabaseServer
            .from('alerts')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        return NextResponse.json({
            success: true,
            message: 'Data status retrieved',
            data: {
                latest_weather: latestWeather?.recorded_at || null,
                latest_aqi: latestAQI?.recorded_at || null,
                active_alerts: alertCount || 0,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Refresh API error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to check data status' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Rajasthan Weather API - Use POST to check data status',
        docs: {
            POST: '/api/refresh — Check latest data timestamps',
        },
    });
}
