<script setup>
import AuthService from '@/services/AuthService';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();

// Thông tin người dùng
const user = reactive({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    identityNumber: '',
    birthdate: null
});

// Tab hiện tại
const activeTab = ref('profile');

// Danh sách đặt phòng
const bookings = ref([]);
const loading = ref(true);

// Cập nhật thông tin
const isUpdatingProfile = ref(false);
const profileUpdateSuccess = ref(false);

// Mật khẩu
const passwords = reactive({
    current: '',
    new: '',
    confirm: ''
});
const isUpdatingPassword = ref(false);
const passwordUpdateSuccess = ref(false);
const passwordErrors = ref({});

// Kiểm tra đăng nhập
const isLoggedIn = computed(() => {
    return AuthService.isClientAuthenticated();
});

onMounted(async () => {
    // Kiểm tra đăng nhập
    if (!AuthService.isClientAuthenticated()) {
        return;
    }

    // Lấy thông tin user từ API
    try {
        loading.value = true;
        const userProfile = await AuthService.getCurrentUserProfile();

        if (userProfile) {
            // Cập nhật đầy đủ tất cả các trường thông tin theo cấu trúc API trả về
            user.fullName = userProfile.fullName || '';
            user.email = userProfile.email || '';
            user.phone = userProfile.phone || '';
            user.address = userProfile.address || '';
            user.identityNumber = userProfile.nationalId || '';
            user.birthdate = userProfile.dateOfBirth !== 'null' ? userProfile.dateOfBirth : null;

            // Gửi sự kiện để cập nhật navbar
            window.dispatchEvent(new CustomEvent('update-user-profile'));

            console.log('User profile loaded in profile page:', userProfile);
        } else {
            // Nếu không lấy được từ API, thử lấy từ localStorage
            const storedUser = AuthService.getCurrentUser();
            if (storedUser) {
                user.fullName = storedUser.name || '';
                user.email = storedUser.email || '';
            }
            console.log('Using stored user data:', storedUser);
        }
    } catch (error) {
        console.error('Error fetching user profile in profile page:', error);
        toast.add({
            severity: 'error',
            summary: 'Error Loading Profile',
            detail: 'Could not load your profile information. Please try again later.',
            life: 3000
        });
    } finally {
        loading.value = false;
    }

    // Lấy danh sách đặt phòng của người dùng
    try {
        const completedBooking = localStorage.getItem('completedBooking');
        if (completedBooking) {
            const parsed = JSON.parse(completedBooking);
            bookings.value = [parsed];
        }

        // Giả lập thêm vài đơn đặt phòng
        bookings.value.push({
            id: 'B123456',
            roomName: 'Phòng Deluxe',
            roomImage: 'room-deluxe.jpg',
            checkInDate: '2023-11-15',
            checkOutDate: '2023-11-20',
            totalPrice: 9000000,
            status: 'CONFIRMED',
            paymentStatus: 'PAID'
        });

        bookings.value.push({
            id: 'B123457',
            roomName: 'Phòng Standard',
            roomImage: 'room-standard.jpg',
            checkInDate: '2023-12-25',
            checkOutDate: '2023-12-30',
            totalPrice: 5000000,
            status: 'NEW',
            paymentStatus: 'UNPAID'
        });
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu đặt phòng:', error);
    } finally {
        loading.value = false;
    }
});

// Cập nhật thông tin cá nhân
const updateProfile = async () => {
    isUpdatingProfile.value = true;

    try {
        console.log('Updating profile with data:', {
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            nationalId: user.identityNumber,
            dateOfBirth: user.birthdate,
            gender: 'Male' // Thêm giới tính mặc định hoặc có thể bổ sung vào form
        });

        // Gọi API để cập nhật thông tin người dùng
        await AuthService.updateUserProfile({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            nationalId: user.identityNumber,
            dateOfBirth: user.birthdate,
            gender: 'Male' // Thêm giới tính mặc định hoặc có thể bổ sung vào form
        });

        profileUpdateSuccess.value = true;

        // Gửi sự kiện để cập nhật navbar
        window.dispatchEvent(new CustomEvent('update-user-profile'));

        // Hiển thị thông báo thành công
        toast.add({
            severity: 'success',
            summary: 'Profile Updated',
            detail: 'Your profile has been updated successfully',
            life: 3000
        });

        // Ẩn thông báo thành công sau 3 giây
        setTimeout(() => {
            profileUpdateSuccess.value = false;
        }, 3000);
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: error.message || 'An error occurred while updating your profile',
            life: 3000
        });
    } finally {
        isUpdatingProfile.value = false;
    }
};

// Cập nhật mật khẩu
const updatePassword = async () => {
    // Xác thực
    passwordErrors.value = {};

    if (!passwords.current) {
        passwordErrors.value.current = 'Current password is required';
    }

    if (!passwords.new) {
        passwordErrors.value.new = 'New password is required';
    } else if (passwords.new.length < 6) {
        passwordErrors.value.new = 'Password must be at least 6 characters';
    }

    if (passwords.new !== passwords.confirm) {
        passwordErrors.value.confirm = 'Confirm password does not match';
    }

    if (Object.keys(passwordErrors.value).length > 0) {
        return;
    }

    isUpdatingPassword.value = true;

    try {
        console.log('Attempting to change password');

        // Gọi API cập nhật mật khẩu
        await AuthService.changePassword(passwords.current, passwords.new);

        passwords.current = '';
        passwords.new = '';
        passwords.confirm = '';
        passwordUpdateSuccess.value = true;

        // Hiển thị thông báo thành công
        toast.add({
            severity: 'success',
            summary: 'Password Updated',
            detail: 'Your password has been changed successfully',
            life: 3000
        });

        // Ẩn thông báo thành công sau 3 giây
        setTimeout(() => {
            passwordUpdateSuccess.value = false;
        }, 3000);
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Password Update Failed',
            detail: error.message || 'An error occurred while updating your password',
            life: 3000
        });
    } finally {
        isUpdatingPassword.value = false;
    }
};

// Format tình trạng đặt phòng
const getStatusLabel = (status) => {
    switch (status) {
        case 'NEW':
            return 'Mới';
        case 'CONFIRMED':
            return 'Đã xác nhận';
        case 'CHECK_IN':
            return 'Đã nhận phòng';
        case 'CHECK_OUT':
            return 'Đã trả phòng';
        case 'CANCELLED':
            return 'Đã hủy';
        default:
            return status;
    }
};

// Lấy class cho trạng thái
const getStatusClass = (status) => {
    switch (status) {
        case 'NEW':
            return 'bg-blue-100 text-blue-800';
        case 'CONFIRMED':
            return 'bg-green-100 text-green-800';
        case 'CHECK_IN':
            return 'bg-purple-100 text-purple-800';
        case 'CHECK_OUT':
            return 'bg-gray-100 text-gray-800';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// Format ngày
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Hiển thị dialog đăng nhập
const showLoginDialog = () => {
    // Emit event để ClientLayout hiển thị login dialog
    const event = new CustomEvent('show-login-dialog');
    window.dispatchEvent(event);
};

// Chuyển hướng đến trang chi tiết đặt phòng (sử dụng router)
const viewBookingDetails = (bookingId) => {
    router.push(`/booking/confirmation/${bookingId}`);
};
</script>

<template>
    <div class="container mx-auto px-4 py-8 max-w-7xl">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="p-6">
                <h1 class="text-2xl font-bold mb-6 text-gray-800">Tài khoản của tôi</h1>

                <div v-if="!isLoggedIn" class="bg-white rounded-lg p-8 text-center">
                    <i class="pi pi-user-minus text-5xl text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Vui lòng đăng nhập</h3>
                    <p class="text-gray-600 mb-4">Bạn cần đăng nhập để xem thông tin tài khoản</p>
                    <Button label="Đăng nhập" @click="showLoginDialog" />
                </div>

                <div v-else>
                    <!-- Tab navigation -->
                    <div class="border-b mb-6">
                        <div class="flex space-x-6">
                            <button @click="activeTab = 'profile'" class="py-3 border-b-2 font-medium transition-colors" :class="activeTab === 'profile' ? 'text-amber-600 border-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
                                Thông tin cá nhân
                            </button>
                            <button @click="activeTab = 'password'" class="py-3 border-b-2 font-medium transition-colors" :class="activeTab === 'password' ? 'text-amber-600 border-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>

                    <!-- Nội dung tab -->
                    <div v-if="activeTab === 'profile'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Thông tin cá nhân -->
                        <div class="lg:col-span-2">
                            <h2 class="text-xl font-semibold mb-4">Personal Information</h2>

                            <div class="bg-amber-50 text-amber-700 px-4 py-3 rounded mb-4" v-if="profileUpdateSuccess"><i class="pi pi-check-circle mr-2"></i> Profile updated successfully!</div>

                            <div v-if="loading" class="flex justify-center py-8">
                                <i class="pi pi-spin pi-spinner text-3xl text-amber-500"></i>
                            </div>

                            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" v-model="user.fullName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" v-model="user.email" disabled class="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md" />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input type="tel" v-model="user.phone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                                    <input type="text" v-model="user.identityNumber" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                                    <input type="date" v-model="user.birthdate" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input type="text" v-model="user.address" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                </div>
                            </div>

                            <div class="flex justify-end">
                                <Button @click="updateProfile" :disabled="isUpdatingProfile" :loading="isUpdatingProfile" label="Update Profile" />
                            </div>
                        </div>

                        <!-- Đặt phòng gần đây -->
                        <div class="lg:col-span-1">
                            <h2 class="text-xl font-semibold mb-4">Đặt phòng gần đây</h2>

                            <div v-if="loading" class="text-center py-8">
                                <i class="pi pi-spin pi-spinner text-3xl text-amber-500"></i>
                            </div>

                            <div v-else-if="bookings.length === 0" class="bg-gray-50 rounded-lg p-4 text-center">
                                <i class="pi pi-calendar-times text-3xl text-gray-400 mb-2"></i>
                                <p class="text-gray-600 mb-3">Bạn chưa có đặt phòng nào</p>
                                <router-link to="/rooms" class="text-amber-600 hover:underline">Đặt phòng ngay</router-link>
                            </div>

                            <div v-else class="space-y-4">
                                <div v-for="booking in bookings.slice(0, 3)" :key="booking.id" class="border rounded-lg p-3">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="font-medium">{{ booking.roomName }}</span>
                                        <span class="text-xs px-2 py-1 rounded-full" :class="getStatusClass(booking.status)">
                                            {{ getStatusLabel(booking.status) }}
                                        </span>
                                    </div>

                                    <div class="text-sm text-gray-600 mb-2">{{ formatDate(booking.checkInDate) }} - {{ formatDate(booking.checkOutDate) }}</div>

                                    <a href="#" @click.prevent="viewBookingDetails(booking.id)" class="text-sm text-amber-600 hover:underline"> Xem chi tiết </a>
                                </div>

                                <div class="text-center mt-2">
                                    <router-link to="/my-bookings" class="text-amber-600 hover:underline text-sm"> Xem tất cả đặt phòng </router-link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Đổi mật khẩu -->
                    <div v-if="activeTab === 'password'" class="max-w-xl mx-auto">
                        <h2 class="text-xl font-semibold mb-4">Change Password</h2>

                        <div class="bg-green-50 text-green-700 px-4 py-3 rounded mb-4" v-if="passwordUpdateSuccess"><i class="pi pi-check-circle mr-2"></i> Password updated successfully!</div>

                        <div class="space-y-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input type="password" v-model="passwords.current" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                <p v-if="passwordErrors.current" class="mt-1 text-sm text-red-600">{{ passwordErrors.current }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input type="password" v-model="passwords.new" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                <p v-if="passwordErrors.new" class="mt-1 text-sm text-red-600">{{ passwordErrors.new }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input type="password" v-model="passwords.confirm" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                <p v-if="passwordErrors.confirm" class="mt-1 text-sm text-red-600">{{ passwordErrors.confirm }}</p>
                            </div>
                        </div>

                        <div class="flex justify-end">
                            <Button @click="updatePassword" :disabled="isUpdatingPassword" :loading="isUpdatingPassword" label="Update Password" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
