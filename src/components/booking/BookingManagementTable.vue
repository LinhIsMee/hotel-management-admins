<script setup>
import BookingActionButtons from '@/components/booking/BookingActionButtons.vue';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';

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

const emit = defineEmits(['update:selectedBookings', 'view-details', 'edit', 'confirm', 'cancel', 'delete']);

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
</script>

<template>
    <div class="booking-management-container">
        <DataTable
            :value="bookings"
            v-model:selection="selectedBookingsModel"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 25, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} đơn đặt"
            responsiveLayout="scroll"
            :filters="filters"
            :loading="loading"
            stripedRows
            dataKey="id"
            class="booking-table p-datatable-sm"
        >
            <template #empty>Không có đơn đặt phòng nào được tìm thấy.</template>
            <template #loading>Đang tải dữ liệu đơn đặt phòng. Vui lòng đợi.</template>

            <Column v-if="displayColumns.selection" selectionMode="multiple" :exportable="false" style="width: 3rem; min-width: 3rem" />

            <Column field="id" header="Mã đơn" sortable style="min-width: 5rem; width: 7rem">
                <template #body="{ data }">
                    <span class="font-bold">{{ data.id }}</span>
                </template>
            </Column>

            <Column field="fullName" header="Khách hàng" sortable style="min-width: 10rem">
                <template #body="{ data }">
                    <div class="customer-info">
                        <span class="font-medium">{{ data.fullName }}</span>
                        <div class="text-xs text-500">{{ data.phone }}</div>
                    </div>
                </template>
            </Column>

            <Column field="rooms" header="Phòng" style="min-width: 8rem">
                <template #body="{ data }">
                    <div v-if="data.rooms && data.rooms.length > 0">
                        <div v-for="(room, index) in data.rooms" :key="index" class="mb-1">
                            <Tag class="room-tag" severity="info">
                                {{ room.roomNumber }}
                            </Tag>
                            <span class="text-xs ml-1">{{ room.roomType }}</span>
                        </div>
                    </div>
                    <span v-else class="text-500 text-sm">Không có phòng</span>
                </template>
            </Column>

            <Column field="checkInDate" header="Nhận phòng" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    <div class="booking-date">
                        <div class="font-medium">{{ formatDate(data.checkInDate) }}</div>
                        <div class="text-xs text-500">{{ new Date(data.checkInDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}</div>
                    </div>
                </template>
            </Column>

            <Column field="checkOutDate" header="Trả phòng" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    <div class="booking-date">
                        <div class="font-medium">{{ formatDate(data.checkOutDate) }}</div>
                        <div class="text-xs text-500">{{ new Date(data.checkOutDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}</div>
                    </div>
                </template>
            </Column>

            <Column field="status" header="Trạng thái" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
                </template>
            </Column>

            <Column field="finalPrice" header="Tổng tiền" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    <div class="price-container">
                        <div class="font-bold">
                            {{ data.finalPrice < 0 || Math.abs(data.finalPrice) > 1e9 
                                ? formatCurrency(data.totalPrice) 
                                : formatCurrency(data.finalPrice) }}
                        </div>
                        <Tag :value="getPaymentStatusLabel(data.paymentStatus)" :severity="getPaymentStatusSeverity(data.paymentStatus)" size="small" />
                    </div>
                </template>
            </Column>

            <Column field="paymentMethod" header="Phương thức" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    {{ getPaymentMethodLabel(data.paymentMethod) }}
                </template>
            </Column>

            <Column field="createdAt" header="Ngày tạo" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    {{ formatDate(data.createdAt) }}
                </template>
            </Column>

            <Column v-if="displayColumns.actions" header="Hành động" :exportable="false" style="min-width: 10rem">
                <template #body="{ data }">
                    <BookingActionButtons :data="data" :can="can" @view="viewDetails" @edit="editBooking" @confirm="confirmBooking" @cancel="cancelBooking" @delete="confirmDeleteBooking" />
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
