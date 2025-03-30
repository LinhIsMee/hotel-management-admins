<template>
  <Dialog v-model:visible="visible" modal header="Đăng nhập" :style="{ width: '400px' }">
    <div class="flex flex-col space-y-4">
      <div class="text-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">Đăng nhập</h2>
        <p class="text-gray-600 text-sm">Đăng nhập để đặt phòng và nhận nhiều ưu đãi</p>
      </div>

      <div class="space-y-4">
        <div class="flex flex-col space-y-2">
          <label for="email" class="text-sm font-medium text-gray-700">Email</label>
          <InputText id="email" v-model="email" placeholder="Nhập email của bạn" class="w-full p-3" />
        </div>

        <div class="flex flex-col space-y-2">
          <label for="password" class="text-sm font-medium text-gray-700">Mật khẩu</label>
          <Password id="password" v-model="password" placeholder="Nhập mật khẩu" toggleMask class="w-full" />
        </div>

        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <Checkbox v-model="rememberMe" :binary="true" id="remember-me" />
            <label for="remember-me" class="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</label>
          </div>
          <a href="#" class="text-sm text-amber-600 hover:text-amber-800">Quên mật khẩu?</a>
        </div>

        <Button label="Đăng nhập" class="w-full bg-amber-600 hover:bg-amber-700" @click="login" />

        <div class="relative flex items-center justify-center">
          <div class="border-t border-gray-300 w-full absolute"></div>
          <div class="bg-white px-2 z-10 text-sm text-gray-500">hoặc</div>
        </div>

        <!-- Đăng nhập với Google/Facebook -->
        <div class="space-y-2">
          <Button label="Đăng nhập với Google" icon="pi pi-google" class="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" />
          <Button label="Đăng nhập với Facebook" icon="pi pi-facebook" class="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" />
        </div>
      </div>

      <div class="text-center text-sm text-gray-600">
        Bạn chưa có tài khoản? <a href="#" @click.prevent="showRegister" class="text-amber-600 hover:text-amber-800">Đăng ký ngay</a>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue';

const visible = defineModel('visible');
const email = ref('');
const password = ref('');
const rememberMe = ref(false);

const emit = defineEmits(['register', 'login-success']);

const login = () => {
  // Xử lý đăng nhập
  emit('login-success');
};

const showRegister = () => {
  emit('register');
};
</script>
