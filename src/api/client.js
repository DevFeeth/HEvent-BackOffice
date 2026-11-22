import axios from 'axios';
import {clearToken, getToken} from '@/utils/tokenStorage.js';

export const AUTH_EXPIRED_EVENT = 'auth:expired';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1',
});

client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && error.config?.headers?.Authorization) {
            clearToken();
            window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
        }
        return Promise.reject(error);
    }
);

export default client;
