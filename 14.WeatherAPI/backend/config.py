"""
Rajasthan Weather & Air Quality Monitor
Configuration — Cities, API endpoints, thresholds, and constants.
"""

from dataclasses import dataclass

# ============================================
# Rajasthan Cities with Coordinates
# ============================================
@dataclass
class CityConfig:
    name: str
    latitude: float
    longitude: float
    elevation_m: float = 0.0

DEFAULT_CITIES: list[CityConfig] = [
    CityConfig("Jaipur",  26.9124, 75.7873, 431),
    CityConfig("Jodhpur", 26.2389, 73.0243, 231),
    CityConfig("Udaipur", 24.5854, 73.7125, 598),
    CityConfig("Bikaner", 28.0229, 73.3119, 224),
    CityConfig("Ajmer",   26.4499, 74.6399, 486),
    CityConfig("Kota",    25.2138, 75.8648, 274),
]

# ============================================
# Open-Meteo API Endpoints
# ============================================
WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_API_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

# ============================================
# Weather API Parameters
# ============================================
HOURLY_WEATHER_VARS = [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "dewpoint_2m",
    "precipitation",
    "precipitation_probability",
    "rain",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
    "weather_code",
    "cloud_cover",
    "visibility",
    "surface_pressure",
    "uv_index",
]

DAILY_WEATHER_VARS = [
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
    "precipitation_sum",
    "precipitation_hours",
    "precipitation_probability_max",
    "rain_sum",
    "wind_speed_10m_max",
    "wind_gusts_10m_max",
    "wind_direction_10m_dominant",
    "weather_code",
    "sunrise",
    "sunset",
    "uv_index_max",
]

# ============================================
# Air Quality API Parameters
# ============================================
HOURLY_AQI_VARS = [
    "pm2_5",
    "pm10",
    "dust",
    "carbon_monoxide",
    "nitrogen_dioxide",
    "sulphur_dioxide",
    "ozone",
    "us_aqi",
    "european_aqi",
    "us_aqi_pm2_5",
    "us_aqi_pm10",
]

# ============================================
# Alert Thresholds (Rajasthan-Specific)
# ============================================
THRESHOLDS = {
    "heatwave_temp": 42.0,           # °C — IMD heatwave threshold
    "extreme_heat_temp": 45.0,       # °C — severe heatwave
    "cold_wave_temp": 4.0,           # °C — cold wave for Rajasthan
    "dust_storm_dust": 150.0,        # µg/m³ — high dust concentration
    "dust_storm_wind": 40.0,         # km/h — strong winds for dust
    "heavy_rain_mm": 50.0,           # mm/day — heavy rainfall
    "very_heavy_rain_mm": 100.0,     # mm/day — very heavy rainfall
    "poor_aqi": 101,                 # US AQI — unhealthy for sensitive
    "very_poor_aqi": 151,            # US AQI — unhealthy
    "hazardous_aqi": 301,            # US AQI — hazardous
    "high_uv": 8.0,                  # UV Index — very high
    "fog_visibility": 1000,          # meters — fog condition
    "thunderstorm_codes": [95, 96, 99],  # WMO weather codes
}

# ============================================
# Weather Code Descriptions (WMO Standard)
# ============================================
WEATHER_CODES: dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}

# ============================================
# Monsoon Reference Data (Historical Normals)
# Approximate normal rainfall in mm for Rajasthan cities
# ============================================
MONSOON_NORMAL_RAINFALL: dict[str, dict[str, float]] = {
    "Jaipur": {
        "June": 54.0, "July": 193.0, "August": 182.0,
        "September": 90.0, "Total": 519.0
    },
    "Jodhpur": {
        "June": 26.0, "July": 103.0, "August": 114.0,
        "September": 48.0, "Total": 291.0
    },
    "Udaipur": {
        "June": 67.0, "July": 228.0, "August": 221.0,
        "September": 108.0, "Total": 624.0
    },
    "Bikaner": {
        "June": 15.0, "July": 72.0, "August": 78.0,
        "September": 30.0, "Total": 195.0
    },
    "Ajmer": {
        "June": 43.0, "July": 163.0, "August": 154.0,
        "September": 68.0, "Total": 428.0
    },
    "Kota": {
        "June": 52.0, "July": 215.0, "August": 198.0,
        "September": 102.0, "Total": 567.0
    },
}

# ============================================
# Retry & Timing Configuration
# ============================================
MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 2
REQUEST_TIMEOUT_SECONDS = 30
FORECAST_DAYS = 7
TIMEZONE = "Asia/Kolkata"
