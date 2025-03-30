<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';

// Import các component PrimeVue
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import { useToast } from 'primevue/usetoast';

// Khai báo biến
const users = ref([]);
const loading = ref(true);
const userDialog = ref(false);
const deleteUserDialog = ref(false);
const deleteUsersDialog = ref(false);
const user = ref({});
const selectedUsers = ref(null);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const toast = useToast();

// Định nghĩa địa chỉ cơ sở của API backend
const API_BASE_URL = 'http://localhost:9000';

const genders = ref([
    { label: 'Nam', value: 'Male' },
    { label: 'Nữ', value: 'Female' },
    { label: 'Khác', value: 'Other' }
]);

const roles = ref([
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'Nhân viên', value: 'ROLE_STAFF' },
    { label: 'Người dùng', value: 'ROLE_USER' }
]);

const statuses = ref([
    { label: 'Hoạt động', value: 'ACTIVE' },
    { label: 'Bị khóa', value: 'INACTIVE' }
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

// Lấy danh sách người dùng từ API
const fetchData = async () => {
    try {
        loading.value = true;
        const headers = getAuthHeaders();
        if (!headers) {
            loading.value = false;
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi tải dữ liệu người dùng: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();

        // Đảm bảo data là một mảng
        if (!Array.isArray(data)) {
            if (data && typeof data === 'object' && Array.isArray(data.data)) {
                users.value = data.data;
            } else {
                users.value = [];
            }
        } else {
            users.value = data;
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể tải danh sách người dùng', life: 3000 });
        users.value = []; // Đảm bảo mảng rỗng khi có lỗi
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});

const openNew = () => {
    user.value = {
        role: 'ROLE_USER',
        gender: 'Male'
    };
    submitted.value = false;
    userDialog.value = true;
};

const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
};

// Lưu người dùng (tạo mới hoặc cập nhật)
const saveUser = async () => {
    submitted.value = true;

    if (user.value.fullName?.trim() && user.value.email?.trim() && (user.value.id || (user.value.username?.trim() && user.value.password?.trim()))) {
        try {
            let url;
            let method;
            let body;

            // Xử lý ngày sinh
            let dateOfBirth = user.value.dateOfBirth;
            if (dateOfBirth === '' || dateOfBirth === 'null') {
                dateOfBirth = null;
            }

            if (user.value.id) {
                // Cập nhật người dùng hiện có
                url = `${API_BASE_URL}/api/v1/user/update/${user.value.id}`;
                method = 'PUT';
                body = JSON.stringify({
                    fullName: user.value.fullName,
                    email: user.value.email,
                    phone: user.value.phone,
                    gender: user.value.gender,
                    dateOfBirth: dateOfBirth,
                    address: user.value.address,
                    nationalId: user.value.nationalId,
                    status: user.value.status // Thêm trạng thái nếu API hỗ trợ
                });
            } else {
                // Tạo người dùng mới
                url = `${API_BASE_URL}/api/v1/user/create`;
                method = 'POST';
                body = JSON.stringify({
                    username: user.value.username,
                    password: user.value.password,
                    fullName: user.value.fullName,
                    email: user.value.email,
                    phone: user.value.phone, // Thay phoneNumber bằng phone theo payload chuẩn
                    gender: user.value.gender,
                    dateOfBirth: dateOfBirth,
                    address: user.value.address,
                    nationalId: user.value.nationalId,
                    role: {
                        name: user.value.role // Sử dụng định dạng đúng cho role
                    },
                    status: user.value.status // Thêm trạng thái nếu API hỗ trợ
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
                throw new Error(`Lỗi khi ${user.value.id ? 'cập nhật' : 'tạo'} người dùng: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();

            if (user.value.id) {
                const index = findIndexById(user.value.id);
                users.value[index] = result;
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật người dùng thành công', life: 3000 });
            } else {
                users.value.push(result);
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm người dùng thành công', life: 3000 });
            }

            userDialog.value = false;
            user.value = {};
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu:', error);
            toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng điền đầy đủ các trường bắt buộc', life: 3000 });
    }
};

// Lấy thông tin chi tiết người dùng
const editUser = async (editUser) => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/api/v1/users/${editUser.id}`, {
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Không thể tải thông tin người dùng: ${response.statusText} (${response.status})`);
        }

        user.value = await response.json();
        user.value.phone = user.value.phone || user.value.phoneNumber;
        userDialog.value = true;
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
    }
};

const confirmDeleteUser = (editUser) => {
    user.value = editUser;
    deleteUserDialog.value = true;
};

// Xóa một người dùng
const deleteUser = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/api/v1/users/${user.value.id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Không thể xóa người dùng: ${response.statusText} (${response.status})`);
        }

        users.value = users.value.filter((val) => val.id !== user.value.id);
        deleteUserDialog.value = false;
        user.value = {};
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa người dùng thành công', life: 3000 });
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
    }
};

const confirmDeleteSelected = () => {
    deleteUsersDialog.value = true;
};

// Xóa nhiều người dùng
const deleteSelectedUsers = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const deletePromises = selectedUsers.value.map((userToDelete) =>
            fetch(`${API_BASE_URL}/api/v1/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers: headers
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`Lỗi khi xóa user ID ${userToDelete.id}: ${response.statusText}`);
                }
                return response;
            })
        );

        await Promise.all(deletePromises);

        users.value = users.value.filter((val) => !selectedUsers.value.includes(val));
        deleteUsersDialog.value = false;
        selectedUsers.value = null;
        toast.add({ severity: 'success', summary: 'Thành công', detail: `Xóa ${deletePromises.length} người dùng thành công`, life: 3000 });
    } catch (error) {
        console.error('Lỗi khi xóa nhiều người dùng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Có lỗi xảy ra khi xóa người dùng', life: 3000 });
    }
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < users.value.length; i++) {
        if (users.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const formatDate = (value) => {
    if (!value || value === 'null') return '—';

    try {
        // Xử lý trường hợp định dạng "HH:MM:SS - DD/MM/YYYY"
        if (typeof value === 'string' && value.includes(' - ')) {
            return value; // Đã được định dạng sẵn
        }

        const date = new Date(value);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    } catch (e) {
        console.error('Lỗi định dạng ngày:', e, value);
        return value; // Trả về giá trị gốc nếu không thể định dạng
    }
};

const getRoleName = (role) => {
    if (!role) return 'Không xác định';

    switch (role) {
        case 'ROLE_ADMIN':
            return 'Admin';
        case 'ROLE_STAFF':
            return 'Nhân viên';
        case 'ROLE_USER':
            return 'Người dùng';
        default:
            return role;
    }
};

const getRoleStatus = (role) => {
    switch (role) {
        case 'ROLE_ADMIN':
            return 'danger';
        case 'ROLE_STAFF':
            return 'warning';
        case 'ROLE_USER':
            return 'info';
        default:
            return null;
    }
};

// Thêm hàm này cho việc hiển thị giới tính
const getGenderName = (gender) => {
    if (!gender) return 'Không xác định';

    switch (gender) {
        case 'Male':
            return 'Nam';
        case 'Female':
            return 'Nữ';
        case 'Other':
            return 'Khác';
        default:
            return gender;
    }
};
</script>

<template>
    <div class="card">
        <ConfirmDialog></ConfirmDialog>
        <div class="">
            <Toolbar class="mb-4">
                <template v-slot:start>
                    <div class="my-2">
                        <Button label="Thêm mới" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                        <Button label="Xóa" icon="pi pi-trash" class="mr-2" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedUsers || !selectedUsers.length" />
                    </div>
                </template>

                <template v-slot:end>
                    <span class="p-input-icon-left">
                        <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
                    </span>
                </template>
            </Toolbar>

            <div v-if="loading" class="text-center py-4">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                <div class="mt-2">Đang tải dữ liệu...</div>
            </div>

            <div v-else>
                <div v-if="users.length === 0" class="text-center py-4">Không có người dùng nào được tìm thấy.</div>
                <div v-else>
                    <div class="text-sm mb-2">Tổng số: {{ users.length }} người dùng</div>

                    <DataTable
                        :value="users"
                        v-model:selection="selectedUsers"
                        dataKey="id"
                        :paginator="true"
                        :rows="10"
                        :filters="filters"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25, 50]"
                        currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} người dùng"
                        responsiveLayout="scroll"
                        class="p-datatable-sm"
                    >
                        <template #empty>Không có người dùng nào được tìm thấy.</template>
                        <template #loading>Đang tải dữ liệu người dùng. Vui lòng đợi.</template>

                        <Column selectionMode="multiple" exportable="false" style="min-width: 3rem"></Column>

                        <Column field="id" header="ID" sortable style="min-width: 4rem"></Column>

                        <Column field="username" header="Tên đăng nhập" sortable style="min-width: 10rem"></Column>

                        <Column field="fullName" header="Họ và tên" sortable style="min-width: 14rem">
                            <template #body="{ data }">
                                <div class="flex align-items-center gap-2">
                                    <Avatar :label="data.fullName ? data.fullName.charAt(0) : data.username.charAt(0)" class="bg-primary" shape="circle" />
                                    <span>{{ data.fullName || data.username }}</span>
                                </div>
                            </template>
                        </Column>

                        <Column field="email" header="Email" sortable style="min-width: 14rem">
                            <template #body="{ data }">
                                {{ data.email || '—' }}
                            </template>
                        </Column>

                        <Column field="phone" header="Số điện thoại" sortable style="min-width: 10rem">
                            <template #body="{ data }">
                                {{ data.phone || '—' }}
                            </template>
                        </Column>

                        <Column field="address" header="Địa chỉ" sortable style="min-width: 14rem">
                            <template #body="{ data }">
                                {{ data.address || '—' }}
                            </template>
                        </Column>

                        <Column field="gender" header="Giới tính" sortable style="min-width: 8rem">
                            <template #body="{ data }">
                                <Tag :value="getGenderName(data.gender)" severity="info" />
                            </template>
                        </Column>

                        <Column field="role" header="Vai trò" sortable style="min-width: 8rem">
                            <template #body="{ data }">
                                <Tag :value="getRoleName(data.role)" :severity="getRoleStatus(data.role)" />
                            </template>
                        </Column>

                        <Column field="createdAt" header="Ngày tạo" sortable style="min-width: 10rem">
                            <template #body="{ data }">
                                {{ formatDate(data.createdAt) || '—' }}
                            </template>
                        </Column>

                        <Column field="updatedAt" header="Cập nhật lần cuối" sortable style="min-width: 10rem">
                            <template #body="{ data }">
                                {{ formatDate(data.updatedAt) || '—' }}
                            </template>
                        </Column>

                        <Column exportable="false" style="min-width: 10rem">
                            <template #body="{ data }">
                                <Button icon="pi pi-pencil" outlined class="mr-2" @click="editUser(data)" />
                                <Button icon="pi pi-trash" outlined severity="danger" @click="confirmDeleteUser(data)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <!-- Dialog thêm/sửa người dùng -->
            <Dialog v-model:visible="userDialog" :style="{ width: '800px' }" header="Thông tin người dùng" :modal="true" class="p-fluid">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div class="field w-full">
                        <div class="p-4 rounded-lg w-full">
                            <div class="mb-4 w-full" v-if="!user.id">
                                <label for="username" class="font-bold mb-2 block">Tên đăng nhập</label>
                                <InputText id="username" v-model.trim="user.username" required :class="{ 'p-invalid': submitted && !user.username }" />
                                <small class="p-error" v-if="submitted && !user.username">Tên đăng nhập là bắt buộc.</small>
                            </div>
                            <div class="mb-4 w-full" v-else>
                                <label for="username-display" class="font-bold mb-2 block">Tên đăng nhập</label>
                                <InputText id="username-display" v-model.trim="user.username" disabled />
                                <small class="text-gray-500">Không thể thay đổi tên đăng nhập</small>
                            </div>

                            <div class="mb-4 w-full" v-if="!user.id">
                                <label for="password" class="font-bold mb-2 block">Mật khẩu</label>
                                <InputText id="password" type="password" v-model.trim="user.password" required :class="{ 'p-invalid': submitted && !user.password }" />
                                <small class="p-error" v-if="submitted && !user.password">Mật khẩu là bắt buộc.</small>
                            </div>

                            <div class="mb-4 w-full">
                                <label for="fullName" class="font-bold mb-2 block">Họ và tên</label>
                                <InputText id="fullName" v-model.trim="user.fullName" required :class="{ 'p-invalid': submitted && !user.fullName }" />
                                <small class="p-error" v-if="submitted && !user.fullName">Họ và tên là bắt buộc.</small>
                            </div>

                            <div class="mb-4 w-full">
                                <label for="email" class="font-bold mb-2 block">Email</label>
                                <InputText id="email" v-model.trim="user.email" required :class="{ 'p-invalid': submitted && !user.email }" />
                                <small class="p-error" v-if="submitted && !user.email">Email là bắt buộc.</small>
                            </div>

                            <div class="mb-4 w-full">
                                <label for="phone" class="font-bold mb-2 block">Số điện thoại</label>
                                <InputText id="phone" v-model.trim="user.phone" placeholder="Nhập số điện thoại" />
                            </div>
                        </div>
                    </div>
                    <div class="field w-full">
                        <div class="p-4 rounded-lg w-full">
                            <div class="mb-4 w-full">
                                <label for="address" class="font-bold mb-2 block">Địa chỉ</label>
                                <InputText id="address" v-model.trim="user.address" placeholder="Nhập địa chỉ" />
                            </div>

                            <div class="mb-4 w-full">
                                <label for="dateOfBirth" class="font-bold mb-2 block">Ngày sinh</label>
                                <InputText id="dateOfBirth" type="date" v-model="user.dateOfBirth" :value="user.dateOfBirth && user.dateOfBirth !== 'null' ? user.dateOfBirth : ''" />
                            </div>

                            <div class="mb-4 w-full">
                                <label for="nationalId" class="font-bold mb-2 block">CMND/CCCD</label>
                                <InputText id="nationalId" v-model.trim="user.nationalId" placeholder="Nhập số CMND/CCCD" />
                            </div>

                            <div class="mb-4 w-full">
                                <label for="gender" class="font-bold mb-2 block w-full">Giới tính</label>
                                <Dropdown id="gender" v-model="user.gender" :options="genders" optionLabel="label" optionValue="value" placeholder="Chọn giới tính" class="w-full" />
                            </div>

                            <div class="mb-4 w-full" v-if="!user.id">
                                <label for="role" class="font-bold mb-2 block">Vai trò</label>
                                <Dropdown id="role" v-model="user.role" :options="roles" optionLabel="label" optionValue="value" placeholder="Chọn vai trò" class="w-full" />
                            </div>
                            <div class="mb-4 w-full" v-else>
                                <label for="role-display" class="font-bold mb-2 block">Vai trò</label>
                                <div class="mt-2">
                                    <Tag :value="getRoleName(user.role)" :severity="getRoleStatus(user.role)" />
                                </div>
                                <small class="text-gray-500">Không thể thay đổi vai trò người dùng</small>
                            </div>

                            <div class="mb-4 w-full">
                                <label for="status" class="font-bold mb-2 block">Trạng thái</label>
                                <Dropdown id="status" v-model="user.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái" class="w-full" />
                            </div>

                            <div class="mb-4 w-full" v-if="user.id">
                                <div class="mb-2">
                                    <label class="font-bold block">Thông tin khác</label>
                                </div>
                                <div class="flex flex-col gap-2 text-sm">
                                    <div v-if="user.createdAt" class="flex items-center">
                                        <span class="font-medium mr-2">Ngày tạo:</span>
                                        <span>{{ formatDate(user.createdAt) }}</span>
                                    </div>
                                    <div v-if="user.updatedAt" class="flex items-center">
                                        <span class="font-medium mr-2">Cập nhật lần cuối:</span>
                                        <span>{{ formatDate(user.updatedAt) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <template #footer>
                    <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" />
                    <Button label="Lưu" icon="pi pi-check" text @click="saveUser" />
                </template>
            </Dialog>

            <!-- Dialog xác nhận xóa người dùng -->
            <Dialog v-model:visible="deleteUserDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
                <div class="flex align-items-center justify-content-center">
                    <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                    <span v-if="user"
                        >Bạn có chắc chắn muốn xóa người dùng <b>{{ user.fullName }}</b
                        >?</span
                    >
                </div>
                <template #footer>
                    <Button label="Không" icon="pi pi-times" text @click="deleteUserDialog = false" />
                    <Button label="Có" icon="pi pi-check" text @click="deleteUser" />
                </template>
            </Dialog>

            <!-- Dialog xác nhận xóa nhiều người dùng -->
            <Dialog v-model:visible="deleteUsersDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
                <div class="flex align-items-center justify-content-center">
                    <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                    <span v-if="selectedUsers && selectedUsers.length > 0">Bạn có chắc chắn muốn xóa {{ selectedUsers.length }} người dùng đã chọn?</span>
                </div>
                <template #footer>
                    <Button label="Không" icon="pi pi-times" text @click="deleteUsersDialog = false" />
                    <Button label="Có" icon="pi pi-check" text @click="deleteSelectedUsers" />
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
:deep(.p-inputnumber-input),
:deep(.p-calendar),
:deep(.p-multiselect) {
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
