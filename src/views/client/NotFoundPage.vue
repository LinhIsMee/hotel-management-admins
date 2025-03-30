<template>
  <div class="not-found-page bg-gray-50 min-h-screen py-20">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div class="bg-white rounded-lg shadow-md p-10">
        <div class="mb-8">
          <div class="text-amber-500 text-9xl font-bold mb-4">404</div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Không tìm thấy trang</h1>
          <p class="text-gray-600 text-lg">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        </div>

        <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button icon="pi pi-home" label="Về trang chủ" @click="router.push('/')" class="bg-amber-600 hover:bg-amber-700" />
          <Button icon="pi pi-search" label="Tìm phòng" @click="router.push('/rooms')" class="p-button-outlined" />
        </div>

        <div class="mt-12">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Bạn cũng có thể xem:</h2>
          <div class="flex flex-wrap justify-center gap-4">
            <router-link to="/" class="text-amber-600 hover:text-amber-800 py-2 px-4 rounded-md hover:bg-amber-50 transition-colors">Trang chủ</router-link>
            <router-link to="/rooms" class="text-amber-600 hover:text-amber-800 py-2 px-4 rounded-md hover:bg-amber-50 transition-colors">Danh sách phòng</router-link>
            <router-link to="/services" class="text-amber-600 hover:text-amber-800 py-2 px-4 rounded-md hover:bg-amber-50 transition-colors">Dịch vụ</router-link>
            <router-link to="/about" class="text-amber-600 hover:text-amber-800 py-2 px-4 rounded-md hover:bg-amber-50 transition-colors">Giới thiệu</router-link>
            <router-link to="/contact" class="text-amber-600 hover:text-amber-800 py-2 px-4 rounded-md hover:bg-amber-50 transition-colors">Liên hệ</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useHead } from '@vueuse/head';

const router = useRouter();

// Thiết lập meta tags
useHead({
  title: 'Không tìm thấy trang - Luxury Hotel',
  meta: [
    {
      name: 'description',
      content: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.'
    }
  ]
});
</script>
