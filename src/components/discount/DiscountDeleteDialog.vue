<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    discount: {
        type: Object,
        default: null
    },
    multiple: {
        type: Boolean,
        default: false
    },
    count: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(['update:visible', 'confirm']);

const onConfirm = () => {
    emit('confirm');
};
</script>

<template>
    <Dialog
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        :style="{ width: '450px' }"
        header="Xác nhận xóa"
        :modal="true"
    >
        <div class="flex items-center justify-center">
            <i class="pi pi-exclamation-triangle mr-3 text-yellow-500" style="font-size: 2rem" />
            <span v-if="!multiple && discount">
                Bạn có chắc chắn muốn xóa mã giảm giá <b>{{ discount.code }}</b>?
            </span>
            <span v-else-if="multiple">
                Bạn có chắc chắn muốn xóa <b>{{ count }}</b> mã giảm giá đã chọn?
            </span>
        </div>
        <template #footer>
            <Button label="Không" icon="pi pi-times" text @click="$emit('update:visible', false)" />
            <Button label="Có" icon="pi pi-check" text severity="danger" @click="onConfirm" />
        </template>
    </Dialog>
</template>
