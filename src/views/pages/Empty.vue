<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">Empty Page</div>
        <p>Use this page to start from scratch and place your custom content.</p>
    </div>
</template>

<style>
/* Định dạng toàn cục cho tooltip trong toàn bộ ứng dụng */
:deep(.p-tooltip) {
    max-width: 250px;
    background-color: var(--surface-900);
    color: var(--surface-0);
    padding: 0.5rem 0.75rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    font-size: 0.875rem;
    z-index: 9999 !important;
}

:deep(.p-tooltip .p-tooltip-arrow) {
    background-color: var(--surface-900);
}

:deep(.p-tooltip-top .p-tooltip-arrow) {
    border-top-color: var(--surface-900);
}

:deep(.p-tooltip-bottom .p-tooltip-arrow) {
    border-bottom-color: var(--surface-900);
}

:deep(.p-tooltip-left .p-tooltip-arrow) {
    border-left-color: var(--surface-900);
}

:deep(.p-tooltip-right .p-tooltip-arrow) {
    border-right-color: var(--surface-900);
}
</style>
