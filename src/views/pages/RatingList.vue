<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';

// Khai báo biến
const reviews = ref([]);
const loading = ref(true);
const reviewDialog = ref(false);
const deleteReviewDialog = ref(false);
const deleteReviewsDialog = ref(false);
const review = ref({});
const selectedReviews = ref(null);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

// Loại đánh giá
const reviewTypes = ref([
    { name: 'Về phòng', value: 'ROOM' },
    { name: 'Về dịch vụ', value: 'SERVICE' },
    { name: 'Về nhân viên', value: 'STAFF' },
    { name: 'Về cơ sở vật chất', value: 'FACILITY' },
    { name: 'Tổng thể', value: 'OVERALL' }
]);

// Trạng thái đánh giá
const statuses = ref([
    { name: 'Đã duyệt', value: 'APPROVED' },
    { name: 'Đang xem xét', value: 'PENDING' },
    { name: 'Đã từ chối', value: 'REJECTED' }
]);

// Lấy dữ liệu từ file JSON hoặc dùng dữ liệu mẫu
const fetchData = async () => {
    try {
        loading.value = true;
        const response = await fetch('/demo/data/ratings.json');
        const data = await response.json();
        reviews.value = data.data;
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});

const openNew = () => {
    review.value = {
        rating: 3,
        type: 'OVERALL',
        status: 'PENDING'
    };
    submitted.value = false;
    reviewDialog.value = true;
};

const hideDialog = () => {
    reviewDialog.value = false;
    submitted.value = false;
};

const saveReview = () => {
    submitted.value = true;

    if (review.value.guestName?.trim() && review.value.comment?.trim() && review.value.rating) {
        if (review.value.id) {
            const index = findIndexById(review.value.id);
            reviews.value[index] = { ...review.value };
        } else {
            review.value.id = createId();
            review.value.createdAt = new Date().toISOString().split('T')[0];
            reviews.value.push(review.value);
        }

        reviewDialog.value = false;
        review.value = {};
    }
};

const editReview = (editReview) => {
    review.value = { ...editReview };
    reviewDialog.value = true;
};

const confirmDeleteReview = (editReview) => {
    review.value = editReview;
    deleteReviewDialog.value = true;
};

const deleteReview = () => {
    reviews.value = reviews.value.filter((val) => val.id !== review.value.id);
    deleteReviewDialog.value = false;
    review.value = {};
};

const confirmDeleteSelected = () => {
    deleteReviewsDialog.value = true;
};

const deleteSelectedReviews = () => {
    reviews.value = reviews.value.filter((val) => !selectedReviews.value.includes(val));
    deleteReviewsDialog.value = false;
    selectedReviews.value = null;
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < reviews.value.length; i++) {
        if (reviews.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const createId = () => {
    let id = 1;
    if (reviews.value && reviews.value.length > 0) {
        const maxId = Math.max(...reviews.value.map((review) => review.id));
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

const getReviewTypeName = (typeValue) => {
    const type = reviewTypes.value.find((t) => t.value === typeValue);
    return type ? type.name : '';
};

const getStatusName = (statusValue) => {
    const status = statuses.value.find((s) => s.value === statusValue);
    return status ? status.name : statusValue;
};

const getSeverity = (status) => {
    switch (status) {
        case 'APPROVED':
            return 'success';
        case 'PENDING':
            return 'warning';
        case 'REJECTED':
            return 'danger';
        default:
            return null;
    }
};

const getRatingSeverity = (rating) => {
    switch (rating) {
        case 5:
            return 'success';
        case 4:
            return 'info';
        case 3:
            return 'warning';
        case 2:
        case 1:
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
                        <Button label="Xóa" icon="pi pi-trash" class="mr-2" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedReviews || !selectedReviews.length" />
                    </div>
                </template>

                <template v-slot:end>
                    <span class="p-input-icon-left">
                        <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
                    </span>
                </template>
            </Toolbar>

            <DataTable
                :value="reviews"
                v-model:selection="selectedReviews"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :loading="loading"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} đánh giá"
                responsiveLayout="scroll"
                class="p-datatable-sm"
            >
                <template #empty>Không có đánh giá nào được tìm thấy.</template>
                <template #loading>Đang tải dữ liệu đánh giá. Vui lòng đợi.</template>

                <Column selectionMode="multiple" exportable="false" style="min-width: 3rem"></Column>

                <Column field="id" header="ID" sortable style="min-width: 4rem"></Column>

                <Column field="guestName" header="Tên khách hàng" sortable style="min-width: 12rem"></Column>

                <Column field="roomNumber" header="Phòng" sortable style="min-width: 6rem"></Column>

                <Column field="type" header="Loại đánh giá" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ getReviewTypeName(data.type) }}
                    </template>
                </Column>

                <Column field="rating" header="Điểm đánh giá" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        <div class="flex align-items-center">
                            <Rating :modelValue="data.rating" readonly :cancel="false" />
                            <Tag :value="data.rating + ' sao'" :severity="getRatingSeverity(data.rating)" class="ml-2" />
                        </div>
                    </template>
                </Column>

                <Column field="comment" header="Nội dung" sortable style="min-width: 16rem">
                    <template #body="{ data }">
                        <div class="line-clamp-2">{{ data.comment }}</div>
                    </template>
                </Column>

                <Column field="status" header="Trạng thái" sortable style="min-width: 8rem">
                    <template #body="{ data }">
                        <Tag :value="getStatusName(data.status)" :severity="getSeverity(data.status)" />
                    </template>
                </Column>

                <Column field="createdAt" header="Ngày đánh giá" sortable style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ formatDate(data.createdAt) }}
                    </template>
                </Column>

                <Column exportable="false" style="min-width: 8rem">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" outlined class="mr-2" @click="editReview(data)" />
                        <Button icon="pi pi-trash" outlined severity="danger" @click="confirmDeleteReview(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="reviewDialog" :style="{ width: '800px' }" header="Thông tin đánh giá" :modal="true" class="p-fluid">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label for="guestName" class="font-bold mb-2 block">Tên khách hàng</label>
                            <InputText id="guestName" v-model.trim="review.guestName" required class="w-full" :class="{ 'p-invalid': submitted && !review.guestName }" />
                            <small class="p-error" v-if="submitted && !review.guestName">Tên khách hàng là bắt buộc.</small>
                        </div>

                        <div class="mb-4">
                            <label for="roomNumber" class="font-bold mb-2 block">Số phòng</label>
                            <InputText id="roomNumber" v-model.trim="review.roomNumber" required class="w-full" :class="{ 'p-invalid': submitted && !review.roomNumber }" />
                        </div>

                        <div class="mb-4">
                            <label for="type" class="font-bold mb-2 block">Loại đánh giá</label>
                            <Dropdown id="type" v-model="review.type" :options="reviewTypes" optionLabel="name" optionValue="value" placeholder="Chọn loại đánh giá" class="w-full" />
                        </div>

                        <div class="mb-4">
                            <label for="rating" class="font-bold mb-2 block">Điểm đánh giá</label>
                            <div class="flex align-items-center">
                                <Rating id="rating" v-model="review.rating" :cancel="false" />
                                <span class="ml-2 font-medium">{{ review.rating }}/5</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="field">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label for="status" class="font-bold mb-2 block">Trạng thái</label>
                            <Dropdown id="status" v-model="review.status" :options="statuses" optionLabel="name" optionValue="value" placeholder="Chọn trạng thái" class="w-full" />
                        </div>

                        <div class="mb-4">
                            <label for="createdAt" class="font-bold mb-2 block">Ngày đánh giá</label>
                            <Calendar v-if="review.id" id="createdAt" v-model="review.createdAt" dateFormat="dd/mm/yy" placeholder="Chọn ngày" showIcon class="w-full" disabled />
                            <Calendar v-else id="createdAt" v-model="review.createdAt" dateFormat="dd/mm/yy" placeholder="Hôm nay" showIcon class="w-full" />
                        </div>
                    </div>
                </div>

                <div class="col-span-2">
                    <div class="p-4 rounded-lg">
                        <h3 class="text-xl font-medium mb-4">Chi tiết đánh giá</h3>

                        <div class="mb-4">
                            <label for="comment" class="font-bold mb-2 block">Nội dung đánh giá</label>
                            <Textarea id="comment" v-model="review.comment" rows="3" autoResize class="w-full" :class="{ 'p-invalid': submitted && !review.comment }" />
                            <small class="p-error" v-if="submitted && !review.comment">Nội dung đánh giá là bắt buộc.</small>
                        </div>

                        <div class="mb-4">
                            <label for="response" class="font-bold mb-2 block">Phản hồi của khách sạn</label>
                            <Textarea id="response" v-model="review.response" rows="3" autoResize class="w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Lưu" icon="pi pi-check" text @click="saveReview" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteReviewDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="review"
                    >Bạn có chắc chắn muốn xóa đánh giá của <b>{{ review.guestName }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteReviewDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteReview" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteReviewsDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="selectedReviews && selectedReviews.length > 0">Bạn có chắc chắn muốn xóa {{ selectedReviews.length }} đánh giá đã chọn?</span>
            </div>
            <template #footer>
                <Button label="Không" icon="pi pi-times" text @click="deleteReviewsDialog = false" />
                <Button label="Có" icon="pi pi-check" text @click="deleteSelectedReviews" />
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

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
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

:deep(.p-rating .p-rating-item) {
    margin-right: 0.15rem;
}

:deep(.p-rating) {
    display: flex;
}
</style>
