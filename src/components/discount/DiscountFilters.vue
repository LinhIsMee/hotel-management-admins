<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const props = defineProps({
    showActiveOnly: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['search', 'toggle-active-filter']);

const searchQuery = ref('');

const onSearch = () => {
    emit('search', searchQuery.value);
};

const toggleActiveFilter = () => {
    emit('toggle-active-filter');
};
</script>

<template>
    <div class="flex flex-col sm:flex-row gap-2 justify-between items-center mb-4">
        <div>
            <Button :outlined="!showActiveOnly" :severity="showActiveOnly ? 'success' : 'secondary'" icon="pi pi-check-circle" label="Chỉ mã đang hoạt động" class="mr-2" @click="toggleActiveFilter" />
        </div>

        <div class="search-container">
            <span class="p-input-icon-left">
                <InputText v-model="searchQuery" placeholder="Tìm kiếm..." class="p-inputtext-sm" @keyup.enter="onSearch" />
            </span>
            <Button icon="pi pi-search" class="search-button" @click="onSearch" />
        </div>
    </div>
</template>

<style scoped>
.search-container {
    position: relative;
    display: flex;
    align-items: center;
}

.search-button {
    margin-left: 0.5rem;
}
</style>
