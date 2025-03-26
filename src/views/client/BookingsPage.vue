<script setup>
import AuthService from '@/services/AuthService';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const bookings = ref([]);
const loading = ref(true);
const currentUser = ref(null);

onMounted(async () => {
    // Kiểm tra xác thực - nếu không phải user thì chuyển về trang chủ
    if (!AuthService.isClientAuthenticated()) {
        router.push('/');
        return;
    }

    currentUser.value = AuthService.getCurrentUser();

    // Tải danh sách đặt phòng
    try {
        loading.value = true;

        // Lấy booking từ localStorage nếu có
        const completedBooking = localStorage.getItem('completedBooking');
        if (completedBooking) {
            const parsed = JSON.parse(completedBooking);
            bookings.value = [parsed];
        }

        // Thêm dữ liệu mẫu
        bookings.value.push({
            id: 'B123456',
            roomName: 'Phòng Deluxe',
            roomImage: '/images/rooms/deluxe.jpg',
            checkInDate: '2023-11-15',
            checkOutDate: '2023-11-20',
            totalPrice: 9000000,
            status: 'CONFIRMED',
            paymentStatus: 'PAID'
        });

        bookings.value.push({
            id: 'B123457',
            roomName: 'Phòng Standard',
            roomImage: '/images/rooms/standard.jpg',
            checkInDate: '2023-12-25',
            checkOutDate: '2023-12-30',
            totalPrice: 5000000,
            status: 'NEW',
            paymentStatus: 'UNPAID'
        });
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu đặt phòng:', error);
    } finally {
        loading.value = false;
    }
});

// Hủy đặt phòng
const cancelBooking = (bookingId) => {
    // Kiểm tra quyền
    if (!AuthService.isClientAuthenticated()) {
        return;
    }

    // Cập nhật trạng thái đặt phòng
    const index = bookings.value.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
        bookings.value[index].status = 'CANCELLED';
    }
};

// Tiếp tục thanh toán
const continuePayment = (bookingId) => {
    router.push(`/booking/checkout?id=${bookingId}`);
};

// Format tình trạng đặt phòng
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

// Format tình trạng thanh toán
const getPaymentStatusLabel = (status) => {
    switch (status) {
        case 'PAID':
            return 'Đã thanh toán';
        case 'UNPAID':
            return 'Chưa thanh toán';
        case 'PARTIAL':
            return 'Đã đặt cọc';
        case 'REFUNDED':
            return 'Đã hoàn tiền';
        default:
            return status;
    }
};

// Lấy class cho trạng thái
const getStatusClass = (status) => {
    switch (status) {
        case 'NEW':
            return 'bg-blue-100 text-blue-800';
        case 'CONFIRMED':
            return 'bg-green-100 text-green-800';
        case 'CHECK_IN':
            return 'bg-purple-100 text-purple-800';
        case 'CHECK_OUT':
            return 'bg-gray-100 text-gray-800';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// Format tiền tệ
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(value);
};

// Format ngày
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Kiểm tra có thể hủy đơn không
const canCancelBooking = (booking) => {
    return ['NEW', 'CONFIRMED'].includes(booking.status);
};

// Kiểm tra cần thanh toán không
const needsPayment = (booking) => {
    return booking.paymentStatus === 'UNPAID' && booking.status !== 'CANCELLED';
};
</script>

<template>
    <div class="container mx-auto px-4 py-6">
        <h1 class="text-2xl font-bold mb-6">Đặt phòng của tôi</h1>

        <div v-if="loading" class="text-center py-12">
            <i class="pi pi-spin pi-spinner text-4xl text-amber-500"></i>
            <p class="mt-4 text-gray-600">Đang tải dữ liệu đặt phòng...</p>
        </div>

        <div v-else>
            <div v-if="bookings.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
                <i class="pi pi-calendar-times text-5xl text-gray-400 mb-4"></i>
                <h2 class="text-xl font-semibold mb-2">Bạn chưa có đặt phòng nào</h2>
                <p class="text-gray-600 mb-6">Hãy đặt phòng ngay để trải nghiệm dịch vụ của chúng tôi</p>
                <router-link to="/rooms" class="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-lg transition"> Đặt phòng ngay </router-link>
            </div>

            <div v-else class="space-y-6">
                <div v-for="booking in bookings" :key="booking.id" class="bg-white rounded-lg shadow overflow-hidden">
                    <!-- Header -->
                    <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
                        <div>
                            <span class="font-semibold">Mã đặt phòng: {{ booking.id }}</span>
                        </div>
                        <div>
                            <span class="px-3 py-1 rounded-full text-sm" :class="getStatusClass(booking.status)">
                                {{ getStatusLabel(booking.status) }}
                            </span>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="p-4 md:p-6">
                        <div class="flex flex-col md:flex-row">
                            <!-- Thông tin phòng -->
                            <div class="md:w-1/4 mb-4 md:mb-0">
                                <img :src="booking.roomImage" alt="Room" class="w-full h-48 object-cover rounded-lg" />
                            </div>

                            <!-- Chi tiết đặt phòng -->
                            <div class="md:w-3/4 md:pl-6">
                                <h3 class="text-xl font-semibold mb-2">{{ booking.roomName }}</h3>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p class="text-gray-500 text-sm">Ngày nhận phòng</p>
                                        <p class="font-medium">{{ formatDate(booking.checkInDate) }}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-500 text-sm">Ngày trả phòng</p>
                                        <p class="font-medium">{{ formatDate(booking.checkOutDate) }}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-500 text-sm">Tổng tiền</p>
                                        <p class="font-medium">{{ formatCurrency(booking.totalPrice) }}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-500 text-sm">Trạng thái thanh toán</p>
                                        <p class="font-medium">{{ getPaymentStatusLabel(booking.paymentStatus) }}</p>
                                    </div>
                                </div>

                                <!-- Action buttons -->
                                <div class="flex flex-wrap gap-2 mt-4">
                                    <router-link :to="`/booking/confirmation/${booking.id}`" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"> Xem chi tiết </router-link>

                                    <button v-if="canCancelBooking(booking)" @click="cancelBooking(booking.id)" class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm">Hủy đặt phòng</button>

                                    <button v-if="needsPayment(booking)" @click="continuePayment(booking.id)" class="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded text-sm">Thanh toán ngay</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
