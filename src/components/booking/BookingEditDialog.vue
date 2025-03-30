<script setup>
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { computed, onMounted, ref, watch } from 'vue';

// Khai báo props
const props = defineProps({
    visible: Boolean,
    bookingData: Object,
    submitted: Boolean,
    statuses: Array,
    paymentStatuses: Array,
    paymentMethods: Array
});

const emit = defineEmits(['update:visible', 'save', 'hideDialog', 'update:bookingData']);

// Tạo biến cục bộ để lưu trữ dữ liệu
const localBooking = ref({});

// Khai báo các phương thức thanh toán mặc định
const defaultPaymentMethods = ref([
    { label: 'Tiền mặt', value: 'CASH' },
    { label: 'VnPay', value: 'VNPAY' },
    { label: 'Thẻ tín dụng', value: 'CREDIT_CARD' },
    { label: 'Chuyển khoản', value: 'BANK_TRANSFER' }
]);

// Kiểm tra và sử dụng paymentMethods từ props nếu có, nếu không thì dùng giá trị mặc định
// Di chuyển lên trước hàm watch để tránh lỗi reference
const actualPaymentMethods = computed(() => {
    return props.paymentMethods && props.paymentMethods.length > 0 ? props.paymentMethods : defaultPaymentMethods.value;
});

// Kiểm tra và chuẩn hóa phương thức thanh toán
const normalizePaymentMethod = (method) => {
    if (!method) return null;

    // Chuẩn hóa các trường hợp khác nhau
    const methodUpper = typeof method === 'string' ? method.toUpperCase() : '';

    // Map các giá trị khác nhau về một giá trị chuẩn
    const methodMap = {
        VNPAY: 'VNPAY',
        VN_PAY: 'VNPAY',
        VNPAY_PAYMENT: 'VNPAY',
        CASH: 'CASH',
        'TIỀN MẶT': 'CASH',
        CREDIT_CARD: 'CREDIT_CARD',
        CREDIT: 'CREDIT_CARD',
        BANK_TRANSFER: 'BANK_TRANSFER',
        TRANSFER: 'BANK_TRANSFER'
    };

    return methodMap[methodUpper] || method;
};

// Cập nhật dữ liệu cục bộ khi props thay đổi
watch(
    () => props.bookingData,
    (newVal) => {
        if (newVal) {
            try {
                const bookingCopy = JSON.parse(JSON.stringify(newVal));

                // Chuẩn hóa phương thức thanh toán
                if (bookingCopy.paymentMethod) {
                    bookingCopy.paymentMethod = normalizePaymentMethod(bookingCopy.paymentMethod);
                }

                localBooking.value = bookingCopy;

                // Log để debug - đảm bảo không gây lỗi
                console.log('Original paymentMethod:', newVal.paymentMethod);
                console.log('Normalized paymentMethod:', localBooking.value.paymentMethod);
                console.log('Available methods:', actualPaymentMethods.value.map((m) => m.value).join(', '));
            } catch (error) {
                console.error('Error processing booking data:', error);
                localBooking.value = newVal || {};
            }
        }
    },
    { immediate: true, deep: true }
);

const save = () => {
    emit('update:bookingData', localBooking.value);
    emit('save');
};

const hideDialog = () => {
    emit('hideDialog');
};

const updateVisible = (val) => {
    emit('update:visible', val);
};

// Debug khi component mounted
onMounted(() => {
    console.log('Component mounted - Payment Methods:', actualPaymentMethods.value);
    if (localBooking.value?.paymentMethod) {
        console.log('Initial paymentMethod:', localBooking.value.paymentMethod);
    }
});
</script>

<template>
    <Dialog :visible="visible" @update:visible="updateVisible" :style="{ width: '1000px' }" header="Thông tin đơn đặt phòng" :modal="true" class="p-fluid booking-dialog">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <!-- Thông tin khách hàng - Cột 1 -->
            <div class="field w-full">
                <div class="p-4 rounded-lg border-1 border-gray-200 w-full">
                    <h3 class="text-lg font-medium mb-3">Thông tin khách hàng</h3>

                    <div class="mb-3 w-full">
                        <label for="fullName" class="block font-medium text-sm mb-1">Họ và tên</label>
                        <InputText id="fullName" v-model.trim="localBooking.fullName" required class="w-full" :class="{ 'p-invalid': submitted && !localBooking.fullName }" />
                        <small class="p-error" v-if="submitted && !localBooking.fullName">Họ và tên là bắt buộc.</small>
                    </div>

                    <div class="mb-3 w-full">
                        <label for="email" class="block font-medium text-sm mb-1">Email</label>
                        <InputText id="email" v-model.trim="localBooking.email" type="email" class="w-full" />
                    </div>

                    <div class="mb-3 w-full">
                        <label for="phone" class="block font-medium text-sm mb-1">Số điện thoại</label>
                        <InputText id="phone" v-model.trim="localBooking.phone" class="w-full" />
                    </div>

                    <div class="mb-3 w-full">
                        <label for="nationalId" class="block font-medium text-sm mb-1">CMND/CCCD</label>
                        <InputText id="nationalId" v-model.trim="localBooking.nationalId" class="w-full" />
                    </div>
                </div>
            </div>

            <!-- Thông tin đặt phòng - Cột 2 -->
            <div class="field w-full">
                <div class="p-4 rounded-lg border-1 border-gray-200 w-full">
                    <h3 class="text-lg font-medium mb-3">Thông tin đặt phòng</h3>

                    <div class="mb-3 w-full">
                        <label for="checkInDate" class="block font-medium text-sm mb-1">Ngày nhận phòng</label>
                        <Calendar id="checkInDate" v-model="localBooking.checkInDate" dateFormat="dd/mm/yy" showIcon required class="w-full" :class="{ 'p-invalid': submitted && !localBooking.checkInDate }" />
                        <small class="p-error" v-if="submitted && !localBooking.checkInDate">Ngày nhận phòng là bắt buộc.</small>
                    </div>

                    <div class="mb-3 w-full">
                        <label for="checkOutDate" class="block font-medium text-sm mb-1">Ngày trả phòng</label>
                        <Calendar id="checkOutDate" v-model="localBooking.checkOutDate" dateFormat="dd/mm/yy" showIcon required class="w-full" :class="{ 'p-invalid': submitted && !localBooking.checkOutDate }" />
                        <small class="p-error" v-if="submitted && !localBooking.checkOutDate">Ngày trả phòng là bắt buộc.</small>
                    </div>

                    <div class="mb-3 w-full">
                        <label for="status" class="block font-medium text-sm mb-1">Trạng thái</label>
                        <Dropdown id="status" v-model="localBooking.status" :options="statuses" optionLabel="label" optionValue="value" required class="w-full" :class="{ 'p-invalid': submitted && !localBooking.status }" />
                        <small class="p-error" v-if="submitted && !localBooking.status">Trạng thái là bắt buộc.</small>
                    </div>
                </div>
            </div>

            <!-- Thông tin thanh toán - Cột 3 -->
            <div class="field w-full">
                <div class="p-4 rounded-lg border-1 border-gray-200 w-full">
                    <h3 class="text-lg font-medium mb-3">Thông tin thanh toán</h3>

                    <div class="mb-3 w-full">
                        <label for="totalPrice" class="block font-medium text-sm mb-1">Tổng tiền</label>
                        <InputNumber id="totalPrice" v-model="localBooking.totalPrice" mode="currency" currency="VND" locale="vi-VN" :minFractionDigits="0" class="w-full" />
                    </div>

                    <div class="mb-3 w-full">
                        <label for="discountCode" class="block font-medium text-sm mb-1">Mã giảm giá</label>
                        <InputText id="discountCode" v-model.trim="localBooking.discountCode" class="w-full" />
                    </div>

                    <div class="mb-3 w-full">
                        <label for="finalPrice" class="block font-medium text-sm mb-1">Số tiền sau giảm giá</label>
                        <InputNumber id="finalPrice" v-model="localBooking.finalPrice" mode="currency" currency="VND" locale="vi-VN" :minFractionDigits="0" class="w-full" />
                    </div>
                </div>
            </div>

            <!-- Phương thức thanh toán - Cột 4 -->
            <div class="field w-full">
                <div class="p-4 rounded-lg border-1 border-gray-200 w-full">
                    <h3 class="text-lg font-medium mb-3">Phương thức thanh toán</h3>

                    <div class="mb-3 w-full">
                        <label for="paymentMethod" class="block font-medium text-sm mb-1">Phương thức</label>
                        <Dropdown id="paymentMethod" v-model="localBooking.paymentMethod" :options="actualPaymentMethods" optionLabel="label" optionValue="value" class="w-full" placeholder="Chọn phương thức thanh toán" />
                        <!-- Debug payment method -->
                        <small v-if="false" class="text-blue-500"> Selected: {{ localBooking.paymentMethod }} | Options: {{ actualPaymentMethods.map((m) => m.value).join(', ') }} </small>
                    </div>

                    <div class="mb-3 w-full">
                        <label for="paymentStatus" class="block font-medium text-sm mb-1">Trạng thái thanh toán</label>
                        <Dropdown id="paymentStatus" v-model="localBooking.paymentStatus" :options="paymentStatuses" optionLabel="label" optionValue="value" class="w-full" />
                    </div>

                    <div class="mb-3 w-full">
                        <label for="paymentDate" class="block font-medium text-sm mb-1">Ngày thanh toán</label>
                        <Calendar id="paymentDate" v-model="localBooking.paymentDate" dateFormat="dd/mm/yy" showIcon class="w-full" />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="Hủy" icon="pi pi-times" outlined @click="hideDialog" class="p-button-sm" />
                <Button label="Lưu" icon="pi pi-check" @click="save" class="p-button-sm" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.booking-dialog :deep(.p-dialog-content) {
    padding: 1.5rem;
    overflow-y: auto;
    max-height: 80vh;
}

.booking-dialog :deep(.p-dialog-header) {
    border-bottom: 1px solid var(--surface-border);
    padding: 1.25rem 1.5rem;
}

.booking-dialog :deep(.p-dialog-footer) {
    border-top: 1px solid var(--surface-border);
    padding: 1.25rem 1.5rem;
}

.booking-dialog :deep(.p-inputtext),
.booking-dialog :deep(.p-dropdown),
.booking-dialog :deep(.p-calendar),
.booking-dialog :deep(.p-inputnumber) {
    height: 2.357rem;
    font-size: 0.875rem;
}

.booking-dialog :deep(.p-dropdown-panel),
.booking-dialog :deep(.p-calendar-panel) {
    font-size: 0.875rem;
}

.booking-dialog :deep(.p-datepicker) {
    min-width: 280px;
}

.booking-dialog :deep(.p-inputnumber-buttons-stacked .p-button) {
    height: 1.1785rem;
}

.booking-dialog :deep(.p-inputnumber-buttons-stacked .p-inputnumber-button-group) {
    width: 2.357rem;
}

@media screen and (max-width: 960px) {
    .booking-dialog :deep(.p-dialog-content) {
        padding: 1rem;
    }

    .field {
        margin-bottom: 1rem;
    }
}
</style>
