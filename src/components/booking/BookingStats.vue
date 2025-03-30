<script setup>
defineProps({
    stats: {
        type: Object,
        required: true,
        default: () => ({
            totalBookings: 0,
            pendingBookings: 0,
            confirmedBookings: 0,
            checkedInBookings: 0,
            checkedOutBookings: 0,
            cancelledBookings: 0,
            totalRevenue: 0
        })
    },
    formatCurrency: {
        type: Function,
        required: true
    }
});
</script>

<template>
    <div class="booking-stats-container">
        <div class="stats-grid">
            <!-- Tổng đơn đặt -->
            <div class="stats-card">
                <div class="stats-card-content">
                    <div class="stats-icon blue">
                        <i class="pi pi-calendar"></i>
                    </div>
                    <div class="stats-data">
                        <div class="stats-label">Tổng đơn đặt</div>
                        <div class="stats-value">{{ stats.totalBookings }}</div>
                    </div>
                </div>
            </div>

            <!-- Chờ xác nhận -->
            <div class="stats-card">
                <div class="stats-card-content">
                    <div class="stats-icon orange">
                        <i class="pi pi-clock"></i>
                    </div>
                    <div class="stats-data">
                        <div class="stats-label">Chờ xác nhận</div>
                        <div class="stats-value">{{ stats.pendingBookings }}</div>
                    </div>
                </div>
            </div>

            <!-- Đã xác nhận -->
            <div class="stats-card">
                <div class="stats-card-content">
                    <div class="stats-icon green">
                        <i class="pi pi-check-circle"></i>
                    </div>
                    <div class="stats-data">
                        <div class="stats-label">Đã xác nhận</div>
                        <div class="stats-value">{{ stats.confirmedBookings }}</div>
                    </div>
                </div>
            </div>

            <!-- Đang ở -->
            <div class="stats-card">
                <div class="stats-card-content">
                    <div class="stats-icon cyan">
                        <i class="pi pi-home"></i>
                    </div>
                    <div class="stats-data">
                        <div class="stats-label">Đang ở</div>
                        <div class="stats-value">{{ stats.checkedInBookings }}</div>
                    </div>
                </div>
            </div>

            <!-- Đã trả phòng -->
            <div class="stats-card">
                <div class="stats-card-content">
                    <div class="stats-icon purple">
                        <i class="pi pi-sign-out"></i>
                    </div>
                    <div class="stats-data">
                        <div class="stats-label">Đã trả phòng</div>
                        <div class="stats-value">{{ stats.checkedOutBookings }}</div>
                    </div>
                </div>
            </div>

            <!-- Đã hủy -->
            <div class="stats-card">
                <div class="stats-card-content">
                    <div class="stats-icon red">
                        <i class="pi pi-times-circle"></i>
                    </div>
                    <div class="stats-data">
                        <div class="stats-label">Đã hủy</div>
                        <div class="stats-value">{{ stats.cancelledBookings }}</div>
                    </div>
                </div>
            </div>

            <!-- Doanh thu -->
            <div class="stats-card revenue">
                <div class="stats-card-content">
                    <div class="stats-icon green-light">
                        <i class="pi pi-money-bill"></i>
                    </div>
                    <div class="stats-data">
                        <div class="stats-label">Doanh thu</div>
                        <div class="stats-value">{{ formatCurrency(stats.totalRevenue) }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.booking-stats-container {
    margin-bottom: 1.5rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1rem;
}

.stats-card {
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
}

.stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stats-card-content {
    display: flex;
    align-items: center;
    padding: 1rem;
}

.stats-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    margin-right: 0.75rem;
    flex-shrink: 0;
}

.stats-icon i {
    font-size: 1.25rem;
    color: #ffffff;
}

.stats-data {
    flex-grow: 1;
}

.stats-label {
    font-size: 0.75rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
    white-space: nowrap;
}

.stats-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #212529;
}

/* Màu cho các icon */
.blue {
    background-color: #2196f3;
}

.orange {
    background-color: #ff9800;
}

.green {
    background-color: #4caf50;
}

.cyan {
    background-color: #00bcd4;
}

.purple {
    background-color: #9c27b0;
}

.red {
    background-color: #f44336;
}

.green-light {
    background-color: #66bb6a;
}

/* Responsive */
@media screen and (max-width: 1400px) {
    .stats-grid {
        grid-template-columns: repeat(4, 1fr);
    }

    .stats-card.revenue {
        grid-column: span 4;
    }
}

@media screen and (max-width: 992px) {
    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .stats-card.revenue {
        grid-column: span 3;
    }
}

@media screen and (max-width: 768px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .stats-card.revenue {
        grid-column: span 2;
    }
}

@media screen and (max-width: 576px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .stats-card.revenue {
        grid-column: span 1;
    }

    .stats-card-content {
        padding: 0.75rem;
    }
}
</style>
