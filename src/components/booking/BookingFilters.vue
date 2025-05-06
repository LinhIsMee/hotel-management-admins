<script setup>
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
    dateRange: {
        type: Object,
        default: () => ({ start: null, end: null })
    },
    selectedStatus: {
        type: Object,
        default: null
    },
    userId: {
        type: String,
        default: ''
    },
    statuses: {
        type: Array,
        required: true
    },
    showUserFilter: {
        type: Boolean,
        default: false
    },
    searchFilter: {
        type: Object,
        default: () => ({
            value: '',
            type: 'all' // 'all', 'phone', 'name', etc.
        })
    }
});

const emit = defineEmits([
    'update:dateRange',
    'update:selectedStatus',
    'update:userId',
    'update:searchFilter',
    'filter-by-date-range',
    'filter-by-status',
    'filter-by-user',
    'filter-by-search',
    'reset-filters',
    'add-new',
    'delete-selected',
    'export-data'
]);

// Tạo biến cục bộ để đồng bộ với props
const localDateRange = ref({ ...props.dateRange });
const localSelectedStatus = ref(props.selectedStatus);
const localUserId = ref(props.userId);
const localSearchFilter = ref({ ...props.searchFilter });

// Theo dõi thay đổi từ props để cập nhật biến cục bộ
watch(() => props.dateRange, (newVal) => {
    localDateRange.value = { ...newVal };
}, { deep: true });

watch(() => props.selectedStatus, (newVal) => {
    localSelectedStatus.value = newVal;
});

watch(() => props.userId, (newVal) => {
    localUserId.value = newVal;
});

watch(() => props.searchFilter, (newVal) => {
    localSearchFilter.value = { ...newVal };
}, { deep: true });

// Cập nhật biến cục bộ và emit event
const updateDateRange = (value, type) => {
    localDateRange.value[type] = value;
    emit('update:dateRange', { ...localDateRange.value });
    if (localDateRange.value.start && localDateRange.value.end) {
        emit('filter-by-date-range');
    }
};

const updateSelectedStatus = (value) => {
    localSelectedStatus.value = value;
    emit('update:selectedStatus', value);
    emit('filter-by-status');
};

const updateSearchFilter = (value) => {
    localSearchFilter.value.value = value;

    if (value.trim()) {
        if (/^\d+$/.test(value.trim())) {
            localSearchFilter.value.type = 'phone';
        } else {
            localSearchFilter.value.type = 'all';
        }
    } else {
        localSearchFilter.value.type = 'all';
    }

    emit('update:searchFilter', { ...localSearchFilter.value });
    emit('filter-by-search');
};

const handleReset = () => {
    localDateRange.value = { start: null, end: null };
    localSelectedStatus.value = null;
    localUserId.value = '';
    localSearchFilter.value = { value: '', type: 'all' };
    emit('reset-filters');
};

const handleAddNew = () => {
    emit('add-new');
};

const handleDeleteSelected = () => {
    emit('delete-selected');
};

const handleExportData = () => {
    emit('export-data');
};
</script>

<template>
    <div class="booking-filters p-2 mb-3 border-1 border-gray-200 rounded-md shadow-1 bg-white">
        <div class="filter-container flex flex-wrap">
            <!-- Khu vực bộ lọc -->
            <div class="filter-section flex gap-2 flex-grow-1">
                <!-- Từ ngày - Đến ngày -->
                <Calendar
                    v-model="localDateRange.start"
                    @update:modelValue="updateDateRange($event, 'start')"
                    placeholder="Từ ngày"
                    dateFormat="dd/mm/yy"
                    showIcon
                    class="date-input"
                />

                <Calendar
                    v-model="localDateRange.end"
                    @update:modelValue="updateDateRange($event, 'end')"
                    placeholder="Đến ngày"
                    dateFormat="dd/mm/yy"
                    showIcon
                    class="date-input"
                />

                <!-- Dropdown Trạng thái -->
                <Dropdown
                    v-model="localSelectedStatus"
                    @update:modelValue="updateSelectedStatus($event)"
                    :options="statuses"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Trạng thái"
                    class="status-dropdown"
                />

                <!-- Tìm kiếm thông minh -->
                <div class="search-container flex-grow-1">
                    <span class="w-full">
                        <InputText
                            v-model="localSearchFilter.value"
                            @input="updateSearchFilter($event.target.value)"
                            :placeholder="localSearchFilter.type === 'phone' ? 'Tìm theo SĐT...' : 'Tìm kiếm...'"
                            class="p-inputtext-sm w-full"
                        />
                    </span>
                </div>

                <!-- Nút làm mới -->
                <div class="filter-buttons">
                    <Button
                        type="button"
                        icon="pi pi-sync"
                        class="p-button-sm p-button-text"
                        @click="handleReset"
                        aria-label="Làm mới"
                    />
                </div>
            </div>

            <!-- Khu vực nút chức năng -->
            <div class="action-section flex align-items-center gap-2 ml-auto">
                <Button
                    icon="pi pi-plus"
                    label="Thêm mới"
                    class="p-button-sm action-button max-h-10"
                    severity="success"
                    @click="handleAddNew"
                />
                <Button
                    icon="pi pi-trash"
                    label="Xóa đã chọn"
                    class="p-button-sm action-button max-h-10"
                    severity="danger"
                    @click="handleDeleteSelected"
                />
                <Button
                    icon="pi pi-download"
                    label="Xuất dữ liệu"
                    class="p-button-sm action-button max-h-10"
                    severity="info"
                    @click="handleExportData"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.booking-filters {
    width: 100%;
}

.filter-container {
    gap: 1rem;
}

.filter-section {
    flex-wrap: wrap;
    row-gap: 0.5rem;
}

.date-input,
.status-dropdown {
    min-width: 150px;
}

.search-container {
    min-width: 200px;
}

.action-section {
    flex-wrap: wrap;
    row-gap: 0.5rem;
}

@media screen and (max-width: 768px) {
    .filter-section,
    .action-section {
        width: 100%;
    }

    .action-section {
        margin-left: 0;
        margin-top: 0.5rem;
        justify-content: flex-end;
    }
}

@media screen and (max-width: 576px) {
    .date-input,
    .status-dropdown,
    .search-container {
        width: 100% !important;
    }

    .filter-buttons {
        width: 100%;
        justify-content: flex-end;
    }

    .action-section {
        justify-content: flex-start;
    }
}
</style>
