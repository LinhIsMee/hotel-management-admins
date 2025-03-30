<script setup>
defineProps({
  bookings: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
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
  getStatusSeverity: {
    type: Function,
    required: true
  },
  getPaymentStatusLabel: {
    type: Function,
    required: true
  },
  getPaymentStatusSeverity: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['view-details']);

const viewDetails = (data) => {
  emit('view-details', data);
};
</script>

<template>
  <div class="booking-history-container">
    <Toolbar class="mb-4">
      <template #start>
        <h2 class="text-xl font-bold">Lịch sử đặt phòng</h2>
      </template>

      <template #end>
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText :value="filters.global.value" @input="e => filters.global.value = e.target.value" placeholder="Tìm kiếm..." class="p-inputtext-sm" />
        </span>
      </template>
    </Toolbar>

    <DataTable
      :value="bookings"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 25, 50]"
      :loading="loading"
      :filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} đơn đặt phòng"
      class="p-datatable-sm booking-history-table"
      stripedRows
      showGridlines
      responsiveLayout="scroll"
    >
      <template #empty>Không có lịch sử đặt phòng nào được tìm thấy.</template>
      <template #loading>Đang tải dữ liệu lịch sử đặt phòng. Vui lòng đợi.</template>

      <Column field="id" header="Mã đơn" sortable style="min-width: 5rem">
        <template #body="{ data }">
          <span class="font-bold">{{ data.id }}</span>
        </template>
      </Column>

      <Column field="userId" header="ID người dùng" sortable style="min-width: 5rem" />

      <Column field="fullName" header="Tên khách hàng" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <div class="customer-info">
            <span class="font-medium">{{ data.fullName }}</span>
            <div class="text-xs text-500">{{ data.phone }}</div>
          </div>
        </template>
      </Column>

      <Column field="rooms" header="Phòng" style="min-width: 8rem">
        <template #body="{ data }">
          <div v-if="data.rooms && data.rooms.length > 0">
            <div v-for="(room, index) in data.rooms" :key="index" class="mb-1">
              <Tag class="room-tag" severity="info">
                {{ room.roomNumber }}
              </Tag>
              <span class="text-xs ml-1">{{ room.roomType }}</span>
            </div>
          </div>
          <span v-else class="text-500 text-sm">Không có phòng</span>
        </template>
      </Column>

      <Column field="checkInDate" header="Nhận phòng" sortable style="min-width: 8rem">
        <template #body="{ data }">
          <div class="booking-date">
            <div class="font-medium">{{ formatDate(data.checkInDate) }}</div>
            <div class="text-xs text-500">{{ new Date(data.checkInDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) }}</div>
          </div>
        </template>
      </Column>

      <Column field="checkOutDate" header="Trả phòng" sortable style="min-width: 8rem">
        <template #body="{ data }">
          <div class="booking-date">
            <div class="font-medium">{{ formatDate(data.checkOutDate) }}</div>
            <div class="text-xs text-500">{{ new Date(data.checkOutDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) }}</div>
          </div>
        </template>
      </Column>

      <Column field="status" header="Trạng thái" sortable style="min-width: 8rem">
        <template #body="{ data }">
          <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
        </template>
      </Column>

      <Column field="finalPrice" header="Tổng tiền" sortable style="min-width: 8rem">
        <template #body="{ data }">
          <div class="price-container">
            <div class="font-bold">{{ formatCurrency(data.finalPrice) }}</div>
            <Tag :value="getPaymentStatusLabel(data.paymentStatus)" :severity="getPaymentStatusSeverity(data.paymentStatus)" size="small" />
          </div>
        </template>
      </Column>

      <Column field="createdAt" header="Ngày tạo" sortable style="min-width: 8rem">
        <template #body="{ data }">
          {{ formatDate(data.createdAt) }}
        </template>
      </Column>

      <Column :exportable="false" style="min-width: 5rem">
        <template #body="{ data }">
          <Button icon="pi pi-eye" outlined class="p-button-sm" @click="viewDetails(data)" tooltip="Xem chi tiết" tooltipOptions="{ position: 'top' }" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.booking-history-table {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.price-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.booking-date {
  display: flex;
  flex-direction: column;
}

.room-tag {
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
}
</style>
