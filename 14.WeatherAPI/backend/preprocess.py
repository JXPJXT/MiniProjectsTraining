"""
🚀 Rajasthan Weather & Air Quality Monitor
Main Preprocessing Script — preprocess.py

Fetches weather + air quality data from Open-Meteo APIs,
processes with Polars, generates alerts, and stores in Supabase.

Designed to run as a scheduled cron job every 2-3 hours.
"""

import asyncio
import logging
import os
import sys
from datetime import datetime, timezone, timedelta
from typing import Any

import httpx
import polars as pl
from dotenv import load_dotenv
from supabase import create_client, Client
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from config import (
    DEFAULT_CITIES,
    WEATHER_API_URL,
    AIR_QUALITY_API_URL,
    HOURLY_WEATHER_VARS,
    DAILY_WEATHER_VARS,
    HOURLY_AQI_VARS,
    THRESHOLDS,
    MAX_RETRIES,
    REQUEST_TIMEOUT_SECONDS,
    FORECAST_DAYS,
    TIMEZONE,
    CityConfig,
)

# ============================================
# Logging Setup
# ============================================
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ============================================
# Load Environment Variables
# ============================================
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    logger.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set!")
    sys.exit(1)

# Initialize Supabase client with service_role key (bypasses RLS)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ============================================
# API Fetching with Retries
# ============================================
@retry(
    stop=stop_after_attempt(MAX_RETRIES),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    before_sleep=lambda retry_state: logger.warning(
        f"⚠️ Retry {retry_state.attempt_number}/{MAX_RETRIES} after error..."
    ),
)
async def fetch_api(client: httpx.AsyncClient, url: str, params: dict) -> dict:
    """Fetch data from Open-Meteo API with retry logic."""
    response = await client.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.json()


async def fetch_weather_data(client: httpx.AsyncClient, city: CityConfig) -> dict | None:
    """Fetch hourly + daily weather forecast for a city."""
    params = {
        "latitude": city.latitude,
        "longitude": city.longitude,
        "hourly": ",".join(HOURLY_WEATHER_VARS),
        "daily": ",".join(DAILY_WEATHER_VARS),
        "timezone": TIMEZONE,
        "forecast_days": FORECAST_DAYS,
    }
    try:
        data = await fetch_api(client, WEATHER_API_URL, params)
        logger.info(f"✅ Weather data fetched for {city.name}")
        return data
    except Exception as e:
        logger.error(f"❌ Failed to fetch weather for {city.name}: {e}")
        return None


async def fetch_air_quality_data(client: httpx.AsyncClient, city: CityConfig) -> dict | None:
    """Fetch hourly air quality data for a city."""
    params = {
        "latitude": city.latitude,
        "longitude": city.longitude,
        "hourly": ",".join(HOURLY_AQI_VARS),
        "timezone": TIMEZONE,
        "forecast_days": FORECAST_DAYS,
    }
    try:
        data = await fetch_api(client, AIR_QUALITY_API_URL, params)
        logger.info(f"✅ AQI data fetched for {city.name}")
        return data
    except Exception as e:
        logger.error(f"❌ Failed to fetch AQI for {city.name}: {e}")
        return None


# ============================================
# Data Processing with Polars
# ============================================
def process_hourly_weather(raw: dict, city_id: str) -> list[dict]:
    """Process raw hourly weather data into database-ready records."""
    hourly = raw.get("hourly", {})
    if not hourly or "time" not in hourly:
        return []

    times = hourly["time"]
    now = datetime.now(timezone.utc)

    records = []
    for i, time_str in enumerate(times):
        record = {
            "city_id": city_id,
            "recorded_at": time_str,
            "temperature_2m": hourly.get("temperature_2m", [None])[i] if i < len(hourly.get("temperature_2m", [])) else None,
            "apparent_temperature": hourly.get("apparent_temperature", [None])[i] if i < len(hourly.get("apparent_temperature", [])) else None,
            "relative_humidity_2m": hourly.get("relative_humidity_2m", [None])[i] if i < len(hourly.get("relative_humidity_2m", [])) else None,
            "dewpoint_2m": hourly.get("dewpoint_2m", [None])[i] if i < len(hourly.get("dewpoint_2m", [])) else None,
            "precipitation": hourly.get("precipitation", [0])[i] if i < len(hourly.get("precipitation", [])) else 0,
            "precipitation_probability": hourly.get("precipitation_probability", [None])[i] if i < len(hourly.get("precipitation_probability", [])) else None,
            "rain": hourly.get("rain", [0])[i] if i < len(hourly.get("rain", [])) else 0,
            "wind_speed_10m": hourly.get("wind_speed_10m", [None])[i] if i < len(hourly.get("wind_speed_10m", [])) else None,
            "wind_direction_10m": hourly.get("wind_direction_10m", [None])[i] if i < len(hourly.get("wind_direction_10m", [])) else None,
            "wind_gusts_10m": hourly.get("wind_gusts_10m", [None])[i] if i < len(hourly.get("wind_gusts_10m", [])) else None,
            "weather_code": hourly.get("weather_code", [None])[i] if i < len(hourly.get("weather_code", [])) else None,
            "cloud_cover": hourly.get("cloud_cover", [None])[i] if i < len(hourly.get("cloud_cover", [])) else None,
            "visibility": hourly.get("visibility", [None])[i] if i < len(hourly.get("visibility", [])) else None,
            "surface_pressure": hourly.get("surface_pressure", [None])[i] if i < len(hourly.get("surface_pressure", [])) else None,
            "uv_index": hourly.get("uv_index", [None])[i] if i < len(hourly.get("uv_index", [])) else None,
            "is_forecast": datetime.fromisoformat(time_str) > now.replace(tzinfo=None),
        }
        records.append(record)

    # Use Polars for efficient null handling and type validation
    df = pl.DataFrame(records)
    logger.debug(f"  Processed {len(df)} hourly weather records")
    return df.to_dicts()


def process_air_quality(raw: dict, city_id: str) -> list[dict]:
    """Process raw air quality data into database-ready records."""
    hourly = raw.get("hourly", {})
    if not hourly or "time" not in hourly:
        return []

    times = hourly["time"]
    records = []
    for i, time_str in enumerate(times):
        record = {
            "city_id": city_id,
            "recorded_at": time_str,
            "pm2_5": hourly.get("pm2_5", [None])[i] if i < len(hourly.get("pm2_5", [])) else None,
            "pm10": hourly.get("pm10", [None])[i] if i < len(hourly.get("pm10", [])) else None,
            "dust": hourly.get("dust", [None])[i] if i < len(hourly.get("dust", [])) else None,
            "carbon_monoxide": hourly.get("carbon_monoxide", [None])[i] if i < len(hourly.get("carbon_monoxide", [])) else None,
            "nitrogen_dioxide": hourly.get("nitrogen_dioxide", [None])[i] if i < len(hourly.get("nitrogen_dioxide", [])) else None,
            "sulphur_dioxide": hourly.get("sulphur_dioxide", [None])[i] if i < len(hourly.get("sulphur_dioxide", [])) else None,
            "ozone": hourly.get("ozone", [None])[i] if i < len(hourly.get("ozone", [])) else None,
            "us_aqi": hourly.get("us_aqi", [None])[i] if i < len(hourly.get("us_aqi", [])) else None,
            "european_aqi": hourly.get("european_aqi", [None])[i] if i < len(hourly.get("european_aqi", [])) else None,
            "us_aqi_pm2_5": hourly.get("us_aqi_pm2_5", [None])[i] if i < len(hourly.get("us_aqi_pm2_5", [])) else None,
            "us_aqi_pm10": hourly.get("us_aqi_pm10", [None])[i] if i < len(hourly.get("us_aqi_pm10", [])) else None,
        }
        records.append(record)

    df = pl.DataFrame(records)
    logger.debug(f"  Processed {len(df)} air quality records")
    return df.to_dicts()


def process_daily_aggregates(weather_raw: dict, aqi_records: list[dict], city_id: str) -> list[dict]:
    """Process daily weather aggregates + AQI stats."""
    daily = weather_raw.get("daily", {})
    if not daily or "time" not in daily:
        return []

    times = daily["time"]

    # Calculate daily AQI stats using Polars
    aqi_daily_stats = {}
    if aqi_records:
        aqi_df = pl.DataFrame(aqi_records)
        if "recorded_at" in aqi_df.columns:
            aqi_df = aqi_df.with_columns(
                pl.col("recorded_at").str.slice(0, 10).alias("date")
            )
            aqi_grouped = aqi_df.group_by("date").agg([
                pl.col("us_aqi").mean().alias("aqi_mean"),
                pl.col("us_aqi").max().alias("aqi_max"),
                pl.col("pm2_5").mean().alias("pm2_5_mean"),
                pl.col("pm10").mean().alias("pm10_mean"),
                pl.col("dust").mean().alias("dust_mean"),
            ])
            for row in aqi_grouped.to_dicts():
                aqi_daily_stats[row["date"]] = row

    records = []
    for i, date_str in enumerate(times):
        temp_max = daily.get("temperature_2m_max", [None])[i] if i < len(daily.get("temperature_2m_max", [])) else None
        precip_sum = daily.get("precipitation_sum", [0])[i] if i < len(daily.get("precipitation_sum", [])) else 0
        wind_max = daily.get("wind_speed_10m_max", [None])[i] if i < len(daily.get("wind_speed_10m_max", [])) else None

        # AQI stats for this date
        aqi_stats = aqi_daily_stats.get(date_str, {})
        dust_mean = aqi_stats.get("dust_mean")

        # Rajasthan-specific flags
        is_heatwave = temp_max is not None and temp_max > THRESHOLDS["heatwave_temp"]
        is_dust_storm = (
            dust_mean is not None and dust_mean > THRESHOLDS["dust_storm_dust"]
            and wind_max is not None and wind_max > THRESHOLDS["dust_storm_wind"]
        )
        is_heavy_rain = precip_sum is not None and precip_sum > THRESHOLDS["heavy_rain_mm"]

        record = {
            "city_id": city_id,
            "date": date_str,
            "temp_max": temp_max,
            "temp_min": daily.get("temperature_2m_min", [None])[i] if i < len(daily.get("temperature_2m_min", [])) else None,
            "temp_mean": None,  # Calculated from hourly if needed
            "apparent_temp_max": daily.get("apparent_temperature_max", [None])[i] if i < len(daily.get("apparent_temperature_max", [])) else None,
            "apparent_temp_min": daily.get("apparent_temperature_min", [None])[i] if i < len(daily.get("apparent_temperature_min", [])) else None,
            "precipitation_sum": precip_sum,
            "precipitation_hours": daily.get("precipitation_hours", [0])[i] if i < len(daily.get("precipitation_hours", [])) else 0,
            "rain_sum": daily.get("rain_sum", [0])[i] if i < len(daily.get("rain_sum", [])) else 0,
            "precipitation_probability_max": daily.get("precipitation_probability_max", [None])[i] if i < len(daily.get("precipitation_probability_max", [])) else None,
            "wind_speed_max": wind_max,
            "wind_gusts_max": daily.get("wind_gusts_10m_max", [None])[i] if i < len(daily.get("wind_gusts_10m_max", [])) else None,
            "wind_direction_dominant": daily.get("wind_direction_10m_dominant", [None])[i] if i < len(daily.get("wind_direction_10m_dominant", [])) else None,
            "weather_code": daily.get("weather_code", [None])[i] if i < len(daily.get("weather_code", [])) else None,
            "sunrise": daily.get("sunrise", [None])[i] if i < len(daily.get("sunrise", [])) else None,
            "sunset": daily.get("sunset", [None])[i] if i < len(daily.get("sunset", [])) else None,
            "uv_index_max": daily.get("uv_index_max", [None])[i] if i < len(daily.get("uv_index_max", [])) else None,
            "aqi_mean": aqi_stats.get("aqi_mean"),
            "aqi_max": aqi_stats.get("aqi_max"),
            "pm2_5_mean": aqi_stats.get("pm2_5_mean"),
            "pm10_mean": aqi_stats.get("pm10_mean"),
            "dust_mean": dust_mean,
            "is_heatwave": is_heatwave,
            "is_dust_storm_risk": is_dust_storm,
            "is_heavy_rain": is_heavy_rain,
        }
        records.append(record)

    return records


# ============================================
# Alert Generation
# ============================================
def generate_alerts(daily_records: list[dict], city_id: str, city_name: str) -> list[dict]:
    """Generate Rajasthan-specific weather & AQI alerts."""
    alerts = []
    now = datetime.now(timezone.utc)

    for record in daily_records:
        date_str = record["date"]
        starts_at = f"{date_str}T00:00:00Z"
        expires_at = f"{date_str}T23:59:59Z"

        # 🔥 Heatwave Alert
        temp_max = record.get("temp_max")
        if temp_max and temp_max > THRESHOLDS["heatwave_temp"]:
            severity = "extreme" if temp_max > THRESHOLDS["extreme_heat_temp"] else "high"
            alerts.append({
                "city_id": city_id,
                "alert_type": "heatwave",
                "severity": severity,
                "title": f"🔥 {'Severe ' if severity == 'extreme' else ''}Heatwave Alert — {city_name}",
                "description": f"Temperature expected to reach {temp_max:.1f}°C on {date_str}. "
                              f"Stay hydrated, avoid outdoor exposure between 11 AM - 4 PM.",
                "value": temp_max,
                "threshold": THRESHOLDS["heatwave_temp"],
                "starts_at": starts_at,
                "expires_at": expires_at,
                "is_active": True,
            })

        # 🏜️ Dust Storm Risk
        if record.get("is_dust_storm_risk"):
            alerts.append({
                "city_id": city_id,
                "alert_type": "dust_storm",
                "severity": "high",
                "title": f"🏜️ Dust Storm Risk — {city_name}",
                "description": f"High dust concentration ({record.get('dust_mean', 0):.0f} µg/m³) with "
                              f"strong winds ({record.get('wind_speed_max', 0):.0f} km/h). "
                              f"Thar Desert dust advisory in effect.",
                "value": record.get("dust_mean", 0),
                "threshold": THRESHOLDS["dust_storm_dust"],
                "starts_at": starts_at,
                "expires_at": expires_at,
                "is_active": True,
            })

        # 🌧️ Heavy Rain Alert
        precip = record.get("precipitation_sum", 0)
        if precip and precip > THRESHOLDS["heavy_rain_mm"]:
            severity = "extreme" if precip > THRESHOLDS["very_heavy_rain_mm"] else "high"
            alerts.append({
                "city_id": city_id,
                "alert_type": "heavy_rain",
                "severity": severity,
                "title": f"🌧️ {'Very ' if severity == 'extreme' else ''}Heavy Rain — {city_name}",
                "description": f"Expected rainfall: {precip:.1f}mm on {date_str}. "
                              f"Waterlogging and flash floods possible.",
                "value": precip,
                "threshold": THRESHOLDS["heavy_rain_mm"],
                "starts_at": starts_at,
                "expires_at": expires_at,
                "is_active": True,
            })

        # 💨 Poor AQI Alert
        aqi = record.get("aqi_max")
        if aqi:
            if aqi > THRESHOLDS["hazardous_aqi"]:
                alerts.append({
                    "city_id": city_id,
                    "alert_type": "hazardous_aqi",
                    "severity": "extreme",
                    "title": f"☠️ Hazardous Air Quality — {city_name}",
                    "description": f"US AQI: {aqi:.0f}. Health emergency! Avoid all outdoor activity. "
                                  f"Wear N95 masks if going outside.",
                    "value": aqi,
                    "threshold": THRESHOLDS["hazardous_aqi"],
                    "starts_at": starts_at,
                    "expires_at": expires_at,
                    "is_active": True,
                })
            elif aqi > THRESHOLDS["very_poor_aqi"]:
                alerts.append({
                    "city_id": city_id,
                    "alert_type": "very_poor_aqi",
                    "severity": "high",
                    "title": f"😷 Very Poor Air Quality — {city_name}",
                    "description": f"US AQI: {aqi:.0f}. Unhealthy for everyone. "
                                  f"Reduce outdoor activities.",
                    "value": aqi,
                    "threshold": THRESHOLDS["very_poor_aqi"],
                    "starts_at": starts_at,
                    "expires_at": expires_at,
                    "is_active": True,
                })
            elif aqi > THRESHOLDS["poor_aqi"]:
                alerts.append({
                    "city_id": city_id,
                    "alert_type": "poor_aqi",
                    "severity": "moderate",
                    "title": f"⚠️ Moderate Air Quality Concern — {city_name}",
                    "description": f"US AQI: {aqi:.0f}. Sensitive groups should reduce outdoor exertion.",
                    "value": aqi,
                    "threshold": THRESHOLDS["poor_aqi"],
                    "starts_at": starts_at,
                    "expires_at": expires_at,
                    "is_active": True,
                })

        # ☀️ High UV Alert
        uv = record.get("uv_index_max")
        if uv and uv > THRESHOLDS["high_uv"]:
            alerts.append({
                "city_id": city_id,
                "alert_type": "high_uv",
                "severity": "moderate",
                "title": f"☀️ Very High UV Index — {city_name}",
                "description": f"UV Index: {uv:.1f}. Apply SPF 30+ sunscreen, wear protective clothing.",
                "value": uv,
                "threshold": THRESHOLDS["high_uv"],
                "starts_at": starts_at,
                "expires_at": expires_at,
                "is_active": True,
            })

    return alerts


# ============================================
# Supabase Upsert Helpers
# ============================================
def upsert_weather_data(records: list[dict]) -> int:
    """Upsert hourly weather records into Supabase."""
    if not records:
        return 0
    try:
        result = supabase.table("weather_data").upsert(
            records,
            on_conflict="city_id,recorded_at,is_forecast"
        ).execute()
        return len(result.data) if result.data else 0
    except Exception as e:
        logger.error(f"❌ Failed to upsert weather_data: {e}")
        return 0


def upsert_air_quality(records: list[dict]) -> int:
    """Upsert air quality records into Supabase."""
    if not records:
        return 0
    try:
        result = supabase.table("air_quality_data").upsert(
            records,
            on_conflict="city_id,recorded_at"
        ).execute()
        return len(result.data) if result.data else 0
    except Exception as e:
        logger.error(f"❌ Failed to upsert air_quality_data: {e}")
        return 0


def upsert_daily_aggregates(records: list[dict]) -> int:
    """Upsert daily aggregate records into Supabase."""
    if not records:
        return 0
    try:
        result = supabase.table("daily_aggregates").upsert(
            records,
            on_conflict="city_id,date"
        ).execute()
        return len(result.data) if result.data else 0
    except Exception as e:
        logger.error(f"❌ Failed to upsert daily_aggregates: {e}")
        return 0


def insert_alerts(alerts: list[dict]) -> int:
    """Insert new alerts (deactivate old ones first)."""
    if not alerts:
        return 0
    try:
        # Deactivate expired alerts
        supabase.table("alerts").update(
            {"is_active": False}
        ).lt("expires_at", datetime.now(timezone.utc).isoformat()).execute()

        # Insert new alerts
        result = supabase.table("alerts").insert(alerts).execute()
        return len(result.data) if result.data else 0
    except Exception as e:
        logger.error(f"❌ Failed to insert alerts: {e}")
        return 0


# ============================================
# City ID Resolution
# ============================================
def get_city_id_map() -> dict[str, str]:
    """Get mapping of city name → UUID from Supabase."""
    try:
        result = supabase.table("cities").select("id, name").eq("is_active", True).execute()
        return {row["name"]: row["id"] for row in result.data}
    except Exception as e:
        logger.error(f"❌ Failed to fetch cities: {e}")
        return {}


# ============================================
# Main Pipeline
# ============================================
async def run_pipeline():
    """Main data pipeline: Fetch → Process → Alert → Store."""
    logger.info("=" * 60)
    logger.info("🚀 Starting Rajasthan Weather & AQI Pipeline")
    logger.info(f"⏰ Run time: {datetime.now(timezone.utc).isoformat()}")
    logger.info("=" * 60)

    # 1. Get city IDs from database
    city_map = get_city_id_map()
    if not city_map:
        logger.error("❌ No cities found in database. Run schema.sql first!")
        return

    logger.info(f"📍 Processing {len(city_map)} cities: {', '.join(city_map.keys())}")

    # Stats tracking
    total_weather = 0
    total_aqi = 0
    total_daily = 0
    total_alerts = 0

    # 2. Fetch data for all cities concurrently
    async with httpx.AsyncClient() as client:
        for city_cfg in DEFAULT_CITIES:
            if city_cfg.name not in city_map:
                logger.warning(f"⚠️ City {city_cfg.name} not in database, skipping...")
                continue

            city_id = city_map[city_cfg.name]
            logger.info(f"\n{'─' * 40}")
            logger.info(f"🏙️ Processing: {city_cfg.name}")

            # Fetch weather + AQI concurrently
            weather_raw, aqi_raw = await asyncio.gather(
                fetch_weather_data(client, city_cfg),
                fetch_air_quality_data(client, city_cfg),
            )

            # 3. Process weather data
            if weather_raw:
                hourly_records = process_hourly_weather(weather_raw, city_id)
                count = upsert_weather_data(hourly_records)
                total_weather += count
                logger.info(f"  📊 Upserted {count} hourly weather records")

            # 4. Process air quality data
            aqi_records = []
            if aqi_raw:
                aqi_records = process_air_quality(aqi_raw, city_id)
                count = upsert_air_quality(aqi_records)
                total_aqi += count
                logger.info(f"  💨 Upserted {count} AQI records")

            # 5. Process daily aggregates
            if weather_raw:
                daily_records = process_daily_aggregates(weather_raw, aqi_records, city_id)
                count = upsert_daily_aggregates(daily_records)
                total_daily += count
                logger.info(f"  📅 Upserted {count} daily aggregates")

                # 6. Generate alerts
                alerts = generate_alerts(daily_records, city_id, city_cfg.name)
                if alerts:
                    count = insert_alerts(alerts)
                    total_alerts += count
                    logger.info(f"  🚨 Created {count} alerts")

    # Also handle custom cities from the database
    custom_cities = [name for name in city_map if name not in [c.name for c in DEFAULT_CITIES]]
    if custom_cities:
        logger.info(f"\n📍 Processing {len(custom_cities)} custom cities...")
        async with httpx.AsyncClient() as client:
            for city_name in custom_cities:
                city_id = city_map[city_name]
                # Fetch city coordinates from DB
                city_data = supabase.table("cities").select("*").eq("id", city_id).single().execute()
                if city_data.data:
                    custom_cfg = CityConfig(
                        name=city_data.data["name"],
                        latitude=city_data.data["latitude"],
                        longitude=city_data.data["longitude"],
                        elevation_m=city_data.data.get("elevation_m", 0) or 0,
                    )
                    weather_raw, aqi_raw = await asyncio.gather(
                        fetch_weather_data(client, custom_cfg),
                        fetch_air_quality_data(client, custom_cfg),
                    )
                    if weather_raw:
                        hourly_records = process_hourly_weather(weather_raw, city_id)
                        upsert_weather_data(hourly_records)
                    if aqi_raw:
                        aqi_records = process_air_quality(aqi_raw, city_id)
                        upsert_air_quality(aqi_records)
                    if weather_raw:
                        daily_records = process_daily_aggregates(weather_raw, aqi_records, city_id)
                        upsert_daily_aggregates(daily_records)
                        alerts = generate_alerts(daily_records, city_id, custom_cfg.name)
                        if alerts:
                            insert_alerts(alerts)

    # Summary
    logger.info(f"\n{'=' * 60}")
    logger.info(f"✅ Pipeline Complete!")
    logger.info(f"   📊 Weather records:    {total_weather}")
    logger.info(f"   💨 AQI records:        {total_aqi}")
    logger.info(f"   📅 Daily aggregates:   {total_daily}")
    logger.info(f"   🚨 Alerts generated:   {total_alerts}")
    logger.info(f"{'=' * 60}")


# ============================================
# Entry Point
# ============================================
if __name__ == "__main__":
    asyncio.run(run_pipeline())
