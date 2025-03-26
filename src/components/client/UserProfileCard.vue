<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
  user: Object
});

// Mock ảnh avatar mặc định
const defaultAvatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
const userAvatar = ref(defaultAvatar);

onMounted(() => {
  if (props.user && props.user.avatar) {
    userAvatar.value = props.user.avatar;
  }
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="bg-amber-500 h-24"></div>
    <div class="px-6 pb-6">
      <div class="flex justify-center">
        <img :src="userAvatar" alt="Avatar" class="w-24 h-24 rounded-full border-4 border-white -mt-12 object-cover" />
      </div>
      <div class="text-center mt-2">
        <h3 class="text-xl font-bold text-gray-800">{{ user.name }}</h3>
        <p class="text-gray-600">{{ user.email }}</p>
      </div>

      <div class="mt-6 space-y-2">
        <div class="flex items-center text-gray-700">
          <i class="pi pi-user mr-2"></i>
          <span>Khách hàng từ {{ new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN') }}</span>
        </div>
        <div class="flex items-center text-gray-700">
          <i class="pi pi-phone mr-2"></i>
          <span>{{ user.phone || 'Chưa cập nhật' }}</span>
        </div>
        <div class="flex items-center text-gray-700">
          <i class="pi pi-map-marker mr-2"></i>
          <span>{{ user.address || 'Chưa cập nhật' }}</span>
        </div>
      </div>

      <div class="mt-6">
        <Button label="Sửa thông tin" icon="pi pi-pencil" class="w-full" />
      </div>
    </div>
  </div>
</template>
