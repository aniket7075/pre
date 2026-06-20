import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://pre-n3cv.onrender.com';
const API_URL = `${BASE_URL}/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — Attach JWT ──────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Handle Token Expiry ────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expired or invalid — clear storage
      // The authSlice's checkAuthStatus will handle redirect on next app init
      await AsyncStorage.removeItem('userToken');
      // Optionally dispatch logout — import store and dispatch here if needed
      // For now, the app will redirect to Login on next navigation or app restart
    }

    // Provide a more user-friendly error message
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
