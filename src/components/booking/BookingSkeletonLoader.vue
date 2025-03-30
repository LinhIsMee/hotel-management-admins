<script setup>
import Skeleton from 'primevue/skeleton';
</script>

<template>
  <div class="booking-skeleton">
    <div class="grid grid-nogutter">
      <div v-for="i in 4" :key="i" class="col-12 md:col-6 lg:col-3 mb-3 pr-3">
        <Skeleton height="100px" />
      </div>
    </div>

    <div class="mt-4">
      <Skeleton height="60px" class="mb-3" />
      <div class="grid">
        <div v-for="i in 10" :key="i" class="col-12">
          <Skeleton height="40px" class="mb-2" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-skeleton {
  padding: 1rem;
}
</style>
