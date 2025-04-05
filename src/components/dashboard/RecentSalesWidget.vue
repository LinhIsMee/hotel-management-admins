<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import StatisticsService from '@/services/StatisticsService';

const bookings = ref([]);
const loading = ref(true);

const fetchRecentBookings = async () => {
    try {
        loading.value = true;
        const response = await StatisticsService.getRecentBookings(7); // Lấy 7 ngày gần đây
        bookings.value = response.data || [];
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đặt phòng gần đây:', error);
        bookings.value = [];
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchRecentBookings();
});

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

const getSeverity = (status) => {
    switch (status) {
        case 'CONFIRMED':
            return 'success';
        case 'PENDING':
            return 'warning';
        case 'CANCELLED':
            return 'danger';
        case 'CHECKED_IN':
            return 'info';
        case 'CHECKED_OUT':
            return 'secondary';
        default:
            return null;
    }
};
</script>

<template>
    <div class="card mb-8">
        <h5 class="text-xl font-medium mb-4">Đặt phòng gần đây</h5>
        <div v-if="loading" class="flex justify-center py-4">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
        </div>
        <div v-else-if="bookings.length === 0" class="flex justify-center py-4 text-gray-500">
            Không có dữ liệu đặt phòng gần đây
        </div>
        <DataTable v-else :value="bookings" class="p-datatable-sm" :rows="5" :rowsPerPageOptions="[5, 10, 20]" paginator>
            <Column field="id" header="ID" style="width: 5%"></Column>
            <Column field="customerName" header="Khách hàng" style="width: 25%"></Column>
            <Column field="roomNumber" header="Phòng" style="width: 15%"></Column>
            <Column field="checkInDate" header="Ngày nhận">
                <template #body="{ data }">
                    {{ formatDate(data.checkInDate) }}
                </template>
            </Column>
            <Column field="totalPrice" header="Số tiền">
                <template #body="{ data }">
                    {{ formatCurrency(data.totalPrice) }}
                </template>
            </Column>
            <Column field="status" header="Trạng thái" style="width: 15%">
                <template #body="{ data }">
                    <Tag :value="data.status" :severity="getSeverity(data.status)"></Tag>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
