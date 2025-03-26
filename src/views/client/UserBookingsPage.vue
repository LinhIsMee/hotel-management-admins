<script setup>
import AuthService from '@/services/AuthService';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const bookings = ref([]);
const loading = ref(true);
const currentUser = ref(null);

onMounted(async () => {
    if (!AuthService.isClientAuthenticated()) {
        router.push('/auth/login?redirect=/my-bookings&clientAuth=true');
        return;
    }

    currentUser.value = AuthService.getCurrentUser();

    try {
        // Giả lập tải dữ liệu đặt phòng từ API
        const response = await fetch('/demo/data/bookings.json');
        const data = await response.json();

        // Lọc các đơn đặt phòng theo người dùng hiện tại (giả lập)
        bookings.value = data.data.slice(0, 5).map((booking) => ({
            ...booking,
            id: Math.floor(Math.random() * 10000), // Tạo ID ngẫu nhiên
            customerEmail: currentUser.value?.email || 'guest@example.com'
        }));
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu đặt phòng:', error);
    } finally {
        loading.value = false;
    }
});

// Định dạng ngày
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

// Định dạng tiền tệ
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Chuyển hướng đến trang chi tiết đặt phòng
const viewBookingDetails = (bookingId) => {
    router.push(`/booking/confirmation/${bookingId}`);
};
</script>

<template>
    <div class="user-bookings-page bg-gray-50 min-h-screen py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-8">Lịch sử đặt phòng</h1>

            <div v-if="loading" class="flex justify-center py-10">
                <ProgressSpinner />
            </div>

            <div v-else-if="bookings.length === 0" class="bg-white p-10 rounded-lg shadow-md text-center">
                <i class="pi pi-calendar-times text-5xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">Bạn chưa có đơn đặt phòng nào</h3>
                <p class="text-gray-600 mb-4">Hãy khám phá các phòng của chúng tôi và đặt ngay hôm nay!</p>
                <Button label="Xem danh sách phòng" @click="router.push('/rooms')" />
            </div>

            <div v-else>
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-4 md:p-6 border-b border-gray-200">
                        <h2 class="text-xl font-semibold text-gray-800">Danh sách đơn đặt phòng của bạn</h2>
                    </div>

                    <!-- Card view cho mobile -->
                    <div class="md:hidden">
                        <div v-for="booking in bookings" :key="booking.id" class="p-4 border-b border-gray-200">
                            <div class="mb-3 flex justify-between items-center">
                                <div>
                                    <span class="font-semibold text-gray-700">Mã đặt phòng: #{{ booking.id }}</span>
                                </div>
                                <span :class="[getStatusClass(booking.status), 'px-2 py-1 rounded-full text-xs font-medium']">
                                    {{ getStatusLabel(booking.status) }}
                                </span>
                            </div>

                            <div class="space-y-2 mb-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Phòng:</span>
                                    <span class="font-medium">{{ booking.roomName }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Nhận phòng:</span>
                                    <span>{{ formatDate(booking.checkInDate) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Trả phòng:</span>
                                    <span>{{ formatDate(booking.checkOutDate) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Tổng tiền:</span>
                                    <span class="font-semibold">{{ formatCurrency(booking.totalAmount) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Thanh toán:</span>
                                    <span :class="[getPaymentStatusClass(booking.paymentStatus), 'px-2 py-1 rounded-full text-xs font-medium']">
                                        {{ getPaymentStatusLabel(booking.paymentStatus) }}
                                    </span>
                                </div>
                            </div>

                            <Button label="Xem chi tiết" @click="viewBookingDetails(booking.id)" class="w-full" />
                        </div>
                    </div>

                    <!-- Table view cho desktop -->
                    <div class="hidden md:block overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đặt phòng</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhận phòng</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trả phòng</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="booking in bookings" :key="booking.id">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">#{{ booking.id }}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900">{{ booking.roomName }}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900">{{ formatDate(booking.checkInDate) }}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900">{{ formatDate(booking.checkOutDate) }}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span :class="[getStatusClass(booking.status), 'px-2 py-1 rounded-full text-xs font-medium']">
                                            {{ getStatusLabel(booking.status) }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span :class="[getPaymentStatusClass(booking.paymentStatus), 'px-2 py-1 rounded-full text-xs font-medium']">
                                            {{ getPaymentStatusLabel(booking.paymentStatus) }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-semibold text-gray-900">{{ formatCurrency(booking.totalAmount) }}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Button label="Xem chi tiết" @click="viewBookingDetails(booking.id)" severity="secondary" size="small" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
