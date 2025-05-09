<script setup>
import { useDiscountManagement } from '@/composables/useDiscountManagement';
import { usePermissions } from '@/composables/usePermissions';
import { FilterMatchMode } from '@/utils/primeUtils';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';

// Import PrimeVue components
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import Dropdown from 'primevue/dropdown';

// Import custom components
import DiscountDeleteDialog from '@/components/discount/DiscountDeleteDialog.vue';
import DiscountEditDialog from '@/components/discount/DiscountEditDialog.vue';
import DiscountFilters from '@/components/discount/DiscountFilters.vue';
import DiscountGenerateDialog from '@/components/discount/DiscountGenerateDialog.vue';

// Lấy phân quyền
const { userRole, can, refreshRole } = usePermissions();
const toast = useToast();

// Tính toán quyền của người dùng
const permissions = computed(() => {
    return {
        canView: can.view.value,
        canCreate: can.create.value,
        canEdit: can.edit.value,
        canDelete: can.delete.value
    };
});

// Lấy các hàm và biến từ composable
const {
    discounts,
    loading,
    discount,
    selectedDiscounts,
    submitted,
    discountTypes,
    discountDialog,
    deleteDiscountDialog,
    generateDiscountDialog,

    fetchDiscounts,
    updateDiscountStatus,

    editDiscount: composableEditDiscount,
    openNew: composableOpenNew,
    openGenerateDialog: composableOpenGenerateDialog,
    hideDialog: composableHideDialog,
    saveDiscount: composableSaveDiscount,
    saveGeneratedDiscounts: composableSaveGeneratedDiscounts,
    confirmDelete: composableConfirmDelete,

    formatDiscountValue,
    calculateDaysRemaining,
    getDiscountStatus,
    getUsagePercentage
} = useDiscountManagement();

// Biến lọc và trạng thái
const filterType = ref('ACTIVE');
const selectedDiscount = ref(null);
const deleteSelectedDialog = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Theo dõi sự thay đổi của filterType để cập nhật bảng
watch(filterType, (newValue) => {
    console.log('WATCH - filterType thay đổi thành:', newValue);
    // Không cần làm gì vì computed sẽ tự cập nhật
}, { immediate: true });

// Danh sách đã lọc
const filteredDiscounts = computed(() => {
    if (!discounts.value || discounts.value.length === 0) return [];

    // Log dữ liệu ban đầu để debug
    console.log('Giá trị filterType hiện tại:', filterType.value);
    console.log('Mẫu mã giảm giá đầu tiên:', discounts.value.length > 0 ? discounts.value[0] : 'Không có dữ liệu');

    let result = [...discounts.value];
    console.log('Tổng số mã giảm giá ban đầu:', result.length);

    // Lọc theo trạng thái
    switch (filterType.value) {
        case 'ACTIVE':
            console.log('Đang lọc các mã ĐANG HOẠT ĐỘNG');
            result = result.filter(d => {
                const isActive = d.active === true;
                const isValid = calculateDaysRemaining(d.validTo) > 0;
                console.log(`Mã ${d.code}: active=${isActive}, còn hạn=${isValid}`);
                return isActive && isValid;
            });
            break;
        case 'INACTIVE':
            console.log('Đang lọc các mã ĐÃ VÔ HIỆU HÓA');
            result = result.filter(d => {
                const isInactive = d.active === false;
                console.log(`Mã ${d.code}: inactive=${isInactive}`);
                return isInactive;
            });
            break;
        case 'VALID':
            console.log('Đang lọc các mã CÒN HẠN');
            result = result.filter(d => {
                const isValid = calculateDaysRemaining(d.validTo) > 0;
                console.log(`Mã ${d.code}: còn hạn=${isValid}, ngày hết hạn=${d.validTo}`);
                return isValid;
            });
            break;
        case 'EXPIRED':
            console.log('Đang lọc các mã ĐÃ HẾT HẠN');
            result = result.filter(d => {
                const isExpired = calculateDaysRemaining(d.validTo) <= 0;
                console.log(`Mã ${d.code}: hết hạn=${isExpired}, ngày hết hạn=${d.validTo}`);
                return isExpired;
            });
            break;
        case 'ALL':
        default:
            console.log('Hiển thị TẤT CẢ các mã');
            break;
    }

    console.log('Số mã sau khi lọc:', result.length);

    // Lọc theo từ khóa tìm kiếm
    if (filters.value.global.value) {
        const searchText = filters.value.global.value.toLowerCase();
        result = result.filter(d =>
            d.code.toLowerCase().includes(searchText) ||
            d.discountType.toLowerCase().includes(searchText)
        );
    }

    return result;
});

// Xử lý tìm kiếm
const handleSearch = (query) => {
    filters.value.global.value = query;
};

// Xử lý khi thay đổi bộ lọc
const handleFilterChange = (newFilterType) => {
    console.log('[DiscountList] - Nhận sự kiện thay đổi bộ lọc thành:', newFilterType);
    // Set filterType để computed property được tính toán lại
    filterType.value = newFilterType;
};

// Tham chiếu đến DataTable
const dt = ref();

// Gọi API khi component được mount
onMounted(() => {
    refreshRole();
    fetchDiscounts();
});

// Định dạng date cho hiển thị
const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('vi-VN');
};

// Danh sách mã đã tồn tại để kiểm tra trùng
const existingCodes = computed(() => {
    return discounts.value.map((d) => d.code);
});

// Mở dialog thêm mới mã giảm giá
const openNew = () => {
    composableOpenNew();
};

// Mở dialog tạo hàng loạt mã giảm giá
const openGenerateDialog = () => {
    composableOpenGenerateDialog();
};

// Xử lý lưu mã giảm giá
const saveDiscount = async () => {
    const result = await composableSaveDiscount();
    return result;
};

// Xử lý tạo hàng loạt mã giảm giá
const saveGeneratedDiscounts = async () => {
    const result = await composableSaveGeneratedDiscounts();
    return result;
};

// Chỉnh sửa mã giảm giá
const editDiscount = async (data) => {
    composableEditDiscount(data);
};

// Xác nhận xóa mã giảm giá
const confirmDeleteDiscount = (data, isMultiple = false) => {
    if (isMultiple) {
        if (selectedDiscounts.value && selectedDiscounts.value.length > 0) {
            deleteSelectedDialog.value = true;
        }
    } else {
        console.log('Mở dialog xác nhận xóa mã giảm giá:', data);
        selectedDiscount.value = data;
        deleteDiscountDialog.value = true;
    }
};

// Xóa mã giảm giá
const deleteDiscount = async () => {
    console.log('Người dùng đã xác nhận xóa mã:', selectedDiscount.value);
    if (selectedDiscount.value) {
        await composableConfirmDelete(selectedDiscount.value);
    } else {
        console.error('Không có mã giảm giá được chọn để xóa');
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không có mã giảm giá được chọn để xóa',
            life: 3000
        });
    }
};

// Xóa nhiều mã giảm giá đã chọn
const deleteSelectedDiscounts = async () => {
    console.log('Xác nhận xóa nhiều mã giảm giá:', selectedDiscounts.value?.length);
    if (selectedDiscounts.value && selectedDiscounts.value.length > 0) {
        let successCount = 0;
        for (const item of selectedDiscounts.value) {
            const success = await composableConfirmDelete(item);
            if (success) successCount++;
        }

        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `Đã xóa ${successCount}/${selectedDiscounts.value.length} mã giảm giá`,
            life: 3000
        });

        deleteSelectedDialog.value = false;
        selectedDiscounts.value = [];
    }
};

// Định nghĩa hàm hideDialog
const hideDialog = () => {
    composableHideDialog();
};

// Tính phần trăm sử dụng
const calculateUsagePercentage = (discount) => {
    return getUsagePercentage(discount);
};

// Xử lý cập nhật trạng thái
const handleStatusChange = async (discount) => {
    await updateDiscountStatus(discount);
};
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog></ConfirmDialog>

        <!-- Thông báo phân quyền cho nhân viên -->
        <div v-if="userRole === 'ROLE_EMPLOYEE'" class="p-3 mb-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg">
            <div class="flex align-items-center">
                <i class="pi pi-info-circle mr-2"></i>
                <span>Bạn đang đăng nhập với vai trò <b>Nhân viên</b>. Một số chức năng sẽ bị giới hạn.</span>
            </div>
        </div>

        <Toolbar class="mb-4">
            <template #start>
                <DiscountFilters
                    v-model="filterType"
                    @search="handleSearch"
                />
            </template>

            <template #end>
                <div class="my-2">
                    <Button v-if="permissions.canCreate" label="Thêm mã giảm giá" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" v-tooltip.top="'Thêm mã giảm giá mới'" />
                    <Button v-if="permissions.canCreate" label="Tạo hàng loạt" icon="pi pi-cog" class="mr-2" @click="openGenerateDialog" v-tooltip.top="'Tạo nhiều mã giảm giá'" />
                    <Button v-if="permissions.canDelete" label="Xóa đã chọn" icon="pi pi-trash" class="mr-2" severity="danger" @click="confirmDeleteDiscount(null, true)" :disabled="!selectedDiscounts || !selectedDiscounts.length" v-tooltip.top="'Xóa các mã đã chọn'" />
                </div>
            </template>
        </Toolbar>

        <DataTable
            ref="dt"
            :value="filteredDiscounts"
            v-model:selection="selectedDiscounts"
            :selectionMode="permissions.canDelete ? 'multiple' : null"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 25, 50]"
            :loading="loading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} mã giảm giá"
            class="p-datatable-sm"
            :rowHover="true"
            :removableSort="true"
            responsiveLayout="scroll"
            :totalRecords="filteredDiscounts.length"
            @page="dt.value?.resetPage()"
        >
            <template #empty>Không có mã giảm giá nào được tìm thấy</template>
            <template #loading>Đang tải dữ liệu mã giảm giá...</template>

            <Column v-if="permissions.canDelete" selectionMode="multiple" :exportable="false" style="min-width: 3rem"></Column>

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

            <Column field="active" header="Trạng thái" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    <Tag :severity="getDiscountStatus(data).severity" class="cursor-pointer" @click="handleStatusChange(data)">
                        {{ getDiscountStatus(data).label }}
                    </Tag>
                </template>
            </Column>

            <Column :exportable="false" style="min-width: 10rem">
                <template #body="{ data }">
                    <Button v-if="permissions.canEdit" icon="pi pi-pencil" outlined class="mr-2" @click="editDiscount(data)" v-tooltip.top="'Chỉnh sửa mã giảm giá'" />
                    <Button v-if="permissions.canDelete" icon="pi pi-trash" outlined severity="danger" @click="confirmDeleteDiscount(data)" v-tooltip.top="'Xóa mã giảm giá'" />
                </template>
            </Column>
        </DataTable>

        <!-- Sử dụng các dialog từ composable -->
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

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.75rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 0.75rem;
    font-weight: 600;
}

:deep(.p-tag) {
    min-width: 120px;
    justify-content: center;
    cursor: pointer;
}

:deep(.p-tag:hover) {
    opacity: 0.9;
}
</style>
