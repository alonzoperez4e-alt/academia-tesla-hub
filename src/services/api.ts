import axios from 'axios';
import { authSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = authSession.getAccessToken();
  // Evitamos enviar el access token de autorización en rutas de login o refresh
  if (token && !config.url?.includes('/auth/refresh') && !config.url?.includes('/auth/login')) {
    if (!config.headers) {
      config.headers = {} as any;
    }
    // Asegurar compatibilidad estricta con AxiosHeaders en Axios 1.x+
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

const flushQueue = (token: string) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    if (
      (error.response?.status !== 401 && error.response?.status !== 403) ||
      originalRequest?._retry ||
      originalRequest?.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((newToken: string) => {
          if (typeof originalRequest.headers.set === 'function') {
            originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
          } else {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      // Forzar explícitamente el uso de credenciales para mandar la cookie al backend en la petición y usar el cliente default.
      const { data } = await api.post('/auth/refresh', {}, { withCredentials: true }); 
      authSession.set(data.accessToken, data.role ?? authSession.getRole());
      flushQueue(data.accessToken);

      // Mutamos limpiamente utilizando AxiosHeaders (compatible con Axios >= 1.x)
      if (typeof originalRequest.headers.set === 'function') {
        originalRequest.headers.set('Authorization', `Bearer ${data.accessToken}`);
      } else {
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      authSession.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);