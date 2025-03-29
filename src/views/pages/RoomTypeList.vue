<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// Import các component PrimeVue
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import Tooltip from 'primevue/tooltip';

const API_BASE_URL = 'http://localhost:5173';
const toast = useToast();

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

        const response = await fetch(`${API_BASE_URL}/api/v1/admin/room-types`, {
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi tải danh sách loại phòng: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();
        console.log('Dữ liệu nhận được từ API:', data);
        roomTypes.value = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể tải danh sách loại phòng', life: 3000 });
        roomTypes.value = [];
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

const saveRoomType = async () => {
    submitted.value = true;

    if (roomType.value.name?.trim() && roomType.value.code?.trim() && roomType.value.pricePerNight > 0) {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return;

            let url = '';
            let method = '';

            // Kiểm tra xem đang tạo mới hay cập nhật
            if (roomType.value.id) {
                // Cập nhật loại phòng
                url = `${API_BASE_URL}/api/v1/admin/room-types/${roomType.value.id}`;
                method = 'PUT';
            } else {
                // Tạo mới loại phòng
                url = `${API_BASE_URL}/api/v1/admin/room-types`;
                method = 'POST';
            }

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(roomType.value)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi khi ${roomType.value.id ? 'cập nhật' : 'tạo'} loại phòng`);
            }

            const savedRoomType = await response.json();

            // Cập nhật dữ liệu trong bảng
            if (roomType.value.id) {
                const index = findIndexById(roomType.value.id);
                if (index !== -1) {
                    roomTypes.value[index] = savedRoomType;
                }
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật loại phòng thành công', life: 3000 });
            } else {
                roomTypes.value.push(savedRoomType);
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm loại phòng thành công', life: 3000 });
            }

            roomTypeDialog.value = false;
            roomType.value = {};
        } catch (error) {
            console.error('Lỗi khi lưu loại phòng:', error);
            toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
        }
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

const deleteRoomType = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/api/v1/admin/room-types/${roomType.value.id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi xóa loại phòng: ${response.statusText}`);
        }

        // Cập nhật trạng thái trong giao diện
        roomTypes.value = roomTypes.value.filter((val) => val.id !== roomType.value.id);
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa loại phòng thành công', life: 3000 });

        deleteRoomTypeDialog.value = false;
        roomType.value = {};
    } catch (error) {
        console.error('Lỗi khi xóa loại phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
    }
};

const confirmDeleteSelected = () => {
    deleteRoomTypesDialog.value = true;
};
const deleteSelectedRoomTypes = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const deletePromises = selectedRoomTypes.value.map((roomTypeToDelete) =>
            fetch(`${API_BASE_URL}/api/v1/admin/room-types/${roomTypeToDelete.id}`, {
                method: 'DELETE',
                headers: headers
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`Lỗi khi xóa loại phòng ID ${roomTypeToDelete.id}: ${response.statusText}`);
                }
                return response;
            })
        );

        await Promise.all(deletePromises);

        roomTypes.value = roomTypes.value.filter((val) => !selectedRoomTypes.value.some((r) => r.id === val.id));
        toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã vô hiệu hóa ${deletePromises.length} loại phòng`, life: 3000 });
        deleteRoomTypesDialog.value = false;
        selectedRoomTypes.value = null;

        // Tải lại dữ liệu sau khi xóa
        fetchData();
    } catch (error) {
        console.error('Lỗi khi xóa nhiều loại phòng:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Có lỗi xảy ra khi xóa loại phòng', life: 3000 });
    }
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

const formatAmenities = (amenities) => {
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
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
                            <Tooltip v-if="data.amenities && Array.isArray(data.amenities) && data.amenities.length > 3">
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
