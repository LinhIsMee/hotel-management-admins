<script setup>
import AuthService from '@/services/AuthService';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const token = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const isSubmitted = ref(false);
const passwordMatchError = ref(false);
const tokenError = ref(false);

onMounted(() => {
    // Lấy token từ URL query parameter
    if (route.query.token) {
        token.value = route.query.token;
        console.log('Token từ URL:', token.value);
    } else {
        tokenError.value = true;
        toast.add({
            severity: 'error',
            summary: 'Lỗi xác thực',
            detail: 'Không tìm thấy token đặt lại mật khẩu trong URL',
            life: 5000
        });
    }
});

const resetPassword = async () => {
    isSubmitted.value = true;
    passwordMatchError.value = false;

    if (!newPassword.value || !confirmPassword.value) {
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        passwordMatchError.value = true;
        return;
    }

    if (!token.value) {
        toast.add({
            severity: 'error',
            summary: 'Lỗi xác thực',
            detail: 'Không tìm thấy token đặt lại mật khẩu',
            life: 3000
        });
        return;
    }

    loading.value = true;

    try {
        console.log('Đặt lại mật khẩu với token:', token.value);

        const result = await AuthService.resetPassword({
            token: token.value,
            newPassword: newPassword.value
        });

        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: result.message || 'Mật khẩu của bạn đã được đặt lại thành công',
            life: 3000
        });

        // Chuyển hướng đến trang đăng nhập sau khi đặt lại mật khẩu thành công
        setTimeout(() => {
            router.push('/');
            // Hiển thị form đăng nhập
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('show-login-dialog'));
            }, 500);
        }, 2000);
    } catch (error) {
        console.error('Reset password error:', error);
        toast.add({
            severity: 'error',
            summary: 'Đặt lại mật khẩu thất bại',
            detail: error.message || 'Đường dẫn đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.',
            life: 5000
        });

        // Chuyển về trang chủ sau 3 giây
        setTimeout(() => {
            router.push('/');
        }, 3000);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="flex justify-center items-center min-h-screen p-4 bg-gray-50">
        <Card class="w-full max-w-md shadow-lg">
            <template #title>
                <div class="text-center">
                    <h2 class="text-xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
                </div>
            </template>
            <template #content>
                <div class="text-center mb-6">
                    <h3 class="text-lg font-semibold">
                        <span class="text-amber-600">LUXURY</span><span class="text-slate-800">HOTEL</span>
                    </h3>
                    <p class="text-sm text-gray-600 mt-2">Nhập mật khẩu mới của bạn</p>
                </div>

                <div v-if="tokenError" class="p-4 mb-4 bg-red-100 text-red-700 border-round">
                    <i class="pi pi-exclamation-circle mr-2"></i>
                    <span>Không tìm thấy token đặt lại mật khẩu. Vui lòng kiểm tra đường dẫn trong email.</span>
                </div>

                <div v-else>
                    <div class="mb-4">
                        <label for="new-password" class="block text-sm font-medium mb-2">Mật khẩu mới</label>
                        <Password
                            id="new-password"
                            v-model="newPassword"
                            toggleMask
                            class="w-full"
                            :class="{'p-invalid': isSubmitted && !newPassword}"
                            inputClass="w-full"
                            placeholder="Nhập mật khẩu mới"
                        />
                        <small v-if="isSubmitted && !newPassword" class="p-error">Vui lòng nhập mật khẩu mới</small>
                    </div>

                    <div class="mb-6">
                        <label for="confirm-password" class="block text-sm font-medium mb-2">Xác nhận mật khẩu</label>
                        <Password
                            id="confirm-password"
                            v-model="confirmPassword"
                            toggleMask
                            :feedback="false"
                            class="w-full"
                            :class="{'p-invalid': isSubmitted && (!confirmPassword || passwordMatchError)}"
                            inputClass="w-full"
                            placeholder="Nhập lại mật khẩu mới"
                        />
                        <small v-if="isSubmitted && !confirmPassword" class="p-error">Vui lòng xác nhận mật khẩu</small>
                        <small v-else-if="passwordMatchError" class="p-error">Mật khẩu xác nhận không khớp</small>
                    </div>

                    <Button
                        label="Đặt lại mật khẩu"
                        @click="resetPassword"
                        class="w-full bg-amber-600 hover:bg-amber-700 border-amber-600"
                        :loading="loading"
                    />
                </div>

                <div class="text-center mt-4">
                    <router-link to="/" class="text-sm text-amber-600 hover:underline">Trở về trang chủ</router-link>
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
:deep(.p-password input) {
    width: 100%;
}

:deep(.p-card) {
    border-radius: 12px;
}

:deep(.p-card-title) {
    padding-top: 1.5rem;
}

:deep(.p-inputtext) {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
}
</style>
