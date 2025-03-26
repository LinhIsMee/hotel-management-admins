<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import { onMounted, ref } from 'vue';

const services = ref([]);
const loading = ref(true);
const serviceDialog = ref(false);
const deleteServiceDialog = ref(false);
const deleteServicesDialog = ref(false);
const service = ref({});
const selectedServices = ref(null);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const serviceTypes = ref([
    { label: 'Đồ ăn & Đồ uống', value: 'FOOD' },
    { label: 'Giặt ủi', value: 'LAUNDRY' },
    { label: 'Spa', value: 'SPA' },
    { label: 'Vận chuyển', value: 'TRANSPORT' },
    { label: 'Giải trí', value: 'ENTERTAINMENT' }
]);

const units = ref([
    { label: 'Theo người', value: 'PER_PERSON' },
    { label: 'Theo kg', value: 'PER_KG' },
    { label: 'Theo lần sử dụng', value: 'PER_USE' },
    { label: 'Theo ngày', value: 'PER_DAY' }
]);

const fetchData = async () => {
    try {
        loading.value = true;
        const response = await fetch('/demo/data/services.json');
        const data = await response.json();
        services.value = data.data;
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});

const openNew = () => {
    service.value = {
        type: 'FOOD',
        price: 0,
        unit: 'PER_USE',
        isAvailable: true
    };
    submitted.value = false;
    serviceDialog.value = true;
};

const hideDialog = () => {
    serviceDialog.value = false;
    submitted.value = false;
};

const saveService = () => {
    submitted.value = true;

    if (service.value.name?.trim() && service.value.code?.trim() && service.value.price > 0) {
        if (service.value.id) {
            const index = findIndexById(service.value.id);
            services.value[index] = { ...service.value };
        } else {
            service.value.id = createId();
            service.value.createdAt = new Date().toISOString().split('T')[0];
            services.value.push(service.value);
        }

        serviceDialog.value = false;
        service.value = {};
    }
};

const editService = (editService) => {
    service.value = { ...editService };
    serviceDialog.value = true;
};
const confirmDeleteService = (editService) => {
    service.value = editService;
    deleteServiceDialog.value = true;
};
const deleteService = () => {
    services.value = services.value.filter((val) => val.id !== service.value.id);
    deleteServiceDialog.value = false;
    service.value = {};
};

const confirmDeleteSelected = () => {
    deleteServicesDialog.value = true;
};

const deleteSelectedServices = () => {
    services.value = services.value.filter((val) => !selectedServices.value.includes(val));
    deleteServicesDialog.value = false;
    selectedServices.value = null;
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < services.value.length; i++) {
        if (services.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const createId = () => {
    let id = 1;
    if (services.value && services.value.length > 0) {
        const maxId = Math.max(...services.value.map((service) => service.id));
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

const getServiceTypeName = (typeValue) => {
    const type = serviceTypes.value.find((t) => t.value === typeValue);
    return type ? type.label : '';
};

const getUnitName = (unitValue) => {
    const unit = units.value.find((u) => u.value === unitValue);
    return unit ? unit.label : '';
};

const getSeverity = (available) => {
    return available ? 'success' : 'danger';
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
                        <Button label="Xóa" icon="pi pi-trash" class="mr-2" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedServices || !selectedServices.length" />
                    </div>
                </template>

                <template v-slot:end>
                    <span class="p-input-icon-left">
                        <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
                    </span>
                </template>
            </Toolbar>

            <DataTable
                :value="services"
                v-model:selection="selectedServices"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :loading="loading"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} dịch vụ"
                responsiveLayout="scroll"
                class="p-datatable-sm"
            >
                <template #empty>Không có dịch vụ nào được tìm thấy.</template>
                <template #loading>Đang tải dữ liệu dịch vụ. Vui lòng đợi.</template>

                <Column selectionMode="multiple" exportable="false" style="min-width: 3rem"></Column>

                <Column field="id" header="ID" sortable style="min-width: 4rem"></Column>

                <Column field="name" header="Tên dịch vụ" sortable style="min-width: 14rem"></Column>

                <Column field="code" header="Mã dịch vụ" sortable style="min-width: 8rem"></Column>

                <Column field="type" header="Loại dịch vụ" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ getServiceTypeName(data.type) }}
                    </template>
                </Column>

                <Column field="price" header="Giá" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        {{ formatCurrency(data.price) }}
                    </template>
                </Column>

                <Column field="unit" header="Đơn vị tính" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        {{ getUnitName(data.unit) }}
                    </template>
                </Column>

                <Column field="isAvailable" header="Trạng thái" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        <Tag :value="data.isAvailable ? 'Đang cung cấp' : 'Ngưng cung cấp'" :severity="getSeverity(data.isAvailable)" />
                    </template>
                </Column>

                <Column field="createdAt" header="Ngày tạo" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ formatDate(data.createdAt) }}
                    </template>
                </Column>

                <Column exportable="false" style="min-width: 8rem">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" outlined class="mr-2" @click="editService(data)" />
                        <Button icon="pi pi-trash" outlined severity="danger" @click="confirmDeleteService(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="serviceDialog" :style="{ width: '800px' }" header="Thông tin dịch vụ" :modal="true" class="p-fluid">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label for="name" class="font-bold mb-2 block">Tên dịch vụ</label>
                            <InputText id="name" v-model.trim="service.name" required class="w-full" :class="{ 'p-invalid': submitted && !service.name }" />
                            <small class="p-error" v-if="submitted && !service.name">Tên dịch vụ là bắt buộc.</small>
                        </div>

                        <div class="mb-4">
                            <label for="code" class="font-bold mb-2 block">Mã dịch vụ</label>
                            <InputText id="code" v-model.trim="service.code" required class="w-full" :class="{ 'p-invalid': submitted && !service.code }" />
                            <small class="p-error" v-if="submitted && !service.code">Mã dịch vụ là bắt buộc.</small>
                        </div>

                        <div class="mb-4">
                            <label for="type" class="font-bold mb-2 block">Loại dịch vụ</label>
                            <Dropdown id="type" v-model="service.type" :options="serviceTypes" optionLabel="label" optionValue="value" placeholder="Chọn loại dịch vụ" class="w-full" :class="{ 'p-invalid': submitted && !service.type }" />
                            <small class="p-error" v-if="submitted && !service.type">Loại dịch vụ là bắt buộc.</small>
                        </div>
                    </div>
                </div>
                <div class="field">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label for="price" class="font-bold mb-2 block">Giá dịch vụ</label>
                            <InputNumber id="price" v-model="service.price" mode="currency" currency="VND" locale="vi-VN" :minFractionDigits="0" :maxFractionDigits="0" class="w-full" :class="{ 'p-invalid': submitted && !service.price }" />
                            <small class="p-error" v-if="submitted && !service.price">Giá dịch vụ là bắt buộc.</small>
                        </div>

                        <div class="mb-4">
                            <label for="unit" class="font-bold mb-2 block">Đơn vị tính</label>
                            <Dropdown id="unit" v-model="service.unit" :options="units" optionLabel="label" optionValue="value" placeholder="Chọn đơn vị" class="w-full" :class="{ 'p-invalid': submitted && !service.unit }" />
                            <small class="p-error" v-if="submitted && !service.unit">Đơn vị tính là bắt buộc.</small>
                        </div>

                        <div class="mb-4">
                            <label for="isAvailable" class="font-bold mb-2 block">Trạng thái cung cấp</label>
                            <div class="field-checkbox">
                                <InputSwitch id="isAvailable" v-model="service.isAvailable" />
                                <label for="isAvailable" class="ml-2">{{ service.isAvailable ? 'Đang cung cấp' : 'Tạm ngưng cung cấp' }}</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-span-2">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label for="description" class="font-bold mb-2 block">Mô tả</label>
                            <Textarea id="description" v-model="service.description" rows="3" autoResize class="w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Lưu" icon="pi pi-check" text @click="saveService" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteServiceDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="service"
                    >Bạn có chắc chắn muốn xóa dịch vụ <b>{{ service.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteServiceDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteService" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteServicesDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="selectedServices && selectedServices.length > 0">Bạn có chắc chắn muốn xóa {{ selectedServices.length }} dịch vụ đã chọn?</span>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteServicesDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteSelectedServices" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.card {
    background: var(--surface-card);
    border-radius: 10px;
    margin-bottom: 1rem;
}

.p-toolbar {
    border-radius: 10px;
}

.p-datatable .p-datatable-header {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.p-datatable .p-column-header-content {
    justify-content: flex-start;
}

:deep(.p-datatable-wrapper) {
    border-radius: 10px;
}

:deep(.p-datatable .p-datatable-header) {
    background: var(--surface-section);
    border: 1px solid var(--surface-border);
    border-width: 1px 1px 0 1px;
    padding: 1rem;
    text-align: left;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

:deep(.p-datatable .p-datatable-footer) {
    background: var(--surface-section);
    border: 1px solid var(--surface-border);
    border-width: 0 1px 1px 1px;
    padding: 1rem 1rem;
    font-weight: 600;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
}

:deep(.p-dropdown-label) {
    display: flex;
    align-items: center;
}

:deep(.p-inputtext) {
    font-size: 0.9rem;
    min-height: 40px;
    width: 100% !important;
}

:deep(.p-dropdown),
:deep(.p-inputnumber),
:deep(.p-calendar),
:deep(.p-textarea) {
    display: flex;
    width: 100% !important;
}

:deep(.p-dropdown-panel),
:deep(.p-calendar-panel) {
    width: auto !important;
    min-width: 100%;
}

:deep(.p-dropdown-items-wrapper),
:deep(.p-datepicker) {
    width: 100%;
}

:deep(.p-inputnumber-input),
:deep(.p-textarea) {
    width: 100% !important;
}

:deep(.p-button) {
    font-size: 0.95rem;
    min-height: 40px;
}

:deep(.p-dialog-content) {
    overflow-y: visible;
}

.field {
    width: 100%;
}

.field-checkbox {
    display: flex;
    align-items: center;
}
</style>
