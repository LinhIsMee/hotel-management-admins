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
    <Dialog :visible="visible" @update:visible="updateVisible" :style="{ width: '900px', maxWidth: '98vw' }" header="Thông tin đơn đặt phòng" :modal="true" class="booking-dialog p-fluid">
        <div class="grid formgrid">
            <!-- Cột 1: Thông tin khách hàng -->
            <div class="col-12 md:col-4 lg:col-4 field-group">
                <h3 class="text-lg font-medium mb-2">Thông tin khách hàng</h3>

                <div class="field mb-2">
                    <label for="fullName" class="block text-sm mb-1">Họ và tên</label>
                    <InputText id="fullName" v-model.trim="localBooking.fullName" required :class="{ 'p-invalid': submitted && !localBooking.fullName }" />
                    <small class="p-error" v-if="submitted && !localBooking.fullName">Họ và tên là bắt buộc.</small>
                </div>

                <div class="field mb-2">
                    <label for="email" class="block text-sm mb-1">Email</label>
                    <InputText id="email" v-model.trim="localBooking.email" type="email" />
                </div>

                <div class="field mb-2">
                    <label for="phone" class="block text-sm mb-1">Số điện thoại</label>
                    <InputText id="phone" v-model.trim="localBooking.phone" />
                </div>

                <div class="field mb-2">
                    <label for="nationalId" class="block text-sm mb-1">CMND/CCCD</label>
                    <InputText id="nationalId" v-model.trim="localBooking.nationalId" />
                </div>
            </div>

            <!-- Cột 2: Thông tin đặt phòng -->
            <div class="col-12 md:col-4 lg:col-4 field-group">
                <h3 class="text-lg font-medium mb-2">Thông tin đặt phòng</h3>

                <div class="field mb-2">
                    <label for="checkInDate" class="block text-sm mb-1">Ngày nhận phòng</label>
                    <Calendar id="checkInDate" v-model="localBooking.checkInDate" dateFormat="dd/mm/yy" showIcon required :class="{ 'p-invalid': submitted && !localBooking.checkInDate }" />
                    <small class="p-error" v-if="submitted && !localBooking.checkInDate">Ngày nhận phòng là bắt buộc.</small>
                </div>

                <div class="field mb-2">
                    <label for="checkOutDate" class="block text-sm mb-1">Ngày trả phòng</label>
                    <Calendar id="checkOutDate" v-model="localBooking.checkOutDate" dateFormat="dd/mm/yy" showIcon required :class="{ 'p-invalid': submitted && !localBooking.checkOutDate }" />
                    <small class="p-error" v-if="submitted && !localBooking.checkOutDate">Ngày trả phòng là bắt buộc.</small>
                </div>

                <div class="field mb-2">
                    <label for="status" class="block text-sm mb-1">Trạng thái</label>
                    <Dropdown id="status" v-model="localBooking.status" :options="statuses" optionLabel="label" optionValue="value" required :class="{ 'p-invalid': submitted && !localBooking.status }" />
                    <small class="p-error" v-if="submitted && !localBooking.status">Trạng thái là bắt buộc.</small>
                </div>

                <div class="field mb-2">
                    <label for="room" class="block text-sm mb-1">Phòng đặt</label>
                    <InputText id="room" v-model.trim="localBooking.roomNumber" placeholder="Phòng được chỉ định" disabled />
                </div>
            </div>

            <!-- Cột 3: Thông tin thanh toán -->
            <div class="col-12 md:col-4 lg:col-4 field-group">
                <h3 class="text-lg font-medium mb-2">Thông tin thanh toán</h3>

                <div class="field mb-2">
                    <label for="totalPrice" class="block text-sm mb-1">Tổng tiền</label>
                    <InputNumber id="totalPrice" v-model="localBooking.totalPrice" mode="currency" currency="VND" locale="vi-VN" :minFractionDigits="0" />
                </div>

                <div class="field mb-2">
                    <label for="discountCode" class="block text-sm mb-1">Mã giảm giá</label>
                    <InputText id="discountCode" v-model.trim="localBooking.discountCode" />
                </div>

                <div class="field mb-2">
                    <label for="finalPrice" class="block text-sm mb-1">Số tiền sau giảm giá</label>
                    <InputNumber id="finalPrice" v-model="localBooking.finalPrice" mode="currency" currency="VND" locale="vi-VN" :minFractionDigits="0" />
                </div>

                <div class="field mb-2">
                    <label for="paymentMethod" class="block text-sm mb-1">Phương thức thanh toán</label>
                    <Dropdown id="paymentMethod" v-model="localBooking.paymentMethod" :options="paymentMethods" optionLabel="label" optionValue="value" />
                </div>

                <div class="field mb-2">
                    <label for="paymentStatus" class="block text-sm mb-1">Trạng thái thanh toán</label>
                    <Dropdown id="paymentStatus" v-model="localBooking.paymentStatus" :options="paymentStatuses" optionLabel="label" optionValue="value" />
                </div>

                <div class="field mb-2">
                    <label for="paymentDate" class="block text-sm mb-1">Ngày thanh toán</label>
                    <Calendar id="paymentDate" v-model="localBooking.paymentDate" dateFormat="dd/mm/yy" showIcon />
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
    padding: 1.25rem;
    max-height: 80vh;
    overflow-y: auto;
}

.booking-dialog :deep(.p-dialog-header) {
    border-bottom: 1px solid var(--surface-border);
    padding: 1rem 1.5rem;
}

.booking-dialog :deep(.p-dialog-footer) {
    border-top: 1px solid var(--surface-border);
    padding: 1rem 1.5rem;
}

.field-group {
    padding: 0 0.5rem;
}

.booking-dialog :deep(.p-inputtext),
.booking-dialog :deep(.p-dropdown),
.booking-dialog :deep(.p-calendar),
.booking-dialog :deep(.p-inputnumber) {
    height: 2.25rem;
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
    height: 1.125rem;
}

.booking-dialog :deep(.p-inputnumber-buttons-stacked .p-inputnumber-button-group) {
    width: 2.25rem;
}

@media screen and (max-width: 992px) {
    .booking-dialog :deep(.p-dialog-content) {
        padding: 1rem;
    }

    .field-group {
        padding: 0 0.25rem;
    }
}

@media screen and (max-width: 768px) {
    .booking-dialog :deep(.p-dialog-content) {
        padding: 0.75rem;
    }

    .field-group {
        margin-bottom: 1rem;
    }

    .field-group h3 {
        border-bottom: 1px solid var(--surface-border);
        padding-bottom: 0.5rem;
        margin-bottom: 0.75rem;
    }
}
</style>
