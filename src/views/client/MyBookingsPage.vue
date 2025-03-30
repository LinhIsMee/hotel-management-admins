<template>
  <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
    <div class="flex flex-col md:flex-row gap-3">
      <div>
        <label class="block text-gray-700 mb-1 text-sm">Trạng thái</label>
        <Dropdown
          v-model="filters.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Tất cả trạng thái"
          class="w-full md:w-auto"
        />
      </div>
      <div>
        <label class="block text-gray-700 mb-1 text-sm">Thời gian</label>
        <Dropdown
          v-model="filters.timeframe"
          :options="timeframeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Tất cả thời gian"
          class="w-full md:w-auto"
        />
      </div>
    </div>

    <div>
      <label class="block text-gray-700 mb-1 text-sm">Tìm kiếm</label>
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search" />
        <InputText v-model="filters.search" placeholder="Tìm theo mã đặt phòng, tên phòng..." class="w-full" />
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';

const router = useRouter();
const toast = useToast();
const loading = ref(true);
const bookings = ref([]);
const isLoggedIn = ref(false);
const defaultRoomImage = nha_nghi_1;

// Thông tin phân trang
const first = ref(0);
const rows = ref(10);
const totalBookings = ref(0);

// Dialog xác nhận hủy
const cancelDialogVisible = ref(false);
const cancelling = ref(false);
const bookingToCancel = ref(null);

// Bộ lọc
const filters = ref({
  status: null,
  timeframe: null,
  search: ''
});

// Các option cho dropdown
const statusOptions = [
  { label: 'Tất cả trạng thái', value: null },
  { label: 'Mới', value: 'NEW' },
  { label: 'Đã xác nhận', value: 'CONFIRMED' },
  { label: 'Đã nhận phòng', value: 'CHECK_IN' },
  { label: 'Đã trả phòng', value: 'CHECK_OUT' },
  { label: 'Đã hủy', value: 'CANCELLED' }
];

const timeframeOptions = [
  { label: 'Tất cả thời gian', value: null },
  { label: 'Sắp tới', value: 'upcoming' },
  { label: 'Đang lưu trú', value: 'current' },
  { label: 'Đã hoàn thành', value: 'completed' },
  { label: '30 ngày qua', value: 'last30' },
  { label: '90 ngày qua', value: 'last90' }
];

// Tải dữ liệu khi trang được mount
onMounted(async () => {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      isLoggedIn.value = true;

      // Giả lập tải dữ liệu đặt phòng
      await loadBookings();
    }
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu đặt phòng:', error);
  } finally {
    loading.value = false;
  }
});

// Tải danh sách đặt phòng
const loadBookings = async () => {
  loading.value = true;

  try {
    // Giả lập API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dữ liệu mẫu
    const mockBookings = [
      {
        id: 'B123456',
        roomId: 'R001',
        roomName: 'Phòng Deluxe',
        roomImage: nha_nghi_1,
        checkInDate: '2023-12-25',
        checkOutDate: '2023-12-28',
        adults: 2,
        children: 0,
        totalPrice: 3600000,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: 'CREDIT_CARD',
        createdAt: '2023-12-01T10:30:00Z'
      },
      {
        id: 'B789012',
        roomId: 'R002',
        roomName: 'Phòng Superior',
        roomImage: null,
        checkInDate: '2024-01-15',
        checkOutDate: '2024-01-20',
        adults: 2,
        children: 1,
        totalPrice: 5500000,
        status: 'NEW',
        paymentStatus: 'UNPAID',
        paymentMethod: 'BANK_TRANSFER',
        createdAt: '2023-12-05T14:20:00Z'
      },
      {
        id: 'B345678',
        roomId: 'R003',
        roomName: 'Phòng Family',
        roomImage: null,
        checkInDate: '2023-11-10',
        checkOutDate: '2023-11-15',
        adults: 2,
        children: 2,
        totalPrice: 7200000,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paymentMethod: 'MOMO',
        createdAt: '2023-10-20T09:15:00Z'
      }
    ];

    bookings.value = mockBookings;
    totalBookings.value = mockBookings.length;
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu đặt phòng:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải dữ liệu đặt phòng',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

// Lọc danh sách đặt phòng
const filteredBookings = computed(() => {
  if (!bookings.value.length) return [];

  return bookings.value.filter(booking => {
    // Lọc theo trạng thái
    if (filters.value.status && booking.status !== filters.value.status) {
      return false;
    }

    // Lọc theo khoảng thời gian
    if (filters.value.timeframe) {
      const now = new Date();
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);

      if (filters.value.timeframe === 'upcoming' && checkIn < now) {
        return false;
      }

      if (filters.value.timeframe === 'current' && (checkIn > now || checkOut < now)) {
        return false;
      }

      if (filters.value.timeframe === 'completed' && checkOut > now) {
        return false;
      }

      if (filters.value.timeframe === 'last30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (new Date(booking.createdAt) < thirtyDaysAgo) {
          return false;
        }
      }

      if (filters.value.timeframe === 'last90') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);
        if (new Date(booking.createdAt) < ninetyDaysAgo) {
          return false;
        }
      }
    }

    // Lọc theo từ khóa tìm kiếm
    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase();
      return (
        booking.id.toLowerCase().includes(searchLower) ||
        booking.roomName.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
});

// Format tiền tệ
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Format ngày
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Tính số ngày đặt phòng
const getDays = (booking) => {
  if (!booking.checkInDate || !booking.checkOutDate) return 0;

  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};

// Lấy class và label cho trạng thái đặt phòng
const getStatusClass = (status) => {
  switch (status) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800';
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';
    case 'CHECK_IN':
      return 'bg-amber-100 text-amber-800';
    case 'CHECK_OUT':
      return 'bg-purple-100 text-purple-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'NEW':
      return 'Mới';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'CHECK_IN':
      return 'Đã nhận phòng';
    case 'CHECK_OUT':
      return 'Đã trả phòng';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status;
  }
};

// Lấy class và label cho trạng thái thanh toán
const getPaymentStatusClass = (paymentStatus) => {
  switch (paymentStatus) {
    case 'PAID':
      return 'inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold';
    case 'UNPAID':
      return 'inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold';
    case 'PARTIAL':
      return 'inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold';
    case 'REFUNDED':
      return 'inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold';
    default:
      return 'inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold';
  }
};

const getPaymentStatusLabel = (paymentStatus) => {
  switch (paymentStatus) {
    case 'PAID':
      return 'Đã thanh toán';
    case 'UNPAID':
      return 'Chưa thanh toán';
    case 'PARTIAL':
      return 'Đã đặt cọc';
    case 'REFUNDED':
      return 'Đã hoàn tiền';
    default:
      return paymentStatus;
  }
};

// Kiểm tra có thể hủy đơn không
const canCancel = (booking) => {
  if (booking.status === 'CANCELLED' || booking.status === 'CHECK_IN' || booking.status === 'CHECK_OUT') {
    return false;
  }

  const now = new Date();
  const checkIn = new Date(booking.checkInDate);

  // Có thể hủy nếu chưa đến ngày check-in
  return checkIn > now;
};

// Xác nhận hủy đặt phòng
const confirmCancelBooking = (booking) => {
  bookingToCancel.value = booking;
  cancelDialogVisible.value = true;
};

// Hủy đặt phòng
const cancelBooking = async () => {
  if (!bookingToCancel.value) return;

  cancelling.value = true;

  try {
    // Giả lập API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Cập nhật trạng thái
    const index = bookings.value.findIndex(b => b.id === bookingToCancel.value.id);
    if (index !== -1) {
      bookings.value[index].status = 'CANCELLED';
    }

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đã hủy đặt phòng thành công',
      life: 3000
    });
  } catch (error) {
    console.error('Lỗi khi hủy đặt phòng:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể hủy đặt phòng',
      life: 3000
    });
  } finally {
    cancelling.value = false;
    cancelDialogVisible.value = false;
    bookingToCancel.value = null;
  }
};

// Xem chi tiết đặt phòng
const viewBookingDetails = (bookingId) => {
  router.push(`/booking/confirmation/${bookingId}`);
};

// Mở modal đăng nhập
const openLoginModal = () => {
  // Trigger sự kiện để hiển thị login dialog
  const event = new CustomEvent('show-login-dialog');
  window.dispatchEvent(event);
};

// Xử lý phân trang
const onPageChange = (event) => {
  first.value = event.first;
  rows.value = event.rows;

  // Trong thực tế, sẽ call API với params pagination
  // loadBookings(event.page + 1, event.rows);
};
</script>
