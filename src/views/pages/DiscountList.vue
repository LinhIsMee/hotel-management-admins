<script setup>
import { useDiscountManagement } from '@/composables/useDiscountManagement';
import { usePermissions } from '@/composables/usePermissions';
import { FilterMatchMode } from '@/utils/primeUtils';
import { onMounted, ref, computed } from 'vue';

// Import PrimeVue components
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';

// Import custom components
import DiscountEditDialog from '@/components/discount/DiscountEditDialog.vue';
import DiscountGenerateDialog from '@/components/discount/DiscountGenerateDialog.vue';
import DiscountFilters from '@/components/discount/DiscountFilters.vue';
import DiscountDeleteDialog from '@/components/discount/DiscountDeleteDialog.vue';

// Lấy phân quyền
const { can } = usePermissions();

// Lấy các hàm và biến từ composable
const {
    discounts,
    loading,
    discount,
    selectedDiscounts,
    submitted,
    discountTypes,

    fetchDiscounts,
    fetchActiveDiscounts,

    formatDiscountValue,
    calculateDaysRemaining,
    getDiscountStatus,
    getUsagePercentage,

    openNew: composableOpenNew,
    saveDiscount: composableSaveDiscount,
    saveGeneratedDiscounts: composableSaveGeneratedDiscounts,
    confirmDelete: composableConfirmDelete
} = useDiscountManagement();

// Khai báo biến cho dialogs
const discountDialog = ref(false);
const generateDiscountDialog = ref(false);
const deleteDiscountDialog = ref(false);
const deleteSelectedDialog = ref(false);
const selectedDiscount = ref(null);

// Khai báo biến cho filters
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    code: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    discountType: { value: null, matchMode: FilterMatchMode.EQUALS }
});
const showActiveOnly = ref(false);

// Gọi API khi component được mount
onMounted(() => {
    fetchDiscounts();
});

// Lọc mã giảm giá theo trạng thái
const toggleActiveFilter = () => {
    showActiveOnly.value = !showActiveOnly.value;
    if (showActiveOnly.value) {
        fetchActiveDiscounts();
    } else {
        fetchDiscounts();
    }
};

// Định dạng date cho hiển thị
const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('vi-VN');
};

// Hàm tìm kiếm
const handleSearch = (query) => {
    filters.value.global.value = query;
};

// Danh sách mã đã tồn tại để kiểm tra trùng
const existingCodes = computed(() => {
    return discounts.value.map((d) => d.code);
});

// Mở dialog thêm mới mã giảm giá
const openNew = () => {
    composableOpenNew();
    discountDialog.value = true;
};

// Mở dialog tạo hàng loạt mã giảm giá
const openGenerateDialog = () => {
    composableOpenNew();
    discount.value.prefix = 'PROMO';
    discount.value.count = 5;
    generateDiscountDialog.value = true;
};

// Xử lý lưu mã giảm giá
const saveDiscount = async () => {
    submitted.value = true;
    await composableSaveDiscount();
    discountDialog.value = false;
};

// Xử lý tạo hàng loạt mã giảm giá
const saveGeneratedDiscounts = async () => {
    submitted.value = true;
    await composableSaveGeneratedDiscounts();
    generateDiscountDialog.value = false;
};

// Chỉnh sửa mã giảm giá
const editDiscount = (data) => {
    discount.value = { ...data };
    // Chuyển đổi string thành Date object cho các trường ngày tháng
    if (typeof discount.value.validFrom === 'string') {
        discount.value.validFrom = new Date(discount.value.validFrom);
    }
    if (typeof discount.value.validTo === 'string') {
        discount.value.validTo = new Date(discount.value.validTo);
    }
    discountDialog.value = true;
};

// Xác nhận xóa mã giảm giá
const confirmDeleteDiscount = (data, isMultiple = false) => {
    if (isMultiple) {
        if (selectedDiscounts.value && selectedDiscounts.value.length > 0) {
            deleteSelectedDialog.value = true;
        }
    } else {
        selectedDiscount.value = data;
        deleteDiscountDialog.value = true;
    }
};

// Xóa mã giảm giá
const deleteDiscount = async () => {
    await composableConfirmDelete(selectedDiscount.value);
    deleteDiscountDialog.value = false;
    selectedDiscount.value = null;
};

// Xóa nhiều mã giảm giá đã chọn
const deleteSelectedDiscounts = async () => {
    if (selectedDiscounts.value && selectedDiscounts.value.length > 0) {
        for (const item of selectedDiscounts.value) {
            await composableConfirmDelete(item);
        }
        deleteSelectedDialog.value = false;
        selectedDiscounts.value = [];
    }
};

// Ẩn các dialog
const hideDialog = () => {
    discountDialog.value = false;
    generateDiscountDialog.value = false;
    submitted.value = false;
};

// Tính phần trăm sử dụng
const calculateUsagePercentage = (discount) => {
    return getUsagePercentage(discount);
};
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog></ConfirmDialog>

            <Toolbar class="mb-4">
            <template #start>
                    <div class="my-2">
                    <Button v-if="can.create" label="Thêm mã giảm giá" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                    <Button v-if="can.create" label="Tạo hàng loạt" icon="pi pi-cog" class="mr-2" @click="openGenerateDialog" />
                    <Button v-if="can.delete" label="Xóa đã chọn" icon="pi pi-trash" class="mr-2" severity="danger" @click="confirmDeleteDiscount(null, true)" :disabled="!selectedDiscounts || !selectedDiscounts.length" />
                    </div>
                </template>

            <template #end>
                <DiscountFilters :showActiveOnly="showActiveOnly" @toggle-active-filter="toggleActiveFilter" @search="handleSearch" />
                </template>
            </Toolbar>

            <DataTable
                :value="discounts"
                v-model:selection="selectedDiscounts"
            :selectionMode="can.delete ? 'multiple' : null"
                dataKey="id"
                :paginator="true"
                :rows="10"
            :rowsPerPageOptions="[5, 10, 25, 50]"
                :loading="loading"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} mã giảm giá"
            class="p-datatable-sm"
            :rowHover="true"
            :removableSort="true"
                responsiveLayout="scroll"
            >
            <template #empty>Không có mã giảm giá nào được tìm thấy</template>
            <template #loading>Đang tải dữ liệu mã giảm giá...</template>

            <Column v-if="can.delete" selectionMode="multiple" :exportable="false" style="min-width: 3rem"></Column>

                <Column field="id" header="ID" sortable style="min-width: 4rem"></Column>

            <Column field="code" header="Mã giảm giá" sortable style="min-width: 10rem">
                <template #body="{ data }">
                    <div class="font-bold">{{ data.code }}</div>
                </template>
            </Column>

            <Column field="discountType" header="Loại giảm giá" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                    <Tag :severity="data.discountType === 'PERCENT' ? 'info' : 'warning'">
                        {{ data.discountType === 'PERCENT' ? 'Phần trăm' : 'Số tiền cố định' }}
                    </Tag>
                    </template>
                </Column>

            <Column field="discountValue" header="Giá trị" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                    <span class="font-bold">{{ formatDiscountValue(data) }}</span>
                    </template>
                </Column>

            <Column field="validFrom" header="Ngày bắt đầu" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                    {{ formatDate(data.validFrom) }}
                    </template>
                </Column>

            <Column field="validTo" header="Ngày kết thúc" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                    <div>{{ formatDate(data.validTo) }}</div>
                    <div v-if="calculateDaysRemaining(data.validTo) > 0" class="text-xs text-blue-500">Còn {{ calculateDaysRemaining(data.validTo) }} ngày</div>
                    <div v-else class="text-xs text-red-500">Đã hết hạn</div>
                    </template>
                </Column>

            <Column header="Tình trạng sử dụng" style="min-width: 10rem">
                    <template #body="{ data }">
                    <div class="flex flex-column">
                        <div class="mb-1">{{ data.usedCount }}/{{ data.maxUses }}</div>
                        <ProgressBar :value="calculateUsagePercentage(data)" :showValue="false" style="height: 10px"></ProgressBar>
                    </div>
                    </template>
                </Column>

            <Column field="valid" header="Trạng thái" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                    <Tag :severity="getDiscountStatus(data).severity">
                        {{ getDiscountStatus(data).label }}
                    </Tag>
                    </template>
                </Column>

            <Column :exportable="false" style="min-width: 10rem">
                    <template #body="{ data }">
                    <Button v-if="can.edit" icon="pi pi-pencil" outlined class="mr-2" @click="editDiscount(data)" tooltip="Chỉnh sửa" tooltipOptions="{ position: 'top' }" />
                    <Button v-if="can.delete" icon="pi pi-trash" outlined severity="danger" @click="confirmDeleteDiscount(data)" tooltip="Xóa" tooltipOptions="{ position: 'top' }" />
                    </template>
                </Column>
            </DataTable>

        <!-- Dialog chỉnh sửa mã giảm giá -->
        <DiscountEditDialog
            v-model:visible="discountDialog"
            :discount="discount"
            :submitted="submitted"
            :discountTypes="discountTypes"
            :existingCodes="existingCodes"
            @save="saveDiscount"
            @hide="hideDialog"
            @update:discount="(val) => (discount = val)"
        />

        <!-- Dialog tạo hàng loạt mã giảm giá -->
        <DiscountGenerateDialog v-model:visible="generateDiscountDialog" :discount="discount" :submitted="submitted" :discountTypes="discountTypes" @save="saveGeneratedDiscounts" @hide="hideDialog" @update:discount="(val) => (discount = val)" />

        <!-- Dialog xác nhận xóa mã giảm giá -->
        <DiscountDeleteDialog v-model:visible="deleteDiscountDialog" :discount="selectedDiscount" :multiple="false" @confirm="deleteDiscount" />

        <!-- Dialog xác nhận xóa nhiều mã giảm giá -->
        <DiscountDeleteDialog v-model:visible="deleteSelectedDialog" :multiple="true" :count="selectedDiscounts ? selectedDiscounts.length : 0" @confirm="deleteSelectedDiscounts" />
    </div>
</template>

<style scoped>
.card {
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
    margin-bottom: 1rem;
}

:deep(.p-datatable-wrapper) {
    border-radius: 6px;
    overflow: hidden;
}

.search-wrapper {
    display: flex;
    align-items: center;
}

:deep(.p-inputtext) {
    font-size: 0.875rem;
    min-height: 38px;
}

:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-multiselect),
:deep(.p-inputnumber) {
    display: flex;
    width: 100%;
}

:deep(.p-button) {
    font-size: 0.875rem;
    min-height: 38px;
}

@media screen and (max-width: 768px) {
    .card {
        padding: 1rem;
    }

    :deep(.p-toolbar) {
        flex-direction: column;
        align-items: flex-start;
    }

    :deep(.p-toolbar-group-start),
    :deep(.p-toolbar-group-end) {
        width: 100%;
    }

    :deep(.p-toolbar-group-end) {
        margin-top: 0.5rem;
    }
}
</style>
