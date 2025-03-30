<script setup>
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
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
    }
});

const emit = defineEmits(['update:visible', 'save', 'hide', 'update:discount']);

const onHide = () => {
    emit('hide');
};

const onSave = () => {
    emit('save');
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
        header="Tạo hàng loạt mã giảm giá"
        :modal="true"
        class="p-fluid"
        @hide="onHide"
    >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field">
                <div class="p-4 rounded-lg">
                    <div class="mb-4">
                        <label for="prefix" class="font-bold mb-2 block">Tiền tố mã giảm giá</label>
                        <InputText
                            id="prefix"
                            :value="discount.prefix"
                            @input="e => updateDiscount('prefix', e.target.value.trim())"
                            required
                            class="w-full"
                            :class="{ 'p-invalid': submitted && !discount.prefix }"
                        />
                        <small class="p-error" v-if="submitted && !discount.prefix">Tiền tố mã giảm giá là bắt buộc.</small>
                        <small class="text-gray-500">Ví dụ: "SUMMER" sẽ tạo ra mã như "SUMMER-ABC123"</small>
                    </div>

                    <div class="mb-4">
                        <label for="count" class="font-bold mb-2 block">Số lượng mã cần tạo</label>
                        <InputNumber
                            id="count"
                            :value="discount.count"
                            @update:modelValue="value => updateDiscount('count', value)"
                            :min="1"
                            :max="100"
                            class="w-full"
                            :class="{ 'p-invalid': submitted && (!discount.count || discount.count < 1) }"
                        />
                        <small class="p-error" v-if="submitted && (!discount.count || discount.count < 1)">Số lượng mã phải lớn hơn 0.</small>
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
                        <label for="maxUses" class="font-bold mb-2 block">Số lần sử dụng tối đa mỗi mã</label>
                        <InputNumber
                            id="maxUses"
                            :value="discount.maxUses"
                            @update:modelValue="value => updateDiscount('maxUses', value)"
                            class="w-full"
                            placeholder="Số lượt sử dụng tối đa"
                            :min="1"
                        />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Hủy" icon="pi pi-times" text @click="onHide" />
            <Button label="Tạo mã" icon="pi pi-check" text @click="onSave" />
        </template>
    </Dialog>
</template>
