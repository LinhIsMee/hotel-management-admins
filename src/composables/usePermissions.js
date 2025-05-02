import { computed, ref } from 'vue';

export function usePermissions() {
    // Lấy thông tin người dùng từ localStorage
    const getUserRole = () => {
        try {
            const adminInfo = localStorage.getItem('admin_token');
            if (!adminInfo) return 'guest';

            const parsedInfo = JSON.parse(adminInfo);
            return parsedInfo.role || 'guest';
        } catch (error) {
            console.error('Error getting user role:', error);
            return 'guest';
        }
    };

    // Lưu vai trò người dùng hiện tại
    const userRole = ref(getUserRole());

    // Định nghĩa các quyền theo vai trò
    const rolePermissions = {
        'ROLE_ADMIN': ['view', 'create', 'edit', 'delete', 'confirm', 'cancel', 'checkIn', 'checkOut'],
        'ROLE_EMPLOYEE': ['view', 'confirm', 'checkIn', 'checkOut'],
        'guest': []
    };

    // Định nghĩa quyền truy cập trang theo vai trò
    const pageAccessRoles = {
        // Admin có tất cả các quyền
        'users': ['ROLE_ADMIN'],
        'room-types': ['ROLE_ADMIN', 'ROLE_EMPLOYEE'],
        'rooms': ['ROLE_ADMIN', 'ROLE_EMPLOYEE'],
        'bookings': ['ROLE_ADMIN', 'ROLE_EMPLOYEE'],
        'services': ['ROLE_ADMIN'],
        'reviews': ['ROLE_ADMIN', 'ROLE_EMPLOYEE'],
        'discounts': ['ROLE_ADMIN'],
        'dashboard': ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    };

    // Kiểm tra quyền dựa trên vai trò
    const hasPermission = (permission) => {
        const permissions = rolePermissions[userRole.value] || [];
        return permissions.includes(permission);
    };

    // Kiểm tra quyền truy cập trang
    const canAccessPage = (pageName) => {
        const allowedRoles = pageAccessRoles[pageName] || [];
        return allowedRoles.includes(userRole.value);
    };

    // Các quyền cụ thể được tính toán
    const can = {
        view: computed(() => hasPermission('view')),
        create: computed(() => hasPermission('create')),
        edit: computed(() => hasPermission('edit')),
        delete: computed(() => hasPermission('delete')),
        confirm: computed(() => hasPermission('confirm')),
        cancel: computed(() => hasPermission('cancel')),
        checkIn: computed(() => hasPermission('checkIn')),
        checkOut: computed(() => hasPermission('checkOut'))
    };

    // Thay đổi vai trò
    const setRole = (role) => {
        if (Object.keys(rolePermissions).includes(role)) {
            userRole.value = role;
        }
    };

    // Cập nhật role từ localStorage khi có thay đổi
    const refreshRole = () => {
        userRole.value = getUserRole();
    };

    return {
        userRole,
        can,
        setRole,
        refreshRole,
        canAccessPage
    };
}
