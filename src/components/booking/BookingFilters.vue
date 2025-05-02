<script setup>
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { computed, defineEmits, defineProps, ref, watch } from 'vue';

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
    globalFilter: {
        type: Object,
        default: null
    },
    phoneFilter: {
        type: String,
        default: ''
    }
});

const emit = defineEmits([
    'update:dateRange',
    'update:selectedStatus',
    'update:userId',
    'update:globalFilter',
    'update:phoneFilter',
    'filter-by-date-range',
    'filter-by-status',
    'filter-by-user',
    'filter-by-phone',
    'reset-filters',
    'add-new',
    'delete-selected',
    'export-data'
]);

// Tạo biến cục bộ để đồng bộ với props
const localDateRange = ref({ ...props.dateRange });
const localSelectedStatus = ref(props.selectedStatus);
const localUserId = ref(props.userId);
const localGlobalFilter = ref(props.globalFilter?.value || '');
const localPhoneFilter = ref(props.phoneFilter || '');

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

watch(() => props.globalFilter?.value, (newVal) => {
    localGlobalFilter.value = newVal;
});

watch(() => props.phoneFilter, (newVal) => {
    localPhoneFilter.value = newVal;
});

// Cập nhật biến cục bộ và emit event
const updateDateRange = (value, type) => {
    localDateRange.value[type] = value;
    emit('update:dateRange', { ...localDateRange.value });
};

const updateSelectedStatus = (value) => {
    localSelectedStatus.value = value;
    emit('update:selectedStatus', value);
};

const updateGlobalFilter = (value) => {
    localGlobalFilter.value = value;
    emit('update:globalFilter', { value, matchMode: props.globalFilter?.matchMode });
};

const updatePhoneFilter = (value) => {
    localPhoneFilter.value = value;
    emit('update:phoneFilter', value);
    emit('filter-by-phone');
};

const canFilter = computed(() => {
    return (localDateRange.value.start && localDateRange.value.end) ||
           localSelectedStatus.value ||
           (props.showUserFilter && localUserId.value) ||
           localPhoneFilter.value;
});

const handleReset = () => {
    localDateRange.value = { start: null, end: null };
    localSelectedStatus.value = null;
    localUserId.value = '';
    localGlobalFilter.value = '';
    localPhoneFilter.value = '';
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

const filterByPhone = () => {
    emit('filter-by-phone');
};
</script>

<template>
    <div class="booking-filters p-2 mb-3 border-1 border-gray-200 rounded-md shadow-1 bg-white">
        <div class="filter-container flex">
            <!-- Khu vực bộ lọc (bên trái) -->
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

                <!-- Dropdown Trạng thái - Thêm sự kiện để update ngay -->
                <Dropdown
                    v-model="localSelectedStatus"
                    @update:modelValue="updateSelectedStatus($event); $emit('filter-by-status')"
                    :options="statuses"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Trạng thái"
                    class="status-dropdown"
                />

                <!-- Tìm kiếm theo SĐT -->
                <div class="phone-filter flex">
                    <span class="p-input-icon-left">
                        <i class="pi pi-phone"></i>
                        <InputText
                            v-model="localPhoneFilter"
                            @input="updatePhoneFilter($event.target.value)"
                            placeholder="Số điện thoại KH"
                            class="p-inputtext-sm phone-input"
                        />
                    </span>
                </div>

                <!-- Nút lọc và làm mới -->
                <div class="filter-buttons flex gap-1">
                    <Button
                        type="button"
                        icon="pi pi-filter"
                        class="p-button-sm p-button-outlined"
                        @click="$emit('filter-by-date-range'), $emit('filter-by-status'), showUserFilter && $emit('filter-by-user'), filterByPhone()"
                        :disabled="!canFilter"
                        aria-label="Lọc"
                    />
                    <Button
                        type="button"
                        icon="pi pi-sync"
                        class="p-button-sm p-button-text"
                        @click="handleReset"
                        aria-label="Làm mới"
                    />
                </div>
            </div>

            <!-- Khu vực nút chức năng và tìm kiếm (bên phải) -->
            <div class="action-section flex align-items-center gap-2 ml-auto">
                <!-- Tìm kiếm -->
                <div class="search-container">
                    <span class="p-input-icon-left search-field">
                        <InputText
                            v-model="localGlobalFilter"
                            @input="updateGlobalFilter($event.target.value)"
                            placeholder="Tìm kiếm..."
                            class="p-inputtext-sm search-input"
                        />
                    </span>
                </div>

                <!-- Nút chức năng -->
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
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
}

.filter-section {
    flex-wrap: wrap;
    max-width: calc(100% - 640px); /* Dành không gian cho cụm nút bên phải */
}

.action-section {
    flex-wrap: nowrap;
    flex-shrink: 0; /* Không cho phép co lại */
    margin-left: auto; /* Đẩy sát về phía bên phải */
}

.date-input {
    width: 150px !important;
}

.status-dropdown {
    width: 150px;
}

.phone-input {
    width: 150px !important;
}

.search-container {
    position: relative;
    min-width: 200px;
    max-width: 250px;
}

.search-field {
    display: flex;
    align-items: center;
    width: 100%;
}

.search-input {
    width: 100%;
    height: 2.357rem;
    border-radius: 4px;
    padding-left: 2rem;
    font-size: 0.875rem;
    border: 1px solid var(--surface-border);
}

.p-input-icon-left > i {
    position: absolute;
    left: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color-secondary);
    z-index: 1;
}

.action-button {
    white-space: nowrap;
}

:deep(.p-inputtext) {
    height: 2.357rem;
    font-size: 0.875rem;
}

:deep(.p-dropdown) {
    height: 2.357rem;
}

/* Responsive */
@media screen and (max-width: 1400px) {
    .filter-container {
        flex-wrap: wrap;
    }

    .filter-section {
        max-width: 100%;
    }

    .action-section {
        margin-top: 0.5rem;
        margin-left: auto; /* Vẫn đẩy sang phải */
        width: auto;
    }
}

@media screen and (max-width: 992px) {
    .filter-section,
    .action-section {
        gap: 0.5rem;
    }

    .date-input,
    .status-dropdown,
    .phone-input {
        width: calc(33.33% - 0.75rem) !important;
    }

    .action-section {
        width: 100%;
        justify-content: flex-end;
    }

    .search-container {
        min-width: 170px;
    }
}

@media screen and (max-width: 768px) {
    .filter-container {
        flex-direction: column;
    }

    .filter-section {
        max-width: 100%;
        margin-bottom: 1rem;
    }

    .action-section {
        width: 100%;
        justify-content: flex-end;
    }

    .date-input,
    .status-dropdown,
    .phone-input {
        width: 100% !important;
        margin-bottom: 0.5rem;
    }

    .search-container {
        min-width: 100%;
    }
}

@media screen and (max-width: 576px) {
    .date-input,
    .status-dropdown,
    .phone-input {
        width: 100% !important;
        margin-bottom: 0.5rem;
    }

    .filter-buttons {
        width: 100%;
        justify-content: flex-end;
        margin-bottom: 0.5rem;
    }

    .action-section .p-button {
        padding: 0.5rem;
    }

    .action-section .p-button-label {
        display: none;
    }
}
</style>
