<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const booking = ref({
    id: '',
    roomName: '',
    roomImage: null,
    checkInDate: '',
    checkOutDate: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    nationalId: '',
    totalGuests: 0,
    totalPrice: 0,
    finalPrice: 0,
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    paymentDate: null,
    createdAt: '',
    contactInfo: {
        fullName: '',
        email: '',
        phone: '',
        nationalId: '',
        nationality: 'VN',
        specialRequests: ''
    },
    discount: {
        code: '',
        value: 0,
        type: ''
    },
    rooms: []
});
const loading = ref(false);
const bookingPolicies = ref({
    checkInTime: '14:00',
    checkOutTime: '12:00',
    cancellationPolicy: 'Bạn có thể hủy miễn phí trước 1 ngày so với ngày nhận phòng. Nếu hủy muộn hơn, bạn sẽ bị tính phí 1 đêm đầu tiên.',
    idRequirement: 'Khách hàng cần xuất trình giấy tờ tùy thân có ảnh khi nhận phòng.'
});
const hotelInfo = ref({
    name: 'Luxury Hotel',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    phone: '+84 28 1234 5678',
    email: 'booking@luxuryhotel.vn'
});
const selectedImage = ref(null);

onMounted(async () => {
    const bookingId = route.params.id;
    loading.value = true;

    try {
        // Gọi API để lấy thông tin đặt phòng
        const response = await fetch(`/api/v1/user/bookings/detail/${bookingId}`);

        if (!response.ok) {
            throw new Error('Không thể tải thông tin đặt phòng');
        }

        const result = await response.json();
        const bookingData = result.booking;
        const paymentData = result.payment;

        // Cập nhật dữ liệu booking
        booking.value = {
            ...booking.value,
            id: bookingData.id,
            guestName: bookingData.fullName || 'Không có tên',
            guestEmail: bookingData.email || 'Không có email',
            guestPhone: bookingData.phone || 'Không có số điện thoại',
            nationalId: bookingData.nationalId || 'Không có',
            checkInDate: bookingData.checkInDate,
            checkOutDate: bookingData.checkOutDate,
            totalPrice: bookingData.totalPrice || 0,
            finalPrice: bookingData.finalPrice || bookingData.totalPrice,
            status: bookingData.status || 'PENDING',
            paymentStatus: bookingData.paymentStatus || paymentData?.paymentStatus || 'UNPAID',
            paymentMethod: bookingData.paymentMethod || paymentData?.paymentMethod || 'CASH',
            paymentDate: bookingData.paymentDate || paymentData?.paymentDate,
            createdAt: bookingData.createdAt,
            contactInfo: {
                fullName: bookingData.fullName || 'Không có tên',
                email: bookingData.email || 'Không có email',
                phone: bookingData.phone || 'Không có số điện thoại',
                nationalId: bookingData.nationalId || 'Không có',
                nationality: 'VN',
                specialRequests: ''
            },
            discount: {
                code: bookingData.discountCode || '',
                value: bookingData.discountValue || 0,
                type: bookingData.discountType || ''
            },
            rooms: Array.isArray(bookingData.rooms) ? bookingData.rooms.map(room => ({
                roomId: room.roomId,
                roomNumber: room.roomNumber,
                roomType: room.roomType,
                price: room.price,
                images: room.images || []
            })) : []
        };

        // Tính tổng số khách (mặc định 2 người/phòng)
        booking.value.totalGuests = bookingData.rooms ? bookingData.rooms.length * 2 : 2;

        // Nếu có phòng, lấy thông tin phòng đầu tiên làm thông tin chính
        if (booking.value.rooms && booking.value.rooms.length > 0) {
            const firstRoom = booking.value.rooms[0];
            booking.value.roomName = firstRoom.roomType;
            booking.value.roomImage = firstRoom.images && firstRoom.images.length > 0 ? firstRoom.images[0] : null;

            // Đặt ảnh đã chọn về ảnh đầu tiên của phòng đầu tiên
            if (firstRoom.images && firstRoom.images.length > 0) {
                selectedImage.value = firstRoom.images[0];
            }
        }

        // Cập nhật chính sách đặt phòng nếu API trả về
        if (result.policies) {
            bookingPolicies.value = {
                ...bookingPolicies.value,
                ...result.policies
            };
        }

        // Gọi API để lấy thông tin chính sách đặt phòng (nếu cần)
        try {
            const policiesResponse = await fetch('/api/v1/policies');
            if (policiesResponse.ok) {
                const policiesData = await policiesResponse.json();
                if (policiesData) {
                    bookingPolicies.value = {
                        ...bookingPolicies.value,
                        ...policiesData
                    };
                }
            }
        } catch (policyError) {
            console.error('Lỗi khi tải chính sách đặt phòng:', policyError);
            // Không bắt lỗi vì đây không phải thông tin thiết yếu
        }

        // Gọi API để lấy thông tin khách sạn
        try {
            const hotelResponse = await fetch('/api/v1/hotel-info');
            if (hotelResponse.ok) {
                const hotelData = await hotelResponse.json();
                if (hotelData) {
                    hotelInfo.value = {
                        ...hotelInfo.value,
                        ...hotelData
                    };
                }
            }
        } catch (hotelError) {
            console.error('Lỗi khi tải thông tin khách sạn:', hotelError);
            // Không bắt lỗi vì đây không phải thông tin thiết yếu
        }

        loading.value = false;
    } catch (error) {
        console.error('Lỗi khi tải thông tin đặt phòng:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể tải thông tin đặt phòng',
            life: 3000
        });
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
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800';
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
        case 'PENDING':
            return 'Chờ xác nhận';
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

// Lấy tên quốc gia theo mã
const getCountryName = (code) => {
    const countries = {
        'VN': 'Việt Nam',
        'US': 'Hoa Kỳ',
        'GB': 'Anh',
        'JP': 'Nhật Bản',
        'KR': 'Hàn Quốc',
        'CN': 'Trung Quốc'
    };

    return countries[code] || code || 'Việt Nam';
};

// Hủy đặt phòng
const cancelBooking = async () => {
    // Đóng dialog hủy đặt phòng
    showCancelDialog.value = false;

    // Hiển thị loading
    loading.value = true;

    try {
        // Lấy token từ localStorage
        const userDataStr = localStorage.getItem('user_token');
        if (!userDataStr) {
            throw new Error('Vui lòng đăng nhập để hủy đặt phòng');
        }

        const userData = JSON.parse(userDataStr);
        if (!userData.accessToken) {
            throw new Error('Phiên đăng nhập đã hết hạn');
        }

        // Gọi API để hủy đặt phòng
        const response = await fetch(`http://127.0.0.1:9000/api/v1/bookings/cancel/${booking.value.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.accessToken}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể hủy đặt phòng');
        }

        const result = await response.json();

        // Cập nhật trạng thái đặt phòng
        booking.value.status = 'CANCELLED';

        toast.add({
            severity: 'success',
            summary: 'Hủy đặt phòng thành công',
            detail: 'Đơn đặt phòng của bạn đã được hủy',
            life: 3000
        });
    } catch (error) {
        console.error('Lỗi khi hủy đặt phòng:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể hủy đặt phòng',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Thêm hàm để thay đổi ảnh đang được hiển thị
const changeImage = (image) => {
    selectedImage.value = image;
};


// In xác nhận đặt phòng
const printBookingConfirmation = () => {
    window.print();
};

// Kiểm tra có thể hủy không
const canCancel = computed(() => {
    return booking.value.status !== 'CANCELLED' && booking.value.status !== 'CHECK_OUT';
});

// Dialog hiển thị xác nhận hủy
const showCancelDialog = ref(false);
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
                        <i v-if="booking.status === 'CONFIRMED'" class="pi pi-check-circle text-3xl text-green-500"></i>
                        <i v-else-if="booking.status === 'PENDING'" class="pi pi-clock text-3xl text-yellow-500"></i>
                        <i v-else-if="booking.status === 'CANCELLED'" class="pi pi-times-circle text-3xl text-red-500"></i>
                        <i v-else class="pi pi-check-circle text-3xl text-green-500"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-2">
                        <span v-if="booking.status === 'CONFIRMED'">Đặt phòng thành công!</span>
                        <span v-else-if="booking.status === 'PENDING'">Đặt phòng đang chờ xác nhận!</span>
                        <span v-else-if="booking.status === 'CANCELLED'">Đặt phòng đã bị hủy!</span>
                        <span v-else>Đặt phòng thành công!</span>
                    </h1>
                    <p class="text-gray-600 mb-2">Cảm ơn bạn đã đặt phòng tại {{ hotelInfo?.name || 'Luxury Hotel' }}</p>
                    <p class="font-medium">Mã đặt phòng: <span class="text-amber-600">{{ booking.id }}</span></p>
                    <p v-if="booking.contactInfo && booking.contactInfo.email" class="text-sm text-gray-500 mt-2">Email xác nhận đã được gửi đến {{ booking.contactInfo.email }}</p>
                </div>

                <!-- Chi tiết phòng -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h3 class="font-semibold text-gray-800 mb-3">Chi tiết phòng</h3>
                    <div v-for="(room, index) in booking.rooms" :key="index" class="border border-gray-200 rounded-lg p-4 mb-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-semibold">{{ room.roomType }}</h4>
                                <p class="text-gray-600">Số phòng: {{ room.roomNumber }}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold">{{ formatCurrency(room.price) }}</p>
                                <p class="text-sm text-gray-500">/đêm</p>
                            </div>
                        </div>
                        <div v-if="room.images && room.images.length > 0" class="mt-4 grid grid-cols-3 gap-2">
                            <img v-for="(image, imgIndex) in room.images"
                                 :key="imgIndex"
                                 :src="image"
                                 :alt="room.roomType"
                                 class="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                 @click="changeImage(image)" />
                        </div>
                    </div>
                </div>

                <!-- Thông tin chi tiết đặt phòng -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Thông tin phòng và thời gian -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 class="text-xl font-semibold text-gray-800 mb-4">Chi tiết đặt phòng</h2>

                            <div class="flex flex-col md:flex-row md:items-center mb-6">
                                <div v-if="booking.roomImage" class="w-full md:w-48 h-36 mb-4 md:mb-0 md:mr-6">
                                    <img :src="booking.roomImage" :alt="booking.roomName" class="w-full h-full object-cover rounded-lg" />
                                </div>
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
                                        <p class="text-gray-600 text-sm">Từ {{ bookingPolicies?.checkInTime || '14:00' }} (Nhận phòng sớm có phụ phí)</p>
                                    </div>
                                </div>

                                <div class="flex items-start">
                                    <div class="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                        <i class="pi pi-calendar-minus text-amber-600"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold mb-2">Trả phòng</h4>
                                        <p class="text-gray-700">{{ formatDate(booking.checkOutDate) }}</p>
                                        <p class="text-gray-600 text-sm">Đến {{ bookingPolicies?.checkOutTime || '12:00' }} (Trả phòng muộn có phụ phí)</p>
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
                                        <span>{{ booking.contactInfo && getCountryName(booking.contactInfo.nationality) }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Yêu cầu đặc biệt -->
                            <div v-if="booking.contactInfo && booking.contactInfo.specialRequests" class="mb-6">
                                <h3 class="font-semibold text-gray-800 mb-3">Yêu cầu đặc biệt</h3>
                                <p class="bg-gray-50 p-3 rounded-lg text-gray-700">{{ booking.contactInfo.specialRequests }}</p>
                            </div>

                            <!-- Chính sách đặt phòng -->
                            <div class="border-t border-gray-200 pt-4">
                                <h3 class="font-semibold text-gray-800 mb-3">Chính sách đặt phòng</h3>
                                <ul class="space-y-2 text-gray-700">
                                    <li class="flex items-start">
                                        <i class="pi pi-info-circle text-blue-500 mr-2 mt-1"></i>
                                        <span>Chính sách nhận phòng: Nhận phòng từ {{ bookingPolicies?.checkInTime || '14:00' }} và trả phòng trước {{ bookingPolicies?.checkOutTime || '12:00' }}.</span>
                                    </li>
                                    <li class="flex items-start">
                                        <i class="pi pi-info-circle text-blue-500 mr-2 mt-1"></i>
                                        <span>Chính sách hủy phòng: {{ bookingPolicies?.cancellationPolicy || 'Bạn có thể hủy miễn phí trước 1 ngày so với ngày nhận phòng. Nếu hủy muộn hơn, bạn sẽ bị tính phí 1 đêm đầu tiên.' }}</span>
                                    </li>
                                    <li class="flex items-start">
                                        <i class="pi pi-info-circle text-blue-500 mr-2 mt-1"></i>
                                        <span>{{ bookingPolicies?.idRequirement || 'Khách hàng cần xuất trình giấy tờ tùy thân có ảnh khi nhận phòng.' }}</span>
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
                                    <span :class="getStatusClass(booking.status)" class="inline-block px-2 py-1 rounded-full text-xs font-semibold">{{ getStatusLabel(booking.status) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Thanh toán:</span>
                                    <span :class="getPaymentStatusClass(booking.paymentStatus)" class="inline-block px-2 py-1 rounded-full text-xs font-semibold">{{ getPaymentStatusLabel(booking.paymentStatus) }}</span>
                                </div>
                            </div>

                            <div class="border-t border-gray-200 pt-4 pb-4">
                                <div class="flex justify-between mb-2">
                                    <span class="text-gray-600">Tổng tiền phòng ({{ booking.rooms.length }} phòng x {{ calculateNights() }} đêm)</span>
                                    <span>{{ formatCurrency(booking.totalPrice) }}</span>
                                </div>

                                <div v-if="booking.discount.code" class="flex justify-between mb-2 text-green-600">
                                    <span>Giảm giá ({{ booking.discount.code }})</span>
                                    <span>-{{ formatCurrency(booking.discount.value) }}</span>
                                </div>

                                <div class="flex justify-between font-bold text-lg mt-4">
                                    <span>Tổng cộng</span>
                                    <span class="text-amber-600">{{ formatCurrency(booking.finalPrice) }}</span>
                                </div>

                                <div class="text-sm text-gray-500 mt-2">
                                    <span v-if="booking.paymentStatus === 'UNPAID'">Chưa thanh toán</span>
                                    <span v-else-if="booking.paymentStatus === 'PAID'">Đã thanh toán</span>
                                    <span v-else-if="booking.paymentStatus === 'PARTIAL'">Đã đặt cọc</span>
                                    <span v-else-if="booking.paymentStatus === 'REFUNDED'">Đã hoàn tiền</span>
                                </div>

                                <div v-if="booking.paymentDate" class="text-sm text-gray-500 mt-1">
                                    Ngày thanh toán: {{ formatDate(booking.paymentDate) }}
                                </div>
                            </div>

                            <div class="space-y-3">
                                <Button label="In xác nhận đặt phòng" icon="pi pi-print" class="w-full p-button-outlined" @click="printBookingConfirmation" />
                                <!-- <Button label="Sửa đổi đặt phòng" icon="pi pi-pencil" class="w-full p-button-outlined" @click="editBooking" /> -->
                                <Button v-if="canCancel" label="Hủy đặt phòng" icon="pi pi-times" class="w-full p-button-outlined p-button-danger" @click="showCancelDialog = true" />
                            </div>
                        </div>

                        <!-- Thông tin khách sạn -->
                        <!-- <div class="bg-white rounded-lg shadow-md p-6">
                            <h2 class="text-xl font-semibold text-gray-800 mb-4">Thông tin khách sạn</h2>

                            <div class="space-y-4">
                                <div class="flex items-start">
                                    <i class="pi pi-map-marker text-amber-600 text-xl mr-3 mt-1"></i>
                                    <div>
                                        <h3 class="font-semibold mb-1">Địa chỉ</h3>
                                        <p class="text-gray-600">{{ hotelInfo.address || '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' }}</p>
                                    </div>
                                </div>

                                <div class="flex items-start">
                                    <i class="pi pi-phone text-amber-600 text-xl mr-3 mt-1"></i>
                                    <div>
                                        <h3 class="font-semibold mb-1">Điện thoại</h3>
                                        <p class="text-gray-600">{{ hotelInfo.phone || '+84 28 1234 5678' }}</p>
                                    </div>
                                </div>

                                <div class="flex items-start">
                                    <i class="pi pi-envelope text-amber-600 text-xl mr-3 mt-1"></i>
                                    <div>
                                        <h3 class="font-semibold mb-1">Email</h3>
                                        <p class="text-gray-600">{{ hotelInfo.email || 'booking@luxuryhotel.vn' }}</p>
                                    </div>
                                </div>
                            </div>
                        </div> -->
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
