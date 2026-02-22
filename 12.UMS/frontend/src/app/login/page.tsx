'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { HiOutlineAcademicCap, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await register({ email, password, full_name: fullName, role });
            } else {
                await login(email, password);
            }
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-brand">
                            <div className="login-brand-icon">
                                <HiOutlineAcademicCap />
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>LPU Placement Portal</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Lovely Professional University</div>
                            </div>
                        </div>
                        <h1 className="login-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
                        <p className="login-subtitle">
                            {isRegister ? 'Register to access the placement portal' : 'Sign in to your placement portal account'}
                        </p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        {isRegister && (
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input id="full-name-input" className="form-input" type="text" placeholder="John Doe"
                                    value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input id="email-input" className="form-input" type="email" placeholder="your.name@lpu.in"
                                value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input id="password-input" className="form-input" type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                                    required minLength={6} style={{ paddingRight: 42 }} />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                                </button>
                            </div>
                        </div>

                        {isRegister && (
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select id="role-select" className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="tpc">TPC (Training & Placement Cell)</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        )}

                        <button id="auth-submit-btn" className="btn btn-primary" type="submit" disabled={loading}
                            style={{ marginTop: 8, width: '100%', justifyContent: 'center', padding: '12px' }}>
                            {loading ? (
                                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                            ) : (
                                isRegister ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login-toggle">
                        <button id="toggle-auth-mode" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-hero">
                    <h2 className="login-hero-title">Lovely Professional<br />University</h2>
                    <p className="login-hero-text">
                        Official Placement Management Portal — Division of Career Services.
                        Manage campus drives, track placements, verify documents, and connect
                        students with top recruiters across India.
                    </p>
                    <div className="login-stats">
                        {[
                            { label: 'Companies', value: '750+' },
                            { label: 'Students', value: '30K+' },
                            { label: 'Placed', value: '95%' },
                        ].map((stat) => (
                            <div key={stat.label} className="login-stat">
                                <div className="login-stat-value">{stat.value}</div>
                                <div className="login-stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
