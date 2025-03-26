<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Import trực tiếp các ảnh
import nhaNghi1 from '@/assets/images/nha-nghi-1.webp';
import nhaNghi2 from '@/assets/images/nha-nghi-2.webp';
import nhaNghi3 from '@/assets/images/nha-nghi-3.webp';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const booking = ref({
    id: 'B453252',
    roomName: 'Phòng Deluxe',
    roomImage: nhaNghi1,
    checkInDate: '2023-12-25',
    checkOutDate: '2023-12-30',
    guestName: 'Nguyễn Văn A',
    guestEmail: 'nguyenvana@example.com',
    guestPhone: '0901234567',
    totalGuests: 2,
    totalPrice: 9500000,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: 'CREDIT_CARD'
});
const loading = ref(false);

// Sử dụng các biến import cho danh sách ảnh
const roomImages = ref([
    nhaNghi1,
    nhaNghi2,
    nhaNghi3
]);

const selectedImage = ref(nhaNghi1);

onMounted(async () => {
    const bookingId = route.params.id;
    loading.value = true;

    try {
        // Giả lập lấy dữ liệu từ API
        setTimeout(() => {
            // Thực tế sẽ gọi API lấy dữ liệu thay vì fake dữ liệu
            // Giả sử đã set dữ liệu booking mặc định ở trên
            booking.value.id = bookingId || 'B453252';
            loading.value = false;
        }, 800);
    } catch (error) {
        console.error('Lỗi khi tải thông tin đặt phòng:', error);
        loading.value = false;
    }
});

// Format tiền tệ
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Format ngày
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Tính số đêm
const calculateNights = () => {
    if (!booking.value.checkInDate || !booking.value.checkOutDate) return 0;
    const checkIn = new Date(booking.value.checkInDate);
    const checkOut = new Date(booking.value.checkOutDate);
    return Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
};

// Lấy class và label cho trạng thái đặt phòng
const getStatusClass = (status) => {
    switch (status) {
        case 'NEW':
            return 'bg-blue-100 text-blue-800';
        case 'CONFIRMED':
            return 'bg-green-100 text-green-800';
        case 'CHECK_IN':
            return 'bg-amber-100 text-amber-800';
        case 'CHECK_OUT':
            return 'bg-purple-100 text-purple-800';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'NEW':
            return 'Mới';
        case 'CONFIRMED':
            return 'Đã xác nhận';
        case 'CHECK_IN':
            return 'Đã nhận phòng';
        case 'CHECK_OUT':
            return 'Đã trả phòng';
        case 'CANCELLED':
            return 'Đã hủy';
        default:
            return status;
    }
};

// Lấy class và label cho trạng thái thanh toán
const getPaymentStatusClass = (paymentStatus) => {
    switch (paymentStatus) {
        case 'PAID':
            return 'bg-green-100 text-green-800';
        case 'UNPAID':
            return 'bg-red-100 text-red-800';
        case 'PARTIAL':
            return 'bg-amber-100 text-amber-800';
        case 'REFUNDED':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getPaymentStatusLabel = (paymentStatus) => {
    switch (paymentStatus) {
        case 'PAID':
            return 'Đã thanh toán';
        case 'UNPAID':
            return 'Chưa thanh toán';
        case 'PARTIAL':
            return 'Đã đặt cọc';
        case 'REFUNDED':
            return 'Đã hoàn tiền';
        default:
            return paymentStatus;
    }
};

// Lấy label cho phương thức thanh toán
const getPaymentMethodLabel = (method) => {
    switch (method) {
        case 'CREDIT_CARD':
            return 'Thẻ tín dụng';
        case 'MOMO':
            return 'Ví MoMo';
        case 'VNPAY':
            return 'VNPay';
        case 'BANK_TRANSFER':
            return 'Chuyển khoản';
        case 'CASH':
            return 'Tiền mặt';
        default:
            return method || 'Thẻ tín dụng';
    }
};

// Hủy đặt phòng
const cancelBooking = () => {
    // Xác nhận trước khi hủy
    if (!confirm('Bạn có chắc chắn muốn hủy đặt phòng này không?')) {
        return;
    }

    // Giả lập API hủy đặt phòng
    booking.value.status = 'CANCELLED';

    toast.add({
        severity: 'success',
        summary: 'Hủy đặt phòng thành công',
        detail: 'Đơn đặt phòng của bạn đã được hủy',
        life: 3000
    });
};

// Thêm hàm để thay đổi ảnh đang được hiển thị
const changeImage = (image) => {
    selectedImage.value = image;
};
</script>

<template>
    <div class="booking-confirmation py-8 bg-gray-50">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Chi tiết đặt phòng</h1>
                <div class="text-right">
                    <span class="text-gray-600">Mã đặt phòng:</span>
                    <span class="font-bold text-amber-700 ml-2">#{{ booking?.id || 'B453252' }}</span>
                </div>
            </div>

            <div v-if="loading" class="flex justify-center py-10">
                <i class="pi pi-spin pi-spinner text-4xl text-amber-500"></i>
            </div>

            <div v-else>
                <!-- Thẻ trạng thái -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <div class="p-6 border-b border-gray-100">
                        <div class="flex justify-between items-center mb-2">
                            <h2 class="text-xl font-semibold text-gray-800">Trạng thái đơn phòng</h2>
                            <span :class="[getStatusClass(booking.status), 'px-3 py-1 rounded-full text-sm font-medium']">
                                {{ getStatusLabel(booking.status) }}
                            </span>
                        </div>
                        <div class="flex justify-between mt-4">
                            <div class="flex items-center text-gray-600">
                                <i class="pi pi-calendar-plus mr-2 text-gray-500"></i>
                                <span>{{ formatDate(booking.checkInDate) }}</span>
                                <span class="px-3">→</span>
                                <i class="pi pi-calendar-minus mr-2 text-gray-500"></i>
                                <span>{{ formatDate(booking.checkOutDate) }}</span>
                            </div>
                            <div :class="[getPaymentStatusClass(booking.paymentStatus), 'px-3 py-1 rounded-full text-sm font-medium flex items-center']">
                                <i class="pi pi-wallet mr-2"></i>
                                {{ getPaymentStatusLabel(booking.paymentStatus) }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Thông tin chi tiết -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Thông tin phòng -->
                    <div class="md:col-span-2">
                        <div class="bg-white rounded-lg shadow-md overflow-hidden">
                            <div class="p-6">
                                <h2 class="text-xl font-semibold text-gray-800 mb-4">Thông tin phòng</h2>

                                <div class="mb-6">
                                    <div class="relative overflow-hidden rounded-lg mb-4 shadow-lg">
                                        <img
                                            :src="selectedImage"
                                            :alt="booking.roomName"
                                            class="w-full h-80 object-cover transition-transform duration-500 hover:scale-105"
                                        />
                                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4">
                                            <h3 class="text-xl font-bold">{{ booking.roomName }}</h3>
                                            <div class="flex items-center mt-1">
                                                <span class="bg-amber-500 text-white text-xs px-2 py-1 rounded-full mr-2">Deluxe</span>
                                                <div class="flex items-center text-amber-300">
                                                    <i class="pi pi-star-fill mr-1"></i>
                                                    <i class="pi pi-star-fill mr-1"></i>
                                                    <i class="pi pi-star-fill mr-1"></i>
                                                    <i class="pi pi-star-fill mr-1"></i>
                                                    <i class="pi pi-star-fill"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Cập nhật gallery với các nút điều hướng -->
                                    <div class="relative">
                                        <div class="flex space-x-3 justify-center">
                                            <div
                                                v-for="(image, index) in roomImages"
                                                :key="index"
                                                @click="changeImage(image)"
                                                class="cursor-pointer rounded-lg overflow-hidden shadow-md transition-all duration-300"
                                                :class="{ 'ring-2 ring-amber-500 ring-offset-2': selectedImage === image }"
                                            >
                                                <img
                                                    :src="image"
                                                    :alt="`${booking.roomName} - ${index + 1}`"
                                                    class="w-32 h-20 object-cover hover:opacity-90"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-2 gap-4 mb-4">
                                        <div class="flex items-center bg-amber-50 p-3 rounded-lg">
                                            <i class="pi pi-users text-amber-600 mr-3 text-xl"></i>
                                            <div>
                                                <div class="text-sm text-gray-500">Số lượng khách</div>
                                                <div class="font-medium">{{ booking.totalGuests || 2 }} người</div>
                                            </div>
                                        </div>
                                        <div class="flex items-center bg-amber-50 p-3 rounded-lg">
                                            <i class="pi pi-calendar text-amber-600 mr-3 text-xl"></i>
                                            <div>
                                                <div class="text-sm text-gray-500">Thời gian</div>
                                                <div class="font-medium">{{ calculateNights() }} đêm</div>
                                            </div>
                                        </div>
                                        <div class="flex items-center bg-amber-50 p-3 rounded-lg">
                                            <i class="pi pi-map-marker text-amber-600 mr-3 text-xl"></i>
                                            <div>
                                                <div class="text-sm text-gray-500">Vị trí</div>
                                                <div class="font-medium">Tầng 4</div>
                                            </div>
                                        </div>
                                        <div class="flex items-center bg-amber-50 p-3 rounded-lg">
                                            <i class="pi pi-check-circle text-amber-600 mr-3 text-xl"></i>
                                            <div>
                                                <div class="text-sm text-gray-500">Trạng thái</div>
                                                <div class="font-medium">Đã xác nhận</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-6">
                                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Chi tiết gói</h3>
                                    <ul class="space-y-2 text-gray-600">
                                        <li class="flex items-center">
                                            <i class="pi pi-check text-green-500 mr-2"></i>
                                            <span>Ăn sáng miễn phí</span>
                                        </li>
                                        <li class="flex items-center">
                                            <i class="pi pi-check text-green-500 mr-2"></i>
                                            <span>Wifi miễn phí tốc độ cao</span>
                                        </li>
                                        <li class="flex items-center">
                                            <i class="pi pi-check text-green-500 mr-2"></i>
                                            <span>Miễn phí hủy trước 24h</span>
                                        </li>
                                        <li class="flex items-center">
                                            <i class="pi pi-check text-green-500 mr-2"></i>
                                            <span>Dọn phòng hàng ngày</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Lịch trình</h3>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div class="bg-amber-50 p-4 rounded-lg">
                                            <div class="text-sm text-gray-500 mb-1">Nhận phòng</div>
                                            <div class="font-medium">{{ formatDate(booking.checkInDate) }}</div>
                                            <div class="text-sm text-gray-600">Từ 14:00</div>
                                        </div>
                                        <div class="bg-amber-50 p-4 rounded-lg">
                                            <div class="text-sm text-gray-500 mb-1">Trả phòng</div>
                                            <div class="font-medium">{{ formatDate(booking.checkOutDate) }}</div>
                                            <div class="text-sm text-gray-600">Trước 12:00</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar - Thanh toán và thông tin khách hàng -->
                    <div class="md:col-span-1">
                        <!-- Thông tin thanh toán -->
                        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                            <div class="p-6">
                                <h2 class="text-xl font-semibold text-gray-800 mb-4">Thông tin thanh toán</h2>

                                <div class="space-y-3">
                                    <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span class="text-gray-600">Phương thức:</span>
                                        <span class="font-medium">{{ getPaymentMethodLabel(booking.paymentMethod) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span class="text-gray-600">Tiền phòng:</span>
                                        <span>{{ formatCurrency(8500000) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span class="text-gray-600">Thuế & phí:</span>
                                        <span>{{ formatCurrency(1000000) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center text-lg font-semibold mt-2">
                                        <span>Tổng tiền:</span>
                                        <span class="text-amber-700">{{ formatCurrency(booking.totalPrice) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Thông tin khách hàng -->
                        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                            <div class="p-6">
                                <h2 class="text-xl font-semibold text-gray-800 mb-4">Thông tin khách hàng</h2>

                                <div class="space-y-3">
                                    <div class="flex items-center border-b border-gray-100 pb-2">
                                        <i class="pi pi-user text-gray-500 mr-3"></i>
                                        <div>
                                            <div class="text-sm text-gray-500">Họ tên</div>
                                            <div>{{ booking.guestName }}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center border-b border-gray-100 pb-2">
                                        <i class="pi pi-envelope text-gray-500 mr-3"></i>
                                        <div>
                                            <div class="text-sm text-gray-500">Email</div>
                                            <div>{{ booking.guestEmail }}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center border-b border-gray-100 pb-2">
                                        <i class="pi pi-phone text-gray-500 mr-3"></i>
                                        <div>
                                            <div class="text-sm text-gray-500">Số điện thoại</div>
                                            <div>{{ booking.guestPhone }}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center">
                                        <i class="pi pi-users text-gray-500 mr-3"></i>
                                        <div>
                                            <div class="text-sm text-gray-500">Số lượng khách</div>
                                            <div>{{ booking.totalGuests || 2 }} người</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Nút hành động -->
                        <div class="flex gap-3 mt-4">
                            <button v-if="booking.status === 'NEW' || booking.status === 'CONFIRMED'" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center" @click="cancelBooking">
                                <i class="pi pi-times-circle mr-2"></i> Hủy đặt phòng
                            </button>
                            <button @click="router.push('/my-bookings')" class="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 flex items-center justify-center"><i class="pi pi-arrow-left mr-2"></i> Quay lại</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.booking-confirmation {
    min-height: calc(100vh - 300px);
}

/* Thêm animation cho việc chuyển đổi ảnh */
img {
    transition: all 0.3s ease;
}

.ring-2 {
    position: relative;
}

.ring-2::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    background-color: #f59e0b;
    border-radius: 50%;
}
</style>
