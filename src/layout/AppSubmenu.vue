<template>
    <ul>
        <template v-for="(item, i) in items" :key="i">
            <li :class="{ 'active-menuitem': activeIndex === i && !item.to }">
                <router-link v-if="item.to" :to="item.to" class="p-ripple"
                    :class="{ 'router-link-active': isMenuItemActive(item) }"
                    @click="onMenuItemClick($event, item, i)">
                    <i :class="item.icon" class="layout-menuitem-icon"></i>
                    <span class="layout-menuitem-text">{{ item.label }}</span>
                    <i v-if="item.items" class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
                    <span class="p-ink"></span>
                </router-link>
                <a v-else :href="item.url" class="p-ripple" :target="item.target" @click="onMenuItemClick($event, item, i)">
                    <i :class="item.icon" class="layout-menuitem-icon"></i>
                    <span class="layout-menuitem-text">{{ item.label }}</span>
                    <i v-if="item.items" class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
                    <span class="p-ink"></span>
                </a>
                <transition name="layout-submenu" v-if="item.items">
                    <AppSubmenu v-show="activeIndex === i"
                        :items="item.items"
                        @menuitem-click="$emit('menuitem-click', $event)"></AppSubmenu>
                </transition>
            </li>
        </template>
    </ul>
</template>

<script setup>
import { ref, defineProps, defineEmits, inject } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    },
});

defineEmits(['menuitem-click']);

const route = useRoute();
const activeIndex = ref(null);

const onMenuItemClick = (event, item, i) => {
    if (item.disabled) {
        event.preventDefault();
        return;
    }

    // Nếu không có items con hoặc có link trực tiếp, không mở submenu
    if (!item.items) {
        emit('menuitem-click', {
            originalEvent: event,
            item: item
        });
    }

    // Mở/đóng submenu nếu có items con
    if (item.items) {
        activeIndex.value = activeIndex.value === i ? null : i;
    }
};

const isMenuItemActive = (item) => {
    return route.path === item.to;
};

// Expose emit function
const emit = defineEmits(['menuitem-click']);
</script>

<style scoped>
ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

li {
    overflow: hidden;
}

li a {
    padding: 0.75rem 1rem 0.75rem 2rem;
}

li a .layout-menuitem-text {
    margin-left: 0.5rem;
}

.layout-submenu-enter-active {
    max-height: 1000px;
    transition: max-height 0.3s ease-in;
}

.layout-submenu-enter-from,
.layout-submenu-leave-to {
    max-height: 0;
}

.layout-submenu-leave-active {
    max-height: 0;
    transition: max-height 0.3s ease-out;
}
</style>
