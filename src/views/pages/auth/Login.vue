<script setup>
import AuthService from '@/services/AuthService';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);
const errorMessage = ref('');

onMounted(() => {
    // Kiểm tra nếu đã đăng nhập admin, chuyển hướng đến dashboard
    if (AuthService.isAdminAuthenticated()) {
        router.push('/admin/dashboard');
    }

    // Nếu có lưu thông tin đăng nhập
    const savedUsername = localStorage.getItem('admin_username');
    if (savedUsername) {
        username.value = savedUsername;
        rememberMe.value = true;
    }
});

const login = async () => {
    if (!username.value || !password.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Please enter username and password',
            life: 3000
        });
        return;
    }

    loading.value = true;
    errorMessage.value = '';

    try {
        console.log('Attempting admin login with:', username.value);

        // Thử trực tiếp gọi API để kiểm tra
        const response = await fetch(`http://103.82.24.35:9000/api/v1/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        });

        console.log('Login response status:', response.status);

        if (!response.ok) {
            errorMessage.value = `Login failed with status: ${response.status}`;
            toast.add({
                severity: 'error',
                summary: 'Login Failed',
                detail: errorMessage.value,
                life: 3000
            });
            loading.value = false;
            return;
        }

        const data = await response.json();
        console.log('Login response data:', data);

        if (!data || !data.accessToken) {
            errorMessage.value = 'Invalid response format from server';
            toast.add({
                severity: 'error',
                summary: 'Login Failed',
                detail: errorMessage.value,
                life: 3000
            });
            loading.value = false;
            return;
        }

        // Lưu thông tin vào localStorage
        const adminInfo = {
            id: data.userId || 0,
            username: username.value,
            accessToken: data.accessToken,
            token: data.token || data.accessToken,
            role: data.role || 'ROLE_ADMIN'
        };

        localStorage.setItem(TOKEN_KEY_ADMIN, JSON.stringify(adminInfo));

        if (rememberMe.value) {
            localStorage.setItem('admin_username', username.value);
        }

        toast.add({
            severity: 'success',
            summary: 'Login Successful',
            detail: 'Welcome to the administration system',
            life: 3000
        });

        // Chuyển hướng đến trang dashboard hoặc trang chỉ định
        const redirectPath = route.query.redirect || '/admin/dashboard';
        router.push(redirectPath);
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.value = error.message || 'An error occurred during login';
        toast.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: errorMessage.value,
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

function goToClientSite() {
    router.push('/');
}
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <div class="text-center mb-6">
                <h5 class="text-2xl font-bold mb-2"><span class="text-amber-600">LUXURY</span><span class="text-slate-800">HOTEL</span></h5>
                <p class="text-slate-600">Sign in to the administration system</p>
            </div>

            <div v-if="errorMessage" class="p-3 bg-red-50 text-red-600 rounded-lg mb-4 text-sm">
                {{ errorMessage }}
            </div>

            <div class="mb-4">
                <label for="username" class="block font-medium text-gray-700 mb-1">Username</label>
                <InputText id="username" v-model="username" type="text" class="w-full" placeholder="Enter username" />
            </div>

            <div class="mb-4">
                <label for="password" class="block font-medium text-gray-700 mb-1">Password</label>
                <Password id="password" v-model="password" :feedback="false" toggleMask class="w-full" placeholder="Enter password" />
            </div>

            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <Checkbox id="rememberme" v-model="rememberMe" :binary="true" />
                    <label for="rememberme" class="ml-2 text-sm text-gray-600">Remember me</label>
                </div>
                <a href="/auth/forgot-password" class="text-sm text-blue-600 hover:underline">Forgot password?</a>
            </div>

            <Button label="Sign In" @click="login" class="login-button w-full" :loading="loading" />

            <div class="text-center mt-4">
                <Button label="Back to Main Site" class="p-button-link" @click="goToClientSite" />
            </div>

            <div class="text-center mt-4 text-sm text-gray-600">© 2023 LUXURY HOTEL. All rights reserved.</div>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 1rem;
    background-image: url('/images/hotel-background.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.login-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(240, 240, 240, 0.7);
    z-index: -1;
}

.login-card {
    width: 100%;
    max-width: 400px;
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 10;
}

:deep(.p-inputtext) {
    padding: 0.75rem 1rem;
    border-radius: 10px;
    background-color: #f0f7ff;
    border: 1px solid #e2e8f0;
}

:deep(.p-password) {
    width: 100%;
}

:deep(.p-password input) {
    width: 100%;
    border-radius: 10px;
    background-color: #f0f7ff;
}

:deep(.p-checkbox) {
    margin-right: 0.5rem;
}

.login-button {
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    background-color: #10b981 !important;
    border-color: #10b981 !important;
    font-weight: 600;
    transition: all 0.3s ease;
}

.login-button:hover {
    background-color: #059669 !important;
    border-color: #059669 !important;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
</style>
