import ApiService from './ApiService';

/**
 * Service quản lý các API liên quan đến thống kê hệ thống
 */
export default {
    /**
     * Lấy thông tin tổng quan dashboard
     * @returns {Promise} Promise chứa thông tin tổng quan
     */
    getCountInfo() {
        return ApiService.get('/api/v1/statistics/count-info');
    },

    /**
     * Lấy thống kê theo khoảng thời gian
     * @param {string} startDate Ngày bắt đầu (ISO format: YYYY-MM-DDTHH:MM:SS)
     * @param {string} endDate Ngày kết thúc (ISO format: YYYY-MM-DDTHH:MM:SS)
     * @returns {Promise} Promise chứa thống kê theo thời gian
     */
    getStatsByDateRange(startDate, endDate) {
        return ApiService.get(`/api/v1/statistics/date-range?startDate=${startDate}&endDate=${endDate}`);
    },

    /**
     * Lấy danh sách đặt phòng gần đây
     * @param {number} days Số ngày gần đây (mặc định: 7)
     * @returns {Promise} Promise chứa danh sách đặt phòng gần đây
     */
    getRecentBookings(days = 7) {
        return ApiService.get(`/api/v1/statistics/recent-bookings?days=${days}`);
    },

    /**
     * Lấy thống kê đánh giá theo số sao
     * @returns {Promise} Promise chứa thống kê đánh giá
     */
    getReviewsByRating() {
        return ApiService.get('/api/v1/statistics/reviews-by-rating');
    },

    /**
     * Lấy danh sách phòng được đặt nhiều nhất
     * @param {number} limit Số lượng phòng muốn lấy (mặc định: 5)
     * @returns {Promise} Promise chứa danh sách phòng
     */
    getMostBookedRooms(limit = 5) {
        return ApiService.get(`/api/v1/statistics/most-booked-rooms?limit=${limit}`);
    },

    /**
     * Lấy doanh thu theo ngày trong tháng hiện tại
     * @returns {Promise} Promise chứa doanh thu theo ngày
     */
    getRevenueByDay() {
        return ApiService.get('/api/v1/statistics/revenue-by-day');
    },

    /**
     * Lấy số lượng đặt phòng theo ngày trong tháng hiện tại
     * @returns {Promise} Promise chứa số lượng đặt phòng theo ngày
     */
    getBookingsByDay() {
        return ApiService.get('/api/v1/statistics/bookings-by-day');
    },

    /**
     * So sánh doanh thu giữa tháng hiện tại và tháng trước
     * @returns {Promise} Promise chứa thông tin so sánh doanh thu
     */
    getRevenueComparison() {
        return ApiService.get('/api/v1/statistics/revenue-comparison');
    },

    /**
     * Lấy số lượng đặt phòng theo trạng thái
     * @returns {Promise} Promise chứa số lượng đặt phòng theo trạng thái
     */
    getBookingsByStatus() {
        return ApiService.get('/api/v1/statistics/booking-status');
    }
};
