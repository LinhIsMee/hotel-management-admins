<script setup>
import { ref, onMounted } from 'vue';
import StatisticsService from '@/services/StatisticsService';
import Menu from 'primevue/menu';

const menu = ref(null);
const rooms = ref([]);
const loading = ref(true);

const items = ref([
    { label: 'Xem chi tiết', icon: 'pi pi-fw pi-search' },
    { label: 'Xuất báo cáo', icon: 'pi pi-fw pi-download' }
]);

const fetchMostBookedRooms = async () => {
    try {
        loading.value = true;
        const response = await StatisticsService.getMostBookedRooms(6); // Lấy 6 phòng được đặt nhiều nhất
        rooms.value = response.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu phòng được đặt nhiều nhất:', error);
        rooms.value = [];
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (value) => {
    if (value) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(value);
    }
    return '';
};

const getRandomColorClass = (index) => {
    const colors = ['orange', 'cyan', 'pink', 'green', 'purple', 'teal', 'blue', 'indigo', 'red'];
    return colors[index % colors.length];
};

onMounted(() => {
    fetchMostBookedRooms();
});
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Danh sách phòng được đặt nhiều nhất</div>
            <div>
                <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu.toggle($event)"></Button>
                <Menu ref="menu" popup :model="items" class="!min-w-40"></Menu>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-6">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
        </div>

        <ul v-else class="list-none p-0 m-0">
            <li v-for="(room, index) in rooms" :key="room.roomNumber" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">
                        Phòng {{ room.roomNumber }}
                    </span>
                    <div class="mt-1 text-muted-color">{{ room.roomType }}</div>
                </div>
                <div class="mt-2 md:mt-0 flex items-center">
                    <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                        <div :class="`bg-${getRandomColorClass(index)}-500 h-full`" :style="{ width: `${room.occupancyRate}%` }"></div>
                    </div>
                    <span :class="`text-${getRandomColorClass(index)}-500 ml-4 font-medium`">{{ room.occupancyRate.toFixed(1) }}%</span>
                </div>
            </li>

            <li v-if="rooms.length === 0" class="text-center py-4 text-gray-500">
                Không có dữ liệu
            </li>
        </ul>

        <div v-if="!loading && rooms.length > 0" class="mt-4 flex justify-between text-sm text-gray-600">
            <div>Tổng đặt phòng: <span class="font-semibold">{{ rooms.reduce((sum, room) => sum + room.bookingCount, 0) }}</span></div>
            <div>Tổng doanh thu: <span class="font-semibold">{{ formatCurrency(rooms.reduce((sum, room) => sum + room.totalRevenue, 0)) }}</span></div>
        </div>
    </div>
</template>
