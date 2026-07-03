/**
 * Axios instance with interceptors for auth and token refresh.
 * - Attaches the access token to every request.
 * - On a 401, tries a one-time refresh using the stored refresh token,
 *   then retries the original request.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const tokenStore = {
  get access() {
    return localStorage.getItem('accessToken');
  },
  get refresh() {
    return localStorage.getItem('refreshToken');
  },
  set({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Attempt a single silent refresh on 401 (but not for auth endpoints).
    if (
      status === 401 &&
      !original._retry &&
      tokenStore.refresh &&
      !original.url?.includes('/auth/')
    ) {
      original._retry = true;
      try {
        refreshing =
          refreshing ||
          axios.post(`${API_URL}/auth/refresh`, { refreshToken: tokenStore.refresh });
        const { data } = await refreshing;
        refreshing = null;
        tokenStore.set(data.data);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return client(original);
      } catch (err) {
        refreshing = null;
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

/** Extract a human-friendly message from an Axios error. */
export const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.errors?.[0]?.message ||
  error?.message ||
  'Something went wrong';

export default client;
