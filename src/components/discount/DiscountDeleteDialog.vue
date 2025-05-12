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

const updateVisible = (value) => {
    emit('update:visible', value);
};

const confirm = () => {
    console.log('Người dùng đã xác nhận Vô hiệu hóa mã giảm giá:', props.multiple ? 'nhiều mã' : props.discount);
    emit('confirm');
};
</script>

<template>
    <Dialog
        :visible="visible"
        :style="{ width: '450px' }"
        :header="multiple ? 'Xác nhận xóa nhiều mã giảm giá' : 'Xác nhận Vô hiệu hóa mã giảm giá'"
        :modal="true"
        :closable="true"
        @update:visible="updateVisible"
    >
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--orange-500);" />
            <span v-if="multiple">Bạn có chắc chắn muốn xóa <b>{{ count }}</b> mã giảm giá đã chọn không?</span>
            <span v-else>Bạn có chắc chắn muốn Vô hiệu hóa mã giảm giá <b>{{ discount && discount.code }}</b> không?</span>
        </div>
        <template #footer>
            <Button label="Không" icon="pi pi-times" class="p-button-text" @click="updateVisible(false)" />
            <Button label="Có" icon="pi pi-check" class="p-button-text" @click="confirm" severity="danger" />
        </template>
    </Dialog>
</template>

<style scoped>
.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0.5rem 0;
}
</style>
