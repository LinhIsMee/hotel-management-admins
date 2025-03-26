<script setup>
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';
import nha_nghi_2 from '@/assets/images/nha-nghi-2.webp';
import nha_nghi_3 from '@/assets/images/nha-nghi-3.webp';
import { onMounted, ref } from 'vue';
import { useHead } from '@vueuse/head';

// Mock ảnh dịch vụ
const serviceImages = [
  "https://images.pexels.com/photos/3771110/pexels-photo-3771110.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Nhà hàng
  "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Spa
  "https://images.pexels.com/photos/260447/pexels-photo-260447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Hồ bơi
  "https://images.pexels.com/photos/4468171/pexels-photo-4468171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Phòng gym
  "https://images.pexels.com/photos/7045424/pexels-photo-7045424.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Đưa đón sân bay
  "https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"  // Phòng họp
];

const services = ref([]);
const loading = ref(true);

// Mảng chứa đường dẫn ảnh phòng có sẵn
const availableImages = [nha_nghi_1, nha_nghi_2, nha_nghi_3];

onMounted(async () => {
  try {
    // Tải dữ liệu dịch vụ
    const response = await fetch('/demo/data/services.json');
    const data = await response.json();

    // Gán ảnh cho các dịch vụ (ảnh online cho dịch vụ)
    services.value = data.data.slice(0, 6).map((service, index) => ({
      ...service,
      imageUrl: serviceImages[index % serviceImages.length]
    }));
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu dịch vụ:', error);
  } finally {
    loading.value = false;
  }
});

// Thiết lập meta tags cho trang dịch vụ
useHead({
  title: 'Dịch vụ - Luxury Hotel',
  meta: [
    {
      name: 'description',
      content: 'Khám phá các dịch vụ đẳng cấp 5 sao tại Luxury Hotel: Nhà hàng, Spa, Hồ bơi, Phòng gym, Đưa đón sân bay và nhiều dịch vụ khác. Trải nghiệm dịch vụ cao cấp ngay hôm nay.'
    }
  ]
})
</script>

<template>
  <div class="services-page min-h-screen">
    <!-- Hero Banner -->
    <div class="relative h-64 md:h-80 bg-gray-900">
      <img :src="nha_nghi_1" alt="Dịch vụ khách sạn" class="w-full h-full object-cover opacity-60" />
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Dịch vụ của chúng tôi</h1>
          <p class="text-xl text-white max-w-3xl mx-auto px-4">Trải nghiệm những dịch vụ chất lượng 5 sao tại Luxury Hotel</p>
        </div>
      </div>
    </div>

    <!-- Services List -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <div v-if="loading" class="flex justify-center py-10">
        <ProgressSpinner />
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="service in services" :key="service.id" class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <img :src="service.imageUrl" :alt="service.name" class="w-full h-48 object-cover" />
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-800 mb-2">{{ service.name }}</h3>
              <p class="text-gray-600 mb-4 line-clamp-3">{{ service.description }}</p>
              <div class="flex justify-between items-center">
                <span class="font-bold text-amber-600">
                  {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price) }}
                </span>
                <Button
                    label="Xem chi tiết"
                    class="p-button-outlined border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white font-medium"
                    aria-label="Xem chi tiết dịch vụ"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Extra Services -->
        <div class="mt-16">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Dịch vụ đặc biệt</h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-50 p-6 rounded-lg text-center">
              <div class="w-16 h-16 bg-amber-100 text-amber-600 mx-auto rounded-full flex items-center justify-center mb-4">
                <i class="pi pi-car text-2xl"></i>
              </div>
              <h3 class="text-xl font-semibold mb-2">Đưa đón sân bay</h3>
              <p class="text-gray-600">Dịch vụ đưa đón sang trọng, tiện nghi từ sân bay đến khách sạn và ngược lại</p>
            </div>

            <div class="bg-gray-50 p-6 rounded-lg text-center">
              <div class="w-16 h-16 bg-amber-100 text-amber-600 mx-auto rounded-full flex items-center justify-center mb-4">
                <i class="pi pi-heart text-2xl"></i>
              </div>
              <h3 class="text-xl font-semibold mb-2">Spa & Massage</h3>
              <p class="text-gray-600">Thư giãn với dịch vụ spa cao cấp và massage chuyên nghiệp</p>
            </div>

            <div class="bg-gray-50 p-6 rounded-lg text-center">
              <div class="w-16 h-16 bg-amber-100 text-amber-600 mx-auto rounded-full flex items-center justify-center mb-4">
                <i class="pi pi-calendar text-2xl"></i>
              </div>
              <h3 class="text-xl font-semibold mb-2">Tổ chức sự kiện</h3>
              <p class="text-gray-600">Tổ chức hội nghị, tiệc cưới và các sự kiện đặc biệt với dịch vụ chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="bg-amber-600 py-16">
      <div class="max-w-5xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Đặt phòng ngay hôm nay</h2>
        <p class="text-white text-lg mb-8">Trải nghiệm những dịch vụ tuyệt vời cùng kỳ nghỉ đáng nhớ tại Luxury Hotel</p>
        <Button
            label="Đặt phòng ngay"
            class="p-button-lg bg-white text-amber-700 hover:bg-gray-100 font-medium"
            aria-label="Đặt phòng khách sạn"
            @click="$router.push('/rooms')"
        />
      </div>
    </div>
  </div>
</template>
