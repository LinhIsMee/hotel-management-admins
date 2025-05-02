<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePermissions } from '@/composables/usePermissions';

const route = useRoute();
const { userRole, canAccessPage, refreshRole } = usePermissions();

// Đảm bảo cập nhật role khi component mount
onMounted(() => {
    refreshRole();
});

// Danh sách menu đầy đủ
const allMenuItems = [
    { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin/dashboard', page: 'dashboard' },
    { label: 'Quản lý người dùng', icon: 'pi pi-fw pi-user', to: '/admin/users', page: 'users' },
    { label: 'Quản lý đặt phòng', icon: 'pi pi-fw pi-calendar-plus', to: '/admin/bookings', page: 'bookings' },
    { label: 'Quản lý phòng', icon: 'pi pi-fw pi-home', to: '/admin/rooms', page: 'rooms' },
    { label: 'Quản lý loại phòng', icon: 'pi pi-fw pi-list', to: '/admin/room-types', page: 'room-types' },
    { label: 'Quản lý dịch vụ', icon: 'pi pi-fw pi-briefcase', to: '/admin/services', page: 'services' },
    { label: 'Quản lý đánh giá', icon: 'pi pi-fw pi-star', to: '/admin/reviews', page: 'reviews' },
    { label: 'Mã giảm giá', icon: 'pi pi-fw pi-tag', to: '/admin/discounts', page: 'discounts' }
];

// Menu được lọc dựa trên quyền truy cập
const menu = computed(() => {
    return allMenuItems.filter(item => canAccessPage(item.page));
});
</script>

<template>
    <div class="layout-menu-container">
        <ul class="layout-menu">
            <li v-for="item in menu" :key="item.label" class="layout-menuitem">
                <router-link :to="item.to" class="flex align-items-center p-menuitem-link" :class="{ 'router-link-active': route.path === item.to }">
                    <i :class="item.icon" class="layout-menuitem-icon"></i>
                    <span class="layout-menuitem-text">{{ item.label }}</span>
                </router-link>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.layout-menu-container {
    height: 100%;
    position: relative;
    overflow-y: auto;
}

.layout-menu {
    margin: 0;
    padding: 0.5rem 0;
    list-style-type: none;
}

.layout-menuitem {
    padding: 0;
    margin: 0;
}

.p-menuitem-link {
    display: flex;
    align-items: center;
    position: relative;
    color: var(--text-color);
    padding: 0.75rem 1.25rem;
    transition:
        background-color 0.2s,
        box-shadow 0.2s;
    border-radius: 0;
    cursor: pointer;
    text-decoration: none;
}

.p-menuitem-link:hover {
    background-color: var(--surface-hover);
}

.p-menuitem-link.router-link-active {
    color: var(--primary-color);
    font-weight: 700;
    background-color: var(--surface-hover);
    border-left: 4px solid var(--primary-color);
}

.layout-menuitem-icon {
    margin-right: 0.5rem;
    font-size: 1.25rem;
}

.layout-menuitem-text {
    line-height: 1.5;
    font-size: 0.95rem;
}
</style>
