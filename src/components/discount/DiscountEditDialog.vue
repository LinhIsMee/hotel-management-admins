<script setup>
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { computed, watch } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    discount: {
        type: Object,
        required: true
    },
    submitted: {
        type: Boolean,
        default: false
    },
    discountTypes: {
        type: Array,
        default: () => [
            { label: 'Phần trăm', value: 'PERCENT' },
            { label: 'Số tiền cố định', value: 'FIXED' }
        ]
    },
    existingCodes: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:visible', 'update:discount', 'save', 'hide']);

// Kiểm tra mã giảm giá đã tồn tại
const isExistingCode = computed(() => {
    const currentCode = props.discount.code?.toUpperCase();
    const currentId = props.discount.id;
    return currentId ? props.existingCodes.some((code) => code === currentCode && !props.discount.id) : props.existingCodes.some((code) => code === currentCode);
});

// Kiểm tra độ mạnh của mã
const codeStrength = computed(() => {
    const code = props.discount.code || '';
    if (code.length < 3) return { strength: 0, label: 'Quá ngắn', severity: 'danger' };
    if (code.length < 6) return { strength: 1, label: 'Yếu', severity: 'danger' };
    if (code.length < 8) return { strength: 2, label: 'Trung bình', severity: 'warning' };
    if (!/[A-Z0-9_-]{8,}/.test(code)) return { strength: 3, label: 'Khá tốt', severity: 'info' };
    return { strength: 4, label: 'Mạnh', severity: 'success' };
});

// Hiển thị đơn vị cho giá trị giảm giá
const discountValueSuffix = computed(() => {
    return props.discount.discountType === 'PERCENT' ? '%' : ' ₫';
});

// Màu nền cho card dựa trên status
const cardStyle = computed(() => ({
    'border-left': `6px solid ${props.discount.valid ? 'var(--green-500)' : 'var(--yellow-500)'}`,
    transition: 'all 0.3s ease'
}));

// Tính ngày hợp lệ tối thiểu cho ngày kết thúc
const minEndDate = computed(() => {
    if (!props.discount.validFrom) return new Date();
    const startDate = new Date(props.discount.validFrom);
    const result = new Date(startDate);
    result.setDate(startDate.getDate() + 1);
    return result;
});

// Kiểm tra hợp lệ các trường
const isValidCode = computed(() => {
    return !isExistingCode.value && props.discount.code && props.discount.code.length >= 3;
});

const isValidValue = computed(() => {
    if (props.discount.discountType === 'PERCENT') {
        return props.discount.discountValue > 0 && props.discount.discountValue <= 100;
    }
    return props.discount.discountValue > 0;
});

const isFormValid = computed(() => {
    return isValidCode.value && isValidValue.value && props.discount.validFrom && props.discount.validTo && props.discount.maxUses > 0;
});

// Xử lý sự kiện
const onSave = () => {
    if (isFormValid.value) {
        emit('save', { ...props.discount });
        emit('update:visible', false);
    }
};

const onCancel = () => {
    emit('hide');
    emit('update:visible', false);
};

const updateDiscount = (field, value) => {
    const updatedValue = field === 'code' && value ? value.toUpperCase() : value;
    emit('update:discount', { ...props.discount, [field]: updatedValue });
};

// Tự động đặt ngày kết thúc khi chọn ngày bắt đầu
watch(
    () => props.discount.validFrom,
    (newVal) => {
        if (newVal && !props.discount.validTo) {
            const endDate = new Date(newVal);
            endDate.setMonth(endDate.getMonth() + 1);
            updateDiscount('validTo', endDate);
        }
    }
);

// Đồng bộ visible với props
watch(
    () => props.visible,
    (newVal) => {
        if (!newVal) {
            emit('hide');
        }
    }
);
</script>

<template>
    <Dialog v-model:visible="props.visible" :style="{ width: '500px' }" header="Chi tiết mã giảm giá" :modal="true" class="p-fluid discount-dialog" :closable="true" @hide="onCancel">
        <Card :style="cardStyle">
            <template #content>
                <div class="grid p-fluid">
                    <div class="col-12">
                        <div class="field">
                            <label for="code" class="font-bold"> Mã giảm giá <span class="text-red-500">*</span> </label>
                            <div class="p-inputgroup">
                                <InputText
                                    id="code"
                                    v-model="discount.code"
                                    :class="{
                                        'p-invalid': (submitted && !discount.code) || isExistingCode,
                                        'text-uppercase': true
                                    }"
                                    placeholder="VD: SUMMER2025"
                                    @update:modelValue="updateDiscount('code', $event)"
                                    maxlength="20"
                                    :disabled="!!discount.id"
                                />
                                <span class="p-inputgroup-addon">
                                    <i :class="['pi', isValidCode ? 'pi-check text-green-500' : 'pi-times text-red-500', discount.code ? '' : 'hidden']"></i>
                                </span>
                            </div>
                            <small v-if="isExistingCode" class="p-error"> Mã giảm giá này đã tồn tại. </small>
                            <small v-else-if="submitted && !discount.code" class="p-error"> Mã giảm giá là bắt buộc. </small>
                            <div v-else class="flex align-items-center mt-1 gap-2">
                                <div v-if="discount.code" class="strength-bar-container">
                                    <div class="strength-bar" :class="`strength-${codeStrength.severity}`" :style="{ width: `${codeStrength.strength * 25}%` }"></div>
                                </div>
                                <small v-if="discount.code" :class="`text-${codeStrength.severity}`">
                                    {{ codeStrength.label }}
                                </small>
                            </div>
                            <small class="text-gray-500"> Mã nên bao gồm chữ hoa, số, gạch ngang (-) hoặc gạch dưới (_) </small>
                        </div>
                    </div>

                    <Divider align="center">
                        <span class="text-sm text-500 font-medium">Thông tin giảm giá</span>
                    </Divider>

                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="discountType" class="font-bold"> Loại giảm giá <span class="text-red-500">*</span> </label>
                            <Dropdown
                                id="discountType"
                                v-model="discount.discountType"
                                :options="discountTypes"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Chọn loại"
                                :class="{ 'p-invalid': submitted && !discount.discountType }"
                                @update:modelValue="updateDiscount('discountType', $event)"
                            />
                            <small v-if="submitted && !discount.discountType" class="p-error"> Loại giảm giá là bắt buộc. </small>
                        </div>
                    </div>

                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="discountValue" class="font-bold"> Giá trị giảm giá <span class="text-red-500">*</span> </label>
                            <InputNumber
                                id="discountValue"
                                v-model="discount.discountValue"
                                :min="0"
                                :max="discount.discountType === 'PERCENT' ? 100 : null"
                                :suffix="discountValueSuffix"
                                :class="{ 'p-invalid': submitted && !isValidValue }"
                                @update:modelValue="updateDiscount('discountValue', $event)"
                                :useGrouping="discount.discountType !== 'PERCENT'"
                                :allowEmpty="true"
                            />
                            <small v-if="submitted && !isValidValue" class="p-error"> Giá trị giảm giá không hợp lệ. </small>
                        </div>
                    </div>

                    <Divider align="center">
                        <span class="text-sm text-500 font-medium">Thời hạn sử dụng</span>
                    </Divider>

                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="validFrom" class="font-bold"> Ngày bắt đầu <span class="text-red-500">*</span> </label>
                            <Calendar
                                id="validFrom"
                                v-model="discount.validFrom"
                                dateFormat="dd/mm/yy"
                                :showIcon="true"
                                placeholder="dd/mm/yyyy"
                                :class="{ 'p-invalid': submitted && !discount.validFrom }"
                                @update:modelValue="updateDiscount('validFrom', $event)"
                                :minDate="new Date()"
                            />
                            <small v-if="submitted && !discount.validFrom" class="p-error"> Ngày bắt đầu là bắt buộc. </small>
                        </div>
                    </div>

                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="validTo" class="font-bold"> Ngày kết thúc <span class="text-red-500">*</span> </label>
                            <Calendar
                                id="validTo"
                                v-model="discount.validTo"
                                dateFormat="dd/mm/yy"
                                :showIcon="true"
                                placeholder="dd/mm/yyyy"
                                :minDate="minEndDate"
                                :class="{ 'p-invalid': submitted && !discount.validTo }"
                                @update:modelValue="updateDiscount('validTo', $event)"
                            />
                            <small v-if="submitted && !discount.validTo" class="p-error"> Ngày kết thúc là bắt buộc. </small>
                        </div>
                    </div>

                    <Divider align="center">
                        <span class="text-sm text-500 font-medium">Cài đặt sử dụng</span>
                    </Divider>

                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="maxUses" class="font-bold"> Số lượt sử dụng tối đa <span class="text-red-500">*</span> </label>
                            <InputNumber id="maxUses" v-model="discount.maxUses" :min="1" :step="1" :showButtons="true" :class="{ 'p-invalid': submitted && !discount.maxUses }" @update:modelValue="updateDiscount('maxUses', $event)" />
                            <small v-if="submitted && !discount.maxUses" class="p-error"> Số lượt sử dụng tối đa là bắt buộc. </small>
                        </div>
                    </div>

                    <!-- <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="minOrderValue" class="font-bold"> Giá trị đơn hàng tối thiểu </label>
                            <InputNumber id="minOrderValue" v-model="discount.minOrderValue" :min="0" :step="10000" mode="currency" currency="VND" locale="vi-VN" @update:modelValue="updateDiscount('minOrderValue', $event)" :allowEmpty="true" />
                        </div>
                    </div> -->

                    <div class="col-12">
                        <div class="field">
                            <div class="flex align-items-center">
                                <Checkbox v-model="discount.valid" :binary="true" @update:modelValue="updateDiscount('valid', $event)" />
                                <label for="valid" class="ml-2">Kích hoạt mã giảm giá</label>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Card>

        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="Hủy" icon="pi pi-times" class="p-button-outlined" @click="onCancel" />
                <Button label="Lưu" icon="pi pi-check" :disabled="submitted && !isFormValid" @click="onSave" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.discount-dialog :deep(.p-dialog-content) {
    padding: 1.5rem;
    border-radius: 0 0 6px 6px;
}

.discount-dialog :deep(.p-card) {
    box-shadow: none;
    border-radius: 4px;
}

.discount-dialog :deep(.p-card-content) {
    padding: 0;
}

.discount-dialog :deep(.p-dialog-footer) {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--surface-200);
}

.strength-bar-container {
    height: 4px;
    width: 100px;
    background-color: var(--surface-200);
    border-radius: 4px;
    overflow: hidden;
}

.strength-bar {
    height: 100%;
    transition: width 0.3s ease;
}

.strength-success {
    background-color: var(--green-500);
}
.strength-info {
    background-color: var(--blue-500);
}
.strength-warning {
    background-color: var(--orange-500);
}
.strength-danger {
    background-color: var(--red-500);
}

.text-uppercase {
    text-transform: uppercase;
}

:deep(.p-inputnumber-buttons-stacked .p-inputnumber-button-group) {
    display: flex;
    flex-direction: column;
}

:deep(.p-inputnumber-buttons-stacked .p-button.p-inputnumber-button) {
    width: 100%;
    padding: 0;
}

:deep(.p-calendar) {
    width: 100%;
}

:deep(.p-inputgroup .p-inputgroup-addon) {
    padding: 0 0.75rem;
    min-width: 2.5rem;
}

:deep(.p-checkbox) {
    margin-right: 0.5rem;
}

:deep(.p-divider.p-divider-horizontal) {
    margin: 1rem 0;
}

:deep(.p-divider .p-divider-content) {
    background-color: var(--surface-card);
    padding: 0 0.5rem;
}
</style>
