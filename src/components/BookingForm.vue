<template>
  <div class="booking-form bg-white shadow-lg rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Đặt phòng</h2>
    <form @submit.prevent="submitBooking">
      <!-- Ngày nhận - trả phòng -->
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Ngày nhận phòng</label>
        <Calendar v-model="bookingData.checkInDate" placeholder="Chọn ngày" class="w-full" showIcon minDate="new Date()" />
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Ngày trả phòng</label>
        <Calendar v-model="bookingData.checkOutDate" placeholder="Chọn ngày" class="w-full" showIcon :minDate="bookingData.checkInDate || new Date()" />
      </div>

      <!-- Số người -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-gray-700 mb-2">Người lớn</label>
          <Dropdown v-model="bookingData.adults" class="w-full" :options="[1, 2, 3, 4, 5]" placeholder="Số lượng" :disabled="maxOccupancy < 1" />
        </div>
        <div>
          <label class="block text-gray-700 mb-2">Trẻ em</label>
          <Dropdown v-model="bookingData.children" class="w-full" :options="[0, 1, 2, 3, 4]" placeholder="Số lượng" :disabled="remainingCapacity < 1" />
        </div>
      </div>

      <!-- Dịch vụ bổ sung -->
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Dịch vụ bổ sung</label>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Checkbox v-model="bookingData.services.breakfast" :binary="true" id="breakfast" class="mr-2" />
              <label for="breakfast">Bữa sáng</label>
            </div>
            <span class="text-gray-600">+150.000đ/người/ngày</span>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Checkbox v-model="bookingData.services.earlyCheckin" :binary="true" id="earlyCheckin" class="mr-2" />
              <label for="earlyCheckin">Nhận phòng sớm (trước 12h)</label>
            </div>
            <span class="text-gray-600">+200.000đ</span>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Checkbox v-model="bookingData.services.lateCheckout" :binary="true" id="lateCheckout" class="mr-2" />
              <label for="lateCheckout">Trả phòng muộn (sau 14h)</label>
            </div>
            <span class="text-gray-600">+200.000đ</span>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Checkbox v-model="bookingData.services.airportPickup" :binary="true" id="airportPickup" class="mr-2" />
              <label for="airportPickup">Đón tại sân bay</label>
            </div>
            <span class="text-gray-600">+350.000đ</span>
          </div>
        </div>
      </div>

      <!-- Mã giảm giá -->
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Mã giảm giá</label>
        <div class="flex">
          <InputText v-model="bookingData.couponCode" placeholder="Nhập mã giảm giá" class="w-full" />
          <Button type="button" label="Áp dụng" class="ml-2 bg-gray-600 hover:bg-gray-700" @click="applyCoupon" />
        </div>
        <div v-if="couponMessage" :class="{'text-green-600': couponValid, 'text-red-600': !couponValid}" class="mt-1 text-sm">
          {{ couponMessage }}
        </div>
      </div>

      <!-- Tổng cộng -->
      <div class="border-t border-gray-200 pt-4 mb-4">
        <div class="flex justify-between mb-2">
          <span>Giá phòng ({{ bookingDays }} đêm)</span>
          <span>{{ formatCurrency(roomPrice) }}</span>
        </div>

        <div v-if="breakfastTotal > 0" class="flex justify-between mb-2">
          <span>Bữa sáng ({{ bookingData.adults + bookingData.children }} người x {{ bookingDays }} ngày)</span>
          <span>{{ formatCurrency(breakfastTotal) }}</span>
        </div>

        <div v-if="bookingData.services.earlyCheckin" class="flex justify-between mb-2">
          <span>Nhận phòng sớm</span>
          <span>{{ formatCurrency(200000) }}</span>
        </div>

        <div v-if="bookingData.services.lateCheckout" class="flex justify-between mb-2">
          <span>Trả phòng muộn</span>
          <span>{{ formatCurrency(200000) }}</span>
        </div>

        <div v-if="bookingData.services.airportPickup" class="flex justify-between mb-2">
          <span>Đón tại sân bay</span>
          <span>{{ formatCurrency(350000) }}</span>
        </div>

        <div v-if="couponDiscount > 0" class="flex justify-between mb-2 text-green-600">
          <span>Giảm giá</span>
          <span>-{{ formatCurrency(couponDiscount) }}</span>
        </div>

        <div class="flex justify-between font-bold text-lg mt-2">
          <span>Tổng cộng</span>
          <span class="text-amber-600">{{ formatCurrency(totalPrice) }}</span>
        </div>
      </div>

      <Button type="submit" label="Đặt phòng ngay" icon="pi pi-calendar-plus" class="w-full bg-amber-600 hover:bg-amber-700" />
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  roomId: {
    type: String,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  maxOccupancy: {
    type: Number,
    required: true
  }
});

const router = useRouter();
const bookingData = ref({
  roomId: props.roomId,
  checkInDate: null,
  checkOutDate: null,
  adults: 2,
  children: 0,
  services: {
    breakfast: false,
    earlyCheckin: false,
    lateCheckout: false,
    airportPickup: false
  },
  couponCode: ''
});

const couponValid = ref(false);
const couponDiscount = ref(0);
const couponMessage = ref('');

// Tính toán số chỗ còn lại
const remainingCapacity = computed(() => {
  return props.maxOccupancy - bookingData.value.adults;
});

// Tính số ngày đặt phòng
const bookingDays = computed(() => {
  if (!bookingData.value.checkInDate || !bookingData.value.checkOutDate) return 0;

  const checkIn = new Date(bookingData.value.checkInDate);
  const checkOut = new Date(bookingData.value.checkOutDate);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
});

// Tính giá phòng cơ bản
const roomPrice = computed(() => {
  return bookingDays.value * props.pricePerNight;
});

// Tính giá bữa sáng nếu chọn
const breakfastTotal = computed(() => {
  if (!bookingData.value.services.breakfast) return 0;
  const totalPeople = bookingData.value.adults + bookingData.value.children;
  return totalPeople * bookingDays.value * 150000; // 150,000 VND/người/ngày
});

// Tính tổng tiền
const totalPrice = computed(() => {
  let total = roomPrice.value;

  // Thêm phí dịch vụ
  if (bookingData.value.services.breakfast) {
    total += breakfastTotal.value;
  }

  if (bookingData.value.services.earlyCheckin) {
    total += 200000;
  }

  if (bookingData.value.services.lateCheckout) {
    total += 200000;
  }

  if (bookingData.value.services.airportPickup) {
    total += 350000;
  }

  // Trừ giảm giá nếu có
  total -= couponDiscount.value;

  return total > 0 ? total : 0;
});

// Xử lý mã giảm giá
const applyCoupon = () => {
  if (!bookingData.value.couponCode) {
    couponMessage.value = 'Vui lòng nhập mã giảm giá';
    couponValid.value = false;
    return;
  }

  // Danh sách mã giảm giá demo
  const coupons = {
    'WELCOME10': { type: 'percent', value: 10 },
    'SUMMER20': { type: 'percent', value: 20 },
    'SAVE500K': { type: 'fixed', value: 500000 }
  };

  const coupon = coupons[bookingData.value.couponCode.toUpperCase()];

  if (coupon) {
    couponValid.value = true;

    if (coupon.type === 'percent') {
      couponDiscount.value = (roomPrice.value * coupon.value) / 100;
      couponMessage.value = `Giảm ${coupon.value}% tổng hóa đơn`;
    } else {
      couponDiscount.value = coupon.value;
      couponMessage.value = `Giảm ${formatCurrency(coupon.value)}`;
    }
  } else {
    couponValid.value = false;
    couponDiscount.value = 0;
    couponMessage.value = 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
  }
};

// Format tiền tệ
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Xử lý đặt phòng
const submitBooking = () => {
  if (!bookingData.value.checkInDate || !bookingData.value.checkOutDate) {
    alert('Vui lòng chọn ngày nhận và trả phòng');
    return;
  }

  // Kiểm tra số người tối đa
  if (bookingData.value.adults + bookingData.value.children > props.maxOccupancy) {
    alert(`Phòng này chỉ có thể chứa tối đa ${props.maxOccupancy} người`);
    return;
  }

  // Lưu thông tin đặt phòng vào localStorage
  const bookingInfo = {
    ...bookingData.value,
    pricePerNight: props.pricePerNight,
    totalPrice: totalPrice.value,
    bookingDays: bookingDays.value,
    timestamp: new Date().toISOString()
  };

  localStorage.setItem('currentBooking', JSON.stringify(bookingInfo));

  // Chuyển hướng tới trang xác nhận đặt phòng
  router.push('/booking/checkout');
};

// Theo dõi thay đổi số lượng người lớn để điều chỉnh số trẻ em tối đa
watch(() => bookingData.value.adults, (newValue) => {
  if (newValue + bookingData.value.children > props.maxOccupancy) {
    bookingData.value.children = Math.max(0, props.maxOccupancy - newValue);
  }
});

// Theo dõi mã giảm giá và reset thông báo khi thay đổi
watch(() => bookingData.value.couponCode, () => {
  couponMessage.value = '';
  couponValid.value = false;
  couponDiscount.value = 0;
});

// Export các giá trị và phương thức
defineExpose({
  bookingData,
  submitBooking
});
</script>
