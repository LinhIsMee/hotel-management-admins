<script setup>
import AuthService from '@/services/AuthService';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const bookings = ref([]);
const loading = ref(true);
const currentUser = ref(null);
const API_BASE_URL = 'http://localhost:9000';

// Hàm lấy token từ localStorage
const getAuthToken = () => {
    try {
        // Lấy thông tin người dùng từ AuthService
        const user = AuthService.getCurrentUser();
        if (!user || !user.accessToken) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi xác thực',
                detail: 'Không tìm thấy token đăng nhập, vui lòng đăng nhập lại',
                life: 3000
            });
            return null;
        }
        return user.accessToken;
    } catch (error) {
        console.error('Lỗi khi lấy token:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi xác thực',
            detail: 'Có lỗi xảy ra khi xác thực, vui lòng đăng nhập lại',
            life: 3000
        });
        return null;
    }
};

// Tạo header xác thực
const getAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) return null;

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Lấy danh sách đặt phòng của người dùng hiện tại
const fetchCurrentUserBookings = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) {
            loading.value = false;
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/user/bookings/my-bookings`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi tải danh sách đặt phòng: ${response.statusText} (${response.status})`);
        }

        const result = await response.json();
        console.log('Dữ liệu booking của người dùng:', result);

        bookings.value = Array.isArray(result) ? result : [];
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu đặt phòng:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể tải danh sách đặt phòng của bạn',
            life: 3000
        });
        bookings.value = [];
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    if (!AuthService.isClientAuthenticated()) {
        router.push('/auth/login?redirect=/my-bookings&clientAuth=true');
        return;
    }

    currentUser.value = AuthService.getCurrentUser();
    await fetchCurrentUserBookings();
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
        case 'PENDING':
            return 'bg-blue-100 text-blue-800';
        case 'CONFIRMED':
            return 'bg-green-100 text-green-800';
        case 'CHECK_IN':
        case 'CHECKED_IN':
            return 'bg-amber-100 text-amber-800';
        case 'CHECK_OUT':
        case 'COMPLETED':
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
        case 'PENDING':
            return 'Chờ xác nhận';
        case 'CONFIRMED':
            return 'Đã xác nhận';
        case 'CHECK_IN':
        case 'CHECKED_IN':
            return 'Đã nhận phòng';
        case 'CHECK_OUT':
        case 'COMPLETED':
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
        case '00':  // Mã thành công từ VNPay
            return 'bg-green-100 text-green-800';
        case 'UNPAID':
        case 'PENDING':
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
        case '00':  // Mã thành công từ VNPay
            return 'Đã thanh toán';
        case 'UNPAID':
        case 'PENDING':
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

// Lấy thông tin phòng để hiển thị
const getRoomNames = (rooms) => {
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
        return 'Không có thông tin phòng';
    }

    return rooms.map(room => `${room.roomNumber} (${room.roomType})`).join(', ');
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
                                    <span class="font-medium">{{ getRoomNames(booking.rooms) }}</span>
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
                                    <span class="font-semibold">{{ booking.formattedAmount || formatCurrency(booking.totalPrice) }}</span>
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
                                    <td class="px-6 py-4">
                                        <div class="text-sm text-gray-900">{{ getRoomNames(booking.rooms) }}</div>
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
                                        <div class="text-sm font-semibold text-gray-900">{{ booking.formattedAmount || formatCurrency(booking.totalPrice) }}</div>
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
