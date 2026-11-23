import axios from 'axios';
import {clearToken, getToken} from '@/utils/tokenStorage.js';

export const AUTH_EXPIRED_EVENT = 'auth:expired';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;
const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function shouldRetry(error) {
    const {config, response} = error;
    if (!config || !RETRYABLE_METHODS.has(config.method)) return false;
    if ((config.retryCount ?? 0) >= MAX_RETRIES) return false;
    if (!response) return true;
    return response.status >= 500 || response.status === 429;
}

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1',
    timeout: 10_000,
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
    async (error) => {
        if (shouldRetry(error)) {
            const {config} = error;
            config.retryCount = (config.retryCount ?? 0) + 1;
            await wait(BASE_DELAY_MS * 2 ** (config.retryCount - 1) + Math.random() * 100);
            return client(config);
        }

        if (error.response?.status === 401 && error.config?.headers?.Authorization) {
            clearToken();
            window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
        }
        return Promise.reject(error);
    }
);

export default client;
