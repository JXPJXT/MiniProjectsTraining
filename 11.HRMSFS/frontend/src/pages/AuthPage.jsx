import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
    const [mode, setMode] = useState('signin');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    // Removed explicit role selection - defaults to 'employee'

    const { signin, signup, googleSSO } = useAuth();
    const { theme, toggle } = useTheme();

    // Google Client ID from Vite env
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    const handleGoogleCallback = useCallback(async (response) => {
        if (response.credential) {
            setSubmitting(true);
            setError('');
            const res = await googleSSO(response.credential);
            if (res.error) setError(res.error);
            setSubmitting(false);
        }
    }, [googleSSO]);

    // Load Google Identity Services
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (!window.google?.accounts?.id) return;

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback,
                auto_select: false,
                ux_mode: 'popup',
            });

            const btnContainer = document.getElementById('google-btn-container');
            if (btnContainer) {
                window.google.accounts.id.renderButton(
                    btnContainer,
                    {
                        theme: theme === 'dark' ? 'filled_black' : 'outline',
                        size: 'large',
                        type: 'standard',
                        shape: 'rectangular',
                        text: 'continue_with',
                        logo_alignment: 'left',
                        width: '1000',
                    }
                );
            }
        };
        document.head.appendChild(script);

        return () => {
            if (script.parentNode) script.parentNode.removeChild(script);
        };
    }, [GOOGLE_CLIENT_ID, theme, handleGoogleCallback]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        if (mode === 'signup') {
            if (!name || !email || !password) { setError('All fields are required'); setSubmitting(false); return; }
            if (password.length < 4) { setError('Password must be at least 4 characters'); setSubmitting(false); return; }
            // Default to 'employee' role for self-signup
            const res = await signup(name, email, password, 'employee');
            if (res.error) setError(res.error);
        } else {
            if (!email || !password) { setError('Email and password are required'); setSubmitting(false); return; }
            const res = await signin(email, password);
            if (res.error) setError(res.error);
        }
        setSubmitting(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-brand">
                    <h1>HRMS</h1>
                    <p>MANAGEMENT SUITE</p>
                </div>
                <div className="auth-tagline">
                    <span className="auth-tagline-line" />
                    <h2>Enterprise Human Resource Management</h2>
                    <p>Streamline your workforce operations with precision and elegance.</p>
                    <div className="auth-features">
                        <div className="auth-feature">
                            <span className="auth-feature-num">40</span>
                            <span className="auth-feature-label">Modules</span>
                        </div>
                        <div className="auth-feature">
                            <span className="auth-feature-num">∞</span>
                            <span className="auth-feature-label">Scalability</span>
                        </div>
                        <div className="auth-feature">
                            <span className="auth-feature-num">100%</span>
                            <span className="auth-feature-label">Compliant</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-right-top">
                    <button className="header-btn" onClick={toggle} title="Toggle theme">
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                </div>

                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h2>{mode === 'signin' ? 'Welcome back' : 'Create account'}</h2>
                        <p>{mode === 'signin' ? 'Sign in to your HRMS account' : 'Set up your HRMS credentials'}</p>
                    </div>

                    <div style={{ marginBottom: 24, minHeight: '44px' }}>
                        {GOOGLE_CLIENT_ID ? (
                            <div id="google-btn-container" style={{ width: '100%' }} />
                        ) : (
                            <div style={{
                                padding: '12px',
                                background: 'var(--bg-hover)',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)'
                            }}>
                                <strong>⚠️ Configuration Missing</strong><br />
                                Add <code>VITE_GOOGLE_CLIENT_ID</code> to .env and restart dev server.
                            </div>
                        )}
                    </div>

                    <div className="auth-divider"><span>or</span></div>

                    <form onSubmit={handleSubmit}>
                        {error && <div className="auth-error">{error}</div>}

                        {mode === 'signup' && (
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="auth-pw-wrap">
                                <input
                                    className="form-input"
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
                                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Role selection removed - defaults to 'employee' */}

                        <button type="submit" className="btn btn-primary auth-submit-btn" disabled={submitting}>
                            {submitting ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="auth-switch">
                        {mode === 'signin' ? (
                            <>Don't have an account? <button onClick={() => { setMode('signup'); setError(''); }}>Sign up</button></>
                        ) : (
                            <>Already have an account? <button onClick={() => { setMode('signin'); setError(''); }}>Sign in</button></>
                        )}
                    </div>
                </div>

                <div className="auth-footer">
                    <span>HRMS Suite © 2026</span>
                </div>
            </div>
        </div>
    );
}
