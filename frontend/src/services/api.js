import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 8000,
});

// Request interceptor
api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[API Error]', error?.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const packetService = {
    getStats: () => api.get('/stats'),
    getAll: (params) => api.get('/packets', { params }),
};

export const threatService = {
    getAll: (params) => api.get('/threats', { params }),
    blockIP: (ip) => api.post('/threats/block', { ip }),
    blockAll: () => api.post('/threats/block-all'),
    ignore: (id) => api.post(`/threats/${id}/ignore`),
};

export const attackService = {
    getAll: (params) => api.get('/attacks', { params }),
    clearAll: () => api.delete('/attacks'),
};

export const firewallService = {
    getAll: (params) => api.get('/firewall', { params }),
    removeRule: (id) => api.delete(`/firewall/${id}`),
    updateRule: (id, status) => api.patch(`/firewall/${id}`, { status }),
    addRule: (rule) => api.post('/firewall', rule),
};

export const logService = {
    getAll: (params) => api.get('/logs', { params }),
    clearAll: () => api.delete('/logs'),
};

export default api;
