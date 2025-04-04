<script setup>
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from '../services/AuthService';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';

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
const loading = ref(false);

const registerData = reactive({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    nationalId: '',
    acceptTerms: false
});

watch(
    () => props.modelValue,
    (newValue) => {
        if (!newValue) {
            resetForm();
        }
    }
);

const resetForm = () => {
    registerData.username = '';
    registerData.password = '';
    registerData.confirmPassword = '';
    registerData.email = '';
    registerData.fullName = '';
    registerData.phoneNumber = '';
    registerData.gender = 'Male';
    registerData.dateOfBirth = '';
    registerData.address = '';
    registerData.nationalId = '';
    registerData.acceptTerms = false;
    isSubmitted.value = false;
};

const register = async () => {
    isSubmitted.value = true;

    if (!registerData.username || !registerData.fullName || !registerData.email ||
        !registerData.password || !registerData.confirmPassword || !registerData.acceptTerms) {
        toast.add({
            severity: 'error',
            summary: 'Lỗi đăng ký',
            detail: 'Vui lòng điền đầy đủ thông tin bắt buộc',
            life: 3000
        });
        return;
    }

    if (registerData.password !== registerData.confirmPassword) {
        toast.add({
            severity: 'error',
            summary: 'Lỗi đăng ký',
            detail: 'Mật khẩu xác nhận không khớp',
            life: 3000
        });
        return;
    }

    loading.value = true;

    try {
        const result = await AuthService.registerClient({
            username: registerData.username,
            password: registerData.password,
            email: registerData.email,
            fullName: registerData.fullName,
            phoneNumber: registerData.phoneNumber,
            gender: registerData.gender,
            dateOfBirth: registerData.dateOfBirth,
            address: registerData.address,
            nationalId: registerData.nationalId
        });

        toast.add({
            severity: 'success',
            summary: 'Đăng ký thành công',
            detail: 'Tài khoản của bạn đã được tạo thành công',
            life: 3000
        });

        emit('update:modelValue', false);
        emit('register-success');

        setTimeout(() => {
            emit('login');
        }, 1000);
    } catch (error) {
        console.error('Registration error:', error);
        toast.add({
            severity: 'error',
            summary: 'Đăng ký thất bại',
            detail: error.message || 'Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const login = () => {
    emit('update:modelValue', false);

    setTimeout(() => {
        emit('login');
    }, 300);
};
</script>

<template>
    <Dialog :visible="modelValue" @update:visible="$emit('update:modelValue', $event)" modal :style="{ width: '500px' }" :closable="true" class="register-dialog">
        <template #header>
            <div class="text-center w-full">
                <h3 class="text-xl font-bold text-gray-800 m-0">Đăng Ký Tài Khoản</h3>
            </div>
        </template>

        <div class="text-center mb-6">
            <h3 class="text-lg font-semibold"><span class="text-amber-600">LUXURY</span><span class="text-slate-800">HOTEL</span></h3>
            <p class="text-sm text-gray-600 mt-2">Đăng ký để nhận thêm nhiều ưu đãi</p>
        </div>

        <div class="field mb-3">
            <label for="username" class="block text-sm font-medium mb-2">Tên đăng nhập</label>
            <span class="p-input-icon-left w-full">
                <i class="pi pi-user"></i>
                <InputText
                    id="username"
                    v-model="registerData.username"
                    placeholder="Nhập tên đăng nhập"
                    class="w-full"
                    :class="{ 'p-invalid': isSubmitted && !registerData.username }"
                />
            </span>
            <small v-if="isSubmitted && !registerData.username" class="p-error block mt-1">Vui lòng nhập tên đăng nhập</small>
        </div>

        <div class="field mb-3">
            <label for="fullName" class="block text-sm font-medium mb-2">Họ và tên</label>
            <span class="p-input-icon-left w-full">
                <i class="pi pi-id-card"></i>
                <InputText
                    id="fullName"
                    v-model="registerData.fullName"
                    placeholder="Nhập họ và tên đầy đủ"
                    class="w-full"
                    :class="{ 'p-invalid': isSubmitted && !registerData.fullName }"
                />
            </span>
            <small v-if="isSubmitted && !registerData.fullName" class="p-error block mt-1">Vui lòng nhập họ tên</small>
        </div>

        <div class="field mb-3">
            <label for="email" class="block text-sm font-medium mb-2">Email</label>
            <span class="p-input-icon-left w-full">
                <i class="pi pi-envelope"></i>
                <InputText
                    id="email"
                    v-model="registerData.email"
                    type="email"
                    placeholder="Nhập địa chỉ email"
                    class="w-full"
                    :class="{ 'p-invalid': isSubmitted && !registerData.email }"
                />
            </span>
            <small v-if="isSubmitted && !registerData.email" class="p-error block mt-1">Vui lòng nhập email</small>
        </div>

        <div class="field mb-3">
            <label for="phoneNumber" class="block text-sm font-medium mb-2">Số điện thoại</label>
            <span class="p-input-icon-left w-full">
                <i class="pi pi-phone"></i>
                <InputText
                    id="phoneNumber"
                    v-model="registerData.phoneNumber"
                    placeholder="Nhập số điện thoại"
                    class="w-full"
                />
            </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field mb-3">
                <label for="gender" class="block text-sm font-medium mb-2">Giới tính</label>
                <Dropdown
                    id="gender"
                    v-model="registerData.gender"
                    :options="['Male', 'Female', 'Other']"
                    placeholder="Chọn giới tính"
                    class="w-full"
                />
            </div>

            <div class="field mb-3">
                <label for="dateOfBirth" class="block text-sm font-medium mb-2">Ngày sinh</label>
                <Calendar
                    id="dateOfBirth"
                    v-model="registerData.dateOfBirth"
                    dateFormat="yy-mm-dd"
                    placeholder="YYYY-MM-DD"
                    class="w-full"
                />
            </div>
        </div>

        <div class="field mb-3">
            <label for="address" class="block text-sm font-medium mb-2">Địa chỉ</label>
            <span class="p-input-icon-left w-full">
                <i class="pi pi-map-marker"></i>
                <Textarea
                    id="address"
                    v-model="registerData.address"
                    rows="2"
                    placeholder="Nhập địa chỉ của bạn"
                    class="w-full"
                />
            </span>
        </div>

        <div class="field mb-3">
            <label for="nationalId" class="block text-sm font-medium mb-2">CMND/CCCD</label>
            <span class="p-input-icon-left w-full">
                <i class="pi pi-id-card"></i>
                <InputText
                    id="nationalId"
                    v-model="registerData.nationalId"
                    placeholder="Nhập số CMND/CCCD"
                    class="w-full"
                />
            </span>
        </div>

        <div class="field mb-3">
            <label for="password" class="block text-sm font-medium mb-2">Mật khẩu</label>
            <span class="p-input-icon-left w-full">
                <i class="pi pi-lock"></i>
                <Password
                    id="password"
                    v-model="registerData.password"
                    placeholder="Nhập mật khẩu"
                    toggleMask
                    class="w-full"
                    :class="{ 'p-invalid': isSubmitted && !registerData.password }"
                />
            </span>
            <small v-if="isSubmitted && !registerData.password" class="p-error block mt-1">Vui lòng nhập mật khẩu</small>
        </div>

        <div class="field mb-3">
            <label for="confirmPassword" class="block text-sm font-medium mb-2">Xác nhận mật khẩu</label>
            <span class="p-input-icon-left w-full">
                <i class="pi pi-lock"></i>
                <Password
                    id="confirmPassword"
                    v-model="registerData.confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    toggleMask
                    :feedback="false"
                    class="w-full"
                    :class="{ 'p-invalid': isSubmitted && (!registerData.confirmPassword || registerData.password !== registerData.confirmPassword) }"
                />
            </span>
            <small v-if="isSubmitted && !registerData.confirmPassword" class="p-error block mt-1">Vui lòng xác nhận mật khẩu</small>
            <small v-else-if="isSubmitted && registerData.password !== registerData.confirmPassword" class="p-error block mt-1">Mật khẩu xác nhận không khớp</small>
        </div>

        <div class="field-checkbox mt-4 mb-3">
            <Checkbox id="terms" v-model="registerData.acceptTerms" :binary="true" />
            <label for="terms" class="ml-2"> Tôi đồng ý với <a href="#" class="text-blue-500 hover:text-blue-700 no-underline hover:underline">Điều khoản dịch vụ</a> và <a href="#" class="text-blue-500 hover:text-blue-700 no-underline hover:underline">Chính sách bảo mật</a> </label>
            <small v-if="isSubmitted && !registerData.acceptTerms" class="p-error block mt-1">Bạn phải đồng ý với điều khoản để tiếp tục</small>
        </div>

        <Button
            type="button"
            label="Đăng ký"
            class="w-full p-button-primary mb-3"
            @click="register"
            :loading="loading"
        />

        <div class="text-center">
            <span>Đã có tài khoản? </span>
            <a @click="login" class="text-blue-500 hover:text-blue-700 cursor-pointer font-medium no-underline">Đăng nhập ngay</a>
        </div>
    </Dialog>
</template>

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
