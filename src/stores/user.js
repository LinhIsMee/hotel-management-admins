import AuthService from '@/services/AuthService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Đọc thông tin user từ localStorage khi khởi tạo
  const storedUser = localStorage.getItem('userInfo');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }

  // Computed
  const isLoggedIn = computed(() => !!user.value);

  // Khởi tạo store từ localStorage nếu có
  function initialize() {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      user.value = currentUser;
    }
  }

  // Login action
  async function login(credentials) {
    loading.value = true;
    error.value = null;

    try {
      const userData = await AuthService.login(credentials);
      user.value = userData;
      localStorage.setItem('userInfo', JSON.stringify(userData));
      return userData;
    } catch (err) {
      error.value = err.message || 'Đăng nhập không thành công';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Logout action
  function logout() {
    AuthService.logout();
    user.value = null;
    localStorage.removeItem('userInfo');
  }

  // Update profile
  function updateProfile(userData) {
    user.value = { ...user.value, ...userData };
    // Cập nhật localStorage nếu cần
    if (AuthService.updateLocalUser) {
      AuthService.updateLocalUser(user.value);
    }
  }

  // Đăng nhập user thông thường (không phải admin)
  const loginUser = async (credentials) => {
    loading.value = true;
    error.value = null;

    try {
      // Giả lập API call, thực tế sẽ gọi API ở đây
      await new Promise(resolve => setTimeout(resolve, 800));

      // Demo data, thực tế sẽ lấy từ API
      const userData = {
        id: 1,
        name: 'Nguyễn Văn A',
        email: credentials.email,
        avatar: 'https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/avatar-facebook-dep/top-36-anh-dai-dien-dep-cho-nu/anh-dai-dien-dep-cho-nu-che-mat-anime.jpg?1708401649581',
        phone: '0987654321'
      };

      user.value = userData;
      localStorage.setItem('userInfo', JSON.stringify(userData));

      return userData;
    } catch (err) {
      error.value = err.message || 'Đăng nhập thất bại';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Đăng xuất user
  const logoutUser = () => {
    user.value = null;
    localStorage.removeItem('userInfo');
  };

  // Đăng ký user
  const registerUser = async (userData) => {
    loading.value = true;
    error.value = null;

    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Demo data
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        avatar: 'https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/avatar-facebook-dep/top-36-anh-dai-dien-dep-cho-nu/anh-dai-dien-dep-cho-nu-che-mat-anime.jpg?1708401649581',
        phone: userData.phone || ''
      };

      // Không tự động đăng nhập sau khi đăng ký
      return newUser;
    } catch (err) {
      error.value = err.message || 'Đăng ký thất bại';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    error,
    isLoggedIn,
    initialize,
    login,
    logout,
    updateProfile,
    loginUser,
    logoutUser,
    registerUser
  };
});
