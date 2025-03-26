<script setup>
import AuthService from '@/services/AuthService';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';
import { useLayout } from './composables/layout';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const menuActive = ref(false);
const topbarMenuActive = ref(false);
const { containerClass } = useLayout();

// Kiểm tra có phải trang login không
const isAdminLoginPage = computed(() => {
    return route.meta.isAdminLoginPage;
});

const onMenuToggle = () => {
    menuActive.value = !menuActive.value;
};

// Xử lý đăng xuất
const logout = () => {
    AuthService.logoutAdmin(); // Đảm bảo chỉ xóa token của admin
    router.push('/auth/login');

    toast.add({
        severity: 'success',
        summary: 'Đăng xuất thành công',
        detail: 'Bạn đã đăng xuất khỏi hệ thống quản trị',
        life: 3000
    });
};

// Đóng menu khi click ra ngoài
onMounted(() => {
    document.addEventListener('click', (event) => {
        const sidebarEl = document.querySelector('.layout-sidebar');
        const topbarEl = document.querySelector('.layout-topbar-menu');
        const menuButtonEl = document.querySelector('.layout-menu-button');

        if (sidebarEl && !sidebarEl.contains(event.target) && !menuButtonEl.contains(event.target)) {
            menuActive.value = false;
        }

        if (topbarEl && !topbarEl.contains(event.target) && !event.target.classList.contains('layout-topbar-menu-button')) {
            topbarMenuActive.value = false;
        }
    });
});

// Theo dõi thay đổi route
watch(
    () => route.path,
    () => {
        menuActive.value = false;
        topbarMenuActive.value = false;
    }
);
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <AppTopbar />

        <div class="layout-sidebar">
            <AppSidebar />
        </div>

        <div class="layout-main-container">
            <div class="layout-main">
                <router-view />
            </div>

            <AppFooter />
        </div>

        <div class="layout-mask"></div>

        <Toast position="bottom-right" />
    </div>
</template>

<style scoped>
/* Các style cơ bản */
.admin-layout-wrapper {
    min-height: 100vh;
}

.layout-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.layout-topbar {
    position: fixed;
    height: 5rem;
    z-index: 999;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0 2rem;
    background-color: var(--surface-card);
    transition: left 0.2s;
    display: flex;
    align-items: center;
    box-shadow:
        0 3px 5px rgba(0, 0, 0, 0.02),
        0 0 2px rgba(0, 0, 0, 0.05),
        0 1px 4px rgba(0, 0, 0, 0.08);
}

.layout-topbar-logo {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 500;
    text-decoration: none;
}

.layout-sidebar {
    position: fixed;
    width: 280px;
    height: calc(100vh - 5rem);
    z-index: 999;
    overflow-y: auto;
    user-select: none;
    top: 5rem;
    left: 0;
    transition:
        transform 0.2s,
        left 0.2s;
    background-color: var(--surface-overlay);
    border-right: 1px solid var(--surface-border);
    box-shadow:
        0 3px 5px rgba(0, 0, 0, 0.02),
        0 0 2px rgba(0, 0, 0, 0.05),
        0 1px 4px rgba(0, 0, 0, 0.08);
}

.layout-main-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    margin-left: 280px;
    padding-top: 5rem;
    transition: margin-left 0.2s;
}

.layout-main {
    flex: 1 1 auto;
    padding: 2rem;
}

.layout-topbar-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    color: var(--text-color-secondary);
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    transition: background-color 0.2s;
    cursor: pointer;
}

.layout-topbar-button:hover {
    color: var(--text-color);
    background-color: var(--surface-hover);
}

.layout-topbar-menu-button {
    display: none;
}

.layout-topbar-menu {
    margin: 0 0 0 auto;
    padding: 0;
    list-style: none;
    display: flex;
}

/* Responsive styles */
@media (max-width: 991px) {
    .layout-sidebar {
        transform: translateX(-100%);
    }

    .layout-sidebar.active {
        transform: translateX(0);
    }

    .layout-main-container {
        margin-left: 0;
    }

    .layout-topbar-menu-button {
        display: inline-flex;
        margin-left: auto;
    }

    .layout-topbar-menu {
        position: absolute;
        flex-direction: column;
        background-color: var(--surface-overlay);
        box-shadow:
            0px 3px 5px rgba(0, 0, 0, 0.02),
            0px 0px 2px rgba(0, 0, 0, 0.05),
            0px 1px 4px rgba(0, 0, 0, 0.08);
        border-radius: 12px;
        padding: 1rem;
        right: 2rem;
        top: 5rem;
        min-width: 15rem;
        display: none;
        animation: scalein 0.15s linear;
    }

    .layout-topbar-menu-mobile-active {
        display: block;
    }

    .layout-topbar-menu .layout-topbar-button {
        margin-right: 0;
        display: flex;
        width: 100%;
        height: auto;
        border-radius: 12px;
        padding: 1rem;
        border-radius: 4px;
    }

    .layout-topbar-menu .layout-topbar-button i {
        font-size: 1rem;
        margin-right: 0.5rem;
    }

    .layout-topbar-menu .layout-topbar-button span {
        font-weight: 400;
        letter-spacing: 0.3px;
    }
}

@keyframes scalein {
    0% {
        opacity: 0;
        transform: scaleY(0.8);
    }
    100% {
        opacity: 1;
        transform: scaleY(1);
    }
}
</style>
