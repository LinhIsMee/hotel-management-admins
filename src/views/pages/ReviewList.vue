<script setup>
import { useReviewManagement } from '@/composables/useReviewManagement';
import { onMounted } from 'vue';

// Import các component PrimeVue
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Rating from 'primevue/rating';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';

// Sử dụng composable để quản lý đánh giá
const {
    reviews,
    loading,
    reviewDialog,
    deleteReviewDialog,
    deleteReviewsDialog,
    review,
    selectedReviews,
    filters,
    submitted,
    totalElements,
    pageSize,
    stats,
    statuses,
    fetchAllData,
    openNew,
    hideDialog,
    saveReview,
    editReview,
    replyReview,
    submitReply,
    confirmDeleteReview,
    deleteReview,
    confirmDeleteSelected,
    deleteSelectedReviews,
    formatDate,
    getStatusName,
    getSeverity,
    getReviewSeverity,
    uploadImage
} = useReviewManagement();

onMounted(() => {
    fetchAllData();
});
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog></ConfirmDialog>
        <div class="mb-4">
            <div v-if="stats" class="flex flex-wrap gap-4 mb-4">
                <div class="bg-blue-50 p-4 rounded-lg shadow-sm flex-1">
                    <div class="text-blue-800 text-lg font-semibold mb-2">Tổng đánh giá</div>
                    <div class="text-3xl font-bold">{{ stats.totalReviews }}</div>
                    <div class="text-blue-600 mt-1">Điểm trung bình: {{ stats.averageRating.toFixed(1) }}/5</div>
                </div>

                <div class="bg-green-50 p-4 rounded-lg shadow-sm flex-1">
                    <div class="text-green-800 text-lg font-semibold mb-2">Đã phản hồi</div>
                    <div class="text-3xl font-bold">{{ stats.repliedReviews }}</div>
                    <div class="text-green-600 mt-1">{{ ((stats.repliedReviews / stats.totalReviews) * 100).toFixed(0) }}% đã phản hồi</div>
                </div>

                <div class="bg-yellow-50 p-4 rounded-lg shadow-sm flex-1">
                    <div class="text-yellow-800 text-lg font-semibold mb-2">Đang chờ xử lý</div>
                    <div class="text-3xl font-bold">{{ stats.pendingReviews }}</div>
                    <div class="text-yellow-600 mt-1">{{ ((stats.pendingReviews / stats.totalReviews) * 100).toFixed(0) }}% chưa phản hồi</div>
                </div>

                <div class="bg-red-50 p-4 rounded-lg shadow-sm flex-1">
                    <div class="text-red-800 text-lg font-semibold mb-2">Đã ẩn</div>
                    <div class="text-3xl font-bold">{{ stats.hiddenReviews }}</div>
                    <div class="text-red-600 mt-1">{{ ((stats.hiddenReviews / stats.totalReviews) * 100).toFixed(0) }}% bị ẩn</div>
                </div>
            </div>

            <div v-if="stats" class="flex flex-wrap gap-2 mt-2 mb-4">
                <div class="flex items-center gap-1">
                    <div class="w-16 bg-gray-100 h-3 rounded overflow-hidden">
                        <div class="bg-green-500 h-full" :style="{ width: stats.fiveStarPercent + '%' }"></div>
                    </div>
                    <div class="text-sm">5★ ({{ stats.fiveStarCount }})</div>
                </div>
                <div class="flex items-center gap-1">
                    <div class="w-16 bg-gray-100 h-3 rounded overflow-hidden">
                        <div class="bg-blue-500 h-full" :style="{ width: stats.fourStarPercent + '%' }"></div>
                    </div>
                    <div class="text-sm">4★ ({{ stats.fourStarCount }})</div>
                </div>
                <div class="flex items-center gap-1">
                    <div class="w-16 bg-gray-100 h-3 rounded overflow-hidden">
                        <div class="bg-yellow-500 h-full" :style="{ width: stats.threeStarPercent + '%' }"></div>
                    </div>
                    <div class="text-sm">3★ ({{ stats.threeStarCount }})</div>
                </div>
                <div class="flex items-center gap-1">
                    <div class="w-16 bg-gray-100 h-3 rounded overflow-hidden">
                        <div class="bg-orange-500 h-full" :style="{ width: stats.twoStarPercent + '%' }"></div>
                    </div>
                    <div class="text-sm">2★ ({{ stats.twoStarCount }})</div>
                </div>
                <div class="flex items-center gap-1">
                    <div class="w-16 bg-gray-100 h-3 rounded overflow-hidden">
                        <div class="bg-red-500 h-full" :style="{ width: stats.oneStarPercent + '%' }"></div>
                    </div>
                    <div class="text-sm">1★ ({{ stats.oneStarCount }})</div>
                </div>
            </div>
        </div>

        <div class="">
            <Toolbar class="mb-4">
                <template #start>
                    <div class="flex">
                        <Button label="Thêm mới" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                        <Button label="Xóa" icon="pi pi-trash" class="mr-2" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedReviews?.length" />
                    </div>
                </template>

                <template #end>
                    <div class="flex">
                        <span class="p-input-icon-left">
                            <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
                        </span>
                    </div>
                </template>
            </Toolbar>

            <div v-if="loading" class="text-center py-4">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                <div class="mt-2">Đang tải dữ liệu...</div>
            </div>

            <div v-else>
                <div v-if="reviews.length === 0" class="text-center py-4">Không có đánh giá nào được tìm thấy.</div>
                <div v-else>
                    <div class="text-sm mb-2">Hiển thị {{ reviews.length }} trong tổng số {{ totalElements }} đánh giá</div>

                    <DataTable
                        :value="reviews"
                        v-model:selection="selectedReviews"
                        dataKey="id"
                        :paginator="true"
                        :rows="pageSize"
                        :loading="loading"
                        :filters="filters"
                        :totalRecords="reviews.length"
                        :lazy="false"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25, 50]"
                        currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} đánh giá"
                        class="p-datatable-sm"
                    >
                        <template #empty>Không có đánh giá nào được tìm thấy.</template>
                        <template #loading>Đang tải dữ liệu đánh giá. Vui lòng đợi.</template>

                        <Column selectionMode="multiple" exportable="false" style="min-width: 3rem"></Column>

                        <Column field="id" header="ID" sortable style="min-width: 4rem"></Column>

                        <Column field="guestName" header="Tên khách hàng" sortable style="min-width: 12rem">
                            <template #body="{ data }">
                                {{ data.isAnonymous ? data.displayName : data.guestName }}
                            </template>
                        </Column>

                        <Column field="bookingId" header="Mã đặt phòng" sortable style="min-width: 8rem"></Column>

                        <Column field="roomNumber" header="Phòng" sortable style="min-width: 6rem"></Column>

                        <Column field="roomType" header="Loại phòng" sortable style="min-width: 10rem"></Column>

                        <Column field="rating" header="Điểm đánh giá" sortable style="min-width: 8rem">
                            <template #body="{ data }">
                                <div class="flex align-items-center">
                                    <Rating :modelValue="data.rating" readonly :cancel="false" />
                                    <Tag :value="data.rating + ' sao'" :severity="getReviewSeverity(data.rating)" class="ml-2" />
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

                        <Column field="isFeatured" header="Nổi bật" sortable style="min-width: 6rem">
                            <template #body="{ data }">
                                <i :class="['pi', data.isFeatured ? 'pi-check text-green-500' : 'pi-times text-gray-500']"></i>
                            </template>
                        </Column>

                        <Column field="createdAt" header="Ngày đánh giá" sortable style="min-width: 10rem">
                            <template #body="{ data }">
                                {{ formatDate(data.createdAt) }}
                            </template>
                        </Column>

                        <Column exportable="false" style="min-width: 10rem">
                            <template #body="{ data }">
                                <Button icon="pi pi-pencil" outlined class="mr-1" @click="editReview(data)" />
                                <Button icon="pi pi-reply" outlined severity="info" class="mr-1" @click="replyReview(data)" v-if="data.status !== 'REPLIED'" />
                                <Button icon="pi pi-trash" outlined severity="danger" @click="confirmDeleteReview(data)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="reviewDialog" :style="{ width: '900px' }" header="Thông tin đánh giá" :modal="true" class="p-fluid" :closable="true" :closeOnEscape="true">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <div class="p-4 rounded-lg">
                        <div class="mb-4">
                            <label for="guestName" class="font-bold mb-2 block">Tên khách hàng</label>
                            <InputText id="guestName" v-model.trim="review.guestName" required class="w-full" :class="{ 'p-invalid': submitted && !review.guestName }" />
                            <small class="p-error" v-if="submitted && !review.guestName">Tên khách hàng là bắt buộc.</small>
                        </div>

                        <div class="mb-4">
                            <label for="displayName" class="font-bold mb-2 block">Tên hiển thị (khi ẩn danh)</label>
                            <InputText id="displayName" v-model.trim="review.displayName" class="w-full" />
                        </div>

                        <div class="mb-4">
                            <label for="bookingId" class="font-bold mb-2 block">Mã đặt phòng</label>
                            <InputText id="bookingId" v-model.trim="review.bookingId" class="w-full" />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="mb-4">
                                <label for="roomNumber" class="font-bold mb-2 block">Số phòng</label>
                                <InputText id="roomNumber" v-model.trim="review.roomNumber" class="w-full" />
                            </div>

                            <div class="mb-4">
                                <label for="roomType" class="font-bold mb-2 block">Loại phòng</label>
                                <InputText id="roomType" v-model.trim="review.roomType" class="w-full" />
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="font-bold mb-2 block">Ẩn danh</label>
                            <div class="flex items-center">
                                <InputSwitch id="isAnonymous" v-model="review.isAnonymous" />
                                <label for="isAnonymous" class="ml-2">Hiển thị dưới dạng ẩn danh</label>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="font-bold mb-2 block">Đánh giá nổi bật</label>
                            <div class="flex items-center">
                                <InputSwitch id="isFeatured" v-model="review.isFeatured" />
                                <label for="isFeatured" class="ml-2">Hiển thị như đánh giá nổi bật</label>
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

                        <div class="mb-4">
                            <label for="rating" class="font-bold mb-2 block">Điểm đánh giá tổng thể ({{ review.rating }}/5)</label>
                            <Rating id="rating" v-model="review.rating" :cancel="false" />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="mb-4">
                                <label class="font-bold mb-2 block">Sạch sẽ</label>
                                <Rating v-model="review.cleanliness" :cancel="false" />
                            </div>
                            <div class="mb-4">
                                <label class="font-bold mb-2 block">Dịch vụ</label>
                                <Rating v-model="review.service" :cancel="false" />
                            </div>
                            <div class="mb-4">
                                <label class="font-bold mb-2 block">Thoải mái</label>
                                <Rating v-model="review.comfort" :cancel="false" />
                            </div>
                            <div class="mb-4">
                                <label class="font-bold mb-2 block">Vị trí</label>
                                <Rating v-model="review.location" :cancel="false" />
                            </div>
                            <div class="mb-4">
                                <label class="font-bold mb-2 block">Cơ sở vật chất</label>
                                <Rating v-model="review.facilities" :cancel="false" />
                            </div>
                            <div class="mb-4">
                                <label class="font-bold mb-2 block">Đáng giá tiền</label>
                                <Rating v-model="review.valueForMoney" :cancel="false" />
                            </div>
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
                            <label for="replyComment" class="font-bold mb-2 block">Phản hồi của khách sạn</label>
                            <Textarea id="replyComment" v-model="review.replyComment" rows="3" autoResize class="w-full" />
                        </div>

                        <div v-if="review.replyComment" class="mb-4">
                            <div class="flex justify-between">
                                <div>
                                    <label class="font-bold mb-2 block">Người phản hồi</label>
                                    <div>{{ review.replyBy || 'Admin' }}</div>
                                </div>
                                <div>
                                    <label class="font-bold mb-2 block">Ngày phản hồi</label>
                                    <div>{{ formatDate(review.replyDate) }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="images" class="font-bold mb-2 block">Hình ảnh đính kèm</label>
                            <div class="flex flex-wrap gap-2">
                                <div v-for="(image, index) in review.images" :key="index" class="relative">
                                    <img :src="image" alt="Hình ảnh đánh giá" class="w-32 h-32 object-cover rounded-lg" />
                                    <Button icon="pi pi-times" class="absolute top-1 right-1 p-1 h-auto" severity="danger" text @click="review.images.splice(index, 1)" />
                                </div>
                                <div class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer" @click="uploadImage">
                                    <i class="pi pi-plus text-gray-500 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" />
                <Button v-if="review.status !== 'REPLIED'" label="Gửi phản hồi" icon="pi pi-reply" severity="info" @click="submitReply" class="mr-2" />
                <Button label="Lưu" icon="pi pi-check" @click="saveReview" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteReviewDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="review"
                    >Bạn có chắc chắn muốn xóa đánh giá của <b>{{ review.isAnonymous ? review.displayName : review.guestName }}</b
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

:deep(.p-dialog-mask) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 9999 !important;
}

:deep(.p-dialog) {
    position: relative;
    z-index: 10000 !important;
    max-height: 90vh;
    max-width: 90vw;
    overflow: auto;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

:deep(.p-component-overlay) {
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 9999 !important;
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
