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
        revenueData.value = response.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
    } finally {
        loading.value = false;
    }
};

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);

    // Lấy ngày và doanh thu từ API
    const labels = Object.keys(revenueData.value);
    const values = Object.values(revenueData.value);

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
        <Chart v-else type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>
