import { useBookingManagement } from '@/composables/useBookingManagement';
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, reactive, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import BookingEditDialog from '@/components/booking/BookingEditDialog.vue';
import Toolbar from 'primevue/toolbar';
import { useAuthStore } from '@/stores/auth';
import Textarea from 'primevue/textarea';
import MultiSelect from 'primevue/multiselect';

// Gọi các composable và khởi tạo biến
const {
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
    fetchAvailableServices,
    fetchDiscount,
    updateStats
} = useBookingManagement();

const confirm = useConfirm();
const toast = useToast();
const authStore = useAuthStore();

// Biến local để lưu trữ dữ liệu và trạng thái
const bookings = ref([]);
const booking = ref({
    customer: {
        name: '',
        email: '',
        phone: '',
        idNo: '',
    },
    checkInDate: new Date(),
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    rooms: [{ roomId: null, serviceIds: [], adults: 1, children: 0 }],
    discountId: null,
    discountCode: '',
    paymentMethod: 'CASH',
    paymentStatus: 'UNPAID',
    status: 'CONFIRMED',
    adminNote: '',
    additionalServices: [],
});
const bookingEditDialog = ref(false);
const editingBooking = ref({});
const submitted = ref(false);
const loading = ref(false);
const deleteBookingDialog = ref(false);
const availableRooms = ref([]);
const availableServices = ref([]);

// Khai báo các hằng số
const statuses = [
    { label: 'Chờ xác nhận', value: 'PENDING' },
    { label: 'Đã xác nhận', value: 'CONFIRMED' },
    { label: 'Đã nhận phòng', value: 'CHECKED_IN' },
    { label: 'Đã trả phòng', value: 'CHECKED_OUT' },
    { label: 'Hủy bỏ', value: 'CANCELLED' }
];

const paymentStatuses = [
    { label: 'Chưa thanh toán', value: 'UNPAID' },
    { label: 'Đã thanh toán', value: 'PAID' },
    { label: 'Hoàn tiền', value: 'REFUNDED' },
    { label: 'Thanh toán một phần', value: 'PARTIALLY_PAID' }
];

const paymentMethods = [
    { label: 'Tiền mặt', value: 'CASH' },
    { label: 'Thẻ tín dụng', value: 'CREDIT_CARD' },
    { label: 'VnPay', value: 'VNPAY' },
    { label: 'Chuyển khoản', value: 'BANK_TRANSFER' }
];

// Các bộ lọc
const filters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'fullName': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'phone': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'email': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'status': { value: null, matchMode: FilterMatchMode.EQUALS },
    'paymentStatus': { value: null, matchMode: FilterMatchMode.EQUALS }
});

// Hàm mở dialog tạo đặt phòng mới
const openNew = async () => {
    submitted.value = false;
    bookingEditDialog.value = true;

    // Tải danh sách phòng và dịch vụ nếu cần
    if (availableRooms.value.length === 0) {
        try {
            const roomData = await fetchAllRooms();
            if (roomData) {
                availableRooms.value = roomData;
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách phòng:', error);
        }
    }

    if (availableServices.value.length === 0) {
        try {
            const serviceData = await fetchAvailableServices();
            if (serviceData) {
                availableServices.value = serviceData;
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách dịch vụ:', error);
        }
    }

    // Khởi tạo đặt phòng mới với giá trị mặc định
    editingBooking.value = {
        userId: 0, // Sẽ được cập nhật từ thông tin người dùng hiện tại
        rooms: [{
            roomId: null,
            serviceIds: [],
            adults: 1,
            children: 0
        }],
        checkInDate: new Date(),
        checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        totalPrice: 0,
        finalPrice: 0,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: 'CASH',
        additionalServices: [],
        specialRequests: '',
        adminNote: ''
    };
};

// Hàm ẩn dialog tạo/chỉnh sửa đặt phòng
const hideDialog = () => {
    bookingEditDialog.value = false;
    submitted.value = false;
};

// Hàm lưu đặt phòng (tạo mới hoặc cập nhật)
const saveBooking = async () => {
    submitted.value = true;

    try {
        loading.value = true;

        // Kiểm tra các trường bắt buộc
        if (!editingBooking.value.checkInDate || !editingBooking.value.checkOutDate) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng điền đầy đủ thông tin bắt buộc', life: 3000 });
            loading.value = false;
            return;
        }

        // Kiểm tra rooms
        if (!editingBooking.value.rooms || !editingBooking.value.rooms.length ||
            !editingBooking.value.rooms.some(room => room.roomId)) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng chọn ít nhất một phòng', life: 3000 });
            loading.value = false;
            return;
        }

        // Nếu có mã giảm giá nhưng chưa có discountId, thực hiện kiểm tra mã
        if (editingBooking.value.discountCode && !editingBooking.value.discountId) {
            try {
                const discountData = await fetchDiscount(editingBooking.value.discountCode);
                if (discountData) {
                    editingBooking.value.discountId = discountData.id;
                }
            } catch (error) {
                console.warn('Không thể xác minh mã giảm giá:', error);
            }
        }

        if (editingBooking.value.id) {
            // Cập nhật đặt phòng hiện có
            await updateBooking(editingBooking.value);
            toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật đặt phòng thành công', life: 3000 });
        } else {
            // Tạo đặt phòng mới
            const result = await createBooking(editingBooking.value, true); // true để sử dụng admin-create API

            if (result) {
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Tạo đặt phòng thành công', life: 3000 });
            } else {
                throw new Error('Không thể tạo đặt phòng');
            }
        }

        // Tải lại danh sách đặt phòng
        loadBookings();

        // Đóng dialog
        bookingEditDialog.value = false;
        editingBooking.value = {};
    } catch (error) {
        console.error('Lỗi khi lưu đặt phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi lưu đặt phòng', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Hàm mở dialog chỉnh sửa đặt phòng
const editBooking = (bookingData) => {
    editingBooking.value = { ...bookingData };

    // Đảm bảo định dạng ngày tháng đúng
    if (editingBooking.value.checkInDate && typeof editingBooking.value.checkInDate === 'string') {
        editingBooking.value.checkInDate = new Date(editingBooking.value.checkInDate);
    }

    if (editingBooking.value.checkOutDate && typeof editingBooking.value.checkOutDate === 'string') {
        editingBooking.value.checkOutDate = new Date(editingBooking.value.checkOutDate);
    }

    if (editingBooking.value.paymentDate && typeof editingBooking.value.paymentDate === 'string') {
        editingBooking.value.paymentDate = new Date(editingBooking.value.paymentDate);
    }

    // Chuyển đổi cấu trúc dữ liệu nếu cần
    if (!editingBooking.value.rooms) {
        editingBooking.value.rooms = [{
            roomId: editingBooking.value.roomId,
            serviceIds: editingBooking.value.serviceIds || [],
            adults: editingBooking.value.adults || 1,
            children: editingBooking.value.children || 0
        }];
    }

    bookingEditDialog.value = true;
};

// Hàm xác nhận hủy đặt phòng
const confirmCancelBooking = (bookingData) => {
    booking.value = bookingData;

    confirm.require({
        message: 'Bạn có chắc chắn muốn hủy đặt phòng này?',
        header: 'Xác nhận hủy đặt phòng',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Hủy đặt phòng',
        rejectLabel: 'Không',
        accept: () => {
            cancelBookingAction();
        }
    });
};

// Hàm thực hiện hủy đặt phòng
const cancelBookingAction = async () => {
    try {
        loading.value = true;
        await cancelBooking(booking.value.id);

        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã hủy đặt phòng', life: 3000 });
        loadBookings();
    } catch (error) {
        console.error('Lỗi khi hủy đặt phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi hủy đặt phòng', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Hàm xác nhận đặt phòng
const confirmBookingAction = async (bookingData) => {
    try {
        loading.value = true;
        await confirmBooking(bookingData.id);

        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xác nhận đặt phòng', life: 3000 });
        loadBookings();
    } catch (error) {
        console.error('Lỗi khi xác nhận đặt phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi xác nhận đặt phòng', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Hàm đánh dấu đã thanh toán
const markBookingAsPaid = async (bookingData) => {
    try {
        loading.value = true;
        await markAsPaid(bookingData.id);

        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã đánh dấu thanh toán', life: 3000 });
        loadBookings();
    } catch (error) {
        console.error('Lỗi khi đánh dấu thanh toán:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi đánh dấu thanh toán', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Hàm đánh dấu đã nhận phòng
const markBookingAsCheckedIn = async (bookingData) => {
    try {
        loading.value = true;
        await markAsCheckedIn(bookingData.id);

        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã đánh dấu nhận phòng', life: 3000 });
        loadBookings();
    } catch (error) {
        console.error('Lỗi khi đánh dấu nhận phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi đánh dấu nhận phòng', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Hàm đánh dấu đã trả phòng
const markBookingAsCheckedOut = async (bookingData) => {
    try {
        loading.value = true;
        await markAsCheckedOut(bookingData.id);

        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã đánh dấu trả phòng', life: 3000 });
        loadBookings();
    } catch (error) {
        console.error('Lỗi khi đánh dấu trả phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi đánh dấu trả phòng', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Hàm tải danh sách đặt phòng
const loadBookings = async () => {
    try {
        loading.value = true;
        const data = await getAllBookings();
        bookings.value = data;
    } catch (error) {
        console.error('Lỗi khi tải danh sách đặt phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách đặt phòng', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Hàm định dạng ngày tháng
const formatDate = (date) => {
    if (!date) return '';

    if (typeof date === 'string') {
        // Xử lý chuỗi ISO
        const d = new Date(date);
        return isNaN(d.getTime()) ? date : d.toLocaleDateString('vi-VN');
    } else if (date instanceof Date) {
        return date.toLocaleDateString('vi-VN');
    }

    return date;
};

// Hàm lấy nhãn trạng thái từ giá trị
const getStatusLabel = (value, options) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
};

// Hàm lấy màu sắc cho tag trạng thái
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
            return 'secondary';
    }
};

// Hàm lấy màu sắc cho tag trạng thái thanh toán
const getPaymentStatusSeverity = (status) => {
    switch (status) {
        case 'PAID':
            return 'success';
        case 'UNPAID':
            return 'warning';
        case 'REFUNDED':
            return 'info';
        case 'PARTIALLY_PAID':
            return 'warning';
        default:
            return 'secondary';
    }
};

// Hàm định dạng giá tiền
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Tạo danh sách phòng từ mảng rooms
const formatRooms = (rooms) => {
    if (!rooms || !Array.isArray(rooms)) return '';

    return rooms.map(room => {
        const roomNumber = availableRooms.value.find(r => r.id === room.roomId)?.roomNumber || room.roomId;
        return `${roomNumber} (${room.adults} người lớn, ${room.children} trẻ em)`;
    }).join(', ');
};

// Tải dữ liệu ban đầu
onMounted(async () => {
    loadBookings();

    // Tải danh sách phòng và dịch vụ
    try {
        const roomData = await fetchAllRooms();
        if (roomData) {
            availableRooms.value = roomData;
        }

        const serviceData = await fetchAvailableServices();
        if (serviceData) {
            availableServices.value = serviceData;
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu ban đầu:', error);
    }
});

// Danh sách phòng đã format
const roomOptions = computed(() => {
    return availableRooms.value.map(room => ({
        label: `${room.number} - ${room.type.name}`,
        value: room.id
    }));
});

// Danh sách dịch vụ đã format
const serviceOptions = computed(() => {
    return availableServices.value.map(service => ({
        label: `${service.name} (${formatCurrency(service.price)})`,
        value: service.id
    }));
});

// Thêm phòng mới vào danh sách
const addRoom = () => {
    booking.value.rooms.push({
        roomId: null,
        serviceIds: [],
        adults: 1,
        children: 0
    });
};

// Xóa phòng khỏi danh sách
const removeRoom = (index) => {
    booking.value.rooms.splice(index, 1);
};

// Kiểm tra mã giảm giá
const validateDiscount = async () => {
    if (!booking.value.discountCode) {
        booking.value.discountId = null;
        return;
    }

    try {
        const discountData = await fetchDiscount(booking.value.discountCode);
        if (discountData) {
            booking.value.discountId = discountData.id;
            toast.add({
                severity: 'success',
                summary: 'Mã giảm giá hợp lệ',
                detail: `Giảm ${discountData.amount}${discountData.type === 'PERCENTAGE' ? '%' : ' VND'}`,
                life: 3000
            });
        } else {
            booking.value.discountId = null;
            toast.add({
                severity: 'error',
                summary: 'Mã giảm giá không hợp lệ',
                detail: 'Vui lòng kiểm tra lại mã giảm giá',
                life: 3000
            });
        }
    } catch (error) {
        booking.value.discountId = null;
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể kiểm tra mã giảm giá',
            life: 3000
        });
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5 class="m-0">Quản lý đặt phòng</h5>

                <Toolbar class="mb-4">
                    <template #start>
                        <div class="flex flex-wrap gap-2">
                            <Button label="Đặt phòng mới" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                        </div>
                    </template>
                </Toolbar>

                <DataTable
                    :value="bookings"
                    :paginator="true"
                    :rows="10"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    :loading="loading"
                    v-model:filters="filters"
                    filterDisplay="menu"
                    class="p-datatable-responsive-demo"
                    dataKey="id"
                    :globalFilterFields="['fullName', 'phone', 'email', 'status', 'paymentStatus']"
                    :scrollable="true"
                    scrollHeight="flex"
                >
                    <template #header>
                        <div class="flex justify-content-between">
                            <div>
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
                                </span>
                            </div>
                        </div>
                    </template>

                    <Column field="id" header="ID" :sortable="true" style="min-width: 5rem; max-width: 8rem;"></Column>
                    <Column field="fullName" header="Khách hàng" :sortable="true" style="min-width: 14rem">
                        <template #body="{ data }">
                            <div>
                                <span class="font-semibold">{{ data.fullName }}</span>
                                <div class="text-xs text-gray-500">
                                    <div v-if="data.phone">{{ data.phone }}</div>
                                    <div v-if="data.email">{{ data.email }}</div>
                                </div>
                            </div>
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Tìm theo tên" class="p-column-filter" :autoFocus="true" />
                        </template>
                    </Column>

                    <Column field="rooms" header="Phòng" style="min-width: 10rem">
                        <template #body="{ data }">
                            <div v-if="data.rooms && Array.isArray(data.rooms)">
                                <div v-for="(room, index) in data.rooms" :key="index">
                                    {{ availableRooms.find(r => r.id === room.roomId)?.roomNumber || room.roomId }}
                                    <span class="text-xs text-gray-500">
                                        ({{ room.adults }} người lớn, {{ room.children }} trẻ em)
                                    </span>
                                </div>
                            </div>
                            <div v-else-if="data.roomId">
                                {{ availableRooms.find(r => r.id === data.roomId)?.roomNumber || data.roomId }}
                                <span class="text-xs text-gray-500">
                                    ({{ data.adults || 1 }} người lớn, {{ data.children || 0 }} trẻ em)
                                </span>
                            </div>
                        </template>
                    </Column>

                    <Column field="checkInDate" header="Ngày nhận/trả" :sortable="true" style="min-width: 12rem">
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <div class="mb-1">
                                    <i class="pi pi-calendar-plus mr-1 text-green-500"></i>
                                    <span>{{ formatDate(data.checkInDate) }}</span>
                                </div>
                                <div>
                                    <i class="pi pi-calendar-minus mr-1 text-red-500"></i>
                                    <span>{{ formatDate(data.checkOutDate) }}</span>
                                </div>
                            </div>
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Calendar v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="Tìm theo ngày" @date-select="filterCallback()" />
                        </template>
                    </Column>

                    <Column field="totalPrice" header="Giá" :sortable="true" style="min-width: 10rem">
                        <template #body="{ data }">
                            <div>
                                <div class="mb-1">
                                    <span class="font-semibold">{{ formatCurrency(data.finalPrice || data.totalPrice) }}</span>
                                </div>
                                <div v-if="data.finalPrice && data.finalPrice !== data.totalPrice" class="text-xs line-through text-gray-500">
                                    {{ formatCurrency(data.totalPrice) }}
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column field="status" header="Trạng thái" :sortable="true" :filterField="'status'" style="min-width: 12rem">
                        <template #body="{ data }">
                            <Tag :value="getStatusLabel(data.status, statuses)" :severity="getStatusSeverity(data.status)" />
                            <div class="mt-2">
                                <Tag :value="getStatusLabel(data.paymentStatus, paymentStatuses)" :severity="getPaymentStatusSeverity(data.paymentStatus)" />
                            </div>
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="statuses" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái" class="p-column-filter" :showClear="true">
                                <template #value="slotProps">
                                    <Tag v-if="slotProps.value" :value="getStatusLabel(slotProps.value, statuses)" :severity="getStatusSeverity(slotProps.value)" />
                                    <span v-else>Chọn trạng thái</span>
                                </template>
                                <template #option="slotProps">
                                    <Tag :value="slotProps.option.label" :severity="getStatusSeverity(slotProps.option.value)" />
                                </template>
                            </Dropdown>
                        </template>
                    </Column>

                    <Column header="Thao tác" style="min-width: 12rem; max-width: 14rem;">
                        <template #body="{ data }">
                            <div class="flex flex-wrap gap-2">
                                <Button icon="pi pi-pencil" text rounded severity="info" @click="editBooking(data)" />

                                <div v-if="data.status === 'PENDING'">
                                    <Button icon="pi pi-check" text rounded severity="success" @click="confirmBookingAction(data)" v-tooltip.top="'Xác nhận đặt phòng'" />
                                    <Button icon="pi pi-times" text rounded severity="danger" @click="confirmCancelBooking(data)" v-tooltip.top="'Hủy đặt phòng'" />
                                </div>

                                <div v-if="data.status === 'CONFIRMED' && data.paymentStatus !== 'PAID'">
                                    <Button icon="pi pi-credit-card" text rounded severity="success" @click="markBookingAsPaid(data)" v-tooltip.top="'Đánh dấu đã thanh toán'" />
                                </div>

                                <div v-if="data.status === 'CONFIRMED'">
                                    <Button icon="pi pi-sign-in" text rounded severity="info" @click="markBookingAsCheckedIn(data)" v-tooltip.top="'Đánh dấu đã nhận phòng'" />
                                </div>

                                <div v-if="data.status === 'CHECKED_IN'">
                                    <Button icon="pi pi-sign-out" text rounded severity="warning" @click="markBookingAsCheckedOut(data)" v-tooltip.top="'Đánh dấu đã trả phòng'" />
                                </div>
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <!-- Dialog chỉnh sửa/tạo mới đặt phòng -->
                <BookingEditDialog
                    v-model:visible="bookingEditDialog"
                    v-model:bookingData="editingBooking"
                    :submitted="submitted"
                    :statuses="statuses"
                    :paymentStatuses="paymentStatuses"
                    :paymentMethods="paymentMethods"
                    @hideDialog="hideDialog"
                    @save="saveBooking"
                />

                <ConfirmDialog />
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.p-datatable-responsive-demo .p-datatable-tbody > tr > td) {
    word-break: break-word;
}

:deep(.p-button.p-button-icon-only.p-button-rounded) {
    width: 2.5rem;
    height: 2.5rem;
}

:deep(.p-toolbar) {
    padding: 1rem;
    border-radius: 6px;
}

:deep(.p-calendar .p-inputtext) {
    width: 100%;
}
</style>
