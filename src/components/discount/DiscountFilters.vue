<script setup>
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import ToggleButton from 'primevue/togglebutton';
import { ref, watch } from 'vue';

const props = defineProps({
    showActiveOnly: {
        type: Boolean,
        default: false
    },
    globalFilter: {
        type: Object,
        default: () => ({ value: null })
    }
});

const emit = defineEmits(['update:showActiveOnly', 'search', 'update:globalFilter', 'toggle-active-filter']);

const localSearch = ref('');

// Theo dõi thay đổi của localSearch để emit sự kiện tìm kiếm
watch(localSearch, (newValue) => {
    emit('search', newValue);
});

const toggleActiveFilter = () => {
    // Emit cả 2 sự kiện: một cho v-model và một cho logic cũ
    emit('update:showActiveOnly', !props.showActiveOnly);
    emit('toggle-active-filter');
};

// Xóa tìm kiếm
const clearSearch = () => {
    localSearch.value = '';
    emit('search', '');
};
</script>

<template>
    <div class="flex align-items-center justify-content-between gap-2">
        <div class="flex align-items-center">
            <ToggleButton
                :modelValue="showActiveOnly"
                @update:modelValue="$emit('update:showActiveOnly', $event)"
                onIcon="pi pi-check"
                offIcon="pi pi-list"
                onLabel="Đang hoạt động"
                offLabel="Tất cả"
                class="mr-2"
            />
        </div>
        <span class="p-input-icon-left search-wrapper">
            <i class="pi pi-search" />
            <InputText v-model="localSearch" placeholder="Tìm kiếm mã giảm giá..." />
            <Button v-if="localSearch" icon="pi pi-times" class="p-button-rounded p-button-text p-button-sm" @click="clearSearch" />
        </span>
    </div>
</template>

<style scoped>
.search-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-width: 300px;
}

.search-wrapper .p-button {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
}

.search-wrapper i.pi-search {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color-secondary);
}

:deep(.p-inputtext) {
    padding-left: 2.5rem;
}

:deep(.p-togglebutton.p-button) {
    background: var(--surface-200);
    border: none;
    color: var(--text-color);
}

:deep(.p-togglebutton.p-button:not(.p-disabled):hover) {
    background: var(--surface-300);
}

:deep(.p-togglebutton.p-button.p-highlight) {
    background: var(--primary-color);
    color: var(--primary-color-text);
}

:deep(.p-togglebutton.p-button.p-highlight:hover) {
    background: var(--primary-600);
}
</style>
