<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import { onMounted, ref } from 'vue';

// Khai báo biến
const discounts = ref([]);
const loading = ref(true);
const discountDialog = ref(false);
const deleteDiscountDialog = ref(false);
const deleteDiscountsDialog = ref(false);
const discount = ref({});
const selectedDiscounts = ref(null);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const discountTypes = ref([
    { label: 'Theo phần trăm (%)', value: 'PERCENTAGE' },
    { label: 'Theo giá trị cố định', value: 'FIXED' }
]);

const fetchData = async () => {
    try {
        loading.value = true;
        console.log('Bắt đầu tải dữ liệu mã giảm giá');

        const response = await fetch('/demo/data/discounts.json');
        const data = await response.json();
        discounts.value = data.data;

        console.log('Đã tải xong dữ liệu:', discounts.value.length, 'mã giảm giá');
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu mã giảm giá:', error);
        discounts.value = [];
    } finally {
        // Đảm bảo loading luôn được đặt về false khi kết thúc
        loading.value = false;
        console.log('Đã tắt trạng thái loading');
    }
};
onMounted(() => {
    // Đặt loading về false trước khi bắt đầu
    loading.value = false;
    // Sau đó gọi fetchData để tải dữ liệu
    fetchData();
});

const openNew = () => {
    discount.value = {
        discount_type: 'PERCENTAGE',
        discount_value: 0,
        max_uses: null,
        used_count: 0,
        status: true,
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
    };
    submitted.value = false;
    discountDialog.value = true;
};

const hideDialog = () => {
    discountDialog.value = false;
    submitted.value = false;
};

const saveDiscount = () => {
    submitted.value = true;

    if (discount.value.code?.trim() && discount.value.discount_value > 0) {
        if (discount.value.valid_from instanceof Date) {
            discount.value.valid_from = discount.value.valid_from.toISOString().split('T')[0];
        }
        if (discount.value.valid_to instanceof Date) {
            discount.value.valid_to = discount.value.valid_to.toISOString().split('T')[0];
        }

        if (discount.value.id) {
            const index = findIndexById(discount.value.id);
            discounts.value[index] = { ...discount.value };
        } else {
            discount.value.id = createId();
            discounts.value.push(discount.value);
        }

        discountDialog.value = false;
        discount.value = {};
    }
};

const editDiscount = (editDiscount) => {
    discount.value = { ...editDiscount };
    if (discount.value.valid_from) {
        discount.value.valid_from = new Date(discount.value.valid_from);
    }
    if (discount.value.valid_to) {
        discount.value.valid_to = new Date(discount.value.valid_to);
    }
    discountDialog.value = true;
};

const confirmDeleteDiscount = (editDiscount) => {
    discount.value = editDiscount;
    deleteDiscountDialog.value = true;
};

const deleteDiscount = () => {
    discounts.value = discounts.value.filter((val) => val.id !== discount.value.id);
    deleteDiscountDialog.value = false;
    discount.value = {};
};

const confirmDeleteSelected = () => {
    deleteDiscountsDialog.value = true;
};

const deleteSelectedDiscounts = () => {
    discounts.value = discounts.value.filter((val) => !selectedDiscounts.value.includes(val));
    deleteDiscountsDialog.value = false;
    selectedDiscounts.value = null;
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < discounts.value.length; i++) {
        if (discounts.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const createId = () => {
    let id = 1;
    if (discounts.value && discounts.value.length > 0) {
        const maxId = Math.max(...discounts.value.map((discount) => discount.id));
        id = maxId + 1;
    }
    return id;
};
const formatDate = (value) => {
    if (value) {
        const date = new Date(value);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    }
    return '';
};

const formatCurrency = (value) => {
    if (value) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(value);
    }
    return '';
};

const formatDiscountValue = (value, type) => {
    if (type === 'PERCENTAGE') {
        return `${value}%`;
    } else {
        return formatCurrency(value);
    }
};

const isActive = (discount) => {
    const now = new Date();
    const validFrom = new Date(discount.valid_from);
    const validTo = new Date(discount.valid_to);
    const withinDateRange = now >= validFrom && now <= validTo;
    const underMaxUses = discount.max_uses === null || discount.used_count < discount.max_uses;
    return discount.status && withinDateRange && underMaxUses;
};

const getDiscountTypeName = (typeValue) => {
    const type = discountTypes.value.find((t) => t.value === typeValue);
    return type ? type.label : '';
};

const getStatusSeverity = (discount) => {
    const active = isActive(discount);
    return active ? 'success' : 'danger';
};

const getStatusLabel = (discount) => {
    const now = new Date();
    const validFrom = new Date(discount.valid_from);
    const validTo = new Date(discount.valid_to);

    if (!discount.status) {
        return 'Bị vô hiệu hóa';
    }

    if (now < validFrom) {
        return 'Chưa bắt đầu';
    }

    if (now > validTo) {
        return 'Đã hết hạn';
    }

    if (discount.max_uses !== null && discount.used_count >= discount.max_uses) {
        return 'Đã dùng hết';
    }

    return 'Đang hoạt động';
};

const getUsagePercentage = (discount) => {
    if (discount.max_uses === null) {
        return 'Không giới hạn';
    }
    const percentage = (discount.used_count / discount.max_uses) * 100;
    return `${discount.used_count}/${discount.max_uses} (${percentage.toFixed(0)}%)`;
};

const isCodeExists = (code, id) => {
    return discounts.value.some((d) => d.code === code && d.id !== id);
};
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog></ConfirmDialog>
        <div class="">
            <Toolbar class="mb-4">
                <template v-slot:start>
                    <div class="my-2">
                        <Button label="Thêm mới" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                        <Button label="Xóa" icon="pi pi-trash" class="mr-2" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedDiscounts || !selectedDiscounts.length" />
                    </div>
                </template>

                <template v-slot:end>
                    <span class="p-input-icon-left">
                        <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
                    </span>
                </template>
            </Toolbar>

            <DataTable
                :value="discounts"
                v-model:selection="selectedDiscounts"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :loading="loading"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} mã giảm giá"
                responsiveLayout="scroll"
                class="p-datatable-sm"
            >
                <template #empty>Không có mã giảm giá nào được tìm thấy.</template>
                <template #loading>Đang tải dữ liệu mã giảm giá. Vui lòng đợi.</template>

                <Column selectionMode="multiple" exportable="false" style="min-width: 3rem"></Column>

                <Column field="id" header="ID" sortable style="min-width: 4rem"></Column>

                <Column field="code" header="Mã giảm giá" sortable style="min-width: 12rem"></Column>

                <Column field="discount_type" header="Loại giảm giá" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ getDiscountTypeName(data.discount_type) }}
                    </template>
                </Column>

                <Column field="discount_value" header="Giá trị" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        {{ formatDiscountValue(data.discount_value, data.discount_type) }}
                    </template>
                </Column>

                <Column field="valid_from" header="Ngày bắt đầu" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        {{ formatDate(data.valid_from) }}
                    </template>
                </Column>

                <Column field="valid_to" header="Ngày kết thúc" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        {{ formatDate(data.valid_to) }}
                    </template>
                </Column>

                <Column field="used_count" header="Lượt sử dụng" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ getUsagePercentage(data) }}
                    </template>
                </Column>

                <Column field="status" header="Trạng thái" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        <Tag :value="getStatusLabel(data)" :severity="getStatusSeverity(data)" />
                    </template>
                </Column>

                <Column exportable="false" style="min-width: 8rem">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" outlined class="mr-2" @click="editDiscount(data)" />
                        <Button icon="pi pi-trash" outlined severity="danger" @click="confirmDeleteDiscount(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="discountDialog" :style="{ width: '800px' }" header="Thông tin mã giảm giá" :modal="true" class="p-fluid">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label for="code" class="font-bold mb-2 block">Mã giảm giá</label>
                            <InputText id="code" v-model.trim="discount.code" required class="w-full" :class="{ 'p-invalid': submitted && !discount.code }" />
                            <small class="p-error" v-if="submitted && !discount.code">Mã giảm giá là bắt buộc.</small>
                            <small class="p-error" v-else-if="discount.code && isCodeExists(discount.code, discount.id)">Mã giảm giá đã tồn tại.</small>
                        </div>

                        <div class="mb-4">
                            <label for="discount_type" class="font-bold mb-2 block">Loại giảm giá</label>
                            <Dropdown id="discount_type" v-model="discount.discount_type" :options="discountTypes" optionLabel="label" optionValue="value" placeholder="Chọn loại giảm giá" class="w-full" />
                        </div>

                        <div class="mb-4">
                            <label for="discount_value" class="font-bold mb-2 block">Giá trị giảm giá</label>
                            <div class="flex items-center">
                                <InputNumber id="discount_value" v-model="discount.discount_value" :minFractionDigits="0" :maxFractionDigits="0" class="w-full" :class="{ 'p-invalid': submitted && !discount.discount_value }" />
                                <span class="ml-2">{{ discount.discount_type === 'PERCENTAGE' ? '%' : 'VND' }}</span>
                            </div>
                            <small class="p-error" v-if="submitted && !discount.discount_value">Giá trị giảm giá là bắt buộc.</small>
                            <small class="p-error" v-else-if="discount.discount_type === 'PERCENTAGE' && discount.discount_value > 100">Giá trị phần trăm không thể vượt quá 100%.</small>
                        </div>
                    </div>
                </div>

                <div class="field">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label for="valid_from" class="font-bold mb-2 block">Ngày bắt đầu</label>
                            <Calendar id="valid_from" v-model="discount.valid_from" dateFormat="dd/mm/yy" placeholder="Chọn ngày bắt đầu" class="w-full" :class="{ 'p-invalid': submitted && !discount.valid_from }" />
                            <small class="p-error" v-if="submitted && !discount.valid_from">Ngày bắt đầu là bắt buộc.</small>
                        </div>

                        <div class="mb-4">
                            <label for="valid_to" class="font-bold mb-2 block">Ngày kết thúc</label>
                            <Calendar id="valid_to" v-model="discount.valid_to" dateFormat="dd/mm/yy" placeholder="Chọn ngày kết thúc" class="w-full" :class="{ 'p-invalid': submitted && !discount.valid_to }" />
                            <small class="p-error" v-if="submitted && !discount.valid_to">Ngày kết thúc là bắt buộc.</small>
                            <small class="p-error" v-else-if="discount.valid_from && discount.valid_to && discount.valid_from > discount.valid_to">Ngày kết thúc phải sau ngày bắt đầu.</small>
                        </div>

                        <div class="mb-4">
                            <label for="max_uses" class="font-bold mb-2 block">Số lần sử dụng tối đa</label>
                            <InputNumber id="max_uses" v-model="discount.max_uses" class="w-full" placeholder="Để trống nếu không giới hạn" />
                        </div>

                        <div class="mb-4">
                            <label for="status" class="font-bold mb-2 block">Trạng thái</label>
                            <div class="field-checkbox">
                                <InputSwitch id="status" v-model="discount.status" />
                                <label for="status" class="ml-2">{{ discount.status ? 'Kích hoạt' : 'Vô hiệu hóa' }}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Lưu" icon="pi pi-check" text @click="saveDiscount" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteDiscountDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="discount"
                    >Bạn có chắc chắn muốn xóa mã giảm giá <b>{{ discount.code }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteDiscountDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteDiscount" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteDiscountsDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="selectedDiscounts && selectedDiscounts.length > 0">Bạn có chắc chắn muốn xóa {{ selectedDiscounts.length }} mã giảm giá đã chọn?</span>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteDiscountsDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteSelectedDiscounts" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.card {
    @apply bg-white rounded-lg shadow-md p-4 mb-4;
}

:deep(.p-datatable-wrapper) {
    @apply rounded-lg;
}

:deep(.p-inputtext) {
    @apply text-sm min-h-10 w-full;
}

:deep(.p-dropdown),
:deep(.p-inputnumber),
:deep(.p-calendar),
:deep(.p-textarea) {
    @apply flex w-full;
}

:deep(.p-button) {
    @apply text-sm min-h-10;
}

.field-checkbox {
    @apply flex items-center;
}
</style>
