import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://3.110.32.224';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for global error handling and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    // Attempt to refresh the token
                    // Path is guessed based on login endpoint /api/accounts/password-login/
                    const response = await axios.post(`${API_URL}/api/accounts/token-refresh/`, {
                        refresh: refreshToken
                    });

                    const data = response.data as any;
                    if (data.access) {
                        localStorage.setItem('token', data.access);

                        // Update the authorization header and retry original request
                        originalRequest.headers.Authorization = `Bearer ${data.access}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    // If refresh fails, clear storage and redirect
                    localStorage.clear();
                    window.location.href = '/login';
                }
            } else {
                // No refresh token, clear and redirect
                localStorage.clear();
                window.location.href = '/login';
            }
        }

        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);
