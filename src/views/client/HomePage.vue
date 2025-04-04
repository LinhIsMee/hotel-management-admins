<script setup>
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';
import nha_nghi_2 from '@/assets/images/nha-nghi-2.webp';
import nha_nghi_3 from '@/assets/images/nha-nghi-3.webp';
import { useHead } from '@vueuse/head';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const featuredRooms = ref([]);
const loading = ref(true);

// Mảng chứa đường dẫn ảnh có sẵn
const availableImages = [nha_nghi_1, nha_nghi_2, nha_nghi_3];

// Form data
const searchForm = ref({
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0
});

// Thiết lập meta tags cho trang chủ
useHead({
  title: 'Luxury Hotel - Khách sạn sang trọng hàng đầu Việt Nam',
  meta: [
    {
      name: 'description',
      content: 'Trải nghiệm đẳng cấp, giá thành hợp lý và phục vụ chuyên nghiệp tại hệ thống khách sạn Luxury Hotel. Đặt phòng ngay hôm nay để có kỳ nghỉ hoàn hảo.'
    }
  ]
})

onMounted(async () => {
    try {
        // Sẽ thay thế bằng API thực tế sau này
        const response = await fetch('/demo/data/room-types.json');
        const data = await response.json();

        // Lấy 3 phòng nổi bật và gán ảnh từ mảng có sẵn
        featuredRooms.value = data.data.slice(0, 3).map((room, index) => {
            return {
                ...room,
                imageUrl: availableImages[index % 3] // Lấy ảnh theo index và loop lại nếu cần
            };
        });
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu phòng:', error);
    } finally {
        loading.value = false;
    }
});

const navigateToDetail = (roomId) => {
    router.push(`/room/${roomId}`);
};

const navigateToRoomList = () => {
    router.push('/rooms');
};

// Hàm xử lý tìm kiếm phòng
function searchRooms() {
    if (!searchForm.value.checkIn || !searchForm.value.checkOut) {
        return;
    }

    router.push({
        path: '/rooms',
        query: {
            checkIn: formatDate(searchForm.value.checkIn),
            checkOut: formatDate(searchForm.value.checkOut),
            adults: searchForm.value.adults,
            children: searchForm.value.children
        }
    });
}

// Helper để format ngày thành chuỗi YYYY-MM-DD
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Tạo emit function
const emit = defineEmits(['show-login']);

function handleBookNow(event) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định
    emit('show-login');
}
</script>

<template>
    <div class="client-home">
        <!-- Hero Section -->
        <section class="relative bg-gray-900 text-white">
            <div class="absolute inset-0 overflow-hidden">
                <div class="relative inset-0 overflow-hidden">
                    <img
                        :src="nha_nghi_1"
                        alt="Khách sạn Luxury Hotel - Khu nghỉ dưỡng sang trọng tại Việt Nam"
                        class="w-full h-full object-cover opacity-50"
                        loading="eager"
                        width="1920"
                        height="1080"
                    />
                </div>
            </div>
            <div class="relative max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8 flex flex-col items-center">
                <h1 class="text-5xl font-bold text-white mb-6">Khách sạn sang trọng cho kỳ nghỉ hoàn hảo</h1>
                <p class="text-xl text-white mb-8 max-w-3xl text-center">Trải nghiệm đẳng cấp, giá thành hợp lý và phục vụ chuyên nghiệp tại hệ thống khách sạn hàng đầu Việt Nam.</p>
                <button @click="handleBookNow" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300">Đặt ngay</button>
            </div>
        </section>

        <!-- Tìm kiếm nhanh -->
        <section class="py-8 bg-white shadow-md">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="bg-white rounded-lg p-6">
                    <h2 class="text-2xl font-bold mb-4 text-gray-800">Tìm phòng phù hợp</h2>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-gray-700 mb-2">Ngày nhận phòng</label>
                            <Calendar v-model="searchForm.checkIn" placeholder="Chọn ngày" class="w-full" showIcon :minDate="new Date()" />
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2">Ngày trả phòng</label>
                            <Calendar v-model="searchForm.checkOut" placeholder="Chọn ngày" class="w-full" showIcon :minDate="searchForm.checkIn || new Date()" />
                        </div>
                        <div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-xs text-gray-600 mb-2">Người lớn</label>
                                    <Dropdown v-model="searchForm.adults" class="w-full" :options="[1, 2, 3, 4, 5]" placeholder="Số lượng" />
                                </div>
                                <div>
                                    <label class="block text-xs text-gray-600 mb-2">Trẻ em</label>
                                    <Dropdown v-model="searchForm.children" class="w-full" :options="[0, 1, 2, 3, 4]" placeholder="Số lượng" />
                                </div>
                            </div>
                        </div>
                        <div class="flex items-end">
                            <Button
                                label="Tìm kiếm"
                                icon="pi pi-search"
                                class="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium border-amber-600 hover:border-amber-700"
                                aria-label="Tìm kiếm phòng"
                                @click="searchRooms"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Phòng nổi bật -->
        <section class="py-16 bg-gray-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-3xl font-bold mb-2 text-gray-800">Phòng nổi bật</h2>
                <p class="text-gray-600 mb-8">Khám phá những lựa chọn phòng được yêu thích nhất của chúng tôi</p>

                <div v-if="loading" class="flex justify-center py-10">
                    <ProgressSpinner />
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div v-for="room in featuredRooms" :key="room.id" class="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
                        <img
                            :src="room.imageUrl"
                            :alt="`Phòng ${room.name} tại Luxury Hotel - ${room.description.substring(0, 50)}...`"
                            class="w-full h-64 object-cover"
                            loading="lazy"
                            width="600"
                            height="400"
                        />
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-4">
                                <h3 class="text-xl font-bold text-gray-800">{{ room.name }}</h3>
                                <span class="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold"> {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.pricePerNight) }}/đêm </span>
                            </div>
                            <p class="text-gray-600 mb-4 line-clamp-2">{{ room.description }}</p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span v-for="(amenity, index) in room.amenities.slice(0, 4)" :key="index" class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                                    {{ amenity }}
                                </span>
                                <span v-if="room.amenities.length > 4" class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs"> +{{ room.amenities.length - 4 }} </span>
                            </div>
                            <Button
                                label="Xem chi tiết"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium border-blue-600 hover:border-blue-700"
                                aria-label="Xem chi tiết phòng"
                                @click="navigateToDetail(room.id)"
                            />
                        </div>
                    </div>
                </div>

                <div class="text-center mt-10">
                    <Button
                        label="Xem tất cả phòng"
                        class="border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white font-medium"
                        aria-label="Xem danh sách tất cả phòng"
                        @click="navigateToRoomList"
                    />
                </div>
            </div>
        </section>

        <!-- Dịch vụ đi kèm -->
        <section class="py-16 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-3xl font-bold mb-2 text-center text-gray-800">Dịch vụ của chúng tôi</h2>
                <p class="text-gray-600 mb-12 text-center">Trải nghiệm những dịch vụ đẳng cấp 5 sao</p>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div class="text-center">
                        <div class="bg-amber-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                            <i class="pi pi-wifi text-amber-500 text-3xl"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Wifi miễn phí</h3>
                        <p class="text-gray-600">Kết nối Internet tốc độ cao miễn phí tại mọi khu vực</p>
                    </div>

                    <div class="text-center">
                        <div class="bg-amber-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                            <i class="pi pi-heart text-amber-500 text-3xl"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Spa & Gym</h3>
                        <p class="text-gray-600">Thư giãn với dịch vụ spa cao cấp và phòng tập hiện đại</p>
                    </div>

                    <div class="text-center">
                        <div class="bg-amber-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                            <i class="pi pi-shopping-cart text-amber-500 text-3xl"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Nhà hàng</h3>
                        <p class="text-gray-600">Thưởng thức ẩm thực đa dạng từ các đầu bếp 5 sao</p>
                    </div>

                    <div class="text-center">
                        <div class="bg-amber-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                            <i class="pi pi-car text-amber-500 text-3xl"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Đưa đón sân bay</h3>
                        <p class="text-gray-600">Dịch vụ xe sang trọng đưa đón tận tình</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
