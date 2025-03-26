<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const type = ref('');
const message = ref('');
const redirectPath = ref('/auth/login');
const countdown = ref(5);
let timer;

onMounted(() => {
    type.value = route.query.type || 'default';

    switch (type.value) {
        case 'register':
            message.value = 'Đăng ký tài khoản khách hàng thành công!';
            break;
        case 'reset-password':
            message.value = 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập và đặt phòng ngay.';
            break;
        default:
            message.value = 'Thao tác hoàn tất thành công!';
    }

    timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(timer);
            router.push(redirectPath.value);
        }
    }, 1000);
});
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-10 px-8 sm:px-16" style="border-radius: 53px; min-width: 500px; max-width: 650px">
                    <div class="text-center">
                        <div class="flex justify-center mb-6">
                            <div class="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full">
                                <i class="pi pi-check-circle text-4xl text-green-500"></i>
                            </div>
                        </div>
                        <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-2">Thành công!</div>
                        <div class="text-muted-color font-medium text-base mb-6">{{ message }}</div>

                        <div class="text-center mb-3">
                            <p class="text-muted-color text-sm">Tự động chuyển hướng sau {{ countdown }} giây</p>
                        </div>

                        <Button label="Đăng nhập ngay" class="w-full" as="router-link" to="/auth/login"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.p-button) {
    padding: 0.6rem 1rem;
    font-size: 0.95rem;
    min-height: 40px;
}
</style>
