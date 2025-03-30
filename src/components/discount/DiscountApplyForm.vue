<script setup>
import { ref, reactive } from 'vue';
import { useDiscountManagement } from '@/composables/useDiscountManagement';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Divider from 'primevue/divider';

const props = defineProps({
    totalAmount: {
        type: Number,
        required: true
    }
});

const emit = defineEmits(['apply-discount', 'reset-discount']);

const {
    validateDiscount,
    applyDiscount,
    formatDiscountValue
} = useDiscountManagement();

const discountCode = ref('');
const loading = ref(false);
const discountResult = ref(null);
const error = ref('');

// Kiểm tra và áp dụng mã giảm giá
const checkDiscount = async () => {
    if (!discountCode.value) {
        error.value = 'Vui lòng nhập mã giảm giá';
        return;
    }

    error.value = '';
    loading.value = true;

    try {
        // Kiểm tra mã giảm giá hợp lệ
        const isValid = await validateDiscount(discountCode.value);

        if (!isValid) {
            error.value = 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
            discountResult.value = null;
            emit('reset-discount');
            return;
        }

        // Áp dụng mã giảm giá
        const result = await applyDiscount(discountCode.value, props.totalAmount);

        if (result) {
            discountResult.value = result;
            emit('apply-discount', result);
        } else {
            error.value = 'Không thể áp dụng mã giảm giá';
            discountResult.value = null;
            emit('reset-discount');
        }
    } catch (e) {
        error.value = 'Đã xảy ra lỗi, vui lòng thử lại';
        console.error('Lỗi khi áp dụng mã giảm giá:', e);
        emit('reset-discount');
    } finally {
        loading.value = false;
    }
};

// Xóa mã giảm giá
const clearDiscount = () => {
    discountCode.value = '';
    discountResult.value = null;
    error.value = '';
    emit('reset-discount');
};
</script>

<template>
    <div class="discount-apply-container">
        <div class="mb-4">
            <h3 class="text-lg font-bold mb-2">Mã giảm giá</h3>
            <div class="flex gap-2">
                <div class="flex-grow">
                    <InputText v-model="discountCode" placeholder="Nhập mã giảm giá" class="w-full"
                        :disabled="loading || discountResult"
                        @keyup.enter="checkDiscount"
                    />
                    <small class="text-red-500" v-if="error">{{ error }}</small>
                </div>
                <Button v-if="!discountResult" :label="loading ? 'Đang kiểm tra...' : 'Áp dụng'"
                    :loading="loading"
                    :disabled="!discountCode || loading"
                    @click="checkDiscount" />
                <Button v-else icon="pi pi-times" severity="danger" @click="clearDiscount"
                    tooltip="Xóa mã giảm giá" tooltipOptions="{ position: 'top' }" />
            </div>
        </div>

        <div v-if="discountResult" class="discount-result p-3 border border-green-300 bg-green-50 rounded-lg">
            <div class="flex justify-between items-center mb-2">
                <div class="font-bold text-green-700">Mã giảm giá đã áp dụng:</div>
                <Tag severity="success">{{ discountResult.discountCode }}</Tag>
            </div>
            <Divider class="my-2" />
            <div class="grid grid-cols-2 gap-2">
                <div>Giá gốc:</div>
                <div class="text-right">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountResult.originalAmount) }}</div>

                <div>Giảm giá:</div>
                <div class="text-right text-green-600 font-bold">-{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountResult.discountAmount) }}</div>

                <div class="font-bold">Giá sau giảm:</div>
                <div class="text-right font-bold">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountResult.discountedAmount) }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.discount-apply-container {
    @apply rounded-lg bg-white p-4;
}

:deep(.p-inputtext),
:deep(.p-button) {
    @apply text-sm h-10;
}
</style>
