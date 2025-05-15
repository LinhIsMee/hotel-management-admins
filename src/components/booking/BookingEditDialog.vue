<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import Dropdown from 'primevue/dropdown';
import { computed, ref, watch } from 'vue';
import { useUserService } from '@/composables/useUserService';
import RoomService from '@/services/RoomService';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

// Khai báo props
const props = defineProps({
    visible: Boolean,
    bookingData: Object,
    submitted: Boolean,
    statuses: Array,
    paymentStatuses: Array,
    paymentMethods: Array
});

const emit = defineEmits(['update:visible', 'save', 'hideDialog', 'update:bookingData']);

// Tạo biến cục bộ để lưu trữ dữ liệu
const localBooking = ref({});
const { getUserById } = useUserService();
const loadingUser = ref(false);
const loadingRoom = ref(false);
const maxOccupancy = ref(null);
const peopleError = ref('');
const childrenAges = ref([]);
const toast = useToast();

const ageOptions = Array.from({ length: 18 }, (_, i) => ({ label: `${i} tuổi`, value: i }));

// Hàm load thông tin user
const loadUserData = async (userId) => {
    if (!userId) return;

    try {
        loadingUser.value = true;
        const userData = await getUserById(userId);
        if (userData) {
            localBooking.value = {
                ...localBooking.value,
                fullName: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                nationalId: userData.nationalId
            };
        }
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
    } finally {
        loadingUser.value = false;
    }
};

// Watch userId để load data
watch(() => localBooking.value.userId, async (newUserId, oldUserId) => {
    if (newUserId && newUserId !== oldUserId) {
        await loadUserData(newUserId);
    }
});

// Khai báo các phương thức thanh toán mặc định
const defaultPaymentMethods = ref([
    { label: 'Tiền mặt', value: 'CASH' },
    { label: 'VnPay', value: 'VNPAY' },
    { label: 'Thẻ tín dụng', value: 'CREDIT_CARD' },
    { label: 'Chuyển khoản', value: 'BANK_TRANSFER' }
]);

// Kiểm tra và sử dụng paymentMethods từ props nếu có, nếu không thì dùng giá trị mặc định
const actualPaymentMethods = computed(() => {
    return props.paymentMethods && props.paymentMethods.length > 0 ? props.paymentMethods : defaultPaymentMethods.value;
});

// Kiểm tra và chuẩn hóa phương thức thanh toán
const normalizePaymentMethod = (method) => {
    if (!method) return null;

    try {
        // Xử lý các kiểu dữ liệu khác nhau
        if (typeof method === 'object' && method !== null) {
            return method.value || null;
        }

        // Nếu là chuỗi, chuẩn hóa thành chữ hoa
        const methodUpper = typeof method === 'string' ? method.toUpperCase() : '';

        // Map các giá trị khác nhau về một giá trị chuẩn
        const methodMap = {
            VNPAY: 'VNPAY',
            VN_PAY: 'VNPAY',
            VNPAY_PAYMENT: 'VNPAY',
            CASH: 'CASH',
            'TIỀN MẶT': 'CASH',
            CREDIT_CARD: 'CREDIT_CARD',
            CREDIT: 'CREDIT_CARD',
            BANK_TRANSFER: 'BANK_TRANSFER',
            TRANSFER: 'BANK_TRANSFER'
        };

        return methodMap[methodUpper] || method;
    } catch (error) {
        console.error('Lỗi khi chuẩn hóa phương thức thanh toán:', error);
        return method; // Trả về giá trị gốc nếu có lỗi
    }
};

// Hàm lấy ID người dùng hiện tại từ localStorage
const getCurrentUserId = () => {
    try {
        const userData = localStorage.getItem('admin_user');
        if (userData) {
            const user = JSON.parse(userData);
            return user.id || 0;
        }
        return 0;
    } catch (error) {
        console.error('Lỗi khi lấy ID người dùng:', error);
        return 0;
    }
};

// Cập nhật dữ liệu cục bộ khi props thay đổi
watch(
    () => props.bookingData,
    (newVal) => {
        if (newVal) {
            try {
                const bookingCopy = JSON.parse(JSON.stringify(newVal));
                if (bookingCopy.paymentMethod) {
                    bookingCopy.paymentMethod = normalizePaymentMethod(bookingCopy.paymentMethod);
                }
                if (!bookingCopy.userId) bookingCopy.userId = getCurrentUserId();
                if (!bookingCopy.adults) bookingCopy.adults = 1;
                if (!bookingCopy.children) bookingCopy.children = 0;
                if (!bookingCopy.status) bookingCopy.status = 'PENDING';
                if (!bookingCopy.paymentStatus) bookingCopy.paymentStatus = 'UNPAID';
                if (!bookingCopy.paymentMethod) bookingCopy.paymentMethod = 'CASH';
                if (bookingCopy.rooms && Array.isArray(bookingCopy.rooms) && !bookingCopy.roomIds) {
                    bookingCopy.roomIds = bookingCopy.rooms.map((room) => room.roomId || room.id);
                }
                if (bookingCopy.rooms && Array.isArray(bookingCopy.rooms) && bookingCopy.rooms.length > 0) {
                    const room = bookingCopy.rooms[0];
                    bookingCopy.roomId = room.roomId;
                    bookingCopy.roomNumber = room.roomNumber;
                    bookingCopy.roomType = room.roomType;
                    bookingCopy.price = room.pricePerNight || room.price;
                }
                if (bookingCopy.roomId) {
                    loadRoomData(bookingCopy.roomId);
                }
                if (!bookingCopy.services) {
                    bookingCopy.services = [];
                }
                if (bookingCopy.childrenAges && Array.isArray(bookingCopy.childrenAges)) {
                    childrenAges.value = [...bookingCopy.childrenAges];
                } else {
                    childrenAges.value = Array(bookingCopy.children || 0).fill(0);
                }
                localBooking.value = bookingCopy;
            } catch (error) {
                localBooking.value = { ...newVal } || {};
            }
        }
    },
    { immediate: true, deep: true }
);

// Trước khi lưu, đảm bảo dữ liệu đúng định dạng
const save = () => {
    try {
        if (peopleError.value) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: peopleError.value, life: 3000 });
            return;
        }
        if (!localBooking.value.fullName?.trim()) {
            toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Họ tên là bắt buộc.', life: 3000 });
            return;
        }
        // Chỉ gửi roomIds, loại bỏ các trường phụ
        const updatedBooking = {
            ...localBooking.value,
            checkInDate: localBooking.value.checkInDate instanceof Date ? localBooking.value.checkInDate.toISOString().split('T')[0] : localBooking.value.checkInDate,
            checkOutDate: localBooking.value.checkOutDate instanceof Date ? localBooking.value.checkOutDate.toISOString().split('T')[0] : localBooking.value.checkOutDate,
            paymentDate: localBooking.value.paymentDate instanceof Date ? localBooking.value.paymentDate.toISOString().split('T')[0] : localBooking.value.paymentDate,
            roomIds: localBooking.value.roomIds || (localBooking.value.roomId ? [localBooking.value.roomId] : []),
            childrenAges: [...childrenAges.value]
        };
        delete updatedBooking.roomId;
        delete updatedBooking.roomNumber;
        delete updatedBooking.roomType;
        delete updatedBooking.price;
        emit('update:bookingData', updatedBooking);
        emit('save');
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi khi lưu dữ liệu!', life: 3000 });
    }
};

const hideDialog = () => {
    emit('hideDialog');
};

const updateVisible = (val) => {
    emit('update:visible', val);
};

const loadRoomData = async (roomId) => {
    if (!roomId) return;
    try {
        loadingRoom.value = true;
        const res = await RoomService.getRoomById(roomId);
        const roomData = res.data;
        if (roomData) {
            localBooking.value.roomNumber = roomData.roomNumber;
            localBooking.value.roomType = roomData.roomTypeName || roomData.roomType;
            localBooking.value.price = roomData.pricePerNight || roomData.price || 0;
            maxOccupancy.value = roomData.maxOccupancy || roomData.maxGuests || null;
            validatePeople();
        } else {
            toast.add({ severity: 'warn', summary: 'Không tìm thấy phòng', detail: 'Vui lòng kiểm tra lại ID phòng.', life: 3000 });
            localBooking.value.roomNumber = '';
            localBooking.value.roomType = '';
            localBooking.value.price = 0;
            maxOccupancy.value = null;
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tìm thấy phòng!', life: 3000 });
        localBooking.value.roomNumber = '';
        localBooking.value.roomType = '';
        localBooking.value.price = 0;
        maxOccupancy.value = null;
    } finally {
        loadingRoom.value = false;
    }
};

const calcTotalPeople = () => {
    let total = Number(localBooking.value.adults || 0);
    for (let age of childrenAges.value) {
        if (age < 6) continue; // Không tính vào tổng
        if (age < 12) total += 0.5; // 7-11 tuổi tính 0.5
        else total += 1; // >=12 tuổi tính như người lớn
    }
    return total;
};

const calcRoomPrice = () => {
    let base = Number(localBooking.value.price || 0);
    let total = base;
    for (let age of childrenAges.value) {
        if (age < 6) continue; // Miễn phí
        if (age < 12) total += base * 0.5; // 7-11 tuổi tính 50%
        else total += base; // >=12 tuổi tính như người lớn
    }
    return total;
};

const validatePeople = () => {
    if (maxOccupancy.value) {
        const total = calcTotalPeople();
        if (total > maxOccupancy.value) {
            peopleError.value = `Tổng số người quy đổi không được vượt quá ${maxOccupancy.value} người (theo loại phòng).`;
        } else {
            peopleError.value = '';
        }
    } else {
        peopleError.value = '';
    }
    // Tính lại giá phòng
    localBooking.value.totalPrice = calcRoomPrice();
};

const getMaxAdults = computed(() => {
    // Số người lớn tối đa còn lại (tính theo quy đổi)
    if (!maxOccupancy.value) return 99;
    let total = 0;
    for (let age of childrenAges.value) {
        if (age < 6) continue;
        if (age < 12) total += 0.5;
        else total += 1;
    }
    return Math.max(1, Math.floor(maxOccupancy.value - total));
});
const getMaxChildren = computed(() => {
    if (!maxOccupancy.value) return 10;
    let max = Math.min(maxOccupancy.value * 2, 10);
    return max;
});

watch([
    () => localBooking.value.adults,
    () => localBooking.value.children,
    () => childrenAges.value,
    () => localBooking.value.price
], validatePeople, { deep: true });

watch(() => localBooking.value.children, (newVal) => {
    // Giới hạn số trẻ em không vượt quá maxOccupancy*2 hoặc 10
    const maxChildren = getMaxChildren.value;
    if (newVal > maxChildren) {
        localBooking.value.children = maxChildren;
    }
    // Đảm bảo mảng tuổi trẻ em có đúng kích thước
    if (childrenAges.value.length < localBooking.value.children) {
        for (let i = childrenAges.value.length; i < localBooking.value.children; i++) {
            childrenAges.value.push(0);
        }
    } else if (childrenAges.value.length > localBooking.value.children) {
        childrenAges.value = childrenAges.value.slice(0, localBooking.value.children);
    }
    validatePeople();
});
</script>

<template>
    <Dialog :visible="visible" @update:visible="updateVisible" :style="{ width: '750px' }" header="Đặt phòng" :modal="true" class="booking-dialog">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-4">
            <!-- Thông tin người dùng -->
            <div class="col-span-2">
                <h3 class="text-lg font-semibold mb-3">Thông tin người dùng</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="col-span-1">
                        <div class="field">
                            <label for="userId">ID Người dùng</label>
                            <div class="flex items-stretch gap-2">
                                <InputNumber id="userId" v-model="localBooking.userId" :min="0" class="w-full" />
                                <Button
                                    type="button"
                                    icon="pi pi-search"
                                    @click="loadUserData(localBooking.userId)"
                                    :loading="loadingUser"
                                    class="p-button-primary h-full"
                                    v-tooltip.top="'Tìm kiếm người dùng'"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="fullName">Họ tên khách hàng <span class="text-red-500">*</span></label>
                            <InputText id="fullName" v-model="localBooking.fullName" required :class="{ 'p-invalid': submitted && !localBooking.fullName }" class="w-full" :disabled="true" />
                            <small class="p-error" v-if="submitted && !localBooking.fullName">Họ tên là bắt buộc.</small>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="phone">Số điện thoại <span class="text-red-500">*</span></label>
                            <InputText id="phone" v-model="localBooking.phone" required :class="{ 'p-invalid': submitted && !localBooking.phone }" class="w-full" :disabled="true" />
                            <small class="p-error" v-if="submitted && !localBooking.phone">Số điện thoại là bắt buộc.</small>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="email">Email</label>
                            <InputText id="email" v-model="localBooking.email" type="email" class="w-full" :disabled="true" />
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="nationalId">CMND/CCCD</label>
                            <InputText id="nationalId" v-model="localBooking.nationalId" class="w-full" :disabled="true" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Thông tin phòng -->
            <div class="col-span-2">
                <h3 class="text-lg font-semibold mb-3">Thông tin phòng</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="col-span-1">
                        <div class="field">
                            <label for="roomId">ID Phòng</label>
                            <div class="flex items-stretch gap-2">
                                <InputNumber id="roomId" v-model="localBooking.roomId" :min="0" class="w-full" />
                                <Button
                                    type="button"
                                    icon="pi pi-search"
                                    @click="loadRoomData(localBooking.roomId)"
                                    :loading="loadingRoom"
                                    class="p-button-primary h-full"
                                    v-tooltip.top="'Tìm kiếm phòng'"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="col-span-1">
                        <div class="field">
                            <label for="roomNumber">Số phòng</label>
                            <InputText id="roomNumber" v-model="localBooking.roomNumber" class="w-full" :disabled="true" />
                        </div>
                    </div>
                    <div class="col-span-1">
                        <div class="field">
                            <label for="roomType">Loại phòng</label>
                            <InputText id="roomType" v-model="localBooking.roomType" class="w-full" :disabled="true" />
                        </div>
                    </div>
                    <div class="col-span-1">
                        <div class="field">
                            <label for="price">Giá phòng</label>
                            <InputNumber id="price" v-model="localBooking.price" mode="currency" currency="VND" locale="vi-VN" class="w-full" :disabled="true" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Thông tin đặt phòng -->
            <div class="col-span-2">
                <h3 class="text-lg font-semibold mb-3">Thông tin đặt phòng</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="col-span-1">
                        <div class="field">
                            <label for="checkInDate">Ngày nhận phòng <span class="text-red-500">*</span></label>
                            <DatePicker id="checkInDate" v-model="localBooking.checkInDate" :showIcon="true" dateFormat="dd/mm/yy" :class="{ 'p-invalid': submitted && !localBooking.checkInDate }" class="w-full" />
                            <small class="p-error" v-if="submitted && !localBooking.checkInDate">Ngày nhận phòng là bắt buộc.</small>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="checkOutDate">Ngày trả phòng <span class="text-red-500">*</span></label>
                            <DatePicker id="checkOutDate" v-model="localBooking.checkOutDate" :showIcon="true" dateFormat="dd/mm/yy" :class="{ 'p-invalid': submitted && !localBooking.checkOutDate }" class="w-full" />
                            <small class="p-error" v-if="submitted && !localBooking.checkOutDate">Ngày trả phòng là bắt buộc.</small>
                        </div>
                    </div>

                    <div class="col-span-1" v-if="!localBooking.id">
                        <div class="field">
                            <label for="adults">Số người lớn</label>
                            <InputNumber id="adults" v-model="localBooking.adults" :min="1" :max="getMaxAdults" :showButtons="true" class="w-full" @input="validatePeople" />
                        </div>
                    </div>

                    <div class="col-span-1" v-if="!localBooking.id">
                        <div class="field">
                            <label for="children">Số trẻ em</label>
                            <InputNumber id="children" v-model="localBooking.children" :min="0" :max="getMaxChildren" :showButtons="true" class="w-full" @input="validatePeople" />
                        </div>
                    </div>

                    <div class="col-span-2" v-if="localBooking.children > 0 && !localBooking.id">
                        <div class="field">
                            <label>Độ tuổi từng trẻ em</label>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div v-for="(age, idx) in childrenAges" :key="idx" class="flex items-center gap-2 mb-2">
                                    <span class="text-sm text-gray-600 w-24">Trẻ em {{ idx + 1 }}</span>
                                    <Dropdown
                                        v-model="childrenAges[idx]"
                                        :options="ageOptions"
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Chọn tuổi"
                                        class="w-full"
                                        @change="validatePeople"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-span-2" v-if="!localBooking.id">
                        <small class="p-error" v-if="peopleError">{{ peopleError }}</small>
                        <small v-else-if="maxOccupancy">Tối đa {{ maxOccupancy }} người/phòng. (Trẻ dưới 6 tuổi không tính vào tổng, 7-11 tuổi tính 0.5, từ 12 tuổi trở lên tính như người lớn)</small>
                    </div>
                </div>
            </div>

            <!-- Thông tin thanh toán -->
            <div class="col-span-2">
                <h3 class="text-lg font-semibold mb-3">Thông tin thanh toán</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="col-span-1">
                        <div class="field">
                            <label for="totalPrice">Tổng tiền <span class="text-red-500">*</span></label>
                            <InputNumber id="totalPrice" v-model="localBooking.totalPrice" mode="currency" currency="VND" locale="vi-VN" :min="0" :class="{ 'p-invalid': submitted && !localBooking.totalPrice }" class="w-full" :disabled="true" />
                            <small class="p-error" v-if="submitted && !localBooking.totalPrice">Tổng tiền là bắt buộc.</small>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="finalPrice">Giá thanh toán cuối cùng</label>
                            <InputNumber id="finalPrice" v-model="localBooking.finalPrice" mode="currency" currency="VND" locale="vi-VN" :min="0" class="w-full" :disabled="true" />
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="paymentMethod">Phương thức thanh toán</label>
                            <Select id="paymentMethod" v-model="localBooking.paymentMethod" :options="actualPaymentMethods" optionLabel="label" optionValue="value" placeholder="Chọn phương thức thanh toán" class="w-full" />
                        </div>
                    </div>

                    <div class="col-span-1">
                        <div class="field">
                            <label for="paymentStatus">Trạng thái thanh toán</label>
                            <Select id="paymentStatus" v-model="localBooking.paymentStatus" :options="paymentStatuses" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái thanh toán" class="w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Trạng thái đặt phòng -->
            <div class="col-span-2">
                <div class="field">
                    <label for="status">Trạng thái đặt phòng</label>
                    <Select id="status" v-model="localBooking.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái" class="w-full" />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="hideDialog" v-tooltip.bottom="'Hủy thay đổi'" />
                <Button label="Lưu" icon="pi pi-check" class="p-button-text" @click="save" v-tooltip.bottom="'Lưu thay đổi'" />
            </div>
        </template>
    </Dialog>
    <Toast />
</template>

<style scoped>
.booking-dialog :deep(.p-dialog-content) {
    padding: 0;
    overflow-y: auto;
    max-height: 80vh;
}

.booking-dialog :deep(.p-dialog-header) {
    border-bottom: 1px solid var(--surface-border);
    padding: 1.25rem 1.5rem;
    background-color: var(--primary-color);
    color: var(--primary-color-text);
}

.booking-dialog :deep(.p-dialog-title) {
    font-size: 1.25rem;
    font-weight: 600;
}

.booking-dialog :deep(.p-dialog-footer) {
    border-top: 1px solid var(--surface-border);
    padding: 1.25rem 1.5rem;
    background-color: var(--surface-ground);
}

.booking-dialog :deep(.p-inputtext),
.booking-dialog :deep(.p-dropdown),
.booking-dialog :deep(.p-calendar),
.booking-dialog :deep(.p-inputnumber) {
    height: 2.5rem;
}

.booking-dialog :deep(.p-inputgroup-addon),
.booking-dialog :deep(.p-inputgroup .p-button) {
    height: 2.5rem;
    min-width: 2.5rem;
}

.booking-dialog :deep(.p-button.p-button-icon-only) {
    width: 2.5rem;
}

.booking-dialog :deep(.p-inputgroup) {
    align-items: stretch;
}

.booking-dialog :deep(.p-inputgroup .p-button) {
    height: 100%;
}

.booking-dialog :deep(.flex.items-stretch .p-button) {
    height: 100%;
}

@media screen and (max-width: 960px) {
    .booking-dialog :deep(.p-dialog-content) {
        padding: 1rem;
    }

    .field {
        margin-bottom: 1rem;
    }
}
</style>
