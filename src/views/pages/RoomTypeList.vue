<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';

const roomTypes = ref([]);
const loading = ref(true);
const roomTypeDialog = ref(false);
const deleteRoomTypeDialog = ref(false);
const deleteRoomTypesDialog = ref(false);
const roomType = ref({});
const selectedRoomTypes = ref(null);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const fetchData = async () => {
    try {
        loading.value = true;
        const response = await fetch('/demo/data/room-types.json');
        const data = await response.json();
        roomTypes.value = data.data;
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
    roomType.value = {
        isActive: true,
        amenities: [],
        maxOccupancy: 1,
        pricePerNight: 0
    };
    submitted.value = false;
    roomTypeDialog.value = true;
};
const hideDialog = () => {
    roomTypeDialog.value = false;
    submitted.value = false;
};

const saveRoomType = () => {
    submitted.value = true;

    if (roomType.value.name?.trim() && roomType.value.code?.trim() && roomType.value.pricePerNight > 0) {
        if (roomType.value.id) {
            const index = findIndexById(roomType.value.id);
            roomTypes.value[index] = { ...roomType.value };
        } else {
            roomType.value.id = createId();
            roomType.value.createdAt = new Date().toISOString().split('T')[0];
            roomType.value.imageUrl = '/assets/images/nha-nghi-1.webp';
            roomTypes.value.push(roomType.value);
        }

        roomTypeDialog.value = false;
        roomType.value = {};
    }
};

const editRoomType = (editRoomType) => {
    roomType.value = { ...editRoomType };
    roomTypeDialog.value = true;
};

const confirmDeleteRoomType = (editRoomType) => {
    roomType.value = editRoomType;
    deleteRoomTypeDialog.value = true;
};

const deleteRoomType = () => {
    roomTypes.value = roomTypes.value.filter((val) => val.id !== roomType.value.id);
    deleteRoomTypeDialog.value = false;
    roomType.value = {};
};

const confirmDeleteSelected = () => {
    deleteRoomTypesDialog.value = true;
};
const deleteSelectedRoomTypes = () => {
    roomTypes.value = roomTypes.value.filter((val) => !selectedRoomTypes.value.includes(val));
    deleteRoomTypesDialog.value = false;
    selectedRoomTypes.value = null;
};
const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < roomTypes.value.length; i++) {
        if (roomTypes.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};
const createId = () => {
    let id = 1;
    if (roomTypes.value && roomTypes.value.length > 0) {
        const maxId = Math.max(...roomTypes.value.map((roomType) => roomType.id));
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

const formatAmenities = (amenities) => {
    if (amenities && amenities.length > 0) {
        return amenities.join(', ');
    }
    return 'Không có';
};
const availableAmenities = ref([
    { name: 'TV', value: 'TV' },
    { name: 'Điều hòa', value: 'Điều hòa' },
    { name: 'Wifi', value: 'Wifi' },
    { name: 'Minibar', value: 'Minibar' },
    { name: 'Bồn tắm', value: 'Bồn tắm' },
    { name: 'Tủ lạnh', value: 'Tủ lạnh' },
    { name: 'Máy pha cà phê', value: 'Máy pha cà phê' },
    { name: 'Phòng khách riêng', value: 'Phòng khách riêng' },
    { name: 'Phòng ăn riêng', value: 'Phòng ăn riêng' },
    { name: 'Ban công', value: 'Ban công' },
    { name: 'Bể sục', value: 'Bể sục' }
]);

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
                        <Button label="Xóa" icon="pi pi-trash" class="mr-2" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedRoomTypes || !selectedRoomTypes.length" />
                    </div>
                </template>

                <template v-slot:end>
                    <span class="p-input-icon-left">
                        <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
                    </span>
                </template>
            </Toolbar>

            <DataTable
                :value="roomTypes"
                v-model:selection="selectedRoomTypes"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :loading="loading"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} loại phòng"
                responsiveLayout="scroll"
                class="p-datatable-sm"
            >
                <template #empty>Không có loại phòng nào được tìm thấy.</template>
                <template #loading>Đang tải dữ liệu loại phòng. Vui lòng đợi.</template>

                <Column selectionMode="multiple" exportable="false" style="min-width: 3rem"></Column>

                <Column field="id" header="ID" sortable style="min-width: 4rem"></Column>

                <Column field="name" header="Tên loại phòng" sortable style="min-width: 14rem">
                    <template #body="{ data }">
                        <div class="flex align-items-center gap-2">
                            <img :src="'' + data.imageUrl" :alt="data.name" class="h-16 shadow-4 rounded-lg" />
                            <span>{{ data.name }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="code" header="Mã" sortable style="min-width: 8rem"></Column>

                <Column field="description" header="Mô tả" sortable style="min-width: 16rem">
                    <template #body="{ data }">
                        <span>{{ data.description }}</span>
                    </template>
                </Column>

                <Column field="pricePerNight" header="Giá/đêm" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ formatCurrency(data.pricePerNight) }}
                    </template>
                </Column>

                <Column field="maxOccupancy" header="Sức chứa tối đa" sortable style="min-width: 10rem">
                    <template #body="{ data }"> {{ data.maxOccupancy }} người </template>
                </Column>

                <Column field="amenities" header="Tiện nghi" style="min-width: 12rem">
                    <template #body="{ data }">
                        <div class="flex align-items-center gap-2">
                            <Tooltip v-if="data.amenities.length > 3">
                                <template #target>
                                    <span>{{ data.amenities.slice(0, 3).join(', ') }} <i class="pi pi-ellipsis-h ml-1"></i></span>
                                </template>
                                <div>
                                    {{ formatAmenities(data.amenities) }}
                                </div>
                            </Tooltip>
                            <span v-else>{{ formatAmenities(data.amenities) }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="isActive" header="Trạng thái" sortable style="min-width: 6rem">
                    <template #body="{ data }">
                        <Tag :value="data.isActive ? 'Hoạt động' : 'Vô hiệu hóa'" :severity="getSeverity(data.isActive)" />
                    </template>
                </Column>

                <Column field="createdAt" header="Ngày tạo" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ formatDate(data.createdAt) }}
                    </template>
                </Column>

                <Column exportable="false" style="min-width: 8rem">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" outlined class="mr-2" @click="editRoomType(data)" />
                        <Button icon="pi pi-trash" outlined severity="danger" @click="confirmDeleteRoomType(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="roomTypeDialog" :style="{ width: '800px' }" header="Thông tin loại phòng" :modal="true" class="p-fluid">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div class="field w-full">
                    <div class="p-4 rounded-lg w-full">
                        <div class="mb-4 w-full">
                            <label for="name" class="font-bold mb-2 block">Tên loại phòng</label>
                            <InputText id="name" v-model.trim="roomType.name" required class="w-full" :class="{ 'p-invalid': submitted && !roomType.name }" />
                            <small class="p-error" v-if="submitted && !roomType.name">Tên loại phòng là bắt buộc.</small>
                        </div>

                        <div class="mb-4 w-full">
                            <label for="code" class="font-bold mb-2 block">Mã loại phòng</label>
                            <InputText id="code" v-model.trim="roomType.code" required class="w-full" :class="{ 'p-invalid': submitted && !roomType.code }" />
                            <small class="p-error" v-if="submitted && !roomType.code">Mã loại phòng là bắt buộc.</small>
                        </div>

                        <div class="mb-4 w-full">
                            <label for="isActive" class="font-bold mb-2 block">Trạng thái</label>
                            <div class="field-checkbox">
                                <InputSwitch id="isActive" v-model="roomType.isActive" />
                                <label for="isActive" class="ml-2">{{ roomType.isActive ? 'Đang hoạt động' : 'Vô hiệu hóa' }}</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="field w-full">
                    <div class="p-4 rounded-lg w-full">
                        <div class="mb-4 w-full">
                            <label for="pricePerNight" class="font-bold mb-2 block">Giá mỗi đêm</label>
                            <InputNumber
                                id="pricePerNight"
                                v-model="roomType.pricePerNight"
                                mode="currency"
                                currency="VND"
                                locale="vi-VN"
                                :minFractionDigits="0"
                                :maxFractionDigits="0"
                                class="w-full"
                                :class="{ 'p-invalid': submitted && !roomType.pricePerNight }"
                            />
                            <small class="p-error" v-if="submitted && !roomType.pricePerNight">Giá mỗi đêm là bắt buộc.</small>
                        </div>

                        <div class="mb-4 w-full">
                            <label for="maxOccupancy" class="font-bold mb-2 block">Sức chứa tối đa</label>
                            <InputNumber id="maxOccupancy" v-model="roomType.maxOccupancy" showButtons :min="1" :max="10" class="w-full" />
                        </div>

                        <div class="mb-4 w-full">
                            <label for="roomSize" class="font-bold mb-2 block">Diện tích (m²)</label>
                            <InputNumber id="roomSize" v-model="roomType.roomSize" :min="0" :step="0.5" class="w-full" />
                        </div>
                    </div>
                </div>

                <div class="col-span-2 w-full">
                    <div class="p-4 rounded-lg w-full">
                        <div class="mb-4 w-full">
                            <label for="description" class="font-bold mb-2 block">Mô tả</label>
                            <Textarea id="description" v-model="roomType.description" rows="3" autoResize class="w-full" />
                        </div>

                        <div class="mb-4 w-full">
                            <label for="amenities" class="font-bold mb-2 block">Tiện nghi</label>
                            <MultiSelect id="amenities" v-model="roomType.amenities" :options="availableAmenities" optionLabel="name" optionValue="value" display="chip" placeholder="Chọn tiện nghi" class="w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Lưu" icon="pi pi-check" text @click="saveRoomType" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoomTypeDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="roomType"
                    >Bạn có chắc chắn muốn xóa loại phòng <b>{{ roomType.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteRoomTypeDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteRoomType" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoomTypesDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="selectedRoomTypes && selectedRoomTypes.length > 0">Bạn có chắc chắn muốn xóa {{ selectedRoomTypes.length }} loại phòng đã chọn?</span>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteRoomTypesDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteSelectedRoomTypes" />
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
:deep(.p-calendar),
:deep(.p-multiselect),
:deep(.p-inputnumber),
:deep(.p-textarea) {
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
