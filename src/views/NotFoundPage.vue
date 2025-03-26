<script setup>
import { useHead } from '@vueuse/head';

useHead({
  title: 'Trang không tồn tại - Luxury Hotel',
  meta: [
    {
      name: 'description',
      content: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. Vui lòng quay lại trang chủ Luxury Hotel.'
    }
  ]
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 px-4">
    <div class="max-w-md w-full text-center">
      <h1 class="text-6xl font-bold text-amber-600 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Không tìm thấy trang</h2>
      <p class="text-gray-600 mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
      <div class="space-y-2">
        <router-link to="/" class="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Quay lại trang chủ
        </router-link>
        <div class="mt-3">
          <router-link to="/contact" class="text-amber-600 hover:text-amber-700 underline">
            Liên hệ hỗ trợ
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
