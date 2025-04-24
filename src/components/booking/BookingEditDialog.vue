<script setup>
import { computed, ref, watch } from 'vue';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';

// Props và emits
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    bookingData: {
        type: Object,
        required: true
    },
    submitted: {
        type: Boolean,
        default: false
    },
    statuses: {
        type: Array,
        default: () => []
    },
    paymentStatuses: {
        type: Array,
        default: () => []
    },
    paymentMethods: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    isEditMode: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:visible', 'update:bookingData', 'hideDialog', 'save']);

// Biến local
const localBooking = ref({ ...props.bookingData });
const toast = useToast();
const loadingUser = ref(false);

// Theo dõi sự thay đổi của props.bookingData và cập nhật localBooking
watch(() => props.bookingData, (newVal) => {
    localBooking.value = { ...newVal };
}, { deep: true });

// Theo dõi sự thay đổi của props.visible
watch(() => props.visible, (newVal) => {
    if (newVal && props.bookingData) {
        localBooking.value = { ...props.bookingData };
    }
});

// Theo dõi sự thay đổi của userId để tải thông tin người dùng
watch(() => localBooking.value.userId, async (newUserId) => {
    if (newUserId) {
        await fetchUserById(newUserId);
    }
});

// Hàm lấy thông tin người dùng theo ID
const fetchUserById = async (userId) => {
    if (!userId) return;

    loadingUser.value = true;
    try {
        const response = await fetch(`http://localhost:9000/api/v1/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Không thể tải thông tin người dùng');
        }

        const userData = await response.json();
        if (userData) {
            // Cập nhật thông tin người dùng vào localBooking
            localBooking.value.fullName = userData.fullName || localBooking.value.fullName;
            localBooking.value.email = userData.email || localBooking.value.email;
            localBooking.value.phone = userData.phone || localBooking.value.phone;
        }
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tải thông tin người dùng',
            life: 3000
        });
    } finally {
        loadingUser.value = false;
    }
};

// Tính toán các giá trị và kiểm tra trạng thái
const emptyBooking = computed(() => {
    return !localBooking.value.fullName?.trim();
});

// Hàm xử lý đóng dialog
const hideDialog = () => {
    emit('hideDialog');
};

// Hàm xử lý lưu booking
const saveBooking = () => {
    emit('update:bookingData', localBooking.value);
    emit('save');
};
</script>

<template>
    <Dialog :visible="visible" :style="{ width: '700px' }" header="Chi tiết đặt phòng" :modal="true"
        class="p-fluid booking-dialog" @update:visible="emit('update:visible', $event)" :closable="!loading"
        :closeOnEscape="!loading">
        <div v-if="loading || loadingUser" class="flex justify-content-center align-items-center py-4">
            <i class="pi pi-spin pi-spinner text-primary text-2xl"></i>
            <span class="ml-2 text-primary font-medium">Đang tải dữ liệu...</span>
        </div>
        <div v-else class="booking-form p-3">
            <!-- Thông tin người đặt -->
            <div class="section-header">
                <h5>Thông tin người đặt</h5>
            </div>

            <div class="form-grid">
                <div class="form-field">
                    <label for="userId">ID Người dùng</label>
                    <InputNumber id="userId" v-model="localBooking.userId" autofocus :disabled="isEditMode" />
                </div>

                <div class="form-field">
                    <label for="fullName">Họ tên</label>
                    <InputText id="fullName" v-model="localBooking.fullName"
                        :class="{ 'p-invalid': submitted && !localBooking.fullName }" />
                    <small v-if="submitted && !localBooking.fullName" class="p-error">Họ tên là bắt buộc.</small>
                </div>

                <div class="form-field">
                    <label for="phone">Số điện thoại</label>
                    <InputMask id="phone" v-model="localBooking.phone" mask="(999) 999-9999"
                        placeholder="(091) 077-7777" />
                </div>

                <div class="form-field">
                    <label for="email">Email</label>
                    <InputText id="email" v-model="localBooking.email" placeholder="customer7@example.com" />
                </div>
            </div>

            <!-- Thông tin đặt phòng -->
            <div class="section-header">
                <h5>Thông tin đặt phòng</h5>
            </div>

            <div class="form-grid">
                <div class="form-field">
                    <label for="checkInDate">Ngày nhận phòng</label>
                    <Calendar id="checkInDate" v-model="localBooking.checkInDate" dateFormat="dd/mm/yy" :showIcon="true"
                        :class="{ 'p-invalid': submitted && !localBooking.checkInDate }" />
                    <small v-if="submitted && !localBooking.checkInDate" class="p-error">Ngày nhận phòng là bắt
                        buộc.</small>
                </div>

                <div class="form-field">
                    <label for="checkOutDate">Ngày trả phòng</label>
                    <Calendar id="checkOutDate" v-model="localBooking.checkOutDate" dateFormat="dd/mm/yy"
                        :showIcon="true" :class="{ 'p-invalid': submitted && !localBooking.checkOutDate }" />
                    <small v-if="submitted && !localBooking.checkOutDate" class="p-error">Ngày trả phòng là bắt
                        buộc.</small>
                </div>

                <div class="form-field">
                    <label for="adults">Số người lớn</label>
                    <InputNumber id="adults" v-model="localBooking.adults" :min="1" :max="10" :showButtons="true"
                        inputStyle="width:100%" />
                </div>

                <div class="form-field">
                    <label for="children">Số trẻ em</label>
                    <InputNumber id="children" v-model="localBooking.children" :min="0" :max="10" :showButtons="true"
                        inputStyle="width:100%" />
                </div>

                <div class="form-field span-2">
                    <label for="totalPrice">Tổng tiền (VNĐ)</label>
                    <InputNumber id="totalPrice" v-model="localBooking.totalPrice" mode="currency" currency="VND"
                        locale="vi-VN" />
                </div>
            </div>

            <!-- Thông tin trạng thái -->
            <div class="section-header">
                <h5>Trạng thái</h5>
            </div>

            <div class="form-grid">
                <div class="form-field">
                    <label for="status">Trạng thái đặt phòng</label>
                    <Dropdown id="status" v-model="localBooking.status" :options="statuses" optionLabel="label"
                        optionValue="value" placeholder="Chọn trạng thái" />
                </div>

                <div class="form-field">
                    <label for="paymentStatus">Trạng thái thanh toán</label>
                    <Dropdown id="paymentStatus" v-model="localBooking.paymentStatus" :options="paymentStatuses"
                        optionLabel="label" optionValue="value" placeholder="Chọn trạng thái thanh toán" />
                </div>

                <div class="form-field">
                    <label for="paymentMethod">Phương thức thanh toán</label>
                    <Dropdown id="paymentMethod" v-model="localBooking.paymentMethod" :options="paymentMethods"
                        optionLabel="label" optionValue="value" placeholder="Chọn phương thức thanh toán" />
                </div>
            </div>

            <!-- Thông tin bổ sung -->
            <div class="section-header">
                <h5>Thông tin bổ sung</h5>
            </div>
            <div class="form-grid">
                <div class="form-field span-2">
                    <label for="specialRequests">Yêu cầu đặc biệt</label>
                    <Textarea id="specialRequests" v-model="localBooking.specialRequests" rows="3" autoResize />
                </div>
                <div class="form-field span-2">
                    <label for="adminNote">Ghi chú nội bộ</label>
                    <Textarea id="adminNote" v-model="localBooking.adminNote" rows="3" autoResize />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="Hủy" icon="pi pi-times" outlined severity="danger" @click="hideDialog"
                    :disabled="loading" />
                <Button label="Lưu" icon="pi pi-check" @click="saveBooking" :disabled="loading || emptyBooking" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.booking-dialog :deep(.p-dialog-content) {
    padding: 0;
    overflow-y: auto;
}

.booking-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.section-header {
    border-bottom: 1px solid var(--surface-border);
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
}

.section-header h5 {
    margin: 0;
    color: var(--primary-color);
    font-weight: 600;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem 1rem;
    margin-bottom: 1.5rem;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.form-field.span-2 {
    grid-column: span 2;
}

.form-field label {
    font-weight: 500;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputnumber) {
    width: 100%;
    height: 38px;
}

:deep(.p-inputnumber-buttons-horizontal .p-inputnumber-input) {
    width: 100%;
}

:deep(.p-button) {
    min-height: 40px;
}

@media screen and (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-field.span-2 {
        grid-column: auto;
    }
}
</style>
