<script setup>
defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    booking: {
        type: Object,
        default: null
    },
    multiple: {
        type: Boolean,
        default: false
    },
    selectedCount: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(['update:visible', 'confirm']);

const close = () => {
    emit('update:visible', false);
};

const confirm = () => {
    emit('confirm');
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :style="{ width: '450px' }" :header="multiple ? 'Xác nhận hủy nhiều đơn đặt' : 'Xác nhận hủy đặt phòng'" :modal="true" class="booking-delete-dialog">
        <div class="flex align-items-center justify-content-center p-3">
            <i class="pi pi-exclamation-triangle mr-3 text-yellow-500" style="font-size: 2rem" />
            <span v-if="!multiple && booking">
                Bạn có chắc chắn muốn hủy đơn đặt phòng <b>{{ booking.id }}</b> của <b>{{ booking.fullName }}</b
                >?
            </span>
            <span v-else-if="multiple">
                Bạn có chắc chắn muốn hủy <b>{{ selectedCount }}</b> đơn đặt phòng đã chọn?
            </span>
        </div>
        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="Không" icon="pi pi-times" outlined @click="close" />
                <Button label="Có" icon="pi pi-check" severity="danger" @click="confirm" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.booking-delete-dialog :deep(.p-dialog-content) {
    padding-top: 1rem;
    padding-bottom: 1rem;
}
</style>
