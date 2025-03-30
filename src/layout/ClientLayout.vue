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
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';
import Password from 'primevue/password';

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
const isLoading = ref(false);

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

onMounted(async () => {
    // Kiểm tra nếu người dùng đã đăng nhập và lấy thông tin
    await updateCurrentUser();

    // Lắng nghe sự kiện hiển thị dialog đăng nhập
    window.addEventListener('show-login-dialog', () => {
        showLoginModal.value = true;
    });

    // Lắng nghe sự kiện cập nhật profile
    window.addEventListener('update-user-profile', async () => {
        await updateCurrentUser();
    });

    // Lắng nghe sự kiện đăng xuất
    window.addEventListener('user-logged-out', () => {
        currentUser.value = null;
    });

    // Thêm event listener để đóng menu khi click ra ngoài
    document.addEventListener('click', handleOutsideClick);
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

const handleLoginSuccess = async (user) => {
    console.log('Login success with user:', user);

    // Lấy thông tin người dùng đầy đủ từ API
    await updateCurrentUser();

    toast.add({
        severity: 'success',
        summary: 'Đăng nhập thành công',
        detail: 'Chào mừng bạn quay trở lại!',
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
        detail: 'Tài khoản của bạn đã được tạo thành công. Vui lòng đăng nhập để tiếp tục.',
        life: 3000
    });

    showRegisterModal.value = false;

    setTimeout(() => {
        showLoginModal.value = true;
    }, 500);
};

const handleForgotPasswordSuccess = () => {
    toast.add({
        severity: 'info',
        summary: 'Yêu cầu đã gửi',
        detail: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.',
        life: 3000
    });

    forgotPasswordModalVisible.value = false;
};

const handleLogout = () => {
    // Xóa thông tin user khỏi localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('user_token');

    // Reset state
    currentUser.value = null;
    userMenuVisible.value = false;

    // Thông báo
    toast.add({
        severity: 'info',
        summary: 'Đăng xuất thành công',
        detail: 'Hẹn gặp lại bạn!',
        life: 3000
    });

    // Chuyển về trang chủ nếu đang ở trang cần đăng nhập
    const protectedRoutes = ['/my-profile', '/my-bookings'];
    if (protectedRoutes.some(route => router.currentRoute.value.path.startsWith(route))) {
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
const updateCurrentUser = async () => {
    // Kiểm tra xem có token không trước khi gọi API
    if (AuthService.isClientAuthenticated()) {
        try {
            // Lấy thông tin người dùng từ API
            const userProfile = await AuthService.getCurrentUserProfile();
            if (userProfile) {
                currentUser.value = userProfile;
                console.log('User profile loaded:', userProfile);
            } else {
                console.error('User profile returned null');
                currentUser.value = AuthService.getCurrentUser();
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Nếu có lỗi, sử dụng thông tin từ local storage
            currentUser.value = AuthService.getCurrentUser();
        }
    } else {
        currentUser.value = null;
    }
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
    if (currentUser.value) {
        return currentUser.value.name || currentUser.value.fullName || currentUser.value.username || 'User';
    }

    // Backup: lấy từ localStorage nếu currentUser.value là null
    const storedUser = AuthService.getCurrentUser();
    return storedUser?.name || storedUser?.username || 'User';
});

const userAvatar = computed(() => {
    if (currentUser.value?.avatar) {
        return currentUser.value.avatar;
    }
    return 'https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/avatar-facebook-dep/top-36-anh-dai-dien-dep-cho-nu/anh-dai-dien-dep-cho-nu-che-mat-anime.jpg?1708401649581';
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

const handleOutsideClick = (event) => {
    // Đóng user menu khi click bên ngoài
    if (userMenuVisible.value && !event.target.closest('.user-menu-container')) {
        userMenuVisible.value = false;
    }
};

// Form data
const loginForm = ref({
    email: '',
    password: '',
    rememberMe: false
});

const registerForm = ref({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
});

// Mock user data cho demo
const mockUserData = {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
};

const login = () => {
    if (!loginForm.value.email || !loginForm.value.password) {
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Vui lòng nhập đầy đủ thông tin',
            life: 3000
        });
        return;
    }

    isLoading.value = true;

    // Giả lập API call
    setTimeout(() => {
        isLoading.value = false;

        const userData = {
            id: '1',
            name: 'Nguyễn Văn A',
            fullName: 'Nguyễn Văn A',
            email: loginForm.value.email,
            phone: '0987654321',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        };

        // Lưu thông tin user vào localStorage - demo sử dụng token đơn giản
        localStorage.setItem('userInfo', JSON.stringify(userData));
        localStorage.setItem('user_token', 'demo_token_' + Math.random().toString(36).substr(2, 9));

        // Cập nhật state
        currentUser.value = userData;

        // Đóng modal
        showLoginModal.value = false;

        // Reset form
        loginForm.value = {
            email: '',
            password: '',
            rememberMe: false
        };

        // Thông báo
        toast.add({
            severity: 'success',
            summary: 'Đăng nhập thành công',
            detail: 'Chào mừng bạn quay trở lại!',
            life: 3000
        });

        // Chuyển hướng nếu cần
        const redirectPath = route.query.redirect;
        if (redirectPath) {
            router.push({ path: redirectPath });
        }
    }, 1000);
};

const register = () => {
    // Validate form
    if (!registerForm.value.fullName || !registerForm.value.email || !registerForm.value.password || !registerForm.value.confirmPassword) {
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Vui lòng nhập đầy đủ thông tin',
            life: 3000
        });
        return;
    }

    if (registerForm.value.password !== registerForm.value.confirmPassword) {
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Mật khẩu xác nhận không khớp',
            life: 3000
        });
        return;
    }

    if (!registerForm.value.agreeTerms) {
        toast.add({
            severity: 'warn',
            summary: 'Lưu ý',
            detail: 'Vui lòng đồng ý với điều khoản dịch vụ',
            life: 3000
        });
        return;
    }

    isLoading.value = true;

    // Giả lập API call
    setTimeout(() => {
        isLoading.value = false;

        // Đóng modal đăng ký và mở modal đăng nhập
        showRegisterModal.value = false;

        // Reset form
        registerForm.value = {
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            agreeTerms: false
        };

        // Thông báo
        toast.add({
            severity: 'success',
            summary: 'Đăng ký thành công',
            detail: 'Vui lòng đăng nhập để tiếp tục',
            life: 3000
        });

        // Mở modal đăng nhập
        setTimeout(() => {
            showLoginModal.value = true;
        }, 500);
    }, 1000);
};

const handleMobileLogout = () => {
    handleLogout();
    closeMobileMenu();
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
        <Dialog v-model:visible="showLoginModal" modal header="Đăng nhập" :style="{width: '400px'}" class="p-fluid">
            <div class="flex flex-column gap-3">
                <div class="text-center mb-4">
                    <p class="text-gray-600 text-sm">Đăng nhập để đặt phòng và nhận nhiều ưu đãi</p>
                </div>

                <div class="field">
                    <label for="email" class="font-medium text-gray-700">Email</label>
                    <InputText id="email" v-model="loginForm.email" placeholder="Nhập email của bạn" class="w-full p-3" />
                </div>

                <div class="field">
                    <label for="password" class="font-medium text-gray-700">Mật khẩu</label>
                    <Password id="password" v-model="loginForm.password" placeholder="Nhập mật khẩu" toggleMask />
                </div>

                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        <Checkbox v-model="loginForm.rememberMe" :binary="true" id="remember-me" />
                        <label for="remember-me" class="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</label>
                    </div>
                    <a href="#" @click.prevent="showForgotPasswordModal" class="text-sm text-amber-600 hover:text-amber-800">Quên mật khẩu?</a>
                </div>

                <Button label="Đăng nhập" class="w-full bg-amber-600 hover:bg-amber-700" @click="login" />

                <div class="relative flex items-center justify-center mt-2 mb-2">
                    <div class="border-t border-gray-300 w-full absolute"></div>
                    <div class="bg-white px-2 z-10 text-sm text-gray-500">hoặc</div>
                </div>

                <!-- Đăng nhập với Google/Facebook -->
                <div class="space-y-2">
                    <Button label="Đăng nhập với Google" icon="pi pi-google" class="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" />
                    <Button label="Đăng nhập với Facebook" icon="pi pi-facebook" class="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" />
                </div>

                <div class="text-center text-sm text-gray-600 mt-3">
                    Bạn chưa có tài khoản? <a href="#" @click.prevent="showRegisterModal = true; showLoginModal = false" class="text-amber-600 hover:text-amber-800">Đăng ký ngay</a>
                </div>
            </div>
        </Dialog>

        <!-- Register Dialog -->
        <Dialog v-model:visible="showRegisterModal" modal header="Đăng ký tài khoản" :style="{width: '400px'}" class="p-fluid">
            <div class="flex flex-column gap-3">
                <div class="text-center mb-4">
                    <p class="text-gray-600 text-sm">Đăng ký tài khoản để đặt phòng và nhận nhiều ưu đãi</p>
                </div>

                <div class="field">
                    <label for="fullname" class="font-medium text-gray-700">Họ tên</label>
                    <InputText id="fullname" v-model="registerForm.fullName" placeholder="Nhập họ tên của bạn" />
                </div>

                <div class="field">
                    <label for="register-email" class="font-medium text-gray-700">Email</label>
                    <InputText id="register-email" v-model="registerForm.email" placeholder="Nhập email của bạn" />
                </div>

                <div class="field">
                    <label for="register-phone" class="font-medium text-gray-700">Số điện thoại</label>
                    <InputText id="register-phone" v-model="registerForm.phone" placeholder="Nhập số điện thoại của bạn" />
                </div>

                <div class="field">
                    <label for="register-password" class="font-medium text-gray-700">Mật khẩu</label>
                    <Password id="register-password" v-model="registerForm.password" placeholder="Nhập mật khẩu" toggleMask />
                </div>

                <div class="field">
                    <label for="confirm-password" class="font-medium text-gray-700">Xác nhận mật khẩu</label>
                    <Password id="confirm-password" v-model="registerForm.confirmPassword" placeholder="Nhập lại mật khẩu" toggleMask />
                </div>

                <div class="flex items-start">
                    <Checkbox v-model="registerForm.agreeTerms" :binary="true" id="agree-terms" class="mt-1" />
                    <label for="agree-terms" class="ml-2 text-gray-700">Tôi đồng ý với <a href="#" class="text-amber-600 hover:underline">Điều khoản dịch vụ</a> và <a href="#" class="text-amber-600 hover:underline">Chính sách bảo mật</a></label>
                </div>

                <Button label="Đăng ký" class="w-full bg-amber-600 hover:bg-amber-700" @click="register" />

                <div class="text-center text-sm text-gray-600 mt-3">
                    Bạn đã có tài khoản? <a href="#" @click.prevent="showRegisterModal = false; showLoginModal = true" class="text-amber-600 hover:text-amber-800">Đăng nhập</a>
                </div>
            </div>
        </Dialog>
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

.client-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

main {
    flex: 1;
}

.user-menu-container {
    position: relative;
}
</style>
