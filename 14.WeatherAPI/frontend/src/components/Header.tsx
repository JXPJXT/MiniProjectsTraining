// ============================================
// Header Component — App title, theme toggle, last updated
// ============================================

'use client';

import { ThemeToggle } from './ThemeToggle';
import { getRelativeTime } from '@/lib/utils';

interface HeaderProps {
    lastUpdated: string | null;
    onRefresh: () => void;
    loading: boolean;
}

export function Header({ lastUpdated, onRefresh, loading }: HeaderProps) {
    return (
        <header className="header">
            <div className="header-content">
                {/* Logo & Title */}
                <div className="header-left">
                    <div className="header-logo">
                        <span className="logo-icon">🏜️</span>
                        <div>
                            <h1 className="header-title">Rajasthan Weather</h1>
                            <p className="header-subtitle">Weather & Air Quality Monitor</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="header-right">
                    {lastUpdated && (
                        <span className="last-updated">
                            Updated {getRelativeTime(lastUpdated)}
                        </span>
                    )}
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="refresh-btn"
                        title="Refresh data"
                    >
                        <svg
                            className={`refresh-icon ${loading ? 'spinning' : ''}`}
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 2v6h-6" />
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                            <path d="M3 22v-6h6" />
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                        </svg>
                    </button>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
