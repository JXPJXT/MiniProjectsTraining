-- ============================================
-- Rajasthan Weather & Air Quality Monitor
-- Supabase PostgreSQL Schema
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL DEFAULT 'Rajasthan',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation_m DOUBLE PRECISION,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Rajasthan cities
INSERT INTO cities (name, latitude, longitude, elevation_m, is_default) VALUES
    ('Jaipur',   26.9124, 75.7873, 431, TRUE),
    ('Jodhpur',  26.2389, 73.0243, 231, TRUE),
    ('Udaipur',  24.5854, 73.7125, 598, TRUE),
    ('Bikaner',  28.0229, 73.3119, 224, TRUE),
    ('Ajmer',    26.4499, 74.6399, 486, TRUE),
    ('Kota',     25.2138, 75.8648, 274, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. WEATHER DATA TABLE (Hourly snapshots)
-- ============================================
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    -- Temperature & Humidity
    temperature_2m DOUBLE PRECISION,
    apparent_temperature DOUBLE PRECISION,
    relative_humidity_2m DOUBLE PRECISION,
    dewpoint_2m DOUBLE PRECISION,
    -- Precipitation
    precipitation DOUBLE PRECISION DEFAULT 0,
    precipitation_probability DOUBLE PRECISION,
    rain DOUBLE PRECISION DEFAULT 0,
    -- Wind
    wind_speed_10m DOUBLE PRECISION,
    wind_direction_10m DOUBLE PRECISION,
    wind_gusts_10m DOUBLE PRECISION,
    -- Conditions
    weather_code INTEGER,
    cloud_cover DOUBLE PRECISION,
    visibility DOUBLE PRECISION,
    -- Pressure & UV
    surface_pressure DOUBLE PRECISION,
    uv_index DOUBLE PRECISION,
    -- Metadata
    is_forecast BOOLEAN DEFAULT FALSE,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city_id, recorded_at, is_forecast)
);

-- ============================================
-- 3. AIR QUALITY DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS air_quality_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    -- Pollutants
    pm2_5 DOUBLE PRECISION,
    pm10 DOUBLE PRECISION,
    dust DOUBLE PRECISION,
    carbon_monoxide DOUBLE PRECISION,
    nitrogen_dioxide DOUBLE PRECISION,
    sulphur_dioxide DOUBLE PRECISION,
    ozone DOUBLE PRECISION,
    -- AQI Indices
    us_aqi DOUBLE PRECISION,
    european_aqi DOUBLE PRECISION,
    us_aqi_pm2_5 DOUBLE PRECISION,
    us_aqi_pm10 DOUBLE PRECISION,
    -- Metadata
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city_id, recorded_at)
);

-- ============================================
-- 4. DAILY AGGREGATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_aggregates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    -- Temperature
    temp_max DOUBLE PRECISION,
    temp_min DOUBLE PRECISION,
    temp_mean DOUBLE PRECISION,
    apparent_temp_max DOUBLE PRECISION,
    apparent_temp_min DOUBLE PRECISION,
    -- Precipitation
    precipitation_sum DOUBLE PRECISION DEFAULT 0,
    precipitation_hours DOUBLE PRECISION DEFAULT 0,
    rain_sum DOUBLE PRECISION DEFAULT 0,
    precipitation_probability_max DOUBLE PRECISION,
    -- Wind
    wind_speed_max DOUBLE PRECISION,
    wind_gusts_max DOUBLE PRECISION,
    wind_direction_dominant DOUBLE PRECISION,
    -- Conditions
    weather_code INTEGER,
    sunrise TIMESTAMPTZ,
    sunset TIMESTAMPTZ,
    uv_index_max DOUBLE PRECISION,
    -- AQI Daily
    aqi_mean DOUBLE PRECISION,
    aqi_max DOUBLE PRECISION,
    pm2_5_mean DOUBLE PRECISION,
    pm10_mean DOUBLE PRECISION,
    dust_mean DOUBLE PRECISION,
    -- Flags
    is_heatwave BOOLEAN DEFAULT FALSE,         -- temp_max > 42°C
    is_dust_storm_risk BOOLEAN DEFAULT FALSE,  -- high dust + wind
    is_heavy_rain BOOLEAN DEFAULT FALSE,       -- precipitation_sum > 50mm
    -- Metadata
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city_id, date)
);

-- ============================================
-- 5. ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'heatwave', 'dust_storm', 'heavy_rain', 'poor_aqi',
        'very_poor_aqi', 'hazardous_aqi', 'cold_wave', 'high_uv',
        'thunderstorm', 'fog'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'extreme')),
    title TEXT NOT NULL,
    description TEXT,
    value DOUBLE PRECISION,          -- The value that triggered the alert
    threshold DOUBLE PRECISION,       -- The threshold that was exceeded
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. HISTORICAL STATS TABLE (for YoY comparison)
-- ============================================
CREATE TABLE IF NOT EXISTS historical_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    -- Averages
    avg_temp_max DOUBLE PRECISION,
    avg_temp_min DOUBLE PRECISION,
    total_precipitation DOUBLE PRECISION,
    avg_humidity DOUBLE PRECISION,
    avg_aqi DOUBLE PRECISION,
    -- Extremes
    max_temp_recorded DOUBLE PRECISION,
    min_temp_recorded DOUBLE PRECISION,
    max_precipitation_day DOUBLE PRECISION,
    -- Counts
    heatwave_days INTEGER DEFAULT 0,
    dust_storm_days INTEGER DEFAULT 0,
    rainy_days INTEGER DEFAULT 0,
    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city_id, month, year)
);

-- ============================================
-- 7. INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_weather_city_time ON weather_data(city_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_forecast ON weather_data(is_forecast, recorded_at);
CREATE INDEX IF NOT EXISTS idx_aqi_city_time ON air_quality_data(city_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_city_date ON daily_aggregates(city_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active, city_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type, starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_historical_city_month ON historical_stats(city_id, year, month);

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_stats ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (anon key can read all data)
CREATE POLICY "Allow public read on cities"
    ON cities FOR SELECT
    USING (true);

CREATE POLICY "Allow public read on weather_data"
    ON weather_data FOR SELECT
    USING (true);

CREATE POLICY "Allow public read on air_quality_data"
    ON air_quality_data FOR SELECT
    USING (true);

CREATE POLICY "Allow public read on daily_aggregates"
    ON daily_aggregates FOR SELECT
    USING (true);

CREATE POLICY "Allow public read on alerts"
    ON alerts FOR SELECT
    USING (true);

CREATE POLICY "Allow public read on historical_stats"
    ON historical_stats FOR SELECT
    USING (true);

-- SERVICE ROLE WRITE policies (only backend can write)
-- Note: service_role key bypasses RLS by default in Supabase
-- These policies ensure anon key cannot write
CREATE POLICY "Deny public insert on weather_data"
    ON weather_data FOR INSERT
    WITH CHECK (false);

CREATE POLICY "Deny public insert on air_quality_data"
    ON air_quality_data FOR INSERT
    WITH CHECK (false);

CREATE POLICY "Deny public insert on daily_aggregates"
    ON daily_aggregates FOR INSERT
    WITH CHECK (false);

CREATE POLICY "Deny public insert on alerts"
    ON alerts FOR INSERT
    WITH CHECK (false);

CREATE POLICY "Deny public insert on historical_stats"
    ON historical_stats FOR INSERT
    WITH CHECK (false);

-- Allow public to insert cities (for "Add Custom City" feature)
CREATE POLICY "Allow public insert on cities"
    ON cities FOR INSERT
    WITH CHECK (true);

-- ============================================
-- 9. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cities_updated_at
    BEFORE UPDATE ON cities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. VIEW: Latest weather per city
-- ============================================
CREATE OR REPLACE VIEW latest_weather AS
SELECT DISTINCT ON (w.city_id)
    w.*,
    c.name as city_name,
    c.latitude,
    c.longitude
FROM weather_data w
JOIN cities c ON w.city_id = c.id
WHERE w.is_forecast = FALSE
ORDER BY w.city_id, w.recorded_at DESC;

-- ============================================
-- 11. VIEW: Latest AQI per city
-- ============================================
CREATE OR REPLACE VIEW latest_aqi AS
SELECT DISTINCT ON (a.city_id)
    a.*,
    c.name as city_name
FROM air_quality_data a
JOIN cities c ON a.city_id = c.id
ORDER BY a.city_id, a.recorded_at DESC;

-- ============================================
-- 12. VIEW: Active alerts
-- ============================================
CREATE OR REPLACE VIEW active_alerts AS
SELECT
    a.*,
    c.name as city_name
FROM alerts a
JOIN cities c ON a.city_id = c.id
WHERE a.is_active = TRUE
  AND (a.expires_at IS NULL OR a.expires_at > NOW())
ORDER BY
    CASE a.severity
        WHEN 'extreme' THEN 1
        WHEN 'high' THEN 2
        WHEN 'moderate' THEN 3
        WHEN 'low' THEN 4
    END,
    a.created_at DESC;
