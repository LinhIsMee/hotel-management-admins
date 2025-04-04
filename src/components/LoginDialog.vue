<script setup>
import AuthService from '@/services/AuthService';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'login-success', 'register', 'forgot-password']);

// Theo dõi thay đổi trên prop modelValue
watch(
    () => props.modelValue,
    (newValue) => {
        // Khi giá trị prop thay đổi, emit event để cập nhật
        emit('update:modelValue', newValue);
    }
);

const toast = useToast();
const router = useRouter();
const route = useRoute();
const isSubmitted = ref(false);
const loading = ref(false);

const loginData = reactive({
    username: '',
    password: '',
    rememberMe: false
});

const resetForm = () => {
    loginData.username = '';
    loginData.password = '';
    loginData.rememberMe = false;
    isSubmitted.value = false;
};

// Khi dialog đóng, reset form
watch(
    () => props.modelValue,
    (newValue) => {
        if (!newValue) {
            resetForm();
        }
    }
);

const login = async () => {
    isSubmitted.value = true;

    if (!loginData.username || !loginData.password) {
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Vui lòng nhập đầy đủ thông tin đăng nhập',
            life: 3000
        });
        return;
    }

    loading.value = true;

    try {
        const result = await AuthService.loginClient({
            username: loginData.username,
            password: loginData.password
        });

        // Đóng dialog
        emit('update:modelValue', false);

        // Gửi sự kiện đăng nhập thành công
        emit('login-success', result);

        // Redirect nếu có
        if (route.query.redirect) {
            router.push(route.query.redirect);
        }

        // Thông báo đăng nhập thành công
        toast.add({
            severity: 'success',
            summary: 'Đăng nhập thành công',
            detail: 'Chào mừng bạn quay trở lại!',
            life: 3000
        });
    } catch (error) {
        console.error('Login error:', error);
        toast.add({
            severity: 'error',
            summary: 'Đăng nhập thất bại',
            detail: error.message || 'Tên đăng nhập hoặc mật khẩu không chính xác',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const register = () => {
    emit('register');
};

const forgotPassword = () => {
    emit('forgot-password');
};
</script>

<template>
    <Dialog :visible="modelValue" @update:visible="$emit('update:modelValue', $event)" modal :style="{ width: '450px' }" class="p-fluid login-dialog">
        <template #header>
            <div class="text-center w-full">
                <h3 class="text-xl font-bold text-gray-800 m-0">Đăng Nhập</h3>
            </div>
        </template>

        <div class="text-center mb-6">
            <h3 class="text-lg font-semibold"><span class="text-amber-600">LUXURY</span><span class="text-slate-800">HOTEL</span></h3>
            <p class="text-sm text-gray-600 mt-2">Đăng nhập để quản lý đặt phòng và nhận ưu đãi</p>
        </div>

        <div class="p-field mb-3">
            <label for="username" class="block text-gray-700 font-medium mb-2">Tên đăng nhập</label>
            <span class="p-input-icon-left w-full">
                <i class="pi pi-user"></i>
                <InputText
                    id="username"
                    v-model="loginData.username"
                    placeholder="Nhập tên đăng nhập"
                    class="w-full"
                    :class="{ 'p-invalid': isSubmitted && !loginData.username }"
                />
            </span>
            <small v-if="isSubmitted && !loginData.username" class="p-error block mt-1">Vui lòng nhập tên đăng nhập</small>
        </div>

        <div class="p-field mb-4">
            <label for="password" class="block text-gray-700 font-medium mb-2">Mật khẩu</label>
            <span class="p-input-icon-left w-full">
                <i class="pi pi-lock"></i>
                <Password
                    id="password"
                    v-model="loginData.password"
                    placeholder="Nhập mật khẩu"
                    toggleMask
                    class="w-full"
                    :class="{ 'p-invalid': isSubmitted && !loginData.password }"
                    :feedback="false"
                />
            </span>
            <small v-if="isSubmitted && !loginData.password" class="p-error block mt-1">Vui lòng nhập mật khẩu</small>
        </div>

        <div class="flex justify-content-between align-items-center mb-4">
            <div class="p-field-checkbox">
                <Checkbox v-model="loginData.rememberMe" :binary="true" id="rememberMe" />
                <label for="rememberMe" class="ml-2 cursor-pointer">Nhớ đăng nhập</label>
            </div>
            <a @click="forgotPassword" class="text-blue-500 hover:text-blue-700 cursor-pointer no-underline">Quên mật khẩu?</a>
        </div>

        <Button
            type="button"
            label="Đăng nhập"
            class="w-full p-button-primary mb-3"
            :loading="loading"
            @click="login"
        />

        <div class="text-center">
            <span>Chưa có tài khoản? </span>
            <a @click="register" class="text-blue-500 hover:text-blue-700 cursor-pointer font-medium no-underline">Đăng ký ngay</a>
        </div>
    </Dialog>
</template>

<style scoped>
:deep(.login-dialog) {
    border-radius: 12px;
    overflow: hidden;
}

:deep(.login-dialog .p-dialog-header) {
    padding: 1.5rem 1.5rem 0.5rem;
    border-bottom: none;
}

:deep(.login-dialog .p-dialog-title) {
    font-weight: 700;
    font-size: 1.25rem;
    margin: 0 auto;
}

:deep(.login-dialog .p-dialog-content) {
    padding: 1.5rem;
}

:deep(.login-dialog .p-inputtext) {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
}

:deep(.login-dialog .p-password-input) {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
}

:deep(.login-dialog .p-button) {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
}
</style>
