<script setup>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';

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
        default: () => []
    }
});

const emit = defineEmits(['update:visible', 'update:discount', 'save', 'hide']);

const onSave = () => {
    emit('save');
};

const hideDialog = () => {
    emit('hide');
};

const updateVisible = (value) => {
    emit('update:visible', value);
};

const updateDiscount = (field, value) => {
    emit('update:discount', { ...props.discount, [field]: value });
};
</script>

<template>
    <Dialog
        :visible="visible"
        :style="{ width: '450px' }"
        header="Tạo hàng loạt mã giảm giá"
        :modal="true"
        class="p-fluid"
        :closable="true"
        @update:visible="updateVisible"
    >
        <div class="field">
            <label for="prefix" class="font-bold">Tiền tố</label>
            <InputText id="prefix" v-model="discount.prefix" placeholder="Nhập tiền tố (ví dụ: SUMMER)" @update:modelValue="updateDiscount('prefix', $event)" />
            <small>Tiền tố sẽ được sử dụng làm phần đầu của mã.</small>
        </div>

        <div class="field">
            <label for="count" class="font-bold">Số lượng mã</label>
            <InputNumber id="count" v-model="discount.count" :min="1" :max="100" :class="{ 'p-invalid': submitted && !discount.count }" @update:modelValue="updateDiscount('count', $event)" />
            <small v-if="submitted && !discount.count" class="p-error">Số lượng mã là bắt buộc.</small>
        </div>

        <div class="field">
            <label for="length" class="font-bold">Độ dài mã ngẫu nhiên</label>
            <InputNumber id="length" v-model="discount.length" :min="4" :max="12" @update:modelValue="updateDiscount('length', $event)" />
            <small>Số ký tự ngẫu nhiên sẽ được thêm vào sau tiền tố.</small>
        </div>

        <div class="field">
            <label for="discountType" class="font-bold">Loại giảm giá</label>
            <Dropdown id="discountType" v-model="discount.discountType" :options="discountTypes" optionLabel="label" optionValue="value" placeholder="Chọn loại giảm giá" :class="{ 'p-invalid': submitted && !discount.discountType }" @update:modelValue="updateDiscount('discountType', $event)" />
            <small v-if="submitted && !discount.discountType" class="p-error">Loại giảm giá là bắt buộc.</small>
        </div>

        <div class="field">
            <label for="discountValue" class="font-bold">Giá trị giảm giá</label>
            <InputNumber id="discountValue" v-model="discount.discountValue" :min="0" :max="discount.discountType === 'PERCENT' ? 100 : null" :suffix="discount.discountType === 'PERCENT' ? ' %' : ''" :class="{ 'p-invalid': submitted && !discount.discountValue }" @update:modelValue="updateDiscount('discountValue', $event)" />
            <small v-if="submitted && !discount.discountValue" class="p-error">Giá trị giảm giá là bắt buộc.</small>
        </div>

        <div class="field">
            <label for="validFrom" class="font-bold">Ngày bắt đầu</label>
            <Calendar id="validFrom" v-model="discount.validFrom" dateFormat="dd/mm/yy" placeholder="Chọn ngày bắt đầu" :class="{ 'p-invalid': submitted && !discount.validFrom }" @update:modelValue="updateDiscount('validFrom', $event)" />
            <small v-if="submitted && !discount.validFrom" class="p-error">Ngày bắt đầu là bắt buộc.</small>
        </div>

        <div class="field">
            <label for="validTo" class="font-bold">Ngày kết thúc</label>
            <Calendar id="validTo" v-model="discount.validTo" dateFormat="dd/mm/yy" placeholder="Chọn ngày kết thúc" :minDate="discount.validFrom" :class="{ 'p-invalid': submitted && !discount.validTo }" @update:modelValue="updateDiscount('validTo', $event)" />
            <small v-if="submitted && !discount.validTo" class="p-error">Ngày kết thúc là bắt buộc.</small>
        </div>

        <div class="field">
            <label for="maxUses" class="font-bold">Số lượt sử dụng tối đa (mỗi mã)</label>
            <InputNumber id="maxUses" v-model="discount.maxUses" :min="1" :class="{ 'p-invalid': submitted && !discount.maxUses }" @update:modelValue="updateDiscount('maxUses', $event)" />
            <small v-if="submitted && !discount.maxUses" class="p-error">Số lượt sử dụng tối đa là bắt buộc.</small>
        </div>

        <div class="field">
            <label for="minOrderValue" class="font-bold">Giá trị đơn hàng tối thiểu</label>
            <InputNumber id="minOrderValue" v-model="discount.minOrderValue" :min="0" @update:modelValue="updateDiscount('minOrderValue', $event)" />
        </div>

        <div class="field-checkbox">
            <Checkbox v-model="discount.isActive" :binary="true" inputId="isActive" @update:modelValue="updateDiscount('isActive', $event)" />
            <label for="isActive" class="ml-2">Kích hoạt các mã giảm giá</label>
        </div>

        <template #footer>
            <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Tạo mã" icon="pi pi-check" class="p-button-text" @click="onSave" />
        </template>
    </Dialog>
</template>
