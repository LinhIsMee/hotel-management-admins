<script setup>
import { computed } from 'vue';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';

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
        required: true
    },
    existingCodes: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:visible', 'save', 'hide', 'update:discount']);

const isCodeExists = computed(() => {
    if (!props.discount.code) return false;
    if (!props.discount.id) {
        // Trường hợp tạo mới - kiểm tra mã đã tồn tại chưa
        return props.existingCodes.some(code =>
            code.toLowerCase() === props.discount.code.toLowerCase()
        );
    } else {
        // Trường hợp chỉnh sửa - kiểm tra mã đã tồn tại với ID khác
        const codes = props.existingCodes.filter(code =>
            code.toLowerCase() === props.discount.code.toLowerCase()
        );
        return codes.length > 1;
    }
});

const onSave = () => {
    emit('save');
};

const onHide = () => {
    emit('hide');
};

const updateDiscount = (field, value) => {
    emit('update:discount', { ...props.discount, [field]: value });
};
</script>

<template>
    <Dialog
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        :style="{ width: '800px' }"
        header="Thông tin mã giảm giá"
        :modal="true"
        class="p-fluid"
        @hide="onHide"
    >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field">
                <div class="p-4 rounded-lg">
                    <div class="mb-4">
                        <label for="code" class="font-bold mb-2 block">Mã giảm giá</label>
                        <InputText
                            id="code"
                            :value="discount.code"
                            @input="e => updateDiscount('code', e.target.value.trim())"
                            required
                            class="w-full"
                            :class="{ 'p-invalid': submitted && !discount.code }"
                        />
                        <small class="p-error" v-if="submitted && !discount.code">Mã giảm giá là bắt buộc.</small>
                        <small class="p-error" v-else-if="discount.code && isCodeExists">Mã giảm giá đã tồn tại.</small>
                    </div>

                    <div class="mb-4">
                        <label for="discountType" class="font-bold mb-2 block">Loại giảm giá</label>
                        <Dropdown
                            id="discountType"
                            :value="discount.discountType"
                            @change="e => updateDiscount('discountType', e.value)"
                            :options="discountTypes"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Chọn loại giảm giá"
                            class="w-full"
                        />
                    </div>

                    <div class="mb-4">
                        <label for="discountValue" class="font-bold mb-2 block">Giá trị giảm giá</label>
                        <div class="flex items-center">
                            <InputNumber
                                id="discountValue"
                                :value="discount.discountValue"
                                @update:modelValue="value => updateDiscount('discountValue', value)"
                                :minFractionDigits="0"
                                :maxFractionDigits="discount.discountType === 'PERCENT' ? 2 : 0"
                                :min="0"
                                :max="discount.discountType === 'PERCENT' ? 1 : undefined"
                                class="w-full"
                                :class="{ 'p-invalid': submitted && !discount.discountValue }"
                            />
                            <span class="ml-2">{{ discount.discountType === 'PERCENT' ? 'phần trăm (0.1 = 10%)' : 'VND' }}</span>
                        </div>
                        <small class="p-error" v-if="submitted && !discount.discountValue">Giá trị giảm giá là bắt buộc.</small>
                        <small class="p-error" v-else-if="discount.discountType === 'PERCENT' && discount.discountValue > 1">Giá trị phần trăm không thể vượt quá 1 (100%).</small>
                    </div>
                </div>
            </div>

            <div class="field">
                <div class="p-4 rounded-lg">
                    <div class="mb-4">
                        <label for="validFrom" class="font-bold mb-2 block">Ngày bắt đầu</label>
                        <Calendar
                            id="validFrom"
                            :value="discount.validFrom"
                            @update:modelValue="value => updateDiscount('validFrom', value)"
                            dateFormat="dd/mm/yy"
                            placeholder="Chọn ngày bắt đầu"
                            class="w-full"
                            :class="{ 'p-invalid': submitted && !discount.validFrom }"
                        />
                        <small class="p-error" v-if="submitted && !discount.validFrom">Ngày bắt đầu là bắt buộc.</small>
                    </div>

                    <div class="mb-4">
                        <label for="validTo" class="font-bold mb-2 block">Ngày kết thúc</label>
                        <Calendar
                            id="validTo"
                            :value="discount.validTo"
                            @update:modelValue="value => updateDiscount('validTo', value)"
                            dateFormat="dd/mm/yy"
                            placeholder="Chọn ngày kết thúc"
                            class="w-full"
                            :class="{ 'p-invalid': submitted && !discount.validTo }"
                        />
                        <small class="p-error" v-if="submitted && !discount.validTo">Ngày kết thúc là bắt buộc.</small>
                        <small class="p-error" v-else-if="discount.validFrom && discount.validTo && new Date(discount.validFrom) > new Date(discount.validTo)">
                            Ngày kết thúc phải sau ngày bắt đầu.
                        </small>
                    </div>

                    <div class="mb-4">
                        <label for="maxUses" class="font-bold mb-2 block">Số lần sử dụng tối đa</label>
                        <InputNumber
                            id="maxUses"
                            :value="discount.maxUses"
                            @update:modelValue="value => updateDiscount('maxUses', value)"
                            class="w-full"
                            placeholder="Số lượt sử dụng tối đa"
                            :min="1"
                        />
                    </div>

                    <div class="mb-4">
                        <label for="valid" class="font-bold mb-2 block">Trạng thái</label>
                        <div class="field-checkbox flex items-center">
                            <InputSwitch
                                id="valid"
                                :modelValue="discount.valid"
                                @update:modelValue="value => updateDiscount('valid', value)"
                            />
                            <label for="valid" class="ml-2">{{ discount.valid ? 'Kích hoạt' : 'Vô hiệu hóa' }}</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Hủy" icon="pi pi-times" text @click="onHide" />
            <Button label="Lưu" icon="pi pi-check" text @click="onSave" />
        </template>
    </Dialog>
</template>

<style scoped>
.field-checkbox {
    @apply flex items-center;
}
</style>
