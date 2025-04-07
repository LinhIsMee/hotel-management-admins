import AuthService from '@/services/AuthService';
import { createRouter, createWebHistory } from 'vue-router';

// Layouts
import AdminLayout from '@/layout/AdminLayout.vue';
import ClientLayout from '@/layout/ClientLayout.vue';

// Client pages

// Admin page imports

// Định nghĩa route guards
const adminAuthGuard = (to, from, next) => {
    console.log('Admin Auth Guard - Checking authentication');

    if (AuthService.isAdminAuthenticated()) {
        console.log('Admin authenticated, proceeding to', to.path);
        next();
    } else {
        console.log('Admin not authenticated, redirecting to login');
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
                name: 'Home',
                component: () => import('@/views/client/HomePage.vue'),
                meta: { title: 'Trang chủ - Luxury Hotel' }
            },
            {
                path: 'rooms',
                name: 'RoomList',
                component: () => import('@/views/client/RoomListPage.vue'),
                meta: { title: 'Danh sách phòng - Luxury Hotel' }
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
                name: 'RoomDetail',
                component: () => import('@/views/client/RoomDetailPage.vue'),
                meta: { title: 'Chi tiết phòng - Luxury Hotel' },
                props: true
            },
            {
                path: '/booking/checkout',
                name: 'BookingCheckout',
                component: () => import('@/views/client/BookingCheckoutPage.vue'),
                meta: { title: 'Xác nhận đặt phòng - Luxury Hotel' }
            },
            {
                path: '/booking/checkout-new',
                name: 'BookingCheckoutNew',
                component: () => import('@/views/client/BookingCheckoutPageNew.vue'),
                meta: { title: 'Xác nhận đặt phòng - Luxury Hotel' }
            },
            {
                path: '/booking/confirm',
                name: 'BookingConfirm',
                component: () => import('@/views/client/BookingConfirmPage.vue'),
                meta: { title: 'Xác nhận đặt phòng - Luxury Hotel' }
            },
            {
                path: '/payment-callback',
                name: 'PaymentCallback',
                component: () => import('@/views/client/PaymentCallbackPage.vue'),
                meta: { title: 'Kết quả thanh toán - Luxury Hotel' }
            },
            {
                path: '/booking/confirmation/:id',
                name: 'BookingConfirmation',
                component: () => import('@/views/client/BookingConfirmationPage.vue'),
                meta: { title: 'Chi tiết đặt phòng - Luxury Hotel' },
                props: true
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
                name: 'Services',
                component: () => import('@/views/client/ServicesPage.vue'),
                meta: { title: 'Dịch vụ - Luxury Hotel' }
            },
            {
                path: 'about',
                name: 'About',
                component: () => import('@/views/client/AboutPage.vue'),
                meta: { title: 'Giới thiệu - Luxury Hotel' }
            },
            {
                path: 'contact',
                name: 'Contact',
                component: () => import('@/views/client/ContactPage.vue'),
                meta: { title: 'Liên hệ - Luxury Hotel' }
            },
            {
                path: 'my-profile',
                name: 'UserProfile',
                component: () => import('@/views/client/UserProfilePage.vue'),
                meta: {
                    title: 'Tài khoản của tôi - Luxury Hotel',
                    requiresAuth: true
                }
            },
            {
                path: 'my-bookings',
                name: 'MyBookings',
                component: () => import('@/views/client/UserBookingsPage.vue'),
                meta: {
                    title: 'Đặt phòng của tôi - Luxury Hotel',
                    requiresAuth: true
                }
            }
        ]
    },

    // Admin Auth routes
    {
        path: '/ ',
        children: [
            {
                path: 'login',
                name: 'admin-login',
                component: () => import('@/views/pages/auth/Login.vue'),
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
                path: 'reviews',
                name: 'adminReviews',
                component: () => import('@/views/pages/ReviewList.vue'),
                meta: { requiresAdminAuth: true }
            },
            {
                path: 'bookings',
                name: 'adminBookings',
                component: () => import('@/views/pages/BookingList.vue'),
                meta: { requiresAdminAuth: true }
            },
            {
                path: 'discounts',
                name: 'adminDiscounts',
                component: () => import('@/views/pages/DiscountList.vue'),
                meta: { requiresAdminAuth: true }
            }
        ]
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
        component: () => import('@/views/NotFoundPage.vue'),
        meta: { title: 'Không tìm thấy trang - Luxury Hotel' }
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
            next({
                path: '/auth/login',
                query: { redirect: to.fullPath }
            });
        } else {
            next();
        }
    }
    // Nếu route yêu cầu auth client nhưng chưa đăng nhập
    else if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!isClientAuthenticated) {
            // Lưu lại trang muốn truy cập để redirect sau khi đăng nhập
            const loginComponent = document.querySelector('.layout-wrapper');
            if (loginComponent && loginComponent.__vue__) {
                // Trigger login dialog thay vì chuyển hướng
                loginComponent.__vue__.showLoginDialog();
                next(false); // Ở lại trang hiện tại
            } else {
                next({
                    path: '/',
                    query: { redirect: to.fullPath }
                });
            }
        } else {
            next();
        }
    }
    // Nếu đã đăng nhập user và cố truy cập trang login/register
    else if ((to.path === '/auth/login' || to.path === '/auth/register') && isClientAuthenticated) {
        next('/');
    }
    // Nếu đã đăng nhập admin và cố truy cập trang login admin
    else if (to.path === '/auth/login' && !to.query.clientAuth && isAdminAuthenticated) {
        next('/admin/dashboard');
    } else {
        // Cập nhật title
        if (to.meta.title) {
            document.title = to.meta.title;
        }

        next();
    }
});

export default router;
