import axios from 'axios';
import {clearToken, getToken} from '@/utils/tokenStorage.js';

export const AUTH_EXPIRED_EVENT = 'auth:expired';

/* ---------- Exponential retry ----------
   Une requête qui échoue à cause du serveur (5xx), d'une surcharge (429) ou du réseau
   est relancée automatiquement, avec un délai qui double à chaque essai :
   500 ms -> 1 s -> 2 s (+ un petit délai aléatoire pour ne pas relancer tous les clients en même temps).
   Seules les requêtes sans effet de bord (GET) sont relancées : relancer un POST pourrait créer un doublon.
   Les erreurs 4xx ne sont jamais relancées : elles viennent de la requête elle-même. */
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;
const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function shouldRetry(error) {
    const {config, response} = error;
    if (!config || !RETRYABLE_METHODS.has(config.method)) return false;
    if ((config.retryCount ?? 0) >= MAX_RETRIES) return false;
    if (!response) return true; // erreur réseau / serveur injoignable
    return response.status >= 500 || response.status === 429;
}

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1',
    timeout: 10_000,
});

// Ajoute le token à chaque requête
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

        // 401 alors qu'on envoyait un token : la session n'est plus valide
        if (error.response?.status === 401 && error.config?.headers?.Authorization) {
            clearToken();
            window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
        }
        return Promise.reject(error);
    }
);

export default client;
