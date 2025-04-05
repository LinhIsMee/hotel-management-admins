<script setup>
import { onMounted, ref } from 'vue';
import StatisticsService from '@/services/StatisticsService';

const loading = ref(true);
const comparisonData = ref({
    currentMonth: 0,
    previousMonth: 0,
    percentChange: 0
});

const fetchRevenueComparison = async () => {
    try {
        loading.value = true;
        const response = await StatisticsService.getRevenueComparison();
        comparisonData.value = response.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu so sánh doanh thu:', error);
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (value) => {
    if (value) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
    return '';
};

onMounted(() => {
    fetchRevenueComparison();
});
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">So sánh doanh thu</div>
        <div v-if="loading" class="flex justify-center items-center h-32">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Tháng hiện tại -->
            <div class="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div class="text-sm opacity-80 mb-2">Tháng hiện tại</div>
                <div class="text-2xl font-bold">{{ formatCurrency(comparisonData.currentMonth) }}</div>
                <div class="mt-2 flex justify-between items-center">
                    <span>Tổng doanh thu</span>
                    <i class="pi pi-calendar text-xl opacity-80"></i>
                </div>
            </div>

            <!-- Tháng trước -->
            <div class="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div class="text-sm opacity-80 mb-2">Tháng trước</div>
                <div class="text-2xl font-bold">{{ formatCurrency(comparisonData.previousMonth) }}</div>
                <div class="mt-2 flex justify-between items-center">
                    <span>Tổng doanh thu</span>
                    <i class="pi pi-calendar text-xl opacity-80"></i>
                </div>
            </div>

            <!-- Tỷ lệ thay đổi -->
            <div class="md:col-span-2 p-4 rounded-lg bg-white border border-gray-200 mt-4">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-lg font-semibold">Tỷ lệ thay đổi</div>
                        <div class="text-3xl font-bold" :class="{
                            'text-green-500': comparisonData.percentChange > 0,
                            'text-red-500': comparisonData.percentChange < 0,
                            'text-gray-500': comparisonData.percentChange === 0
                        }">
                            {{ comparisonData.percentChange > 0 ? '+' : '' }}{{ comparisonData.percentChange.toFixed(1) }}%
                        </div>
                    </div>
                    <div class="h-16 w-16 rounded-full flex items-center justify-center" :class="{
                        'bg-green-100': comparisonData.percentChange > 0,
                        'bg-red-100': comparisonData.percentChange < 0,
                        'bg-gray-100': comparisonData.percentChange === 0
                    }">
                        <i class="text-2xl" :class="{
                            'pi pi-arrow-up text-green-500': comparisonData.percentChange > 0,
                            'pi pi-arrow-down text-red-500': comparisonData.percentChange < 0,
                            'pi pi-minus text-gray-500': comparisonData.percentChange === 0
                        }"></i>
                    </div>
                </div>
                <div class="text-sm text-gray-500 mt-2">
                    So với tháng trước
                </div>
            </div>
        </div>
    </div>
</template>
