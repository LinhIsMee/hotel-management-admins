import { computed, ref } from 'vue';

export function usePermissions() {
    // Trong thực tế, thông tin này sẽ đến từ hệ thống xác thực của bạn
    const userRole = ref(localStorage.getItem('userRole') || 'admin');

    // Định nghĩa các quyền theo vai trò
    const rolePermissions = {
        admin: ['view', 'create', 'edit', 'delete', 'confirm', 'cancel'],
        manager: ['view', 'create', 'edit', 'confirm', 'cancel'],
        staff: ['view', 'confirm'],
        viewer: ['view']
    };

    // Kiểm tra quyền dựa trên vai trò
    const hasPermission = (permission) => {
        const permissions = rolePermissions[userRole.value] || [];
        return permissions.includes(permission);
    };

    // Các quyền cụ thể được tính toán
    const can = {
        view: computed(() => hasPermission('view')),
        create: computed(() => hasPermission('create')),
        edit: computed(() => hasPermission('edit')),
        delete: computed(() => hasPermission('delete')),
        confirm: computed(() => hasPermission('confirm')),
        cancel: computed(() => hasPermission('cancel'))
    };

    // Thay đổi vai trò (cho mục đích thử nghiệm)
    const setRole = (role) => {
        if (['admin', 'manager', 'staff', 'viewer'].includes(role)) {
            userRole.value = role;
            localStorage.setItem('userRole', role);
        }
    };

    return {
        userRole,
        can,
        setRole
    };
}
