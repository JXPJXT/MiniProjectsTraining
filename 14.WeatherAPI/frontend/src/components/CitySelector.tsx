// ============================================
// City Selector Component
// ============================================

'use client';

import type { City } from '@/lib/types';

interface CitySelectorProps {
    cities: City[];
    selectedCityId: string | null;
    onSelectCity: (cityId: string) => void;
    onAddCity: () => void;
}

export function CitySelector({ cities, selectedCityId, onSelectCity, onAddCity }: CitySelectorProps) {
    return (
        <div className="city-selector">
            <div className="city-chips">
                {cities.map((city) => (
                    <button
                        key={city.id}
                        onClick={() => onSelectCity(city.id)}
                        className={`city-chip ${selectedCityId === city.id ? 'active' : ''}`}
                    >
                        <span className="city-chip-dot" />
                        <span>{city.name}</span>
                        {city.elevation_m && (
                            <span className="city-chip-elevation">{city.elevation_m}m</span>
                        )}
                    </button>
                ))}
                <button onClick={onAddCity} className="city-chip add-city-chip" title="Add custom city">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span>Add City</span>
                </button>
            </div>
        </div>
    );
}
