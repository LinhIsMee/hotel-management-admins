<script setup>
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { ref, watch } from 'vue';

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

// Cập nhật dữ liệu cục bộ khi props thay đổi
watch(
    () => props.bookingData,
    (newVal) => {
        if (newVal) {
            localBooking.value = JSON.parse(JSON.stringify(newVal));
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
</script>

<template>
    <Dialog :visible="visible" @update:visible="updateVisible" :style="{ width: '750px' }" header="Thông tin đơn đặt phòng" :modal="true" class="p-fluid booking-dialog">
        <div class="grid">
            <!-- Cột trái -->
            <div class="col-12 md:col-6">
                <h3 class="text-lg font-medium mb-3">Thông tin khách hàng</h3>

                <div class="field mb-3">
                    <label for="fullName" class="block font-medium text-sm mb-1">Họ và tên</label>
                    <InputText id="fullName" v-model.trim="localBooking.fullName" required class="w-full" :class="{ 'p-invalid': submitted && !localBooking.fullName }" />
                    <small class="p-error" v-if="submitted && !localBooking.fullName">Họ và tên là bắt buộc.</small>
                </div>

                <div class="field mb-3">
                    <label for="email" class="block font-medium text-sm mb-1">Email</label>
                    <InputText id="email" v-model.trim="localBooking.email" type="email" class="w-full" />
                </div>

                <div class="field mb-3">
                    <label for="phone" class="block font-medium text-sm mb-1">Số điện thoại</label>
                    <InputText id="phone" v-model.trim="localBooking.phone" class="w-full" />
                </div>

                <div class="field mb-3">
                    <label for="nationalId" class="block font-medium text-sm mb-1">CMND/CCCD</label>
                    <InputText id="nationalId" v-model.trim="localBooking.nationalId" class="w-full" />
                </div>

                <h3 class="text-lg font-medium mb-3 mt-4">Thông tin thanh toán</h3>

                <div class="field mb-3">
                    <label for="totalPrice" class="block font-medium text-sm mb-1">Tổng tiền</label>
                    <InputNumber id="totalPrice" v-model="localBooking.totalPrice" mode="currency" currency="VND" locale="vi-VN" :minFractionDigits="0" class="w-full" />
                </div>

                <div class="field mb-3">
                    <label for="discountCode" class="block font-medium text-sm mb-1">Mã giảm giá</label>
                    <InputText id="discountCode" v-model.trim="localBooking.discountCode" class="w-full" />
                </div>

                <div class="field mb-3">
                    <label for="finalPrice" class="block font-medium text-sm mb-1">Số tiền sau giảm giá</label>
                    <InputNumber id="finalPrice" v-model="localBooking.finalPrice" mode="currency" currency="VND" locale="vi-VN" :minFractionDigits="0" class="w-full" />
                </div>
            </div>

            <!-- Cột phải -->
            <div class="col-12 md:col-6">
                <h3 class="text-lg font-medium mb-3">Thông tin đặt phòng</h3>

                <div class="field mb-3">
                    <label for="checkInDate" class="block font-medium text-sm mb-1">Ngày nhận phòng</label>
                    <Calendar id="checkInDate" v-model="localBooking.checkInDate" dateFormat="dd/mm/yy" showIcon required class="w-full" :class="{ 'p-invalid': submitted && !localBooking.checkInDate }" />
                    <small class="p-error" v-if="submitted && !localBooking.checkInDate">Ngày nhận phòng là bắt buộc.</small>
                </div>

                <div class="field mb-3">
                    <label for="checkOutDate" class="block font-medium text-sm mb-1">Ngày trả phòng</label>
                    <Calendar id="checkOutDate" v-model="localBooking.checkOutDate" dateFormat="dd/mm/yy" showIcon required class="w-full" :class="{ 'p-invalid': submitted && !localBooking.checkOutDate }" />
                    <small class="p-error" v-if="submitted && !localBooking.checkOutDate">Ngày trả phòng là bắt buộc.</small>
                </div>

                <div class="field mb-3">
                    <label for="status" class="block font-medium text-sm mb-1">Trạng thái</label>
                    <Dropdown id="status" v-model="localBooking.status" :options="statuses" optionLabel="label" optionValue="value" required class="w-full" :class="{ 'p-invalid': submitted && !localBooking.status }" />
                    <small class="p-error" v-if="submitted && !localBooking.status">Trạng thái là bắt buộc.</small>
                </div>

                <h3 class="text-lg font-medium mb-3 mt-4">Phương thức thanh toán</h3>

                <div class="field mb-3">
                    <label for="paymentMethod" class="block font-medium text-sm mb-1">Phương thức</label>
                    <Dropdown id="paymentMethod" v-model="localBooking.paymentMethod" :options="paymentMethods" optionLabel="label" optionValue="value" class="w-full" />
                </div>

                <div class="field mb-3">
                    <label for="paymentStatus" class="block font-medium text-sm mb-1">Trạng thái thanh toán</label>
                    <Dropdown id="paymentStatus" v-model="localBooking.paymentStatus" :options="paymentStatuses" optionLabel="label" optionValue="value" class="w-full" />
                </div>

                <div class="field mb-3">
                    <label for="paymentDate" class="block font-medium text-sm mb-1">Ngày thanh toán</label>
                    <Calendar id="paymentDate" v-model="localBooking.paymentDate" dateFormat="dd/mm/yy" showIcon class="w-full" />
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

@media screen and (max-width: 768px) {
    .booking-dialog :deep(.p-dialog-content) {
        padding: 1rem;
    }
}
</style>
