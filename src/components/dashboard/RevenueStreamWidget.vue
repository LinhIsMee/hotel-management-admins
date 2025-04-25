<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';
import StatisticsService from '@/services/StatisticsService';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const chartData = ref(null);
const chartOptions = ref(null);
const loading = ref(true);
const revenueData = ref({});

const fetchRevenueData = async () => {
    try {
        loading.value = true;
        const response = await StatisticsService.getRevenueByDay();
        revenueData.value = response.data || {};
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
        revenueData.value = {};
    } finally {
        loading.value = false;
    }
};

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);

    // Chuyển dữ liệu thành mảng các đối tượng và sắp xếp theo ngày
    const dataArray = Object.entries(revenueData.value).map(([dateStr, revenue]) => {
        // Phân tích chuỗi ngày (định dạng DD/MM/YYYY)
        const [day, month, year] = dateStr.split('/').map(Number);
        return {
            dateStr,
            date: new Date(year, month - 1, day), // JS tháng bắt đầu từ 0
            revenue
        };
    });

    // Sắp xếp theo ngày tăng dần (quá khứ đến tương lai)
    dataArray.sort((a, b) => a.date - b.date);

    // Tạo labels và values từ mảng đã sắp xếp
    const labels = dataArray.map(item => item.dateStr);
    const values = dataArray.map(item => item.revenue);

    return {
        labels,
        datasets: [
            {
                type: 'bar',
                label: 'Doanh thu',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                data: values,
                barThickness: 20,
                borderRadius: {
                    topLeft: 8,
                    topRight: 8
                }
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let value = context.raw;
                        return new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            maximumFractionDigits: 0
                        }).format(value);
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textMutedColor,
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent'
                }
            },
            y: {
                ticks: {
                    color: textMutedColor,
                    callback: function(value) {
                        if (value >= 1000000) {
                            return (value / 1000000) + 'M';
                        }
                        return value;
                    }
                },
                grid: {
                    color: borderColor,
                    borderColor: 'transparent',
                    drawTicks: false
                }
            }
        }
    };
}

watch([getPrimary, getSurface, isDarkTheme, revenueData], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

onMounted(async () => {
    await fetchRevenueData();
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Doanh thu theo ngày</div>
        <div v-if="loading" class="flex justify-center items-center h-80">
            <i class="pi pi-spin pi-spinner text-3xl"></i>
        </div>
        <div v-else-if="Object.keys(revenueData).length === 0" class="flex justify-center items-center h-80 text-gray-500">
            Không có dữ liệu doanh thu
        </div>
        <Chart v-else type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>
