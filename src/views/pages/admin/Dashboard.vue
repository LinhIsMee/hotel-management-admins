<script setup>
import BestSellingWidget from '@/components/dashboard/BestSellingWidget.vue';
import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import BookingStatusWidget from '@/components/dashboard/BookingStatusWidget.vue';
import ReviewsWidget from '@/components/dashboard/ReviewsWidget.vue';
import RevenueComparisonWidget from '@/components/dashboard/RevenueComparisonWidget.vue';
</script>

<template>
  <div class="dashboard-container">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Tổng quan quản trị khách sạn</h1>
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 xl:col-span-8">
            <RevenueStreamWidget class="mb-8" />
            <BestSellingWidget />
        </div>
        <div class="col-span-12 xl:col-span-4">
            <RevenueComparisonWidget class="mb-8" />
            <BookingStatusWidget class="mb-8" />
            <ReviewsWidget class="mb-8" />
        </div>
    </div>
  </div>
</template>
