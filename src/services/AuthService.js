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
            return parsed.role === 'ROLE_ADMIN' || parsed.role === 'ROLE_EMPLOYEE';
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

            // Xoá dữ liệu cũ
            localStorage.removeItem(TOKEN_KEY_ADMIN);
            localStorage.removeItem('adminUser');

            // Lưu token vào localStorage
            const adminInfo = {
                id: data.userId,
                username: username,
                accessToken: data.accessToken,
                token: data.token,
                role: data.role,
                timestamp: new Date().getTime() // Thêm timestamp để biết khi nào đăng nhập
            };

            localStorage.setItem(TOKEN_KEY_ADMIN, JSON.stringify(adminInfo));

            // Cũng lưu vào adminUser để các thành phần khác có thể truy cập
            localStorage.setItem('adminUser', JSON.stringify(adminInfo));

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
    async loginClient(credentials) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: credentials.username,
                    password: credentials.password
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
                }
                throw new Error('Đăng nhập thất bại');
            }

            const data = await response.json();
            console.log('Login response:', data);

            // Lưu token và thông tin người dùng vào localStorage
            const userInfo = {
                id: data.userId,
                username: credentials.username,
                accessToken: data.accessToken,
                token: data.token,
                role: data.role,
                fullName: data.fullName || credentials.username,
                avatar: data.avatar || 'https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/avatar-facebook-dep/top-36-anh-dai-dien-dep-cho-nu/anh-dai-dien-dep-cho-nu-che-mat-anime.jpg?1708401649581' // Avatar mặc định
            };

            // Lưu vào localStorage
            localStorage.setItem(TOKEN_KEY_USER, JSON.stringify(userInfo));

            // Cố gắng lấy thêm thông tin chi tiết của người dùng nếu API hỗ trợ
            try {
                const profileResponse = await fetch(`${API_URL}/user/profile/${userInfo.id}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${data.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();

                    // Cập nhật thông tin đầy đủ
                    const updatedUserInfo = {
                        ...userInfo,
                        fullName: profileData.fullName || userInfo.fullName,
                        email: profileData.email,
                        phone: profileData.phone,
                        avatar: profileData.avatar || userInfo.avatar,
                        name: profileData.fullName || userInfo.fullName
                    };

                    // Cập nhật lại localStorage
                    localStorage.setItem(TOKEN_KEY_USER, JSON.stringify(updatedUserInfo));

                    // Trả về thông tin đầy đủ
                    return {
                        ...updatedUserInfo,
                        user: updatedUserInfo // Đảm bảo có trường user cho emit event
                    };
                }
            } catch (profileError) {
                console.warn('Could not fetch detailed user profile:', profileError);
                // Tiếp tục với thông tin cơ bản nếu không lấy được profile
            }

            return {
                ...userInfo,
                user: userInfo // Đảm bảo có trường user cho emit event
            };
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
        if (!userInfo || !userInfo.accessToken) {
            console.error('No user token found for getCurrentUserProfile');
            return null;
        }

        try {
            console.log('Fetching user profile with token:', userInfo.accessToken);

            const response = await fetch(`${API_URL}/user/profile/${userInfo.id}`, {
                method: 'GET', // API lấy profile thường dùng GET
                headers: {
                    Authorization: `Bearer ${userInfo.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Failed to get user profile, status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error('Failed to get user profile');
            }

            const userData = await response.json();
            console.log('User profile received:', userData);

            // Cập nhật thông tin trong localStorage
            const updatedUserInfo = {
                ...userInfo,
                name: userData.fullName || userInfo.name,
                email: userData.email || userInfo.email
            };

            localStorage.setItem(TOKEN_KEY_USER, JSON.stringify(updatedUserInfo));

            return userData;
        } catch (error) {
            console.error('Get user profile error:', error);
            throw error;
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
     * Đăng ký tài khoản mới
     * @param {Object} userData - Thông tin đăng ký
     * @returns {Promise<Object>} - Thông tin người dùng đã đăng ký
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
                    fullName: userData.fullName,
                    phoneNumber: userData.phoneNumber || null,
                    gender: userData.gender || 'Male',
                    dateOfBirth: userData.dateOfBirth ? (typeof userData.dateOfBirth === 'string' ? userData.dateOfBirth : userData.dateOfBirth.toISOString().split('T')[0]) : '1990-01-01',
                    address: userData.address || null,
                    nationalId: userData.nationalId || null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Đăng ký thất bại');
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
     * Đặt lại mật khẩu (dùng cho flow quên mật khẩu)
     * @param {object} data - Thông tin mật khẩu mới
     * @returns {Promise<object>} - Promise kết quả
     */
    async resetPassword(data) {
        try {
            console.log('Resetting password with token:', data.token);

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
                console.error('Reset password failed with status:', response.status);

                // Cố gắng parse lỗi dạng JSON
                try {
                    const errorData = await response.json();
                    console.error('Error response (JSON):', errorData);
                    throw new Error(errorData.message || 'Đặt lại mật khẩu thất bại');
                } catch (jsonError) {
                    // Nếu không phải JSON, lấy text thông thường
                    const errorText = await response.text();
                    console.error('Error response (Text):', errorText);
                    throw new Error(errorText || 'Đặt lại mật khẩu thất bại');
                }
            }

            return await response.json();
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    /**
     * Thay đổi mật khẩu người dùng (khi đã đăng nhập)
     * @param {string} currentPassword - Mật khẩu hiện tại
     * @param {string} newPassword - Mật khẩu mới
     * @returns {Promise<object>} - Kết quả thay đổi mật khẩu
     */
    async changePassword(currentPassword, newPassword) {
        const user = this.getCurrentUser();
        if (!user || !user.accessToken) {
            throw new Error('User not authenticated');
        }

        try {
            console.log('Changing password for user');

            const response = await fetch(`${API_URL}/user/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                },
                body: JSON.stringify({
                    oldPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            if (!response.ok) {
                console.error('Change password failed with status:', response.status);
                const errorData = await response.json().catch(() => ({ message: 'Failed to change password' }));
                throw new Error(errorData.message || 'Failed to change password');
            }

            return await response.json();
        } catch (error) {
            console.error('Change password error:', error);
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
        localStorage.removeItem('adminUser');
        localStorage.removeItem('admin_username');
    }

    /**
     * Đăng xuất client
     */
    async logoutClient() {
        const user = this.getCurrentUser();
        if (user && user.accessToken) {
            try {
                // Gọi API đăng xuất
                const response = await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    console.warn('Logout API call failed, but proceeding with local logout');
                }
            } catch (error) {
                console.error('Logout error:', error);
                // Tiếp tục xóa dữ liệu người dùng dù có lỗi
            }
        }

        // Xóa thông tin người dùng khỏi localStorage
        localStorage.removeItem(TOKEN_KEY_USER);

        // Gửi event để thông báo đã logout
        window.dispatchEvent(new CustomEvent('user-logged-out'));

        return true;
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

    /**
     * Cập nhật thông tin hồ sơ người dùng
     * @param {object} userData - Thông tin người dùng cần cập nhật
     * @returns {Promise<object>} - Thông tin người dùng đã cập nhật
     */
    async updateUserProfile(userData) {
        const user = this.getCurrentUser();
        if (!user || !user.accessToken) {
            throw new Error('User not authenticated');
        }

        try {
            // Tạo URL với userId
            const updateUrl = `${API_URL}/user/update/${user.id}`;
            console.log('Updating user profile at URL:', updateUrl);

            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`
                },
                body: JSON.stringify({
                    fullName: userData.fullName,
                    email: userData.email,
                    phone: userData.phone,
                    gender: userData.gender,
                    dateOfBirth: userData.dateOfBirth,
                    address: userData.address,
                    nationalId: userData.nationalId
                })
            });

            if (!response.ok) {
                console.error('Update profile failed, status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(errorText || 'Failed to update profile');
            }

            const data = await response.json();
            console.log('Profile update response:', data);

            // Cập nhật thông tin user trong localStorage
            const updatedUser = {
                ...user,
                name: userData.fullName || user.name,
                email: userData.email || user.email
            };

            localStorage.setItem(TOKEN_KEY_USER, JSON.stringify(updatedUser));

            // Dispatch event thông báo user profile đã được cập nhật
            window.dispatchEvent(new CustomEvent('update-user-profile'));

            return data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }
}

export default new AuthService();
