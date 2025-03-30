<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';

// Import các component PrimeVue
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import { useToast } from 'primevue/usetoast';

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
const toast = useToast();

// Định nghĩa địa chỉ cơ sở của API backend
const API_BASE_URL = 'http://localhost:9000';

const departments = ref([
    { name: 'Ban quản lý', value: 'MANAGEMENT' },
    { name: 'Lễ tân', value: 'FRONT_DESK' },
    { name: 'Nhà hàng', value: 'RESTAURANT' },
    { name: 'Dọn phòng', value: 'HOUSEKEEPING' },
    { name: 'Bảo vệ', value: 'SECURITY' },
    { name: 'Kỹ thuật', value: 'TECHNICAL' },
    { name: 'Spa', value: 'SPA' }
]);

const positions = ref([
    { name: 'Quản lý', value: 'MANAGER' },
    { name: 'Giám sát', value: 'SUPERVISOR' },
    { name: 'Nhân viên lễ tân', value: 'RECEPTIONIST' },
    { name: 'Phục vụ', value: 'SERVER' },
    { name: 'Đầu bếp', value: 'CHEF' },
    { name: 'Dọn phòng', value: 'CLEANING' },
    { name: 'Bảo vệ', value: 'SECURITY' },
    { name: 'Nhân viên spa', value: 'THERAPIST' }
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

// Lấy danh sách nhân viên từ API
const fetchData = async () => {
    try {
        loading.value = true;
        const headers = getAuthHeaders();
        if (!headers) {
            loading.value = false;
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/employees`, {
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi tải dữ liệu nhân viên: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();

        // Đảm bảo data là một mảng
        if (!Array.isArray(data)) {
            if (data && typeof data === 'object' && Array.isArray(data.data)) {
                employees.value = data.data;
            } else {
                employees.value = [];
            }
        } else {
            employees.value = data;
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể tải danh sách nhân viên', life: 3000 });
        employees.value = []; // Đảm bảo mảng rỗng khi có lỗi
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
        joinDate: new Date().toISOString().split('T')[0]
    };
    submitted.value = false;
    employeeDialog.value = true;
};

const hideDialog = () => {
    employeeDialog.value = false;
    submitted.value = false;
};

// Lưu nhân viên (tạo mới hoặc cập nhật)
const saveEmployee = async () => {
    submitted.value = true;

    if (employee.value.name?.trim() && employee.value.email?.trim() && employee.value.position && employee.value.department) {
        try {
            let url;
            let method;
            let body;

            // Format ngày vào làm định dạng YYYY-MM-DD
            let joinDate = employee.value.joinDate;
            if (joinDate instanceof Date) {
                joinDate = joinDate.toISOString().split('T')[0];
            }

            if (employee.value.id) {
                // Cập nhật nhân viên hiện có
                url = `${API_BASE_URL}/api/v1/employees/${employee.value.id}`;
                method = 'PUT';
                body = JSON.stringify({
                    name: employee.value.name,
                    email: employee.value.email,
                    phone: employee.value.phone,
                    department: employee.value.department,
                    position: employee.value.position,
                    joinDate: joinDate,
                    status: employee.value.status
                });
            } else {
                // Tạo nhân viên mới
                url = `${API_BASE_URL}/api/v1/employees`;
                method = 'POST';
                body = JSON.stringify({
                    name: employee.value.name,
                    email: employee.value.email,
                    phone: employee.value.phone,
                    department: employee.value.department,
                    position: employee.value.position,
                    joinDate: joinDate,
                    status: employee.value.status
                });
            }

            const headers = getAuthHeaders(true);
            if (!headers) return;

            console.log('Request payload:', JSON.parse(body)); // Log để kiểm tra

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: body
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Server response:', errorData);
                throw new Error(`Lỗi khi ${employee.value.id ? 'cập nhật' : 'tạo'} nhân viên: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();

            if (employee.value.id) {
                const index = findIndexById(employee.value.id);
                employees.value[index] = result;
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật nhân viên thành công', life: 3000 });
            } else {
                employees.value.push(result);
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm nhân viên thành công', life: 3000 });
            }

            employeeDialog.value = false;
            employee.value = {};
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu:', error);
            toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng điền đầy đủ các trường bắt buộc', life: 3000 });
    }
};

// Lấy thông tin chi tiết nhân viên
const editEmployee = async (editEmployee) => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/api/v1/employees/${editEmployee.id}`, {
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Không thể tải thông tin nhân viên: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();
        employee.value = data;

        // Nếu joinDate là chuỗi, chuyển thành đối tượng Date cho Calendar
        if (employee.value.joinDate && typeof employee.value.joinDate === 'string') {
            const dateParts = employee.value.joinDate.split('-');
            if (dateParts.length === 3) {
                employee.value.joinDate = new Date(
                    parseInt(dateParts[0]), // năm
                    parseInt(dateParts[1]) - 1, // tháng (0-11)
                    parseInt(dateParts[2]) // ngày
                );
            }
        }

        employeeDialog.value = true;
    } catch (error) {
        console.error('Lỗi khi tải thông tin nhân viên:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
    }
};

const confirmDeleteEmployee = (editEmployee) => {
    employee.value = editEmployee;
    deleteEmployeeDialog.value = true;
};

// Xóa một nhân viên
const deleteEmployee = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/api/v1/employees/${employee.value.id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Không thể xóa nhân viên: ${response.statusText} (${response.status})`);
        }

        employees.value = employees.value.filter((val) => val.id !== employee.value.id);
        deleteEmployeeDialog.value = false;
        employee.value = {};
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa nhân viên thành công', life: 3000 });
    } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
    }
};

const confirmDeleteSelected = () => {
    deleteEmployeesDialog.value = true;
};

// Xóa nhiều nhân viên
const deleteSelectedEmployees = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const deletePromises = selectedEmployees.value.map((employeeToDelete) =>
            fetch(`${API_BASE_URL}/api/v1/employees/${employeeToDelete.id}`, {
                method: 'DELETE',
                headers: headers
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`Lỗi khi xóa nhân viên ID ${employeeToDelete.id}: ${response.statusText}`);
                }
                return response;
            })
        );

        await Promise.all(deletePromises);

        employees.value = employees.value.filter((val) => !selectedEmployees.value.includes(val));
        deleteEmployeesDialog.value = false;
        selectedEmployees.value = null;
        toast.add({ severity: 'success', summary: 'Thành công', detail: `Xóa ${deletePromises.length} nhân viên thành công`, life: 3000 });
    } catch (error) {
        console.error('Lỗi khi xóa nhiều nhân viên:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Có lỗi xảy ra khi xóa nhân viên', life: 3000 });
    }
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
                    <span class="p-input-icon-left">
                        <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
                    </span>
                </template>

                <template v-slot:end>
                    <div class="my-2">
                        <Button label="Thêm mới" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                        <Button label="Xóa" icon="pi pi-trash" class="mr-2" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedEmployees || !selectedEmployees.length" />
                    </div>
                </template>
            </Toolbar>

            <div v-if="loading" class="text-center py-4">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                <div class="mt-2">Đang tải dữ liệu...</div>
            </div>

            <div v-else>
                <div v-if="employees.length === 0" class="text-center py-4">Không có nhân viên nào được tìm thấy.</div>
                <div v-else>
                    <div class="text-sm mb-2">Tổng số: {{ employees.length }} nhân viên</div>

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
                                <InputText id="phone" v-model.trim="employee.phone" />
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
