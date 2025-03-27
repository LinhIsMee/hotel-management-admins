<script setup>
import AuthService from '@/services/AuthService';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const token = ref(route.params.token || route.query.token || '');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const isSubmitted = ref(false);
const passwordMatchError = ref(false);

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

    loading.value = true;

    try {
        const result = await AuthService.resetPassword({
            token: token.value,
            newPassword: newPassword.value
        });

        toast.add({
            severity: 'success',
            summary: 'Password Reset Successful',
            detail: result.message || 'Your password has been reset successfully',
            life: 3000
        });

        // Redirect to login page after successful reset
        setTimeout(() => {
            router.push('/auth/login');
        }, 2000);
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Reset Failed',
            detail: error.message || 'An error occurred during password reset',
            life: 3000
        });
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
                    <h2 class="text-xl font-bold text-gray-800">Reset Your Password</h2>
                </div>
            </template>
            <template #content>
                <div class="text-center mb-6">
                    <h3 class="text-lg font-semibold">
                        <span class="text-amber-600">LUXURY</span><span class="text-slate-800">HOTEL</span>
                    </h3>
                    <p class="text-sm text-gray-600 mt-2">Enter your new password below</p>
                </div>

                <div class="mb-4">
                    <label for="new-password" class="block text-sm font-medium mb-2">New Password</label>
                    <Password
                        id="new-password"
                        v-model="newPassword"
                        toggleMask
                        class="w-full"
                        :class="{'p-invalid': isSubmitted && !newPassword}"
                        inputClass="w-full"
                    />
                    <small v-if="isSubmitted && !newPassword" class="p-error">New password is required</small>
                </div>

                <div class="mb-6">
                    <label for="confirm-password" class="block text-sm font-medium mb-2">Confirm Password</label>
                    <Password
                        id="confirm-password"
                        v-model="confirmPassword"
                        toggleMask
                        :feedback="false"
                        class="w-full"
                        :class="{'p-invalid': isSubmitted && (!confirmPassword || passwordMatchError)}"
                        inputClass="w-full"
                    />
                    <small v-if="isSubmitted && !confirmPassword" class="p-error">Confirm password is required</small>
                    <small v-else-if="passwordMatchError" class="p-error">Passwords do not match</small>
                </div>

                <Button
                    label="Reset Password"
                    @click="resetPassword"
                    class="w-full bg-amber-600 hover:bg-amber-700 border-amber-600"
                    :loading="loading"
                />

                <div class="text-center mt-4">
                    <router-link to="/auth/login" class="text-sm text-amber-600 hover:underline">Back to Login</router-link>
                </div>
            </template>
        </Card>
    </div>
</template>
