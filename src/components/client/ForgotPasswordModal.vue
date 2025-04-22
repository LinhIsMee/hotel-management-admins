<script setup>
import AuthService from '@/services/AuthService';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'login', 'forgot-password-success']);

const toast = useToast();
const email = ref('');
const isSubmitted = ref(false);
const loading = ref(false);

watch(() => props.modelValue, (newValue) => {
    if (!newValue) {
        resetForm();
    }
});

const resetForm = () => {
    email.value = '';
    isSubmitted.value = false;
    loading.value = false;
};

const sendRequest = async () => {
    isSubmitted.value = true;

    if (!email.value) {
        return;
    }

    loading.value = true;

    try {
        // Sử dụng AuthService.requestPasswordReset để gọi API
        const result = await AuthService.requestPasswordReset(email.value);

        toast.add({
            severity: 'success',
            summary: 'Yêu cầu đã gửi',
            detail: result.message || 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn',
            life: 3000
        });

        // Đóng modal và emit sự kiện thành công
        emit('update:modelValue', false);
        emit('forgot-password-success');
    } catch (error) {
        let errorMessage = 'Không thể xử lý yêu cầu của bạn. Vui lòng thử lại sau.';

        // Kiểm tra nếu là lỗi trùng token
        if (error.message && error.message.includes('Duplicate entry')) {
            errorMessage = 'Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.';
        }

        toast.add({
            severity: 'error',
            summary: 'Yêu cầu thất bại',
            detail: errorMessage,
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const login = () => {
    // Đóng modal quên mật khẩu trước
    emit('update:modelValue', false);

    // Sau đó mới emit sự kiện login
    setTimeout(() => {
        emit('login');
    }, 300);
};
</script>

<template>
    <Dialog
        :visible="modelValue"
        @update:visible="$emit('update:modelValue', $event)"
        modal
        :style="{ width: '450px' }"
        class="p-fluid forgot-password-dialog"
    >
        <template #header>
            <div class="text-center w-full">
                <h3 class="text-xl font-bold text-gray-800 m-0">Forgot Password</h3>
            </div>
        </template>

        <div class="text-center mb-6">
            <h3 class="text-lg font-semibold">
                <span class="text-amber-600">LUXURY</span><span class="text-slate-800">HOTEL</span>
            </h3>
            <p class="text-sm text-gray-600 mt-2">Please enter your email to receive password reset instructions</p>
        </div>

        <div class="field mb-4">
            <label for="forgot-email" class="block text-sm font-medium mb-2">Email</label>
            <InputText id="forgot-email" v-model="email" type="email" class="w-full p-2" placeholder="Enter your registered email" required />
            <small v-if="isSubmitted && !email" class="p-error">Email is required</small>
        </div>

        <div class="flex justify-between items-center mt-6">
            <Button
                type="button"
                label="Back to Login"
                class="p-button-link text-amber-600"
                @click="login"
            />
            <Button
                type="button"
                label="Send Request"
                class="bg-amber-600 hover:bg-amber-700 border-amber-600"
                @click="sendRequest"
                :loading="loading"
            />
        </div>
    </Dialog>
</template>

<style scoped>
:deep(.forgot-password-dialog) {
    border-radius: 12px;
    overflow: hidden;
}

:deep(.forgot-password-dialog .p-dialog-header) {
    padding: 1.5rem 1.5rem 0.5rem;
    border-bottom: none;
}

:deep(.forgot-password-dialog .p-dialog-title) {
    font-weight: 700;
    font-size: 1.25rem;
    margin: 0 auto;
}

:deep(.forgot-password-dialog .p-dialog-content) {
    padding: 1.5rem;
}

:deep(.forgot-password-dialog .p-inputtext) {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
}

:deep(.forgot-password-dialog .p-button) {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
}
</style>
