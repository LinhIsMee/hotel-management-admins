<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import { computed, ref, watch } from 'vue';
import { useUserService } from '@/composables/useUserService';

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
const { getUserById } = useUserService();
const loadingUser = ref(false);

// Hàm load thông tin user
const loadUserData = async (userId) => {
    if (!userId) return;

    try {
        loadingUser.value = true;
        const userData = await getUserById(userId);
        if (userData) {
            localBooking.value = {
                ...localBooking.value,
                fullName: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                nationalId: userData.nationalId
            };
        }
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
    } finally {
        loadingUser.value = false;
    }
};

// Watch userId để load data
watch(() => localBooking.value.userId, async (newUserId, oldUserId) => {
    if (newUserId && newUserId !== oldUserId) {
        await loadUserData(newUserId);
    }
});

// Khai báo các phương thức thanh toán mặc định
const defaultPaymentMethods = ref([
    { label: 'Tiền mặt', value: 'CASH' },
    { label: 'VnPay', value: 'VNPAY' },
    { label: 'Thẻ tín dụng', value: 'CREDIT_CARD' },
    { label: 'Chuyển khoản', value: 'BANK_TRANSFER' }
]);

// Kiểm tra và sử dụng paymentMethods từ props nếu có, nếu không thì dùng giá trị mặc định
const actualPaymentMethods = computed(() => {
    return props.paymentMethods && props.paymentMethods.length > 0 ? props.paymentMethods : defaultPaymentMethods.value;
});

// Kiểm tra và chuẩn hóa phương thức thanh toán
const normalizePaymentMethod = (method) => {
    if (!method) return null;

    try {
        // Xử lý các kiểu dữ liệu khác nhau
        if (typeof method === 'object' && method !== null) {
            return method.value || null;
        }

        // Nếu là chuỗi, chuẩn hóa thành chữ hoa
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
    } catch (error) {
        console.error('Lỗi khi chuẩn hóa phương thức thanh toán:', error);
        return method; // Trả về giá trị gốc nếu có lỗi
    }
};

// Hàm lấy ID người dùng hiện tại từ localStorage
const getCurrentUserId = () => {
    try {
        const userData = localStorage.getItem('admin_user');
        if (userData) {
            const user = JSON.parse(userData);
            return user.id || 0;
        }
        return 0;
    } catch (error) {
        console.error('Lỗi khi lấy ID người dùng:', error);
        return 0;
    }
};

// Cập nhật dữ liệu cục bộ khi props thay đổi
watch(
    () => props.bookingData,
    (newVal) => {
        if (newVal) {
            try {
                // Tạo bản sao sâu của đối tượng để tránh thay đổi trực tiếp props
                const bookingCopy = JSON.parse(JSON.stringify(newVal));

                // Chuẩn hóa phương thức thanh toán trước khi sử dụng
                if (bookingCopy.paymentMethod) {
                    bookingCopy.paymentMethod = normalizePaymentMethod(bookingCopy.paymentMethod);
                }

                // Đảm bảo có các trường bắt buộc theo mẫu
                if (!bookingCopy.userId) bookingCopy.userId = getCurrentUserId();
                if (!bookingCopy.adults) bookingCopy.adults = 1;
                if (!bookingCopy.children) bookingCopy.children = 0;
                if (!bookingCopy.status) bookingCopy.status = 'PENDING';
                if (!bookingCopy.paymentStatus) bookingCopy.paymentStatus = 'UNPAID';
                if (!bookingCopy.paymentMethod) bookingCopy.paymentMethod = 'CASH';

                // Chuyển đổi định dạng roomIds nếu cần
                if (bookingCopy.rooms && Array.isArray(bookingCopy.rooms) && !bookingCopy.roomIds) {
                    bookingCopy.roomIds = bookingCopy.rooms.map((room) => room.roomId || room.id);
                }

                localBooking.value = bookingCopy;
            } catch (error) {
                console.error('Lỗi khi xử lý dữ liệu đặt phòng:', error);
                localBooking.value = { ...newVal } || {};
            }
        }
    },
    { immediate: true, deep: true }
);

// Trước khi lưu, đảm bảo dữ liệu đúng định dạng
const save = () => {
    try {
        // Xác nhận rằng tất cả các trường bắt buộc đều có giá trị
        if (!localBooking.value.fullName?.trim()) {
            console.warn('Thiếu tên khách hàng');
            return;
        }

        // Định dạng lại các trường cho phù hợp với API
        const updatedBooking = {
            ...localBooking.value,
            // Đảm bảo các định dạng ngày tháng đúng
            checkInDate: localBooking.value.checkInDate instanceof Date ? localBooking.value.checkInDate.toISOString().split('T')[0] : localBooking.value.checkInDate,
            checkOutDate: localBooking.value.checkOutDate instanceof Date ? localBooking.value.checkOutDate.toISOString().split('T')[0] : localBooking.value.checkOutDate,
            paymentDate: localBooking.value.paymentDate instanceof Date ? localBooking.value.paymentDate.toISOString().split('T')[0] : localBooking.value.paymentDate
        };

        // Cập nhật lại đối tượng gốc
        emit('update:bookingData', updatedBooking);
        emit('save');
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu:', error);
    }
};

const hideDialog = () => {
    emit('hideDialog');
};

const updateVisible = (val) => {
    emit('update:visible', val);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="updateVisible" :style="{ width: '750px' }" header="Đặt phòng" :modal="true" class="booking-dialog">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-4">
            <!-- Thông tin người dùng -->
            <div class="col-span-2">
                <h3 class="text-lg font-semibold mb-3">Thông tin người dùng</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="col-span-1">
                        <div class="field">
                            <label for="userId">ID Người dùng</label>
                            <div class="flex items-stretch gap-2">
                                <InputNumber id="userId" v-model="localBooking.userId" :min="0" class="w-full" />
                                <Button
                                    type="button"
                                    icon="pi pi-search"
                                    @click="loadUserData(localBooking.userId)"
                                    :loading="loadingUser"
                                    class="p-button-primary h-full"
                                    v-tooltip.top="'Tìm kiếm người dùng'"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="fullName">Họ tên khách hàng <span class="text-red-500">*</span></label>
                            <InputText id="fullName" v-model="localBooking.fullName" required :class="{ 'p-invalid': submitted && !localBooking.fullName }" class="w-full" :disabled="!!localBooking.userId" />
                            <small class="p-error" v-if="submitted && !localBooking.fullName">Họ tên là bắt buộc.</small>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="phone">Số điện thoại <span class="text-red-500">*</span></label>
                            <InputText id="phone" v-model="localBooking.phone" required :class="{ 'p-invalid': submitted && !localBooking.phone }" class="w-full" :disabled="!!localBooking.userId" />
                            <small class="p-error" v-if="submitted && !localBooking.phone">Số điện thoại là bắt buộc.</small>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="email">Email</label>
                            <InputText id="email" v-model="localBooking.email" type="email" class="w-full" :disabled="!!localBooking.userId" />
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="nationalId">CMND/CCCD</label>
                            <InputText id="nationalId" v-model="localBooking.nationalId" class="w-full" :disabled="!!localBooking.userId" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Thông tin đặt phòng -->
            <div class="col-span-2">
                <h3 class="text-lg font-semibold mb-3">Thông tin đặt phòng</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="col-span-1">
                        <div class="field">
                            <label for="checkInDate">Ngày nhận phòng <span class="text-red-500">*</span></label>
                            <DatePicker id="checkInDate" v-model="localBooking.checkInDate" :showIcon="true" dateFormat="dd/mm/yy" :class="{ 'p-invalid': submitted && !localBooking.checkInDate }" class="w-full" />
                            <small class="p-error" v-if="submitted && !localBooking.checkInDate">Ngày nhận phòng là bắt buộc.</small>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="checkOutDate">Ngày trả phòng <span class="text-red-500">*</span></label>
                            <DatePicker id="checkOutDate" v-model="localBooking.checkOutDate" :showIcon="true" dateFormat="dd/mm/yy" :class="{ 'p-invalid': submitted && !localBooking.checkOutDate }" class="w-full" />
                            <small class="p-error" v-if="submitted && !localBooking.checkOutDate">Ngày trả phòng là bắt buộc.</small>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="adults">Số người lớn</label>
                            <InputNumber id="adults" v-model="localBooking.adults" :min="1" :showButtons="true" class="w-full" />
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="children">Số trẻ em</label>
                            <InputNumber id="children" v-model="localBooking.children" :min="0" :showButtons="true" class="w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Thông tin thanh toán -->
            <div class="col-span-2">
                <h3 class="text-lg font-semibold mb-3">Thông tin thanh toán</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="col-span-1">
                        <div class="field">
                            <label for="totalPrice">Tổng tiền <span class="text-red-500">*</span></label>
                            <InputNumber id="totalPrice" v-model="localBooking.totalPrice" mode="currency" currency="VND" locale="vi-VN" :min="0" :class="{ 'p-invalid': submitted && !localBooking.totalPrice }" class="w-full" />
                            <small class="p-error" v-if="submitted && !localBooking.totalPrice">Tổng tiền là bắt buộc.</small>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="finalPrice">Giá thanh toán cuối cùng</label>
                            <InputNumber id="finalPrice" v-model="localBooking.finalPrice" mode="currency" currency="VND" locale="vi-VN" :min="0" class="w-full" />
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="paymentMethod">Phương thức thanh toán</label>
                            <Select id="paymentMethod" v-model="localBooking.paymentMethod" :options="actualPaymentMethods" optionLabel="label" optionValue="value" placeholder="Chọn phương thức thanh toán" class="w-full" />
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="paymentStatus">Trạng thái thanh toán</label>
                            <Select id="paymentStatus" v-model="localBooking.paymentStatus" :options="paymentStatuses" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái thanh toán" class="w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Trạng thái đặt phòng -->
            <div class="col-span-2">
                <div class="field">
                    <label for="status">Trạng thái đặt phòng</label>
                    <Select id="status" v-model="localBooking.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái" class="w-full" />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="hideDialog" v-tooltip.bottom="'Hủy thay đổi'" />
                <Button label="Lưu" icon="pi pi-check" class="p-button-text" @click="save" v-tooltip.bottom="'Lưu thay đổi'" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.booking-dialog :deep(.p-dialog-content) {
    padding: 0;
    overflow-y: auto;
    max-height: 80vh;
}

.booking-dialog :deep(.p-dialog-header) {
    border-bottom: 1px solid var(--surface-border);
    padding: 1.25rem 1.5rem;
    background-color: var(--primary-color);
    color: var(--primary-color-text);
}

.booking-dialog :deep(.p-dialog-title) {
    font-size: 1.25rem;
    font-weight: 600;
}

.booking-dialog :deep(.p-dialog-footer) {
    border-top: 1px solid var(--surface-border);
    padding: 1.25rem 1.5rem;
    background-color: var(--surface-ground);
}

.booking-dialog :deep(.p-inputtext),
.booking-dialog :deep(.p-dropdown),
.booking-dialog :deep(.p-calendar),
.booking-dialog :deep(.p-inputnumber) {
    height: 2.5rem;
}

.booking-dialog :deep(.p-inputgroup-addon),
.booking-dialog :deep(.p-inputgroup .p-button) {
    height: 2.5rem;
    min-width: 2.5rem;
}

.booking-dialog :deep(.p-button.p-button-icon-only) {
    width: 2.5rem;
}

.booking-dialog :deep(.p-inputgroup) {
    align-items: stretch;
}

.booking-dialog :deep(.p-inputgroup .p-button) {
    height: 100%;
}

.booking-dialog :deep(.flex.items-stretch .p-button) {
    height: 100%;
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
