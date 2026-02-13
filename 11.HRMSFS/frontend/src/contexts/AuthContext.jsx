import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

const TOKEN_KEY = 'hrms_token';
const USER_KEY = 'hrms_user';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const restore = async () => {
            const token = localStorage.getItem(TOKEN_KEY);
            const cached = localStorage.getItem(USER_KEY);

            if (token && cached) {
                try {
                    // Validate token with server
                    const data = await api.getAuth('/auth/me', token);
                    setUser(data.user);
                    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
                } catch {
                    // Token expired or invalid — try cached data briefly, then clear
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(USER_KEY);
                }
            }
            setLoading(false);
        };
        restore();
    }, []);

    const signup = async (name, email, password, role = 'employee') => {
        try {
            const data = await api.post('/auth/signup', { email, password, full_name: name, role });
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (e) {
            return { error: e.message || 'Signup failed' };
        }
    };

    const signin = async (email, password) => {
        try {
            const data = await api.post('/auth/signin', { email, password });
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (e) {
            return { error: e.message || 'Invalid credentials' };
        }
    };

    const googleSSO = async (idToken) => {
        try {
            const data = await api.post('/auth/google', { id_token: idToken });
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (e) {
            return { error: e.message || 'Google sign-in failed' };
        }
    };

    const signout = async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        try {
            if (token) {
                await fetch('/api/auth/signout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            }
        } catch { /* ignore */ }
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signup, signin, signout, googleSSO }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
