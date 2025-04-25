<script setup>
import Button from 'primevue/button';

defineProps({
  data: {
    type: Object,
    required: true
  },
  can: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['view', 'edit', 'confirm', 'cancel', 'delete']);

const viewDetails = (data) => {
  emit('view', data);
};

const editBooking = (data) => {
  emit('edit', data);
};

const confirmBooking = (data) => {
  emit('confirm', data);
};

const cancelBooking = (data) => {
  emit('cancel', data);
};

const deleteBooking = (data) => {
  emit('delete', data);
};
</script>

<template>
  <div class="booking-action-buttons flex gap-1 justify-content-end">
    <Button
      icon="pi pi-eye"
      outlined
      class="p-button-sm"
      @click="viewDetails(data)"
      v-tooltip.top="'Xem chi tiết'"
    />

    <Button
      v-if="can.edit"
      icon="pi pi-pencil"
      outlined
      class="p-button-sm"
      @click="editBooking(data)"
      v-tooltip.top="'Chỉnh sửa'"
    />

    <Button
      v-if="can.confirm && data.status === 'PENDING'"
      icon="pi pi-check-circle"
      outlined
      severity="success"
      class="p-button-sm"
      @click="confirmBooking(data)"
      v-tooltip.top="'Xác nhận đơn'"
    />

    <Button
      v-if="can.cancel && (data.status === 'PENDING' || data.status === 'CONFIRMED')"
      icon="pi pi-ban"
      outlined
      severity="danger"
      class="p-button-sm"
      @click="cancelBooking(data)"
      v-tooltip.top="'Hủy đơn'"
    />

    <Button
      v-if="can.delete"
      icon="pi pi-trash"
      outlined
      severity="danger"
      class="p-button-sm"
      @click="deleteBooking(data)"
      v-tooltip.top="'Xóa đơn'"
    />
  </div>
</template>

<style scoped>
.booking-action-buttons {
  min-width: 120px;
}

@media screen and (max-width: 640px) {
  .booking-action-buttons {
    flex-wrap: wrap;
    justify-content: flex-start;
    min-width: auto;
  }
}
</style>
