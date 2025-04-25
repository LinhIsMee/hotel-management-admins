<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const submitting = ref(false);
const agreeTerms = ref(false);
const roomData = ref(null);
const showGuestSelect = ref(false);
const bookingInfo = ref({
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    services: [],
    discount: '',
    payment: 'cash',
    totalPrice: 0
});

// Tổng số khách (người lớn + trẻ em)
const totalGuests = computed(() => {
    return bookingInfo.value.adults + bookingInfo.value.children;
});

// Danh sách dịch vụ bổ sung
const availableServices = ref([
    { id: 1, name: 'Bữa sáng', price: 150000 },
    { id: 2, name: 'Đưa đón sân bay', price: 350000 },
    { id: 3, name: 'Giặt ủi', price: 100000 },
    { id: 4, name: 'Spa', price: 500000 }
]);

// Thông tin liên hệ
const contactInfo = ref({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    nationality: 'VN',
    nationalId: '',
});

// Thêm state để lưu thông tin user
const userInfo = ref(null);

// Hàm lấy thông tin user từ localStorage
const getUserInfo = () => {
    try {
        const userToken = localStorage.getItem('user_token');
        if (userToken) {
            userInfo.value = JSON.parse(userToken);

            // Tự động điền thông tin user vào form
            if (userInfo.value) {
                contactInfo.value.fullName = userInfo.value.fullName || '';
                contactInfo.value.email = userInfo.value.email || '';
                contactInfo.value.phone = userInfo.value.phone || '';
                contactInfo.value.nationalId = userInfo.value.nationalId || '';
            }
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin user từ localStorage:', error);
    }
};

// Phương thức thanh toán
const paymentMethod = ref('CASH');

onMounted(async () => {
    // Lấy thông tin user từ localStorage
    getUserInfo();

    // Lấy thông tin từ query parameters
    const { roomId, checkIn, checkOut, adults, children, services, discount, payment } = route.query;

    if (!roomId || !checkIn || !checkOut) {
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Thiếu thông tin đặt phòng cần thiết',
            life: 3000
        });
        router.push('/rooms');
        return;
    }

    bookingInfo.value = {
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: parseInt(adults) || 1,
        children: parseInt(children) || 0,
        services: services ? services.split(',') : [],
        discount: discount || '',
        payment: payment || 'cash'
    };

    paymentMethod.value = payment === 'vnpay' ? 'VNPAY' : 'CASH';

    try {
        // Tải thông tin phòng từ API
        const response = await fetch(`/api/v1/rooms/${roomId}`);
        if (!response.ok) {
            throw new Error('Không thể tải thông tin phòng');
        }

        roomData.value = await response.json();
        // Tính tổng tiền
        calculateTotalPrice();

        // Click outside để đóng dropdown
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.guest-select-dropdown');
            const button = document.querySelector('.guest-select-button');
            if (dropdown && !dropdown.contains(e.target) && !button?.contains(e.target)) {
                showGuestSelect.value = false;
            }
        });
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tải thông tin phòng',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
});

// Cập nhật số lượng khách
watch(totalGuests, (newValue) => {
    if (roomData.value && newValue > roomData.value.maxOccupancy) {
        toast.add({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: `Phòng này chỉ cho phép tối đa ${roomData.value.maxOccupancy} người`,
            life: 3000
        });

        // Điều chỉnh số lượng khách về giới hạn tối đa
        const excess = newValue - roomData.value.maxOccupancy;
        if (bookingInfo.value.children >= excess) {
            bookingInfo.value.children -= excess;
        } else {
            bookingInfo.value.children = 0;
            bookingInfo.value.adults = roomData.value.maxOccupancy;
        }
    }
    calculateTotalPrice();
});

// Tính tổng tiền
const calculateTotalPrice = () => {
    if (!roomData.value) return 0;

    const pricePerNight = roomData.value.pricePerNight || 0;
    const checkIn = new Date(bookingInfo.value.checkInDate);
    const checkOut = new Date(bookingInfo.value.checkOutDate);
    const days = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

    // Giá người lớn
    const adultPrice = pricePerNight * bookingInfo.value.adults * days;

    // Giá trẻ em (giảm 20%)
    const childPrice = pricePerNight * bookingInfo.value.children * days * 0.8;

    let total = adultPrice + childPrice;

    // Thêm giá dịch vụ
    bookingInfo.value.services.forEach(serviceId => {
        const numericId = parseInt(serviceId);
        const service = availableServices.value.find(s => s.id === numericId);
        if (service) {
            total += service.price;
        }
    });

    // Xử lý mã giảm giá
    if (bookingInfo.value.discount) {
        // Giả lập giảm giá 10%
        total = total * 0.9;
    }

    bookingInfo.value.totalPrice = total;
    return total;
};

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
    if (!bookingInfo.value.checkInDate || !bookingInfo.value.checkOutDate) return 0;
    const checkIn = new Date(bookingInfo.value.checkInDate);
    const checkOut = new Date(bookingInfo.value.checkOutDate);
    return Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
};

// Xác nhận đặt phòng
const confirmBooking = async () => {
    if (!agreeTerms.value) {
        toast.add({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: 'Vui lòng đồng ý với điều khoản và điều kiện',
            life: 3000
        });
        return;
    }

    if (!contactInfo.value.fullName || !contactInfo.value.email || !contactInfo.value.phone || !contactInfo.value.nationalId) {
        toast.add({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: 'Vui lòng điền đầy đủ thông tin liên hệ',
            life: 3000
        });
        return;
    }

    submitting.value = true;

    try {
        // Chuẩn bị dữ liệu dịch vụ bổ sung
        const services = bookingInfo.value.services.map(serviceId => {
            const numericId = parseInt(serviceId);
            const service = availableServices.value.find(s => s.id === numericId);
            return service ? {
                id: service.id,
                name: service.name,
                price: service.price
            } : null;
        }).filter(s => s !== null);

        // Tạo payload theo format API mới
        const bookingData = {
            userId: userInfo.value?.id || null,
            roomIds: [parseInt(bookingInfo.value.roomId)],
            checkInDate: bookingInfo.value.checkInDate,
            checkOutDate: bookingInfo.value.checkOutDate,
            discountCode: bookingInfo.value.discount || '',
            ipAddress: '127.0.0.1',
            returnUrl: `${window.location.origin}/payment-callback`,
            fullName: contactInfo.value.fullName,
            phone: contactInfo.value.phone,
            email: contactInfo.value.email,
            nationalId: contactInfo.value.nationalId,
            adults: bookingInfo.value.adults,
            children: bookingInfo.value.children,
            services: services,
            specialRequests: contactInfo.value.specialRequests || '',
            totalPrice: bookingInfo.value.totalPrice
        };

        // Gọi API đặt phòng mới
        const response = await fetch('http://localhost:5173/api/v1/payments/create-booking-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.value?.accessToken}`
            },
            body: JSON.stringify(bookingData)
        });

        if (response.status === 409) {
            const errorData = await response.json();
            toast.add({
                severity: 'error',
                summary: 'Không thể đặt phòng',
                detail: `${errorData.message}. Vui lòng chọn phòng khác hoặc thay đổi thời gian đặt phòng.`,
                life: 5000
            });
            return;
        }

        if (!response.ok) {
            throw new Error('Không thể đặt phòng');
        }

        const result = await response.json();

        // Chuyển hướng đến trang thanh toán VNPay
        if (result.paymentUrl) {
            window.location.href = result.paymentUrl;
        } else {
            throw new Error('Không nhận được URL thanh toán');
        }

        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đặt phòng thành công!',
            life: 3000
        });
    } catch (error) {
        console.error('Lỗi khi đặt phòng:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể hoàn tất đặt phòng',
            life: 3000
        });
    } finally {
        submitting.value = false;
    }
};

// Hủy đặt phòng
const cancelBookingProcess = () => {
    router.push('/rooms');
};
</script>

<template>
    <div class="booking-confirm-page bg-gray-50 min-h-screen py-8">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div v-if="loading" class="flex justify-center py-10">
                <ProgressSpinner />
            </div>

            <div v-else-if="!roomData" class="bg-white p-10 rounded-lg shadow-md text-center">
                <i class="pi pi-exclamation-triangle text-5xl text-yellow-500 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy thông tin phòng</h3>
                <p class="text-gray-600 mb-4">Phòng này không tồn tại hoặc đã bị xóa.</p>
                <Button label="Quay lại danh sách phòng" @click="router.push('/rooms')" />
            </div>

            <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Thông tin đặt phòng -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h1 class="text-2xl font-bold text-gray-800 mb-6">Xác nhận đặt phòng</h1>

                        <div class="flex flex-col md:flex-row mb-6">
                            <img :src="roomData.images && roomData.images.length > 0 ? roomData.images[0] : nha_nghi_1"
                                 :alt="roomData.roomTypeName || 'Phòng khách sạn'"
                                 class="w-full md:w-48 h-36 object-cover rounded-lg mb-4 md:mb-0 md:mr-6" />
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ roomData.roomTypeName || 'Phòng khách sạn' }}</h3>
                                <p class="text-gray-600 mb-2">{{ roomData.roomNumber ? `Phòng ${roomData.roomNumber}` : '' }}</p>
                                <div class="flex items-center text-gray-600 mb-1 relative">
                                    <i class="pi pi-users mr-2"></i>
                                    <button @click="showGuestSelect = !showGuestSelect"
                                        class="guest-select-button text-left flex items-center hover:text-amber-600">
                                        <span>{{ bookingInfo.adults }} người lớn{{ bookingInfo.children ? `, ${bookingInfo.children} trẻ em` : '' }}</span>
                                        <i class="pi pi-chevron-down ml-1 text-gray-400"></i>
                                    </button>

                                    <!-- Dropdown chọn số lượng khách -->
                                    <div v-if="showGuestSelect"
                                        class="guest-select-dropdown absolute top-full left-0 w-[300px] mt-2 bg-white border rounded-lg shadow-lg p-4 z-50">
                                        <!-- Thông tin số người tối đa -->
                                        <div class="text-sm text-gray-500 mb-4">
                                            Tối đa {{ roomData.maxOccupancy }} người
                                        </div>

                                        <!-- Người lớn -->
                                        <div class="flex items-center justify-between mb-4">
                                            <div>
                                                <div class="font-medium">Người lớn</div>
                                                <div class="text-sm text-gray-500">Từ 13 tuổi trở lên</div>
                                            </div>
                                            <div class="flex items-center gap-3">
                                                <button class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                                                    :class="{ 'opacity-50 cursor-not-allowed': bookingInfo.adults <= 1 }"
                                                    @click="bookingInfo.adults = Math.max(1, bookingInfo.adults - 1)"
                                                    :disabled="bookingInfo.adults <= 1">
                                                    <i class="pi pi-minus text-sm"></i>
                                                </button>
                                                <span class="w-6 text-center">{{ bookingInfo.adults }}</span>
                                                <button class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                                                    :class="{ 'opacity-50 cursor-not-allowed': totalGuests >= roomData.maxOccupancy }"
                                                    @click="bookingInfo.adults = Math.min(roomData.maxOccupancy, bookingInfo.adults + 1)"
                                                    :disabled="totalGuests >= roomData.maxOccupancy">
                                                    <i class="pi pi-plus text-sm"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Trẻ em -->
                                        <div class="flex items-center justify-between mb-4">
                                            <div>
                                                <div class="font-medium">Trẻ em</div>
                                                <div class="text-sm text-gray-500">Độ tuổi 0-12</div>
                                            </div>
                                            <div class="flex items-center gap-3">
                                                <button class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                                                    :class="{ 'opacity-50 cursor-not-allowed': bookingInfo.children <= 0 }"
                                                    @click="bookingInfo.children = Math.max(0, bookingInfo.children - 1)"
                                                    :disabled="bookingInfo.children <= 0">
                                                    <i class="pi pi-minus text-sm"></i>
                                                </button>
                                                <span class="w-6 text-center">{{ bookingInfo.children }}</span>
                                                <button class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                                                    :class="{ 'opacity-50 cursor-not-allowed': totalGuests >= roomData.maxOccupancy }"
                                                    @click="bookingInfo.children = Math.min(roomData.maxOccupancy - bookingInfo.adults, bookingInfo.children + 1)"
                                                    :disabled="totalGuests >= roomData.maxOccupancy">
                                                    <i class="pi pi-plus text-sm"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div class="text-xs text-gray-500 mb-4">
                                            Trẻ em được giảm giá 20% giá phòng
                                        </div>

                                        <button @click="showGuestSelect = false"
                                            class="w-full mt-2 bg-amber-600 text-white rounded-lg py-2 hover:bg-amber-700 transition-colors">
                                            Xong
                                        </button>
                                    </div>
                                </div>
                                <div class="flex items-center text-gray-600">
                                    <i class="pi pi-calendar mr-2"></i>
                                    <span>{{ formatDate(bookingInfo.checkInDate) }} - {{ formatDate(bookingInfo.checkOutDate) }}</span>
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
                                    <p class="text-gray-700">{{ formatDate(bookingInfo.checkInDate) }}</p>
                                    <p class="text-gray-600 text-sm">Từ 14:00 (Nhận phòng sớm có phụ phí)</p>
                                </div>
                            </div>

                            <div class="flex items-start">
                                <div class="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                    <i class="pi pi-calendar-minus text-amber-600"></i>
                                </div>
                                <div>
                                    <h4 class="font-semibold mb-2">Trả phòng</h4>
                                    <p class="text-gray-700">{{ formatDate(bookingInfo.checkOutDate) }}</p>
                                    <p class="text-gray-600 text-sm">Đến 12:00 (Trả phòng muộn có phụ phí)</p>
                                </div>
                            </div>
                        </div>

                        <!-- Dịch vụ bổ sung -->
                        <div v-if="bookingInfo.services && bookingInfo.services.length > 0" class="mb-6">
                            <h3 class="font-semibold text-gray-800 mb-3">Dịch vụ bổ sung</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                                <div v-for="serviceId in bookingInfo.services" :key="serviceId" class="flex items-center">
                                    <i class="pi pi-check-circle text-green-500 mr-2"></i>
                                    <span>{{ availableServices.find(s => s.id === parseInt(serviceId))?.name || serviceId }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Form thông tin liên hệ -->
                        <div class="mb-6">
                            <h3 class="font-semibold text-gray-800 mb-3">Thông tin liên hệs</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label class="block text-gray-700 mb-1">Họ tên *</label>
                                    <input v-model="contactInfo.fullName" type="text" class="w-full border border-gray-300 rounded-md p-2" placeholder="Nhập họ tên" />
                                </div>
                                <div class="form-group">
                                    <label class="block text-gray-700 mb-1">Email *</label>
                                    <input v-model="contactInfo.email" type="email" class="w-full border border-gray-300 rounded-md p-2" placeholder="Nhập email" />
                                </div>
                                <div class="form-group">
                                    <label class="block text-gray-700 mb-1">Số điện thoại *</label>
                                    <input v-model="contactInfo.phone" type="tel" class="w-full border border-gray-300 rounded-md p-2" placeholder="Nhập số điện thoại" />
                                </div>
                                <div class="form-group">
                                    <label class="block text-gray-700 mb-1">Quốc tịch</label>
                                    <select v-model="contactInfo.nationality" class="w-full border border-gray-300 rounded-md p-2">
                                        <option value="VN">Việt Nam</option>
                                        <option value="US">Hoa Kỳ</option>
                                        <option value="GB">Anh</option>
                                        <option value="JP">Nhật Bản</option>
                                        <option value="KR">Hàn Quốc</option>
                                        <option value="CN">Trung Quốc</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="block text-gray-700 mb-1">CCCD/Passport *</label>
                                    <input v-model="contactInfo.nationalId" type="text"
                                           class="w-full border border-gray-300 rounded-md p-2"
                                           placeholder="Nhập số CCCD hoặc Passport" />
                                </div>
                            </div>
                            <div class="form-group mt-4">
                                <label class="block text-gray-700 mb-1">Yêu cầu đặc biệt</label>
                                <textarea v-model="contactInfo.specialRequests" class="w-full border border-gray-300 rounded-md p-2"
                                          rows="3" placeholder="Nhập yêu cầu đặc biệt (nếu có)"></textarea>
                            </div>
                        </div>

                        <!-- Phương thức thanh toán -->
                        <div class="mb-6">
                            <h3 class="font-semibold text-gray-800 mb-3">Phương thức thanh toán</h3>
                            <div class="space-y-3">
                                <div class="flex items-center">
                                    <RadioButton v-model="paymentMethod" value="CASH" inputId="payment_cash" />
                                    <label for="payment_cash" class="ml-2">Thanh toán tại khách sạn</label>
                                </div>
                                <div class="flex items-center">
                                    <RadioButton v-model="paymentMethod" value="VNPAY" inputId="payment_vnpay" />
                                    <label for="payment_vnpay" class="ml-2 flex items-center">
                                        <span class="mr-2">Thanh toán qua VNPay</span>
                                        <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPay" class="h-6" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Điều khoản và điều kiện -->
                        <div class="mb-6">
                            <div class="flex items-start">
                                <Checkbox v-model="agreeTerms" :binary="true" inputId="agreeTerms" class="mt-1" />
                                <label for="agreeTerms" class="ml-2 text-gray-700">
                                    Tôi đã đọc và đồng ý với
                                    <a href="#" class="text-blue-600 hover:underline">điều khoản và điều kiện</a>
                                    cũng như <a href="#" class="text-blue-600 hover:underline">chính sách bảo mật</a>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Thông tin thanh toán -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow-md p-6 sticky top-4">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4">Tóm tắt đặt phòng</h2>

                        <div class="bg-gray-50 rounded-lg p-4 mt-4">
                            <h3 class="font-semibold text-gray-800 mb-3">Chi tiết giá</h3>

                            <div class="space-y-2 mb-4">
                                <div class="flex justify-between">
                                    <span class="text-gray-700">Giá phòng:</span>
                                    <span class="font-semibold">{{ formatCurrency(roomData?.pricePerNight || 0) }}</span>
                                </div>

                                <div class="flex justify-between">
                                    <span class="text-gray-700">Số đêm:</span>
                                    <span class="font-semibold">{{ calculateNights() }}</span>
                                </div>

                                <div class="flex justify-between">
                                    <span class="text-gray-700">Người lớn:</span>
                                    <span class="font-semibold">{{ bookingInfo.adults }} người</span>
                                </div>

                                <div v-if="bookingInfo.children > 0" class="flex justify-between">
                                    <span class="text-gray-700">Trẻ em (giảm 20%):</span>
                                    <span class="font-semibold">{{ bookingInfo.children }} người</span>
                                </div>

                                <div class="flex justify-between pt-2 border-t border-gray-200">
                                    <span class="text-gray-700">Tổng tiền phòng:</span>
                                    <span class="font-semibold">{{ formatCurrency((roomData?.pricePerNight || 0) * calculateNights() * bookingInfo.adults + (roomData?.pricePerNight || 0) * calculateNights() * bookingInfo.children * 0.8) }}</span>
                                </div>

                                <!-- Dịch vụ bổ sung -->
                                <template v-if="bookingInfo.services && bookingInfo.services.length > 0">
                                    <div class="pt-2 border-t border-gray-200">
                                        <h4 class="font-medium text-gray-700 mb-2">Dịch vụ bổ sung:</h4>
                                        <div v-for="serviceId in bookingInfo.services" :key="serviceId" class="flex justify-between mb-2">
                                            <span class="text-gray-700">{{ availableServices.find(s => s.id === parseInt(serviceId))?.name || serviceId }}:</span>
                                            <span class="font-semibold">{{ formatCurrency(availableServices.find(s => s.id === parseInt(serviceId))?.price || 0) }}</span>
                                        </div>
                                    </div>
                                </template>

                                <!-- Giảm giá nếu có -->
                                <div v-if="bookingInfo.discount" class="flex justify-between pt-2 border-t border-gray-200 text-green-600">
                                    <span>Giảm giá ({{ bookingInfo.discount }}):</span>
                                    <span class="font-semibold">-10%</span>
                                </div>
                            </div>

                            <div class="flex justify-between pt-3 border-t border-gray-300">
                                <span class="text-lg font-bold">Tổng cộng:</span>
                                <span class="text-lg font-bold text-amber-600">{{ formatCurrency(bookingInfo.totalPrice) }}</span>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <Button @click="confirmBooking" label="Xác nhận đặt phòng"
                                    class="w-full p-button-lg"
                                    :loading="submitting" />
                            <Button @click="cancelBookingProcess" label="Hủy"
                                    class="w-full p-button-outlined p-button-secondary"
                                    :disabled="submitting" />
                        </div>

                        <div class="mt-4 text-center text-sm text-gray-500">
                            <p>Bằng việc nhấn "Xác nhận đặt phòng", bạn đồng ý với các điều khoản và chính sách của chúng tôi.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.booking-confirm-page {
    min-height: calc(100vh - 300px);
}

.guest-select-button {
    cursor: pointer;
    transition: color 0.2s;
}

.guest-select-dropdown {
    border: 1px solid #e5e7eb;
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
