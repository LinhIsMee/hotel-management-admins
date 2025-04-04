<script setup>
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';
import nha_nghi_2 from '@/assets/images/nha-nghi-2.webp';
import nha_nghi_3 from '@/assets/images/nha-nghi-3.webp';
import { useHead } from '@vueuse/head';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RoomReviews from '@/components/RoomReviews.vue';
import Rating from 'primevue/rating';
import Skeleton from 'primevue/skeleton';
import DatePicker from 'primevue/datepicker';
import ProgressSpinner from 'primevue/progressspinner';

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

// Thêm vào các thuộc tính sau
const roomImages = ref([]);
const selectedImage = ref(null);
const selectedImageIndex = ref(0);
const galleryVisible = ref(false);
const currentGalleryIndex = ref(0);

// Các phương thức xử lý thư viện ảnh
const selectImage = (index) => {
  selectedImageIndex.value = index;
  selectedImage.value = roomImages.value[index];
};

const openGallery = (index) => {
  currentGalleryIndex.value = index;
  galleryVisible.value = true;
};

const prevImage = () => {
  if (roomImages.value.length === 0) return;
  currentGalleryIndex.value = (currentGalleryIndex.value - 1 + roomImages.value.length) % roomImages.value.length;
};

const nextImage = () => {
  if (roomImages.value.length === 0) return;
  currentGalleryIndex.value = (currentGalleryIndex.value + 1) % roomImages.value.length;
};

onMounted(async () => {
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

        const foundRoom = mockRoomData.find((r) => r.id === roomId.value);
        if (foundRoom) {
            // Gán ảnh ngẫu nhiên cho mỗi phòng và bổ sung imageUrl
            foundRoom.imageUrl = availableImages[(foundRoom.id - 1) % 3];

            // Tạo mảng ảnh từ ảnh ban đầu và thêm các ảnh chi tiết khác
            const additionalImages = [
                'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                'https://images.unsplash.com/photo-1584132905271-512c958d674a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
            ];

            roomImages.value = [foundRoom.imageUrl, ...additionalImages];
            selectedImage.value = roomImages.value[0];

            // Thêm rating
            foundRoom.rating = 4.5;
            foundRoom.reviewCount = 27;

            // Thêm các tiện ích phòng
            if (!foundRoom.amenities) {
                foundRoom.amenities = [];
            }

            // Thêm các tiện ích nếu chưa có
            const additionalAmenities = [
                'WiFi miễn phí', 'Điều hòa', 'TV màn hình phẳng', 'Minibar',
                'Két an toàn', 'Bồn tắm', 'Ban công', 'View đẹp'
            ];

            additionalAmenities.forEach(amenity => {
                if (!foundRoom.amenities.includes(amenity)) {
                    foundRoom.amenities.push(amenity);
                }
            });

            room.value = foundRoom;

            // Tải phòng liên quan (cùng loại nhưng khác phòng) và gán ảnh
            relatedRooms.value = mockRoomData
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
    router.push(`/room/${roomId}`);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
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
    <div class="room-detail-page bg-gray-50 min-h-screen py-8">
        <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-20">
            <ProgressSpinner strokeWidth="5" class="w-20 h-20" />
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" v-else-if="room">
            <!-- Thông tin phòng -->
            <div class="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
                <!-- Thư viện ảnh phòng -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <!-- Ảnh chính -->
                    <div class="md:col-span-2">
                        <img :src="selectedImage || room.imageUrl" :alt="room.name" class="w-full h-80 object-cover rounded-lg cursor-pointer" @click="openGallery(selectedImageIndex || 0)" />
                    </div>

                    <!-- Ảnh thu nhỏ -->
                    <div v-for="(image, index) in roomImages" :key="index" class="cursor-pointer" @click="selectImage(index)">
                        <img :src="image" :alt="`${room.name} - Ảnh ${index + 1}`" class="w-full h-32 object-cover rounded-lg hover:opacity-90 transition" :class="{'border-2 border-amber-500': selectedImageIndex === index}" />
                    </div>
                </div>

                <!-- Gallery Modal -->
                <Dialog v-model:visible="galleryVisible" modal :style="{width: '90vw'}" header="Thư viện ảnh" :dismissableMask="true">
                    <div class="relative">
                        <div class="gallery-container">
                            <img v-if="roomImages.length > 0" :src="roomImages[currentGalleryIndex]" :alt="`${room.name} - Ảnh ${currentGalleryIndex + 1}`" class="w-full max-h-[80vh] object-contain" />
                        </div>
                        <Button icon="pi pi-chevron-left" class="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white" @click="prevImage" />
                        <Button icon="pi pi-chevron-right" class="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white" @click="nextImage" />
                        <div class="text-center mt-4">
                            {{ currentGalleryIndex + 1 }} / {{ roomImages.length }}
                        </div>
                    </div>
                </Dialog>

                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ room.name }}</h1>
                            <div class="flex items-center mb-2">
                                <div class="flex items-center mr-4">
                                    <i class="pi pi-users mr-2 text-gray-600"></i>
                                    <span>{{ room.maxOccupancy }} người</span>
                                </div>
                                <div class="flex items-center mr-4">
                                    <i class="pi pi-home mr-2 text-gray-600"></i>
                                    <span>{{ room.size || 0 }} m²</span>
                                </div>
                                <!-- Hiển thị đánh giá sao -->
                                <div class="flex items-center">
                                    <Rating v-model="room.rating" readonly :cancel="false" />
                                    <span class="ml-2 text-gray-600">({{ room.reviewCount || 0 }} đánh giá)</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-3xl font-bold text-amber-600">{{ formatCurrency(room.finalPrice || room.pricePerNight) }}</div>
                            <div class="text-sm text-gray-600">/ đêm</div>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h2 class="text-xl font-semibold text-gray-800 mb-2">Mô tả</h2>
                        <p class="text-gray-700">{{ room.description }}</p>
                    </div>

                    <!-- Tiện nghi phòng -->
                    <div class="mb-6">
                        <h2 class="text-xl font-semibold text-gray-800 mb-2">Tiện nghi phòng</h2>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div v-for="(amenity, index) in room.amenities || []" :key="index" class="flex items-center">
                                <i class="pi pi-check-circle mr-2 text-green-500"></i>
                                <span>{{ amenity }}</span>
                            </div>
                            <!-- Thêm bãi đậu xe -->
                            <div class="flex items-center">
                                <i class="pi pi-check-circle mr-2 text-green-500"></i>
                                <span>Bãi đậu xe</span>
                            </div>
                            <!-- Thêm các tiện ích khác -->
                            <div class="flex items-center">
                                <i class="pi pi-check-circle mr-2 text-green-500"></i>
                                <span>Dịch vụ phòng 24/7</span>
                            </div>
                            <div class="flex items-center">
                                <i class="pi pi-check-circle mr-2 text-green-500"></i>
                                <span>Wifi tốc độ cao</span>
                            </div>
                            <div class="flex items-center">
                                <i class="pi pi-check-circle mr-2 text-green-500"></i>
                                <span>Bể bơi</span>
                            </div>
                        </div>
                    </div>

                    <!-- Form đặt phòng -->
                    <div class="bg-white p-6 rounded-lg shadow-md sticky top-4">
                        <h2 class="text-xl font-bold mb-4 text-gray-800">Đặt phòng</h2>

                        <div class="mb-4">
                            <label class="block text-gray-700 mb-1">Ngày nhận phòng</label>
                            <DatePicker v-model="booking.checkInDate" class="w-full" showIcon />
                        </div>

                        <div class="mb-4">
                            <label class="block text-gray-700 mb-1">Ngày trả phòng</label>
                            <DatePicker v-model="booking.checkOutDate" class="w-full" showIcon />
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
                                <span class="font-semibold">{{ formatCurrency(room.pricePerNight) }}/đêm</span>
                            </div>
                            <div class="flex justify-between mb-3">
                                <span class="text-gray-700">Số đêm:</span>
                                <span class="font-semibold">{{ days }} đêm</span>
                            </div>
                            <div class="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
                                <span>Tổng cộng:</span>
                                <span class="text-amber-600">{{ formatCurrency(totalPrice) }}</span>
                            </div>
                        </div>

                        <Button @click="proceedToBooking" label="Tiếp tục đặt phòng" class="w-full p-button-lg" :disabled="!booking.checkInDate || !booking.checkOutDate" />

                        <div class="mt-4 text-center text-gray-500 text-sm">
                            <p>Bạn chưa bị trừ tiền ở bước này</p>
                        </div>
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
                                <span class="text-amber-600 font-bold">{{ formatCurrency(relatedRoom.pricePerNight) }}/đêm</span>
                                <Button @click="navigateToDetail(relatedRoom.id)" label="Xem" class="p-button-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Phần đánh giá -->
            <RoomReviews :roomId="roomId" :initialReviews="reviews" class="mb-8" />
        </div>

        <!-- Loading state -->
        <div v-else-if="loading === false && !room" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <i class="pi pi-exclamation-triangle text-5xl text-amber-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy phòng</h2>
            <p class="text-gray-600 mb-6">Phòng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Button label="Quay lại danh sách phòng" @click="router.push('/rooms')" />
        </div>
    </div>
</template>

<style scoped>
:deep(.p-rating .p-rating-item.p-rating-item-active .p-rating-icon) {
  color: #f59e0b !important; /* amber-500 */
}

:deep(.p-datepicker),
:deep(.p-dropdown),
:deep(.p-inputtext),
:deep(.p-textarea) {
  width: 100%;
}

:deep(.p-button) {
  background: #d97706; /* amber-600 */
  border-color: #d97706; /* amber-600 */
}

:deep(.p-button:hover) {
  background: #b45309; /* amber-700 */
  border-color: #b45309; /* amber-700 */
}

:deep(.p-button.p-button-sm) {
  font-size: 0.875rem;
  padding: 0.4rem 0.8rem;
}

:deep(.p-galleria-thumbnail-container) {
  background: #f3f4f6; /* gray-100 */
}
</style>
