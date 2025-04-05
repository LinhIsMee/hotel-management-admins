<script setup>
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';
import nha_nghi_2 from '@/assets/images/nha-nghi-2.webp';
import nha_nghi_3 from '@/assets/images/nha-nghi-3.webp';
import { useRoomManagement } from '@/composables/useRoomManagement';
import { useHead } from '@vueuse/head';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RoomReviews from '@/components/RoomReviews.vue';
import Rating from 'primevue/rating';
import Skeleton from 'primevue/skeleton';
import DatePicker from 'primevue/datepicker';
import ProgressSpinner from 'primevue/progressspinner';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const roomId = computed(() => Number(route.params.id));
const room = ref(null);
const loading = ref(true);
const reviews = ref([]);
const relatedRooms = ref([]);

// Room Management Composable
const {
  fetchRoomById,
  fetchRoomsByType,
  fetchAvailableRooms,
  formatCurrency,
  formatDate,
  calculateTotalPrice
} = useRoomManagement();

// Mảng chứa đường dẫn ảnh có sẵn (backup nếu API không trả về ảnh)
const availableImages = [nha_nghi_1, nha_nghi_2, nha_nghi_3];

// Form đặt phòng
const booking = ref({
    checkInDate: null,
    checkOutDate: null,
    guests: 1,
    specialRequests: '',
    payViaVnpay: false,
    discountCode: '',
    services: []
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

// Thêm vào biến cho phần mã giảm giá
const discountStatus = ref({
    loading: false,
    valid: false,
    applied: false,
    message: '',
    discount: 0,
    code: ''
});

// Thêm danh sách dịch vụ
const availableServices = ref([
    { id: 1, name: 'Bữa sáng', price: 150000, description: 'Buffet bữa sáng cho mỗi khách' },
    { id: 2, name: 'Đưa đón sân bay', price: 350000, description: 'Dịch vụ đưa đón sân bay' },
    { id: 3, name: 'Giặt ủi', price: 100000, description: 'Dịch vụ giặt ủi' },
    { id: 4, name: 'Spa', price: 500000, description: 'Dịch vụ Spa và massage' }
]);

// Tính tổng tiền dịch vụ
const serviceTotal = computed(() => {
    if (!booking.value.services || booking.value.services.length === 0) return 0;
    return booking.value.services.reduce((total, serviceId) => {
        const service = availableServices.value.find(s => s.id === serviceId);
        return total + (service ? service.price : 0);
    }, 0);
});

// Tính tổng tiền đặt phòng
const totalPrice = computed(() => {
    if (!room.value || !booking.value.checkInDate || !booking.value.checkOutDate) return 0;

    // Tính tiền phòng
    const roomPrice = calculateTotalPrice(room.value, booking.value.checkInDate, booking.value.checkOutDate);

    // Cộng với tiền dịch vụ
    const total = roomPrice + serviceTotal.value;

    // Áp dụng giảm giá nếu có
    if (discountStatus.value.applied && discountStatus.value.discount > 0) {
        return total * (1 - discountStatus.value.discount / 100);
    }

    return total;
});

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

// Tải phòng liên quan (cùng loại nhưng khác phòng)
const loadRelatedRooms = async () => {
    if (!room.value || !room.value.roomTypeId) return;

    try {
        const relatedRoomsData = await fetchRoomsByType(room.value.roomTypeId);
        // Lọc bỏ phòng hiện tại
        relatedRooms.value = relatedRoomsData
            .filter(r => r.id !== roomId.value)
            .slice(0, 3)
            .map((room, index) => {
                // Thêm ảnh nếu cần
                if (!room.images || room.images.length === 0) {
                    room.imageUrl = availableImages[(index + 1) % 3];
                } else {
                    room.imageUrl = room.images[0];
                }
                return room;
            });
    } catch (error) {
        console.error('Lỗi khi tải phòng liên quan:', error);
    }
};

onMounted(async () => {
    try {
        loading.value = true;

        // Tải thông tin chi tiết phòng từ API
        const roomData = await fetchRoomById(roomId.value);

        if (roomData) {
            room.value = roomData;

            // Xử lý ảnh
            if (roomData.images && roomData.images.length > 0) {
                roomImages.value = roomData.images;
            } else {
                // Sử dụng ảnh fallback nếu API không trả về ảnh
                const additionalImages = [
                    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                    'https://images.unsplash.com/photo-1584132905271-512c958d674a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                    'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
                ];

                roomImages.value = [availableImages[0], ...additionalImages];
                room.value.imageUrl = availableImages[0];
            }

            selectedImage.value = roomImages.value[0];

            // Tải phòng liên quan
            await loadRelatedRooms();

            // Lấy đánh giá từ phòng nếu có, hoặc tạo dữ liệu giả
            if (roomData.recentReviews && roomData.recentReviews.length > 0) {
                reviews.value = roomData.recentReviews;
            } else {
                generateFakeReviews();
            }
        } else {
            // Không tìm thấy phòng, chuyển về trang danh sách
            router.push('/rooms');
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu phòng:', error);
    } finally {
        loading.value = false;
    }
});

// Kiểm tra mã giảm giá (giả lập)
const checkDiscountCode = () => {
    if (!booking.value.discountCode) {
        discountStatus.value.message = 'Vui lòng nhập mã giảm giá';
        return;
    }

    discountStatus.value.loading = true;

    // Giả lập kiểm tra mã giảm giá
    setTimeout(() => {
        // Xác minh một số mã mẫu
        const validCodes = {
            'SUMMER10': 10,
            'WELCOME15': 15,
            'SPECIAL20': 20
        };

        const discount = validCodes[booking.value.discountCode.toUpperCase()];

        if (discount) {
            discountStatus.value.valid = true;
            discountStatus.value.applied = true;
            discountStatus.value.discount = discount;
            discountStatus.value.message = `Đã áp dụng mã giảm giá ${discount}%`;
        } else {
            discountStatus.value.valid = false;
            discountStatus.value.applied = false;
            discountStatus.value.message = 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
        }

        discountStatus.value.loading = false;
    }, 1000);
};

// Thêm phương thức xóa mã giảm giá
const clearDiscountCode = () => {
    booking.value.discountCode = '';
    discountStatus.value.valid = false;
    discountStatus.value.applied = false;
    discountStatus.value.message = '';
    discountStatus.value.discount = 0;
    discountStatus.value.code = '';
};

// Chuẩn bị dữ liệu đặt phòng
const prepareBookingData = () => {
    if (!room.value || !booking.value.checkInDate || !booking.value.checkOutDate) {
        return null;
    }

    return {
        roomId: room.value.id,
        roomNumber: room.value.roomNumber,
        roomType: room.value.roomTypeName,
        checkInDate: formatDate(booking.value.checkInDate),
        checkOutDate: formatDate(booking.value.checkOutDate),
        adults: booking.value.guests,
        children: 0, // Có thể bổ sung sau
        specialRequests: booking.value.specialRequests,
        totalPrice: totalPrice.value,
        discountCode: discountStatus.value.applied ? booking.value.discountCode : null,
        services: booking.value.services.map(serviceId => {
            const service = availableServices.value.find(s => s.id === serviceId);
            return {
                id: service.id,
                name: service.name,
                price: service.price
            };
        }),
        paymentMethod: booking.value.payViaVnpay ? 'VNPAY' : 'CASH'
    };
};

// Xử lý đặt phòng
const handleBooking = () => {
    if (!room.value || !booking.value.checkInDate || !booking.value.checkOutDate) {
        alert('Vui lòng chọn ngày nhận và trả phòng');
        return;
    }

    const bookingData = prepareBookingData();
    console.log('Dữ liệu đặt phòng:', bookingData);

    // Chuyển đến trang xác nhận đặt phòng
    router.push({
        path: '/booking/confirm',
        query: {
            roomId: roomId.value,
            checkIn: formatDate(booking.value.checkInDate),
            checkOut: formatDate(booking.value.checkOutDate),
            guests: booking.value.guests,
            services: booking.value.services.join(','),
            discount: booking.value.discountCode,
            payment: booking.value.payViaVnpay ? 'vnpay' : 'cash'
        }
    });
};

// Xử lý gửi đánh giá
const submitReview = () => {
    if (!reviewForm.value.name || !reviewForm.value.comment || reviewForm.value.rating === 0) {
        alert('Vui lòng điền đầy đủ thông tin đánh giá');
        return;
    }

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

        alert('Cảm ơn bạn đã gửi đánh giá!');
    }, 1000);
};

useHead({
    title: computed(() => room.value ? `${room.value.roomTypeName} - Chi tiết phòng` : 'Chi tiết phòng'),
    meta: [
        {
            name: 'description',
            content: computed(() => room.value ?
                `${room.value.description || 'Chi tiết phòng khách sạn sang trọng với nhiều tiện nghi hiện đại.'}` :
                'Chi tiết phòng khách sạn')
        }
    ]
});
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

                        <div class="mb-4">
                            <label class="block text-gray-700 mb-1">Yêu cầu đặc biệt</label>
                            <Textarea v-model="booking.specialRequests" rows="3" class="w-full" placeholder="Nhập yêu cầu đặc biệt (nếu có)" />
                        </div>

                        <!-- Thêm phần dịch vụ bổ sung -->
                        <div class="mb-4">
                            <h3 class="font-semibold text-gray-700 mb-2">Dịch vụ bổ sung</h3>
                            <div class="space-y-2">
                                <div v-for="service in availableServices" :key="service.id" class="flex items-center">
                                    <Checkbox
                                        v-model="booking.services"
                                        :value="service.id"
                                        :binary="false"
                                        :inputId="`service_${service.id}`"
                                    />
                                    <label :for="`service_${service.id}`" class="ml-2 flex-grow">
                                        {{ service.name }}
                                        <span class="text-amber-600 font-medium">{{ formatCurrency(service.price) }}</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Thêm phần mã giảm giá -->
                        <div class="mb-4">
                            <h3 class="font-semibold text-gray-700 mb-2">Mã giảm giá</h3>
                            <div class="flex space-x-2">
                                <InputText
                                    v-model="booking.discountCode"
                                    placeholder="Nhập mã giảm giá"
                                    class="flex-grow"
                                    :disabled="discountStatus.applied"
                                />
                                <span v-if="discountStatus.loading" class="pi pi-spin pi-spinner text-blue-500"></span>
                                <Button v-else-if="discountStatus.applied"
                                    icon="pi pi-times"
                                    class="p-button-danger p-button-text p-button-sm"
                                    @click="clearDiscountCode"
                                    aria-label="Xóa mã giảm giá" />
                                <Button v-else
                                    type="button"
                                    label="Áp dụng"
                                    class="p-button-sm"
                                    @click="checkDiscountCode" />
                            </div>
                            <small v-if="discountStatus.message" :class="discountStatus.valid ? 'text-green-600' : 'text-red-600'">
                                {{ discountStatus.message }}
                            </small>
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
                            <div v-if="booking.services && booking.services.length > 0" class="flex justify-between mb-3">
                                <span class="text-gray-700">Dịch vụ bổ sung:</span>
                                <span class="font-semibold">{{ formatCurrency(serviceTotal) }}</span>
                            </div>
                            <div v-if="discountStatus.applied" class="flex justify-between mb-3 text-green-600">
                                <span>Giảm giá ({{ discountStatus.code }}):</span>
                                <span class="font-semibold">-{{ formatCurrency(discountStatus.discount) }}</span>
                            </div>
                            <div class="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
                                <span>Tổng cộng:</span>
                                <span class="text-amber-600">{{ formatCurrency(totalPrice) }}</span>
                            </div>
                        </div>

                        <!-- Thêm phần thanh toán VNPay -->
                        <div class="mb-4">
                            <div class="flex items-center">
                                <Checkbox v-model="booking.payViaVnpay" :binary="true" inputId="pay_vnpay" />
                                <label for="pay_vnpay" class="ml-2 flex items-center">
                                    <span class="mr-2">Thanh toán qua VNPay</span>
                                    <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPay" class="h-6" />
                                </label>
                            </div>
                            <small class="text-gray-500 mt-1 block">Bạn sẽ được chuyển đến cổng thanh toán VNPay sau khi nhấn nút tiếp tục</small>
                        </div>

                        <Button @click="handleBooking" label="Tiếp tục đặt phòng" class="w-full p-button-lg" :disabled="!booking.checkInDate || !booking.checkOutDate" />

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
