<script setup>
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';
import nha_nghi_2 from '@/assets/images/nha-nghi-2.webp';
import nha_nghi_3 from '@/assets/images/nha-nghi-3.webp';
import { useHead } from '@vueuse/head';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Import PrimeVue components
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import MultiSelect from 'primevue/multiselect';
import DatePicker from 'primevue/datepicker';

// Import function để format date nếu chưa có
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const router = useRouter();
const route = useRoute();
const rooms = ref([]);
const loading = ref(true);

// Mảng chứa đường dẫn ảnh có sẵn
const availableImages = [nha_nghi_1, nha_nghi_2, nha_nghi_3];

// Bộ lọc
const filters = ref({
  priceRange: [0, 5000000],
  minPrice: 0,
  maxPrice: 5000000,
  checkIn: null,
  checkOut: null,
  adults: null,
  children: null,
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

// Các options cho dropdown người lớn và trẻ em
const adultOptions = [
  { label: '1 người', value: 1 },
  { label: '2 người', value: 2 },
  { label: '3 người', value: 3 },
  { label: '4 người', value: 4 },
  { label: '5 người', value: 5 }
];

const childrenOptions = [
  { label: 'Không có', value: 0 },
  { label: '1 trẻ em', value: 1 },
  { label: '2 trẻ em', value: 2 },
  { label: '3 trẻ em', value: 3 },
  { label: '4 trẻ em', value: 4 }
];

onMounted(async () => {
  // Lấy các query parameters
  if (route.query.checkIn) {
    filters.value.checkIn = new Date(route.query.checkIn);
  }

  if (route.query.checkOut) {
    filters.value.checkOut = new Date(route.query.checkOut);
  }

  if (route.query.adults) {
    filters.value.adults = parseInt(route.query.adults);
  }

  if (route.query.children) {
    filters.value.children = parseInt(route.query.children);
  }

  try {
    // Dữ liệu phòng mẫu thay vì gọi API
    const mockRoomData = [
      {
        id: 1,
        name: 'Phòng Deluxe Đơn',
        type: 'Phòng đơn',
        description: 'Phòng sang trọng với view thành phố, phù hợp cho doanh nhân và du khách đơn.',
        pricePerNight: 1200000,
        maxOccupancy: 1,
        size: 28,
        amenities: ['WiFi miễn phí', 'Điều hòa', 'TV màn hình phẳng', 'Minibar']
      },
      {
        id: 2,
        name: 'Phòng Superior Đôi',
        type: 'Phòng đôi',
        description: 'Phòng rộng rãi với giường đôi thoải mái, thích hợp cho cặp đôi.',
        pricePerNight: 1500000,
        maxOccupancy: 2,
        size: 32,
        amenities: ['WiFi miễn phí', 'Điều hòa', 'TV màn hình phẳng', 'Minibar', 'Két an toàn']
      },
      {
        id: 3,
        name: 'Phòng Gia Đình',
        type: 'Phòng gia đình',
        description: 'Phòng rộng rãi với 2 giường đôi, thích hợp cho gia đình có con nhỏ.',
        pricePerNight: 2500000,
        maxOccupancy: 4,
        size: 45,
        amenities: ['WiFi miễn phí', 'Điều hòa', 'TV màn hình phẳng', 'Minibar', 'Két an toàn', 'Bồn tắm']
      },
      {
        id: 4,
        name: 'Phòng VIP Suite',
        type: 'Phòng VIP',
        description: 'Phòng hạng sang với phòng khách riêng biệt, view toàn cảnh biển.',
        pricePerNight: 4000000,
        maxOccupancy: 2,
        size: 60,
        amenities: ['WiFi miễn phí', 'Điều hòa', 'TV màn hình phẳng', 'Minibar', 'Két an toàn', 'Bồn tắm', 'Ban công', 'View biển']
      },
      {
        id: 5,
        name: 'Căn Hộ Studio',
        type: 'Căn hộ studio',
        description: 'Căn hộ tiện nghi với bếp nhỏ, phù hợp cho lưu trú dài ngày.',
        pricePerNight: 3000000,
        maxOccupancy: 3,
        size: 50,
        amenities: ['WiFi miễn phí', 'Điều hòa', 'TV màn hình phẳng', 'Minibar', 'Két an toàn', 'Bếp nhỏ']
      }
    ];

    // Gán ảnh ngẫu nhiên cho mỗi phòng
    rooms.value = mockRoomData.map((room, index) => {
      // Tính giá theo thời điểm nếu có chọn ngày
      let finalPrice = room.pricePerNight;

      if (filters.value.checkIn && filters.value.checkOut) {
        const checkIn = new Date(filters.value.checkIn);
        const isWeekend = checkIn.getDay() === 0 || checkIn.getDay() === 6;

        // Tăng giá cuối tuần 20%
        if (isWeekend) {
          finalPrice = finalPrice * 1.2;
        }

        // Kiểm tra ngày lễ (có thể cần một danh sách ngày lễ)
        // Đây chỉ là ví dụ
        const specialDates = ['2023-12-25', '2024-01-01', '2024-04-30', '2024-05-01'];
        const dateStr = formatDate(checkIn);
        if (specialDates.includes(dateStr)) {
          finalPrice = finalPrice * 1.3; // Tăng giá 30% trong ngày lễ
        }
      }

      return {
        ...room,
        imageUrl: availableImages[index % 3], // Luân phiên 3 ảnh có sẵn
        finalPrice: finalPrice
      };
    });
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu phòng:', error);
  } finally {
    loading.value = false;
  }
});

// Đồng bộ giá trị min, max với priceRange
watch(
  () => filters.value.minPrice,
  (newValue) => {
    filters.value.priceRange[0] = newValue;
  }
);

watch(
  () => filters.value.maxPrice,
  (newValue) => {
    filters.value.priceRange[1] = newValue;
  }
);

watch(
  () => filters.value.priceRange,
  (newValue) => {
    filters.value.minPrice = newValue[0];
    filters.value.maxPrice = newValue[1];
  }
);

// Cập nhật tìm kiếm
const updateSearch = () => {
  // Cập nhật query parameters
  router.push({
    path: '/rooms',
    query: {
      checkIn: filters.value.checkIn ? formatDate(filters.value.checkIn) : undefined,
      checkOut: filters.value.checkOut ? formatDate(filters.value.checkOut) : undefined,
      adults: filters.value.adults || undefined,
      children: filters.value.children || undefined
    }
  });

  // Tải lại dữ liệu - tạm thời comment lại vì chưa định nghĩa hàm
  // loadRoomData();
};

// Lọc phòng theo các tiêu chí
const filteredRooms = computed(() => {
  return rooms.value.filter(room => {
    // Lọc theo giá
    if (room.finalPrice < filters.value.priceRange[0] || room.finalPrice > filters.value.priceRange[1]) {
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
  router.push(`/room/${roomId}`);
};

const resetFilters = () => {
  filters.value = {
    priceRange: [0, 5000000],
    minPrice: 0,
    maxPrice: 5000000,
    checkIn: null,
    checkOut: null,
    adults: null,
    children: null,
    occupancy: [],
    roomType: [],
    amenities: []
  };
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
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

      <!-- Bộ lọc tìm kiếm nhanh -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Ngày nhận phòng</label>
            <DatePicker v-model="filters.checkIn" placeholder="Chọn ngày" class="w-full" showIcon />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">Ngày trả phòng</label>
            <DatePicker v-model="filters.checkOut" placeholder="Chọn ngày" class="w-full" showIcon />
          </div>
          <div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-gray-700 font-medium mb-2">Người lớn</label>
                <Select v-model="filters.adults" :options="adultOptions" optionLabel="label" optionValue="value" placeholder="Chọn" class="w-full" />
              </div>
              <div>
                <label class="block text-gray-700 font-medium mb-2">Trẻ em</label>
                <Select v-model="filters.children" :options="childrenOptions" optionLabel="label" optionValue="value" placeholder="Chọn" class="w-full" />
              </div>
            </div>
          </div>
          <div class="flex items-end">
            <Button label="Tìm kiếm" icon="pi pi-search" class="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium" @click="updateSearch" />
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Filters -->
        <div class="w-full lg:w-1/4">
          <div class="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 class="text-xl font-semibold mb-6">Bộ lọc nâng cao</h2>

            <!-- Khoảng giá -->
            <div class="mb-6">
              <h3 class="font-medium mb-4">Khoảng giá</h3>
              <div class="flex items-center space-x-2 mb-3">
                <InputNumber v-model="filters.minPrice" placeholder="Từ" mode="currency" currency="VND" locale="vi-VN" class="w-full" :minFractionDigits="0" :maxFractionDigits="0" />
                <span>-</span>
                <InputNumber v-model="filters.maxPrice" placeholder="Đến" mode="currency" currency="VND" locale="vi-VN" class="w-full" :minFractionDigits="0" :maxFractionDigits="0" />
              </div>
              <Slider v-model="filters.priceRange" range class="mt-4 mb-2" :max="5000000" :step="100000" />
              <div class="flex justify-between text-sm text-gray-500">
                <span>{{ formatCurrency(0) }}</span>
                <span>{{ formatCurrency(5000000) }}</span>
              </div>
            </div>

            <!-- Số người -->
            <div class="mb-6">
              <h3 class="font-medium mb-4">Số người</h3>
              <MultiSelect
                v-model="filters.occupancy"
                :options="occupancyOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Chọn số người"
                class="w-full"
              />
            </div>

            <!-- Loại phòng -->
            <div class="mb-6">
              <h3 class="font-medium mb-4">Loại phòng</h3>
              <div class="flex flex-col space-y-2">
                <div v-for="type in roomTypes" :key="type" class="flex items-center">
                  <Checkbox :inputId="type" v-model="filters.roomType" :value="type" />
                  <label :for="type" class="ml-2 text-gray-700">{{ type }}</label>
                </div>
              </div>
            </div>

            <!-- Tiện nghi -->
            <div class="mb-6">
              <h3 class="font-medium mb-4">Tiện nghi</h3>
              <div class="flex flex-col space-y-2">
                <div v-for="amenity in amenitiesList" :key="amenity" class="flex items-center">
                  <Checkbox :inputId="amenity" v-model="filters.amenities" :value="amenity" />
                  <label :for="amenity" class="ml-2 text-gray-700">{{ amenity }}</label>
                </div>
              </div>
            </div>

            <Button label="Đặt lại bộ lọc" class="w-full p-button-outlined mt-4" @click="resetFilters" />
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
                  <div class="flex flex-col md:flex-row justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-gray-800 mb-2 md:mb-0">{{ room.name }}</h3>
                    <span class="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {{ formatCurrency(room.finalPrice) }}/đêm
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

                  <div class="card-footer flex flex-col md:flex-row justify-between items-center mt-4">
                    <span class="text-xl font-bold text-amber-600 mb-3 md:mb-0">{{ formatCurrency(room.finalPrice) }}<span class="text-sm text-gray-500">/đêm</span></span>
                    <router-link
                      :to="`/room/${room.id}`"
                      class="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded transition duration-300 inline-block"
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

<style scoped>
:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-inputnumber-input) {
  width: 100%;
  padding-right: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}

:deep(.p-slider) {
  width: 100%;
}

:deep(.p-slider .p-slider-range) {
  background: #d97706; /* amber-600 */
}

:deep(.p-slider .p-slider-handle) {
  border-color: #d97706; /* amber-600 */
  background: #d97706; /* amber-600 */
}

:deep(.p-slider .p-slider-handle:hover) {
  background: #b45309; /* amber-700 */
  border-color: #b45309; /* amber-700 */
}

:deep(.p-slider:not(.p-disabled) .p-slider-handle:focus) {
  box-shadow: 0 0 0 0.2rem rgba(217, 119, 6, 0.2); /* amber-600 with opacity */
}
</style>
