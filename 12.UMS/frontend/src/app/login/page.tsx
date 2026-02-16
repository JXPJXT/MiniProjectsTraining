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
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                        <div className="sidebar-logo-icon">
                            <HiOutlineAcademicCap />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>Placement Portal</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>University Management System</div>
                        </div>
                    </div>

                    <h1 className="auth-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
                    <p className="auth-subtitle">
                        {isRegister
                            ? 'Register to access the placement portal'
                            : 'Sign in to your placement portal account'}
                    </p>

                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--danger-400)',
                            fontSize: 13,
                            marginBottom: 20,
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    id="full-name-input"
                                    className="form-input"
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                id="email-input"
                                className="form-input"
                                type="email"
                                placeholder="your@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password-input"
                                    className="form-input"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontSize: 18,
                                        display: 'flex',
                                    }}
                                >
                                    {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                                </button>
                            </div>
                        </div>

                        {isRegister && (
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    id="role-select"
                                    className="form-select"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="tpc">TPC (Training & Placement Cell)</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        )}

                        <button
                            id="auth-submit-btn"
                            className="btn btn-primary btn-lg w-full"
                            type="submit"
                            disabled={loading}
                            style={{ marginTop: 8 }}
                        >
                            {loading ? (
                                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                            ) : (
                                isRegister ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <button
                            id="toggle-auth-mode"
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-400)',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontFamily: 'inherit',
                            }}
                        >
                            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-right-content">
                    <h2>Placement Portal</h2>
                    <p>
                        Enterprise-grade placement management system designed for
                        universities. Manage drives, track careers, and connect
                        students with opportunities — all in one platform.
                    </p>
                    <div style={{ display: 'flex', gap: 24, marginTop: 40, justifyContent: 'center' }}>
                        {[
                            { label: 'Drives', value: '100+' },
                            { label: 'Students', value: '5K+' },
                            { label: 'Placed', value: '92%' },
                        ].map((stat) => (
                            <div key={stat.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>{stat.value}</div>
                                <div style={{ fontSize: 12, color: 'var(--primary-300)', marginTop: 4 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
