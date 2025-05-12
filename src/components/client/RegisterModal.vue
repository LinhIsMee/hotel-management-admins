<script setup>
import AuthService from '@/services/AuthService';
import { reactive, ref } from 'vue';

// Import các component cần thiết
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';

const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['update:visible', 'login', 'register-success']);

const form = reactive({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    nationalId: '',
    password: '',
    confirmPassword: ''
});

const loading = ref(false);
const errorMessage = ref('');
const submitted = ref(false);

const validateForm = () => {
    submitted.value = true;

    if (!form.username || !form.fullName || !form.email || !form.password || !form.confirmPassword) {
        return false;
    }

    if (form.password !== form.confirmPassword) {
        errorMessage.value = 'Mật khẩu xác nhận không khớp';
        return false;
    }

    return true;
};

const register = async () => {
    if (!validateForm()) {
        return;
    }

    loading.value = true;
    errorMessage.value = '';

    try {
        const result = await AuthService.registerClient({
            username: form.username,
            password: form.password,
            email: form.email,
            fullName: form.fullName,
            phoneNumber: form.phoneNumber,
            gender: form.gender,
            dateOfBirth: form.dateOfBirth,
            address: form.address,
            nationalId: form.nationalId
        });

        if (result && result.success !== false) {
            // Đăng ký thành công
            emit('register-success');
            emit('update:visible', false);

            // Reset form
            form.username = '';
            form.fullName = '';
            form.email = '';
            form.phoneNumber = '';
            form.gender = 'Male';
            form.dateOfBirth = '';
            form.address = '';
            form.nationalId = '';
            form.password = '';
            form.confirmPassword = '';
            submitted.value = false;
        } else {
            errorMessage.value = result?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorMessage.value = error?.response?.data?.message || error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
    } finally {
        loading.value = false;
    }
};

const showLoginModal = () => {
    emit('update:visible', false);
    emit('login');
};
</script>

<template>
    <Dialog
        :visible="props.visible"
        @update:visible="$emit('update:visible', $event)"
        modal
        header="Đăng ký tài khoản"
        :style="{ width: '500px' }"
        :closable="true"
    >
        <div v-if="errorMessage" class="p-4 mb-4 bg-red-100 text-red-700 border-round flex align-items-center">
            <i class="pi pi-exclamation-circle mr-2"></i>
            <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="register" class="space-y-4">
            <div>
                <label for="username" class="block text-900 font-medium mb-2">Tên đăng nhập <span class="text-red-500">*</span></label>
                <InputText
                    id="username"
                    v-model="form.username"
                    class="w-full"
                    :class="{ 'p-invalid': submitted && !form.username }"
                    placeholder="Nhập tên đăng nhập"
                />
                <small v-if="submitted && !form.username" class="p-error">Vui lòng nhập tên đăng nhập</small>
            </div>

            <div>
                <label for="fullName" class="block text-900 font-medium mb-2">Họ tên <span class="text-red-500">*</span></label>
                <InputText
                    id="fullName"
                    v-model="form.fullName"
                    class="w-full"
                    :class="{ 'p-invalid': submitted && !form.fullName }"
                    placeholder="Nhập họ tên của bạn"
                />
                <small v-if="submitted && !form.fullName" class="p-error">Vui lòng nhập họ tên</small>
            </div>

            <div>
                <label for="email" class="block text-900 font-medium mb-2">Email <span class="text-red-500">*</span></label>
                <InputText
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="w-full"
                    :class="{ 'p-invalid': submitted && !form.email }"
                    placeholder="example@email.com"
                />
                <small v-if="submitted && !form.email" class="p-error">Vui lòng nhập email</small>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="phoneNumber" class="block text-900 font-medium mb-2">Số điện thoại</label>
                    <InputText
                        id="phoneNumber"
                        v-model="form.phoneNumber"
                        class="w-full"
                        placeholder="Nhập số điện thoại"
                    />
                </div>

                <div>
                    <label for="gender" class="block text-900 font-medium mb-2">Giới tính</label>
                    <Dropdown
                        id="gender"
                        v-model="form.gender"
                        :options="['Male', 'Female', 'Other']"
                        class="w-full"
                        placeholder="Chọn giới tính"
                    />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="dateOfBirth" class="block text-900 font-medium mb-2">Ngày sinh</label>
                    <Calendar
                        id="dateOfBirth"
                        v-model="form.dateOfBirth"
                        dateFormat="yy-mm-dd"
                        :showTime="false"
                        :manualInput="false"
                        class="w-full"
                        placeholder="YYYY-MM-DD"
                        @date-select="form.dateOfBirth = $event.toISOString().split('T')[0]"
                    />
                </div>

                <div>
                    <label for="nationalId" class="block text-900 font-medium mb-2">CMND/CCCD</label>
                    <InputText
                        id="nationalId"
                        v-model="form.nationalId"
                        class="w-full"
                        placeholder="Nhập số CMND/CCCD"
                    />
                </div>
            </div>

            <div>
                <label for="address" class="block text-900 font-medium mb-2">Địa chỉ</label>
                <Textarea
                    id="address"
                    v-model="form.address"
                    rows="2"
                    class="w-full"
                    placeholder="Nhập địa chỉ của bạn"
                />
            </div>

            <div>
                <label for="password" class="block text-900 font-medium mb-2">Mật khẩu <span class="text-red-500">*</span></label>
                <Password
                    id="password"
                    v-model="form.password"
                    :toggleMask="true"
                    :class="{ 'p-invalid': submitted && !form.password }"
                    class="w-full"
                    placeholder="Nhập mật khẩu"
                />
                <small v-if="submitted && !form.password" class="p-error">Vui lòng nhập mật khẩu</small>
            </div>

            <div>
                <label for="confirmPassword" class="block text-900 font-medium mb-2">Xác nhận mật khẩu <span class="text-red-500">*</span></label>
                <Password
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    :toggleMask="true"
                    :class="{ 'p-invalid': submitted && !form.confirmPassword }"
                    class="w-full"
                    :feedback="false"
                    placeholder="Nhập lại mật khẩu"
                />
                <small v-if="submitted && !form.confirmPassword" class="p-error">Vui lòng xác nhận mật khẩu</small>
                <small v-else-if="submitted && form.password !== form.confirmPassword" class="p-error">Mật khẩu xác nhận không khớp</small>
            </div>

            <Button type="submit" label="Đăng ký" :loading="loading" class="w-full" />

            <div class="text-center pt-2">
                <span class="text-600 font-medium">Đã có tài khoản?</span>
                <a @click="showLoginModal" class="font-medium no-underline ml-2 text-amber-600 cursor-pointer">Đăng nhập</a>
            </div>
        </form>
    </Dialog>
</template>
