import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem(REFRESH_TOKEN);
                if (!refreshToken) {
                    // No refresh token, redirect to login
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Try to refresh the token
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
                    { refresh: refreshToken }
                );

                const { access } = response.data;
                localStorage.setItem(ACCESS_TOKEN, access);

                // Retry the original request
                originalRequest.headers['Authorization'] = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear tokens and redirect to login
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;