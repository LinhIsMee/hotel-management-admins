import AuthService from '@/services/AuthService';
import { createRouter, createWebHistory } from 'vue-router';

// Layouts
import AdminLayout from '@/layout/AdminLayout.vue';
import ClientLayout from '@/layout/ClientLayout.vue';

// Client pages
import AboutPage from '@/views/client/AboutPage.vue';
import ContactPage from '@/views/client/ContactPage.vue';
import ServicesPage from '@/views/client/ServicesPage.vue';

// Admin page imports
import AdminLogin from '@/views/pages/auth/Login.vue';

// Định nghĩa route guards
const adminAuthGuard = (to, from, next) => {
    console.log("Admin Auth Guard - Checking authentication");

    if (AuthService.isAdminAuthenticated()) {
        console.log("Admin authenticated, proceeding to", to.path);
        next();
    } else {
        console.log("Admin not authenticated, redirecting to login");
        next({
            path: '/auth/login',
            query: { redirect: to.fullPath }
        });
    }
};

// Middleware chỉ cho phép truy cập khi chưa đăng nhập
const guestGuard = (to, from, next) => {
    const adminUser = JSON.parse(localStorage.getItem('adminUser'));

    if (adminUser && adminUser.isAdmin) {
        next({ path: '/admin/dashboard' });
    } else {
        next();
    }
};

// Client auth guard - kiểm tra người dùng client
const clientAuthGuard = (to, from, next) => {
    // Kiểm tra có token client không
    const isClientAuthenticated = AuthService.isClientAuthenticated();

    if (isClientAuthenticated) {
        next();
    } else {
        // Chuyển về trang chính và hiển thị form đăng nhập
        next({
            path: '/',
            query: { redirect: to.fullPath }
        });

        // Hiển thị form đăng nhập
        setTimeout(() => {
            const event = new CustomEvent('show-login-dialog');
            window.dispatchEvent(event);
        }, 100);
    }
};

const routes = [
    // Client routes
    {
        path: '/',
        component: ClientLayout,
            children: [
                {
                path: '',
                name: 'home',
                component: () => import('@/views/client/HomePage.vue')
            },
            {
                path: 'rooms',
                name: 'rooms',
                component: () => import('@/views/client/RoomListPage.vue')
            },
            {
                path: 'profile',
                name: 'profile',
                component: () => import('@/views/client/UserProfilePage.vue'),
                meta: { requiresAuth: true },
                beforeEnter: clientAuthGuard
            },
            {
                path: '/room/:id',
                name: 'roomDetail',
                component: () => import('@/views/client/RoomDetailPage.vue')
            },
            {
                path: '/booking/checkout',
                name: 'bookingCheckout',
                component: () => import('@/views/client/BookingCheckoutPage.vue')
            },
            {
                path: '/booking/confirmation/:id',
                name: 'bookingConfirmation',
                component: () => import('@/views/client/BookingConfirmationPage.vue')
            },
            {
                path: 'bookings',
                name: 'bookings',
                component: () => import('@/views/client/BookingsPage.vue'),
                meta: { requiresAuth: true },
                beforeEnter: clientAuthGuard
            },
            {
                path: 'services',
                name: 'services',
                component: ServicesPage
            },
            {
                path: 'about',
                name: 'about',
                component: AboutPage
            },
            {
                path: 'contact',
                name: 'contact',
                component: ContactPage
            },
            {
                path: 'my-profile',
                name: 'userProfile',
                component: () => import('@/views/client/UserProfilePage.vue'),
                meta: { requiresClientAuth: true }
            },
            {
                path: 'my-bookings',
                name: 'userBookings',
                component: () => import('@/views/client/UserBookingsPage.vue'),
                meta: { requiresClientAuth: true }
            }
        ]
    },

    // Admin Auth routes
    {
        path: '/auth',
        children: [
            {
                path: 'login',
                name: 'admin-login',
                component: AdminLogin,
                beforeEnter: guestGuard
            },
            {
                path: 'forgot-password',
                name: 'forgot-password',
                component: () => import('@/views/pages/auth/ForgotPassword.vue')
            }
        ]
    },

    // Admin routes
    {
        path: '/admin',
        component: AdminLayout,
        beforeEnter: adminAuthGuard,
        children: [
            { path: '', redirect: '/admin/dashboard' },
            {
                path: 'dashboard',
                name: 'adminDashboard',
                component: () => import('@/views/pages/admin/Dashboard.vue'),
                meta: { requiresAdminAuth: true }
            },
            {
                path: 'users',
                name: 'admin-users',
                component: () => import('@/views/pages/UserList.vue')
            },
            {
                path: 'employees',
                name: 'adminEmployees',
                component: () => import('@/views/pages/EmployeeList.vue'),
                meta: { requiresAdminAuth: true }
            },
            {
                path: 'rooms',
                name: 'adminRooms',
                component: () => import('@/views/pages/RoomList.vue'),
                meta: { requiresAdminAuth: true }
            },
            {
                path: 'room-types',
                name: 'adminRoomTypes',
                component: () => import('@/views/pages/RoomTypeList.vue'),
                meta: { requiresAdminAuth: true }
            },
            {
                path: 'services',
                name: 'adminServices',
                component: () => import('@/views/pages/ServiceList.vue'),
                meta: { requiresAdminAuth: true }
            },
            {
                path: 'ratings',
                name: 'adminRatings',
                component: () => import('@/views/pages/RatingList.vue'),
                meta: { requiresAdminAuth: true }
            },
            {
                path: 'bookings',
                name: 'adminBookings',
                component: () => import('@/views/pages/BookingList.vue'),
                meta: { requiresAdminAuth: true }
            },
            {
                path: 'booking-history',
                name: 'adminBookingHistory',
                component: () => import('@/views/pages/BookingHistory.vue'),
                meta: { requiresAdminAuth: true }
            },
            {
                path: 'discounts',
                name: 'adminDiscounts',
                component: () => import('@/views/pages/DiscountList.vue'),
                meta: { requiresAdminAuth: true }
            }
        ],
    },

    // Login route - tách riêng ra khỏi layout admin
        {
            path: '/auth/login',
        name: 'adminLogin',
        component: () => import('@/views/pages/auth/Login.vue'),
        meta: { isAdminLoginPage: true }
        },

    // Authentication routes
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        {
            path: '/auth/verify-otp',
            name: 'verifyOTP',
            component: () => import('@/views/pages/auth/VerifyOTP.vue')
        },
        {
            path: '/auth/reset-password',
            name: 'resetPassword',
            component: () => import('@/views/pages/auth/ResetPassword.vue')
        },
        {
            path: '/auth/success',
            name: 'authSuccess',
            component: () => import('@/views/pages/auth/Success.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },

    // Fallback route
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFoundPage.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Middleware để kiểm tra đăng nhập user cho các trang yêu cầu
router.beforeEach((to, from, next) => {
    const isClientAuthenticated = AuthService.isClientAuthenticated();
    const isAdminAuthenticated = AuthService.isAdminAuthenticated();

    // Nếu route yêu cầu auth admin nhưng chưa đăng nhập admin
    if (to.matched.some((record) => record.meta.requiresAdminAuth)) {
        if (!isAdminAuthenticated) {
            return next({
                path: '/auth/login',
                query: { redirect: to.fullPath }
            });
        }
        return next();
    }

    // Nếu route yêu cầu auth client nhưng chưa đăng nhập
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!isClientAuthenticated) {
            // Lưu lại trang muốn truy cập để redirect sau khi đăng nhập
            const loginComponent = document.querySelector('.layout-wrapper');
            if (loginComponent) {
                // Trigger login dialog thay vì chuyển hướng
                loginComponent.__vue__?.showLoginDialog();
            } else {
                return next({
                    path: '/',
                    query: { redirect: to.fullPath }
                });
            }
            return false; // Ở lại trang hiện tại
        }
        return next();
    }

    // Nếu đã đăng nhập user và cố truy cập trang login/register
    if ((to.path === '/auth/login' || to.path === '/auth/register') && isClientAuthenticated) {
        return next('/');
    }

    // Nếu đã đăng nhập admin và cố truy cập trang login admin
    if (to.path === '/auth/login' && !to.query.clientAuth && isAdminAuthenticated) {
        return next('/admin/dashboard');
    }

    return next();
});

export default router;
