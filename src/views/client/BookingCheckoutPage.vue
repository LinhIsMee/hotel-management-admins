<script setup>
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const bookingData = ref(null);
const loading = ref(true);
const currentStep = ref(1); // 1: Thông tin khách hàng, 2: Thanh toán, 3: Xác nhận

// Form thông tin khách hàng
const customerInfo = ref({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    identityNumber: '',
    nationality: 'Việt Nam'
});

// Thông tin liên hệ
const contactInfo = ref({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    nationality: 'VN'
});

// Danh sách quốc gia
const countries = [
    { name: 'Việt Nam', code: 'VN' },
    { name: 'Hoa Kỳ', code: 'US' },
    { name: 'Anh', code: 'GB' },
    { name: 'Pháp', code: 'FR' },
    { name: 'Đức', code: 'DE' },
    { name: 'Úc', code: 'AU' },
    { name: 'Nhật Bản', code: 'JP' },
    { name: 'Hàn Quốc', code: 'KR' },
    { name: 'Trung Quốc', code: 'CN' },
    { name: 'Singapore', code: 'SG' },
    { name: 'Thái Lan', code: 'TH' }
];

// Phương thức thanh toán
const paymentMethod = ref('pay_later');
const agreeTerms = ref(false);
const submitted = ref(false);
const isSubmitting = ref(false);
const showSuccessDialog = ref(false);
const bookingCode = ref('');

// Thông tin thẻ
const cardInfo = ref({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
});

// Thông tin chuyển khoản
const bankInfo = {
    bankName: 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)',
    accountNumber: '1234567890',
    accountName: 'CÔNG TY TNHH KHÁCH SẠN ABC',
    content: 'BOOKING-' + Math.floor(Math.random() * 1000000)
};

// Lỗi
const errors = ref({});
const isProcessing = ref(false);

// Mock ảnh thanh toán online
const momoImage = 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png';
const vnpayImage = 'https://upload.wikimedia.org/wikipedia/vi/d/d4/VNPAY_Logo.svg';
const visaImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png';
const mastercardImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/1200px-MasterCard_Logo.svg.png';
const zalopayImage = 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png';

// Thông tin phòng
const roomName = ref('');
const roomImage = ref('');
const roomTotal = ref(0);
const breakfastTotal = ref(0);
const totalPrice = ref(0);
const couponDiscount = ref(0);
const isValidCoupon = ref(false);
const couponMessage = ref('');

// Ngày hủy phòng miễn phí
const cancelDate = computed(() => {
    if (!bookingData.value?.checkInDate) return new Date();
    const date = new Date(bookingData.value.checkInDate);
    date.setDate(date.getDate() - 1);
    return date;
});

// Quy tắc xác thực
const rules = {
    fullName: { required },
    email: { required, email },
    phone: {
        required,
        validPhone: helpers.withMessage('Số điện thoại không hợp lệ', helpers.regex(/^[0-9]{9,11}$/))
    }
};

const v$ = useVuelidate(rules, contactInfo);

onMounted(async () => {
    try {
        // Lấy dữ liệu đặt phòng từ localStorage
        const bookingDataStr = localStorage.getItem('currentBooking');

        if (!bookingDataStr) {
            router.push('/rooms');
            return;
        }

        const parsedData = JSON.parse(bookingDataStr);
        bookingData.value = parsedData;

        // Thiết lập thông tin phòng và giá
        roomName.value = parsedData.roomName || 'Phòng Deluxe';
        roomImage.value = parsedData.roomImage || nha_nghi_1;
        roomTotal.value = parsedData.pricePerNight * parsedData.bookingDays;

        // Tính giá bữa sáng nếu có
        if (parsedData.services && parsedData.services.breakfast) {
            const totalPeople = parsedData.adults + parsedData.children;
            breakfastTotal.value = totalPeople * parsedData.bookingDays * 150000;
        }

        // Tính tổng tiền
        calculateTotalPrice();

        // Kiểm tra nếu có mã giảm giá
        if (parsedData.couponCode) {
            verifyCoupon(parsedData.couponCode);
        }

        // Lấy thông tin người dùng đã đăng nhập nếu có
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            contactInfo.value.fullName = user.fullName || '';
            contactInfo.value.email = user.email || '';
            contactInfo.value.phone = user.phone || '';
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu đặt phòng:', error);
    } finally {
        loading.value = false;
    }
});

// Tính toán
const formattedCheckInDate = computed(() => {
    if (!bookingData.value?.checkInDate) return '';
    return new Date(bookingData.value.checkInDate).toLocaleDateString('vi-VN');
});

const formattedCheckOutDate = computed(() => {
    if (!bookingData.value?.checkOutDate) return '';
    return new Date(bookingData.value.checkOutDate).toLocaleDateString('vi-VN');
});

const days = computed(() => {
    if (!bookingData.value) return 0;
    return Math.round((new Date(bookingData.value.checkOutDate) - new Date(bookingData.value.checkInDate)) / (1000 * 60 * 60 * 24));
});

// Xác thực form thông tin khách hàng
const validateCustomerInfo = () => {
    const newErrors = {};

    if (!customerInfo.value.fullName.trim()) {
        newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!customerInfo.value.email.trim()) {
        newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(customerInfo.value.email)) {
        newErrors.email = 'Email không hợp lệ';
    }

    if (!customerInfo.value.phone.trim()) {
        newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(customerInfo.value.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!customerInfo.value.identityNumber.trim()) {
        newErrors.identityNumber = 'Vui lòng nhập số CMND/CCCD';
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

// Xác thực thông tin thanh toán
const validatePaymentInfo = () => {
    if (paymentMethod.value === 'PAY_AT_HOTEL' || paymentMethod.value === 'VNPAY') {
        return true;
    }

    if (paymentMethod.value === 'CREDIT_CARD') {
        const newErrors = {};

        if (!cardInfo.value.cardNumber.trim()) {
            newErrors.cardNumber = 'Vui lòng nhập số thẻ';
        } else if (!/^[0-9]{15,16}$/.test(cardInfo.value.cardNumber.replace(/\s/g, ''))) {
            newErrors.cardNumber = 'Số thẻ không hợp lệ';
        }

        if (!cardInfo.value.cardName.trim()) {
            newErrors.cardName = 'Vui lòng nhập tên chủ thẻ';
        }

        if (!cardInfo.value.expiryDate.trim()) {
            newErrors.expiryDate = 'Vui lòng nhập ngày hết hạn';
        } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardInfo.value.expiryDate)) {
            newErrors.expiryDate = 'Định dạng MM/YY không hợp lệ';
        }

        if (!cardInfo.value.cvv.trim()) {
            newErrors.cvv = 'Vui lòng nhập mã CVV';
        } else if (!/^[0-9]{3,4}$/.test(cardInfo.value.cvv)) {
            newErrors.cvv = 'Mã CVV không hợp lệ';
        }

        errors.value = newErrors;
        return Object.keys(newErrors).length === 0;
    }

    return true;
};

// Xác minh mã giảm giá
const verifyCoupon = (code) => {
    const coupons = {
        WELCOME10: { type: 'percent', value: 10 },
        SUMMER20: { type: 'percent', value: 20 },
        SAVE500K: { type: 'fixed', value: 500000 }
    };

    const coupon = coupons[code.toUpperCase()];

    if (coupon) {
        isValidCoupon.value = true;

        if (coupon.type === 'percent') {
            couponDiscount.value = (roomTotal.value * coupon.value) / 100;
            couponMessage.value = `Giảm ${coupon.value}% tổng hóa đơn`;
        } else {
            couponDiscount.value = coupon.value;
            couponMessage.value = `Giảm ${formatCurrency(coupon.value)}`;
        }

        // Cập nhật tổng tiền sau khi áp dụng mã giảm giá
        calculateTotalPrice();
    } else {
        isValidCoupon.value = false;
        couponDiscount.value = 0;
        couponMessage.value = '';
        calculateTotalPrice();
    }
};

// Tính tổng tiền
const calculateTotalPrice = () => {
    let total = roomTotal.value;

    // Thêm phí dịch vụ
    if (bookingData.value?.services) {
        if (bookingData.value.services.breakfast) {
            total += breakfastTotal.value;
        }

        if (bookingData.value.services.earlyCheckin) {
            total += 200000;
        }

        if (bookingData.value.services.lateCheckout) {
            total += 200000;
        }

        if (bookingData.value.services.airportPickup) {
            total += 350000;
        }
    }

    // Trừ giảm giá nếu có
    total -= couponDiscount.value;

    totalPrice.value = total > 0 ? total : 0;
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

// Xử lý thanh toán VNPay
const processVNPayPayment = async () => {
    isProcessing.value = true;

    try {
        // Tạo mã đặt phòng
        bookingCode.value = 'HB' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

        // Tạo đối tượng đặt phòng
        const booking = {
            id: bookingCode.value,
            roomId: bookingData.value.roomId,
            roomName: roomName.value,
            checkInDate: bookingData.value.checkInDate,
            checkOutDate: bookingData.value.checkOutDate,
            adults: bookingData.value.adults,
            children: bookingData.value.children,
            services: bookingData.value.services,
            couponCode: bookingData.value.couponCode,
            totalPrice: totalPrice.value,
            contactInfo: contactInfo.value,
            paymentMethod: paymentMethod.value,
            status: 'PENDING_PAYMENT',
            createdAt: new Date().toISOString()
        };

        // Lưu thông tin đặt phòng
        localStorage.setItem('lastBooking', JSON.stringify(booking));

        // Mô phỏng chuyển hướng đến trang thanh toán VNPay
        // Trong thực tế, đây sẽ là API call để tạo URL thanh toán và chuyển hướng
        alert('Bạn sẽ được chuyển đến trang thanh toán VNPay để hoàn tất giao dịch!');

        // Mô phỏng chuyển hướng đến trang thanh toán thành công
        setTimeout(() => {
            showSuccessDialog.value = true;
            isProcessing.value = false;
        }, 1500);
    } catch (error) {
        console.error('Lỗi khi xử lý thanh toán VNPay:', error);
        isProcessing.value = false;
    }
};

// Xác nhận đặt phòng
const confirmBooking = async () => {
    submitted.value = true;

    // Kiểm tra v$ tồn tại trước khi sử dụng
    if (v$.value) {
        v$.value.$touch();
        if (v$.value.$invalid || !agreeTerms.value) {
            return;
        }
    } else if (!agreeTerms.value) {
        return;
    }

    // Nếu thanh toán qua VNPay, xử lý riêng
    if (paymentMethod.value === 'VNPAY') {
        processVNPayPayment();
        return;
    }

    isSubmitting.value = true;

    try {
        // Tạo mã đặt phòng
        bookingCode.value =
            'HB' +
            Math.floor(Math.random() * 1000000)
                .toString()
                .padStart(6, '0');

        // Tạo đối tượng đặt phòng
        const booking = {
            id: bookingCode.value,
            roomId: bookingData.value.roomId,
            roomName: roomName.value,
            checkInDate: bookingData.value.checkInDate,
            checkOutDate: bookingData.value.checkOutDate,
            adults: bookingData.value.adults,
            children: bookingData.value.children,
            services: bookingData.value.services,
            couponCode: bookingData.value.couponCode,
            totalPrice: totalPrice.value,
            contactInfo: contactInfo.value,
            paymentMethod: paymentMethod.value,
            status: 'NEW',
            createdAt: new Date().toISOString()
        };

        // Lưu thông tin đặt phòng
        localStorage.setItem('lastBooking', JSON.stringify(booking));

        // Giả lập API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Hiển thị dialog thành công
        showSuccessDialog.value = true;
    } catch (error) {
        console.error('Lỗi khi đặt phòng:', error);
        // Hiển thị thông báo lỗi
    } finally {
        isSubmitting.value = false;
    }
};

// Điều hướng sau khi đặt phòng thành công
const viewBookingDetails = () => {
    router.push(`/booking/confirmation/${bookingCode.value}`);
    showSuccessDialog.value = false;
};

const goToHomePage = () => {
    router.push('/');
    showSuccessDialog.value = false;
};

// Xử lý các bước
const goToNextStep = () => {
    if (currentStep.value === 1) {
        if (validateCustomerInfo()) {
            currentStep.value = 2;
            window.scrollTo(0, 0);
        }
    } else if (currentStep.value === 2) {
        if (validatePaymentInfo()) {
            confirmBooking();
        }
    }
};

const goToPreviousStep = () => {
    if (currentStep.value > 1) {
        currentStep.value -= 1;
        window.scrollTo(0, 0);
    }
};
</script>

<template>
    <div class="booking-checkout-page bg-gray-50 min-h-screen py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-8">Đặt phòng</h1>

            <div v-if="loading" class="flex justify-center py-10">
                <ProgressSpinner />
            </div>

            <div v-else-if="!bookingData" class="bg-white p-10 rounded-lg shadow-md text-center">
                <i class="pi pi-exclamation-triangle text-5xl text-yellow-500 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy thông tin đặt phòng</h3>
                <p class="text-gray-600 mb-4">Vui lòng quay lại trang danh sách phòng để đặt phòng.</p>
                <Button label="Quay lại trang phòng" @click="router.push('/rooms')" />
            </div>

            <div v-else class="flex flex-col lg:flex-row gap-8">
                <!-- Main content -->
                <div class="lg:w-2/3">
                    <!-- Steps -->
                    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div class="flex items-center justify-between">
                            <div class="flex flex-col items-center">
                                <div :class="['rounded-full h-10 w-10 flex items-center justify-center', currentStep >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500']">1</div>
                                <span class="text-sm mt-1">Thông tin</span>
                            </div>

                            <div class="flex-1 h-1 mx-2" :class="currentStep >= 2 ? 'bg-amber-500' : 'bg-gray-200'"></div>

                            <div class="flex flex-col items-center">
                                <div :class="['rounded-full h-10 w-10 flex items-center justify-center', currentStep >= 2 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500']">2</div>
                                <span class="text-sm mt-1">Thanh toán</span>
                            </div>

                            <div class="flex-1 h-1 mx-2" :class="currentStep >= 3 ? 'bg-amber-500' : 'bg-gray-200'"></div>

                            <div class="flex flex-col items-center">
                                <div :class="['rounded-full h-10 w-10 flex items-center justify-center', currentStep >= 3 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500']">3</div>
                                <span class="text-sm mt-1">Xác nhận</span>
                            </div>
                        </div>
                    </div>

                    <!-- Step 1: Thông tin khách hàng -->
                    <div v-if="currentStep === 1" class="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 class="text-xl font-bold mb-4 text-gray-800">Thông tin khách hàng</h2>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-gray-700 mb-1">Họ và tên</label>
                                <InputText v-model="customerInfo.fullName" class="w-full" :class="{ 'p-invalid': errors.fullName }" />
                                <small class="text-red-500" v-if="errors.fullName">{{ errors.fullName }}</small>
                            </div>

                            <div>
                                <label class="block text-gray-700 mb-1">Email</label>
                                <InputText v-model="customerInfo.email" type="email" class="w-full" :class="{ 'p-invalid': errors.email }" />
                                <small class="text-red-500" v-if="errors.email">{{ errors.email }}</small>
                            </div>

                            <div>
                                <label class="block text-gray-700 mb-1">Số điện thoại</label>
                                <InputText v-model="customerInfo.phone" class="w-full" :class="{ 'p-invalid': errors.phone }" />
                                <small class="text-red-500" v-if="errors.phone">{{ errors.phone }}</small>
                            </div>

                            <div>
                                <label class="block text-gray-700 mb-1">CMND/CCCD</label>
                                <InputText v-model="customerInfo.identityNumber" class="w-full" :class="{ 'p-invalid': errors.identityNumber }" />
                                <small class="text-red-500" v-if="errors.identityNumber">{{ errors.identityNumber }}</small>
                            </div>

                            <div>
                                <label class="block text-gray-700 mb-1">Địa chỉ</label>
                                <InputText v-model="customerInfo.address" class="w-full" />
                            </div>

                            <div>
                                <label class="block text-gray-700 mb-1">Quốc tịch</label>
                                <InputText v-model="customerInfo.nationality" class="w-full" />
                            </div>
                        </div>

                        <div class="flex justify-end">
                            <Button label="Tiếp tục" @click="goToNextStep" class="p-button-primary" />
                        </div>
                    </div>

                    <!-- Step 2: Thanh toán -->
                    <div v-else-if="currentStep === 2" class="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 class="text-xl font-bold mb-4 text-gray-800">Phương thức thanh toán</h2>

                        <div class="space-y-4">
                            <div class="border rounded-lg p-4 flex items-center" :class="{ 'border-amber-500 bg-amber-50': paymentMethod === 'CREDIT_CARD' }">
                                <RadioButton v-model="paymentMethod" name="payment" value="CREDIT_CARD" :class="{ 'text-amber-500': paymentMethod === 'CREDIT_CARD' }" />
                                <label for="CREDIT_CARD" class="ml-2 flex-1">Thẻ tín dụng / Thẻ ghi nợ</label>
                                <div class="flex space-x-2">
                                    <img :src="visaImage" alt="Visa" class="h-8" />
                                    <img :src="mastercardImage" alt="Mastercard" class="h-8" />
                                </div>
                            </div>

                            <div class="border rounded-lg p-4 flex items-center" :class="{ 'border-amber-500 bg-amber-50': paymentMethod === 'VNPAY' }">
                                <RadioButton v-model="paymentMethod" name="payment" value="VNPAY" :class="{ 'text-amber-500': paymentMethod === 'VNPAY' }" />
                                <label for="VNPAY" class="ml-2 flex-1">Thanh toán qua VNPay</label>
                                <div class="flex space-x-2">
                                    <img :src="vnpayImage" alt="VNPay" class="h-8" />
                                </div>
                            </div>

                            <div class="border rounded-lg p-4 flex items-center" :class="{ 'border-amber-500 bg-amber-50': paymentMethod === 'BANK_TRANSFER' }">
                                <RadioButton v-model="paymentMethod" name="payment" value="BANK_TRANSFER" :class="{ 'text-amber-500': paymentMethod === 'BANK_TRANSFER' }" />
                                <label for="BANK_TRANSFER" class="ml-2">Chuyển khoản ngân hàng</label>
                            </div>

                            <div class="border rounded-lg p-4 flex items-center" :class="{ 'border-amber-500 bg-amber-50': paymentMethod === 'PAY_AT_HOTEL' }">
                                <RadioButton v-model="paymentMethod" name="payment" value="PAY_AT_HOTEL" :class="{ 'text-amber-500': paymentMethod === 'PAY_AT_HOTEL' }" />
                                <label for="PAY_AT_HOTEL" class="ml-2">Thanh toán tại khách sạn</label>
                            </div>
                        </div>

                        <div v-if="paymentMethod === 'CREDIT_CARD'" class="mb-6">
                            <h3 class="text-lg font-semibold mb-3">Thông tin thẻ</h3>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="md:col-span-2">
                                    <label class="block text-gray-700 mb-1">Số thẻ</label>
                                    <InputText v-model="cardInfo.cardNumber" class="w-full" placeholder="XXXX XXXX XXXX XXXX" :class="{ 'p-invalid': errors.cardNumber }" />
                                    <small class="text-red-500" v-if="errors.cardNumber">{{ errors.cardNumber }}</small>
                                </div>

                                <div class="md:col-span-2">
                                    <label class="block text-gray-700 mb-1">Tên chủ thẻ</label>
                                    <InputText v-model="cardInfo.cardName" class="w-full" placeholder="VD: NGUYEN VAN A" :class="{ 'p-invalid': errors.cardName }" />
                                    <small class="text-red-500" v-if="errors.cardName">{{ errors.cardName }}</small>
                                </div>

                                <div>
                                    <label class="block text-gray-700 mb-1">Ngày hết hạn</label>
                                    <InputText v-model="cardInfo.expiryDate" class="w-full" placeholder="MM/YY" :class="{ 'p-invalid': errors.expiryDate }" />
                                    <small class="text-red-500" v-if="errors.expiryDate">{{ errors.expiryDate }}</small>
                                </div>

                                <div>
                                    <label class="block text-gray-700 mb-1">Mã CVV</label>
                                    <InputText v-model="cardInfo.cvv" class="w-full" placeholder="123" :class="{ 'p-invalid': errors.cvv }" />
                                    <small class="text-red-500" v-if="errors.cvv">{{ errors.cvv }}</small>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="paymentMethod === 'VNPAY'" class="mb-6">
                            <h3 class="text-lg font-semibold mb-3">Thanh toán qua VNPay</h3>

                            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 flex flex-col items-center">
                                <img :src="vnpayImage" alt="VNPay" class="h-16 mb-4" />
                                <p class="mb-2 text-center">Bạn sẽ được chuyển hướng đến cổng thanh toán VNPay để hoàn tất giao dịch.</p>
                                <p class="mb-4 text-center text-sm text-blue-700">VNPay là cổng thanh toán trực tuyến an toàn và bảo mật nhất tại Việt Nam.</p>
                                <div class="grid grid-cols-4 gap-3 mt-2">
                                    <img src="https://sandbox.vnpayment.vn/apis/assets/images/partner_bank/vietcombank.png" class="h-8 object-contain" alt="VCB" />
                                    <img src="https://sandbox.vnpayment.vn/apis/assets/images/partner_bank/viettinbank.png" class="h-8 object-contain" alt="VTB" />
                                    <img src="https://sandbox.vnpayment.vn/apis/assets/images/partner_bank/bidv.png" class="h-8 object-contain" alt="BIDV" />
                                    <img src="https://sandbox.vnpayment.vn/apis/assets/images/partner_bank/agribank.png" class="h-8 object-contain" alt="Agribank" />
                                </div>
                            </div>
                        </div>

                        <div v-else-if="paymentMethod === 'BANK_TRANSFER'" class="mb-6">
                            <h3 class="text-lg font-semibold mb-3">Thông tin chuyển khoản</h3>

                            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p class="mb-2"><span class="font-semibold">Ngân hàng:</span> {{ bankInfo.bankName }}</p>
                                <p class="mb-2"><span class="font-semibold">Số tài khoản:</span> {{ bankInfo.accountNumber }}</p>
                                <p class="mb-2"><span class="font-semibold">Chủ tài khoản:</span> {{ bankInfo.accountName }}</p>
                                <p class="mb-2"><span class="font-semibold">Nội dung chuyển khoản:</span> {{ bankInfo.content }}</p>
                                <p class="mt-4 text-sm text-blue-700">Vui lòng chuyển khoản và cung cấp biên lai khi đến nhận phòng. Đơn đặt phòng của bạn sẽ được xác nhận sau khi chúng tôi nhận được tiền.</p>
                            </div>
                        </div>

                        <div v-else-if="paymentMethod === 'PAY_AT_HOTEL'" class="mb-6">
                            <h3 class="text-lg font-semibold mb-3">Thanh toán tại khách sạn</h3>

                            <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <p class="mb-2">Bạn sẽ thanh toán trực tiếp tại khách sạn khi nhận phòng.</p>
                                <p class="mb-2">Lưu ý: Khách sạn có thể yêu cầu thẻ tín dụng hoặc đặt cọc khi nhận phòng.</p>
                                <p class="text-sm text-yellow-700 mt-2">Vui lòng mang theo CMND/CCCD và đến đúng thời gian nhận phòng đã đặt.</p>
                            </div>
                        </div>

                        <div class="mb-4">
                            <div class="p-field-checkbox">
                                <Checkbox v-model="agreeTerms" :binary="true" id="agreeTerms" />
                                <label for="agreeTerms" class="ml-2">
                                    Tôi đồng ý với <a href="#" class="text-amber-600 hover:underline">Điều khoản & Điều kiện</a> và <a href="#" class="text-amber-600 hover:underline">Chính sách bảo mật</a>
                                </label>
                            </div>
                            <small v-if="submitted && !agreeTerms" class="p-error">Bạn phải đồng ý với điều khoản để tiếp tục</small>
                        </div>

                        <div class="flex justify-between">
                            <Button label="Quay lại" @click="goToPreviousStep" class="p-button-outlined" />
                            <Button label="Hoàn tất đặt phòng" @click="goToNextStep" :loading="isProcessing" />
                        </div>
                    </div>
                </div>

                <!-- Sidebar - Thông tin đặt phòng -->
                <div class="lg:w-1/3">
                    <div class="bg-white p-6 rounded-lg shadow-md sticky top-4">
                        <h2 class="text-xl font-bold mb-4 text-gray-800">Thông tin đặt phòng</h2>

                        <div class="border-b border-gray-200 pb-4 mb-4">
                            <div class="flex items-center mb-4">
                                <img :src="bookingData?.roomImage || nha_nghi_1" :alt="bookingData.roomName" class="w-20 h-20 object-cover rounded-lg mr-4" />
                                <div>
                                    <h3 class="font-semibold text-gray-800">{{ bookingData.roomName }}</h3>
                                    <p class="text-sm text-gray-600">{{ formattedCheckInDate }} - {{ formattedCheckOutDate }}</p>
                                    <p class="text-sm text-gray-600">{{ days }} đêm, {{ bookingData.guests }} người</p>
                                </div>
                            </div>

                            <div v-if="bookingData.specialRequests" class="mb-4">
                                <h4 class="font-medium text-gray-700 mb-1">Yêu cầu đặc biệt:</h4>
                                <p class="text-sm text-gray-600">{{ bookingData.specialRequests }}</p>
                            </div>
                        </div>

                        <div class="mb-4">
                            <div class="flex justify-between mb-2">
                                <span class="text-gray-700">Giá phòng ({{ days }} đêm)</span>
                                <span class="font-medium">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.pricePerNight * days) }}</span>
                            </div>

                            <div class="flex justify-between mb-2">
                                <span class="text-gray-700">Thuế và phí</span>
                                <span class="font-medium">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.pricePerNight * days * 0.1) }}</span>
                            </div>
                        </div>

                        <div class="border-t border-gray-200 pt-4 mb-4">
                            <div class="flex justify-between text-lg font-bold">
                                <span>Tổng cộng</span>
                                <span class="text-amber-600">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.totalPrice * 1.1) }}</span>
                            </div>
                        </div>

                        <div class="bg-gray-100 p-4 rounded-lg text-sm text-gray-700">
                            <p class="mb-2">
                                <i class="pi pi-check-circle text-green-500 mr-1"></i>
                                Không mất phí hủy phòng trước {{ formattedCheckInDate }}
                            </p>
                            <p>
                                <i class="pi pi-check-circle text-green-500 mr-1"></i>
                                Đảm bảo giá tốt nhất
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
