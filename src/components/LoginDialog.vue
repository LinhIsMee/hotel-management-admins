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
        return;
    }

    loading.value = true;

    try {
        // Sử dụng AuthService.loginClient để đăng nhập
        const user = await AuthService.loginClient(loginData.username, loginData.password);

        toast.add({
            severity: 'success',
            summary: 'Đăng nhập thành công',
            detail: `Chào mừng bạn quay trở lại!`,
            life: 3000
        });

        emit('update:modelValue', false);
        emit('login-success', user);

        // Chuyển hướng nếu cần
        const redirectPath = route.query.redirect;
        if (redirectPath) {
            router.push(redirectPath);
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Đăng nhập thất bại',
            detail: error.message || 'Đã xảy ra lỗi trong quá trình đăng nhập',
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
                <h3 class="text-xl font-bold text-gray-800 m-0">Sign In</h3>
            </div>
        </template>

        <div class="text-center mb-6">
            <h3 class="text-lg font-semibold"><span class="text-amber-600">LUXURY</span><span class="text-slate-800">HOTEL</span></h3>
            <p class="text-sm text-gray-600 mt-2">Sign in to manage bookings and receive benefits</p>
        </div>

        <div class="field mb-4">
            <label for="username" class="block text-sm font-medium mb-2">Username</label>
            <InputText id="username" v-model="loginData.username" type="text" class="w-full p-2" required />
            <small v-if="isSubmitted && !loginData.username" class="p-error">Username is required</small>
        </div>

        <div class="field mb-4">
            <label for="password" class="block text-sm font-medium mb-2">Password</label>
            <Password id="password" v-model="loginData.password" toggleMask class="w-full" :feedback="false" required />
            <small v-if="isSubmitted && !loginData.password" class="p-error">Password is required</small>
        </div>

        <div class="field-checkbox mb-4">
            <Checkbox id="remember" v-model="loginData.rememberMe" :binary="true" />
            <label for="remember" class="ml-2">Remember me</label>
        </div>

        <div class="flex flex-col">
            <Button type="button" label="Sign In" class="w-full mb-3 py-2 font-medium bg-amber-600 hover:bg-amber-700 border-amber-600" @click="login" :loading="loading" />

            <div class="flex justify-between items-center mt-3">
                <Button type="button" label="Forgot Password?" class="p-button-link p-button-sm text-amber-600" @click="forgotPassword" />
                <Button type="button" label="Register Account" class="p-button-link p-button-sm text-amber-600" @click="register" />
            </div>
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
