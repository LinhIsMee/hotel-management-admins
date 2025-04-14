import ApiService from './ApiService';

/**
 * Service quản lý các API liên quan đến Phòng
 */
export default {
    /**
     * Lấy danh sách tất cả các phòng
     * @returns {Promise} Promise chứa danh sách phòng
     */
    getAllRooms() {
        return ApiService.get('/api/v1/admin/rooms');
    },

    /**
     * Lấy thông tin chi tiết phòng theo ID
     * @param {number} roomId ID của phòng
     * @returns {Promise} Promise chứa thông tin chi tiết phòng
     */
    getRoomById(roomId) {
        return ApiService.get(`/api/v1/rooms/${roomId}`);
    },

    /**
     * Lấy danh sách phòng theo loại phòng
     * @param {number} roomTypeId ID của loại phòng
     * @returns {Promise} Promise chứa danh sách phòng thuộc loại phòng
     */
    getRoomsByType(roomTypeId) {
        return ApiService.get(`/api/v1/rooms/room-type/${roomTypeId}`);
    },

    /**
     * Lấy danh sách phòng theo số người ở tối đa
     * @param {number} occupancy Số người ở tối đa
     * @returns {Promise} Promise chứa danh sách phòng phù hợp với số người
     */
    getRoomsByOccupancy(occupancy) {
        return ApiService.get(`/api/v1/rooms/occupancy/${occupancy}`);
    },

    /**
     * Lấy danh sách phòng có sẵn trong khoảng thời gian
     * @param {string} checkIn Ngày nhận phòng (định dạng YYYY-MM-DD)
     * @param {string} checkOut Ngày trả phòng (định dạng YYYY-MM-DD)
     * @param {number} guests Số lượng khách (mặc định: 1)
     * @returns {Promise} Promise chứa danh sách phòng có sẵn
     */
    getAvailableRooms(checkIn, checkOut, guests = 1) {
        return ApiService.get(`/api/v1/rooms/available?checkInDate=${checkIn}&checkOutDate=${checkOut}&guests=${guests}`);
    },

    /**
     * Lấy danh sách tất cả các loại phòng
     * @returns {Promise} Promise chứa danh sách loại phòng
     */
    getAllRoomTypes() {
        return ApiService.get('/api/v1/room-types');
    },

    /**
     * Lấy thông tin chi tiết loại phòng theo ID
     * @param {number} roomTypeId ID của loại phòng
     * @returns {Promise} Promise chứa thông tin chi tiết loại phòng
     */
    getRoomTypeById(roomTypeId) {
        return ApiService.get(`/api/v1/room-types/${roomTypeId}`);
    },

    /**
     * Lấy danh sách phòng thuộc loại phòng
     * @param {number} roomTypeId ID của loại phòng
     * @returns {Promise} Promise chứa danh sách phòng thuộc loại phòng
     */
    getRoomsByRoomType(roomTypeId) {
        return ApiService.get(`/api/v1/room-types/${roomTypeId}/rooms`);
    }
};
