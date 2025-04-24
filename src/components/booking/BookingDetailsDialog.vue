<script setup>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { ref, computed, watch } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    booking: {
        type: Object,
        default: null
    },
    formatDate: {
        type: Function,
        required: true
    },
    formatCurrency: {
        type: Function,
        required: true
    },
    getStatusLabel: {
        type: Function,
        required: true
    },
    getStatusSeverity: {
        type: Function,
        required: true
    },
    getPaymentMethodLabel: {
        type: Function,
        required: true
    },
    getPaymentStatusLabel: {
        type: Function,
        required: true
    },
    getPaymentStatusSeverity: {
        type: Function,
        required: true
    }
});

const emit = defineEmits(['update:visible']);

// Tính tổng tiền phòng dựa trên thông tin phòng
const totalRoomPrice = computed(() => {
    if (!props.booking || !props.booking.rooms || props.booking.rooms.length === 0) {
        return props.booking?.totalPrice || 0;
    }

    return props.booking.rooms.reduce((sum, room) => sum + (room.price || 0), 0);
});

// Tính tổng tiền dịch vụ
const totalServicesPrice = computed(() => {
    if (!props.booking || !props.booking.services || props.booking.services.length === 0) {
        return 0;
    }

    return props.booking.services.reduce((sum, service) => sum + (service.price || 0), 0);
});

// Tính số tiền giảm giá
const discountAmount = computed(() => {
    if (!props.booking) return 0;

    // Sử dụng trường discountAmount nếu có
    if (props.booking.discountAmount) {
        return props.booking.discountAmount;
    }

    // Tính toán dựa vào discountValue và discountType
    if (props.booking.discountValue && props.booking.discountType) {
        const basePrice = totalRoomPrice.value + totalServicesPrice.value;

        if (props.booking.discountType === 'PERCENTAGE') {
            return basePrice * (props.booking.discountValue / 100);
        } else if (props.booking.discountType === 'FIXED') {
            return props.booking.discountValue;
        }
    }

    // Tính toán dựa vào sự chênh lệch giữa totalPrice và finalPrice
    if (props.booking.totalPrice && props.booking.finalPrice && props.booking.totalPrice > props.booking.finalPrice) {
        return props.booking.totalPrice - props.booking.finalPrice;
    }

    return 0;
});

// Theo dõi thay đổi của visible để cập nhật lại emit khi cần
watch(() => props.visible, (newValue) => {
    if (!newValue) {
        emit('update:visible', false);
    }
});

// Hàm để hiển thị thời gian lưu trú
const getDurationOfStay = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return '1 đêm';

    try {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const diffTime = Math.abs(checkOut - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 1 ? `${diffDays} đêm` : '1 đêm';
    } catch (e) {
        return '1 đêm';
    }
};

// Chuyển đổi thông tin thẻ trạng thái thanh toán
const paymentStatusTag = computed(() => {
    if (!props.booking) return { severity: 'info', value: 'Không xác định' };

    return {
        severity: props.getPaymentStatusSeverity(props.booking.paymentStatus),
        value: props.getPaymentStatusLabel(props.booking.paymentStatus)
    };
});

// Chuyển đổi thông tin thẻ trạng thái đặt phòng
const bookingStatusTag = computed(() => {
    if (!props.booking) return { severity: 'info', value: 'Không xác định' };

    return {
        severity: props.getStatusSeverity(props.booking.status),
        value: props.getStatusLabel(props.booking.status)
    };
});
</script>

<template>
    <Dialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        header="Chi tiết đặt phòng"
        :modal="true"
        :closable="true"
        :style="{ width: '90vw', maxWidth: '900px' }"
        class="p-fluid booking-details-dialog"
    >
        <div v-if="booking" class="booking-detail p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <!-- Thông tin đơn đặt phòng -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-bold text-lg border-b pb-2 mb-4">Thông tin đơn đặt</h3>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">Mã đơn:</span>
                        <span>#{{ booking.id }}</span>
                    </div>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">Ngày đặt:</span>
                        <span>{{ formatDate(booking.createdAt) }}</span>
                    </div>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">Trạng thái:</span>
                        <Tag :severity="bookingStatusTag.severity">{{ bookingStatusTag.value }}</Tag>
                    </div>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">Check-in:</span>
                        <span>{{ formatDate(booking.checkInDate) }}</span>
                    </div>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">Check-out:</span>
                        <span>{{ formatDate(booking.checkOutDate) }}</span>
                    </div>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">Thời gian lưu trú:</span>
                        <span>{{ getDurationOfStay(booking.checkInDate, booking.checkOutDate) }}</span>
                    </div>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">Người lớn:</span>
                        <span>{{ booking.adults || '1' }}</span>
                    </div>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">Trẻ em:</span>
                        <span>{{ booking.children || '0' }}</span>
                    </div>
                </div>

                <!-- Thông tin khách hàng -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-bold text-lg border-b pb-2 mb-4">Thông tin khách hàng</h3>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">Họ tên:</span>
                        <span>{{ booking.fullName }}</span>
                    </div>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">Email:</span>
                        <span>{{ booking.email || 'Không có' }}</span>
                    </div>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">Số điện thoại:</span>
                        <span>{{ booking.phone || 'Không có' }}</span>
                    </div>

                    <div v-if="booking.nationalId" class="flex justify-between mb-3">
                        <span class="font-semibold">CMND/CCCD:</span>
                        <span>{{ booking.nationalId }}</span>
                    </div>

                    <div class="flex justify-between mb-3">
                        <span class="font-semibold">ID Người dùng:</span>
                        <span>{{ booking.userId || 'Không có' }}</span>
                    </div>
                </div>
            </div>

            <!-- Thông tin phòng -->
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 class="font-bold text-lg border-b pb-2 mb-4">Thông tin phòng</h3>

                <div v-if="booking.rooms && booking.rooms.length > 0" class="space-y-4">
                    <div v-for="(room, index) in booking.rooms" :key="index" class="p-3 bg-white rounded-lg shadow-sm">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold">Phòng {{ room.roomNumber }}</span>
                            <span class="text-amber-600 font-bold">{{ formatCurrency(room.price) }}</span>
                        </div>
                        <div class="text-sm text-gray-600">
                            <div class="flex justify-between mb-1">
                                <span>Loại phòng:</span>
                                <span>{{ room.roomType || room.roomTypeName || 'Không xác định' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Thời gian:</span>
                                <span>{{ formatDate(booking.checkInDate) }} - {{ formatDate(booking.checkOutDate) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-semibold">Không có thông tin chi tiết phòng</span>
                        <span class="text-amber-600 font-bold">{{ formatCurrency(booking.totalPrice) }}</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        <div class="flex justify-between">
                            <span>Thời gian:</span>
                            <span>{{ formatDate(booking.checkInDate) }} - {{ formatDate(booking.checkOutDate) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dịch vụ bổ sung -->
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 class="font-bold text-lg border-b pb-2 mb-4">Dịch vụ bổ sung</h3>

                <div v-if="booking.services && booking.services.length > 0" class="space-y-2">
                    <div v-for="(service, index) in booking.services" :key="index" class="flex justify-between items-center p-2 bg-white rounded">
                        <span>{{ service.name }}</span>
                        <span class="font-bold">{{ formatCurrency(service.price) }}</span>
                    </div>
                    <div class="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200">
                        <span>Tổng dịch vụ:</span>
                        <span>{{ formatCurrency(totalServicesPrice) }}</span>
                    </div>
                </div>
                <div v-else class="text-gray-500 italic">Không có dịch vụ bổ sung</div>
            </div>

            <!-- Thông tin thanh toán -->
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 class="font-bold text-lg border-b pb-2 mb-4">Thông tin thanh toán</h3>

                <div class="flex justify-between mb-3">
                    <span class="font-semibold">Phương thức thanh toán:</span>
                    <span>{{ getPaymentMethodLabel(booking.paymentMethod) }}</span>
                </div>

                <div class="flex justify-between mb-3">
                    <span class="font-semibold">Trạng thái thanh toán:</span>
                    <Tag :severity="paymentStatusTag.severity">{{ paymentStatusTag.value }}</Tag>
                </div>

                <div v-if="booking.discountCode" class="flex justify-between mb-3">
                    <span class="font-semibold">Mã giảm giá:</span>
                    <span>{{ booking.discountCode }}</span>
                </div>

                <div class="space-y-2 p-3 bg-white rounded-lg mt-4">
                    <div class="flex justify-between">
                        <span>Tiền phòng:</span>
                        <span>{{ formatCurrency(totalRoomPrice) }}</span>
                    </div>

                    <div v-if="totalServicesPrice > 0" class="flex justify-between">
                        <span>Dịch vụ bổ sung:</span>
                        <span>{{ formatCurrency(totalServicesPrice) }}</span>
                    </div>

                    <div v-if="discountAmount > 0" class="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span>-{{ formatCurrency(discountAmount) }}</span>
                    </div>

                    <div class="flex justify-between font-bold pt-2 border-t border-gray-200">
                        <span>Tổng thanh toán:</span>
                        <span class="text-amber-600 text-lg">
                            {{ formatCurrency(booking.finalPrice || booking.totalPrice) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Ghi chú đặc biệt -->
            <div v-if="booking.specialRequests || booking.notes" class="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 class="font-bold text-lg border-b pb-2 mb-4">Ghi chú</h3>

                <div v-if="booking.specialRequests" class="mb-3">
                    <div class="font-semibold mb-1">Yêu cầu đặc biệt:</div>
                    <div class="bg-white p-3 rounded-lg">{{ booking.specialRequests }}</div>
                </div>

                <div v-if="booking.notes">
                    <div class="font-semibold mb-1">Ghi chú nội bộ:</div>
                    <div class="bg-white p-3 rounded-lg">{{ booking.notes }}</div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button
                label="Đóng"
                icon="pi pi-times"
                class="p-button-text"
                @click="emit('update:visible', false)"
            />
        </template>
    </Dialog>
</template>

<style scoped>
:deep(.p-dialog-content) {
    padding: 0 !important;
    overflow-y: auto;
    max-height: 70vh;
}

:deep(.p-tag) {
    font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    :deep(.p-dialog) {
        width: 95vw !important;
    }

    .booking-detail {
        padding: 0.5rem !important;
    }
}
</style>
