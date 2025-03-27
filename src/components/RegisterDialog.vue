<script setup>
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
const loading = ref(false);

const registerData = reactive({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
    registerData.firstName = '';
    registerData.lastName = '';
    registerData.username = '';
    registerData.email = '';
    registerData.phone = '';
    registerData.password = '';
    registerData.confirmPassword = '';
    registerData.acceptTerms = false;
    isSubmitted.value = false;
};

const register = async () => {
    isSubmitted.value = true;
    console.log('Register function called');

    if (!registerData.firstName || !registerData.lastName || !registerData.username || !registerData.email || !registerData.phone || !registerData.password || !registerData.confirmPassword || !registerData.acceptTerms) {
        console.log('Validation failed: missing fields');
        return;
    }

    if (registerData.password !== registerData.confirmPassword) {
        console.log('Validation failed: passwords do not match');
        return;
    }

    loading.value = true;
    console.log('Attempting to register with:', {
        username: registerData.username,
        name: `${registerData.firstName} ${registerData.lastName}`,
        email: registerData.email,
        phone: registerData.phone
    });

    try {
        const response = await fetch('http://103.82.24.35:9000/api/v1/register', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                Origin: window.location.origin
            },
            body: JSON.stringify({
                username: registerData.username,
                password: registerData.password,
                email: registerData.email,
                phone: registerData.phone,
                fullName: `${registerData.firstName} ${registerData.lastName}`
            })
        });

        console.log('Register API response status:', response.status);
        const responseData = await response.json();
        console.log('Register API response data:', responseData);

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Registration Successful',
                detail: 'Your account has been created successfully',
                life: 3000
            });

            emit('update:modelValue', false);

            emit('register-success');

            setTimeout(() => {
                emit('login');
            }, 1000);
        } else {
            toast.add({
                severity: 'error',
                summary: 'Registration Failed',
                detail: responseData.message || 'An error occurred during registration. Please try again.',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        toast.add({
            severity: 'error',
            summary: 'Registration Failed',
            detail: error.message || 'An error occurred during registration',
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
    <Dialog :visible="modelValue" @update:visible="$emit('update:modelValue', $event)" modal header="Register Account" :style="{ width: '500px' }" :closable="true" class="register-dialog">
        <template #header>
            <div class="text-center w-full">
                <h3 class="text-xl font-bold text-gray-800 m-0">Register Account</h3>
            </div>
        </template>

        <div class="text-center mb-6">
            <h3 class="text-lg font-semibold"><span class="text-amber-600">LUXURY</span><span class="text-slate-800">HOTEL</span></h3>
            <p class="text-sm text-gray-600 mt-2">Register to receive more benefits</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field">
                <label for="firstName" class="block text-sm font-medium mb-2">First Name</label>
                <InputText id="firstName" v-model="registerData.firstName" class="w-full" required />
                <small v-if="isSubmitted && !registerData.firstName" class="p-error">First name is required</small>
            </div>

            <div class="field">
                <label for="lastName" class="block text-sm font-medium mb-2">Last Name</label>
                <InputText id="lastName" v-model="registerData.lastName" class="w-full" required />
                <small v-if="isSubmitted && !registerData.lastName" class="p-error">Last name is required</small>
            </div>
        </div>

        <div class="field mt-4">
            <label for="username" class="block text-sm font-medium mb-2">Username</label>
            <InputText id="username" v-model="registerData.username" class="w-full" required />
            <small v-if="isSubmitted && !registerData.username" class="p-error">Username is required</small>
        </div>

        <div class="field mt-4">
            <label for="email" class="block text-sm font-medium mb-2">Email</label>
            <InputText id="email" v-model="registerData.email" type="email" class="w-full" required />
            <small v-if="isSubmitted && !registerData.email" class="p-error">Email is required</small>
        </div>

        <div class="field mt-4">
            <label for="phone" class="block text-sm font-medium mb-2">Phone Number</label>
            <InputText id="phone" v-model="registerData.phone" class="w-full" required />
            <small v-if="isSubmitted && !registerData.phone" class="p-error">Phone number is required</small>
        </div>

        <div class="field mt-4">
            <label for="reg-password" class="block text-sm font-medium mb-2">Password</label>
            <Password id="reg-password" v-model="registerData.password" toggleMask class="w-full" required />
            <small v-if="isSubmitted && !registerData.password" class="p-error">Password is required</small>
        </div>

        <div class="field mt-4">
            <label for="confirmPassword" class="block text-sm font-medium mb-2">Confirm Password</label>
            <Password id="confirmPassword" v-model="registerData.confirmPassword" toggleMask :feedback="false" class="w-full" required />
            <small v-if="isSubmitted && !registerData.confirmPassword" class="p-error">Password confirmation is required</small>
            <small v-else-if="isSubmitted && registerData.password !== registerData.confirmPassword" class="p-error">Passwords do not match</small>
        </div>

        <div class="field-checkbox mt-4">
            <Checkbox id="terms" v-model="registerData.acceptTerms" :binary="true" />
            <label for="terms" class="ml-2"> I agree to the <a href="#" class="text-amber-600 hover:underline">Terms of Service</a> and <a href="#" class="text-amber-600 hover:underline">Privacy Policy</a> </label>
            <small v-if="isSubmitted && !registerData.acceptTerms" class="p-error block mt-1">You must agree to the terms to continue</small>
        </div>

        <div class="flex flex-col mt-4">
            <Button type="button" label="Register" class="w-full py-2 font-medium bg-amber-600 hover:bg-amber-700 border-amber-600" @click="register" :loading="loading" />

            <div class="text-center mt-4">
                <span class="text-sm text-gray-600">Already have an account?</span>
                <Button type="button" label="Sign In" class="p-button-link p-button-sm text-amber-600 ml-2" @click="login" />
            </div>
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
