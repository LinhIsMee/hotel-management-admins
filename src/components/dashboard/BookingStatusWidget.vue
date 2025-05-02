<script setup>
import { onMounted, ref, watch } from 'vue';
import StatisticsService from '@/services/StatisticsService';
import { useLayout } from '@/layout/composables/layout';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const chartData = ref(null);
const chartOptions = ref(null);
const loading = ref(true);
const statusData = ref({});

const statusLabels = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'CHECKED_IN': 'Đã nhận phòng',
    'CHECKED_OUT': 'Đã trả phòng',
    'CANCELLED': 'Đã hủy'
};

const statusColors = {
    'PENDING': '#FFB300',
    'CONFIRMED': '#10B981',
    'CHECKED_IN': '#3B82F6',
    'CHECKED_OUT': '#8B5CF6',
    'CANCELLED': '#EF4444'
};

const fetchBookingStatus = async () => {
    try {
        loading.value = true;
        const response = await StatisticsService.getBookingsByStatus();
        statusData.value = response.data || {};
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu trạng thái đặt phòng:', error);
        statusData.value = {};
    } finally {
        loading.value = false;
    }
};

function setChartData() {
    // Chuẩn bị dữ liệu biểu đồ từ API
    const labels = Object.keys(statusData.value).map(key => statusLabels[key] || key);
    const values = Object.values(statusData.value);
    const backgroundColor = Object.keys(statusData.value).map(key => statusColors[key] || '#cbd5e1');

    const total = values.reduce((a, b) => a + b, 0);
    const percentages = values.map(value => Math.round((value * 100) / total));

    // Tạo label với phần trăm
    const labelsWithPercentage = labels.map((label, index) =>
        `${label}: ${percentages[index]}%`
    );

    return {
        labels: labelsWithPercentage,
        datasets: [
            {
                data: values,
                backgroundColor: backgroundColor,
                hoverBackgroundColor: backgroundColor.map(color => {
                    const rgb = hexToRgb(color);
                    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
                })
            }
        ]
    };
}

function hexToRgb(hex) {
    // Chuyển đổi mã hex sang rgb
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    return {
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: textMutedColor,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label.split(':')[0] || '';
                        const value = context.raw || 0;
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value * 100) / total);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            },
            datalabels: {
                display: true,
                color: '#ffffff',
                font: {
                    weight: 'bold',
                    size: 12
                },
                formatter: (value, ctx) => {
                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value * 100) / total);
                    return `${percentage}%`;
                }
            }
        }
    };
}

watch([getPrimary, getSurface, isDarkTheme, statusData], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

onMounted(async () => {
    await fetchBookingStatus();
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl">Trạng thái đặt phòngs</div>
        <div v-if="loading" class="flex justify-center items-center">
            <i class="pi pi-spin pi-spinner text-3xl"></i>
        </div>
        <div v-else-if="Object.keys(statusData).length === 0" class="flex justify-center items-center text-gray-500">
            Không có dữ liệu trạng thái đặt phòng
        </div>
        <Chart v-else type="pie" :data="chartData" :options="chartOptions" class="" />
    </div>
</template>
