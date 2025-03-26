<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';

const bookings = ref([
    { id: 1, customer: 'Nguyễn Văn A', roomNumber: '101', checkIn: '2023-10-15', amount: 1200000, status: 'CONFIRMED' },
    { id: 2, customer: 'Trần Thị B', roomNumber: '203', checkIn: '2023-10-16', amount: 1500000, status: 'PENDING' },
    { id: 3, customer: 'Lê Minh C', roomNumber: '305', checkIn: '2023-10-17', amount: 2100000, status: 'CONFIRMED' },
    { id: 4, customer: 'Phạm Thanh D', roomNumber: '401', checkIn: '2023-10-18', amount: 1800000, status: 'CANCELLED' },
    { id: 5, customer: 'Hoàng Văn E', roomNumber: '502', checkIn: '2023-10-19', amount: 2500000, status: 'CONFIRMED' }
]);

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
        default:
            return null;
    }
};
</script>

<template>
    <div class="card mb-8">
        <h5 class="text-xl font-medium mb-4">Đặt phòng gần đây</h5>
        <DataTable :value="bookings" class="p-datatable-sm" :rows="5" :rowsPerPageOptions="[5, 10, 20]" paginator>
            <Column field="id" header="ID" style="width: 5%"></Column>
            <Column field="customer" header="Khách hàng" style="width: 25%"></Column>
            <Column field="roomNumber" header="Phòng" style="width: 15%"></Column>
            <Column field="checkIn" header="Ngày nhận">
                <template #body="{ data }">
                    {{ formatDate(data.checkIn) }}
                </template>
            </Column>
            <Column field="amount" header="Số tiền">
                <template #body="{ data }">
                    {{ formatCurrency(data.amount) }}
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
