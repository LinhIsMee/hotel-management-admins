import ApiService from './ApiService';

/**
 * Service quản lý các API liên quan đến Người dùng
 */
export const userService = {
    /**
     * Lấy danh sách tất cả người dùng
     * @returns {Promise} Promise chứa danh sách người dùng
     */
    getAllUsers() {
        return ApiService.get('/api/v1/users');
    },

    /**
     * Lấy thông tin chi tiết người dùng theo ID
     * @param {number} userId ID của người dùng
     * @returns {Promise} Promise chứa thông tin chi tiết người dùng
     */
    getUserById(userId) {
        return ApiService.get(`/api/v1/users/${userId}`);
    },

    /**
     * Tìm kiếm người dùng theo từ khóa
     * @param {string} keyword Từ khóa tìm kiếm
     * @returns {Promise} Promise chứa danh sách người dùng phù hợp
     */
    searchUsers(keyword) {
        return ApiService.get(`/api/v1/users/search?q=${encodeURIComponent(keyword)}`);
    },

    /**
     * Tạo người dùng mới
     * @param {Object} userData Thông tin người dùng
     * @returns {Promise} Promise chứa thông tin người dùng đã tạo
     */
    createUser(userData) {
        return ApiService.post('/api/v1/users', userData);
    },

    /**
     * Cập nhật thông tin người dùng
     * @param {number} userId ID của người dùng
     * @param {Object} userData Thông tin cập nhật
     * @returns {Promise} Promise chứa thông tin người dùng đã cập nhật
     */
    updateUser(userId, userData) {
        return ApiService.put(`/api/v1/users/${userId}`, userData);
    },

    /**
     * Xóa người dùng
     * @param {number} userId ID của người dùng
     * @returns {Promise} Promise kết quả xóa
     */
    deleteUser(userId) {
        return ApiService.delete(`/api/v1/users/${userId}`);
    }
};

export default userService;
