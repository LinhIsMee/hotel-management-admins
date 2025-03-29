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
import MultiSelect from 'primevue/multiselect';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';

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

// Trạng thái phòng theo tài liệu API
const statuses = ref([
    { label: 'Trống', value: 'VACANT' },
    { label: 'Đang có khách', value: 'OCCUPIED' },
    { label: 'Bảo trì', value: 'MAINTENANCE' },
    { label: 'Đang dọn dẹp', value: 'CLEANING' }
]);

// Đặc điểm đặc biệt có sẵn
const availableSpecialFeatures = ref([
    { name: 'View thành phố', value: 'View thành phố' },
    { name: 'View biển', value: 'View biển' },
    { name: 'View biển toàn cảnh', value: 'View biển toàn cảnh' },
    { name: 'Ban công', value: 'Ban công' },
    { name: 'Ban công lớn', value: 'Ban công lớn' },
    { name: 'Bếp nhỏ', value: 'Bếp nhỏ' },
    { name: 'Phòng khách riêng', value: 'Phòng khách riêng' },
    { name: 'Phòng ăn riêng', value: 'Phòng ăn riêng' },
    { name: 'Bồn tắm spa', value: 'Bồn tắm spa' }
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

// Lấy danh sách loại phòng từ API
const fetchRoomTypes = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/api/v1/admin/room-types`, {
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

// Khởi tạo dữ liệu phòng từ file JSON
const initRooms = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        // Đảm bảo trước tiên phải khởi tạo dữ liệu loại phòng
        await fetch(`${API_BASE_URL}/api/v1/admin/room-types/init`, {
            method: 'POST',
            headers: headers
        });

        // Sau đó khởi tạo dữ liệu phòng
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/rooms/init`, {
            method: 'POST',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi khởi tạo dữ liệu phòng: ${response.statusText} (${response.status})`);
        }

        const result = await response.text();
        toast.add({ severity: 'success', summary: 'Thành công', detail: result, life: 3000 });

        // Tải lại dữ liệu sau khi khởi tạo
        fetchData();
    } catch (error) {
        console.error('Lỗi khi khởi tạo dữ liệu:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
    }
};

// Gọi API khi component được mount
onMounted(() => {
    fetchData();
});

// Mở dialog thêm mới
const openNew = () => {
    room.value = {
        roomNumber: '',
        roomTypeId: null,
        status: 'VACANT',
        floor: '1',
        isActive: true,
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
            // Cập nhật phòng hiện có
            url = `${API_BASE_URL}/api/v1/admin/rooms/${room.value.id}`;
            method = 'PUT';
        } else {
            // Tạo phòng mới
            url = `${API_BASE_URL}/api/v1/admin/rooms`;
            method = 'POST';
        }

        // Chuẩn bị dữ liệu gửi đi
        body = JSON.stringify({
            roomNumber: room.value.roomNumber,
            roomTypeId: room.value.roomTypeId,
            status: room.value.status,
            floor: room.value.floor,
            isActive: room.value.isActive,
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
    room.value = editRoom;
    deleteRoomDialog.value = true;
};

// Xóa phòng
const deleteRoom = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/api/v1/admin/rooms/${room.value.id}`, {
            method: 'DELETE',
            headers: headers
        });

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

const getStatusSeverity = (status) => {
    const statusMap = {
        VACANT: 'success',
        OCCUPIED: 'warning',
        MAINTENANCE: 'danger',
        CLEANING: 'info'
    };
    return statusMap[status] || null;
};

const getStatusLabel = (status) => {
    return statuses.value.find((s) => s.value === status)?.label || status;
};

const formatSpecialFeatures = (features) => {
    if (!features) return 'Không có';
    return Array.isArray(features) && features.length > 0 ? features.join(', ') : 'Không có';
};
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog />

        <Toolbar class="mb-4">
            <template #start>
                <Button label="Thêm mới" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                <Button label="Xóa" icon="pi pi-trash" severity="danger" class="mr-2" @click="confirmDeleteSelected" :disabled="!selectedRooms?.length" />
                <Button label="Khởi tạo dữ liệu mẫu" icon="pi pi-sync" severity="help" @click="initRooms" />
            </template>
            <template #end>
                <span class="p-input-icon-left">
                    <i class="pi pi-search"></i>
                    <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." />
                </span>
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

                    <Column selectionMode="multiple" style="width: 3rem" />
                    <Column field="id" header="ID" sortable />
                    <Column field="roomNumber" header="Số phòng" sortable />
                    <Column field="floor" header="Tầng" sortable />
                    <Column field="roomTypeId" header="Loại phòng" sortable>
                        <template #body="{ data }">
                            {{ getRoomTypeName(data.roomTypeId) }}
                        </template>
                    </Column>
                    <Column field="status" header="Trạng thái" sortable>
                        <template #body="{ data }">
                            <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
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
                    <Column field="isActive" header="Hoạt động" sortable>
                        <template #body="{ data }">
                            <i :class="['pi', data.isActive ? 'pi-check' : 'pi-times']" />
                        </template>
                    </Column>
                    <Column style="width: 8rem">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" class="mr-2" @click="editRoom(data)" />
                            <Button icon="pi pi-trash" severity="danger" @click="confirmDeleteRoom(data)" />
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
                            <label>Trạng thái</label>
                            <Dropdown v-model="room.status" :options="statuses" optionLabel="label" optionValue="value" class="w-full" placeholder="Chọn trạng thái" />
                        </div>
                        <div class="mb-4">
                            <label>Ghi chú</label>
                            <InputText v-model="room.notes" class="w-full" />
                        </div>
                        <div class="mb-4">
                            <label>Hoạt động</label>
                            <div class="flex items-center">
                                <InputSwitch v-model="room.isActive" />
                                <span class="ml-2">{{ room.isActive ? 'Đang hoạt động' : 'Không hoạt động' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Lưu" icon="pi pi-check" @click="saveRoom" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoomDialog" header="Xác nhận" :style="{ width: '450px' }" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span>Bạn có chắc muốn xóa phòng {{ room.roomNumber }}?</span>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteRoomDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteRoom" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoomsDialog" header="Xác nhận" :style="{ width: '450px' }" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span>Bạn có chắc muốn xóa {{ selectedRooms?.length }} phòng?</span>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteRoomsDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteSelectedRooms" />
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


