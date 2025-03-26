<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';

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

const statuses = ref([
    { label: 'Hoạt động', value: 'ACTIVE' },
    { label: 'Bị khóa', value: 'INACTIVE' }
]);

const fetchData = async () => {
    try {
        loading.value = true;
        const response = await fetch('/demo/data/users.json');
        const data = await response.json();
        users.value = data.data;
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
    user.value = {
        status: 'ACTIVE'
    };
    submitted.value = false;
    userDialog.value = true;
};

const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
};

const saveUser = () => {
    submitted.value = true;

    if (user.value.name?.trim() && user.value.email?.trim()) {
        if (user.value.id) {
            const index = findIndexById(user.value.id);
            users.value[index] = { ...user.value };
        } else {
            user.value.id = createId();
            user.value.createdAt = new Date().toISOString().split('T')[0];
            users.value.push(user.value);
        }

        userDialog.value = false;
        user.value = {};
    }
};

const editUser = (editUser) => {
    user.value = { ...editUser };
    userDialog.value = true;
};

const confirmDeleteUser = (editUser) => {
    user.value = editUser;
    deleteUserDialog.value = true;
};

const deleteUser = () => {
    users.value = users.value.filter((val) => val.id !== user.value.id);
    deleteUserDialog.value = false;
    user.value = {};
};

const confirmDeleteSelected = () => {
    deleteUsersDialog.value = true;
};

const deleteSelectedUsers = () => {
    users.value = users.value.filter((val) => !selectedUsers.value.includes(val));
    deleteUsersDialog.value = false;
    selectedUsers.value = null;
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

const createId = () => {
    let id = 1;
    if (users.value && users.value.length > 0) {
        const maxId = Math.max(...users.value.map((user) => user.id));
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

const getSeverity = (status) => {
    switch (status) {
        case 'ACTIVE':
            return 'success';
        case 'INACTIVE':
            return 'danger';
        default:
            return null;
    }
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
                        <Button label="Xóa" icon="pi pi-trash" class="mr-2" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedUsers || !selectedUsers.length" />
                    </div>
                </template>

                <template v-slot:end>
                    <span class="p-input-icon-left">
                        <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
                    </span>
                </template>
            </Toolbar>

            <DataTable
                :value="users"
                v-model:selection="selectedUsers"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :loading="loading"
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

                <Column field="status" header="Trạng thái" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        <Tag :value="data.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'" :severity="getSeverity(data.status)" />
                    </template>
                </Column>

                <Column field="createdAt" header="Ngày tạo" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ formatDate(data.createdAt) }}
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

        <!-- Dialog thêm/sửa người dùng -->
        <Dialog v-model:visible="userDialog" :style="{ width: '800px' }" header="Thông tin người dùng" :modal="true" class="p-fluid">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div class="field w-full">
                    <div class="p-4 rounded-lg w-full">
                        <div class="mb-4 w-full">
                            <label for="name" class="font-bold mb-2 block">Họ và tên</label>
                            <InputText id="name" v-model.trim="user.name" required :class="{ 'p-invalid': submitted && !user.name }" />
                            <small class="p-error" v-if="submitted && !user.name">Họ và tên là bắt buộc.</small>
                        </div>

                        <div class="mb-4 w-full">
                            <label for="email" class="font-bold mb-2 block">Email</label>
                            <InputText id="email" v-model.trim="user.email" required :class="{ 'p-invalid': submitted && !user.email }" />
                            <small class="p-error" v-if="submitted && !user.email">Email là bắt buộc.</small>
                        </div>
                    </div>
                </div>
                <div class="field w-full">
                    <div class="p-4 rounded-lg w-full">
                        <div class="mb-4 w-full">
                            <label for="phone" class="font-bold mb-2 block">Số điện thoại</label>
                            <InputText id="phone" v-model.trim="user.phone" />
                        </div>

                        <div class="mb-4 w-full">
                            <label for="status" class="font-bold mb-2 block">Trạng thái</label>
                            <Dropdown id="status" v-model="user.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái" />
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
                    >Bạn có chắc chắn muốn xóa người dùng <b>{{ user.name }}</b
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
