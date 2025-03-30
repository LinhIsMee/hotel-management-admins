import axios from 'axios';

// Tạo instance cho axios
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Export các phương thức GET, POST, PUT, DELETE
export default {
    get(url, config) {
        return apiClient.get(url, config);
    },
    post(url, data, config) {
        return apiClient.post(url, data, config);
    },
    put(url, data, config) {
        return apiClient.put(url, data, config);
    },
    delete(url, config) {
        return apiClient.delete(url, config);
    }
};
