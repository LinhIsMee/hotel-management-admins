<script setup>
import BookingActionButtons from '@/components/booking/BookingActionButtons.vue';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import Button from 'primevue/button';

const props = defineProps({
    bookings: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    filters: {
        type: Object,
        required: true
    },
    selectedBookings: {
        type: Array,
        default: () => []
    },
    formatDate: {
        type: Function,
        required: true
    },
    formatCurrency: {
        type: Function,
        required: true
    },
    getStatusLabel: {
        type: Function,
        required: true
    },
    getStatusSeverity: {
        type: Function,
        required: true
    },
    getPaymentStatusLabel: {
        type: Function,
        required: true
    },
    getPaymentMethodLabel: {
        type: Function,
        required: true
    },
    getPaymentStatusSeverity: {
        type: Function,
        required: true
    },
    can: {
        type: Object,
        required: true
    },
    displayColumns: {
        type: Object,
        required: true
    }
});

const emit = defineEmits([
    'update:selectedBookings',
    'view-details',
    'edit',
    'confirm',
    'cancel',
    'delete',
    'check-in',
    'check-out'
]);

// Tạo computed property cho selectedBookingsModel để sử dụng v-model
import { computed } from 'vue';

const selectedBookingsModel = computed({
    get: () => props.selectedBookings,
    set: (value) => emit('update:selectedBookings', value)
});

// Các hàm tương tác với đơn đặt phòng
const viewDetails = (data) => {
    emit('view-details', data);
};

const editBooking = (data) => {
    emit('edit', data);
};

const confirmBooking = (data) => {
    emit('confirm', data);
};

const cancelBooking = (data) => {
    emit('cancel', data);
};

const confirmDeleteBooking = (data) => {
    emit('delete', data);
};

const checkInBooking = (data) => {
    emit('check-in', data);
};

const checkOutBooking = (data) => {
    emit('check-out', data);
};

// Computed properties để hiển thị đúng dữ liệu
const getRoomInfo = (booking) => {
    if (booking.rooms && Array.isArray(booking.rooms) && booking.rooms.length > 0) {
        return {
            numbers: booking.rooms.map(r => r.roomNumber).join(', '),
            types: booking.rooms.map(r => r.roomType).join(', ')
        };
    }
    return { numbers: booking.roomNumber || '-', types: booking.roomType || '-' };
};
</script>

<template>
    <div class="card">
        <DataTable
            :value="bookings"
            v-model:selection="selectedBookingsModel"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[10, 25, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="{first} đến {last} của {totalRecords} đơn đặt phòng"
            :filters="filters"
            :loading="loading"
            :resizableColumns="true"
            columnResizeMode="fit"
            responsiveLayout="scroll"
            stripedRows
            @update:selection="$emit('update:selectedBookings', $event)"
            class="booking-table"
        >
            <template #empty>
                <div class="p-4 text-center">
                    <p>Không tìm thấy đơn đặt phòng nào.</p>
                </div>
            </template>

            <template #loading>
                <div class="p-4">
                    <div class="flex flex-column gap-2">
                        <Skeleton height="2.5rem" width="100%"></Skeleton>
                        <Skeleton height="2rem" width="100%"></Skeleton>
                        <Skeleton height="2rem" width="100%"></Skeleton>
                        <Skeleton height="2rem" width="100%"></Skeleton>
                        <Skeleton height="2rem" width="100%"></Skeleton>
                    </div>
                </div>
            </template>

            <!-- Các cột của DataTable -->
            <Column v-if="displayColumns.selection" selectionMode="multiple" headerStyle="width: 3rem;"></Column>

            <Column field="id" header="Mã đơn" sortable :sortField="(item) => item.id"
                   :style="{ minWidth: '8rem' }" class="font-semibold"></Column>

            <Column field="fullName" header="Khách hàng" sortable :sortField="(item) => item.fullName"
                   :style="{ minWidth: '12rem' }">
                <template #body="{ data }">
                    <div class="flex flex-column gap-1">
                        <span class="font-semibold">{{ data.fullName }}</span>
                        <span class="text-sm text-color-secondary">{{ data.phone || '-' }}</span>
                    </div>
                </template>
            </Column>

            <Column field="roomInfo" header="Phòng" :style="{ minWidth: '10rem' }">
                <template #body="{ data }">
                    <div class="flex flex-column gap-1">
                        <span class="font-semibold">{{ getRoomInfo(data).numbers }}</span>
                        <span class="text-sm text-color-secondary">{{ getRoomInfo(data).types }}</span>
                    </div>
                </template>
            </Column>

            <Column field="checkInDate" header="Nhận - Trả phòng" :style="{ minWidth: '12rem' }">
                <template #body="{ data }">
                    <div class="flex flex-column gap-1">
                        <span><i class="pi pi-calendar-plus mr-2"></i>{{ formatDate(data.checkInDate) }}</span>
                        <span><i class="pi pi-calendar-minus mr-2"></i>{{ formatDate(data.checkOutDate) }}</span>
                    </div>
                </template>
            </Column>

            <Column field="status" header="Trạng thái" sortable :style="{ minWidth: '10rem' }">
                <template #body="{ data }">
                    <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
                </template>
            </Column>

            <Column field="totalPrice" header="Tổng tiền" sortable :sortField="(item) => Number(item.finalPrice || item.totalPrice)"
                   :style="{ minWidth: '10rem' }">
                <template #body="{ data }">
                    <div class="flex flex-column gap-1">
                        <span class="font-semibold">{{ formatCurrency(data.finalPrice || data.totalPrice) }}</span>
                        <span v-if="data.finalPrice && data.finalPrice !== data.totalPrice" class="text-xs line-through text-color-secondary">
                            {{ formatCurrency(data.totalPrice) }}
                        </span>
                    </div>
                </template>
            </Column>

            <Column field="paymentStatus" header="Thanh toán" sortable :style="{ minWidth: '10rem' }">
                <template #body="{ data }">
                    <div class="flex flex-column gap-1">
                        <Tag
                            :value="getPaymentStatusLabel(data.paymentStatus)"
                            :severity="getPaymentStatusSeverity(data.paymentStatus)"
                        />
                        <span class="text-sm text-color-secondary">
                            {{ getPaymentMethodLabel(data.paymentMethod) || '—' }}
                        </span>
                    </div>
                </template>
            </Column>

            <Column v-if="displayColumns.actions" :exportable="false" :style="{ minWidth: '10rem' }">
                <template #body="{ data }">
                    <div class="flex gap-2 justify-content-end">
                        <Button
                            icon="pi pi-eye"
                            rounded
                            text
                            aria-label="Xem chi tiết"
                            @click="$emit('view-details', data)"
                        />
                        <Button
                            v-if="can.edit"
                            icon="pi pi-pencil"
                            rounded
                            text
                            aria-label="Sửa"
                            @click="$emit('edit', data)"
                        />
                        <!-- Nút xác nhận chỉ hiển thị khi trạng thái là PENDING -->
                        <Button
                            v-if="can.confirm && data.status === 'PENDING'"
                            icon="pi pi-check"
                            rounded
                            text
                            severity="success"
                            aria-label="Xác nhận"
                            @click="$emit('confirm', data)"
                        />
                        <!-- Nút hủy chỉ hiển thị khi trạng thái là PENDING hoặc CONFIRMED -->
                        <Button
                            v-if="can.cancel && ['PENDING', 'CONFIRMED'].includes(data.status)"
                            icon="pi pi-times"
                            rounded
                            text
                            severity="danger"
                            aria-label="Hủy"
                            @click="$emit('cancel', data)"
                        />
                        <!-- Nút check-in chỉ hiển thị khi trạng thái là CONFIRMED -->
                        <Button
                            v-if="can.checkIn && data.status === 'CONFIRMED'"
                            icon="pi pi-sign-in"
                            rounded
                            text
                            severity="info"
                            aria-label="Check-in"
                            @click="$emit('check-in', data)"
                        />
                        <!-- Nút check-out chỉ hiển thị khi trạng thái là CHECKED_IN -->
                        <Button
                            v-if="can.checkOut && data.status === 'CHECKED_IN'"
                            icon="pi pi-sign-out"
                            rounded
                            text
                            severity="info"
                            aria-label="Check-out"
                            @click="$emit('check-out', data)"
                        />
                        <Button
                            v-if="can.delete"
                            icon="pi pi-trash"
                            rounded
                            text
                            severity="danger"
                            aria-label="Xóa"
                            @click="$emit('delete', data)"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
.booking-table {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    overflow: hidden;
}

.customer-info {
    display: flex;
    flex-direction: column;
}

.price-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.booking-date {
    display: flex;
    flex-direction: column;
}

.room-tag {
    font-size: 0.75rem;
    padding: 0.1rem 0.4rem;
}

@media screen and (max-width: 768px) {
    .booking-table :deep(.p-datatable-tbody > tr > td) {
        padding: 0.5rem;
    }
}
</style>
