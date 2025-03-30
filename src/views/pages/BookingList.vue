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

// Lưu đơn đặt
const saveBooking = () => {
    submitted.value = true;

    if (booking.value.fullName?.trim() && booking.value.roomId) {
        // Tìm thông tin phòng
        const selectedRoom = availableRooms.value.find((r) => r.id === booking.value.roomId);
        const selectedRoomType = roomTypes.value.find((t) => t.id === selectedRoom?.roomTypeId);

        if (booking.value.id) {
            // Cập nhật đơn đặt hiện có
            const index = findIndexById(booking.value.id);
            bookings.value[index] = {
                ...booking.value,
                roomNumber: selectedRoom?.roomNumber,
                roomType: selectedRoomType?.name
            };
        } else {
            // Tạo đơn đặt mới
            booking.value.id = 'B' + String(bookings.value.length + 1).padStart(3, '0');
            booking.value.createdAt = new Date().toISOString().split('T')[0];
            booking.value.roomNumber = selectedRoom?.roomNumber;
            booking.value.roomType = selectedRoomType?.name;
            bookings.value.push(booking.value);
        }

        bookingDialog.value = false;
        booking.value = {};
    }
};

// Chỉnh sửa đơn đặt
const editBooking = (editBooking) => {
    // Tìm ID phòng dựa trên số phòng
    const room = availableRooms.value.find((r) => r.roomNumber === editBooking.roomNumber);

    booking.value = {
        ...editBooking,
        // Đảm bảo các trường được chuyển đổi đúng
        roomId: room?.id || null,
        checkInDate: new Date(editBooking.checkInDate),
        checkOutDate: new Date(editBooking.checkOutDate),
        additionalServices: editBooking.additionalServices || []
    };

    bookingDialog.value = true;
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
const deleteBooking = () => {
    bookings.value = bookings.value.filter((val) => val.id !== booking.value.id);
    deleteBookingDialog.value = false;
    booking.value = {};
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
