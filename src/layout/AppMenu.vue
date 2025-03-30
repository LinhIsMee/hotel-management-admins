<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Danh sách menu được đơn giản hóa - không phân cấp
const menu = ref([
    { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin/dashboard' },
    { label: 'Quản lý người dùng', icon: 'pi pi-fw pi-user', to: '/admin/users' },
    { label: 'Quản lý nhân viên', icon: 'pi pi-fw pi-id-card', to: '/admin/employees' },
    { label: 'Quản lý đặt phòng', icon: 'pi pi-fw pi-calendar-plus', to: '/admin/bookings' },
    { label: 'Quản lý phòng', icon: 'pi pi-fw pi-home', to: '/admin/rooms' },
    { label: 'Quản lý loại phòng', icon: 'pi pi-fw pi-list', to: '/admin/room-types' },
    { label: 'Quản lý dịch vụ', icon: 'pi pi-fw pi-briefcase', to: '/admin/services' },
    { label: 'Quản lý đánh giá', icon: 'pi pi-fw pi-star', to: '/admin/reviews' },
    { label: 'Mã giảm giá', icon: 'pi pi-fw pi-tag', to: '/admin/discounts' }
]);
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
