<script setup>
import AppMenu from './AppMenu.vue';
</script>

<template>
    <div class="layout-sidebar-wrapper">
        <div class="layout-sidebar-header">
            <!-- Xóa phần LUXURYHOTEL màu cam ở đây -->
            <!-- Nếu cần thiết, có thể thêm các phần tử khác ở đây -->
        </div>

        <div class="layout-menu-container">
            <AppMenu />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.layout-sidebar {
    position: fixed;
    width: 300px;
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
    padding: 0.5rem 1.5rem;
    box-shadow:
        0 3px 5px rgba(0, 0, 0, 0.02),
        0 0 2px rgba(0, 0, 0, 0.05),
        0 1px 4px rgba(0, 0, 0, 0.08);
}

.layout-sidebar-wrapper {
    height: 100%;
    position: relative;
}

.layout-sidebar-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    /* Các style khác giữ nguyên */
}
</style>
