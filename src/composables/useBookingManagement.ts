import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = 'http://127.0.0.1:9000/api/v1';

export const useBookingManagement = () => {
  const bookings = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Lấy auth token từ store
  const authStore = useAuthStore();

  // Cấu hình headers với token
  const getHeaders = () => {
    return {
      Authorization: `Bearer ${authStore.token}`,
      'Content-Type': 'application/json',
    };
  };

  // Lấy tất cả đặt phòng
  const getAllBookings = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_BASE_URL}/bookings`, {
        headers: getHeaders(),
      });

      bookings.value = response.data.data || [];
      return bookings.value;
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đặt phòng:', err);
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Tìm kiếm đặt phòng theo tên khách hàng
  const searchBookingsByCustomerName = async (name) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/search`, {
        params: { customerName: name },
        headers: getHeaders(),
      });

      bookings.value = response.data.data || [];
      return bookings.value;
    } catch (err) {
      console.error('Lỗi khi tìm kiếm đặt phòng theo tên:', err);
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Tìm kiếm đặt phòng theo số điện thoại
  const searchBookingsByPhone = async (phone) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/search`, {
        params: { phone },
        headers: getHeaders(),
      });

      bookings.value = response.data.data || [];
      return bookings.value;
    } catch (err) {
      console.error('Lỗi khi tìm kiếm đặt phòng theo số điện thoại:', err);
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Tạo đặt phòng mới
  const createBooking = async (booking, isAdmin = false) => {
    loading.value = true;
    error.value = null;

    try {
      // Sử dụng endpoint khác nhau cho admin và user thông thường
      const endpoint = isAdmin ? `${API_BASE_URL}/bookings/admin-create` : `${API_BASE_URL}/bookings`;

      const response = await axios.post(endpoint, booking, {
        headers: getHeaders(),
      });

      if (response.data) {
        return response.data.data;
      }

      return null;
    } catch (err) {
      console.error('Lỗi khi tạo đặt phòng:', err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Cập nhật đặt phòng
  const updateBooking = async (booking) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${booking.id}`, booking, {
        headers: getHeaders(),
      });

      if (response.data) {
        return response.data.data;
      }

      return null;
    } catch (err) {
      console.error('Lỗi khi cập nhật đặt phòng:', err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Hủy đặt phòng
  const cancelBooking = async (bookingId) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {}, {
        headers: getHeaders(),
      });

      if (response.data) {
        return response.data.data;
      }

      return null;
    } catch (err) {
      console.error('Lỗi khi hủy đặt phòng:', err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Xác nhận đặt phòng
  const confirmBooking = async (bookingId) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/confirm`, {}, {
        headers: getHeaders(),
      });

      if (response.data) {
        return response.data.data;
      }

      return null;
    } catch (err) {
      console.error('Lỗi khi xác nhận đặt phòng:', err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Đánh dấu đã thanh toán
  const markAsPaid = async (bookingId) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/mark-paid`, {}, {
        headers: getHeaders(),
      });

      if (response.data) {
        return response.data.data;
      }

      return null;
    } catch (err) {
      console.error('Lỗi khi đánh dấu thanh toán:', err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Đánh dấu đã nhận phòng
  const markAsCheckedIn = async (bookingId) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/check-in`, {}, {
        headers: getHeaders(),
      });

      if (response.data) {
        return response.data.data;
      }

      return null;
    } catch (err) {
      console.error('Lỗi khi đánh dấu nhận phòng:', err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Đánh dấu đã trả phòng
  const markAsCheckedOut = async (bookingId) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/check-out`, {}, {
        headers: getHeaders(),
      });

      if (response.data) {
        return response.data.data;
      }

      return null;
    } catch (err) {
      console.error('Lỗi khi đánh dấu trả phòng:', err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Lấy tất cả phòng
  const fetchAllRooms = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: getHeaders(),
      });

      if (response.data) {
        return response.data.data || [];
      }

      return [];
    } catch (err) {
      console.error('Lỗi khi lấy danh sách phòng:', err);
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Lấy danh sách các phòng còn trống trong khoảng thời gian
  const fetchAvailableRooms = async (checkInDate, checkOutDate) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_BASE_URL}/rooms/available`, {
        params: {
          checkInDate: checkInDate instanceof Date ? checkInDate.toISOString() : checkInDate,
          checkOutDate: checkOutDate instanceof Date ? checkOutDate.toISOString() : checkOutDate,
        },
        headers: getHeaders(),
      });

      if (response.data) {
        return response.data.data || [];
      }

      return [];
    } catch (err) {
      console.error('Lỗi khi lấy danh sách phòng trống:', err);
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Lấy danh sách dịch vụ
  const fetchAvailableServices = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_BASE_URL}/services`, {
        headers: getHeaders(),
      });

      if (response.data) {
        return response.data.data || [];
      }

      return [];
    } catch (err) {
      console.error('Lỗi khi lấy danh sách dịch vụ:', err);
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Xác thực mã giảm giá
  const fetchDiscount = async (code) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_BASE_URL}/discounts/validate/${code}`, {
        headers: getHeaders(),
      });

      if (response.data) {
        return response.data.data;
      }

      return null;
    } catch (err) {
      console.error('Lỗi khi xác thực mã giảm giá:', err);
      error.value = err;
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    bookings,
    loading,
    error,
    getAllBookings,
    searchBookingsByCustomerName,
    searchBookingsByPhone,
    createBooking,
    updateBooking,
    cancelBooking,
    confirmBooking,
    markAsPaid,
    markAsCheckedIn,
    markAsCheckedOut,
    fetchAllRooms,
    fetchAvailableRooms,
    fetchAvailableServices,
    fetchDiscount
  };
};
