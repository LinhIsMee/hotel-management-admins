<script setup>
import { useExportBooking } from '@/composables/useExportBooking';
import { useExportCSV } from '@/composables/useExportCSV';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import { ref } from 'vue';

const props = defineProps({
    bookings: {
        type: Array,
        required: true
    },
    formatDate: {
        type: Function,
        required: true
    },
    formatCurrency: {
        type: Function,
        required: true
    },
    getStatusLabel: {
        type: Function,
        required: true
    },
    getPaymentStatusLabel: {
        type: Function,
        required: true
    }
});

const { exporting: exportingExcel, exportToExcel } = useExportBooking();
const { exporting: exportingCSV, exportToCSV } = useExportCSV();

const isExporting = ref(false);
const menu = ref(null);
const exportItems = [
    {
        label: 'Xuất Excel',
        icon: 'pi pi-file-excel',
        command: handleExportExcel
    },
    {
        label: 'Xuất CSV',
        icon: 'pi pi-download',
        command: handleExportCSV
    }
];

async function handleExportExcel() {
    if (isExporting.value) return;

    isExporting.value = true;
    try {
        await exportToExcel(
            props.bookings,
            props.formatDate,
            props.formatCurrency,
            props.getStatusLabel,
            props.getPaymentStatusLabel
        );
    } finally {
        isExporting.value = false;
    }
}

function handleExportCSV() {
    if (isExporting.value) return;

    isExporting.value = true;
    try {
        exportToCSV(
            props.bookings,
            props.formatDate,
            props.formatCurrency,
            props.getStatusLabel,
            props.getPaymentStatusLabel
        );
    } finally {
        isExporting.value = false;
    }
}

function toggleMenu(event) {
    menu.value.toggle(event);
}
</script>

<template>
    <div class="export-button-container">
        <Button
            label="Xuất dữ liệu"
            icon="pi pi-download"
            severity="info"
            class="mr-2"
            @click="toggleMenu"
            :loading="isExporting"
            aria-haspopup="true"
            aria-controls="export-menu"
        />
        <Menu id="export-menu" ref="menu" :model="exportItems" :popup="true" />
    </div>
</template>

<style scoped>
.export-button-container {
    position: relative;
    display: inline-block;
}

:deep(.p-menu) {
    min-width: 180px;
}
</style>
