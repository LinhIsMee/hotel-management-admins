<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';

// Khai báo biến
const bookings = ref([]);
const availableRooms = ref([]);
const availableServices = ref([]);
const loading = ref(true);
const bookingDialog = ref(false);
const deleteBookingDialog = ref(false);
const deleteBookingsDialog = ref(false);
const booking = ref({});
const selectedBookings = ref(null);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

// Thêm các biến cần thiết cho dialog
const roomTypes = ref([
    { id: 1, name: 'Phòng đơn' },
    { id: 2, name: 'Phòng đôi' },
    { id: 3, name: 'Phòng VIP' }
]);

// Trạng thái đơn đặt
const bookingStatuses = ref([
    { label: 'Mới', value: 'NEW' },
    { label: 'Đã xác nhận', value: 'CONFIRMED' },
    { label: 'Đã nhận phòng', value: 'CHECK_IN' },
    { label: 'Đã trả phòng', value: 'CHECK_OUT' },
    { label: 'Đã hủy', value: 'CANCELLED' }
]);

// Phương thức thanh toán
const paymentMethods = ref([
    { label: 'Tiền mặt', value: 'CASH' },
    { label: 'Thẻ tín dụng', value: 'CREDIT_CARD' },
    { label: 'Chuyển khoản', value: 'BANK_TRANSFER' },
    { label: 'Ví điện tử', value: 'E_WALLET' }
]);

// Trạng thái thanh toán
const paymentStatuses = ref([
    { label: 'Chưa thanh toán', value: 'UNPAID' },
    { label: 'Đã đặt cọc', value: 'PARTIAL' },
    { label: 'Đã thanh toán', value: 'PAID' },
    { label: 'Hoàn tiền', value: 'REFUNDED' }
]);

// Lấy dữ liệu từ file JSON
const fetchData = async () => {
    try {
        loading.value = true;

        // Tải dữ liệu đơn đặt phòng
        const bookingsResponse = await fetch('/demo/data/bookings.json');
        const bookingsData = await bookingsResponse.json();
        bookings.value = bookingsData.data;

        // Tải dữ liệu phòng có sẵn
        const roomsResponse = await fetch('/demo/data/available-rooms.json');
        const roomsData = await roomsResponse.json();
        availableRooms.value = roomsData.data;

        // Tải dữ liệu dịch vụ có sẵn
        const servicesResponse = await fetch('/demo/data/available-services.json');
        const servicesData = await servicesResponse.json();
        availableServices.value = servicesData.data;
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        // Không còn mock data nào trong code nữa
        bookings.value = [];
        availableRooms.value = [];
        availableServices.value = [];
    } finally {
        loading.value = false;
    }
};

// Gọi API khi component được mount
onMounted(() => {
    fetchData();
});

// Mở dialog thêm mới
const openNew = () => {
    booking.value = {
        status: 'NEW',
        paymentStatus: 'UNPAID',
        paymentMethod: 'CASH',
        adults: 1,
        children: 0,
        customerName: '',
        customerPhone: '',
        roomId: null,
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 86400000),
        totalAmount: 0,
        paidAmount: 0,
        additionalServices: [],
        specialRequests: ''
    };
    submitted.value = false;
    bookingDialog.value = true;
    console.log('Dialog opened:', bookingDialog.value);
};

// Ẩn dialog
const hideDialog = () => {
    bookingDialog.value = false;
    submitted.value = false;
};

// Lưu đơn đặt
const saveBooking = () => {
    submitted.value = true;

    if (booking.value.customerName?.trim() && booking.value.roomId) {
        // Tìm thông tin phòng
        const selectedRoom = availableRooms.value.find((r) => r.id === booking.value.roomId);
        const selectedRoomType = roomTypes.value.find((t) => t.id === selectedRoom?.roomTypeId);

        if (booking.value.id) {
            // Cập nhật đơn đặt hiện có
            const index = findIndexById(booking.value.id);
            bookings.value[index] = {
                ...booking.value,
                roomNumber: selectedRoom?.roomNumber,
                roomType: selectedRoomType?.name,
                guestName: booking.value.customerName // Đảm bảo hiển thị đúng tên trong bảng
            };
        } else {
            // Tạo đơn đặt mới
            booking.value.id = 'B' + String(bookings.value.length + 1).padStart(3, '0');
            booking.value.createdAt = new Date().toISOString().split('T')[0];
            booking.value.roomNumber = selectedRoom?.roomNumber;
            booking.value.roomType = selectedRoomType?.name;
            booking.value.guestName = booking.value.customerName; // Đảm bảo hiển thị đúng tên trong bảng
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
        customerName: editBooking.guestName,
        roomId: room?.id || null,
        checkInDate: new Date(editBooking.checkInDate),
        checkOutDate: new Date(editBooking.checkOutDate),
        additionalServices: editBooking.additionalServices || []
    };

    bookingDialog.value = true;
    console.log('Edit dialog opened:', bookingDialog.value); // Debug
};

// Mở dialog xác nhận xóa
const confirmDeleteBooking = (editBooking) => {
    booking.value = editBooking;
    deleteBookingDialog.value = true;
};

// Xóa đơn đặt
const deleteBooking = () => {
    bookings.value = bookings.value.filter((val) => val.id !== booking.value.id);
    deleteBookingDialog.value = false;
    booking.value = {};
};

// Mở dialog xác nhận xóa nhiều
const confirmDeleteSelected = () => {
    deleteBookingsDialog.value = true;
};

// Xóa nhiều đơn đặt
const deleteSelectedBookings = () => {
    bookings.value = bookings.value.filter((val) => !selectedBookings.value.includes(val));
    deleteBookingsDialog.value = false;
    selectedBookings.value = null;
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

// Format ngày tháng
const formatDate = (value) => {
    if (value) {
        const date = new Date(value);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    }
    return '';
};

// Format tiền tệ
const formatCurrency = (value) => {
    if (value) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(value);
    }
    return '';
};

// Lấy tên trạng thái đơn đặt
const getBookingStatusName = (statusValue) => {
    const status = bookingStatuses.value.find((s) => s.value === statusValue);
    return status ? status.label : '';
};

// Lấy tên phương thức thanh toán
const getPaymentMethodName = (methodValue) => {
    const method = paymentMethods.value.find((m) => m.value === methodValue);
    return method ? method.label : '';
};

// Lấy tên trạng thái thanh toán
const getPaymentStatusName = (statusValue) => {
    const status = paymentStatuses.value.find((s) => s.value === statusValue);
    return status ? status.label : '';
};

// Lấy CSS class cho trạng thái đơn đặt
const getBookingStatusSeverity = (status) => {
    switch (status) {
        case 'NEW':
            return 'info';
        case 'CONFIRMED':
            return 'success';
        case 'CHECK_IN':
            return 'warning';
        case 'CHECK_OUT':
            return 'success';
        case 'CANCELLED':
            return 'danger';
        default:
            return null;
    }
};

// Lấy CSS class cho trạng thái thanh toán
const getPaymentStatusSeverity = (status) => {
    switch (status) {
        case 'PAID':
            return 'success';
        case 'PARTIAL':
            return 'warning';
        case 'UNPAID':
            return 'danger';
        case 'REFUNDED':
            return 'info';
        default:
            return null;
    }
};
</script>

<template>
    <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <Toast />
        <ConfirmDialog></ConfirmDialog>
        <div class="bg-white rounded-lg mb-4">
            <Toolbar class="mb-4 rounded-lg">
                <template v-slot:start>
                    <div class="my-2">
                        <Button label="Thêm mới" icon="pi pi-plus" class="mr-2 bg-green-600 border-green-600 hover:bg-green-700" severity="success" @click="openNew" />
                        <Button label="Xóa" icon="pi pi-trash" class="mr-2 bg-red-600 border-red-600 hover:bg-red-700" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedBookings || !selectedBookings.length" />
                    </div>
                </template>

                <template v-slot:end>
                    <span class="relative">
                        <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="pl-8 text-sm h-10 w-64 border border-gray-300 rounded-md" />
                    </span>
                </template>
            </Toolbar>

            <DataTable
                :value="bookings"
                v-model:selection="selectedBookings"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :loading="loading"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} đơn đặt"
                responsiveLayout="scroll"
                class="p-datatable-sm"
            >
                <template #empty>Không có đơn đặt nào được tìm thấy.</template>
                <template #loading>Đang tải dữ liệu đơn đặt. Vui lòng đợi.</template>

                <Column selectionMode="multiple" exportable="false" style="min-width: 3rem"></Column>

                <Column field="id" header="Mã đơn" sortable style="min-width: 5rem"></Column>

                <Column field="guestName" header="Tên khách hàng" sortable style="min-width: 10rem"></Column>

                <Column field="roomNumber" header="Phòng" sortable style="min-width: 5rem"></Column>

                <Column field="roomType" header="Loại phòng" sortable style="min-width: 8rem"></Column>

                <Column field="checkInDate" header="Nhận phòng" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        {{ formatDate(data.checkInDate) }}
                    </template>
                </Column>

                <Column field="checkOutDate" header="Trả phòng" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        {{ formatDate(data.checkOutDate) }}
                    </template>
                </Column>

                <Column field="status" header="Trạng thái" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        <Tag :value="getBookingStatusName(data.status)" :severity="getBookingStatusSeverity(data.status)" />
                    </template>
                </Column>

                <Column field="totalAmount" header="Tổng tiền" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        {{ formatCurrency(data.totalAmount) }}
                    </template>
                </Column>

                <Column field="paymentStatus" header="Thanh toán" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        <Tag :value="getPaymentStatusName(data.paymentStatus)" :severity="getPaymentStatusSeverity(data.paymentStatus)" />
                    </template>
                </Column>

                <Column field="paymentMethod" header="Phương thức" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        {{ getPaymentMethodName(data.paymentMethod) }}
                    </template>
                </Column>

                <Column exportable="false" style="min-width: 8rem">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" outlined class="mr-2" @click="editBooking(data)" />
                        <Button icon="pi pi-trash" outlined severity="danger" @click="confirmDeleteBooking(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog thêm/sửa đơn đặt phòng -->
        <Dialog v-model:visible="bookingDialog" :style="{ width: '1000px' }" header="Thông tin đơn đặt phòng" :modal="true" class="p-fluid">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                <!-- Cột 1: Thông tin khách hàng -->
                <div class="field">
                    <div class="p-3">
                        <h3 class="text-lg font-medium mb-2">Thông tin khách hàng</h3>

                        <div class="mb-3">
                            <label for="customerName" class="font-bold mb-1 block">Họ và tên</label>
                            <InputText id="customerName" v-model.trim="booking.customerName" required class="w-full" :class="{ 'p-invalid': submitted && !booking.customerName }" />
                            <small class="p-error" v-if="submitted && !booking.customerName">Họ và tên khách hàng là bắt buộc.</small>
                        </div>

                        <div class="mb-3">
                            <label for="customerEmail" class="font-bold mb-1 block">Email</label>
                            <InputText id="customerEmail" v-model.trim="booking.customerEmail" type="email" class="w-full" />
                        </div>

                        <div class="mb-3">
                            <label for="customerPhone" class="font-bold mb-1 block">Số điện thoại</label>
                            <InputText id="customerPhone" v-model.trim="booking.customerPhone" required class="w-full" :class="{ 'p-invalid': submitted && !booking.customerPhone }" />
                            <small class="p-error" v-if="submitted && !booking.customerPhone">Số điện thoại là bắt buộc.</small>
                        </div>

                        <div class="mb-3">
                            <label for="identityCard" class="font-bold mb-1 block">Số CMND/CCCD</label>
                            <InputText id="identityCard" v-model.trim="booking.identityCard" class="w-full" />
                        </div>
                    </div>
                </div>

                <!-- Cột 2: Thông tin đơn đặt -->
                <div class="field">
                    <div class="p-3">
                        <h3 class="text-lg font-medium mb-2">Thông tin đơn đặt</h3>

                        <div class="mb-3">
                            <label for="roomId" class="font-bold mb-1 block">Phòng</label>
                            <Dropdown id="roomId" v-model="booking.roomId" :options="availableRooms" optionLabel="roomNumber" optionValue="id" placeholder="Chọn phòng" class="w-full" :class="{ 'p-invalid': submitted && !booking.roomId }" />
                            <small class="p-error" v-if="submitted && !booking.roomId">Vui lòng chọn phòng.</small>
                        </div>

                        <div class="mb-3">
                            <label for="status" class="font-bold mb-1 block">Trạng thái</label>
                            <Dropdown id="status" v-model="booking.status" :options="bookingStatuses" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái" class="w-full" />
                        </div>

                        <div class="mb-3">
                            <label for="checkInDate" class="font-bold mb-1 block">Ngày nhận phòng</label>
                            <Calendar id="checkInDate" v-model="booking.checkInDate" dateFormat="dd/mm/yy" placeholder="Chọn ngày" showIcon class="w-full" required :class="{ 'p-invalid': submitted && !booking.checkInDate }" />
                            <small class="p-error" v-if="submitted && !booking.checkInDate">Ngày nhận phòng là bắt buộc.</small>
                        </div>

                        <div class="mb-3">
                            <label for="checkOutDate" class="font-bold mb-1 block">Ngày trả phòng</label>
                            <Calendar id="checkOutDate" v-model="booking.checkOutDate" dateFormat="dd/mm/yy" placeholder="Chọn ngày" showIcon class="w-full" required :class="{ 'p-invalid': submitted && !booking.checkOutDate }" />
                            <small class="p-error" v-if="submitted && !booking.checkOutDate">Ngày trả phòng là bắt buộc.</small>
                        </div>
                    </div>
                </div>

                <!-- Cột 3: Thông tin thanh toán -->
                <div class="field">
                    <div class="p-3">
                        <h3 class="text-lg font-medium mb-2">Thông tin thanh toán</h3>

                        <div class="mb-3">
                            <label for="paymentStatus" class="font-bold mb-1 block">Trạng thái thanh toán</label>
                            <Dropdown id="paymentStatus" v-model="booking.paymentStatus" :options="paymentStatuses" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái" class="w-full" />
                        </div>

                        <div class="mb-3">
                            <label for="paymentMethod" class="font-bold mb-1 block">Phương thức thanh toán</label>
                            <Dropdown id="paymentMethod" v-model="booking.paymentMethod" :options="paymentMethods" optionLabel="label" optionValue="value" placeholder="Chọn phương thức" class="w-full" />
                        </div>

                        <div class="mb-3">
                            <label for="totalAmount" class="font-bold mb-1 block">Tổng tiền</label>
                            <InputNumber id="totalAmount" v-model="booking.totalAmount" mode="currency" currency="VND" locale="vi-VN" :minFractionDigits="0" :maxFractionDigits="0" class="w-full" />
                        </div>

                        <div class="mb-3">
                            <label for="paidAmount" class="font-bold mb-1 block">Đã thanh toán</label>
                            <InputNumber id="paidAmount" v-model="booking.paidAmount" mode="currency" currency="VND" locale="vi-VN" :minFractionDigits="0" :maxFractionDigits="0" class="w-full" />
                        </div>
                    </div>
                </div>

                <!-- Hàng giữa: Thông tin khách hàng (chiếm 3 cột) -->
                <div class="md:col-span-3 field">
                    <div class="p-3">
                        <h3 class="text-lg font-medium mb-2">Thông tin số lượng khách</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="mb-3">
                                <label for="adults" class="font-bold mb-1 block">Số người lớn</label>
                                <InputNumber id="adults" v-model="booking.adults" showButtons :min="1" :max="10" class="w-full" />
                            </div>

                            <div class="mb-3">
                                <label for="children" class="font-bold mb-1 block">Số trẻ em</label>
                                <InputNumber id="children" v-model="booking.children" showButtons :min="0" :max="5" class="w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Hàng cuối: Dịch vụ và yêu cầu (chiếm 3 cột) -->
                <div class="md:col-span-3 field">
                    <div class="p-3">
                        <h3 class="text-lg font-medium mb-2">Dịch vụ và yêu cầu đặc biệt</h3>

                        <div class="mb-3">
                            <label for="additionalServices" class="font-bold mb-1 block">Dịch vụ bổ sung</label>
                            <MultiSelect id="additionalServices" v-model="booking.additionalServices" :options="availableServices" optionLabel="name" optionValue="id" display="chip" placeholder="Chọn dịch vụ" class="w-full" />
                        </div>

                        <div class="mb-3">
                            <label for="specialRequests" class="font-bold mb-1 block">Yêu cầu đặc biệt</label>
                            <Textarea id="specialRequests" v-model="booking.specialRequests" rows="3" autoResize class="w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Lưu" icon="pi pi-check" text @click="saveBooking" />
            </template>
        </Dialog>

        <!-- Dialog xác nhận xóa đơn đặt -->
        <Dialog v-model:visible="deleteBookingDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="booking"
                    >Bạn có chắc chắn muốn xóa đơn đặt của <b>{{ booking.guestName }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteBookingDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteBooking" />
            </template>
        </Dialog>

        <!-- Dialog xác nhận xóa nhiều đơn đặt -->
        <Dialog v-model:visible="deleteBookingsDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="selectedBookings && selectedBookings.length > 0">Bạn có chắc chắn muốn xóa {{ selectedBookings.length }} đơn đặt đã chọn?</span>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteBookingsDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteSelectedBookings" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.card {
    background: var(--surface-card);
    border-radius: 10px;
    margin-bottom: 1rem;
    padding: 1rem;
}

.p-toolbar {
    border-radius: 10px;
}

.p-datatable .p-datatable-header {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.p-datatable .p-column-header-content {
    justify-content: flex-start;
}

:deep(.p-datatable-wrapper) {
    border-radius: 10px;
}

:deep(.p-dropdown-label),
:deep(.p-multiselect-label) {
    display: flex;
    align-items: center;
}

:deep(.p-inputtext) {
    font-size: 0.9rem;
    min-height: 36px;
    width: 100% !important;
}

:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-multiselect),
:deep(.p-inputnumber),
:deep(.p-textarea) {
    display: flex;
    width: 100% !important;
}

:deep(.p-dropdown-panel),
:deep(.p-calendar-panel),
:deep(.p-multiselect-panel) {
    width: auto !important;
    min-width: 100%;
}

:deep(.p-dropdown-items-wrapper),
:deep(.p-datepicker),
:deep(.p-multiselect-items-wrapper) {
    width: 100%;
}

:deep(.p-button) {
    font-size: 0.95rem;
    min-height: 38px;
}

:deep(.p-dialog-content) {
    overflow-y: visible;
}

.field {
    width: 100%;
}
</style>
