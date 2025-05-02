<script setup>
import { useRoomManagement } from '@/composables/useRoomManagement';
import { useHead } from '@vueuse/head';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import GuestSelector from '@/components/client/GuestSelector.vue';

// Import PrimeVue components
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import MultiSelect from 'primevue/multiselect';
import DatePicker from 'primevue/datepicker';
import Toast from 'primevue/toast';
import Select from 'primevue/select';
import Dropdown from 'primevue/dropdown';

const router = useRouter();
const route = useRoute();
const {
    rooms,
    loading,
    fetchAllRooms,
    fetchAllRoomTypes,
    formatCurrency,
    formatDate,
    calculateTotalPrice
} = useRoomManagement();

const toast = useToast();

// API endpoint
const API_BASE_URL = 'http://127.0.0.1:9000/api/v1';

// Bộ lọc
const filters = ref({
  priceRange: [0, 5000000],
  minPrice: 0,
  maxPrice: 5000000,
  checkIn: null,
  checkOut: null,
  adults: 1,
  children: 0,
  childrenAges: [], // Mảng lưu tuổi của từng trẻ em
  occupancy: [],
  roomType: [],
  amenities: []
});

// Danh sách các tiện nghi (sẽ được cập nhật từ API)
const amenitiesList = ref([]);

// Danh sách loại phòng
const roomTypes = ref([]);

// Danh sách số người
const occupancyOptions = ref([
  { label: '1 người', value: 1 },
  { label: '2 người', value: 2 },
  { label: '3 người', value: 3 },
  { label: '4+ người', value: 4 }
]);

// Tạo mảng các độ tuổi từ 0-17
const ageOptions = computed(() => {
  return Array.from({ length: 18 }, (_, i) => ({
    label: `${i} tuổi`,
    value: i
  }));
});

// Hiển thị dropdown chọn khách
const showGuestSelect = ref(false);

// Lấy ngày hiện tại (đầu ngày)
const today = computed(() => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
});

// Ngày tối thiểu cho ngày trả phòng (ngày sau ngày nhận phòng)
const minCheckOutDate = computed(() => {
  if (!filters.value.checkIn) return today.value;
  const nextDay = new Date(filters.value.checkIn);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
});

// Xử lý khi ngày nhận phòng thay đổi
const handleCheckInChange = (value) => {
  // Nếu ngày trả phòng nhỏ hơn ngày nhận phòng + 1, reset ngày trả phòng
  if (filters.value.checkOut && filters.value.checkOut <= value) {
    filters.value.checkOut = null;
  }
};

// Lấy danh sách phòng có sẵn theo ngày
const fetchAvailableRoomsByDate = async (checkIn, checkOut) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/rooms/available?checkInDate=${formatDate(checkIn)}&checkOutDate=${formatDate(checkOut)}`
    );
    if (!response.ok) throw new Error('Không thể tải dữ liệu phòng');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi tải danh sách phòng:', error);
    return [];
  }
};

// Kiểm tra xem phòng có được đặt trong khoảng thời gian không
const isRoomBookedInRange = (room, startDate, endDate) => {
  if (!room.bookingPeriods || !startDate || !endDate) return false;

  const start = new Date(startDate);
  const end = new Date(endDate);

  return room.bookingPeriods.some(period => {
    const bookingStart = new Date(period.checkInDate);
    const bookingEnd = new Date(period.checkOutDate);
    return (
      (bookingStart <= end && bookingEnd >= start) ||
      (start <= bookingEnd && end >= bookingStart)
    );
  });
};

// Lấy thông tin đặt phòng sắp tới
const getUpcomingBookings = (room) => {
  if (!room.bookingPeriods) return [];

  const today = new Date();
  return room.bookingPeriods
    .filter(period => new Date(period.checkOutDate) >= today)
    .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate))
    .slice(0, 3); // Chỉ lấy 3 booking gần nhất
};

// Hàm lấy đánh giá cho một phòng
async function fetchRoomRatings(roomId) {
    try {
        const response = await fetch(`http://127.0.0.1:9000/api/ratings/room/${roomId}`);
        if (!response.ok) throw new Error('Không thể tải đánh giá');
        return await response.json();
    } catch (error) {
        console.error(`Lỗi khi lấy đánh giá cho phòng ${roomId}:`, error);
        return [];
    }
}

// Hàm lấy đánh giá theo số phòng
async function fetchRoomReviewsByNumber(roomNumber) {
    try {
        const response = await fetch(`http://127.0.0.1:9000/api/v1/reviews/room/number/${roomNumber}`);
        if (!response.ok) throw new Error('Không thể tải đánh giá');
        return await response.json();
    } catch (error) {
        console.error(`Lỗi khi lấy đánh giá cho phòng số ${roomNumber}:`, error);
        return [];
    }
}

// Hàm chuyển đổi điểm số thành text
function getRatingText(rating) {
    if (!rating) return 'Chưa đánh giá';
    if (rating >= 4.5) return 'Xuất sắc';
    if (rating >= 4.0) return 'Rất tốt';
    if (rating >= 3.5) return 'Tốt';
    if (rating >= 3.0) return 'Hài lòng';
    return 'Bình thường';
}

// Tải dữ liệu phòng dựa trên bộ lọc
const loadRoomData = async () => {
  try {
    loading.value = true;
    let loadedRooms = [];

    // Nếu có ngày check-in và check-out, tìm phòng trống trong khoảng thời gian
    if (filters.value.checkIn && filters.value.checkOut) {
      loadedRooms = await fetchAvailableRoomsByDate(
        filters.value.checkIn,
        filters.value.checkOut
      );
    } else {
      // Mặc định lấy tất cả phòng
      loadedRooms = await fetchAllRooms();
    }

    // Lấy đánh giá và tính giá cho mỗi phòng
    const roomsWithRatings = await Promise.all(loadedRooms.map(async (room) => {
      // Lấy đánh giá theo ID
      const ratings = await fetchRoomRatings(room.id);

      // Lấy đánh giá theo số phòng
      const reviews = await fetchRoomReviewsByNumber(room.roomNumber);

      // Tính điểm trung bình từ cả reviews và ratings
      const allRatings = [...ratings, ...reviews.map(review => ({ stars: review.rating || review.stars || 0 }))];
      const averageRating = allRatings.length > 0
        ? allRatings.reduce((acc, curr) => acc + (curr.stars || curr.rating || 0), 0) / allRatings.length
        : 0;

      // Tính giá theo thời gian nếu có chọn ngày
      const finalPrice = filters.value.checkIn && filters.value.checkOut
        ? calculateTotalPrice(room, filters.value.checkIn, filters.value.checkOut)
        : room.pricePerNight;

      return {
        ...room,
        ratings: ratings,
        reviews: reviews,
        averageRating: averageRating,
        totalReviews: allRatings.length,
        finalPrice: finalPrice,
        upcomingBookings: getUpcomingBookings(room)
      };
    }));

    rooms.value = roomsWithRatings;
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu phòng:', error);
    toast.add({
      severity: 'error',
      summary: 'Không thể tải danh sách phòng',
      detail: 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.',
      life: 5000
    });
    rooms.value = [];
  } finally {
    loading.value = false;
  }
};

// Tải danh sách loại phòng
const loadRoomTypes = async () => {
  try {
    const types = await fetchAllRoomTypes();
    roomTypes.value = types.map(type => type.name);
  } catch (error) {
    console.error('Lỗi khi tải danh sách loại phòng:', error);
    toast.add({
      severity: 'error',
      summary: 'Không thể tải danh sách loại phòng',
      detail: 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.',
      life: 5000
    });
  }
};

// Lọc phòng theo các tiêu chí
const filteredRooms = computed(() => {
  return rooms.value.filter(room => {
    // Debug log để xem dữ liệu phòng
    console.log('Đang kiểm tra phòng:', {
      roomNumber: room.roomNumber,
      amenities: room.amenities || []
    });

    // Lọc theo giá
    if (room.pricePerNight < filters.value.priceRange[0] || room.pricePerNight > filters.value.priceRange[1]) {
      return false;
    }

    // Lọc theo loại phòng
    if (filters.value.roomType.length > 0 && !filters.value.roomType.includes(room.roomTypeName)) {
      return false;
    }

    // Lọc theo số người
    if (filters.value.occupancy.length > 0 && !filters.value.occupancy.some(occ => room.maxOccupancy >= occ)) {
      return false;
    }

    // Lọc theo tiện nghi - Hiển thị phòng có ít nhất 1 tiện nghi được chọn
    if (filters.value.amenities.length > 0 && room.amenities) {
      // Chuyển tất cả về chữ thường để so sánh
      const roomAmenities = room.amenities.map(a => a.toLowerCase());
      const selectedAmenities = filters.value.amenities.map(a => a.toLowerCase());

      // Kiểm tra xem phòng có ít nhất 1 tiện nghi được chọn không
      const hasAnySelectedAmenity = selectedAmenities.some(selectedAmenity =>
        roomAmenities.some(roomAmenity =>
          roomAmenity.includes(selectedAmenity) || selectedAmenity.includes(roomAmenity)
        )
      );

      // Debug log
      console.log(`Phòng ${room.roomNumber}:`, {
        'Tiện nghi phòng có': roomAmenities,
        'Tiện nghi đã chọn': selectedAmenities,
        'Có ít nhất 1 tiện nghi': hasAnySelectedAmenity
      });

      return hasAnySelectedAmenity;
    }

    return true;
  });
});

// Thêm watch để debug khi người dùng thay đổi lựa chọn tiện nghi
watch(() => filters.value.amenities, (newAmenities) => {
  console.log('Danh sách tiện nghi đã chọn:', newAmenities);
}, { deep: true });

// Cập nhật hàm fetchAmenities để chuẩn hóa tên tiện nghi
const fetchAmenities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/rooms`);
    if (!response.ok) throw new Error('Không thể tải dữ liệu phòng');
    const rooms = await response.json();

    // Lấy tất cả tiện nghi và chuẩn hóa tên
    const allAmenities = new Set();
    rooms.forEach(room => {
      if (room.amenities && Array.isArray(room.amenities)) {
        room.amenities.forEach(amenity => {
          // Chuẩn hóa tên tiện nghi
          const normalizedAmenity = amenity.trim();
          if (normalizedAmenity) {
            allAmenities.add(normalizedAmenity);
          }
        });
      }
    });

    // Sắp xếp theo alphabet
    amenitiesList.value = Array.from(allAmenities).sort();
    console.log('Danh sách tiện nghi đã tải:', amenitiesList.value);
  } catch (error) {
    console.error('Lỗi khi tải danh sách tiện nghi:', error);
    toast.add({
      severity: 'error',
      summary: 'Không thể tải danh sách tiện nghi',
      detail: 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.',
      life: 5000
    });
  }
};

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

  // Xử lý danh sách tuổi trẻ em từ query parameter
  if (route.query.childrenAges) {
    filters.value.childrenAges = route.query.childrenAges.split(',').map(age => parseInt(age));
  } else {
    // Khởi tạo mảng trống nếu không có dữ liệu
    filters.value.childrenAges = Array(filters.value.children).fill(0);
  }

  // Tải danh sách tiện nghi từ API
  await fetchAmenities();

  // Tải dữ liệu loại phòng
  await loadRoomTypes();

  // Tải dữ liệu phòng
  await loadRoomData();

  // Click outside để đóng dropdown
  document.addEventListener('click', (e) => {
    const button = document.querySelector('.guest-select-button');
    if (showGuestSelect.value && button &&
        !button.contains(e.target) &&
        !e.target.closest('.guest-selector') &&
        !e.target.closest('.p-dropdown-panel, .p-datepicker-panel, .p-multiselect-panel')) {
      showGuestSelect.value = false;
    }
  });
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
      children: filters.value.children || undefined,
      childrenAges: filters.value.childrenAges.length > 0 ? filters.value.childrenAges.join(',') : undefined
    }
  });

  // Tải lại dữ liệu phòng
  loadRoomData();
};

const navigateToDetail = (roomId) => {
  router.push({
    path: `/room/${roomId}`,
    query: {
      checkIn: filters.value.checkIn ? formatDate(filters.value.checkIn) : undefined,
      checkOut: filters.value.checkOut ? formatDate(filters.value.checkOut) : undefined,
      adults: filters.value.adults || undefined,
      children: filters.value.children || undefined,
      childrenAges: filters.value.childrenAges.length > 0 ? filters.value.childrenAges.join(',') : undefined
    }
  });
};

const resetFilters = () => {
  filters.value = {
    priceRange: [0, 5000000],
    minPrice: 0,
    maxPrice: 5000000,
    checkIn: null,
    checkOut: null,
    adults: 1,
    children: 0,
    childrenAges: [],
    occupancy: [],
    roomType: [],
    amenities: []
  };
};

useHead({
  title: 'Danh sách phòng',
  meta: [
    { name: 'description', content: 'Danh sách phòng tại khách sạn của chúng tôi' }
  ]
});
</script>

<template>
  <Toast position="top-right" />
  <div class="room-list-page bg-gray-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Danh sách phòng</h1>

      <!-- Bộ lọc tìm kiếm nhanh -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Ngày nhận phòng</label>
            <DatePicker
              v-model="filters.checkIn"
              placeholder="Chọn ngày"
              class="w-full"
              showIcon
              :minDate="today"
              @change="handleCheckInChange"
              :showClear="true"
            />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">Ngày trả phòng</label>
            <DatePicker
              v-model="filters.checkOut"
              placeholder="Chọn ngày"
              class="w-full"
              showIcon
              :minDate="minCheckOutDate"
              :disabled="!filters.checkIn"
              :showClear="true"
            />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">Khách và trẻ em</label>
            <div class="relative overflow-visible" style="z-index: 100;">
              <button @click="showGuestSelect = !showGuestSelect"
                class="guest-select-button w-full bg-white border rounded-lg px-4 py-2 text-left flex items-center justify-between hover:border-blue-500 focus:outline-none focus:border-blue-500">
                <span class="text-gray-700">
                  {{ filters.adults }} người lớn{{ filters.children ? `, ${filters.children} trẻ em` : '' }}
                </span>
                <i class="pi pi-chevron-down text-gray-400"></i>
              </button>

              <!-- GuestSelector hiển thị ở giữa màn hình như một modal khi trên mobile -->
              <div v-if="showGuestSelect"
                   class="absolute left-0 top-full mt-2 z-50 md:block hidden">
                <GuestSelector
                  v-model:adults="filters.adults"
                  v-model:children="filters.children"
                  v-model:childrenAges="filters.childrenAges"
                  :maxOccupancy="5"
                  position="bottom"
                  @close="showGuestSelect = false; updateSearch()"
                />
              </div>

              <!-- Hiển thị dạng modal trên mobile -->
              <div v-if="showGuestSelect"
                   class="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:hidden">
                <div class="fixed inset-0 bg-black bg-opacity-30" @click="showGuestSelect = false"></div>
                <div class="relative z-[1001]">
                  <GuestSelector
                    v-model:adults="filters.adults"
                    v-model:children="filters.children"
                    v-model:childrenAges="filters.childrenAges"
                    :maxOccupancy="5"
                    @close="showGuestSelect = false; updateSearch()"
                  />
                </div>
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
          <div v-if="loading.rooms" class="flex justify-center py-10">
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
                  <img
                    :src="room.images && room.images.length > 0 ? room.images[0] : (room.imageUrl || 'https://via.placeholder.com/400x300?text=Không+có+ảnh')"
                    :alt="room.roomTypeName + ' - ' + room.roomNumber"
                    class="w-full h-full object-cover"
                    @error="$event.target.src='https://via.placeholder.com/400x300?text=Không+có+ảnh'"
                  />
                </div>
                <div class="md:w-2/3 p-6">
                  <div class="flex flex-col md:flex-row justify-between items-start mb-4">
                    <div class="flex-grow">
                      <h3 class="text-xl font-bold text-gray-800 mb-1">{{ room.roomTypeName }} - {{ room.roomNumber }}</h3>

                    </div>
                    <!-- Rating box bên phải -->
                    <div class="flex flex-col items-end gap-1">
                      <div class="flex items-center gap-2">
                        <span class="font-medium">
                          {{ getRatingText(room.averageRating) }}
                        </span>
                        <span class="bg-blue-600 text-white px-2 py-0.5 rounded text-sm">
                          {{ room.averageRating ? room.averageRating.toFixed(1) : '0' }}
                        </span>
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ room.totalReviews ? `${room.totalReviews} đánh giá` : 'Chưa có đánh giá' }}
                      </div>
                    </div>
                  </div>

                  <p class="text-gray-600 mb-4">{{ room.specialFeatures || room.notes || `${room.roomTypeName} với đầy đủ tiện nghi hiện đại` }}</p>

                  <div class="flex flex-wrap gap-2 mb-4">
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <i class="pi pi-users mr-1"></i> {{ room.maxOccupancy }} người
                    </span>
                    <span v-for="(amenity, index) in room.amenities.slice(0, 3)" :key="index"
                          class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {{ amenity }}
                    </span>
                    <span v-if="room.amenities && room.amenities.length > 3" class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      +{{ room.amenities.length - 3 }}
                    </span>
                  </div>

                  <!-- Thông tin đặt phòng -->
                  <div v-if="room.upcomingBookings && room.upcomingBookings.length > 0" class="mt-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">Lịch đặt phòng sắp tới:</h4>
                    <div class="space-y-2">
                      <div v-for="(booking, index) in room.upcomingBookings" :key="index"
                           class="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <i class="pi pi-calendar mr-2"></i>
                        {{ formatDate(booking.checkInDate) }} - {{ formatDate(booking.checkOutDate) }}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 mt-4">
                    <span v-if="filters.checkIn && filters.checkOut && isRoomBookedInRange(room, filters.checkIn, filters.checkOut)"
                          class="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      Đã được đặt trong thời gian này
                    </span>
                  </div>

                  <div class="card-footer flex flex-col md:flex-row justify-between items-center mt-4">
                    <span class="text-xl font-bold text-amber-600 mb-3 md:mb-0">
                      {{ formatCurrency(room.pricePerNight) }}<span class="text-sm text-gray-500">/đêm</span>
                    </span>
                    <button
                      @click="navigateToDetail(room.id)"
                      class="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded transition duration-300"
                    >
                      Xem chi tiết
                    </button>
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

:deep(.pi-star-fill),
:deep(.pi-star) {
  font-size: 1rem;
  margin-right: 2px;
}

:deep(.pi-star-fill) {
  color: #FBBF24;
}

:deep(.pi-star) {
  color: #D1D5DB;
}

@media (max-width: 768px) {
  .rating-box {
    margin-top: 0.5rem;
  }
}

:deep(.p-toast) {
  opacity: 0.95;
}

:deep(.p-toast-message) {
  border-radius: 8px;
}

:deep(.p-toast-message-error) {
  background-color: #FEE2E2;
  border: solid #FCA5A5;
  border-width: 0 0 0 6px;
  color: #991B1B;
}

:deep(.p-toast-message-error .p-toast-message-icon) {
  color: #991B1B;
}

:deep(.p-toast-message-content) {
  padding: 1rem;
}

:deep(.p-toast-summary) {
  font-weight: 600;
}

:deep(.p-toast-detail) {
  margin-top: 0.5rem;
}
</style>
