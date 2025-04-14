<script setup>
import AuthService from '@/services/AuthService';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

// Import các component PrimeVue (nếu cần thiết, ở đây để hỗ trợ phát triển)
// Mặc dù đã đăng ký globally ở main.js
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';

const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['update:visible', 'register', 'forgot-password', 'login-success']);

const router = useRouter();
const form = reactive({
    username: '',
    password: '',
    rememberMe: false
});

const loading = ref(false);
const errorMessage = ref('');
const submitted = ref(false);

const validateForm = () => {
    submitted.value = true;

    return !!form.username && !!form.password;
};

const login = async () => {
    if (!validateForm()) {
        return;
    }

    loading.value = true;
    errorMessage.value = '';

    try {
        const result = await AuthService.loginClient({
            username: form.username,
            password: form.password
        });

        emit('login-success', result.user);
        emit('update:visible', false);

        // Reset form
        form.username = '';
        form.password = '';
        form.rememberMe = false;
        submitted.value = false;
    } catch (error) {
        errorMessage.value = error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
    } finally {
        loading.value = false;
    }
};

const showRegisterModal = () => {
    emit('update:visible', false);
    emit('register');
};

const showForgotPasswordModal = () => {
    emit('update:visible', false);
    emit('forgot-password');
};
</script>

<template>
    <Dialog
        v-model:visible="props.visible"
        modal
        header="Đăng nhập"
        :style="{ width: '450px' }"
        :closable="true"
        @update:visible="$emit('update:visible', $event)"
    >
        <div v-if="errorMessage" class="p-4 mb-4 bg-red-100 text-red-700 border-round flex align-items-center">
            <i class="pi pi-exclamation-circle mr-2"></i>
            <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="login" class="space-y-4">
            <div>
                <label for="username" class="block text-900 font-medium mb-2">Tên đăng nhập</label>
                <InputText
                    id="username"
                    v-model="form.username"
                    type="text"
                    class="w-full"
                    :class="{ 'p-invalid': submitted && !form.username }"
                    placeholder="Nhập tên đăng nhập"
                />
                <small v-if="submitted && !form.username" class="p-error">Vui lòng nhập tên đăng nhập</small>
            </div>

            <div>
                <label for="password" class="block text-900 font-medium mb-2">Mật khẩu</label>
                <Password
                    id="password"
                    v-model="form.password"
                    :toggleMask="true"
                    :class="{ 'p-invalid': submitted && !form.password }"
                    class="w-full"
                    :feedback="false"
                    placeholder="Nhập mật khẩu"
                />
                <small v-if="submitted && !form.password" class="p-error">Vui lòng nhập mật khẩu</small>
            </div>

            <div class="flex align-items-center">
                <div class="flex align-items-center">
                    <Checkbox id="rememberme" v-model="form.rememberMe" :binary="true" class="mr-2" />
                    <label for="rememberme">Ghi nhớ đăng nhập</label>
                </div>
                <a @click="showForgotPasswordModal" class="font-medium no-underline text-amber-600 cursor-pointer ml-auto">Quên mật khẩu?</a>
            </div>

            <Button type="submit" label="Đăng nhập" :loading="loading" class="w-full" />

            <div class="text-center pt-2">
                <span class="text-600 font-medium">Chưa có tài khoản?</span>
                <a @click="showRegisterModal" class="font-medium no-underline ml-2 text-amber-600 cursor-pointer">Đăng ký ngay</a>
            </div>
        </form>
    </Dialog>
</template>
