<template>
    <Dialog
        :visible="modelValue"
        @update:visible="$emit('update:modelValue', $event)"
        modal
        :style="{ width: '450px' }"
        class="p-fluid login-dialog"
    >
        <template #header>
            <div class="text-center w-full">
                <h3 class="text-xl font-bold text-gray-800 m-0">Đăng nhập</h3>
            </div>
        </template>

        <div class="text-center mb-6">
            <h3 class="text-lg font-semibold">
                <span class="text-amber-600">LUXURY</span><span class="text-slate-800">HOTEL</span>
            </h3>
            <p class="text-sm text-gray-600 mt-2">Đăng nhập để quản lý đặt phòng và nhận ưu đãi</p>
        </div>

        <div class="field mb-4">
            <label for="email" class="block text-sm font-medium mb-2">Email</label>
            <InputText id="email" v-model="loginData.email" type="email" class="w-full p-2" required />
            <small v-if="isSubmitted && !loginData.email" class="p-error">Email không được để trống</small>
        </div>

        <div class="field mb-4">
            <label for="password" class="block text-sm font-medium mb-2">Mật khẩu</label>
            <Password id="password" v-model="loginData.password" toggleMask class="w-full" :feedback="false" required />
            <small v-if="isSubmitted && !loginData.password" class="p-error">Mật khẩu không được để trống</small>
        </div>

        <div class="field-checkbox mb-4">
            <Checkbox id="remember" v-model="loginData.rememberMe" :binary="true" />
            <label for="remember" class="ml-2">Ghi nhớ đăng nhập</label>
        </div>

        <div class="flex flex-col">
            <Button
                type="button"
                label="Đăng nhập"
                class="w-full mb-3 py-2 font-medium bg-amber-600 hover:bg-amber-700 border-amber-600"
                @click="login"
            />

            <div class="flex justify-between items-center mt-3">
                <Button
                    type="button"
                    label="Quên mật khẩu?"
                    class="p-button-link p-button-sm text-amber-600"
                    @click="forgotPassword"
                />
                <Button
                    type="button"
                    label="Đăng ký tài khoản"
                    class="p-button-link p-button-sm text-amber-600"
                    @click="register"
                />
            </div>
        </div>
    </Dialog>
</template>

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
watch(() => props.modelValue, (newValue) => {
    // Khi giá trị prop thay đổi, emit event để cập nhật
    emit('update:modelValue', newValue);
});

const toast = useToast();
const router = useRouter();
const route = useRoute();
const isSubmitted = ref(false);

const loginData = reactive({
    email: '',
    password: '',
    rememberMe: false
});

const resetForm = () => {
    loginData.email = '';
    loginData.password = '';
    loginData.rememberMe = false;
    isSubmitted.value = false;
};

// Khi dialog đóng, reset form
watch(() => props.modelValue, (newValue) => {
    if (!newValue) {
        resetForm();
    }
});

const login = () => {
    isSubmitted.value = true;

    if (!loginData.email || !loginData.password) {
        return;
    }

    // Sử dụng AuthService.loginClient để đăng nhập
    const user = AuthService.loginClient(loginData.email, loginData.password);

    if (user) {
        toast.add({
            severity: 'success',
            summary: 'Đăng nhập thành công',
            detail: `Chào mừng ${user.name} quay trở lại!`,
            life: 3000
        });

        emit('update:modelValue', false);
        emit('login-success', user);

        // Chuyển hướng nếu cần
        const redirectPath = route.query.redirect;
        if (redirectPath) {
            router.push(redirectPath);
        }
    } else {
        toast.add({
            severity: 'error',
            summary: 'Đăng nhập thất bại',
            detail: 'Email hoặc mật khẩu không đúng',
            life: 3000
        });
    }
};

const register = () => {
    emit('register');
};

const forgotPassword = () => {
    emit('forgot-password');
};
</script>

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
