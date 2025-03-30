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

const emit = defineEmits(['toggle-active-filter', 'search', 'update:globalFilter', 'update:showActiveOnly']);

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
    <div class="flex align-items-center justify-content-end gap-2">
        <ToggleButton
            :modelValue="showActiveOnly"
            @update:modelValue="$emit('update:showActiveOnly', $event)"
            onLabel="Chỉ hiện đang hoạt động"
            offLabel="Hiện tất cả"
            @click="toggleActiveFilter"
            class="mr-2"
        />
        <span class="p-input-icon-left search-wrapper">
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
}

.search-wrapper .p-button {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
}
</style>
