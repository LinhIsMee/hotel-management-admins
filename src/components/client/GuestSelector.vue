<script setup>
import { ref, computed, watch } from 'vue';
import Dropdown from 'primevue/dropdown';

/**
 * Component tái sử dụng cho việc chọn người lớn và trẻ em có độ tuổi
 * Có thể sử dụng ở nhiều trang khác nhau: trang chủ, danh sách phòng, chi tiết phòng
 */

const props = defineProps({
  /**
   * Số người lớn hiện tại
   */
  adults: {
    type: Number,
    default: 1
  },
  /**
   * Số trẻ em hiện tại
   */
  children: {
    type: Number,
    default: 0
  },
  /**
   * Mảng các tuổi của trẻ em
   */
  childrenAges: {
    type: Array,
    default: () => []
  },
  /**
   * Số người tối đa cho phép
   */
  maxOccupancy: {
    type: Number,
    default: 5
  },
  /**
   * Số người lớn tối thiểu
   */
  minAdults: {
    type: Number,
    default: 1
  },
  /**
   * Số người lớn tối đa
   */
  maxAdults: {
    type: Number,
    default: 5
  },
  /**
   * Số trẻ em tối đa
   */
  maxChildren: {
    type: Number,
    default: 4
  },
  /**
   * Vị trí hiển thị dropdown
   * 'bottom' (mặc định): Dropdown hiển thị phía dưới
   * 'top': Dropdown hiển thị phía trên
   */
  position: {
    type: String,
    default: 'bottom',
    validator: (value) => ['top', 'bottom'].includes(value)
  }
});

// Phát ra các sự kiện khi có thay đổi
const emit = defineEmits(['update:adults', 'update:children', 'update:childrenAges', 'close']);

// Dữ liệu cục bộ
const localAdults = ref(props.adults);
const localChildren = ref(props.children);
const localChildrenAges = ref([...props.childrenAges]);

// Tạo mảng các độ tuổi từ 0-17
const ageOptions = computed(() => {
  return Array.from({ length: 18 }, (_, i) => ({
    label: `${i} tuổi`,
    value: i
  }));
});

// Tổng số khách (người lớn + trẻ em)
const totalGuests = computed(() => {
  return localAdults.value + localChildren.value;
});

// Ngăn chặn sự kiện click lan ra ngoài khi chọn tuổi trẻ em
const stopPropagation = (event) => {
  event.stopPropagation();
};

// Các phương thức xử lý thay đổi
const increaseAdults = () => {
  if (localAdults.value < props.maxAdults && totalGuests.value < props.maxOccupancy) {
    localAdults.value++;
    emit('update:adults', localAdults.value);
  }
};

const decreaseAdults = () => {
  if (localAdults.value > props.minAdults) {
    localAdults.value--;
    emit('update:adults', localAdults.value);
  }
};

const increaseChildren = () => {
  if (localChildren.value < props.maxChildren && totalGuests.value < props.maxOccupancy) {
    localChildren.value++;
    localChildrenAges.value.push(0); // Thêm tuổi mặc định cho trẻ em mới
    emit('update:children', localChildren.value);
    emit('update:childrenAges', [...localChildrenAges.value]);
  }
};

const decreaseChildren = () => {
  if (localChildren.value > 0) {
    localChildren.value--;
    localChildrenAges.value.pop(); // Xóa tuổi của trẻ em cuối cùng
    emit('update:children', localChildren.value);
    emit('update:childrenAges', [...localChildrenAges.value]);
  }
};

// Xử lý khi thay đổi độ tuổi của trẻ em
const handleAgeChange = (index, value) => {
  localChildrenAges.value[index] = value;
  emit('update:childrenAges', [...localChildrenAges.value]);
};

// Đồng bộ dữ liệu khi props thay đổi
watch(() => props.adults, (newVal) => {
  localAdults.value = newVal;
});

watch(() => props.children, (newVal) => {
  localChildren.value = newVal;

  // Đảm bảo mảng tuổi trẻ em có đúng kích thước
  if (localChildrenAges.value.length < newVal) {
    // Thêm các tuổi mặc định nếu thiếu
    const diff = newVal - localChildrenAges.value.length;
    for (let i = 0; i < diff; i++) {
      localChildrenAges.value.push(0);
    }
  } else if (localChildrenAges.value.length > newVal) {
    // Cắt bớt mảng nếu thừa
    localChildrenAges.value = localChildrenAges.value.slice(0, newVal);
  }
});

watch(() => props.childrenAges, (newVal) => {
  localChildrenAges.value = [...newVal];
});

// Xử lý đóng dropdown và cập nhật giá trị
const handleDone = () => {
  emit('close');
};
</script>

<template>
  <div class="guest-selector" @click="stopPropagation">
    <!-- Thông tin chính sách giá phòng theo tuổi -->
    <div class="mb-4 text-xs text-gray-600 p-2 bg-blue-50 rounded-md">
      <div class="font-medium text-blue-700 mb-1">Chính sách giá theo độ tuổi:</div>
      <ul class="list-disc pl-4 space-y-1">
        <li>Trẻ em 0-6 tuổi: Miễn phí</li>
        <li>Trẻ em 7-11 tuổi: Giảm 50%</li>
        <li>Từ 12 tuổi trở lên: Tính như người lớn</li>
      </ul>
    </div>

    <!-- Thông tin số người tối đa -->
    <div v-if="maxOccupancy" class="text-sm text-gray-500 mb-4">
      Tối đa {{ maxOccupancy }} người
    </div>

    <!-- Người lớn -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="font-medium">Người lớn</div>
        <div class="text-sm text-gray-500">Từ 12 tuổi trở lên</div>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
          :class="{ 'opacity-50 cursor-not-allowed': localAdults <= minAdults }"
          @click="decreaseAdults"
          :disabled="localAdults <= minAdults">
          <i class="pi pi-minus text-sm"></i>
        </button>
        <span class="w-6 text-center">{{ localAdults }}</span>
        <button
          class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
          :class="{ 'opacity-50 cursor-not-allowed': localAdults >= maxAdults || totalGuests >= maxOccupancy }"
          @click="increaseAdults"
          :disabled="localAdults >= maxAdults || totalGuests >= maxOccupancy">
          <i class="pi pi-plus text-sm"></i>
        </button>
      </div>
    </div>

    <!-- Trẻ em -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="font-medium">Trẻ em</div>
        <div class="text-sm text-gray-500">0-11 tuổi</div>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
          :class="{ 'opacity-50 cursor-not-allowed': localChildren <= 0 }"
          @click="decreaseChildren"
          :disabled="localChildren <= 0">
          <i class="pi pi-minus text-sm"></i>
        </button>
        <span class="w-6 text-center">{{ localChildren }}</span>
        <button
          class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
          :class="{ 'opacity-50 cursor-not-allowed': localChildren >= maxChildren || totalGuests >= maxOccupancy }"
          @click="increaseChildren"
          :disabled="localChildren >= maxChildren || totalGuests >= maxOccupancy">
          <i class="pi pi-plus text-sm"></i>
        </button>
      </div>
    </div>

    <!-- Độ tuổi từng trẻ em -->
    <div v-if="localChildren > 0" class="mb-4">
      <div class="text-sm font-medium text-gray-700 mb-2">Độ tuổi của từng trẻ em</div>
      <div class="space-y-2">
        <div v-for="(age, index) in localChildrenAges" :key="index" class="flex items-center gap-2">
          <span class="text-sm text-gray-600 w-24">Trẻ em {{ index + 1 }}</span>
          <Dropdown
            :modelValue="localChildrenAges[index]"
            :options="ageOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn tuổi"
            class="w-full dropdown-prevent-close"
            @update:modelValue="(value) => handleAgeChange(index, value)"
            @click.stop
            :appendTo="'body'"
          />
        </div>
      </div>
      <div class="text-xs text-gray-500 mt-2">
        Để tính chính xác giá phòng và phục vụ đúng nhu cầu của bạn
      </div>
    </div>

    <button @click="handleDone"
      class="w-full mt-4 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors">
      Xong
    </button>
  </div>
</template>

<style scoped>
.guest-selector {
  width: 100%;
  max-width: 300px;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  z-index: 50;
}

:deep(.dropdown-prevent-close .p-dropdown-panel) {
  z-index: 100 !important;
}

:deep(.p-dropdown-items-wrapper) {
  max-height: 200px !important;
}

/* Fix dropdown click để không đóng menu */
:deep(.p-dropdown) {
  width: 100%;
}

:deep(.p-dropdown-panel) {
  z-index: 9999 !important;
}

/* Tùy chỉnh dropdown cho các device nhỏ */
@media (max-width: 640px) {
  .guest-selector {
    max-width: none;
    width: calc(100% - 2rem);
  }
}
</style>
