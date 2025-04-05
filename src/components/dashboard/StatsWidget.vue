<script setup>
import { ref, onMounted } from 'vue';
import StatisticsService from '@/services/StatisticsService';

const loading = ref(true);
const stats = ref({
    totalBookings: 0,
    totalCustomers: 0,
    totalRates: 0,
    totalRevenue: 0
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

onMounted(async () => {
    try {
        const response = await StatisticsService.getCountInfo();
        stats.value = response.data;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin thống kê:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="col-span-12 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between mb-3">
                    <div>
                        <span class="block text-gray-500 font-medium mb-1">Tổng đặt phòng</span>
                        <div v-if="loading" class="text-2xl font-semibold"><i class="pi pi-spin pi-spinner"></i></div>
                        <div v-else class="text-2xl font-semibold">{{ stats.totalBookings }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 h-12 w-12 rounded-full">
                        <i class="pi pi-calendar text-blue-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-gray-500 text-sm">Tổng số đặt phòng</div>
            </div>

            <div class="bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between mb-3">
                    <div>
                        <span class="block text-gray-500 font-medium mb-1">Tổng khách hàng</span>
                        <div v-if="loading" class="text-2xl font-semibold"><i class="pi pi-spin pi-spinner"></i></div>
                        <div v-else class="text-2xl font-semibold">{{ stats.totalCustomers }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 h-12 w-12 rounded-full">
                        <i class="pi pi-users text-green-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-green-500 text-sm">Số lượng khách đã đặt phòng</div>
            </div>

            <div class="bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between mb-3">
                    <div>
                        <span class="block text-gray-500 font-medium mb-1">Doanh thu</span>
                        <div v-if="loading" class="text-2xl font-semibold"><i class="pi pi-spin pi-spinner"></i></div>
                        <div v-else class="text-2xl font-semibold">{{ formatCurrency(stats.totalRevenue) }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-amber-100 h-12 w-12 rounded-full">
                        <i class="pi pi-money-bill text-amber-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-amber-500 text-sm">Tổng doanh thu</div>
            </div>

            <div class="bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between mb-3">
                    <div>
                        <span class="block text-gray-500 font-medium mb-1">Đánh giá</span>
                        <div v-if="loading" class="text-2xl font-semibold"><i class="pi pi-spin pi-spinner"></i></div>
                        <div v-else class="text-2xl font-semibold">{{ stats.totalRates }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 h-12 w-12 rounded-full">
                        <i class="pi pi-star text-purple-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-purple-500 text-sm">Tổng số đánh giá</div>
            </div>
        </div>
    </div>
</template>
