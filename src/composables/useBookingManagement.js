import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

export function useBookingManagement() {
    const bookings = ref([]);
    const loading = ref(true);
    const bookingDialog = ref(false);
    const deleteBookingDialog = ref(false);
    const deleteBookingsDialog = ref(false);
    const booking = ref({});
    const selectedBookings = ref(null);
    const filters = ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        fullName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        email: { value: null, matchMode: FilterMatchMode.CONTAINS },
        phone: { value: null, matchMode: FilterMatchMode.CONTAINS },
        status: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
    const submitted = ref(false);
    const toast = useToast();
    const totalElements = ref(0);
    const pageSize = ref(10);
    const stats = ref({
        total: 0,
        pending: 0,
        confirmed: 0,
        checkedIn: 0,
        checkedOut: 0,
        cancelled: 0,
        totalRevenue: 0
    });

    // Định nghĩa địa chỉ cơ sở của API backend
    const API_BASE_URL = 'http://localhost:9000';

    // Trạng thái booking
    const statuses = ref([
        { label: 'Đang chờ xử lý', value: 'PENDING' },
        { label: 'Đã xác nhận', value: 'CONFIRMED' },
        { label: 'Đã check-in', value: 'CHECKED_IN' },
        { label: 'Đã hoàn thành', value: 'COMPLETED' },
        { label: 'Đã hủy', value: 'CANCELLED' }
    ]);

    // Trạng thái thanh toán
    const paymentStatuses = ref([
        { label: 'Chưa thanh toán', value: 'UNPAID' },
        { label: 'Đã thanh toán', value: 'PAID' },
        { label: 'Đang xử lý', value: 'PROCESSING' },
        { label: 'Đã hoàn tiền', value: 'REFUNDED' },
        { label: 'Thanh toán thất bại', value: 'FAILED' }
    ]);

    // Phương thức thanh toán
    const paymentMethods = ref([
        { label: 'Thẻ tín dụng', value: 'CREDIT_CARD' },
        { label: 'VnPay', value: 'VNPAY' },
        { label: 'Tiền mặt', value: 'CASH' },
        { label: 'Chuyển khoản', value: 'BANK_TRANSFER' }
    ]);

    // Hàm helper lấy token từ localStorage
    const getAuthToken = () => {
        try {
            // Lấy dữ liệu từ admin_token trong localStorage
            const adminTokenData = localStorage.getItem('admin_token');

            if (!adminTokenData) {
                toast.add({
                    severity: 'error',
                    summary: 'Lỗi xác thực',
                    detail: 'Không tìm thấy token đăng nhập, vui lòng đăng nhập lại',
                    life: 3000
                });
                return null;
            }

            // Parse chuỗi JSON
            const adminTokenObj = JSON.parse(adminTokenData);

            // Lấy accessToken từ object
            const accessToken = adminTokenObj.accessToken;

            if (!accessToken) {
                toast.add({
                    severity: 'error',
                    summary: 'Lỗi xác thực',
                    detail: 'Token không hợp lệ, vui lòng đăng nhập lại',
                    life: 3000
                });
                return null;
            }

            return accessToken;
        } catch (error) {
            console.error('Lỗi khi lấy token:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi xác thực',
                detail: 'Có lỗi xảy ra khi xác thực, vui lòng đăng nhập lại',
                life: 3000
            });
            return null;
        }
    };

    // Thêm hàm helper để tạo header xác thực
    const getAuthHeaders = (contentType = false) => {
        const token = getAuthToken();
        if (!token) return null;

        const headers = {
            Authorization: `Bearer ${token}`
        };

        if (contentType) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;
    };

    // Tính toán thống kê từ dữ liệu bookings
    const calculateStats = (bookingData) => {
        const result = {
            total: bookingData.length,
            pending: 0,
            confirmed: 0,
            checkedIn: 0,
            checkedOut: 0,
            cancelled: 0,
            totalRevenue: 0
        };

        bookingData.forEach((booking) => {
            switch (booking.status) {
                case 'PENDING':
                    result.pending++;
                    break;
                case 'CONFIRMED':
                    result.confirmed++;
                    if (booking.paymentStatus === 'PAID') {
                        result.totalRevenue += parseFloat(booking.finalPrice);
                    }
                    break;
                case 'CHECKED_IN':
                    result.checkedIn++;
                    if (booking.paymentStatus === 'PAID') {
                        result.totalRevenue += parseFloat(booking.finalPrice);
                    }
                    break;
                case 'CHECKED_OUT':
                    result.checkedOut++;
                    if (booking.paymentStatus === 'PAID') {
                        result.totalRevenue += parseFloat(booking.finalPrice);
                    }
                    break;
                case 'CANCELLED':
                    result.cancelled++;
                    break;
            }
        });

        stats.value = result;
    };

    // Lấy tất cả bookings
    const fetchAllBookings = async () => {
        loading.value = true;
        try {
            const headers = getAuthHeaders();
            if (!headers) {
                loading.value = false;
                return;
            }

            // Kiểm tra xem người dùng có quyền admin không
            const isAdmin = localStorage.getItem('admin_token') ? true : false;

            if (isAdmin) {
                // Nếu là admin, chỉ gọi API admin
                try {
                    const response = await fetch(`${API_BASE_URL}/api/v1/admin/bookings/`, {
                        headers
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Dữ liệu nhận được từ API admin:', data);
                        // Đảm bảo gán dữ liệu vào reactive ref bookings
                        bookings.value = data || [];
                        updateStats();
                        loading.value = false;
                        return;
                    }

                    console.warn('Không thể gọi API admin, kiểm tra lại quyền truy cập');
                    toast.add({
                        severity: 'error',
                        summary: 'Lỗi quyền truy cập',
                        detail: 'Bạn không có quyền xem danh sách đặt phòng',
                        life: 3000
                    });
                    bookings.value = [];
                } catch (adminError) {
                    console.error('Lỗi khi gọi API admin:', adminError);
                    toast.add({
                        severity: 'error',
                        summary: 'Lỗi hệ thống',
                        detail: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
                        life: 3000
                    });
                    bookings.value = [];
                }
            } else {
                // Nếu là user thường, gọi API user
                try {
                    const userResponse = await fetch(`${API_BASE_URL}/api/v1/user/bookings/my-bookings`, {
                        headers
                    });

                    if (!userResponse.ok) {
                        throw new Error(`Không thể tải dữ liệu đặt phòng: ${userResponse.statusText} (${userResponse.status})`);
                    }

                    const userData = await userResponse.json();
                    console.log('Dữ liệu nhận được từ API user:', userData);

                    bookings.value = userData || [];
                    updateStats();
                } catch (userError) {
                    console.error('Lỗi khi tải dữ liệu đặt phòng của người dùng:', userError);
                    toast.add({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: 'Không thể tải dữ liệu đặt phòng của bạn',
                        life: 3000
                    });
                    bookings.value = [];
                }
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu đặt phòng:', error);
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu đặt phòng', life: 3000 });
            bookings.value = [];
        } finally {
            loading.value = false;
        }
    };

    // Lấy bookings theo người dùng
    const fetchUserBookings = async (userId) => {
        try {
            loading.value = true;

            const headers = getAuthHeaders();
            if (!headers) {
                loading.value = false;
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/user/${userId}`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải danh sách đặt phòng của người dùng: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Dữ liệu booking của người dùng:', result);

            bookings.value = Array.isArray(result) ? result : [];
            totalElements.value = bookings.value.length;
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu đặt phòng của người dùng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải danh sách đặt phòng của người dùng',
                life: 3000
            });
            bookings.value = [];
        } finally {
            loading.value = false;
        }
    };

    // Lấy bookings theo trạng thái
    const fetchBookingsByStatus = async (status) => {
        try {
            loading.value = true;

            const headers = getAuthHeaders();
            if (!headers) {
                loading.value = false;
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/v1/admin/bookings/status/${status}`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải danh sách đặt phòng theo trạng thái: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log(`Dữ liệu booking có trạng thái ${status}:`, result);

            bookings.value = Array.isArray(result) ? result : [];
            totalElements.value = bookings.value.length;
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu đặt phòng theo trạng thái:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải danh sách đặt phòng theo trạng thái',
                life: 3000
            });
            bookings.value = [];
        } finally {
            loading.value = false;
        }
    };

    // Lấy bookings theo khoảng thời gian
    const fetchBookingsByDateRange = async (startDate, endDate) => {
        try {
            loading.value = true;

            const headers = getAuthHeaders();
            if (!headers) {
                loading.value = false;
                return;
            }

            // Định dạng ngày nếu là đối tượng Date
            const start = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
            const end = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;

            const response = await fetch(`${API_BASE_URL}/api/v1/admin/bookings/date-range?startDate=${start}&endDate=${end}`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải danh sách đặt phòng theo khoảng thời gian: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log(`Dữ liệu booking trong khoảng thời gian từ ${start} đến ${end}:`, result);

            bookings.value = Array.isArray(result) ? result : [];
            totalElements.value = bookings.value.length;
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu đặt phòng theo khoảng thời gian:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải danh sách đặt phòng theo khoảng thời gian',
                life: 3000
            });
            bookings.value = [];
        } finally {
            loading.value = false;
        }
    };

    // Lấy booking theo ID
    const fetchBookingById = async (id) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/admin/bookings/${id}`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải thông tin đặt phòng: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log(`Dữ liệu booking có ID ${id}:`, result);

            return result;
        } catch (error) {
            console.error('Lỗi khi tải thông tin chi tiết đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải thông tin chi tiết đặt phòng',
                life: 3000
            });
            return null;
        }
    };

    // Tạo booking mới
    const createBooking = async (bookingData) => {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return null;

            // Phân biệt giữa API admin và API user
            const endpoint = bookingData.isAdminCreated
                ? `${API_BASE_URL}/api/v1/admin/bookings/create`
                : `${API_BASE_URL}/api/v1/bookings/create`;

            console.log(`Tạo booking mới qua endpoint: ${endpoint}`);
            console.log('Dữ liệu gửi đi:', bookingData);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Dữ liệu không hợp lệ');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy phòng hoặc mã giảm giá');
                } else {
                    throw new Error(`Lỗi khi tạo đặt phòng: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log('Kết quả tạo booking:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã tạo đặt phòng mới thành công',
                life: 3000
            });

            return result;
        } catch (error) {
            console.error('Lỗi khi tạo đặt phòng mới:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tạo đặt phòng mới',
                life: 3000
            });
            return null;
        }
    };

    // Cập nhật booking
    const updateBooking = async (id, bookingData) => {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return null;

            // Phân biệt giữa API admin và API user
            const endpoint = bookingData.isAdminUpdate
                ? `${API_BASE_URL}/api/v1/admin/bookings/update/${id}`
                : `${API_BASE_URL}/api/v1/admin/bookings/update/${id}`;

            console.log(`Cập nhật booking qua endpoint: ${endpoint}`);
            console.log('Dữ liệu gửi đi:', bookingData);

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers,
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Dữ liệu không hợp lệ');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy booking');
                } else {
                    throw new Error(`Lỗi khi cập nhật đặt phòng: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log('Kết quả cập nhật booking:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã cập nhật đặt phòng thành công',
                life: 3000
            });

            return result;
        } catch (error) {
            console.error('Lỗi khi cập nhật đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể cập nhật đặt phòng',
                life: 3000
            });
            return null;
        }
    };

    // Hủy booking
    const cancelBooking = async (id) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            // Sử dụng endpoint admin nếu đang ở trang admin
            const isAdmin = localStorage.getItem('admin_role') === 'ADMIN';
            const endpoint = isAdmin
                ? `${API_BASE_URL}/api/v1/admin/bookings/cancel/${id}`
                : `${API_BASE_URL}/api/v1/bookings/cancel/${id}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Không thể hủy đặt phòng (không đúng trạng thái)');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy booking');
                } else {
                    throw new Error(`Lỗi khi hủy đặt phòng: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log('Kết quả hủy booking:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã hủy đặt phòng thành công',
                life: 3000
            });

            return result;
        } catch (error) {
            console.error('Lỗi khi hủy đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể hủy đặt phòng',
                life: 3000
            });
            return null;
        }
    };

    // Xác nhận booking
    const confirmBooking = async (id) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            // Sử dụng endpoint admin nếu đang ở trang admin
            const isAdmin = localStorage.getItem('admin_role') === 'ADMIN';
            const endpoint = isAdmin
                ? `${API_BASE_URL}/api/v1/admin/bookings/confirm/${id}`
                : `${API_BASE_URL}/api/v1/bookings/confirm/${id}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Không thể xác nhận đặt phòng (không đúng trạng thái)');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy booking');
                } else {
                    throw new Error(`Lỗi khi xác nhận đặt phòng: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log('Kết quả xác nhận booking:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã xác nhận đặt phòng thành công',
                life: 3000
            });

            return result;
        } catch (error) {
            console.error('Lỗi khi xác nhận đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể xác nhận đặt phòng',
                life: 3000
            });
            return null;
        }
    };

    // Check-in booking - Chỉ dành cho admin
    const checkInBooking = async (id) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/admin/bookings/check-in/${id}`, {
                method: 'POST',
                headers
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Không thể check-in đặt phòng (không đúng trạng thái)');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy booking');
                } else {
                    throw new Error(`Lỗi khi check-in đặt phòng: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log('Kết quả check-in booking:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã check-in đặt phòng thành công',
                life: 3000
            });

            return result;
        } catch (error) {
            console.error('Lỗi khi check-in đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể check-in đặt phòng',
                life: 3000
            });
            return null;
        }
    };

    // Check-out booking - Chỉ dành cho admin
    const checkOutBooking = async (id) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/admin/bookings/check-out/${id}`, {
                method: 'POST',
                headers
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Không thể check-out đặt phòng (không đúng trạng thái)');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy booking');
                } else {
                    throw new Error(`Lỗi khi check-out đặt phòng: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log('Kết quả check-out booking:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã check-out và hoàn thành đặt phòng thành công',
                life: 3000
            });

            return result;
        } catch (error) {
            console.error('Lỗi khi check-out đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể check-out đặt phòng',
                life: 3000
            });
            return null;
        }
    };

    // Xóa booking - Chỉ dành cho admin
    const deleteBookingById = async (id) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/admin/bookings/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Không thể xóa đặt phòng (có thể đã thanh toán hoặc check-in)');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy booking');
                } else {
                    throw new Error(`Lỗi khi xóa đặt phòng: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log('Kết quả xóa booking:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: result.message || 'Đã xóa đặt phòng thành công',
                life: 3000
            });

            return result;
        } catch (error) {
            console.error('Lỗi khi xóa đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể xóa đặt phòng',
                life: 3000
            });
            return null;
        }
    };

    // Mở dialog tạo mới
    const openNew = () => {
        booking.value = {
            checkInDate: new Date(),
            checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)),
            status: 'PENDING',
            paymentStatus: 'UNPAID',
            rooms: []
        };
        submitted.value = false;
        bookingDialog.value = true;
    };

    // Đóng dialog
    const hideDialog = () => {
        bookingDialog.value = false;
        submitted.value = false;
        booking.value = {};
    };

    // Lưu booking (tạo mới hoặc cập nhật)
    const saveBooking = async () => {
        submitted.value = true;

        if (validateBooking()) {
            try {
                let result;

                if (booking.value.id) {
                    // Cập nhật
                    result = await updateBooking(booking.value.id, booking.value);
                } else {
                    // Tạo mới
                    result = await createBooking(booking.value);
                }

                if (result) {
                    bookingDialog.value = false;
                    booking.value = {};
                }
            } catch (error) {
                console.error('Lỗi khi lưu booking:', error);
            }
        } else {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Vui lòng điền đầy đủ thông tin bắt buộc',
                life: 3000
            });
        }
    };

    // Validate booking
    const validateBooking = () => {
        return booking.value.checkInDate && booking.value.checkOutDate && booking.value.status;
    };

    // Mở dialog chỉnh sửa
    const editBooking = async (editBooking) => {
        try {
            booking.value = { ...editBooking };

            // Convert string dates to Date objects
            if (typeof booking.value.checkInDate === 'string') {
                booking.value.checkInDate = new Date(booking.value.checkInDate);
            }
            if (typeof booking.value.checkOutDate === 'string') {
                booking.value.checkOutDate = new Date(booking.value.checkOutDate);
            }

            bookingDialog.value = true;

            // Fetch full details if needed
            const fullDetails = await fetchBookingById(editBooking.id);
            if (fullDetails) {
                booking.value = { ...fullDetails };

                // Re-convert dates
                if (typeof booking.value.checkInDate === 'string') {
                    booking.value.checkInDate = new Date(booking.value.checkInDate);
                }
                if (typeof booking.value.checkOutDate === 'string') {
                    booking.value.checkOutDate = new Date(booking.value.checkOutDate);
                }
            }
        } catch (error) {
            console.error('Lỗi khi chỉnh sửa booking:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể chỉnh sửa đặt phòng',
                life: 3000
            });
        }
    };

    // Mở dialog xác nhận xóa
    const confirmDeleteBooking = (deleteBooking) => {
        booking.value = deleteBooking;
        deleteBookingDialog.value = true;
    };

    // Xóa booking (trong thực tế thường là cancel)
    const deleteBooking = async () => {
        try {
            await cancelBooking(booking.value.id);
            deleteBookingDialog.value = false;
            booking.value = {};
        } catch (error) {
            console.error('Lỗi khi xóa booking:', error);
        }
    };

    // Mở dialog xác nhận xóa nhiều
    const confirmDeleteSelected = () => {
        deleteBookingsDialog.value = true;
    };

    // Xóa nhiều booking (trong thực tế thường là cancel)
    const deleteSelectedBookings = async () => {
        try {
            if (!selectedBookings.value || selectedBookings.value.length === 0) {
                return;
            }

            const cancelPromises = selectedBookings.value.map((b) => cancelBooking(b.id));
            await Promise.all(cancelPromises);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: `Đã hủy ${selectedBookings.value.length} đặt phòng`,
                life: 3000
            });

            deleteBookingsDialog.value = false;
            selectedBookings.value = null;
            fetchAllBookings();
        } catch (error) {
            console.error('Lỗi khi hủy nhiều booking:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể hủy các đặt phòng đã chọn',
                life: 3000
            });
        }
    };

    // Format date
    const formatDate = (value) => {
        if (value) {
            try {
                // Handle VnPay date format (YYYYMMDDHHmmss)
                if (typeof value === 'string' && value.length === 14 && !isNaN(value)) {
                    const year = value.substring(0, 4);
                    const month = value.substring(4, 6);
                    const day = value.substring(6, 8);
                    const hour = value.substring(8, 10);
                    const minute = value.substring(10, 12);
                    const second = value.substring(12, 14);

                    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
                }

                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    return value; // Trả về giá trị gốc nếu không phải ngày hợp lệ
                }
                return new Intl.DateTimeFormat('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).format(date);
            } catch (error) {
                console.error('Lỗi khi format ngày:', error);
                return value;
            }
        }
        return '';
    };

    // Format currency
    const formatCurrency = (value) => {
        if (value == null) return '';

        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Get status label
    const getStatusLabel = (statusValue) => {
        const status = statuses.value.find((s) => s.value === statusValue);
        return status ? status.label : statusValue;
    };

    // Get payment status label
    const getPaymentStatusLabel = (statusValue) => {
        // Check if it's VnPay code "00" which means payment successful
        if (statusValue === '00') {
            return 'Thành công';
        }
        const status = paymentStatuses.value.find((s) => s.value === statusValue);
        return status ? status.label : statusValue;
    };

    // Get payment method label
    const getPaymentMethodLabel = (methodValue) => {
        const method = paymentMethods.value.find((m) => m.value === methodValue);
        return method ? method.label : methodValue;
    };

    // Get status severity
    const getStatusSeverity = (status) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'CONFIRMED':
                return 'info';
            case 'CHECKED_IN':
                return 'success';
            case 'COMPLETED':
                return 'success';
            case 'CANCELLED':
                return 'danger';
            default:
                return null;
        }
    };

    // Get payment status severity
    const getPaymentStatusSeverity = (status) => {
        switch (status) {
            case 'PAID':
                return 'success';
            case 'UNPAID':
                return 'warning';
            case 'PROCESSING':
                return 'info';
            case 'REFUNDED':
                return 'info';
            case 'FAILED':
                return 'danger';
            default:
                return null;
        }
    };

    // Sửa hàm updateStats để xử lý dữ liệu đúng
    const updateStats = () => {
        // Đếm trạng thái theo đúng cấu trúc dữ liệu API
        const pendingCount = bookings.value.filter((b) => b.status === 'PENDING').length;
        const confirmedCount = bookings.value.filter((b) => b.status === 'CONFIRMED').length;
        const checkedInCount = bookings.value.filter((b) => b.status === 'CHECKED_IN').length;
        const completedCount = bookings.value.filter((b) => b.status === 'COMPLETED').length;
        const cancelledCount = bookings.value.filter((b) => b.status === 'CANCELLED').length;

        // Tính tổng doanh thu (chỉ tính các đơn đã hoàn thành và đã thanh toán)
        let revenue = 0;

        bookings.value
            .filter((b) => b.status === 'COMPLETED' && b.paymentStatus === 'PAID')
            .forEach((booking) => {
                // Xử lý vấn đề giá trị finalPrice bị âm
                const price = booking.finalPrice;

                // Nếu finalPrice là số âm rất lớn (có thể do lỗi định dạng từ API)
                // hoặc chuyển đổi từ scientific notation, sử dụng totalPrice thay thế
                if (price < 0 || Math.abs(price) > 1e9) {
                    // Nếu có discountValue và discountType, tính lại giá đúng
                    if (booking.discountType === 'PERCENT' && booking.discountValue) {
                        revenue += booking.totalPrice * (1 - booking.discountValue);
                    } else if (booking.discountType === 'FIXED' && booking.discountValue) {
                        revenue += booking.totalPrice - booking.discountValue;
                    } else {
                        revenue += booking.totalPrice;
                    }
                } else {
                    revenue += price;
                }
            });

        // Cập nhật thông tin thống kê
        stats.value = {
            totalBookings: bookings.value.length,
            pendingBookings: pendingCount,
            confirmedBookings: confirmedCount,
            checkedInBookings: checkedInCount,
            completedBookings: completedCount,
            cancelledBookings: cancelledCount,
            totalRevenue: revenue
        };

        console.log('Đã cập nhật thống kê:', stats.value);
    };

    // Lấy phòng trống trong khoảng thời gian
    const getAvailableRooms = async (startDate, endDate) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return [];

            // Định dạng ngày nếu là đối tượng Date
            const start = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
            const end = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;

            // Xác định API endpoint dựa trên role của người dùng
            const isAdmin = localStorage.getItem('admin_role') === 'ADMIN';
            const endpoint = isAdmin
                ? `${API_BASE_URL}/api/v1/bookings/booked-rooms`
                : `${API_BASE_URL}/api/v1/user/bookings/booked-rooms`;

            const response = await fetch(`${endpoint}?startDate=${start}&endDate=${end}`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tìm phòng đã đặt: ${response.statusText}`);
            }

            const bookedRooms = await response.json();
            console.log('Danh sách phòng đã đặt:', bookedRooms);

            // Lấy tất cả phòng
            const allRoomsResponse = await fetch(`${API_BASE_URL}/api/v1/rooms`, {
                headers
            });

            if (!allRoomsResponse.ok) {
                throw new Error(`Lỗi khi lấy danh sách tất cả phòng: ${allRoomsResponse.statusText}`);
            }

            const allRooms = await allRoomsResponse.json();
            console.log('Danh sách tất cả phòng:', allRooms);

            // Lọc các phòng còn trống (không nằm trong danh sách phòng đã đặt)
            const bookedRoomIds = bookedRooms.map(room => room.id || room.roomId);
            const availableRooms = allRooms.filter(room => !bookedRoomIds.includes(room.id));

            return availableRooms;
        } catch (error) {
            console.error('Lỗi khi tìm phòng trống:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể tìm phòng trống. Vui lòng thử lại.',
                life: 3000
            });
            return [];
        }
    };

    // Lấy danh sách booking mới nhất
    const fetchRecentBookings = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return [];

            const response = await fetch(`${API_BASE_URL}/api/v1/admin/bookings/recent`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi lấy danh sách đặt phòng mới nhất: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Danh sách booking mới nhất:', result);

            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đặt phòng mới nhất:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể lấy danh sách đặt phòng mới nhất',
                life: 3000
            });
            return [];
        }
    };

    // Lấy thông tin booking theo ID cho user
    const fetchUserBookingById = async (id) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/user/bookings/${id}`, {
                headers
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Bạn không có quyền xem thông tin booking này');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy booking');
                } else {
                    throw new Error(`Lỗi khi tải thông tin đặt phòng: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log(`Dữ liệu booking có ID ${id} (user):`, result);

            return result;
        } catch (error) {
            console.error('Lỗi khi tải thông tin chi tiết đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải thông tin chi tiết đặt phòng',
                life: 3000
            });
            return null;
        }
    };

    // Lấy danh sách booking của user hiện tại
    const fetchCurrentUserBookings = async () => {
        try {
            loading.value = true;

            const headers = getAuthHeaders();
            if (!headers) {
                loading.value = false;
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/v1/user/bookings/my-bookings`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải danh sách đặt phòng: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Dữ liệu booking của user hiện tại:', result);

            bookings.value = Array.isArray(result) ? result : [];
            totalElements.value = bookings.value.length;
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu đặt phòng của user:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải danh sách đặt phòng của bạn',
                life: 3000
            });
            bookings.value = [];
        } finally {
            loading.value = false;
        }
    };

    // Tạo booking mới cho user và trả về URL thanh toán VNPay
    const createUserBooking = async (bookingData) => {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return null;

            console.log('Tạo booking mới qua user API, dữ liệu gửi đi:', bookingData);

            const response = await fetch(`${API_BASE_URL}/api/v1/user/bookings/create`, {
                method: 'POST',
                headers,
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Dữ liệu không hợp lệ');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy phòng hoặc mã giảm giá');
                } else {
                    throw new Error(`Lỗi khi tạo đặt phòng: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log('Kết quả tạo booking cho user:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã tạo đặt phòng mới thành công, vui lòng thanh toán',
                life: 3000
            });

            // Trả về cả thông tin booking và URL thanh toán
            return result;
        } catch (error) {
            console.error('Lỗi khi tạo đặt phòng mới:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tạo đặt phòng mới',
                life: 3000
            });
            return null;
        }
    };

    // Cập nhật booking cho user
    const updateUserBooking = async (id, bookingData) => {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return null;

            console.log(`Cập nhật booking qua user API với ID ${id}:`, bookingData);

            const response = await fetch(`${API_BASE_URL}/api/v1/user/bookings/update/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Không thể cập nhật (không đúng trạng thái)');
                } else if (response.status === 403) {
                    throw new Error('Bạn không có quyền cập nhật booking này');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy booking');
                } else {
                    throw new Error(`Lỗi khi cập nhật đặt phòng: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log('Kết quả cập nhật booking:', result);

            // Kiểm tra nếu có URL thanh toán mới
            if (result.payment && result.payment.paymentUrl) {
                toast.add({
                    severity: 'info',
                    summary: 'Cập nhật thành công',
                    detail: 'Thông tin đặt phòng đã thay đổi, vui lòng tiến hành thanh toán lại',
                    life: 5000
                });
            } else {
                toast.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã cập nhật đặt phòng thành công',
                    life: 3000
                });
            }

            return result;
        } catch (error) {
            console.error('Lỗi khi cập nhật đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể cập nhật đặt phòng',
                life: 3000
            });
            return null;
        }
    };

    // Hủy booking cho user
    const cancelUserBooking = async (id) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/user/bookings/cancel/${id}`, {
                method: 'POST',
                headers
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Không thể hủy đặt phòng (không đúng trạng thái)');
                } else if (response.status === 403) {
                    throw new Error('Bạn không có quyền hủy booking này');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy booking');
                } else {
                    throw new Error(`Lỗi khi hủy đặt phòng: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log('Kết quả hủy booking:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã hủy đặt phòng thành công',
                life: 3000
            });

            return result;
        } catch (error) {
            console.error('Lỗi khi hủy đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể hủy đặt phòng',
                life: 3000
            });
            return null;
        }
    };

    // Kiểm tra trạng thái thanh toán của booking
    const checkBookingPaymentStatus = async (id) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/user/bookings/payment-status/${id}`, {
                headers
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Bạn không có quyền xem trạng thái thanh toán này');
                } else if (response.status === 404) {
                    throw new Error('Không tìm thấy booking');
                } else {
                    throw new Error(`Lỗi khi kiểm tra trạng thái thanh toán: ${response.statusText} (${response.status})`);
                }
            }

            const result = await response.json();
            console.log(`Thông tin thanh toán của booking ID ${id}:`, result);

            return result;
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể kiểm tra trạng thái thanh toán',
                life: 3000
            });
            return null;
        }
    };

    // Tạo đường dẫn đến trang thanh toán VNPay từ response API
    const redirectToVnPayPayment = (paymentInfo) => {
        if (paymentInfo && paymentInfo.payment && paymentInfo.payment.paymentUrl) {
            // Mở URL thanh toán trong cửa sổ mới
            window.open(paymentInfo.payment.paymentUrl, '_blank');
            return true;
        }
        return false;
    };

    return {
        bookings,
        loading,
        bookingDialog,
        deleteBookingDialog,
        deleteBookingsDialog,
        booking,
        selectedBookings,
        filters,
        submitted,
        totalElements,
        pageSize,
        stats,
        statuses,
        paymentStatuses,
        paymentMethods,
        fetchAllBookings,
        fetchUserBookings,
        fetchBookingsByStatus,
        fetchBookingsByDateRange,
        fetchBookingById,
        createBooking,
        updateBooking,
        cancelBooking,
        confirmBooking,
        checkInBooking,
        checkOutBooking,
        deleteBookingById,
        fetchRecentBookings,
        fetchUserBookingById,
        fetchCurrentUserBookings,
        createUserBooking,
        updateUserBooking,
        cancelUserBooking,
        checkBookingPaymentStatus,
        redirectToVnPayPayment,
        openNew,
        hideDialog,
        saveBooking,
        editBooking,
        confirmDeleteBooking,
        deleteBooking,
        confirmDeleteSelected,
        deleteSelectedBookings,
        formatDate,
        formatCurrency,
        getStatusLabel,
        getPaymentStatusLabel,
        getPaymentMethodLabel,
        getStatusSeverity,
        getPaymentStatusSeverity,
        getAvailableRooms
    };
}
