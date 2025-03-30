<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';

// Sử dụng defineProps mà không gán vào biến
defineProps({
    visible: Boolean,
    booking: Object,
    formatDate: Function,
    formatCurrency: Function,
    getStatusLabel: Function,
    getStatusSeverity: Function,
    getPaymentMethodLabel: Function,
    getPaymentStatusLabel: Function,
    getPaymentStatusSeverity: Function
});

const emit = defineEmits(['update:visible']);

const closeDialog = () => {
    emit('update:visible', false);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="closeDialog" :style="{ width: '900px' }" header="Chi tiết đơn đặt phòng" :modal="true" class="p-fluid">
        <div v-if="booking" class="p-4">
            <div class="bg-gray-100 p-4 mb-4 rounded-lg">
                <h3 class="font-bold text-lg mb-2">Thông tin đơn hàng</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="mb-2"><span class="font-semibold">Mã đơn:</span> {{ booking.id }}</p>
                        <p class="mb-2"><span class="font-semibold">Ngày tạo:</span> {{ formatDate(booking.createdAt) }}</p>
                        <p class="mb-2">
                            <span class="font-semibold">Trạng thái:</span>
                            <Tag :value="getStatusLabel(booking.status)" :severity="getStatusSeverity(booking.status)" />
                        </p>
                    </div>
                    <div>
                        <p class="mb-2"><span class="font-semibold">Tổng tiền:</span> {{ formatCurrency(booking.totalPrice) }}</p>
                        <p class="mb-2"><span class="font-semibold">Giảm giá:</span> {{ booking.discountCode || 'Không có' }}</p>
                        <p class="mb-2"><span class="font-semibold">Thanh toán cuối:</span> {{ formatCurrency(booking.finalPrice) }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-gray-100 p-4 mb-4 rounded-lg">
                <h3 class="font-bold text-lg mb-2">Thông tin khách hàng</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="mb-2"><span class="font-semibold">Họ tên:</span> {{ booking.fullName }}</p>
                        <p class="mb-2"><span class="font-semibold">Email:</span> {{ booking.email || 'Không có' }}</p>
                    </div>
                    <div>
                        <p class="mb-2"><span class="font-semibold">Số điện thoại:</span> {{ booking.phone || 'Không có' }}</p>
                        <p class="mb-2"><span class="font-semibold">CMND/CCCD:</span> {{ booking.nationalId || 'Không có' }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-gray-100 p-4 mb-4 rounded-lg">
                <h3 class="font-bold text-lg mb-2">Thông tin phòng</h3>
                <div v-if="booking.rooms && booking.rooms.length > 0">
                    <div v-for="(room, index) in booking.rooms" :key="index" class="mb-2 p-2 border-b border-gray-200">
                        <div class="grid grid-cols-3 gap-2">
                            <p><span class="font-semibold">Phòng:</span> {{ room.roomNumber }}</p>
                            <p><span class="font-semibold">Loại:</span> {{ room.roomType }}</p>
                            <p><span class="font-semibold">Giá:</span> {{ formatCurrency(room.price) }}</p>
                        </div>
                    </div>
                </div>
                <div v-else class="italic text-gray-600">Không có thông tin phòng</div>

                <div class="mt-3">
                    <p><span class="font-semibold">Ngày nhận phòng:</span> {{ formatDate(booking.checkInDate) }}</p>
                    <p><span class="font-semibold">Ngày trả phòng:</span> {{ formatDate(booking.checkOutDate) }}</p>
                </div>
            </div>

            <div class="bg-gray-100 p-4 rounded-lg">
                <h3 class="font-bold text-lg mb-2">Thông tin thanh toán</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="mb-2"><span class="font-semibold">Phương thức:</span> {{ getPaymentMethodLabel(booking.paymentMethod) }}</p>
                        <p class="mb-2">
                            <span class="font-semibold">Trạng thái:</span>
                            <Tag :value="getPaymentStatusLabel(booking.paymentStatus)" :severity="getPaymentStatusSeverity(booking.paymentStatus)" />
                        </p>
                    </div>
                    <div>
                        <p class="mb-2"><span class="font-semibold">Ngày thanh toán:</span> {{ formatDate(booking.paymentDate) || 'Chưa thanh toán' }}</p>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Đóng" icon="pi pi-times" @click="closeDialog" />
        </template>
    </Dialog>
</template>
