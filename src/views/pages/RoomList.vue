<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, computed } from 'vue';
import { usePermissions } from '@/composables/usePermissions';

// Lấy phân quyền
const { userRole, can, refreshRole } = usePermissions();

// Khai báo biến
const rooms = ref([]);
const roomTypes = ref([]);
const loading = ref(true);
const roomDialog = ref(false);
const deleteRoomDialog = ref(false);
const deleteRoomsDialog = ref(false);
const room = ref({});
const selectedRooms = ref(null);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const toast = useToast();

// Định nghĩa địa chỉ cơ sở của API backend
const API_BASE_URL = 'http://localhost:9000';

// Tính toán quyền của người dùng
const permissions = computed(() => {
    return {
        canView: can.view.value,
        canCreate: can.create.value,
        canEdit: can.edit.value,
        canDelete: can.delete.value
    };
});

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

// Lấy danh sách loại phòng từ API
const fetchRoomTypes = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/api/v1/room-types`, {
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi tải dữ liệu loại phòng: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();
        roomTypes.value = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu loại phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể tải danh sách loại phòng', life: 3000 });
        roomTypes.value = [];
    }
};

// Lấy dữ liệu phòng từ API
const fetchData = async () => {
    try {
        loading.value = true;
        const headers = getAuthHeaders();
        if (!headers) {
            loading.value = false;
            return;
        }

        // Tải loại phòng và phòng cùng lúc
        await Promise.all([
            fetchRoomTypes(),
            fetch(`${API_BASE_URL}/api/v1/admin/rooms`, {
                headers: headers
            }).then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Lỗi khi tải dữ liệu phòng: ${response.statusText} (${response.status})`);
                }

                const data = await response.json();
                rooms.value = Array.isArray(data) ? data : [];
            })
        ]);
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể tải danh sách phòng', life: 3000 });
        rooms.value = [];
    } finally {
        loading.value = false;
    }
};

// Gọi API khi component được mount
onMounted(() => {
    refreshRole();
    fetchData();
});

// Mở dialog thêm mới
const openNew = () => {
    room.value = {
        roomNumber: '',
        roomTypeId: null,
        floor: '1',
        notes: ''
    };
    submitted.value = false;
    roomDialog.value = true;
};

// Ẩn dialog
const hideDialog = () => {
    roomDialog.value = false;
    submitted.value = false;
    room.value = {};
};

// Lưu phòng
const saveRoom = async () => {
    submitted.value = true;

    if (!room.value.roomNumber?.trim() || !room.value.roomTypeId) {
        toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng điền đầy đủ các trường bắt buộc', life: 3000 });
        return;
    }

    try {
        let url;
        let method;
        let body;

        if (room.value.id) {
            url = `${API_BASE_URL}/api/v1/admin/rooms/${room.value.id}`;
            method = 'PUT';
        } else {
            url = `${API_BASE_URL}/api/v1/admin/rooms`;
            method = 'POST';
        }

        // Chuẩn bị dữ liệu gửi đi
        body = JSON.stringify({
            roomNumber: room.value.roomNumber,
            roomTypeId: room.value.roomTypeId,
            floor: room.value.floor,
            notes: room.value.notes
        });

        const headers = getAuthHeaders(true);
        if (!headers) return;

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Lỗi khi ${room.value.id ? 'cập nhật' : 'tạo'} phòng: ${response.statusText} (${response.status})`);
        }

        const result = await response.json();

        if (room.value.id) {
            // Cập nhật phòng trong danh sách
            const index = findIndexById(room.value.id);
            if (index !== -1) {
                rooms.value[index] = result;
            }
            toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật phòng thành công', life: 3000 });
        } else {
            // Thêm phòng mới vào danh sách
            rooms.value.push(result);
            toast.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm phòng thành công', life: 3000 });
        }

        roomDialog.value = false;
        room.value = {};
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
    }
};

// Chỉnh sửa phòng
const editRoom = async (editRoom) => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/api/v1/admin/rooms/${editRoom.id}`, {
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Không thể tải thông tin phòng: ${response.statusText} (${response.status})`);
        }

        room.value = await response.json();
        roomDialog.value = true;
    } catch (error) {
        console.error('Lỗi khi tải thông tin phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
    }
};

// Xác nhận xóa phòng
const confirmDeleteRoom = (editRoom) => {
    console.log('Xác nhận xóa phòng với ID:', editRoom.id, 'Phòng số:', editRoom.roomNumber);
    room.value = editRoom;
    console.log('room.value sau khi gán:', room.value);
    deleteRoomDialog.value = true;
};

// Xóa phòng
const deleteRoom = async () => {
    try {
        console.log('Bắt đầu xóa phòng với ID:', room.value.id, 'Phòng số:', room.value.roomNumber);
        const headers = getAuthHeaders();
        if (!headers) return;

        const apiUrl = `${API_BASE_URL}/api/v1/admin/rooms/${room.value.id}`;
        console.log('Gọi API:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: headers
        });

        console.log('Kết quả API:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Không thể xóa phòng: ${response.statusText} (${response.status})`);
        }

        // Cập nhật danh sách phòng sau khi xóa
        rooms.value = rooms.value.filter((val) => val.id !== room.value.id);
        deleteRoomDialog.value = false;
        room.value = {};
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa phòng thành công', life: 3000 });

        // Tải lại dữ liệu sau khi xóa để đảm bảo hiển thị đúng
        fetchData();
    } catch (error) {
        console.error('Lỗi khi xóa phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
    }
};

// Xác nhận xóa nhiều phòng
const confirmDeleteSelected = () => {
    if (selectedRooms.value?.length) {
        deleteRoomsDialog.value = true;
    }
};

// Xóa nhiều phòng
const deleteSelectedRooms = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const deletePromises = selectedRooms.value.map((roomToDelete) =>
            fetch(`${API_BASE_URL}/api/v1/admin/rooms/${roomToDelete.id}`, {
                method: 'DELETE',
                headers: headers
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`Lỗi khi xóa phòng ID ${roomToDelete.id}: ${response.statusText}`);
                }
                return response;
            })
        );

        await Promise.all(deletePromises);

        rooms.value = rooms.value.filter((val) => !selectedRooms.value.some((r) => r.id === val.id));
        deleteRoomsDialog.value = false;
        selectedRooms.value = null;
        toast.add({ severity: 'success', summary: 'Thành công', detail: `Xóa ${deletePromises.length} phòng thành công`, life: 3000 });

        // Tải lại dữ liệu sau khi xóa để đảm bảo hiển thị đúng
        fetchData();
    } catch (error) {
        console.error('Lỗi khi xóa nhiều phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Có lỗi xảy ra khi xóa phòng', life: 3000 });
    }
};

// Tìm index của phòng theo ID
const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < rooms.value.length; i++) {
        if (rooms.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

// Format helpers
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
    return value ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value) : '';
};

const getRoomTypeName = (roomTypeId) => {
    const roomType = roomTypes.value.find((rt) => rt.id === roomTypeId);
    return roomType ? roomType.name : '';
};
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog />

        <!-- Thông báo phân quyền cho nhân viên -->
        <div v-if="userRole === 'ROLE_EMPLOYEE'" class="p-3 mb-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg">
            <div class="flex align-items-center">
                <i class="pi pi-info-circle mr-2"></i>
                <span>Bạn đang đăng nhập với vai trò <b>Nhân viên</b>. Một số chức năng sẽ bị giới hạn.</span>
            </div>
        </div>

        <Toolbar class="mb-4">
            <template #start>
                <span class="p-input-icon-left">
                    <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." />
                </span>
            </template>
            <template #end>
                <Button v-if="permissions.canCreate" label="Thêm mới" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" v-tooltip.top="'Thêm phòng mới'" />
                <Button v-if="permissions.canDelete" label="Xóa" icon="pi pi-trash" severity="danger" class="mr-2" @click="confirmDeleteSelected" :disabled="!selectedRooms?.length" v-tooltip.top="'Xóa các phòng đã chọn'" />
            </template>
        </Toolbar>

        <div v-if="loading" class="text-center py-4">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            <div class="mt-2">Đang tải dữ liệu...</div>
        </div>

        <div v-else>
            <div v-if="rooms.length === 0" class="text-center py-4">Không có phòng nào được tìm thấy.</div>
            <div v-else>
                <div class="text-sm mb-2">Tổng số: {{ rooms.length }} phòng</div>

                <DataTable
                    :value="rooms"
                    v-model:selection="selectedRooms"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    :rowsPerPageOptions="[5, 10, 25]"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} phòng"
                    class="p-datatable-sm"
                >
                    <template #empty>Không có dữ liệu</template>
                    <template #loading>Đang tải dữ liệu...</template>

                    <Column v-if="permissions.canDelete" selectionMode="multiple" style="width: 3rem" />
                    <Column field="id" header="ID" sortable />
                    <Column field="roomNumber" header="Số phòng" sortable />
                    <Column field="floor" header="Tầng" sortable />
                    <Column field="roomTypeId" header="Loại phòng" sortable>
                        <template #body="{ data }">
                            {{ getRoomTypeName(data.roomTypeId) }}
                        </template>
                    </Column>
                    <Column field="pricePerNight" header="Giá/đêm" sortable>
                        <template #body="{ data }">
                            {{ formatCurrency(data.pricePerNight) }}
                        </template>
                    </Column>
                    <Column field="notes" header="Ghi chú">
                        <template #body="{ data }">
                            {{ data.notes || '—' }}
                        </template>
                    </Column>
                    <Column field="createdAt" header="Ngày tạo" sortable>
                        <template #body="{ data }">
                            {{ formatDate(data.createdAt) }}
                        </template>
                    </Column>
                    <Column style="width: 8rem">
                        <template #body="{ data }">
                            <Button v-if="permissions.canEdit" icon="pi pi-pencil" class="mr-2" @click="editRoom(data)" v-tooltip.top="'Chỉnh sửa phòng'" />
                            <Button v-if="permissions.canDelete" icon="pi pi-trash" severity="danger" @click="confirmDeleteRoom(data)" v-tooltip.top="'Xóa phòng'" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <Dialog v-model:visible="roomDialog" header="Thông tin phòng" :style="{ width: '800px' }" :modal="true" class="p-fluid">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label>Số phòng</label>
                            <InputText v-model.trim="room.roomNumber" class="w-full" :class="{ 'p-invalid': submitted && !room.roomNumber }" />
                            <small v-if="submitted && !room.roomNumber" class="p-error">Bắt buộc nhập</small>
                        </div>
                        <div class="mb-4">
                            <label>Tầng</label>
                            <InputText v-model.trim="room.floor" class="w-full" />
                        </div>
                        <div class="mb-4">
                            <label>Loại phòng</label>
                            <Dropdown v-model="room.roomTypeId" :options="roomTypes" optionLabel="name" optionValue="id" class="w-full" :class="{ 'p-invalid': submitted && !room.roomTypeId }" placeholder="Chọn loại phòng" />
                            <small v-if="submitted && !room.roomTypeId" class="p-error">Bắt buộc chọn</small>
                        </div>
                    </div>
                </div>
                <div class="field">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label>Ghi chú</label>
                            <InputText v-model="room.notes" class="w-full" />
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" v-tooltip.bottom="'Hủy thay đổi'" />
                <Button label="Lưu" icon="pi pi-check" @click="saveRoom" v-tooltip.bottom="'Lưu thay đổi'" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoomDialog" header="Xác nhận" :style="{ width: '450px' }" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span>Bạn có chắc muốn xóa phòng {{ room.roomNumber }}?</span>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteRoomDialog = false" v-tooltip.bottom="'Hủy thao tác'" />
                <Button label="Có" icon="pi pi-check" text @click="deleteRoom" v-tooltip.bottom="'Xác nhận xóa phòng'" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoomsDialog" header="Xác nhận" :style="{ width: '450px' }" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span>Bạn có chắc muốn xóa {{ selectedRooms?.length }} phòng?</span>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteRoomsDialog = false" v-tooltip.bottom="'Hủy thao tác'" />
                <Button label="Có" icon="pi pi-check" text @click="deleteSelectedRooms" v-tooltip.bottom="'Xác nhận xóa các phòng đã chọn'" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.card {
    padding: 1rem;
    background: var(--surface-card);
    border-radius: 10px;
    margin-bottom: 1rem;
}

.field {
    margin-bottom: 1rem;
    width: 100%;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-inputnumber-input),
:deep(.p-calendar),
:deep(.p-multiselect) {
    width: 100% !important;
    min-height: 40px;
}

:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-multiselect),
:deep(.p-inputnumber) {
    display: flex;
    width: 100% !important;
}

:deep(.p-dropdown-panel),
:deep(.p-calendar-panel),
:deep(.p-multiselect-panel) {
    width: auto !important;
    min-width: 100%;
}

:deep(.p-dropdown-items-wrapper),
:deep(.p-datepicker),
:deep(.p-multiselect-items-wrapper) {
    width: 100%;
}

:deep(.p-dropdown-label),
:deep(.p-multiselect-label) {
    display: flex;
    align-items: center;
}

:deep(.p-dialog-content) {
    overflow-y: visible;
}

:deep(.p-button) {
    font-size: 0.95rem;
    min-height: 40px;
}
</style>
