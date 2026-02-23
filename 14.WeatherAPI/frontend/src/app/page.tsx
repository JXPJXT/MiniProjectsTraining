// ============================================
// Main Dashboard Page — Rajasthan Weather Monitor
// ============================================

'use client';

import { useState } from 'react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { Header } from '@/components/Header';
import { CitySelector } from '@/components/CitySelector';
import { CurrentConditions } from '@/components/CurrentConditions';
import { AQIGauge } from '@/components/AQIGauge';
import { ForecastCard } from '@/components/ForecastCard';
import { AlertsBanner } from '@/components/AlertsBanner';
import { WeatherCharts } from '@/components/WeatherCharts';
import { MonsoonTracker } from '@/components/MonsoonTracker';
import { HealthTips } from '@/components/HealthTips';
import { AddCityModal } from '@/components/AddCityModal';

export default function Dashboard() {
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [showAddCity, setShowAddCity] = useState(false);

  const {
    cities,
    currentWeather,
    currentAQI,
    forecast,
    hourlyData,
    alerts,
    loading,
    error,
    lastUpdated,
    refreshData,
  } = useWeatherData(selectedCityId);

  const selectedCity = cities.find((c) => c.id === (selectedCityId || cities[0]?.id)) || null;

  // Loading state
  if (loading && !currentWeather) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner" />
          <h2 className="loading-title">Loading Weather Data...</h2>
          <p className="loading-subtitle">Fetching data for Rajasthan cities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header lastUpdated={lastUpdated} onRefresh={refreshData} loading={loading} />

      <main className="main-content">
        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <div>
              <p className="error-text">{error}</p>
              <p className="error-hint">
                Make sure you&apos;ve run the database schema and backend pipeline first.
              </p>
            </div>
          </div>
        )}

        {/* Alerts Banner */}
        <AlertsBanner alerts={alerts} />

        {/* City Selector */}
        <CitySelector
          cities={cities}
          selectedCityId={selectedCityId || cities[0]?.id || null}
          onSelectCity={setSelectedCityId}
          onAddCity={() => setShowAddCity(true)}
        />

        {/* Main Grid Layout */}
        <div className="dashboard-grid">
          {/* Row 1: Current Conditions + AQI */}
          <div className="grid-row-hero">
            <CurrentConditions weather={currentWeather} city={selectedCity} />
            <AQIGauge aqi={currentAQI} />
          </div>

          {/* Row 2: 7-Day Forecast + Charts */}
          <div className="grid-row-forecast">
            <ForecastCard forecast={forecast} />
            <WeatherCharts hourlyData={hourlyData} forecast={forecast} />
          </div>

          {/* Row 3: Monsoon + Health Tips */}
          <div className="grid-row-insights">
            <MonsoonTracker
              forecast={forecast}
              cityName={selectedCity?.name || 'Jaipur'}
            />
            <HealthTips aqi={currentAQI} weather={currentWeather} />
          </div>
        </div>

        {/* Multi-city overview at bottom */}
        {cities.length > 1 && (
          <div className="multi-city-section">
            <h3 className="section-title">
              <span className="card-title-icon">🏙️</span>
              All Cities Overview
            </h3>
            <div className="city-overview-grid">
              {cities.map((city) => {
                const isSelected = city.id === (selectedCityId || cities[0]?.id);
                return (
                  <button
                    key={city.id}
                    className={`city-overview-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCityId(city.id)}
                  >
                    <div className="city-overview-header">
                      <span className="city-overview-name">{city.name}</span>
                      {city.elevation_m && (
                        <span className="city-overview-elev">{city.elevation_m}m</span>
                      )}
                    </div>
                    <div className="city-overview-coords">
                      {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            🏜️ Rajasthan Weather & Air Quality Monitor — Powered by{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">
              Open-Meteo
            </a>
          </p>
          <p className="footer-sub">
            Data refreshed every 2 hours • Open source • No API key required
          </p>
        </div>
      </footer>

      {/* Add City Modal */}
      <AddCityModal
        isOpen={showAddCity}
        onClose={() => setShowAddCity(false)}
        onCityAdded={refreshData}
      />
    </div>
  );
}
