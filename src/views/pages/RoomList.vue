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

// Trạng thái và sạch sẽ
const statuses = ref([
    { label: 'Trống', value: 'VACANT' },
    { label: 'Đã đặt', value: 'BOOKED' },
    { label: 'Đang sử dụng', value: 'OCCUPIED' },
    { label: 'Bảo trì', value: 'MAINTENANCE' }
]);

const cleanStatuses = ref([
    { label: 'Cần dọn dẹp', value: 'NEEDS_CLEANING' },
    { label: 'Đang dọn dẹp', value: 'CLEANING' },
    { label: 'Đã dọn dẹp', value: 'CLEANED' }
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

// Lấy dữ liệu từ file JSON
const fetchData = async () => {
    try {
        loading.value = true;
        const [roomsResponse, roomTypesResponse] = await Promise.all([fetch('/demo/data/rooms.json'), fetch('/demo/data/room-types.json')]);

        const roomsData = await roomsResponse.json();
        const roomTypesData = await roomTypesResponse.json();

        rooms.value = roomsData.data;
        roomTypes.value = roomTypesData.data;
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        loading.value = false;
    }
};

// Gọi API khi component được mount
onMounted(() => {
    fetchData();
});

// Mở dialog thêm mới
const openNew = () => {
    room.value = {
        status: 'VACANT',
        cleanStatus: 'CLEANED',
        isActive: true,
        floor: 1,
        specialFeatures: [],
        maxOccupancy: 1,
        pricePerNight: 500000
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
const saveRoom = () => {
    submitted.value = true;

    if (!room.value.roomNumber?.trim() || !room.value.roomTypeId) {
        return;
    }

    const roomData = { ...room.value };

    if (roomData.id) {
        // Cập nhật phòng
        const index = rooms.value.findIndex((r) => r.id === roomData.id);
        if (index !== -1) {
            rooms.value[index] = roomData;
        }
    } else {
        // Thêm mới phòng
        roomData.id = rooms.value.length ? Math.max(...rooms.value.map((r) => r.id)) + 1 : 1;
        roomData.createdAt = new Date().toISOString().split('T')[0];
        roomData.lastCleaningDate = roomData.lastCleaningDate || new Date().toISOString().split('T')[0];
        rooms.value.push(roomData);
    }

    roomDialog.value = false;
    room.value = {};
};

// Chỉnh sửa phòng
const editRoom = (editRoom) => {
    room.value = { ...editRoom };
    roomDialog.value = true;
};

// Xóa phòng
const confirmDeleteRoom = (editRoom) => {
    room.value = editRoom;
    deleteRoomDialog.value = true;
};

const deleteRoom = () => {
    rooms.value = rooms.value.filter((val) => val.id !== room.value.id);
    deleteRoomDialog.value = false;
    room.value = {};
};

// Xóa nhiều phòng
const confirmDeleteSelected = () => {
    if (selectedRooms.value?.length) {
        deleteRoomsDialog.value = true;
    }
};

const deleteSelectedRooms = () => {
    rooms.value = rooms.value.filter((val) => !selectedRooms.value.some((sr) => sr.id === val.id));
    deleteRoomsDialog.value = false;
    selectedRooms.value = null;
};

// Format helpers
const formatDate = (value) => {
    if (value) {
        const date = new Date(value);
        return date.toLocaleDateString('vi-VN');
    }
    return '';
};

const formatCurrency = (value) => {
    return value ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value) : '';
};

const getRoomTypeName = (roomTypeId) => {
    return roomTypes.value.find((rt) => rt.id === roomTypeId)?.name || '';
};

const getStatusSeverity = (status) => {
    const statusMap = {
        VACANT: 'success',
        BOOKED: 'info',
        OCCUPIED: 'warning',
        MAINTENANCE: 'danger'
    };
    return statusMap[status] || null;
};

const getCleanStatusSeverity = (status) => {
    const cleanStatusMap = {
        CLEANED: 'success',
        CLEANING: 'warning',
        NEEDS_CLEANING: 'danger'
    };
    return cleanStatusMap[status] || null;
};

const formatSpecialFeatures = (features) => {
    return features?.length ? features.join(', ') : 'Không có';
};
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog />

        <Toolbar class="mb-4">
            <template #start>
                <Button label="Thêm mới" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                <Button label="Xóa" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedRooms?.length" />
            </template>
            <template #end>
                <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." />
            </template>
        </Toolbar>

        <DataTable
            :value="rooms"
            v-model:selection="selectedRooms"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :loading="loading"
            :filters="filters"
            :rowsPerPageOptions="[5, 10, 25]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} phòng"
        >
            <template #empty>Không có dữ liệu</template>
            <template #loading>Đang tải dữ liệu...</template>

            <Column selectionMode="multiple" style="width: 3rem" />
            <Column field="roomNumber" header="Số phòng" sortable />
            <Column field="floor" header="Tầng" sortable />
            <Column field="roomTypeId" header="Loại phòng" sortable>
                <template #body="{ data }">
                    {{ getRoomTypeName(data.roomTypeId) }}
                </template>
            </Column>
            <Column field="status" header="Trạng thái" sortable>
                <template #body="{ data }">
                    <Tag :value="statuses.find((s) => s.value === data.status)?.label" :severity="getStatusSeverity(data.status)" />
                </template>
            </Column>
            <Column field="cleanStatus" header="Trạng thái dọn dẹp" sortable>
                <template #body="{ data }">
                    <Tag :value="cleanStatuses.find((cs) => cs.value === data.cleanStatus)?.label" :severity="getCleanStatusSeverity(data.cleanStatus)" />
                </template>
            </Column>
            <Column field="pricePerNight" header="Giá/đêm" sortable>
                <template #body="{ data }">
                    {{ formatCurrency(data.pricePerNight) }}
                </template>
            </Column>
            <Column field="maxOccupancy" header="Sức chứa" sortable />
            <Column field="specialFeatures" header="Đặc điểm">
                <template #body="{ data }">
                    {{ formatSpecialFeatures(data.specialFeatures) }}
                </template>
            </Column>
            <Column field="lastCleaningDate" header="Ngày dọn dẹp" sortable>
                <template #body="{ data }">
                    {{ formatDate(data.lastCleaningDate) }}
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
                            <InputNumber v-model="room.floor" :min="1" class="w-full" />
                        </div>
                        <div class="mb-4">
                            <label>Loại phòng</label>
                            <Dropdown v-model="room.roomTypeId" :options="roomTypes" optionLabel="name" optionValue="id" class="w-full" :class="{ 'p-invalid': submitted && !room.roomTypeId }" />
                            <small v-if="submitted && !room.roomTypeId" class="p-error">Bắt buộc chọn</small>
                        </div>
                        <div class="">
                            <label>Ngày dọn dẹp</label>
                            <Calendar v-model="room.lastCleaningDate" dateFormat="dd/mm/yy" class="w-full" showIcon />
                        </div>
                    </div>
                </div>
                <div class="field">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label>Trạng thái</label>
                            <Dropdown v-model="room.status" :options="statuses" optionLabel="label" optionValue="value" class="w-full" />
                        </div>
                        <div class="mb-4">
                            <label>Giá/đêm</label>
                            <InputNumber v-model="room.pricePerNight" mode="currency" currency="VND" locale="vi-VN" class="w-full" />
                        </div>
                        <div class="mb-4">
                            <label>Sức chứa</label>
                            <InputNumber v-model="room.maxOccupancy" :min="1" class="w-full" />
                        </div>
                        <div class="">
                            <label>Trạng thái dọn dẹp</label>
                            <Dropdown v-model="room.cleanStatus" :options="cleanStatuses" optionLabel="label" optionValue="value" class="w-full" />
                        </div>
                    </div>
                </div>
                <div class="col-span-2 mt-[-2em]">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label>Đặc điểm</label>
                            <MultiSelect v-model="room.specialFeatures" :options="availableSpecialFeatures" optionLabel="name" optionValue="value" display="chip" class="w-full" />
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
