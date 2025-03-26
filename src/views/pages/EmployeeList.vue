<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';

const employees = ref([]);
const loading = ref(true);
const employeeDialog = ref(false);
const deleteEmployeeDialog = ref(false);
const deleteEmployeesDialog = ref(false);
const employee = ref({});
const selectedEmployees = ref(null);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const departments = ref([
    { name: 'Ban Giám đốc', value: 'MANAGEMENT' },
    { name: 'Lễ tân', value: 'FRONT_DESK' },
    { name: 'Nhà hàng', value: 'RESTAURANT' },
    { name: 'Buồng phòng', value: 'HOUSEKEEPING' },
    { name: 'Kỹ thuật', value: 'TECHNICAL' },
    { name: 'An ninh', value: 'SECURITY' }
]);

const positions = ref([
    { name: 'Quản lý', value: 'MANAGER' },
    { name: 'Lễ tân', value: 'RECEPTIONIST' },
    { name: 'Phục vụ', value: 'SERVER' },
    { name: 'Bảo vệ', value: 'SECURITY' },
    { name: 'Vệ sinh', value: 'CLEANING' }
]);
const fetchData = async () => {
    try {
        loading.value = true;
        const response = await fetch('/demo/data/employees.json');
        const data = await response.json();
        employees.value = data.data;
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
    employee.value = {
        status: true,
        department: 'FRONT_DESK',
        position: 'RECEPTIONIST',
        joinDate: new Date()
    };
    submitted.value = false;
    employeeDialog.value = true;
};

const hideDialog = () => {
    employeeDialog.value = false;
    submitted.value = false;
};

const saveEmployee = () => {
    submitted.value = true;

    if (employee.value.name?.trim() && employee.value.email?.trim() && employee.value.position && employee.value.department) {
        if (employee.value.id) {
            const index = findIndexById(employee.value.id);
            employees.value[index] = { ...employee.value };
        } else {
            employee.value.id = createId();
            if (!employee.value.joinDate) {
                employee.value.joinDate = new Date().toISOString().split('T')[0];
            } else if (employee.value.joinDate instanceof Date) {
                employee.value.joinDate = employee.value.joinDate.toISOString().split('T')[0];
            }
            employees.value.push(employee.value);
        }

        employeeDialog.value = false;
        employee.value = {};
    }
};

const editEmployee = (editEmployee) => {
    employee.value = { ...editEmployee };
    employeeDialog.value = true;
};

const confirmDeleteEmployee = (editEmployee) => {
    employee.value = editEmployee;
    deleteEmployeeDialog.value = true;
};

const deleteEmployee = () => {
    employees.value = employees.value.filter((val) => val.id !== employee.value.id);
    deleteEmployeeDialog.value = false;
    employee.value = {};
};

const confirmDeleteSelected = () => {
    deleteEmployeesDialog.value = true;
};

const deleteSelectedEmployees = () => {
    employees.value = employees.value.filter((val) => !selectedEmployees.value.includes(val));
    deleteEmployeesDialog.value = false;
    selectedEmployees.value = null;
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < employees.value.length; i++) {
        if (employees.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const createId = () => {
    let id = 1;
    if (employees.value && employees.value.length > 0) {
        const maxId = Math.max(...employees.value.map((employee) => employee.id));
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

const getPositionName = (positionValue) => {
    const position = positions.value.find((p) => p.value === positionValue);
    return position ? position.name : '';
};

const getDepartmentName = (departmentValue) => {
    const department = departments.value.find((d) => d.value === departmentValue);
    return department ? department.name : '';
};

const getSeverity = (status) => {
    return status ? 'success' : 'danger';
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
                        <Button label="Xóa" icon="pi pi-trash" class="mr-2" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedEmployees || !selectedEmployees.length" />
                    </div>
                </template>

                <template v-slot:end>
                    <span class="p-input-icon-left">
                        <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
                    </span>
                </template>
            </Toolbar>

            <DataTable
                :value="employees"
                v-model:selection="selectedEmployees"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :loading="loading"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} nhân viên"
                responsiveLayout="scroll"
                class="p-datatable-sm"
            >
                <template #empty>Không có nhân viên nào được tìm thấy.</template>
                <template #loading>Đang tải dữ liệu nhân viên. Vui lòng đợi.</template>

                <Column selectionMode="multiple" exportable="false" style="min-width: 3rem"></Column>

                <Column field="id" header="ID" sortable style="min-width: 4rem"></Column>

                <Column field="name" header="Họ và tên" sortable style="min-width: 14rem">
                    <template #body="{ data }">
                        <div class="flex align-items-center gap-2">
                            <Avatar :label="data.name.charAt(0)" class="bg-primary" shape="circle" />
                            <span>{{ data.name }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="email" header="Email" sortable style="min-width: 14rem"></Column>

                <Column field="phone" header="Số điện thoại" sortable style="min-width: 10rem"></Column>

                <Column field="department" header="Phòng ban" sortable style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ getDepartmentName(data.department) }}
                    </template>
                </Column>

                <Column field="position" header="Chức vụ" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ getPositionName(data.position) }}
                    </template>
                </Column>

                <Column field="joinDate" header="Ngày vào làm" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ formatDate(data.joinDate) }}
                    </template>
                </Column>

                <Column field="status" header="Trạng thái" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        <Tag :value="data.status ? 'Đang làm việc' : 'Đã nghỉ việc'" :severity="getSeverity(data.status)" />
                    </template>
                </Column>

                <Column exportable="false" style="min-width: 10rem">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" outlined class="mr-2" @click="editEmployee(data)" />
                        <Button icon="pi pi-trash" outlined severity="danger" @click="confirmDeleteEmployee(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>
        <Dialog v-model:visible="employeeDialog" :style="{ width: '800px' }" header="Thông tin nhân viên" :modal="true" class="p-fluid">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div class="field w-full">
                    <div class="p-4 rounded-lg w-full">
                        <div class="mb-4 w-full">
                            <label for="name" class="font-bold mb-2 block">Tên nhân viên</label>
                            <InputText id="name" v-model.trim="employee.name" required :class="{ 'p-invalid': submitted && !employee.name }" />
                            <small class="p-error" v-if="submitted && !employee.name">Tên nhân viên là bắt buộc.</small>
                        </div>

                        <div class="mb-4 w-full">
                            <label for="email" class="font-bold mb-2 block">Email</label>
                            <InputText id="email" v-model.trim="employee.email" required :class="{ 'p-invalid': submitted && !employee.email }" type="email" />
                            <small class="p-error" v-if="submitted && !employee.email">Email là bắt buộc.</small>
                        </div>

                        <div class="mb-4 w-full">
                            <label for="phone" class="font-bold mb-2 block">Số điện thoại</label>
                            <InputText id="phone" v-model.trim="employee.phone" required :class="{ 'p-invalid': submitted && !employee.phone }" />
                            <small class="p-error" v-if="submitted && !employee.phone">Số điện thoại là bắt buộc.</small>
                        </div>
                    </div>
                </div>
                <div class="field w-full">
                    <div class="p-4 rounded-lg w-full">
                        <div class="mb-4 w-full">
                            <label for="department" class="font-bold mb-2 block w-full">Phòng ban</label>
                            <Dropdown
                                id="department"
                                v-model="employee.department"
                                :options="departments"
                                optionLabel="name"
                                optionValue="value"
                                placeholder="Chọn phòng ban"
                                class="w-full"
                                :class="{ 'p-invalid': submitted && !employee.department }"
                            />
                            <small class="p-error" v-if="submitted && !employee.department">Phòng ban là bắt buộc.</small>
                        </div>

                        <div class="mb-4 w-full">
                            <label for="position" class="font-bold mb-2 block">Chức vụ</label>
                            <Dropdown id="position" v-model="employee.position" :options="positions" optionLabel="name" optionValue="value" placeholder="Chọn chức vụ" class="w-full" :class="{ 'p-invalid': submitted && !employee.position }" />
                            <small class="p-error" v-if="submitted && !employee.position">Chức vụ là bắt buộc.</small>
                        </div>

                        <div class="mb-4 w-full">
                            <label for="joinDate" class="font-bold mb-2 block">Ngày vào làm</label>
                            <Calendar id="joinDate" v-model="employee.joinDate" dateFormat="dd/mm/yy" placeholder="Chọn ngày" showIcon class="w-full" />
                        </div>

                        <div class="mb-4 w-full">
                            <div class="flex align-items-center mt-3">
                                <InputSwitch id="status" v-model="employee.status" />
                                <label for="status" class="ml-2 font-bold">{{ employee.status ? 'Nhân viên đang làm việc' : 'Nhân viên đã nghỉ việc' }}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Lưu" icon="pi pi-check" text @click="saveEmployee" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteEmployeeDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="employee"
                    >Bạn có chắc chắn muốn xóa nhân viên <b>{{ employee.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteEmployeeDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteEmployee" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteEmployeesDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="selectedEmployees && selectedEmployees.length > 0">Bạn có chắc chắn muốn xóa {{ selectedEmployees.length }} nhân viên đã chọn?</span>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteEmployeesDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteSelectedEmployees" />
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
:deep(.p-calendar) {
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
:deep(.p-multiselect),
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
</style>
