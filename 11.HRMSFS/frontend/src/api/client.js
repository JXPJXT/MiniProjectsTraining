// In development, Vite proxies /api → backend
// In production (Vercel), we need the full Render URL
const BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL   // Production: full URL like https://hrms-api.onrender.com
    : '/api';                          // Dev: Vite proxy

async function request(method, path, body = null, customHeaders = {}) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json', ...customHeaders },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE}${path}`, opts);

    if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
            const err = await res.json();
            msg = err.detail || err.message || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : {};
}

export const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path),

    // Authenticated request (with Bearer token)
    getAuth: (path, token) => request('GET', path, null, {
        'Authorization': `Bearer ${token}`,
    }),
};
