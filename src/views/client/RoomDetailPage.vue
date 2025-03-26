<script setup>
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';
import nha_nghi_2 from '@/assets/images/nha-nghi-2.webp';
import nha_nghi_3 from '@/assets/images/nha-nghi-3.webp';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from '@vueuse/head';

const route = useRoute();
const router = useRouter();
const roomId = computed(() => Number(route.params.id));
const room = ref(null);
const loading = ref(true);
const reviews = ref([]);
const relatedRooms = ref([]);

// Mảng chứa đường dẫn ảnh có sẵn
const availableImages = [nha_nghi_1, nha_nghi_2, nha_nghi_3];

// Form đặt phòng
const booking = ref({
    checkInDate: null,
    checkOutDate: null,
    guests: 1,
    specialRequests: ''
});

// Form đánh giá
const reviewForm = ref({
    rating: 0,
    comment: '',
    name: '',
    email: ''
});

const isSubmitting = ref(false);
const showReviewForm = ref(false);

onMounted(async () => {
    try {
        // Tải thông tin phòng
        const response = await fetch('/demo/data/room-types.json');
        const data = await response.json();

        const foundRoom = data.data.find((r) => r.id === roomId.value);
        if (foundRoom) {
            // Gán ảnh cho phòng
            room.value = {
                ...foundRoom,
                imageUrl: availableImages[0] // Dùng ảnh đầu tiên cho phòng chính
            };

            // Tải phòng liên quan (cùng loại nhưng khác phòng) và gán ảnh
            relatedRooms.value = data.data
                .filter((r) => r.maxOccupancy === foundRoom.maxOccupancy && r.id !== roomId.value)
                .slice(0, 3)
                .map((room, index) => {
                    return {
                        ...room,
                        imageUrl: availableImages[(index + 1) % 3] // Dùng ảnh khác cho phòng liên quan
                    };
                });

            // Tạo đánh giá giả
            generateFakeReviews();
        } else {
            router.push('/rooms');
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu phòng:', error);
    } finally {
        loading.value = false;
    }
});

// Tạo đánh giá giả để minh họa
const generateFakeReviews = () => {
    const reviewData = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            rating: 5,
            date: '2023-10-15',
            comment: 'Phòng rất sạch sẽ và thoải mái. Nhân viên thân thiện, dịch vụ tuyệt vời!'
        },
        {
            id: 2,
            name: 'Trần Thị B',
            rating: 4,
            date: '2023-09-28',
            comment: 'Phòng đẹp, view tuyệt vời. Chỉ tiếc là hơi ồn vào buổi sáng.'
        },
        {
            id: 3,
            name: 'Lê Văn C',
            rating: 5,
            date: '2023-11-05',
            comment: 'Một trong những khách sạn tốt nhất tôi từng ở. Đáng đồng tiền bát gạo.'
        }
    ];

    reviews.value = reviewData;
};

// Tính toán số ngày và tổng tiền
const days = computed(() => {
    if (!booking.value.checkInDate || !booking.value.checkOutDate) return 0;

    const checkIn = new Date(booking.value.checkInDate);
    const checkOut = new Date(booking.value.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
});

const totalPrice = computed(() => {
    if (!room.value || days.value === 0) return 0;
    return room.value.pricePerNight * days.value;
});

// Xếp hạng trung bình
const averageRating = computed(() => {
    if (reviews.value.length === 0) return 0;
    const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.value.length).toFixed(1);
});

const navigateToDetail = (roomId) => {
    router.push(`/rooms/${roomId}`);
};

const proceedToBooking = () => {
    if (!booking.value.checkInDate || !booking.value.checkOutDate) {
        // Hiển thị thông báo lỗi
        return;
    }

    // Lưu thông tin đặt phòng vào localStorage hoặc store
    const bookingData = {
        roomId: roomId.value,
        roomName: room.value.name,
        roomImage: room.value.imageUrl,
        pricePerNight: room.value.pricePerNight,
        ...booking.value,
        totalPrice: totalPrice.value
    };

    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    router.push('/booking/checkout');
};

const submitReview = () => {
    isSubmitting.value = true;

    // Giả lập gửi đánh giá
    setTimeout(() => {
        const newReview = {
            id: reviews.value.length + 1,
            name: reviewForm.value.name,
            rating: reviewForm.value.rating,
            date: new Date().toISOString().split('T')[0],
            comment: reviewForm.value.comment
        };

        reviews.value.unshift(newReview);

        // Reset form
        reviewForm.value = {
            rating: 0,
            comment: '',
            name: '',
            email: ''
        };

        showReviewForm.value = false;
        isSubmitting.value = false;
    }, 1000);
};

// Thiết lập meta tags động dựa trên thông tin phòng
const metaTags = computed(() => {
  if (!room.value) return {
    title: 'Chi tiết phòng - Luxury Hotel',
    description: 'Khám phá chi tiết phòng tại Luxury Hotel với đầy đủ tiện nghi và dịch vụ cao cấp.'
  };

  return {
    title: `${room.value.name} - Luxury Hotel`,
    description: `${room.value.name} tại Luxury Hotel - ${room.value.description.substring(0, 150)}... Đặt phòng ngay hôm nay.`
  };
});

useHead(() => ({
  title: metaTags.value.title,
  meta: [
    {
      name: 'description',
      content: metaTags.value.description
    }
  ]
}));
</script>

<template>
    <div class="room-detail-page bg-gray-50 min-h-screen pb-12">
        <div v-if="loading" class="flex justify-center py-20">
            <ProgressSpinner />
        </div>

        <div v-else-if="room">
            <!-- Hero Banner -->
            <div class="relative h-96">
                <img :src="room.imageUrl" :alt="room.name" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <h1 class="text-4xl md:text-5xl font-bold text-white mb-2">{{ room.name }}</h1>
                        <div class="flex items-center text-white mb-4">
                            <i class="pi pi-star-fill text-yellow-400 mr-1"></i>
                            <span class="mr-2">{{ averageRating }}</span>
                            <span>({{ reviews.length }} đánh giá)</span>
                        </div>
                        <div class="bg-amber-500 text-white inline-block px-4 py-2 rounded-lg text-xl font-bold">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.pricePerNight) }}/đêm</div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex flex-col lg:flex-row gap-8">
                    <!-- Thông tin chi tiết phòng -->
                    <div class="lg:w-2/3">
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <h2 class="text-2xl font-bold mb-4 text-gray-800">Thông tin chi tiết</h2>
                            <p class="text-gray-600 mb-6">{{ room.description }}</p>

                            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div class="flex items-center">
                                    <i class="pi pi-users text-amber-500 mr-2"></i>
                                    <span class="text-gray-700">Tối đa {{ room.maxOccupancy }} người</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="pi pi-home text-amber-500 mr-2"></i>
                                    <span class="text-gray-700">{{ room.code || 'Phòng ' + room.id }}</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="pi pi-calendar text-amber-500 mr-2"></i>
                                    <span class="text-gray-700">Đặt trước tối thiểu 1 ngày</span>
                                </div>
                            </div>

                            <h3 class="text-xl font-semibold mb-3 text-gray-800">Tiện nghi phòng</h3>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-y-3">
                                <div v-for="(amenity, index) in room.amenities" :key="index" class="flex items-center">
                                    <i class="pi pi-check-circle text-green-500 mr-2"></i>
                                    <span class="text-gray-700">{{ amenity }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Đánh giá -->
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-2xl font-bold text-gray-800">Đánh giá từ khách hàng</h2>
                                <Button @click="showReviewForm = true" icon="pi pi-plus" label="Viết đánh giá" v-if="!showReviewForm" />
                            </div>

                            <div v-if="showReviewForm" class="bg-gray-50 p-4 rounded-lg mb-6">
                                <h3 class="text-lg font-semibold mb-3">Đánh giá của bạn</h3>
                                <div class="mb-3">
                                    <label class="block text-gray-700 mb-1">Xếp hạng</label>
                                    <Rating v-model="reviewForm.rating" :cancel="false" />
                                </div>
                                <div class="mb-3">
                                    <label class="block text-gray-700 mb-1">Họ tên</label>
                                    <InputText v-model="reviewForm.name" class="w-full" />
                                </div>
                                <div class="mb-3">
                                    <label class="block text-gray-700 mb-1">Email</label>
                                    <InputText v-model="reviewForm.email" class="w-full" type="email" />
                                </div>
                                <div class="mb-4">
                                    <label class="block text-gray-700 mb-1">Nội dung đánh giá</label>
                                    <Textarea v-model="reviewForm.comment" rows="3" class="w-full" />
                                </div>
                                <div class="flex justify-end">
                                    <Button @click="showReviewForm = false" label="Hủy" class="p-button-outlined mr-2" />
                                    <Button @click="submitReview" label="Gửi đánh giá" :loading="isSubmitting" />
                                </div>
                            </div>

                            <div v-if="reviews.length === 0" class="text-center py-8">
                                <i class="pi pi-comments text-4xl text-gray-300 mb-2"></i>
                                <p class="text-gray-500">Chưa có đánh giá nào cho phòng này</p>
                            </div>

                            <div v-else>
                                <div v-for="review in reviews" :key="review.id" class="border-b border-gray-200 py-4 last:border-0">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 class="font-semibold text-gray-800">{{ review.name }}</h4>
                                            <div class="flex items-center">
                                                <Rating :modelValue="review.rating" readonly :cancel="false" />
                                                <span class="ml-2 text-gray-500 text-sm">{{ review.date }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p class="text-gray-600 mt-2">{{ review.comment }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Phòng liên quan -->
                        <div v-if="relatedRooms.length > 0" class="bg-white p-6 rounded-lg shadow-md">
                            <h2 class="text-2xl font-bold mb-4 text-gray-800">Phòng liên quan</h2>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div v-for="relatedRoom in relatedRooms" :key="relatedRoom.id" class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <img :src="relatedRoom.imageUrl" :alt="relatedRoom.name" class="w-full h-40 object-cover" />
                                    <div class="p-4">
                                        <h3 class="font-semibold text-gray-800 mb-2">{{ relatedRoom.name }}</h3>
                                        <div class="flex justify-between items-center">
                                            <span class="text-amber-600 font-bold"> {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(relatedRoom.pricePerNight) }}/đêm </span>
                                            <Button @click="navigateToDetail(relatedRoom.id)" label="Xem" class="p-button-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar - Đặt phòng -->
                    <div class="lg:w-1/3">
                        <div class="bg-white p-6 rounded-lg shadow-md sticky top-4">
                            <h2 class="text-xl font-bold mb-4 text-gray-800">Đặt phòng</h2>

                            <div class="mb-4">
                                <label class="block text-gray-700 mb-1">Ngày nhận phòng</label>
                                <Calendar v-model="booking.checkInDate" class="w-full" dateFormat="dd/mm/yy" showIcon />
                            </div>

                            <div class="mb-4">
                                <label class="block text-gray-700 mb-1">Ngày trả phòng</label>
                                <Calendar v-model="booking.checkOutDate" class="w-full" dateFormat="dd/mm/yy" showIcon />
                            </div>

                            <div class="mb-4">
                                <label class="block text-gray-700 mb-1">Số người</label>
                                <Dropdown v-model="booking.guests" :options="[1, 2, 3, 4]" class="w-full" />
                            </div>

                            <div class="mb-6">
                                <label class="block text-gray-700 mb-1">Yêu cầu đặc biệt</label>
                                <Textarea v-model="booking.specialRequests" rows="3" class="w-full" placeholder="Nhập yêu cầu đặc biệt (nếu có)" />
                            </div>

                            <div v-if="days > 0" class="bg-gray-50 p-4 rounded-lg mb-6">
                                <div class="flex justify-between mb-3">
                                    <span class="text-gray-700">Giá phòng:</span>
                                    <span class="font-semibold">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.pricePerNight) }}/đêm</span>
                                </div>
                                <div class="flex justify-between mb-3">
                                    <span class="text-gray-700">Số đêm:</span>
                                    <span class="font-semibold">{{ days }} đêm</span>
                                </div>
                                <div class="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
                                    <span>Tổng cộng:</span>
                                    <span class="text-amber-600">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice) }}</span>
                                </div>
                            </div>

                            <Button @click="proceedToBooking" label="Tiếp tục đặt phòng" class="w-full p-button-lg" :disabled="!booking.checkInDate || !booking.checkOutDate" />

                            <div class="mt-4 text-center text-gray-500 text-sm">
                                <p>Bạn chưa bị trừ tiền ở bước này</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
