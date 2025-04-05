<script setup>
import { onMounted, ref } from 'vue';
import StatisticsService from '@/services/StatisticsService';

const loading = ref(true);
const reviews = ref({});
const totalReviews = ref(0);
const averageRating = ref(0);

const fetchReviewStats = async () => {
    try {
        loading.value = true;
        const response = await StatisticsService.getReviewsByRating();
        reviews.value = response.data || {};

        // Tính tổng số đánh giá
        totalReviews.value = Object.values(reviews.value).reduce((sum, count) => sum + count, 0);

        // Tính điểm đánh giá trung bình
        if (totalReviews.value > 0) {
            let sum = 0;
            for (let i = 1; i <= 5; i++) {
                sum += i * (reviews.value[i] || 0);
            }
            averageRating.value = sum / totalReviews.value;
        } else {
            averageRating.value = 0;
        }
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đánh giá:', error);
        reviews.value = {};
        totalReviews.value = 0;
        averageRating.value = 0;
    } finally {
        loading.value = false;
    }
};

const getRatingPercentage = (rating) => {
    if (!totalReviews.value) return 0;
    return ((reviews.value[rating] || 0) / totalReviews.value) * 100;
};

onMounted(() => {
    fetchReviewStats();
});
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Đánh giá của khách hàng</div>
        <div v-if="loading" class="flex justify-center items-center py-6">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
        </div>
        <div v-else-if="!totalReviews" class="flex justify-center items-center py-6 text-gray-500">
            Chưa có đánh giá nào
        </div>
        <div v-else>
            <!-- Tổng quan đánh giá -->
            <div class="flex justify-between items-center mb-6">
                <div class="text-center">
                    <div class="text-4xl font-bold text-amber-500">{{ averageRating.toFixed(1) }}</div>
                    <div class="text-xs text-gray-500 mt-1">Trung bình</div>
                </div>
                <div class="text-center">
                    <div class="flex items-center">
                        <i class="pi pi-star-fill text-amber-500 mr-1"></i>
                        <i class="pi pi-star-fill text-amber-500 mr-1"></i>
                        <i class="pi pi-star-fill text-amber-500 mr-1"></i>
                        <i class="pi pi-star-fill text-amber-500 mr-1"></i>
                        <i class="pi pi-star-fill text-amber-500"></i>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">{{ totalReviews }} đánh giá</div>
                </div>
            </div>

            <!-- Chi tiết đánh giá theo số sao -->
            <div class="space-y-3">
                <div v-for="i in 5" :key="i" class="flex items-center">
                    <div class="w-24 flex justify-between items-center pr-4">
                        <span class="text-sm">{{ 6-i }} sao</span>
                        <span class="text-xs text-gray-500">{{ reviews[6-i] || 0 }}</span>
                    </div>
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                        <div class="bg-amber-500 h-2 rounded-full" :style="{ width: `${getRatingPercentage(6-i)}%` }"></div>
                    </div>
                    <span class="text-xs text-gray-500 w-12 text-right pl-2">{{ getRatingPercentage(6-i).toFixed(1) }}%</span>
                </div>
            </div>
        </div>
    </div>
</template>
