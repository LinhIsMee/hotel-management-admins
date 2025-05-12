import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { API_BASE_URL } from '@/constants';

export function useUserService() {
    const toast = useToast();
    const loading = ref(false);
    const error = ref(null);

    const getUserById = async (userId) => {
        if (!userId) return null;
        try {
            loading.value = true;
            const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`);
            if (!response.ok) throw new Error('Không thể tải thông tin người dùng');
            const userData = await response.json();
            return userData;
        } catch (err) {
            error.value = err;
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể tải thông tin người dùng',
                life: 3000
            });
            return null;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        error,
        getUserById
    };
}
