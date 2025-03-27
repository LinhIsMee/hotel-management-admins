/**
 * Dịch vụ xác thực người dùng
 */
const API_URL = 'http://127.0.0.1:9000/api/v1';
export const TOKEN_KEY_USER = 'user_token';
export const TOKEN_KEY_ADMIN = 'admin_token';

class AuthService {
    /**
     * Lưu token vào localStorage
     * @param {string} token - Token người dùng
     */
    setToken(token) {
        localStorage.setItem('auth_token', token);
    }

    /**
     * Lấy token từ localStorage
     * @returns {string|null} - Token người dùng hoặc null nếu không có
     */
    getToken() {
        return localStorage.getItem('auth_token');
    }

    /**
     * Xóa token khỏi localStorage
     */
    removeToken() {
        localStorage.removeItem('auth_token');
    }

    /**
     * Kiểm tra người dùng đã đăng nhập vào trang quản trị chưa
     * @returns {boolean} - true nếu đã đăng nhập, false nếu chưa
     */
    isAdminAuthenticated() {
        const adminInfo = localStorage.getItem(TOKEN_KEY_ADMIN);
        if (!adminInfo) return false;

        try {
            const parsed = JSON.parse(adminInfo);
            return parsed.role === 'ROLE_ADMIN';
        } catch (e) {
            return false;
        }
    }

    /**
     * Kiểm tra người dùng đã đăng nhập vào trang client chưa
     * @returns {boolean} - true nếu đã đăng nhập, false nếu chưa
     */
    isClientAuthenticated() {
        const userInfo = localStorage.getItem(TOKEN_KEY_USER);
        return !!userInfo;
    }

    /**
     * Kiểm tra token còn hạn hay không
     * @param {string} token - JWT token
     * @returns {boolean} - True nếu token còn hạn
     */
    isTokenValid(token) {
        if (!token) return false;

        try {
            // JWT token có định dạng: header.payload.signature
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));

            // Kiểm tra thời gian hết hạn
            const expirationTime = decodedPayload.exp * 1000; // Chuyển sang milliseconds
            return Date.now() < expirationTime;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    /**
     * Validate token với server
     * @param {string} token - JWT token cần validate
     * @returns {Promise<object>} - Kết quả validate
     */
    async validateToken(token) {
        if (!token) return { valid: false, username: null };

        try {
            const response = await fetch(`${API_URL}/validate-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            if (!response.ok) {
                return { valid: false, username: null };
            }

            return await response.json();
        } catch (error) {
            console.error('Validate token error:', error);
            return { valid: false, username: null };
        }
    }

    /**
     * Đăng nhập vào trang quản trị
     * @param {string} username - Tên đăng nhập admin
     * @param {string} password - Mật khẩu admin
     * @returns {Promise<object>} - Promise với thông tin người dùng admin
     */
    async loginAdmin(username, password) {
        try {
            console.log('Attempting admin login with:', username);

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Admin login response status:', response.status);

            if (!response.ok) {
                console.error('Admin login failed with status:', response.status);
                return null;
            }

            const data = await response.json();
            console.log('Admin login response data:', data);

            // Kiểm tra response và role
            if (!data || !data.accessToken) {
                console.error('Invalid response format - missing accessToken');
                return null;
            }

            if (data.role !== 'ROLE_ADMIN') {
                console.error('User is not an admin');
                return null;
            }

            // Lưu token vào localStorage
            const adminInfo = {
                id: data.userId,
                username: username,
                accessToken: data.accessToken,
                token: data.token,
                role: data.role
            };

            localStorage.setItem(TOKEN_KEY_ADMIN, JSON.stringify(adminInfo));

            if (data.rememberMe) {
                localStorage.setItem('admin_username', username);
            }

            return adminInfo;
        } catch (error) {
            console.error('Admin login error:', error);
            return null;
        }
    }

    /**
     * Đăng nhập vào trang client
     * @param {string} username - Tên đăng nhập
     * @param {string} password - Mật khẩu
     * @returns {Promise<object>} - Promise với thông tin người dùng
     */
    async loginClient(username, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Username or password is incorrect');
                }
                throw new Error('Login failed');
            }

            const data = await response.json();

            // Lưu token vào localStorage
            const userInfo = {
                id: data.userId,
                username: username,
                accessToken: data.accessToken,
                token: data.token,
                role: data.role
            };

            localStorage.setItem(TOKEN_KEY_USER, JSON.stringify(userInfo));
            return userInfo;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Đăng xuất
     * @param {boolean} isAdmin - True nếu là admin, false nếu là user
     */
    logout(isAdmin = false) {
        if (isAdmin) {
            localStorage.removeItem(TOKEN_KEY_ADMIN);
        } else {
            localStorage.removeItem(TOKEN_KEY_USER);
        }
    }

    /**
     * Lấy thông tin người dùng hiện tại
     * @returns {Promise<object>} - Thông tin người dùng
     */
    async getCurrentUserProfile() {
        const userInfo = this.getCurrentUser();
        if (!userInfo) return null;

        try {
            const response = await fetch(`${API_URL}/user`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userInfo.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get user profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Get user profile error:', error);
            return null;
        }
    }

    /**
     * Lấy thông tin người dùng từ localStorage
     * @returns {object|null} - Thông tin người dùng hoặc null
     */
    getCurrentUser() {
        const userInfo = localStorage.getItem(TOKEN_KEY_USER);
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null;
    }

    /**
     * Đăng ký người dùng mới
     * @param {object} userData - Thông tin đăng ký
     * @returns {Promise<object>} - Promise kết quả đăng ký
     */
    async registerClient(userData) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: userData.username,
                    password: userData.password,
                    email: userData.email,
                    fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
                    phoneNumber: userData.phone,
                    gender: userData.gender || 'Prefer not to say',
                    dateOfBirth: userData.dateOfBirth || null,
                    address: userData.address || null,
                    nationalId: userData.nationalId || null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Yêu cầu đặt lại mật khẩu
     * @param {string} email - Email của người dùng
     * @returns {Promise<object>} - Promise kết quả
     */
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Password reset request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Password reset request error:', error);
            throw error;
        }
    }

    /**
     * Đặt lại mật khẩu
     * @param {object} data - Thông tin mật khẩu mới
     * @returns {Promise<object>} - Promise kết quả
     */
    async resetPassword(data) {
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: data.token,
                    newPassword: data.newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Password reset failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    /**
     * Lấy thông tin admin từ localStorage
     * @returns {object|null} - Thông tin admin hoặc null
     */
    getCurrentAdmin() {
        const adminInfo = localStorage.getItem(TOKEN_KEY_ADMIN);
        if (adminInfo) {
            return JSON.parse(adminInfo);
        }
        return null;
    }

    /**
     * Đăng xuất admin
     */
    logoutAdmin() {
        const admin = this.getCurrentAdmin();
        if (admin && admin.accessToken) {
            // Gọi API đăng xuất
            fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${admin.accessToken}`
                }
            }).catch((error) => {
                console.error('Logout error:', error);
            });
        }

        localStorage.removeItem(TOKEN_KEY_ADMIN);
        localStorage.removeItem('admin_username');
    }

    /**
     * Đăng xuất client
     */
    logoutClient() {
        const user = this.getCurrentUser();
        if (user && user.accessToken) {
            // Gọi API đăng xuất
            fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.accessToken}`
                }
            }).catch((error) => {
                console.error('Logout error:', error);
            });
        }

        localStorage.removeItem(TOKEN_KEY_USER);
    }

    /**
     * Kiểm tra API endpoint cho đăng ký
     * @returns {Promise<boolean>} - True nếu API có endpoint đăng ký
     */
    async checkRegisterEndpoint() {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'OPTIONS'
            });
            return response.ok;
        } catch (error) {
            console.error('Check register endpoint error:', error);
            return false;
        }
    }

    /**
     * Lấy header authorization với token
     * @returns {object} - Header với Authorization
     */
    getAuthHeader() {
        const user = this.getCurrentUser();
        if (user && user.accessToken) {
            return { Authorization: `Bearer ${user.accessToken}` };
        }
        return {};
    }

    /**
     * Xử lý refresh token khi token hết hạn
     * @returns {Promise<boolean>} - True nếu refresh token thành công
     */
    async refreshToken() {
        const user = this.getCurrentUser();
        if (!user || !user.token) return false;

        try {
            const response = await fetch(`${API_URL}/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: user.token })
            });

            if (!response.ok) {
                // Nếu refresh token thất bại, đăng xuất
                this.logoutClient();
                return false;
            }

            const data = await response.json();

            // Cập nhật token mới vào localStorage
            user.accessToken = data.accessToken;
            user.token = data.token;
            localStorage.setItem(TOKEN_KEY_USER, JSON.stringify(user));
            return true;
        } catch (error) {
            console.error('Refresh token error:', error);
            this.logoutClient();
            return false;
        }
    }
}

export default new AuthService();
