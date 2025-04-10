<script setup>
import { useBookingManagement } from '@/composables/useBookingManagement';
import { useExportData } from '@/composables/useExportData';
import { usePermissions } from '@/composables/usePermissions';
import { FilterMatchMode } from '@/utils/primeUtils';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// Import các component PrimeVue
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

// Import các component tách
import BookingDeleteDialog from '@/components/booking/BookingDeleteDialog.vue';
import BookingDetailsDialog from '@/components/booking/BookingDetailsDialog.vue';
import BookingEditDialog from '@/components/booking/BookingEditDialog.vue';
import BookingFilters from '@/components/booking/BookingFilters.vue';
import BookingManagementTable from '@/components/booking/BookingManagementTable.vue';
import BookingStats from '@/components/booking/BookingStats.vue';

// Lấy phân quyền
const { can } = usePermissions();

// Lấy các hàm và biến từ composable
const {
    bookings,
    loading,
    stats,
    fetchAllBookings,
    fetchBookingsByStatus,
    fetchBookingsByDateRange,
    fetchBookingById,
    fetchUserBookings,
    createBooking,
    updateBooking,
    formatCurrency,
    formatDate,
    getStatusLabel,
    getStatusSeverity,
    statuses,
    paymentStatuses,
    paymentMethods,
    getPaymentStatusLabel,
    getPaymentMethodLabel,
    getPaymentStatusSeverity,
    cancelBooking,
    confirmBooking,
    checkInBooking,
    checkOutBooking,
    deleteBookingById,
    updateStats
} = useBookingManagement();

// Thêm hàm để xử lý xuất dữ liệu
const { isExporting, exportToCSV } = useExportData();

// Đảm bảo có khai báo toast
const toast = useToast();

// Khai báo biến
const availableRooms = ref([]);
const bookingDialog = ref(false);
const bookingDetailsDialog = ref(false);
const deleteBookingDialog = ref(false);
const deleteBookingsDialog = ref(false);
const booking = ref({});
const selectedBooking = ref(null);
const selectedBookings = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const dateRange = ref({ start: null, end: null });
const selectedStatus = ref(null);
const userId = ref(null);

// Tạo một đối tượng hiển thị các cột dựa vào quyền
const displayColumns = computed(() => ({
    selection: can.delete.value, // Hiển thị cột chọn nếu có quyền xóa
    actions: can.edit.value || can.confirm.value || can.cancel.value // Hiển thị cột hành động nếu có quyền chỉnh sửa, xác nhận hoặc hủy
}));

// Thêm các biến cần thiết cho dialog
const roomTypes = ref([
    { id: 1, name: 'Phòng đơn' },
    { id: 2, name: 'Phòng đôi' },
    { id: 3, name: 'Phòng VIP' }
]);

// Gọi API khi component được mount
onMounted(async () => {
    console.log('BookingList mounted - Fetching data');
    await fetchAllBookings();

    // Đảm bảo chạy updateStats sau khi có dữ liệu
    if (bookings.value && bookings.value.length > 0) {
        console.log('Bookings loaded, updating stats...');
        updateStats();
    }

    // Thêm timeout nếu cần để đảm bảo thống kê được cập nhật
    setTimeout(() => {
        console.log('Current stats after timeout:', stats.value);
        // Nếu vẫn chưa có thống kê, chạy lại updateStats
        if (!stats.value.totalBookings && bookings.value.length > 0) {
            console.log('Stats not updated, running updateStats again');
            updateStats();
        }
    }, 500);
});

// Mở dialog thêm mới
const openNew = () => {
    booking.value = {
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: 'CASH',
        adults: 1,
        children: 0,
        fullName: '',
        phone: '',
        roomId: null,
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 86400000),
        totalPrice: 0,
        finalPrice: 0,
        additionalServices: [],
        specialRequests: ''
    };
    submitted.value = false;
    bookingDialog.value = true;
};

// Ẩn dialog
const hideDialog = () => {
    bookingDialog.value = false;
    submitted.value = false;
};

// Xử lý lưu đơn đặt
const saveBooking = async () => {
    submitted.value = true;

    if (booking.value.fullName?.trim()) {
        try {
            // Đảm bảo các trường bắt buộc đều có theo mẫu JSON
            if (!booking.value.userId) {
                try {
                    const userData = localStorage.getItem('admin_user');
                    if (userData) {
                        const user = JSON.parse(userData);
                        booking.value.userId = user.id || 0;
                    } else {
                        booking.value.userId = 0;
                    }
                } catch (e) {
                    booking.value.userId = 0;
                }
            }

            // Đảm bảo có roomIds theo mẫu yêu cầu
            if (!booking.value.roomIds && booking.value.rooms) {
                booking.value.roomIds = booking.value.rooms.map(room => room.roomId || room.id);
            }

            // Đảm bảo các trường bắt buộc khác có giá trị mặc định
            if (!booking.value.status) booking.value.status = 'PENDING';
            if (!booking.value.paymentStatus) booking.value.paymentStatus = 'UNPAID';
            if (!booking.value.paymentMethod) booking.value.paymentMethod = 'CASH';
            if (!booking.value.adults) booking.value.adults = 1;
            if (!booking.value.children) booking.value.children = 0;

            const bookingData = {
                ...booking.value,
                // Định dạng các trường ngày tháng
                checkInDate: booking.value.checkInDate instanceof Date ?
                        booking.value.checkInDate.toISOString().split('T')[0] : booking.value.checkInDate,
                checkOutDate: booking.value.checkOutDate instanceof Date ?
                        booking.value.checkOutDate.toISOString().split('T')[0] : booking.value.checkOutDate,
                paymentDate: booking.value.paymentDate instanceof Date ?
                        booking.value.paymentDate.toISOString().split('T')[0] : booking.value.paymentDate
            };

            // Tạo mới hoặc cập nhật đơn đặt qua API
            let result;
            if (booking.value.id) {
                // Cập nhật đơn đặt hiện có
                result = await updateBooking(booking.value.id, bookingData);
        } else {
            // Tạo đơn đặt mới
                result = await createBooking(bookingData);
            }

            if (result) {
                toast.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: booking.value.id ? 'Cập nhật đơn đặt thành công' : 'Tạo đơn đặt mới thành công',
                    life: 3000
                });
                // Làm mới dữ liệu
                await fetchAllBookings();
        bookingDialog.value = false;
        booking.value = {};
            }
        } catch (error) {
            console.error('Lỗi khi lưu đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Có lỗi xảy ra khi lưu đặt phòng. Vui lòng thử lại sau.',
                life: 3000
            });
        }
    } else {
        toast.add({
            severity: 'warn',
            summary: 'Thiếu thông tin',
            detail: 'Vui lòng điền đầy đủ thông tin bắt buộc.',
            life: 3000
        });
    }
};

// Chỉnh sửa đơn đặt
const editBooking = async (editBooking) => {
    try {
        // Tải thông tin chi tiết về đơn đặt từ API
        const fullDetails = await fetchBookingById(editBooking.id);

        if (fullDetails) {
            // Sử dụng thông tin chi tiết đầy đủ từ API
            booking.value = { ...fullDetails };

            // Chuyển đổi các chuỗi ngày thành đối tượng Date
            if (typeof booking.value.checkInDate === 'string') {
                booking.value.checkInDate = new Date(booking.value.checkInDate);
            }
            if (typeof booking.value.checkOutDate === 'string') {
                booking.value.checkOutDate = new Date(booking.value.checkOutDate);
            }
            if (typeof booking.value.paymentDate === 'string' && booking.value.paymentDate) {
                booking.value.paymentDate = new Date(booking.value.paymentDate);
            }

            bookingDialog.value = true;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể tải thông tin chi tiết đơn đặt.',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Lỗi khi chỉnh sửa đơn đặt:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Có lỗi xảy ra khi tải thông tin đơn đặt.',
            life: 3000
        });
    }
};

// Mở dialog xem chi tiết
const viewBookingDetails = async (data) => {
    try {
        selectedBooking.value = data;
        bookingDetailsDialog.value = true;

        const fullDetails = await fetchBookingById(data.id);
        if (fullDetails) {
            selectedBooking.value = fullDetails;
        }
    } catch (error) {
        console.error('Lỗi khi tải chi tiết đơn đặt:', error);
    }
};

// Mở dialog xác nhận xóa
const confirmDeleteBooking = (editBooking) => {
    if (can.delete.value) {
    booking.value = editBooking;
    deleteBookingDialog.value = true;
    }
};

// Xóa đơn đặt
const deleteBooking = async () => {
    try {
        await deleteBookingById(booking.value.id);
        deleteBookingDialog.value = false;
        booking.value = {};
        fetchAllBookings(); // Refresh data
    } catch (error) {
        console.error('Lỗi khi xóa booking:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Có lỗi xảy ra khi xóa đặt phòng',
            life: 3000
        });
    }
};

// Mở dialog xác nhận xóa nhiều
const confirmDeleteSelected = () => {
    if (can.delete.value && selectedBookings.value?.length) {
    deleteBookingsDialog.value = true;
    }
};

// Xóa nhiều đơn đặt
const deleteSelectedBookings = () => {
    bookings.value = bookings.value.filter((val) => !selectedBookings.value.includes(val));
    deleteBookingsDialog.value = false;
    selectedBookings.value = [];
};

// Tìm index theo ID
const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < bookings.value.length; i++) {
        if (bookings.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

// Hàm xác nhận booking
const handleConfirmBooking = async (data) => {
    if (can.confirm.value) {
        try {
            await confirmBooking(data.id);
            fetchAllBookings(); // Refresh data
        } catch (error) {
            console.error('Lỗi khi xác nhận booking:', error);
        }
    }
};

// Hàm hủy booking
const handleCancelBooking = async (data) => {
    if (can.cancel.value) {
        try {
            await cancelBooking(data.id);
            fetchAllBookings(); // Refresh data
        } catch (error) {
            console.error('Lỗi khi hủy booking:', error);
        }
    }
};

// Hàm lọc theo khoảng thời gian
const filterByDateRange = () => {
    if (dateRange.value.start && dateRange.value.end) {
        const startDateStr = dateRange.value.start.toISOString().split('T')[0];
        const endDateStr = dateRange.value.end.toISOString().split('T')[0];
        fetchBookingsByDateRange(startDateStr, endDateStr);
    }
};

// Hàm lọc theo trạng thái
const filterByStatus = () => {
    if (selectedStatus.value) {
        fetchBookingsByStatus(selectedStatus.value);
    } else {
        fetchAllBookings();
    }
};

// Hàm lọc theo người dùng
const filterByUser = () => {
    if (userId.value) {
        fetchUserBookings(userId.value);
    } else {
        fetchAllBookings();
    }
};

// Hàm reset bộ lọc
const resetFilters = () => {
    dateRange.value = { start: null, end: null };
    selectedStatus.value = null;
    userId.value = null;
    fetchAllBookings();
};

// Thêm hàm để xử lý xuất dữ liệu
const handleExport = () => {
    if (bookings.value && bookings.value.length > 0) {
        // Chuẩn bị dữ liệu cho xuất
        const exportData = bookings.value.map((booking) => ({
            'Mã đơn': booking.id,
            'Khách hàng': booking.fullName || 'Không có thông tin',
            'Điện thoại': booking.phone || '',
            Phòng: booking.rooms ? booking.rooms.map((r) => r.roomNumber).join(', ') : '',
            'Loại phòng': booking.rooms ? booking.rooms.map((r) => r.roomType).join(', ') : '',
            'Ngày nhận': formatDate(booking.checkInDate),
            'Ngày trả': formatDate(booking.checkOutDate),
            'Trạng thái': getStatusLabel(booking.status),
            'Tổng tiền': formatCurrency(booking.totalPrice).replace(/\s/g, ''), // Sử dụng totalPrice thay vì finalPrice
            'Thanh toán': getPaymentStatusLabel(booking.paymentStatus),
            'Phương thức': getPaymentMethodLabel(booking.paymentMethod),
            'Ngày tạo': formatDate(booking.createdAt)
        }));

        exportToCSV(exportData, `danh-sach-dat-phong-${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
        toast.add({
            severity: 'warn',
            summary: 'Không có dữ liệu',
            detail: 'Không có dữ liệu để xuất.',
            life: 3000
        });
    }
};

// Hàm xử lý check-in booking
const handleCheckInBooking = async (data) => {
    if (can.checkIn?.value) {
        try {
            await checkInBooking(data.id);
            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã check-in đặt phòng thành công',
                life: 3000
            });
            fetchAllBookings(); // Refresh data
        } catch (error) {
            console.error('Lỗi khi check-in booking:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Có lỗi xảy ra khi check-in đặt phòng',
                life: 3000
            });
        }
    }
};

// Hàm xử lý check-out booking
const handleCheckOutBooking = async (data) => {
    if (can.checkOut?.value) {
        try {
            await checkOutBooking(data.id);
            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã check-out đặt phòng thành công',
                life: 3000
            });
            fetchAllBookings(); // Refresh data
        } catch (error) {
            console.error('Lỗi khi check-out booking:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Có lỗi xảy ra khi check-out đặt phòng',
                life: 3000
            });
        }
    }
};
</script>

<template>
    <div class="booking-container">
        <Toast />
        <ConfirmDialog />
        <!-- Tiêu đề trang -->
        <div class="page-header flex align-items-center justify-content-between mb-3">
            <h1 class="text-xl font-bold m-0">Quản lý đặt phòng</h1>
        </div>

        <!-- Dashboard thống kê -->
        <BookingStats :stats="stats" :formatCurrency="formatCurrency" />

        <!-- Bộ lọc + Nút chức năng + Tìm kiếm -->
        <BookingFilters
            :statuses="statuses"
            v-model:dateRange="dateRange"
            v-model:selectedStatus="selectedStatus"
            :globalFilter="filters.global"
            @update:globalFilter="(val) => (filters.global = val)"
            @filter-by-date-range="filterByDateRange"
            @filter-by-status="filterByStatus"
            @reset-filters="resetFilters"
            @add-new="openNew"
            @delete-selected="confirmDeleteSelected"
            @export-data="handleExport"
        />

        <!-- Bảng quản lý đặt phòng -->
        <BookingManagementTable
            :bookings="bookings"
            :loading="loading"
            :filters="filters"
            :selectedBookings="selectedBookings"
            @update:selectedBookings="selectedBookings = $event"
            :formatDate="formatDate"
            :formatCurrency="formatCurrency"
            :getStatusLabel="getStatusLabel"
            :getStatusSeverity="getStatusSeverity"
            :getPaymentStatusLabel="getPaymentStatusLabel"
            :getPaymentMethodLabel="getPaymentMethodLabel"
            :getPaymentStatusSeverity="getPaymentStatusSeverity"
            :can="can"
            :displayColumns="displayColumns"
            @view-details="viewBookingDetails"
            @edit="editBooking"
            @confirm="handleConfirmBooking"
            @cancel="handleCancelBooking"
            @delete="confirmDeleteBooking"
            @check-in="handleCheckInBooking"
            @check-out="handleCheckOutBooking"
        />

        <!-- Dialog chỉnh sửa booking -->
        <BookingEditDialog
            v-model:visible="bookingDialog"
            :bookingData="booking"
            :submitted="submitted"
            :statuses="statuses"
            :paymentStatuses="paymentStatuses"
            :paymentMethods="paymentMethods"
            @save="saveBooking"
            @hideDialog="hideDialog"
            @update:bookingData="(val) => (booking = val)"
        />

        <BookingDetailsDialog
            v-model:visible="bookingDetailsDialog"
            :booking="selectedBooking"
            :formatDate="formatDate"
            :formatCurrency="formatCurrency"
            :getStatusLabel="getStatusLabel"
            :getStatusSeverity="getStatusSeverity"
            :getPaymentMethodLabel="getPaymentMethodLabel"
            :getPaymentStatusLabel="getPaymentStatusLabel"
            :getPaymentStatusSeverity="getPaymentStatusSeverity"
        />

        <BookingDeleteDialog v-model:visible="deleteBookingDialog" :booking="selectedBooking" :multiple="false" @confirm="deleteBooking" />

        <BookingDeleteDialog v-model:visible="deleteBookingsDialog" :multiple="true" :selectedCount="selectedBookings ? selectedBookings.length : 0" @confirm="deleteSelectedBookings" />
    </div>
</template>

<style scoped>
.booking-container {
    background: var(--surface-card);
    border-radius: 8px;
    margin-bottom: 1rem;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.page-header {
    border-bottom: 1px solid var(--surface-border);
    padding-bottom: 0.75rem;
}

/* Fix ô tìm kiếm */
.search-field {
    position: relative;
    display: inline-flex;
    min-width: 250px;
}

.search-field :deep(i) {
    position: absolute;
    left: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color-secondary);
    z-index: 1;
}

.search-field :deep(.p-inputtext) {
    padding-left: 2rem;
    width: 100%;
}

/* Responsive */
@media screen and (max-width: 768px) {
    .booking-container {
        padding: 0.75rem;
    }

    .search-field {
        min-width: 100%;
        margin-top: 0.5rem;
    }
}
</style>
