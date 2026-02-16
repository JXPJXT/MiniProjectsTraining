import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_BASE}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });
                    const { access_token, refresh_token } = res.data;
                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('refresh_token', refresh_token);
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                } catch {
                    localStorage.clear();
                    window.location.href = '/login';
                }
            } else {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (data: { email: string; password: string; full_name: string; role?: string }) =>
        api.post('/auth/register', data),
    refresh: (refresh_token: string) =>
        api.post('/auth/refresh', { refresh_token }),
    me: () => api.get('/auth/me'),
};

// Students
export const studentsAPI = {
    me: () => api.get('/students/me'),
    myCompleteness: () => api.get('/students/me/completeness'),
    list: (params?: Record<string, any>) => api.get('/students/', { params }),
    get: (id: number) => api.get(`/students/${id}`),
    create: (data: any) => api.post('/students/', data),
    update: (id: number, data: any) => api.put(`/students/${id}`, data),
    getContact: (id: number) => api.get(`/students/${id}/contact`),
    upsertContact: (id: number, data: any) => api.put(`/students/${id}/contact`, data),
    getSkills: (id: number) => api.get(`/students/${id}/skills`),
    addSkill: (id: number, data: any) => api.post(`/students/${id}/skills`, data),
    getPreferences: (id: number) => api.get(`/students/${id}/preferences`),
    upsertPreferences: (id: number, data: any) => api.put(`/students/${id}/preferences`, data),
};

// Placements
export const placementsAPI = {
    myProfile: () => api.get('/placements/profile/me'),
    getProfile: (studentId: number) => api.get(`/placements/profile/${studentId}`),
    createProfile: (data: any) => api.post('/placements/profile', data),
    updateProfile: (studentId: number, data: any) => api.put(`/placements/profile/${studentId}`, data),
    acceptPolicy: (studentId: number) => api.post(`/placements/profile/${studentId}/accept-policy`),
    checkEligibility: (studentId: number) => api.get(`/placements/eligibility/${studentId}`),
};

// Drives
export const drivesAPI = {
    list: (params?: Record<string, any>) => api.get('/drives/', { params }),
    get: (id: number) => api.get(`/drives/${id}`),
    create: (data: any) => api.post('/drives/', data),
    update: (id: number, data: any) => api.put(`/drives/${id}`, data),
    eligible: () => api.get('/drives/eligible'),
    register: (driveId: number) => api.post(`/drives/${driveId}/register`),
    cancel: (driveId: number) => api.post(`/drives/${driveId}/cancel`),
    myRegistrations: () => api.get('/drives/my/registrations'),
    driveStudents: (driveId: number) => api.get(`/drives/${driveId}/students`),
    addRound: (driveId: number, data: any) => api.post(`/drives/${driveId}/rounds`, data),
    getRounds: (driveId: number) => api.get(`/drives/${driveId}/rounds`),
    markAttendance: (data: any) => api.post('/drives/attendance', data),
    getAttendance: (driveId: number, roundId?: number) =>
        api.get(`/drives/${driveId}/attendance`, { params: { round_id: roundId } }),
    requestDutyLeave: (data: any) => api.post('/drives/duty-leave', data),
    reviewDutyLeave: (leaveId: number, data: any) => api.put(`/drives/duty-leave/${leaveId}/review`, data),
    dutyLeaves: (params?: Record<string, any>) => api.get('/drives/duty-leave/list', { params }),
    updateSelection: (driveId: number, studentId: number, data: any) =>
        api.put(`/drives/${driveId}/students/${studentId}/selection`, data),
    acceptOffer: (driveId: number) => api.post(`/drives/${driveId}/accept-offer`),
    rejectOffer: (driveId: number) => api.post(`/drives/${driveId}/reject-offer`),
    submitIndependentOffer: (formData: FormData) =>
        api.post('/drives/independent-offers', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    reviewIndependentOffer: (offerId: number, data: any) =>
        api.put(`/drives/independent-offers/${offerId}/review`, data),
    independentOffers: (params?: Record<string, any>) =>
        api.get('/drives/independent-offers/list', { params }),
};

// Documents
export const documentsAPI = {
    upload: (formData: FormData) =>
        api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    my: () => api.get('/documents/my'),
    get: (id: number) => api.get(`/documents/${id}`),
    getUrl: (id: number) => api.get(`/documents/${id}/url`),
    verify: (id: number, data: any) => api.put(`/documents/${id}/verify`, data),
    reupload: (id: number, formData: FormData) =>
        api.post(`/documents/${id}/reupload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    pendingVerifications: (params?: Record<string, any>) =>
        api.get('/documents/pending/verifications', { params }),
    studentDocuments: (studentId: number) => api.get(`/documents/student/${studentId}`),
};

// Messaging
export const messagingAPI = {
    send: (data: { receiver_id: string; content: string }) => api.post('/messages/send', data),
    conversations: () => api.get('/messages/conversations'),
    thread: (partnerId: string, limit?: number) =>
        api.get(`/messages/thread/${partnerId}`, { params: { limit } }),
    broadcast: (data: any) => api.post('/messages/broadcast', data),
    unreadCount: () => api.get('/messages/unread-count'),
};

// Notifications
export const notificationsAPI = {
    list: (params?: Record<string, any>) => api.get('/notifications/', { params }),
    unreadCount: () => api.get('/notifications/unread-count'),
    markRead: (id: number) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
};

// Users
export const usersAPI = {
    list: (params?: Record<string, any>) => api.get('/users/', { params }),
    get: (id: string) => api.get(`/users/${id}`),
    stats: () => api.get('/users/stats'),
    updateRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
    delete: (id: string) => api.delete(`/users/${id}`),
};

// Admin
export const adminAPI = {
    dashboard: () => api.get('/admin/dashboard'),
    placementReport: (params?: Record<string, any>) =>
        api.get('/admin/placement-report', { params }),
};

// Audit
export const auditAPI = {
    logs: (params?: Record<string, any>) => api.get('/audit/logs', { params }),
};
