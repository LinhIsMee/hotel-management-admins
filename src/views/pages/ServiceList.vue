<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import { useToast } from 'primevue/usetoast';
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
const toast = useToast();

// Định nghĩa địa chỉ cơ sở của API backend
const API_BASE_URL = 'http://localhost:9000';

// Loại dịch vụ theo tài liệu API
const serviceTypes = ref([
    { label: 'Dịch vụ vệ sinh, giặt ủi', value: 'HOUSEKEEPING' },
    { label: 'Dịch vụ spa, massage', value: 'SPA' },
    { label: 'Dịch vụ đưa đón, thuê xe', value: 'TRANSPORT' },
    { label: 'Dịch vụ ăn uống', value: 'FOOD' },
    { label: 'Dịch vụ kinh doanh', value: 'BUSINESS' },
    { label: 'Dịch vụ tour, tham quan', value: 'TOUR' },
    { label: 'Dịch vụ thể dục, thể thao', value: 'FITNESS' },
    { label: 'Các dịch vụ khác', value: 'OTHER' }
]);

// Hàm helper lấy token từ localStorage
const getAuthToken = () => {
    try {
        // Lấy dữ liệu từ admin_token trong localStorage
        const adminTokenData = localStorage.getItem('admin_token');

        if (!adminTokenData) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi xác thực',
                detail: 'Không tìm thấy token đăng nhập, vui lòng đăng nhập lại',
                life: 3000
            });
            return null;
        }

        // Parse chuỗi JSON
        const adminTokenObj = JSON.parse(adminTokenData);

        // Lấy accessToken từ object
        const accessToken = adminTokenObj.accessToken;

        if (!accessToken) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi xác thực',
                detail: 'Token không hợp lệ, vui lòng đăng nhập lại',
                life: 3000
            });
            return null;
        }

        return accessToken;
    } catch (error) {
        console.error('Lỗi khi lấy token:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi xác thực',
            detail: 'Có lỗi xảy ra khi xác thực, vui lòng đăng nhập lại',
            life: 3000
        });
        return null;
    }
};

// Thêm hàm helper để tạo header xác thực
const getAuthHeaders = (contentType = false) => {
    const token = getAuthToken();
    if (!token) return null;

    const headers = {
        Authorization: `Bearer ${token}`
    };

    if (contentType) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

const fetchData = async () => {
    try {
        loading.value = true;

        const headers = getAuthHeaders();
        if (!headers) {
            loading.value = false;
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/services`, {
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi tải danh sách dịch vụ: ${response.statusText} (${response.status})`);
        }

        const result = await response.json();
        console.log('Dữ liệu nhận được từ API:', result);

        services.value = Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu dịch vụ:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể tải danh sách dịch vụ',
            life: 3000
        });
        services.value = [];
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});

const openNew = () => {
    service.value = {
        type: 'HOUSEKEEPING',
        price: 0,
        unit: 'Lần',
        isAvailable: true
    };
    submitted.value = false;
    serviceDialog.value = true;
};

const hideDialog = () => {
    serviceDialog.value = false;
    submitted.value = false;
    service.value = {};
};

const saveService = async () => {
    submitted.value = true;

    if (service.value.name?.trim() && service.value.code?.trim() && service.value.price > 0) {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return;

            let url;
            let method;

            if (service.value.id) {
                // Cập nhật dịch vụ hiện có
                url = `${API_BASE_URL}/api/services/${service.value.id}`;
                method = 'PUT';
            } else {
                // Tạo dịch vụ mới
                url = `${API_BASE_URL}/api/services`;
                method = 'POST';
            }

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(service.value)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Server response:', errorData);
                throw new Error(`Lỗi khi ${service.value.id ? 'cập nhật' : 'tạo'} dịch vụ: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();

            if (service.value.id) {
                // Cập nhật dịch vụ trong danh sách
                const index = findIndexById(service.value.id);
                if (index !== -1) {
                    services.value[index] = result.data;
                }
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật dịch vụ thành công', life: 3000 });
            } else {
                // Thêm dịch vụ mới vào danh sách
                services.value.push(result.data);
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm dịch vụ thành công', life: 3000 });
            }

            serviceDialog.value = false;
            service.value = {};
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu dịch vụ:', error);
            toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
        }
    }
};

const editService = async (editService) => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/api/services/${editService.id}`, {
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi tải thông tin dịch vụ: ${response.statusText} (${response.status})`);
        }

        const result = await response.json();
        service.value = result.data;
        serviceDialog.value = true;
    } catch (error) {
        console.error('Lỗi khi tải thông tin dịch vụ:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
    }
};

const confirmDeleteService = (editService) => {
    service.value = editService;
    deleteServiceDialog.value = true;
};

const deleteService = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/api/services/${service.value.id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Không thể xóa dịch vụ: ${response.statusText} (${response.status})`);
        }

        // Cập nhật danh sách dịch vụ sau khi xóa
        services.value = services.value.filter((val) => val.id !== service.value.id);
        deleteServiceDialog.value = false;
        service.value = {};
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa dịch vụ thành công', life: 3000 });

        // Tải lại dữ liệu sau khi xóa để đảm bảo hiển thị đúng
        fetchData();
    } catch (error) {
        console.error('Lỗi khi xóa dịch vụ:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
    }
};

const confirmDeleteSelected = () => {
    deleteServicesDialog.value = true;
};

const deleteSelectedServices = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const deletePromises = selectedServices.value.map((serviceToDelete) =>
            fetch(`${API_BASE_URL}/api/services/${serviceToDelete.id}`, {
                method: 'DELETE',
                headers: headers
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`Lỗi khi xóa dịch vụ ID ${serviceToDelete.id}: ${response.statusText}`);
                }
                return response;
            })
        );

        await Promise.all(deletePromises);

        services.value = services.value.filter((val) => !selectedServices.value.some((s) => s.id === val.id));
        deleteServicesDialog.value = false;
        selectedServices.value = null;
        toast.add({ severity: 'success', summary: 'Thành công', detail: `Xóa ${deletePromises.length} dịch vụ thành công`, life: 3000 });

        // Tải lại dữ liệu sau khi xóa để đảm bảo hiển thị đúng
        fetchData();
    } catch (error) {
        console.error('Lỗi khi xóa nhiều dịch vụ:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Có lỗi xảy ra khi xóa dịch vụ', life: 3000 });
    }
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

const formatDate = (value) => {
    if (value) {
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return '—';
            }
            return new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(date);
        } catch (error) {
            console.error('Lỗi khi format ngày:', error);
            return '—';
        }
    }
    return '—';
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
    return type ? type.label : typeValue;
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
                <template #start>
                    <span class="p-input-icon-left">
                        <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
                    </span>
                </template>

                <template #end>
                    <Button label="Thêm mới" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                    <Button label="Xóa" icon="pi pi-trash" severity="danger" class="mr-2" @click="confirmDeleteSelected" :disabled="!selectedServices?.length" />
                </template>
            </Toolbar>

            <div v-if="loading" class="text-center py-4">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                <div class="mt-2">Đang tải dữ liệu...</div>
            </div>

            <div v-else>
                <div v-if="services.length === 0" class="text-center py-4">Không có dịch vụ nào được tìm thấy.</div>
                <div v-else>
                    <div class="text-sm mb-2">Tổng số: {{ services.length }} dịch vụ</div>

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
                                {{ data.unit }}
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
            </div>
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
                            <InputText id="unit" v-model="service.unit" class="w-full" :class="{ 'p-invalid': submitted && !service.unit }" placeholder="Ví dụ: Kg, Giờ, Lần, Ngày..." />
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
