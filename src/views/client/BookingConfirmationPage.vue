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
    <div class="booking-confirmation-page bg-gray-50 min-h-screen py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div v-if="loading" class="flex justify-center py-10">
                <ProgressSpinner />
            </div>

            <div v-else-if="!booking" class="bg-white p-10 rounded-lg shadow-md text-center">
                <i class="pi pi-exclamation-triangle text-5xl text-yellow-500 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy thông tin đặt phòng</h3>
                <p class="text-gray-600 mb-4">Đặt phòng này không tồn tại hoặc đã hết hạn.</p>
                <Button label="Quay lại trang chủ" @click="router.push('/')" />
            </div>

            <div v-else>
                <!-- Thông báo thành công -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
                    <div class="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <i class="pi pi-check-circle text-3xl text-green-500"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-2">Đặt phòng thành công!</h1>
                    <p class="text-gray-600 mb-2">Cảm ơn bạn đã đặt phòng tại Luxury Hotel</p>
                    <p class="font-medium">Mã đặt phòng: <span class="text-amber-600">{{ booking.id }}</span></p>
                    <p class="text-sm text-gray-500 mt-2">Email xác nhận đã được gửi đến {{ booking.contactInfo.email }}</p>
                </div>

                <!-- Thông tin chi tiết đặt phòng -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Thông tin phòng và thời gian -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 class="text-xl font-semibold text-gray-800 mb-4">Chi tiết đặt phòng</h2>

                            <div class="flex flex-col md:flex-row md:items-center mb-6">
                                <img :src="selectedImage" :alt="booking.roomName" class="w-full md:w-48 h-36 object-cover rounded-lg mb-4 md:mb-0 md:mr-6" />
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ booking.roomName }}</h3>
                                    <div class="flex items-center text-gray-600 mb-1">
                                        <i class="pi pi-users mr-2"></i>
                                        <span>{{ booking.totalGuests }} người</span>
                                    </div>
                                    <div class="flex items-center text-gray-600">
                                        <i class="pi pi-calendar mr-2"></i>
                                        <span>{{ formatDate(booking.checkInDate) }} - {{ formatDate(booking.checkOutDate) }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Chi tiết lịch trình -->
                            <div class="border border-gray-200 rounded-lg p-4 mb-6">
                                <div class="flex items-start border-b border-gray-200 pb-4 mb-4">
                                    <div class="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                        <i class="pi pi-calendar-plus text-amber-600"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold mb-2">Nhận phòng</h4>
                                        <p class="text-gray-700">{{ formatDate(booking.checkInDate) }}</p>
                                        <p class="text-gray-600 text-sm">Từ 14:00 (Nhận phòng sớm có phụ phí)</p>
                                    </div>
                                </div>

                                <div class="flex items-start">
                                    <div class="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                        <i class="pi pi-calendar-minus text-amber-600"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold mb-2">Trả phòng</h4>
                                        <p class="text-gray-700">{{ formatDate(booking.checkOutDate) }}</p>
                                        <p class="text-gray-600 text-sm">Đến 12:00 (Trả phòng muộn có phụ phí)</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Dịch vụ bổ sung -->
                            <div v-if="hasAdditionalServices" class="mb-6">
                                <h3 class="font-semibold text-gray-800 mb-3">Dịch vụ bổ sung</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                                    <div v-if="booking.services.breakfast" class="flex items-center">
                                        <i class="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>Bữa sáng</span>
                                    </div>
                                    <div v-if="booking.services.earlyCheckin" class="flex items-center">
                                        <i class="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>Nhận phòng sớm</span>
                                    </div>
                                    <div v-if="booking.services.lateCheckout" class="flex items-center">
                                        <i class="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>Trả phòng muộn</span>
                                    </div>
                                    <div v-if="booking.services.airportPickup" class="flex items-center">
                                        <i class="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>Đưa đón sân bay</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Thông tin liên hệ -->
                            <div class="mb-6">
                                <h3 class="font-semibold text-gray-800 mb-3">Thông tin liên hệ</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                                    <div class="flex items-center">
                                        <i class="pi pi-user text-gray-500 mr-2"></i>
                                        <span>{{ booking.guestName }}</span>
                                    </div>
                                    <div class="flex items-center">
                                        <i class="pi pi-envelope text-gray-500 mr-2"></i>
                                        <span>{{ booking.guestEmail }}</span>
                                    </div>
                                    <div class="flex items-center">
                                        <i class="pi pi-phone text-gray-500 mr-2"></i>
                                        <span>{{ booking.guestPhone }}</span>
                                    </div>
                                    <div class="flex items-center">
                                        <i class="pi pi-flag text-gray-500 mr-2"></i>
                                        <span>{{ getCountryName(booking.contactInfo.nationality) }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Yêu cầu đặc biệt -->
                            <div v-if="booking.contactInfo.specialRequests" class="mb-6">
                                <h3 class="font-semibold text-gray-800 mb-3">Yêu cầu đặc biệt</h3>
                                <p class="bg-gray-50 p-3 rounded-lg text-gray-700">{{ booking.contactInfo.specialRequests }}</p>
                            </div>

                            <!-- Chính sách đặt phòng -->
                            <div class="border-t border-gray-200 pt-4">
                                <h3 class="font-semibold text-gray-800 mb-3">Chính sách đặt phòng</h3>
                                <ul class="space-y-2 text-gray-700">
                                    <li class="flex items-start">
                                        <i class="pi pi-info-circle text-blue-500 mr-2 mt-1"></i>
                                        <span>Nhận phòng từ 14:00 và trả phòng trước 12:00.</span>
                                    </li>
                                    <li class="flex items-start">
                                        <i class="pi pi-info-circle text-blue-500 mr-2 mt-1"></i>
                                        <span>Bạn có thể hủy miễn phí trước 1 ngày so với ngày nhận phòng. Nếu hủy muộn hơn, bạn sẽ bị tính phí 1 đêm đầu tiên.</span>
                                    </li>
                                    <li class="flex items-start">
                                        <i class="pi pi-info-circle text-blue-500 mr-2 mt-1"></i>
                                        <span>Khách hàng cần xuất trình giấy tờ tùy thân có ảnh khi nhận phòng.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Thông tin thanh toán -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-4">
                            <h2 class="text-xl font-semibold text-gray-800 mb-4">Tóm tắt thanh toán</h2>

                            <div class="space-y-3 mb-4">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Mã đặt phòng:</span>
                                    <span class="font-semibold">{{ booking.id }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Trạng thái:</span>
                                    <span class="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Đã xác nhận</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Thanh toán:</span>
                                    <span :class="getPaymentStatusClass()">{{ getPaymentStatusLabel() }}</span>
                                </div>
                            </div>

                            <div class="border-t border-gray-200 pt-4 pb-4">
                                <div class="flex justify-between mb-2">
                                    <span class="text-gray-600">Phòng ({{ calculateNights() }} đêm)</span>
                                    <span>{{ formatCurrency(booking.totalPrice) }}</span>
                                </div>

                                <div v-if="booking.services?.breakfast" class="flex justify-between mb-2">
                                    <span class="text-gray-600">Bữa sáng</span>
                                    <span>{{ formatCurrency(getBreakfastTotal()) }}</span>
                                </div>

                                <div v-if="booking.services?.earlyCheckin" class="flex justify-between mb-2">
                                    <span class="text-gray-600">Nhận phòng sớm</span>
                                    <span>{{ formatCurrency(200000) }}</span>
                                </div>

                                <div v-if="booking.services?.lateCheckout" class="flex justify-between mb-2">
                                    <span class="text-gray-600">Trả phòng muộn</span>
                                    <span>{{ formatCurrency(200000) }}</span>
                                </div>

                                <div v-if="booking.services?.airportPickup" class="flex justify-between mb-2">
                                    <span class="text-gray-600">Đưa đón sân bay</span>
                                    <span>{{ formatCurrency(350000) }}</span>
                                </div>

                                <div v-if="booking.couponCode" class="flex justify-between mb-2 text-green-600">
                                    <span>Giảm giá ({{ booking.couponCode }})</span>
                                    <span>-{{ formatCurrency(booking.couponDiscount || 0) }}</span>
                                </div>
                            </div>

                            <div class="border-t border-gray-200 pt-4 mb-6">
                                <div class="flex justify-between font-bold text-lg">
                                    <span>Tổng cộng</span>
                                    <span class="text-amber-600">{{ formatCurrency(booking.totalPrice) }}</span>
                                </div>
                                <div class="text-sm text-gray-500 mt-1">
                                    <span v-if="booking.paymentMethod === 'pay_later'">Thanh toán tại khách sạn</span>
                                    <span v-else-if="booking.paymentMethod === 'bank_transfer'">Chuyển khoản ngân hàng</span>
                                    <span v-else-if="booking.paymentMethod === 'credit_card'">Đã thanh toán qua thẻ</span>
                                    <span v-else-if="booking.paymentMethod === 'e_wallet'">Đã thanh toán qua ví điện tử</span>
                                </div>
                            </div>

                            <div class="space-y-3">
                                <Button label="In xác nhận đặt phòng" icon="pi pi-print" class="w-full p-button-outlined" @click="printBookingConfirmation" />
                                <Button label="Sửa đổi đặt phòng" icon="pi pi-pencil" class="w-full p-button-outlined" @click="editBooking" />
                                <Button v-if="canCancel" label="Hủy đặt phòng" icon="pi pi-times" class="w-full p-button-outlined p-button-danger" @click="showCancelDialog = true" />
                            </div>
                        </div>

                        <!-- Thông tin khách sạn -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h2 class="text-xl font-semibold text-gray-800 mb-4">Thông tin khách sạn</h2>

                            <div class="space-y-4">
                                <div class="flex items-start">
                                    <i class="pi pi-map-marker text-amber-600 text-xl mr-3 mt-1"></i>
                                    <div>
                                        <h3 class="font-semibold mb-1">Địa chỉ</h3>
                                        <p class="text-gray-600">123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                                    </div>
                                </div>

                                <div class="flex items-start">
                                    <i class="pi pi-phone text-amber-600 text-xl mr-3 mt-1"></i>
                                    <div>
                                        <h3 class="font-semibold mb-1">Điện thoại</h3>
                                        <p class="text-gray-600">+84 28 1234 5678</p>
                                    </div>
                                </div>

                                <div class="flex items-start">
                                    <i class="pi pi-envelope text-amber-600 text-xl mr-3 mt-1"></i>
                                    <div>
                                        <h3 class="font-semibold mb-1">Email</h3>
                                        <p class="text-gray-600">booking@luxuryhotel.vn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dialog hủy đặt phòng -->
        <Dialog v-model:visible="showCancelDialog" :style="{width: '450px'}" header="Xác nhận hủy đặt phòng" :modal="true">
            <div class="text-center">
                <i class="pi pi-exclamation-triangle text-yellow-500 text-5xl mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">Bạn chắc chắn muốn hủy đặt phòng?</h3>
                <p class="mb-4">Việc hủy đặt phòng này sẽ không thể khôi phục.</p>
                <div class="flex justify-center space-x-2">
                    <Button label="Không, giữ đặt phòng" class="p-button-outlined" @click="showCancelDialog = false" />
                    <Button label="Có, hủy đặt phòng" class="p-button-danger" @click="cancelBooking" />
                </div>
            </div>
        </Dialog>
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
