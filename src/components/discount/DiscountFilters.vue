<script setup>
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: 'ACTIVE'
    }
});

const emit = defineEmits(['update:modelValue', 'search']);

const localSearch = ref('');

// Các tùy chọn lọc
const filterOptions = [
    { label: 'Tất cả mã giảm giá', value: 'ALL' },
    { label: 'Đang hoạt động', value: 'ACTIVE' },
    { label: 'Đã vô hiệu hóa', value: 'INACTIVE' },
    { label: 'Còn hạn', value: 'VALID' },
    { label: 'Đã hết hạn', value: 'EXPIRED' }
];

// Theo dõi thay đổi của localSearch để emit sự kiện tìm kiếm
watch(localSearch, (newValue) => {
    emit('search', newValue);
});

// Xóa tìm kiếm
const clearSearch = () => {
    localSearch.value = '';
    emit('search', '');
};

// Xử lý sự kiện @change từ PrimeVue Dropdown
const handleFilterChange = (event) => {
    // event của PrimeVue Dropdown có dạng { originalEvent: ..., value: ... }
    // Với optionValue="value", thì event.value ở đây phải là chuỗi string (ví dụ: 'ALL', 'ACTIVE')
    console.log('DiscountFilters - Dropdown @change event.value:', event.value);
    emit('update:modelValue', event.value); // Phát ra giá trị string này cho DiscountList
};
</script>

<template>
    <div class="flex align-items-center justify-content-between gap-2 filter-container">
        <div class="flex align-items-center">
            <Dropdown
                :modelValue="props.modelValue"
                :options="filterOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Chọn trạng thái lọc"
                class="filter-dropdown"
                @change="handleFilterChange"
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
.filter-container {
    width: 100%;
}

.filter-dropdown {
    min-width: 200px;
}

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

@media screen and (max-width: 768px) {
    .filter-container {
        flex-direction: column;
        align-items: flex-start;
    }

    .filter-dropdown,
    .search-wrapper {
        width: 100%;
        margin-bottom: 0.5rem;
    }
}
</style>
