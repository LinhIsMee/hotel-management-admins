import AuthService from './AuthService';

const API_URL = 'http://127.0.0.1:9000/api/v1';

/**
 * Service để gọi API với xử lý token tự động
 */
class ApiService {
    /**
     * Gọi API với fetch và xử lý token
     * @param {string} endpoint - Endpoint của API
     * @param {object} options - Options cho fetch
     * @returns {Promise<any>} - Promise với dữ liệu trả về
     */
    async fetchWithAuth(endpoint, options = {}) {
        const user = AuthService.getCurrentUser();

        // Kiểm tra user đã đăng nhập chưa
        if (user && user.accessToken) {
            // Kiểm tra token còn hạn hay không
            if (!AuthService.isTokenValid(user.accessToken)) {
                // Nếu token hết hạn, thử refresh token
                const refreshed = await AuthService.refreshToken();

                // Nếu refresh token thất bại, throw error
                if (!refreshed) {
                    throw new Error('Session expired. Please login again.');
                }
            }

            // Thêm header Authorization
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${AuthService.getCurrentUser().accessToken}`
            };
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);

            // Xử lý lỗi HTTP
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    message: `HTTP error ${response.status}`
                }));
                throw new Error(errorData.message || `HTTP error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API error (${endpoint}):`, error);
            throw error;
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {object} options - Fetch options
     * @returns {Promise<any>} - Promise với dữ liệu
     */
    async get(endpoint, options = {}) {
        return this.fetchWithAuth(endpoint, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Data để gửi
     * @param {object} options - Fetch options
     * @returns {Promise<any>} - Promise với dữ liệu
     */
    async post(endpoint, data, options = {}) {
        return this.fetchWithAuth(endpoint, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Data để gửi
     * @param {object} options - Fetch options
     * @returns {Promise<any>} - Promise với dữ liệu
     */
    async put(endpoint, data, options = {}) {
        return this.fetchWithAuth(endpoint, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {object} options - Fetch options
     * @returns {Promise<any>} - Promise với dữ liệu
     */
    async delete(endpoint, options = {}) {
        return this.fetchWithAuth(endpoint, {
            ...options,
            method: 'DELETE'
        });
    }
}

export default new ApiService();
