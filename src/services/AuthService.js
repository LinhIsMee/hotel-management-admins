/**
 * Dịch vụ xác thực người dùng
 */
const API_URL = 'http://103.82.24.35:9000/api/v1';
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

            // Kiểm tra kỹ hơn về dữ liệu trả về
            if (!data || !data.accessToken) {
                console.error('Invalid response format - missing accessToken');
                return null;
            }

            // Lưu token vào localStorage
            const adminInfo = {
                id: data.userId || 0,
                username: username,
                accessToken: data.accessToken,
                token: data.token || data.accessToken,
                role: data.role || 'ROLE_ADMIN' // Nếu API không trả về role, giả định là admin
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
     * @param {object} credentials - Thông tin đăng nhập người dùng
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
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
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
            return null;
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
                    username: userData.username || userData.email,
                    password: userData.password,
                    email: userData.email,
                    phone: userData.phone,
                    fullName: userData.name
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            return null;
        }
    }

    /**
     * Yêu cầu đặt lại mật khẩu
     * @param {string} email - Email của người dùng
     * @returns {Promise<object>} - Promise kết quả
     */
    requestPasswordReset(email) {
        return new Promise((resolve) => {
            // Giả lập gọi API với email
            console.log(`Requesting password reset for email: ${email}`);
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Password reset request has been sent. Please check your email.'
                });
            }, 1500);
        });
    }

    /**
     * Xác nhận mã OTP
     * @param {string} otp - Mã OTP
     * @returns {Promise<object>} - Promise kết quả
     */
    verifyOTP(otp) {
        return new Promise((resolve, reject) => {
            // Giả lập gọi API
            setTimeout(() => {
                if (otp === '123456') {
                    // Giả sử mã OTP là 123456
                    resolve({
                        success: true,
                        message: 'Xác thực OTP thành công'
                    });
                } else {
                    reject({
                        success: false,
                        message: 'Mã OTP không đúng'
                    });
                }
            }, 1000);
        });
    }

    /**
     * Đặt lại mật khẩu
     * @param {object} data - Thông tin mật khẩu mới
     * @returns {Promise<object>} - Promise kết quả
     */
    resetPassword(data) {
        return new Promise((resolve) => {
            // Giả lập gọi API với data
            console.log(`Resetting password with: ${JSON.stringify(data)}`);
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Password has been reset successfully'
                });
            }, 1500);
        });
    }

    /**
     * Lấy thông tin admin hiện tại
     * @returns {object} - Thông tin admin
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
        localStorage.removeItem(TOKEN_KEY_ADMIN);
        localStorage.removeItem('admin_username');
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
            localStorage.setItem(TOKEN_KEY_USER, JSON.stringify(user));
            return true;
        } catch (error) {
            console.error('Refresh token error:', error);
            this.logoutClient();
            return false;
        }
    }

    /**
     * Đăng xuất client
     */
    logoutClient() {
        localStorage.removeItem(TOKEN_KEY_USER);
    }
}

export default new AuthService();
