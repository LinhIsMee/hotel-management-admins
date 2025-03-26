/**
 * Dịch vụ xác thực người dùng
 */
const TOKEN_KEY_ADMIN = 'adminUser';
const TOKEN_KEY_CLIENT = 'userInfo';

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
        const adminUser = localStorage.getItem(TOKEN_KEY_ADMIN);
        return !!adminUser;
    }

    /**
     * Kiểm tra người dùng đã đăng nhập vào trang client chưa
     * @returns {boolean} - true nếu đã đăng nhập, false nếu chưa
     */
    isClientAuthenticated() {
        const clientUser = localStorage.getItem(TOKEN_KEY_CLIENT);
        return !!clientUser;
    }

    /**
     * Đăng nhập vào trang quản trị
     * @param {object} credentials - Thông tin đăng nhập admin
     * @returns {Promise<object>} - Promise với thông tin người dùng admin
     */
    loginAdmin(username, password) {
        console.log('Đang thử đăng nhập với:', username, password);

        // Đảm bảo kiểm tra chính xác cả hai trường username và password
        if (username === 'admin' && password === 'admin') {
            const adminUser = {
                id: 1,
                username: 'admin',
                name: 'Quản trị viên',
                email: 'admin@example.com',
                isAdmin: true
            };

            // Lưu token vào localStorage
            localStorage.setItem(TOKEN_KEY_ADMIN, JSON.stringify(adminUser));
            console.log('Đăng nhập admin thành công:', adminUser);
            return adminUser;
        }

        console.log('Đăng nhập admin thất bại');
        return null;
    }

    /**
     * Đăng nhập vào trang client
     * @param {object} credentials - Thông tin đăng nhập người dùng
     * @returns {Promise<object>} - Promise với thông tin người dùng
     */
    loginClient(email, password) {
        // Giả lập đăng nhập thành công cho client
        if (email && password) {
            const clientUser = {
                id: Math.floor(Math.random() * 1000) + 1,
                name: email.split('@')[0],
                email: email,
                isAdmin: false
            };
            localStorage.setItem(TOKEN_KEY_CLIENT, JSON.stringify(clientUser));
            return clientUser;
        }
        return null;
    }

    /**
     * Đăng xuất
     * @param {boolean} isAdmin - True nếu là admin, false nếu là user
     */
    logout(isAdmin = false) {
        if (isAdmin) {
            localStorage.removeItem(TOKEN_KEY_ADMIN);
        } else {
            localStorage.removeItem(TOKEN_KEY_CLIENT);
        }
    }

    /**
     * Lấy thông tin người dùng hiện tại
     * @returns {object|null} - Thông tin người dùng hoặc null
     */
    getCurrentUser() {
        const clientUser = localStorage.getItem(TOKEN_KEY_CLIENT);
        return clientUser ? JSON.parse(clientUser) : null;
    }

    /**
     * Đăng ký người dùng mới
     * @param {object} userData - Thông tin đăng ký
     * @returns {Promise<object>} - Promise kết quả đăng ký
     */
    register(userData) {
        // Lưu tạm thời vào localStorage
        localStorage.setItem(
            TOKEN_KEY_CLIENT,
            JSON.stringify({
                ...userData,
                id: Math.floor(Math.random() * 1000) + 1,
                isAdmin: false
            })
        );
        return true;
    }

    /**
     * Yêu cầu đặt lại mật khẩu
     * @param {string} email - Email của người dùng
     * @returns {Promise<object>} - Promise kết quả
     */
    requestPasswordReset(email) {
        return new Promise((resolve) => {
            // Giả lập gọi API
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.'
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
            // Giả lập gọi API
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Đặt lại mật khẩu thành công'
                });
            }, 1500);
        });
    }

    getCurrentAdmin() {
        const adminUser = localStorage.getItem(TOKEN_KEY_ADMIN);
        return adminUser ? JSON.parse(adminUser) : null;
    }

    logoutAdmin() {
        localStorage.removeItem(TOKEN_KEY_ADMIN);
        // Xóa các dữ liệu phiên liên quan đến admin nếu có
        localStorage.removeItem('admin_username');
        console.log("Admin đã đăng xuất");
    }

    logoutClient() {
        localStorage.removeItem(TOKEN_KEY_CLIENT);
    }

    registerClient(userData) {
        try {
            // Giả lập đăng ký thành công
            const user = {
                id: Math.floor(Math.random() * 1000) + 1,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                isAdmin: false
            };

            return true;
        } catch (error) {
            console.error('Lỗi khi đăng ký:', error);
            return false;
        }
    }
}

export default new AuthService();
