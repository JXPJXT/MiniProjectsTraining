/**
 * API client — all calls go through the Vite proxy at /api
 */

const BASE = '/api';

async function request(path, options = {}) {
    const url = `${BASE}${path}`;
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }

    if (res.status === 204) return null;
    return res.json();
}

export const api = {
    get: (path) => request(path),
    post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
    put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (path) => request(path, { method: 'DELETE' }),
};
