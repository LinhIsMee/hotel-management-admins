<script setup>
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';
import nha_nghi_2 from '@/assets/images/nha-nghi-2.webp';
import nha_nghi_3 from '@/assets/images/nha-nghi-3.webp';
import { useHead } from '@vueuse/head';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import GuestSelector from '@/components/client/GuestSelector.vue';

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
    children: 0,
    childrenAges: [] // Mảng lưu tuổi của từng trẻ em
});

// Điều khiển hiển thị dropdown chọn khách
const showGuestSelect = ref(false);

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

// Hàm lấy đánh giá cho một phòng
async function fetchRoomRatings(roomId) {
    try {
        const response = await axios.get(`http://127.0.0.1:9000/api/ratings/room/${roomId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy đánh giá cho phòng ${roomId}:`, error);
        return [];
    }
}

// Hàm lấy đánh giá theo số phòng
async function fetchRoomReviewsByNumber(roomNumber) {
    try {
        const response = await axios.get(`http://127.0.0.1:9000/api/v1/reviews/room/number/${roomNumber}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy đánh giá cho phòng số ${roomNumber}:`, error);
        return [];
    }
}

onMounted(async () => {
    try {
        // Gọi API lấy phòng nổi bật
        const response = await axios.get('http://127.0.0.1:9000/api/v1/rooms/featured');

        // Gán ảnh từ mảng có sẵn và lấy đánh giá cho mỗi phòng
        const roomsWithRatings = await Promise.all(response.data.map(async (room, index) => {
            // Lấy đánh giá theo ID
            const ratings = await fetchRoomRatings(room.id);

            // Lấy đánh giá theo số phòng
            const reviews = await fetchRoomReviewsByNumber(room.roomNumber);

            // Tính điểm trung bình từ cả reviews và ratings
            const allRatings = [...ratings, ...reviews.map(review => ({ stars: review.rating || review.stars || 0 }))];
            const averageRating = allRatings.length > 0
                ? allRatings.reduce((acc, curr) => acc + (curr.stars || curr.rating || 0), 0) / allRatings.length
                : 0;

            return {
                ...room,
                imageUrl: availableImages[index % 3],
                description: room.notes || room.specialFeatures || `${room.roomTypeName} - ${room.roomNumber}`,
                ratings: ratings,
                reviews: reviews,
                averageRating: averageRating,
                totalReviews: allRatings.length
            };
        }));

        featuredRooms.value = roomsWithRatings;
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu phòng:', error);
    } finally {
        loading.value = false;
    }

    // Click outside để đóng dropdown
    document.addEventListener('click', (e) => {
        const dropdownButton = document.querySelector('.guest-select-button');
        if (showGuestSelect.value && dropdownButton &&
            !dropdownButton.contains(e.target) &&
            !e.target.closest('.guest-selector') &&
            !e.target.closest('.p-dropdown-panel, .p-datepicker-panel')) {
            showGuestSelect.value = false;
        }
    });
});

const navigateToDetail = (roomId) => {
    router.push(`/room/${roomId}`);
};

const navigateToRoomList = () => {
    router.push('/rooms');
};

// Cập nhật hàm searchRooms để gửi thông tin tuổi của từng trẻ em
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
            children: searchForm.value.children,
            childrenAges: searchForm.value.childrenAges.join(',')
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

// Hàm chuyển đổi điểm số thành text
function getRatingText(rating) {
    if (!rating) return 'Chưa đánh giá';
    if (rating >= 4.5) return 'Xuất sắc';
    if (rating >= 4.0) return 'Rất tốt';
    if (rating >= 3.5) return 'Tốt';
    if (rating >= 3.0) return 'Hài lòng';
    return 'Bình thường';
}
</script>

<template>
    <div class="client-home">
        <!-- Hero Section -->
        <section class="relative bg-gray-900 text-white">
            <div class="absolute inset-0 overflow-hidden">
                <div class="relative inset-0 overflow-hidden">
                    <img :src="nha_nghi_1" alt="Khách sạn Luxury Hotel - Khu nghỉ dưỡng sang trọng tại Việt Nam"
                        class="w-full h-full object-cover opacity-50" loading="eager" width="1920" height="1080" />
                </div>
            </div>
            <div class="relative max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8 flex flex-col items-center">
                <h1 class="text-5xl font-bold text-white mb-6">Khách sạn sang trọng cho kỳ nghỉ hoàn hảo</h1>
                <p class="text-xl text-white mb-8 max-w-3xl text-center">Trải nghiệm đẳng cấp, giá thành hợp lý và phục
                    vụ chuyên nghiệp tại hệ thống khách sạn hàng đầu Việt Nam.</p>
                <button @click="handleBookNow"
                    class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300">Đặt
                    ngay</button>
            </div>
        </section>

        <!-- Form tìm kiếm -->
        <section class="bg-white shadow-lg py-6 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-2xl font-bold mb-6 text-gray-800">Tìm phòng phù hợp</h2>
                <div class="bg-white rounded-lg">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <!-- Ngày nhận phòng -->
                        <div class="md:col-span-3">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ngày nhận phòng</label>
                            <Calendar v-model="searchForm.checkIn" placeholder="Chọn ngày"
                                class="w-full border rounded-lg" :minDate="new Date()" showIcon />
                        </div>

                        <!-- Ngày trả phòng -->
                        <div class="md:col-span-3">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ngày trả phòng</label>
                            <Calendar v-model="searchForm.checkOut" placeholder="Chọn ngày"
                                class="w-full border rounded-lg" :minDate="searchForm.checkIn || new Date()" showIcon />
                        </div>

                        <!-- Số lượng khách và tuổi -->
                        <div class="md:col-span-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Khách và trẻ em</label>
                            <div class="relative overflow-visible" style="z-index: 100;">
                                <button @click="showGuestSelect = !showGuestSelect"
                                    class="guest-select-button w-full bg-white border rounded-lg px-4 py-2 text-left flex items-center justify-between hover:border-blue-500 focus:outline-none focus:border-blue-500">
                                    <span class="text-gray-700">
                                        {{ searchForm.adults }} người lớn{{ searchForm.children ? `, ${searchForm.children} trẻ em` : '' }}
                                    </span>
                                    <i class="pi pi-chevron-down text-gray-400"></i>
                                </button>

                                <!-- GuestSelector hiển thị ở giữa màn hình như một modal khi trên mobile -->
                                <div v-if="showGuestSelect"
                                     class="absolute left-0 top-full mt-2 z-50 md:block hidden">
                                    <GuestSelector
                                        v-model:adults="searchForm.adults"
                                        v-model:children="searchForm.children"
                                        v-model:childrenAges="searchForm.childrenAges"
                                        :maxOccupancy="5"
                                        position="bottom"
                                        @close="showGuestSelect = false"
                                    />
                                </div>

                                <!-- Hiển thị dạng modal trên mobile -->
                                <div v-if="showGuestSelect"
                                     class="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:hidden">
                                    <div class="fixed inset-0 bg-black bg-opacity-30" @click="showGuestSelect = false"></div>
                                    <div class="relative z-[1001]">
                                        <GuestSelector
                                            v-model:adults="searchForm.adults"
                                            v-model:children="searchForm.children"
                                            v-model:childrenAges="searchForm.childrenAges"
                                            :maxOccupancy="5"
                                            @close="showGuestSelect = false"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Nút tìm kiếm -->
                        <div class="md:col-span-2">
                            <Button label="Tìm kiếm" icon="pi pi-search"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium border-blue-600 hover:border-blue-700 p-3"
                                @click="searchRooms" />
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
                    <div v-for="room in featuredRooms" :key="room.id"
                        class="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
                        <img :src="room.imageUrl"
                            :alt="`Phòng ${room.name} tại Luxury Hotel - ${room.description.substring(0, 50)}...`"
                            class="w-full h-64 object-cover" loading="lazy" width="600" height="400" />
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <div class="flex items-center gap-2 mb-1">
                                      <span class="bg-blue-600 text-white px-2 py-0.5 rounded text-sm">
                                            {{ room.averageRating ? room.averageRating.toFixed(1) : '0' }}
                                        </span>
                                        <span class="font-medium">
                                            {{ getRatingText(room.averageRating) }}
                                        </span>

                                    </div>
                                    <div class="flex items-center gap-1">
                                        <span class="text-xs text-gray-500">
                                            {{ room.totalReviews ? `${room.totalReviews} đánh giá` : 'Chưa có đánh giá' }}
                                        </span>
                                    </div>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800">{{ room.name }}</h3>
                                <span class="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                                    {{ new Intl.NumberFormat('vi-VN', {
                                        style: 'currency', currency: 'VND'
                                    }).format(room.pricePerNight) }}/đêm
                                </span>
                            </div>
                            <p class="text-gray-600 mb-4 line-clamp-2">{{ room.description }}</p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span v-for="(amenity, index) in room.amenities.slice(0, 4)" :key="index"
                                    class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                                    {{ amenity }}
                                </span>
                                <span v-if="room.amenities.length > 4"
                                    class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs"> +{{
                                    room.amenities.length - 4 }} </span>
                            </div>
                            <Button label="Xem chi tiết"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium border-blue-600 hover:border-blue-700"
                                aria-label="Xem chi tiết phòng" @click="navigateToDetail(room.id)" />
                        </div>
                    </div>
                </div>

                <div class="text-center mt-10">
                    <Button label="Xem tất cả phòng"
                        class="border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white font-medium"
                        aria-label="Xem danh sách tất cả phòng" @click="navigateToRoomList" />
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
