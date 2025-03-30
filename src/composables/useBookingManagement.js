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
        { label: 'Đã check-out', value: 'CHECKED_OUT' },
        { label: 'Đã hủy', value: 'CANCELLED' }
    ]);

    // Trạng thái thanh toán
    const paymentStatuses = ref([
        { label: 'Chưa thanh toán', value: 'UNPAID' },
        { label: 'Đã thanh toán', value: 'PAID' },
        { label: 'Đã hoàn tiền', value: 'REFUNDED' }
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
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu đặt phòng');
            }

            const data = await response.json();
            console.log('Dữ liệu nhận được từ API:', data);

            // Đảm bảo gán dữ liệu vào reactive ref bookings
            bookings.value = data || [];

            // Thêm log để kiểm tra sau khi gán
            console.log('Sau khi gán:', bookings.value);

            // Cập nhật thống kê với hàm mới
            updateStats();
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu đặt phòng:', error);
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu đặt phòng', life: 3000 });
            // Đặt bookings thành mảng rỗng khi có lỗi
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
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải danh sách đặt phòng của người dùng: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Dữ liệu booking của người dùng:', result);

            // API trả về mảng trực tiếp
            if (Array.isArray(result)) {
                bookings.value = result;
            } else if (result.data) {
                bookings.value = Array.isArray(result.data) ? result.data : [];
            } else {
                bookings.value = [];
            }

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

            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/status/${status}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải danh sách đặt phòng theo trạng thái: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Dữ liệu booking theo trạng thái:', result);

            // API trả về mảng trực tiếp
            if (Array.isArray(result)) {
                bookings.value = result;
            } else if (result.data) {
                bookings.value = Array.isArray(result.data) ? result.data : [];
            } else {
                bookings.value = [];
            }

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

            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/date-range?startDate=${startDate}&endDate=${endDate}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải danh sách đặt phòng theo thời gian: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Dữ liệu booking theo khoảng thời gian:', result);

            // API trả về mảng trực tiếp
            if (Array.isArray(result)) {
                bookings.value = result;
            } else if (result.data) {
                bookings.value = Array.isArray(result.data) ? result.data : [];
            } else {
                bookings.value = [];
            }

            totalElements.value = bookings.value.length;
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu đặt phòng theo thời gian:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải danh sách đặt phòng theo thời gian',
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

            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${id}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải thông tin đặt phòng: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Thông tin chi tiết booking:', result);

            // API trả về object trực tiếp
            if (result.data) {
                return result.data;
            } else {
                return result;
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải thông tin đặt phòng',
                life: 3000
            });
            return null;
        }
    };

    // Tạo mới booking
    const createBooking = async (bookingData) => {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/create`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Server response:', errorData);
                throw new Error(`Lỗi khi tạo đặt phòng: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Booking đã được tạo:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Tạo đặt phòng mới thành công',
                life: 3000
            });

            // Reload data
            fetchAllBookings();

            // API trả về booking đã tạo
            if (result.data) {
                return result.data;
            } else {
                return result;
            }
        } catch (error) {
            console.error('Lỗi khi tạo đặt phòng:', error);
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

            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/update/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Server response:', errorData);
                throw new Error(`Lỗi khi cập nhật đặt phòng: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Booking đã được cập nhật:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Cập nhật đặt phòng thành công',
                life: 3000
            });

            // Reload data
            fetchAllBookings();

            // API trả về booking đã cập nhật
            if (result.data) {
                return result.data;
            } else {
                return result;
            }
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

            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/cancel/${id}`, {
                method: 'POST',
                headers: headers
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Server response:', errorData);
                throw new Error(`Lỗi khi hủy đặt phòng: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Booking đã được hủy:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Hủy đặt phòng thành công',
                life: 3000
            });

            // Reload data
            fetchAllBookings();

            // API trả về booking đã hủy
            if (result.data) {
                return result.data;
            } else {
                return result;
            }
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

            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/confirm/${id}`, {
                method: 'POST',
                headers: headers
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Server response:', errorData);
                throw new Error(`Lỗi khi xác nhận đặt phòng: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Booking đã được xác nhận:', result);

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Xác nhận đặt phòng thành công',
                life: 3000
            });

            // Reload data
            fetchAllBookings();

            // API trả về booking đã xác nhận
            if (result.data) {
                return result.data;
            } else {
                return result;
            }
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
            case 'CHECKED_OUT':
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
            case 'REFUNDED':
                return 'info';
            default:
                return null;
        }
    };

    // Sửa hàm updateStats để xử lý dữ liệu đúng
    const updateStats = () => {
        // Đếm trạng thái theo đúng cấu trúc dữ liệu API
        const pendingCount = bookings.value.filter(b => b.status === 'PENDING').length;
        const confirmedCount = bookings.value.filter(b => b.status === 'CONFIRMED').length;
        const checkedInCount = bookings.value.filter(b => b.status === 'CHECKED_IN').length;
        const checkedOutCount = bookings.value.filter(b => b.status === 'CHECKED_OUT').length;
        const cancelledCount = bookings.value.filter(b => b.status === 'CANCELLED').length;

        // Tính tổng doanh thu (chỉ tính các đơn đã check-out và đã thanh toán)
        let revenue = 0;

        bookings.value
            .filter(b => b.status === 'CHECKED_OUT' && b.paymentStatus === 'PAID')
            .forEach(booking => {
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
            checkedOutBookings: checkedOutCount,
            cancelledBookings: cancelledCount,
            totalRevenue: revenue
        };

        console.log("Đã cập nhật thống kê:", stats.value);
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
        getPaymentStatusSeverity
    };
}
