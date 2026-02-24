// ============================================
// Add City Modal Component
// Add custom city by coordinates (writes to Supabase)
// ============================================

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-browser';

interface AddCityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCityAdded: () => void;
}

export function AddCityModal({ isOpen, onClose, onCityAdded }: AddCityModalProps) {
    const [name, setName] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [elevation, setElevation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !latitude.trim() || !longitude.trim()) {
            setError('City name, latitude, and longitude are required.');
            return;
        }

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        if (isNaN(lat) || lat < -90 || lat > 90) {
            setError('Latitude must be between -90 and 90.');
            return;
        }
        if (isNaN(lon) || lon < -180 || lon > 180) {
            setError('Longitude must be between -180 and 180.');
            return;
        }

        setLoading(true);
        try {
            const { error: dbError } = await supabase.from('cities').insert({
                name: name.trim(),
                state: 'Rajasthan',
                latitude: lat,
                longitude: lon,
                elevation_m: elevation ? parseFloat(elevation) : null,
                is_default: false,
                is_active: true,
            });

            if (dbError) {
                if (dbError.code === '23505') {
                    setError('A city with this name already exists.');
                } else {
                    setError(dbError.message);
                }
                return;
            }

            // Success!
            setName('');
            setLatitude('');
            setLongitude('');
            setElevation('');
            onCityAdded();
            onClose();
        } catch {
            setError('Failed to add city. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Quick-add presets for other Rajasthan cities
    const presets = [
        { name: 'Jaisalmer', lat: '26.9157', lon: '70.9083', elev: '225' },
        { name: 'Mount Abu', lat: '24.5926', lon: '72.7156', elev: '1220' },
        { name: 'Pushkar', lat: '26.4898', lon: '74.5511', elev: '510' },
        { name: 'Sikar', lat: '27.6094', lon: '75.1399', elev: '427' },
        { name: 'Chittorgarh', lat: '24.8887', lon: '74.6269', elev: '394' },
        { name: 'Bharatpur', lat: '27.2152', lon: '77.5030', elev: '178' },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">📍 Add Custom City</h2>
                    <button onClick={onClose} className="modal-close" aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Quick-add presets */}
                <div className="modal-presets">
                    <p className="modal-presets-label">Quick add:</p>
                    <div className="modal-preset-chips">
                        {presets.map((p) => (
                            <button
                                key={p.name}
                                className="preset-chip"
                                onClick={() => {
                                    setName(p.name);
                                    setLatitude(p.lat);
                                    setLongitude(p.lon);
                                    setElevation(p.elev);
                                }}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="city-name" className="form-label">City Name *</label>
                        <input
                            id="city-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Jaisalmer"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="latitude" className="form-label">Latitude *</label>
                            <input
                                id="latitude"
                                type="number"
                                step="any"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                placeholder="e.g., 26.9157"
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="longitude" className="form-label">Longitude *</label>
                            <input
                                id="longitude"
                                type="number"
                                step="any"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                placeholder="e.g., 70.9083"
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="elevation" className="form-label">Elevation (m) — optional</label>
                        <input
                            id="elevation"
                            type="number"
                            step="any"
                            value={elevation}
                            onChange={(e) => setElevation(e.target.value)}
                            placeholder="e.g., 225"
                            className="form-input"
                        />
                    </div>

                    {error && (
                        <div className="form-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Adding...' : '✅ Add City'}
                        </button>
                    </div>
                </form>

                <p className="modal-note">
                    💡 After adding a city, run the backend pipeline to fetch weather data for it.
                </p>
            </div>
        </div>
    );
}
