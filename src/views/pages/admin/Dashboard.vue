<script setup>
import BestSellingWidget from '@/components/dashboard/BestSellingWidget.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
import RecentSalesWidget from '@/components/dashboard/RecentSalesWidget.vue';
import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import BookingStatusWidget from '@/components/dashboard/BookingStatusWidget.vue';
import ReviewsWidget from '@/components/dashboard/ReviewsWidget.vue';
import RevenueComparisonWidget from '@/components/dashboard/RevenueComparisonWidget.vue';
</script>

<template>
  <div class="dashboard-container">
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 xl:col-span-8">
            <RevenueStreamWidget class="mb-8" />
            <RecentSalesWidget />
        </div>
        <div class="col-span-12 xl:col-span-4">
            <RevenueComparisonWidget class="mb-8" />
            <BookingStatusWidget class="mb-8" />
            <ReviewsWidget class="mb-8" />
        </div>
        <div class="col-span-12">
            <BestSellingWidget />
        </div>
    </div>
  </div>
</template>
