<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const processingBooking = ref(false);
const paymentInfo = ref({
    amount: 0,
    bankCode: '',
    bankName: '',
    bankTranNo: '',
    cardType: '',
    orderInfo: '',
    payDate: '',
    responseCode: '',
    tmnCode: '',
    transactionNo: '',
    transactionStatus: '',
    txnRef: '',
    secureHash: '',
    formattedAmount: '',
    paymentStatus: '',
    message: '',
    success: false
});

const paymentStatus = ref({
    success: false,
    message: '',
    bookingId: null
});

// Chuyển đổi số tiền từ số nguyên sang VND
const formatAmount = (amount) => {
    const amountNumber = parseInt(amount);
    if (isNaN(amountNumber)) return '0';

    // VNPay có thể trả về số tiền ở 2 định dạng:
    // 1. Đơn vị là xu (trường amount cần chia 100)
    // 2. Đơn vị là VND (trường amount và vnp_Amount mới)

    // Nếu amount > 10^8, giả định là đơn vị xu (cần chia 100)
    // Nếu không, giả định là đơn vị VND
    const divisor = amountNumber > 100000000 ? 100 : 1;

    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amountNumber / divisor);
};

// Format ngày từ nhiều định dạng khác nhau
const formatPayDate = (payDate) => {
    if (!payDate) return '';

    // Nếu là định dạng mới từ VNPay (đã được format sẵn: dd/MM/yyyy HH:mm:ss)
    if (payDate.includes('/')) {
        return payDate;
    }

    // Nếu là định dạng cũ từ VNPay (yyyyMMddHHmmss)
    try {
        if (payDate.length >= 14) {
            const year = payDate.substring(0, 4);
            const month = payDate.substring(4, 6);
            const day = payDate.substring(6, 8);
            const hour = payDate.substring(8, 10);
            const minute = payDate.substring(10, 12);
            const second = payDate.substring(12, 14);

            return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
        }
    } catch (error) {
        console.error('Lỗi khi format ngày thanh toán:', error);
    }

    // Trả về giá trị ban đầu nếu không thể format
    return payDate;
};

// Phân tích thông tin thanh toán từ query parameters
const parsePaymentInfo = () => {
    const queryParams = route.query;

    paymentInfo.value = {
        amount: queryParams.vnp_Amount || queryParams.amount || 0,
        bankCode: queryParams.vnp_BankCode || queryParams.bankCode || '',
        bankName: queryParams.bankName || '',
        bankTranNo: queryParams.vnp_BankTranNo || '',
        cardType: queryParams.vnp_CardType || queryParams.cardType || '',
        orderInfo: queryParams.vnp_OrderInfo || queryParams.orderInfo || '',
        payDate: queryParams.vnp_PayDate || queryParams.paymentTime || '',
        responseCode: queryParams.vnp_ResponseCode || '',
        tmnCode: queryParams.vnp_TmnCode || '',
        transactionNo: queryParams.vnp_TransactionNo || queryParams.transactionNo || '',
        transactionStatus: queryParams.vnp_TransactionStatus || '',
        txnRef: queryParams.vnp_TxnRef || '',
        secureHash: queryParams.vnp_SecureHash || queryParams.vnp_SecureHash || '',
        formattedAmount: queryParams.formattedAmount || '',
        paymentStatus: queryParams.paymentStatus || '',
        message: queryParams.message || '',
        success: queryParams.success === 'true'
    };

    // Kiểm tra trạng thái thanh toán dựa vào mã phản hồi hoặc trường success
    const isSuccess = (paymentInfo.value.responseCode === '00' && paymentInfo.value.transactionStatus === '00') ||
                      paymentInfo.value.success;

    paymentStatus.value = {
        success: isSuccess,
        message: isSuccess
            ? paymentInfo.value.message || 'Thanh toán thành công'
            : paymentInfo.value.message || 'Thanh toán thất bại. Vui lòng liên hệ với khách sạn hoặc thử lại.',
        bookingId: queryParams.vnp_OrderInfo ? queryParams.vnp_OrderInfo.replace('Thanh toán đặt phòng #', '') :
                  (paymentInfo.value.orderInfo ? paymentInfo.value.orderInfo.replace('Thanh toán đặt phòng #', '') :
                  (paymentInfo.value.txnRef || null))
    };
};

// Gửi thông tin thanh toán tới server để cập nhật đơn đặt phòng
const updateBookingStatus = async () => {
    if (processingBooking.value) return;

    processingBooking.value = true;

    try {
        // Không cần gửi secureHash lên server
        const { secureHash, ...paymentData } = paymentInfo.value;

        const response = await fetch('/api/v1/bookings/payment-callback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
            throw new Error('Không thể cập nhật trạng thái đặt phòng');
        }

        const result = await response.json();
        paymentStatus.value.bookingId = result.bookingId || paymentStatus.value.bookingId;

        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã cập nhật trạng thái đặt phòng',
            life: 3000
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đặt phòng:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể cập nhật trạng thái đặt phòng',
            life: 3000
        });
    } finally {
        processingBooking.value = false;
    }
};

// Điều hướng tới trang chi tiết đặt phòng
const goToBookingDetail = () => {
    if (paymentStatus.value.bookingId) {
        router.push(`/booking/confirmation/${paymentStatus.value.bookingId}`);
    } else {
        router.push('/');
    }
};

// Điều hướng về trang chủ
const goToHomePage = () => {
    router.push('/');
};

onMounted(() => {
    // Phân tích thông tin thanh toán từ query parameters
    parsePaymentInfo();

    // Nếu thanh toán thành công, cập nhật trạng thái đặt phòng
    if (paymentStatus.value.success) {
        updateBookingStatus();
    }

    // Kết thúc quá trình loading
    setTimeout(() => {
        loading.value = false;
    }, 800);
});
</script>

<template>
    <div class="payment-callback-page bg-gray-50 min-h-screen py-8">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div v-if="loading" class="flex justify-center py-10">
                <ProgressSpinner />
            </div>

            <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
                <!-- Header -->
                <div :class="[
                    'p-6 text-center',
                    paymentStatus.success ? 'bg-green-50' : 'bg-red-50'
                ]">
                    <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                         :class="paymentStatus.success ? 'bg-green-100' : 'bg-red-100'">
                        <i :class="[
                            'text-4xl',
                            paymentStatus.success ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'
                        ]"></i>
                    </div>
                    <h1 class="text-2xl font-bold mb-2"
                        :class="paymentStatus.success ? 'text-green-800' : 'text-red-800'">
                        {{ paymentStatus.success ? 'Thanh toán thành công' : 'Thanh toán thất bại' }}
                    </h1>
                    <p class="text-gray-600">{{ paymentStatus.message }}</p>
                </div>

                <!-- Thông tin thanh toán -->
                <div class="p-6">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4">Thông tin thanh toán</h2>

                    <div class="space-y-3">
                        <div class="flex justify-between border-b border-gray-100 pb-2">
                            <span class="text-gray-600">Số tiền:</span>
                            <span class="font-semibold">{{ paymentInfo.formattedAmount || formatAmount(paymentInfo.amount) }}</span>
                        </div>

                        <div class="flex justify-between border-b border-gray-100 pb-2">
                            <span class="text-gray-600">Ngân hàng:</span>
                            <span class="font-semibold">{{ paymentInfo.bankName || paymentInfo.bankCode }}</span>
                        </div>

                        <div class="flex justify-between border-b border-gray-100 pb-2">
                            <span class="text-gray-600">Loại thẻ:</span>
                            <span class="font-semibold">{{ paymentInfo.cardType }}</span>
                        </div>

                        <div class="flex justify-between border-b border-gray-100 pb-2">
                            <span class="text-gray-600">Mã giao dịch:</span>
                            <span class="font-semibold">{{ paymentInfo.transactionNo }}</span>
                        </div>

                        <div class="flex justify-between border-b border-gray-100 pb-2">
                            <span class="text-gray-600">Thời gian:</span>
                            <span class="font-semibold">{{ formatPayDate(paymentInfo.payDate) }}</span>
                        </div>

                        <div class="flex justify-between border-b border-gray-100 pb-2">
                            <span class="text-gray-600">Trạng thái:</span>
                            <span :class="[
                                'font-semibold',
                                paymentStatus.success ? 'text-green-600' : 'text-red-600'
                            ]">
                                {{ paymentInfo.paymentStatus || (paymentStatus.success ? 'Thành công' : 'Thất bại') }}
                            </span>
                        </div>

                        <div v-if="paymentInfo.orderInfo" class="flex justify-between border-b border-gray-100 pb-2">
                            <span class="text-gray-600">Nội dung:</span>
                            <span class="font-semibold">{{ paymentInfo.orderInfo }}</span>
                        </div>

                        <div v-if="paymentStatus.bookingId" class="flex justify-between pb-2">
                            <span class="text-gray-600">Mã đơn:</span>
                            <span class="font-semibold">{{ paymentStatus.bookingId }}</span>
                        </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="mt-8 space-y-3">
                        <Button v-if="paymentStatus.success && paymentStatus.bookingId"
                                @click="goToBookingDetail"
                                label="Xem chi tiết đặt phòng"
                                icon="pi pi-file"
                                class="w-full" />

                        <Button v-if="!paymentStatus.success"
                                @click="goToHomePage"
                                label="Quay lại trang chủ"
                                icon="pi pi-home"
                                class="w-full p-button-outlined" />
                    </div>

                    <!-- Note -->
                    <div class="mt-6 text-center text-sm text-gray-500">
                        <p v-if="paymentStatus.success">
                            Xác nhận đặt phòng đã được gửi đến email của bạn. Vui lòng kiểm tra email để biết thêm chi tiết.
                        </p>
                        <p v-else>
                            Nếu bạn gặp vấn đề với giao dịch, vui lòng liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.payment-callback-page {
    min-height: calc(100vh - 300px);
}
</style>
