<template>
    <Dialog
        :visible="modelValue"
        @update:visible="$emit('update:modelValue', $event)"
        modal
        header="Đăng ký tài khoản"
        :style="{ width: '500px' }"
        :closable="true"
        class="register-dialog"
    >
        <template #header>
            <div class="text-center w-full">
                <h3 class="text-xl font-bold text-gray-800 m-0">Đăng ký tài khoản</h3>
            </div>
        </template>

        <div class="text-center mb-6">
            <h3 class="text-lg font-semibold">
                <span class="text-amber-600">LUXURY</span><span class="text-slate-800">HOTEL</span>
            </h3>
            <p class="text-sm text-gray-600 mt-2">Đăng ký tài khoản để nhận nhiều ưu đãi hơn</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field">
                <label for="firstName" class="block text-sm font-medium mb-2">Họ</label>
                <InputText id="firstName" v-model="registerData.firstName" class="w-full" required />
                <small v-if="isSubmitted && !registerData.firstName" class="p-error">Họ không được để trống</small>
            </div>

            <div class="field">
                <label for="lastName" class="block text-sm font-medium mb-2">Tên</label>
                <InputText id="lastName" v-model="registerData.lastName" class="w-full" required />
                <small v-if="isSubmitted && !registerData.lastName" class="p-error">Tên không được để trống</small>
            </div>
        </div>

        <div class="field mt-4">
            <label for="email" class="block text-sm font-medium mb-2">Email</label>
            <InputText id="email" v-model="registerData.email" type="email" class="w-full" required />
            <small v-if="isSubmitted && !registerData.email" class="p-error">Email không được để trống</small>
        </div>

        <div class="field mt-4">
            <label for="phone" class="block text-sm font-medium mb-2">Số điện thoại</label>
            <InputText id="phone" v-model="registerData.phone" class="w-full" required />
            <small v-if="isSubmitted && !registerData.phone" class="p-error">Số điện thoại không được để trống</small>
        </div>

        <div class="field mt-4">
            <label for="reg-password" class="block text-sm font-medium mb-2">Mật khẩu</label>
            <Password id="reg-password" v-model="registerData.password" toggleMask class="w-full" required />
            <small v-if="isSubmitted && !registerData.password" class="p-error">Mật khẩu không được để trống</small>
        </div>

        <div class="field mt-4">
            <label for="confirmPassword" class="block text-sm font-medium mb-2">Xác nhận mật khẩu</label>
            <Password id="confirmPassword" v-model="registerData.confirmPassword" toggleMask :feedback="false" class="w-full" required />
            <small v-if="isSubmitted && !registerData.confirmPassword" class="p-error">Xác nhận mật khẩu không được để trống</small>
            <small v-else-if="isSubmitted && registerData.password !== registerData.confirmPassword" class="p-error">Mật khẩu xác nhận không khớp</small>
        </div>

        <div class="field-checkbox mt-4">
            <Checkbox id="terms" v-model="registerData.acceptTerms" :binary="true" />
            <label for="terms" class="ml-2">
                Tôi đồng ý với <a href="#" class="text-amber-600 hover:underline">Điều khoản dịch vụ</a> và <a href="#" class="text-amber-600 hover:underline">Chính sách riêng tư</a>
            </label>
            <small v-if="isSubmitted && !registerData.acceptTerms" class="p-error block mt-1">Bạn phải đồng ý với điều khoản để tiếp tục</small>
        </div>

        <div class="flex flex-col mt-4">
            <Button
                type="button"
                label="Đăng ký"
                class="w-full py-2 font-medium bg-amber-600 hover:bg-amber-700 border-amber-600"
                @click="register"
            />

            <div class="text-center mt-4">
                <span class="text-sm text-gray-600">Đã có tài khoản?</span>
                <Button
                    type="button"
                    label="Đăng nhập"
                    class="p-button-link p-button-sm text-amber-600 ml-2"
                    @click="login"
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
import { useRouter } from 'vue-router';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'register-success', 'login']);

const toast = useToast();
const router = useRouter();
const isSubmitted = ref(false);

const registerData = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
});

watch(() => props.modelValue, (newValue) => {
    if (!newValue) {
        resetForm();
    }
});

const resetForm = () => {
    registerData.firstName = '';
    registerData.lastName = '';
    registerData.email = '';
    registerData.phone = '';
    registerData.password = '';
    registerData.confirmPassword = '';
    registerData.acceptTerms = false;
    isSubmitted.value = false;
};

const register = () => {
    isSubmitted.value = true;

    if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.phone ||
        !registerData.password || !registerData.confirmPassword || !registerData.acceptTerms) {
        return;
    }

    if (registerData.password !== registerData.confirmPassword) {
        return;
    }

    // Đăng ký người dùng
    const result = AuthService.registerClient({
        name: `${registerData.firstName} ${registerData.lastName}`,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password
    });

    if (result) {
        toast.add({
            severity: 'success',
            summary: 'Đăng ký thành công',
            detail: 'Tài khoản của bạn đã được tạo thành công',
            life: 3000
        });

        // Đóng modal đăng ký trước
        emit('update:modelValue', false);

        // Thông báo đăng ký thành công
        emit('register-success');

        // Tự động chuyển đến trang đăng nhập sau 1 giây
        setTimeout(() => {
            emit('login');
        }, 1000);
    } else {
        toast.add({
            severity: 'error',
            summary: 'Đăng ký thất bại',
            detail: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.',
            life: 3000
        });
    }
};

const login = () => {
    // Đóng modal đăng ký trước
    emit('update:modelValue', false);

    // Sau đó mới emit event login để mở modal đăng nhập
    // Đảm bảo modal đăng ký đã đóng hoàn toàn
    setTimeout(() => {
        emit('login');
    }, 300); // Tăng timeout để chắc chắn modal đã đóng
};
</script>

<style scoped>
:deep(.p-password input) {
    width: 100%;
}

:deep(.register-dialog) {
    border-radius: 12px;
    overflow: hidden;
}

:deep(.register-dialog .p-dialog-header) {
    padding: 1.5rem 1.5rem 0.5rem;
    border-bottom: none;
}

:deep(.register-dialog .p-dialog-title) {
    font-weight: 700;
    font-size: 1.25rem;
    margin: 0 auto;
}

:deep(.register-dialog .p-dialog-content) {
    padding: 1.5rem;
}

:deep(.register-dialog .p-inputtext) {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
}

:deep(.register-dialog .p-password-input) {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
}

:deep(.register-dialog .p-button) {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
}

:deep(.p-checkbox) {
    margin-right: 0.5rem;
}
</style>
