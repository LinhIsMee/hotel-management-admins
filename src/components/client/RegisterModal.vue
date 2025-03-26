<script setup>
import AuthService from '@/services/AuthService';
import { reactive, ref } from 'vue';

const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['update:visible', 'login', 'register-success']);

const form = reactive({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
});

const loading = ref(false);
const errorMessage = ref('');
const submitted = ref(false);

const validateForm = () => {
    submitted.value = true;

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
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
        const result = await AuthService.register({
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password
        });

        emit('register-success');
        emit('update:visible', false);

        // Reset form
        form.name = '';
        form.email = '';
        form.phone = '';
        form.password = '';
        form.confirmPassword = '';
        submitted.value = false;
    } catch (error) {
        errorMessage.value = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
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
        v-model:visible="props.visible"
        modal
        header="Đăng ký tài khoản"
        :style="{ width: '500px' }"
        :closable="true"
        @update:visible="$emit('update:visible', $event)"
    >
        <div v-if="errorMessage" class="p-4 mb-4 bg-red-100 text-red-700 border-round flex align-items-center">
            <i class="pi pi-exclamation-circle mr-2"></i>
            <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="register" class="space-y-4">
            <div>
                <label for="name" class="block text-900 font-medium mb-2">Họ tên <span class="text-red-500">*</span></label>
                <InputText
                    id="name"
                    v-model="form.name"
                    class="w-full"
                    :class="{ 'p-invalid': submitted && !form.name }"
                    placeholder="Nhập họ tên của bạn"
                />
                <small v-if="submitted && !form.name" class="p-error">Vui lòng nhập họ tên</small>
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

            <div>
                <label for="phone" class="block text-900 font-medium mb-2">Số điện thoại</label>
                <InputText
                    id="phone"
                    v-model="form.phone"
                    class="w-full"
                    placeholder="Nhập số điện thoại (không bắt buộc)"
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
