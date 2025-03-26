<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    }
});

const isActiveMenu = ref(false);
const isActiveRoute = computed(() => route.path === props.item.to);

const itemClass = computed(() => {
    return [
        { 'layout-menuitem-category': props.item.items },
        { 'active-menuitem': isActiveMenu.value && !props.item.to },
        { 'active-route': isActiveRoute.value }
    ];
});

watch(
    () => route.path,
    () => {
        if (props.item.items) {
            const activeChild = props.item.items.find(child => child.to === route.path);
            isActiveMenu.value = !!activeChild;
        }
    },
    { immediate: true }
);

function toggleSubmenu(event) {
    if (props.item.items) {
        isActiveMenu.value = !isActiveMenu.value;
        event.preventDefault();
    }
}
</script>

<template>
    <li :class="itemClass">
        <template v-if="item.items">
            <div class="layout-menuitem-root-text" :style="item.style">{{ item.label }}</div>
            <a v-ripple @click="toggleSubmenu" :class="item.class">
                <i :class="item.icon"></i>
                <span class="layout-menuitem-text">{{ item.label }}</span>
                <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
            </a>
            <transition name="layout-submenu">
                <ul v-show="isActiveMenu">
                    <app-menu-item
                        v-for="(child, i) in item.items"
                        :key="child"
                        :index="i"
                        :item="child"
                        class="layout-menuitem-child"
                    />
                </ul>
            </transition>
        </template>
        <template v-else>
            <router-link v-if="item.to" v-ripple :to="item.to" :class="item.class">
                <i :class="item.icon"></i>
                <span class="layout-menuitem-text">{{ item.label }}</span>
            </router-link>
            <a v-else v-ripple :href="item.url" :class="item.class" :target="item.target">
                <i :class="item.icon"></i>
                <span class="layout-menuitem-text">{{ item.label }}</span>
            </a>
        </template>
    </li>
</template>

<style lang="scss" scoped>
.layout-menuitem-category {
    margin-top: 0.75rem;

    &:first-child {
        margin-top: 0;
    }
}

.layout-menuitem-root-text {
    text-transform: uppercase;
    color: var(--surface-900);
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
}

li {
    &.layout-menuitem-child > a {
        padding-left: 2rem;
    }
}

a {
    display: flex;
    align-items: center;
    position: relative;
    outline: 0 none;
    color: var(--text-color);
    cursor: pointer;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    transition: background-color 0.2s, box-shadow 0.2s;
    text-decoration: none;

    .layout-menuitem-icon {
        margin-right: 0.5rem;
    }

    .layout-menuitem-text {
        line-height: 1;
    }

    .layout-submenu-toggler {
        margin-left: auto;
    }

    &:hover {
        background-color: var(--surface-hover);
    }

    &.router-link-active {
        font-weight: 700;
        color: var(--primary-color);
    }
}

.active-route > a {
    font-weight: 700;
    color: var(--primary-color);
}

.layout-submenu-enter-active {
    max-height: 1000px;
    transition: max-height 0.45s cubic-bezier(0, 1, 0, 1);
}

.layout-submenu-enter-from,
.layout-submenu-leave-to {
    max-height: 0;
}

.layout-submenu-leave-active {
    max-height: 0;
    transition: max-height 1s cubic-bezier(0, 1, 0, 1);
}
</style>
