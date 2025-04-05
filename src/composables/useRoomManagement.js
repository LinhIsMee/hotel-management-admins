import { useToast } from 'primevue/usetoast';
import { ref, reactive } from 'vue';
import RoomService from '@/services/RoomService';

/**
 * Composable cung cấp các hàm xử lý quản lý phòng
 */
export function useRoomManagement() {
    const toast = useToast();

    // Biến reactive
    const rooms = ref([]);
    const roomTypes = ref([]);
    const loading = reactive({
        rooms: false,
        roomDetail: false,
        roomTypes: false
    });

    /**
     * Lấy danh sách tất cả các phòng
     * @returns {Promise<Array>} Danh sách phòng
     */
    const fetchAllRooms = async () => {
        loading.rooms = true;
        try {
            const response = await RoomService.getAllRooms();
            rooms.value = response.data;
            return response.data;
        } catch (error) {
            handleError(error, 'Không thể tải danh sách phòng');
            return [];
        } finally {
            loading.rooms = false;
        }
    };

    /**
     * Lấy thông tin chi tiết phòng theo ID
     * @param {number} roomId ID của phòng
     * @returns {Promise<Object|null>} Thông tin chi tiết phòng
     */
    const fetchRoomById = async (roomId) => {
        loading.roomDetail = true;
        try {
            const response = await RoomService.getRoomById(roomId);
            return response.data;
        } catch (error) {
            handleError(error, `Không thể tải thông tin phòng #${roomId}`);
            return null;
        } finally {
            loading.roomDetail = false;
        }
    };

    /**
     * Lấy danh sách phòng theo loại phòng
     * @param {number} roomTypeId ID của loại phòng
     * @returns {Promise<Array>} Danh sách phòng thuộc loại phòng
     */
    const fetchRoomsByType = async (roomTypeId) => {
        try {
            const response = await RoomService.getRoomsByType(roomTypeId);
            return response.data;
        } catch (error) {
            handleError(error, `Không thể tải danh sách phòng thuộc loại #${roomTypeId}`);
            return [];
        }
    };

    /**
     * Lấy danh sách phòng theo số người ở tối đa
     * @param {number} occupancy Số người ở tối đa
     * @returns {Promise<Array>} Danh sách phòng phù hợp với số người
     */
    const fetchRoomsByOccupancy = async (occupancy) => {
        try {
            const response = await RoomService.getRoomsByOccupancy(occupancy);
            return response.data;
        } catch (error) {
            handleError(error, `Không thể tải danh sách phòng cho ${occupancy} người`);
            return [];
        }
    };

    /**
     * Lấy danh sách phòng có sẵn trong khoảng thời gian
     * @param {Date} checkIn Ngày nhận phòng
     * @param {Date} checkOut Ngày trả phòng
     * @param {number} guests Số lượng khách
     * @returns {Promise<Array>} Danh sách phòng có sẵn
     */
    const fetchAvailableRooms = async (checkIn, checkOut, guests = 1) => {
        loading.rooms = true;
        try {
            const checkInStr = formatDate(checkIn);
            const checkOutStr = formatDate(checkOut);

            const response = await RoomService.getAvailableRooms(checkInStr, checkOutStr, guests);
            rooms.value = response.data;
            return response.data;
        } catch (error) {
            handleError(error, 'Không thể tải danh sách phòng có sẵn');
            return [];
        } finally {
            loading.rooms = false;
        }
    };

    /**
     * Lấy danh sách tất cả các loại phòng
     * @returns {Promise<Array>} Danh sách loại phòng
     */
    const fetchAllRoomTypes = async () => {
        loading.roomTypes = true;
        try {
            const response = await RoomService.getAllRoomTypes();
            roomTypes.value = response.data;
            return response.data;
        } catch (error) {
            handleError(error, 'Không thể tải danh sách loại phòng');
            return [];
        } finally {
            loading.roomTypes = false;
        }
    };

    /**
     * Lấy thông tin chi tiết loại phòng theo ID
     * @param {number} roomTypeId ID của loại phòng
     * @returns {Promise<Object|null>} Thông tin chi tiết loại phòng
     */
    const fetchRoomTypeById = async (roomTypeId) => {
        try {
            const response = await RoomService.getRoomTypeById(roomTypeId);
            return response.data;
        } catch (error) {
            handleError(error, `Không thể tải thông tin loại phòng #${roomTypeId}`);
            return null;
        }
    };

    /**
     * Lấy danh sách phòng thuộc loại phòng
     * @param {number} roomTypeId ID của loại phòng
     * @returns {Promise<Array>} Danh sách phòng thuộc loại phòng
     */
    const fetchRoomsByRoomType = async (roomTypeId) => {
        try {
            const response = await RoomService.getRoomsByRoomType(roomTypeId);
            return response.data;
        } catch (error) {
            handleError(error, `Không thể tải danh sách phòng thuộc loại #${roomTypeId}`);
            return [];
        }
    };

    /**
     * Lọc phòng theo giá
     * @param {Array} rooms Danh sách phòng
     * @param {number} minPrice Giá tối thiểu
     * @param {number} maxPrice Giá tối đa
     * @returns {Array} Danh sách phòng đã lọc
     */
    const filterRoomsByPrice = (rooms, minPrice, maxPrice) => {
        if (!rooms || !Array.isArray(rooms)) return [];
        return rooms.filter(room => {
            const price = room.pricePerNight || 0;
            return price >= minPrice && price <= maxPrice;
        });
    };

    /**
     * Lọc phòng theo tiện ích
     * @param {Array} rooms Danh sách phòng
     * @param {Array} amenities Danh sách tiện ích cần lọc
     * @returns {Array} Danh sách phòng đã lọc
     */
    const filterRoomsByAmenities = (rooms, amenities) => {
        if (!rooms || !Array.isArray(rooms) || !amenities || amenities.length === 0) return rooms;

        return rooms.filter(room => {
            if (!room.amenities || !Array.isArray(room.amenities)) return false;

            // Kiểm tra xem phòng có chứa tất cả các tiện ích được chọn hay không
            return amenities.every(amenity =>
                room.amenities.some(roomAmenity =>
                    roomAmenity.toLowerCase().includes(amenity.toLowerCase())
                )
            );
        });
    };

    /**
     * Tính tổng giá phòng dựa trên ngày nhận và trả phòng
     * @param {Object} room Thông tin phòng
     * @param {Date} checkIn Ngày nhận phòng
     * @param {Date} checkOut Ngày trả phòng
     * @returns {number} Tổng giá phòng
     */
    const calculateTotalPrice = (room, checkIn, checkOut) => {
        if (!room || !checkIn || !checkOut) return 0;

        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        // Tính số ngày ở
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 0;

        // Lấy giá phòng cơ bản
        const basePrice = room.pricePerNight || 0;

        // Tính tổng tiền
        return basePrice * diffDays;
    };

    /**
     * Format số tiền thành chuỗi có định dạng tiền tệ
     * @param {number} value Số tiền cần format
     * @returns {string} Chuỗi có định dạng tiền tệ
     */
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    /**
     * Format ngày thành chuỗi YYYY-MM-DD
     * @param {Date} date Ngày cần format
     * @returns {string} Chuỗi ngày có định dạng YYYY-MM-DD
     */
    const formatDate = (date) => {
        if (!date) return '';

        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    /**
     * Xử lý lỗi và hiển thị thông báo
     * @param {Error} error Lỗi
     * @param {string} message Thông báo lỗi
     */
    const handleError = (error, message) => {
        console.error(message, error);

        let errorMessage = message;
        if (error.response) {
            // Lỗi từ server
            errorMessage += ': ' + (error.response.data?.message || error.response.statusText);
        } else if (error.request) {
            // Lỗi kết nối
            errorMessage += ': Không thể kết nối đến máy chủ';
        } else {
            // Lỗi khác
            errorMessage += ': ' + error.message;
        }

        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: errorMessage,
            life: 5000
        });
    };

    return {
        rooms,
        roomTypes,
        loading,
        fetchAllRooms,
        fetchRoomById,
        fetchRoomsByType,
        fetchRoomsByOccupancy,
        fetchAvailableRooms,
        fetchAllRoomTypes,
        fetchRoomTypeById,
        fetchRoomsByRoomType,
        filterRoomsByPrice,
        filterRoomsByAmenities,
        calculateTotalPrice,
        formatCurrency,
        formatDate
    };
}
