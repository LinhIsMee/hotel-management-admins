<script setup>
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';
import nha_nghi_2 from '@/assets/images/nha-nghi-2.webp';
import nha_nghi_3 from '@/assets/images/nha-nghi-3.webp';
import { useHead } from '@vueuse/head';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const rooms = ref([]);
const loading = ref(true);

// Mảng chứa đường dẫn ảnh có sẵn
const availableImages = [nha_nghi_1, nha_nghi_2, nha_nghi_3];

// Bộ lọc
const filters = ref({
  price: [0, 5000000],
  occupancy: [],
  roomType: [],
  amenities: []
});

// Danh sách các tiện nghi
const amenitiesList = ref([
  'WiFi miễn phí',
  'Điều hòa',
  'TV màn hình phẳng',
  'Minibar',
  'Két an toàn',
  'Bồn tắm',
  'Ban công',
  'View biển',
  'Bếp nhỏ'
]);

// Danh sách loại phòng
const roomTypes = ref([
  'Phòng đơn',
  'Phòng đôi',
  'Phòng gia đình',
  'Phòng VIP',
  'Căn hộ studio'
]);

// Danh sách số người
const occupancyOptions = ref([
  { label: '1 người', value: 1 },
  { label: '2 người', value: 2 },
  { label: '3 người', value: 3 },
  { label: '4+ người', value: 4 }
]);

onMounted(async () => {
  try {
    const response = await fetch('/demo/data/room-types.json');
    const data = await response.json();

    // Gán ảnh ngẫu nhiên cho mỗi phòng
    rooms.value = data.data.map((room, index) => {
      return {
        ...room,
        imageUrl: availableImages[index % 3] // Luân phiên 3 ảnh có sẵn
      };
    });
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu phòng:', error);
  } finally {
    loading.value = false;
  }
});

// Lọc phòng theo các tiêu chí
const filteredRooms = computed(() => {
  return rooms.value.filter(room => {
    // Lọc theo giá
    if (room.pricePerNight < filters.value.price[0] || room.pricePerNight > filters.value.price[1]) {
      return false;
    }

    // Lọc theo số người
    if (filters.value.occupancy.length > 0 && !filters.value.occupancy.includes(Math.min(room.maxOccupancy, 4))) {
      return false;
    }

    // Lọc theo loại phòng
    if (filters.value.roomType.length > 0 && !filters.value.roomType.includes(room.type)) {
      return false;
    }

    // Lọc theo tiện nghi
    if (filters.value.amenities.length > 0) {
      for (const amenity of filters.value.amenities) {
        if (!room.amenities.includes(amenity)) {
          return false;
        }
      }
    }

    return true;
  });
});

const navigateToDetail = (roomId) => {
  router.push(`/rooms/${roomId}`);
};

const resetFilters = () => {
  filters.value = {
    price: [0, 5000000],
    occupancy: [],
    roomType: [],
    amenities: []
  };
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Thiết lập meta tags cho trang danh sách phòng
useHead({
  title: 'Danh sách phòng - Luxury Hotel',
  meta: [
    {
      name: 'description',
      content: 'Khám phá danh sách phòng đa dạng tại Luxury Hotel với nhiều loại phòng từ Standard, Deluxe đến Suite. Đặt phòng trực tuyến với giá tốt nhất và nhiều ưu đãi đặc biệt.'
    }
  ]
})
</script>

<template>
  <div class="room-list-page bg-gray-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Danh sách phòng</h1>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Filters -->
        <div class="w-full lg:w-1/4">
          <div class="bg-white p-4 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Bộ lọc tìm kiếm</h2>

            <!-- Price Range -->
            <div class="mb-6">
              <h3 class="font-medium mb-2">Giá phòng</h3>
              <Slider v-model="filters.price" range :min="0" :max="5000000" :step="100000" class="mt-4" />
              <div class="flex justify-between mt-2">
                <span>{{ formatCurrency(filters.price[0]) }}</span>
                <span>{{ formatCurrency(filters.price[1]) }}</span>
              </div>
            </div>

            <!-- Occupancy -->
            <div class="mb-6">
              <h3 class="font-medium mb-2">Số người</h3>
              <div class="flex flex-wrap gap-2">
                <MultiSelect
                  v-model="filters.occupancy"
                  :options="occupancyOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Chọn số người"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Room Type -->
            <div class="mb-6">
              <h3 class="font-medium mb-2">Loại phòng</h3>
              <div class="flex flex-col space-y-2">
                <div v-for="type in roomTypes" :key="type" class="flex items-center">
                  <Checkbox :inputId="type" v-model="filters.roomType" :value="type" />
                  <label :for="type" class="ml-2">{{ type }}</label>
                </div>
              </div>
            </div>

            <!-- Amenities -->
            <div class="mb-6">
              <h3 class="font-medium mb-2">Tiện nghi</h3>
              <div class="flex flex-col space-y-2">
                <div v-for="amenity in amenitiesList" :key="amenity" class="flex items-center">
                  <Checkbox :inputId="amenity" v-model="filters.amenities" :value="amenity" />
                  <label :for="amenity" class="ml-2">{{ amenity }}</label>
                </div>
              </div>
            </div>

            <Button label="Đặt lại bộ lọc" class="w-full p-button-outlined" @click="resetFilters" />
          </div>
        </div>

        <!-- Room List -->
        <div class="w-full lg:w-3/4">
          <div v-if="loading" class="flex justify-center py-10">
            <ProgressSpinner />
          </div>

          <div v-else-if="filteredRooms.length === 0" class="bg-white p-10 rounded-lg shadow-md text-center">
            <i class="pi pi-search text-5xl text-gray-400 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy phòng phù hợp</h3>
            <p class="text-gray-600 mb-4">Vui lòng thử điều chỉnh bộ lọc của bạn</p>
            <Button label="Đặt lại bộ lọc" @click="resetFilters" />
          </div>

          <div v-else class="grid grid-cols-1 gap-6">
            <div v-for="room in filteredRooms" :key="room.id"
                 class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <div class="flex flex-col md:flex-row">
                <div class="md:w-1/3">
                  <img :src="room.imageUrl" :alt="room.name" class="w-full h-full object-cover" />
                </div>
                <div class="md:w-2/3 p-6">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="text-xl font-bold text-gray-800">{{ room.name }}</h3>
                    <span class="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {{ formatCurrency(room.pricePerNight) }}/đêm
                    </span>
                  </div>

                  <p class="text-gray-600 mb-4">{{ room.description }}</p>

                  <div class="flex flex-wrap gap-2 mb-4">
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <i class="pi pi-users mr-1"></i> {{ room.maxOccupancy }} người
                    </span>
                    <span v-for="(amenity, index) in room.amenities.slice(0, 3)" :key="index"
                          class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {{ amenity }}
                    </span>
                    <span v-if="room.amenities.length > 3" class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      +{{ room.amenities.length - 3 }}
                    </span>
                  </div>

                  <div class="card-footer flex justify-between items-center mt-4">
                    <span class="text-xl font-bold text-amber-600">{{ formatCurrency(room.pricePerNight) }}<span class="text-sm text-gray-500">/đêm</span></span>
                    <router-link
                      :to="`/room/${room.id}`"
                      class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded transition duration-300"
                    >
                      Xem chi tiết
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
