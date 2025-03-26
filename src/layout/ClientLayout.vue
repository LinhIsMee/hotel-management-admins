<script setup>
import ForgotPasswordModal from '@/components/client/ForgotPasswordModal.vue';
import AuthService from '@/services/AuthService';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// Tạm thời comment dòng này lại
// import { useUserStore } from '@/stores/user';
import LoginDialog from '@/components/LoginDialog.vue';
import RegisterDialog from '@/components/RegisterDialog.vue';
import { useHead } from '@vueuse/head';
import Toast from 'primevue/toast';

const router = useRouter();
const route = useRoute();
const toast = useToast();
// Tạm tạo một userStore giả
const userStore = {
    isLoggedIn: false,
    user: null
};
const isMenuOpen = ref(false);
const currentUser = ref(null);
const userMenuVisible = ref(false);
const mobileMenuOpen = ref(false);
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const forgotPasswordModalVisible = ref(false);
const forgotPasswordEmail = ref('');

// Tạo canonical URL
const canonicalUrl = computed(() => {
    return `https://luxuryhotel.com${route.path}`;
});

// Schema.org - Thêm thông tin cấu trúc dữ liệu cho khách sạn
const hotelSchema = computed(() => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        name: 'Luxury Hotel',
        description: 'Khách sạn sang trọng hàng đầu Việt Nam với dịch vụ đẳng cấp 5 sao, giá thành hợp lý.',
        url: 'https://luxuryhotel.com',
        logo: 'https://luxuryhotel.com/logo.png',
        image: 'https://luxuryhotel.com/images/hotel-exterior.jpg',
        address: {
            '@type': 'PostalAddress',
            streetAddress: '123 Đường ABC',
            addressLocality: 'Quận 1',
            addressRegion: 'TP. Hồ Chí Minh',
            postalCode: '70000',
            addressCountry: 'VN'
        },
        telephone: '+84123456789',
        email: 'info@luxuryhotel.com',
        starRating: {
            '@type': 'Rating',
            ratingValue: '5'
        },
        priceRange: '$$',
        amenityFeature: [
            { '@type': 'LocationFeatureSpecification', name: 'Nhà hàng' },
            { '@type': 'LocationFeatureSpecification', name: 'Hồ bơi' },
            { '@type': 'LocationFeatureSpecification', name: 'Wifi miễn phí' },
            { '@type': 'LocationFeatureSpecification', name: 'Spa & Gym' }
        ]
    };
});

// Thiết lập head với canonical
useHead(() => ({
    meta: [
        {
            name: 'description',
            content: 'Luxury Hotel - Khách sạn sang trọng hàng đầu Việt Nam với dịch vụ đẳng cấp 5 sao, giá thành hợp lý.'
        }
    ],
    link: [
        {
            rel: 'canonical',
            href: canonicalUrl.value
        }
    ],
    script: [
        {
            type: 'application/ld+json',
            children: JSON.stringify(hotelSchema.value)
        }
    ]
}));

onMounted(() => {
    // Kiểm tra nếu người dùng đã đăng nhập
    updateCurrentUser();

    // Lắng nghe sự kiện hiển thị dialog đăng nhập
    window.addEventListener('show-login-dialog', () => {
        showLoginModal.value = true;
    });
});

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
    isMenuOpen.value = false;
};

const navigateToHome = () => {
    router.push('/');
    closeMenu();
};

const navigateToRooms = () => {
    router.push('/rooms');
    closeMenu();
};

const navigateToMyAccount = () => {
    if (AuthService.isClientAuthenticated()) {
        router.push('/my-profile');
    } else {
        showLoginModal.value = true;
    }
    closeMenu();
};

const openLoginModal = () => {
    showRegisterModal.value = false;
    forgotPasswordModalVisible.value = false;
    showLoginModal.value = true;
};

const handleLoginSuccess = (user) => {
    currentUser.value = user;
    toast.add({
        severity: 'success',
        summary: 'Đăng nhập thành công',
        detail: `Chào mừng ${user.name || 'bạn'} đã quay trở lại!`,
        life: 3000
    });

    // Kiểm tra và chuyển hướng nếu cần
    const redirectPath = route.query.redirect;
    if (redirectPath) {
        router.push({ path: redirectPath });
    }
};

const handleRegisterSuccess = () => {
    toast.add({
        severity: 'success',
        summary: 'Đăng ký thành công',
        detail: 'Vui lòng đăng nhập với tài khoản mới của bạn',
        life: 3000
    });

    showRegisterModal.value = false;

    setTimeout(() => {
        showLoginModal.value = true;
    }, 300);
};

const handleForgotPasswordSuccess = () => {
    toast.add({
        severity: 'success',
        summary: 'Yêu cầu đã được gửi',
        detail: 'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu',
        life: 3000
    });

    forgotPasswordModalVisible.value = false;
};

const handleLogout = () => {
    AuthService.logoutClient();
    currentUser.value = null;
    userMenuVisible.value = false;

    toast.add({
        severity: 'info',
        summary: 'Đăng xuất thành công',
        detail: 'Bạn đã đăng xuất khỏi tài khoản',
        life: 3000
    });

    // Điều hướng về trang chủ nếu đang ở trang yêu cầu đăng nhập
    const currentRoutePath = route.path;
    if (currentRoutePath.includes('/my-profile') || currentRoutePath.includes('/my-bookings')) {
        router.push('/');
    }
};

const toggleUserMenu = () => {
    userMenuVisible.value = !userMenuVisible.value;
};

const closeUserMenu = () => {
    userMenuVisible.value = false;
};

// Cập nhật thông tin người dùng hiện tại
const updateCurrentUser = () => {
    currentUser.value = AuthService.getCurrentUser();
};

// Quên mật khẩu
const showForgotPasswordModal = () => {
    showLoginModal.value = false;
    setTimeout(() => {
        forgotPasswordModalVisible.value = true;
    }, 300);
};

const sendResetPasswordRequest = () => {
    if (!forgotPasswordEmail.value) {
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Vui lòng nhập email',
            life: 3000
        });
        return;
    }

    // Giả lập gửi yêu cầu đặt lại mật khẩu
    toast.add({
        severity: 'success',
        summary: 'Yêu cầu đã được gửi',
        detail: 'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu',
        life: 3000
    });

    forgotPasswordModalVisible.value = false;
    forgotPasswordEmail.value = '';
};

// Tính toán thông tin người dùng
const isLoggedIn = computed(() => {
    return !!currentUser.value || AuthService.isClientAuthenticated();
});

const userName = computed(() => {
    const user = currentUser.value || AuthService.getCurrentUser();
    return user ? user.name || 'Người dùng' : 'Người dùng';
});

const userAvatar = computed(() => {
    const user = currentUser.value || AuthService.getCurrentUser();
    return user && user.avatar ? user.avatar : 'https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/avatar-facebook-dep/top-36-anh-dai-dien-dep-cho-nu/anh-dai-dien-dep-cho-nu-che-mat-anime.jpg?1708401649581';
});

// Provide các giá trị và phương thức để các component con có thể truy cập
provide('currentUser', currentUser);
provide('updateCurrentUser', updateCurrentUser);
provide('handleLoginSuccess', handleLoginSuccess);
provide('handleLogout', handleLogout);

const handleRegisterClick = () => {
    showLoginModal.value = false;
    setTimeout(() => {
        showRegisterModal.value = true;
    }, 300);
};

const handleLoginClick = () => {
    showRegisterModal.value = false;
    setTimeout(() => {
        showLoginModal.value = true;
    }, 300);
};
</script>

<template>
    <div class="client-layout">
        <!-- Header -->
        <header class="bg-white shadow-md sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center">
                        <router-link to="/" class="text-2xl font-bold"> <span class="text-amber-600">LUXURY</span><span class="text-slate-800">HOTEL</span> </router-link>
                    </div>

                    <!-- Desktop menu -->
                    <nav class="hidden md:flex space-x-8">
                        <router-link to="/" class="text-gray-700 hover:text-amber-600">Trang chủ</router-link>
                        <router-link to="/rooms" class="text-gray-700 hover:text-amber-600">Phòng</router-link>
                        <router-link to="/services" class="text-gray-700 hover:text-amber-600">Dịch vụ</router-link>
                        <router-link to="/about" class="text-gray-700 hover:text-amber-600">Giới thiệu</router-link>
                        <router-link to="/contact" class="text-gray-700 hover:text-amber-600">Liên hệ</router-link>
                    </nav>

                    <!-- User menu -->
                    <div class="flex items-center">
                        <button @click="openLoginModal" v-if="!isLoggedIn" class="text-gray-700 hover:text-primary"><i class="pi pi-user mr-1"></i> Đăng nhập</button>
                        <div v-else class="relative">
                            <button @click="toggleUserMenu" class="flex items-center text-gray-700 hover:text-primary">
                                <img :src="userAvatar" alt="User" class="w-8 h-8 rounded-full mr-1" />
                                <span class="hidden md:inline">{{ userName }}</span>
                                <i class="pi pi-chevron-down ml-1 text-xs"></i>
                            </button>

                            <!-- Menu User - Đây là phần cần sửa -->
                            <div v-if="userMenuVisible" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                <div class="py-1">
                                    <router-link to="/my-profile" class="block px-4 py-2 text-gray-700 hover:bg-amber-50" @click="closeUserMenu"> <i class="pi pi-user mr-2"></i> Tài khoản của tôi </router-link>
                                    <router-link to="/my-bookings" class="block px-4 py-2 text-gray-700 hover:bg-amber-50" @click="closeUserMenu"> <i class="pi pi-calendar mr-2"></i> Đặt phòng của tôi </router-link>
                                    <button @click="handleLogout" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50"><i class="pi pi-sign-out mr-2"></i> Đăng xuất</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile menu button -->
                    <div class="md:hidden">
                        <button @click="isMenuOpen = !isMenuOpen" class="text-gray-600 hover:text-amber-600">
                            <i class="pi" :class="isMenuOpen ? 'pi-times' : 'pi-bars'"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Mobile menu -->
            <div v-if="isMenuOpen" class="md:hidden">
                <div class="px-2 pt-2 pb-3 space-y-1 border-t">
                    <router-link to="/" class="block px-3 py-2 text-gray-700 hover:bg-amber-50">Trang chủ</router-link>
                    <router-link to="/rooms" class="block px-3 py-2 text-gray-700 hover:bg-amber-50">Phòng</router-link>
                    <router-link to="/services" class="block px-3 py-2 text-gray-700 hover:bg-amber-50">Dịch vụ</router-link>
                    <router-link to="/about" class="block px-3 py-2 text-gray-700 hover:bg-amber-50">Giới thiệu</router-link>
                    <router-link to="/contact" class="block px-3 py-2 text-gray-700 hover:bg-amber-50">Liên hệ</router-link>
                </div>
            </div>
        </header>

        <!-- Content -->
        <main>
            <router-view @show-login="openLoginModal"></router-view>
        </main>

        <!-- Footer -->
        <footer class="bg-gray-900 text-white pt-12 pb-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <!-- Cột 1: Thông tin thương hiệu -->
                    <div>
                        <div class="mb-6">
                            <span class="text-2xl font-bold"><span class="text-amber-500">LUXURY</span><span class="text-white">HOTEL</span></span>
                        </div>
                        <p class="text-gray-400 mb-6">Trải nghiệm đẳng cấp 5 sao với giá thành hợp lý cùng dịch vụ chuyên nghiệp tại hệ thống khách sạn của chúng tôi.</p>

                        <!-- Mạng xã hội -->
                        <h4 class="text-sm font-semibold mb-3 text-white">Kết nối với chúng tôi</h4>
                        <div class="flex flex-wrap">
                            <a href="#" aria-label="Facebook" class="text-gray-400 hover:text-white transition-colors p-3 inline-block">
                                <i class="pi pi-facebook text-xl"></i>
                            </a>
                            <a href="#" aria-label="Instagram" class="text-gray-400 hover:text-white transition-colors p-3 inline-block">
                                <i class="pi pi-instagram text-xl"></i>
                            </a>
                            <a href="#" aria-label="Twitter" class="text-gray-400 hover:text-white transition-colors p-3 inline-block">
                                <i class="pi pi-twitter text-xl"></i>
                            </a>
                            <a href="#" aria-label="LinkedIn" class="text-gray-400 hover:text-white transition-colors p-3 inline-block">
                                <i class="pi pi-linkedin text-xl"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Cột 2: Liên kết nhanh -->
                    <div>
                        <h3 class="text-lg font-semibold mb-4 text-white">Liên kết nhanh</h3>
                        <ul class="space-y-1">
                            <li>
                                <router-link to="/" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1"> Trang chủ </router-link>
                            </li>
                            <li>
                                <router-link to="/rooms" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1"> Danh sách phòng </router-link>
                            </li>
                            <li>
                                <router-link to="/services" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1"> Dịch vụ </router-link>
                            </li>
                            <li>
                                <router-link to="/about" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1"> Giới thiệu </router-link>
                            </li>
                            <li>
                                <router-link to="/contact" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1"> Liên hệ </router-link>
                            </li>
                        </ul>
                    </div>

                    <!-- Cột 3: Thông tin liên hệ -->
                    <div>
                        <h3 class="text-lg font-semibold mb-4 text-white">Thông tin liên hệ</h3>
                        <div class="space-y-1">
                            <div>
                                <a href="tel:+84123456789" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1" aria-label="Số điện thoại"> <i class="pi pi-phone mr-2"></i> +84 123 456 789 </a>
                            </div>
                            <div>
                                <a href="mailto:info@luxuryhotel.com" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1" aria-label="Email liên hệ"> <i class="pi pi-envelope mr-2"></i> info@luxuryhotel.com </a>
                            </div>
                            <div>
                                <a href="https://maps.google.com" target="_blank" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1" aria-label="Địa chỉ khách sạn">
                                    <i class="pi pi-map-marker mr-2"></i> 123 Đường ABC, Quận 1, TP. HCM
                                </a>
                            </div>
                            <div>
                                <a href="/faq" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1" aria-label="Câu hỏi thường gặp"> <i class="pi pi-question-circle mr-2"></i> Câu hỏi thường gặp </a>
                            </div>
                        </div>
                    </div>

                    <!-- Cột 4: Đăng ký nhận tin -->
                    <div>
                        <h3 class="text-lg font-semibold mb-4 text-white">Đăng ký nhận tin</h3>
                        <p class="text-gray-400 mb-4">Nhận thông tin ưu đãi và khuyến mãi mới nhất từ chúng tôi.</p>
                        <div class="flex mb-4">
                            <InputText placeholder="Email của bạn" class="w-full rounded-r-none" />
                            <Button icon="pi pi-send" class="rounded-l-none" aria-label="Gửi đăng ký" />
                        </div>

                        <!-- Chính sách -->
                        <div class="mt-4 text-sm">
                            <h4 class="font-semibold mb-2 text-white">Chính sách</h4>
                            <ul class="space-y-1">
                                <li>
                                    <router-link to="/privacy-policy" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1"> Chính sách bảo mật </router-link>
                                </li>
                                <li>
                                    <router-link to="/terms" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1"> Điều khoản sử dụng </router-link>
                                </li>
                                <li>
                                    <router-link to="/cancellation-policy" class="text-gray-400 hover:text-white transition-colors block py-2.5 px-1"> Chính sách hủy phòng </router-link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Thanh cuối footer - Copyright và phương thức thanh toán -->
                <div class="mt-10 pt-6 border-t border-gray-800">
                    <div class="flex flex-col md:flex-row justify-between items-center">
                        <p class="text-gray-400 text-sm">&copy; 2023 Luxury Hotel. Tất cả quyền được bảo lưu.</p>

                        <!-- Phương thức thanh toán - Sử dụng biểu tượng -->
                        <div class="mt-4 md:mt-0">
                            <div class="flex items-center space-x-3">
                                <span class="text-gray-400 text-sm">Chúng tôi chấp nhận:</span>
                                <!-- Thay thế bằng biểu tượng -->
                                <div class="flex space-x-2">
                                    <span class="bg-white px-2 py-1 rounded text-blue-600 font-bold text-sm">VISA</span>
                                    <span class="bg-white px-2 py-1 rounded text-orange-600 font-bold text-sm">MASTER</span>
                                    <span class="bg-white px-2 py-1 rounded text-blue-800 font-bold text-sm">PAYPAL</span>
                                    <span class="bg-purple-600 px-2 py-1 rounded text-white font-bold text-sm">MOMO</span>
                                    <span class="bg-blue-500 px-2 py-1 rounded text-white font-bold text-sm">VNPAY</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>

        <!-- Các modal -->
        <ForgotPasswordModal v-model:visible="forgotPasswordModalVisible" @login="handleLoginClick" @forgot-password-success="handleForgotPasswordSuccess" />

        <Toast position="bottom-right" />

        <!-- Login Dialog -->
        <LoginDialog :modelValue="showLoginModal" @update:modelValue="showLoginModal = $event" @login-success="handleLoginSuccess" @register="handleRegisterClick" @forgot-password="showForgotPasswordModal" />

        <!-- Register Dialog -->
        <RegisterDialog :modelValue="showRegisterModal" @update:modelValue="showRegisterModal = $event" @register-success="handleRegisterSuccess" @login="handleLoginClick" />
    </div>
</template>

<style scoped>
/* Thêm vào cuối file */
:deep(.login-dialog) {
    max-width: 450px;
    border-radius: 8px;
}

:deep(.login-dialog .p-dialog-header) {
    padding-bottom: 0;
    justify-content: center;
    border-bottom: none;
}

:deep(.login-dialog .p-dialog-title) {
    font-size: 1.25rem;
    font-weight: 600;
    color: #4b5563;
}

:deep(.login-dialog .p-dialog-content) {
    padding: 1.5rem;
}

:deep(.login-dialog .p-inputtext) {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.375rem;
}

:deep(.login-dialog .p-button) {
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
}

:deep(.p-checkbox) {
    margin-right: 0.5rem;
}
</style>
