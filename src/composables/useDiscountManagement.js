import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

// Import axios từ file service

export function useDiscountManagement() {
    const toast = useToast();
    const discounts = ref([]);
    const loading = ref(true);
    const totalRecords = ref(0);
    const discountDialog = ref(false);
    const deleteDiscountDialog = ref(false);
    const generateDiscountDialog = ref(false);
    const selectedDiscount = ref(null);
    const selectedDiscounts = ref([]);
    const submitted = ref(false);
    const discount = ref(initNewDiscount());

    // Định nghĩa API_BASE_URL
    const API_BASE_URL = 'http://localhost:9000';

    // Định nghĩa các loại giảm giá
    const discountTypes = [
        { label: 'Phần trăm', value: 'PERCENT' },
        { label: 'Số tiền cố định', value: 'FIXED' }
    ];

    // Hàm helper lấy token từ localStorage
    const getAuthToken = () => {
        try {
            const adminTokenData = localStorage.getItem('admin_token');
            if (!adminTokenData) {
                toast.add({
                    severity: 'error',
                    summary: 'Lỗi xác thực',
                    detail: 'Không tìm thấy token đăng nhập, vui lòng đăng nhập lại',
                    life: 3000
                });
                return null;
            }

            const adminTokenObj = JSON.parse(adminTokenData);
            const accessToken = adminTokenObj.accessToken;
            if (!accessToken) {
                toast.add({
                    severity: 'error',
                    summary: 'Lỗi xác thực',
                    detail: 'Token không hợp lệ, vui lòng đăng nhập lại',
                    life: 3000
                });
                return null;
            }

            return accessToken;
        } catch (error) {
            console.error('Lỗi khi lấy token:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi xác thực',
                detail: 'Có lỗi xảy ra khi xác thực, vui lòng đăng nhập lại',
                life: 3000
            });
            return null;
        }
    };

    // Thêm hàm helper để tạo header xác thực
    const getAuthHeaders = (contentType = false) => {
        const token = getAuthToken();
        if (!token) return null;

        const headers = {
            Authorization: `Bearer ${token}`
        };

        if (contentType) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;
    };

    // 1. Lấy tất cả mã giảm giá
    const fetchDiscounts = async () => {
        loading.value = true;
        try {
            const headers = getAuthHeaders();
            if (!headers) {
                loading.value = false;
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/v1/discounts`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải danh sách mã giảm giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            discounts.value = Array.isArray(result) ? result : result.data || [];
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu mã giảm giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải danh sách mã giảm giá',
                life: 3000
            });
            discounts.value = [];
        } finally {
            loading.value = false;
        }
    };

    // 2. Lấy mã giảm giá theo ID
    const fetchDiscountById = async (id) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/discounts/${id}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải thông tin mã giảm giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Lỗi khi tải thông tin mã giảm giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải thông tin mã giảm giá',
                life: 3000
            });
            return null;
        }
    };

    // 3. Lấy mã giảm giá theo code
    const fetchDiscountByCode = async (code) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/discounts/code/${code}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải thông tin mã giảm giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Lỗi khi tải thông tin mã giảm giá theo mã:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải thông tin mã giảm giá',
                life: 3000
            });
            return null;
        }
    };

    // 4. Lấy mã giảm giá đang hoạt động
    const fetchActiveDiscounts = async () => {
        loading.value = true;
        try {
            const headers = getAuthHeaders();
            if (!headers) {
                loading.value = false;
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/v1/discounts/active`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải danh sách mã giảm giá đang hoạt động: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            discounts.value = Array.isArray(result) ? result : result.data || [];
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu mã giảm giá đang hoạt động:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải danh sách mã giảm giá đang hoạt động',
                life: 3000
            });
            discounts.value = [];
        } finally {
            loading.value = false;
        }
    };

    // 5. Tạo mã giảm giá mới
    const createDiscount = async (discountData) => {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/discounts`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(discountData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Lỗi khi tạo mã giảm giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Tạo mã giảm giá mới thành công',
                life: 3000
            });

            // Cập nhật danh sách mã giảm giá
            await fetchDiscounts();

            return result;
        } catch (error) {
            console.error('Lỗi khi tạo mã giảm giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tạo mã giảm giá mới',
                life: 3000
            });
            return null;
        }
    };

    // 6. Tạo nhiều mã giảm giá ngẫu nhiên
    const generateDiscounts = async (generateOptions) => {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/discounts/generate`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(generateOptions)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Lỗi khi tạo mã giảm giá hàng loạt: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: `Đã tạo ${result.length || 'nhiều'} mã giảm giá mới`,
                life: 3000
            });

            // Cập nhật danh sách mã giảm giá
            await fetchDiscounts();

            return result;
        } catch (error) {
            console.error('Lỗi khi tạo mã giảm giá hàng loạt:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tạo mã giảm giá hàng loạt',
                life: 3000
            });
            return null;
        }
    };

    // 7. Cập nhật mã giảm giá
    const updateDiscount = async (id, discountData) => {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/discounts/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(discountData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Lỗi khi cập nhật mã giảm giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Cập nhật mã giảm giá thành công',
                life: 3000
            });

            // Cập nhật danh sách mã giảm giá
            await fetchDiscounts();

            return result;
        } catch (error) {
            console.error('Lỗi khi cập nhật mã giảm giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể cập nhật mã giảm giá',
                life: 3000
            });
            return null;
        }
    };

    // 8. Xóa mã giảm giá
    const deleteDiscount = async (id) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return false;

            console.log('Đang gọi API xóa mã giảm giá với ID:', id);

            const response = await fetch(`${API_BASE_URL}/api/v1/discounts/${id}`, {
                method: 'DELETE',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi xóa mã giảm giá: ${response.statusText} (${response.status})`);
            }

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Xóa mã giảm giá thành công',
                life: 3000
            });

            // Cập nhật danh sách mã giảm giá
            await fetchDiscounts();

            console.log('Đã xóa mã giảm giá thành công với ID:', id);
            return true;
        } catch (error) {
            console.error('Lỗi khi xóa mã giảm giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể xóa mã giảm giá',
                life: 3000
            });
            return false;
        }
    };

    // 9. Kiểm tra tính hợp lệ của mã giảm giá
    const validateDiscountCode = async (code) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            const response = await fetch(`${API_BASE_URL}/api/v1/discounts/validate/${code}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi kiểm tra mã giảm giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Lỗi khi kiểm tra mã giảm giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể kiểm tra mã giảm giá',
                life: 3000
            });
            return null;
        }
    };

    // 10. Áp dụng mã giảm giá
    const applyDiscount = async (code, amount) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return null;

            const url = `${API_BASE_URL}/api/v1/discounts/apply?code=${code}&amount=${amount}`;
            const response = await fetch(url, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi áp dụng mã giảm giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Lỗi khi áp dụng mã giảm giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể áp dụng mã giảm giá',
                life: 3000
            });
            return null;
        }
    };

    // 11. Sử dụng mã giảm giá
    const useDiscountCode = async (code) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return false;

            const response = await fetch(`${API_BASE_URL}/api/v1/discounts/use/${code}`, {
                method: 'POST',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi sử dụng mã giảm giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Lỗi khi sử dụng mã giảm giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể sử dụng mã giảm giá',
                life: 3000
            });
            return false;
        }
    };

    // Khởi tạo mã giảm giá mới
    function initNewDiscount() {
        return {
            code: '',
            discountType: 'PERCENT',
            discountValue: 0,
            validFrom: new Date(),
            validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            maxUses: 100,
            usedCount: 0,
            minOrderValue: 0,
            isActive: true
        };
    }

    // Định dạng giá trị giảm giá
    const formatDiscountValue = (discountItem) => {
        if (!discountItem) return '';

        if (discountItem.discountType === 'PERCENT') {
            return `${discountItem.discountValue}%`;
        } else {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0
            }).format(discountItem.discountValue);
        }
    };

    // Tính số ngày còn lại
    const calculateDaysRemaining = (validTo) => {
        if (!validTo) return 0;

        const endDate = new Date(validTo);
        const today = new Date();

        // Xóa thời gian để chỉ so sánh ngày
        endDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = endDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Đánh giá trạng thái của mã giảm giá
    const getDiscountStatus = (discountItem) => {
        if (!discountItem) {
            return { label: 'Không xác định', severity: 'secondary' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(discountItem.validFrom);
        const endDate = new Date(discountItem.validTo);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        // Kiểm tra trạng thái active trước
        if (!discountItem.active) {
            return { label: 'Vô hiệu hóa', severity: 'secondary' }; // Màu xám cho trạng thái vô hiệu hóa
        }

        // Sau đó kiểm tra các điều kiện khác
        if (discountItem.usedCount >= discountItem.maxUses) {
            return { label: 'Đã hết lượt', severity: 'danger' }; // Màu đỏ cho trạng thái hết lượt
        }

        if (today < startDate) {
            return { label: 'Chưa bắt đầu', severity: 'info' }; // Màu xanh dương cho trạng thái chưa bắt đầu
        }

        if (today > endDate) {
            return { label: 'Đã hết hạn', severity: 'danger' }; // Màu đỏ cho trạng thái hết hạn
        }

        if (!discountItem.valid) {
            return { label: 'Không hợp lệ', severity: 'warning' }; // Màu cam cho trạng thái không hợp lệ
        }

        return { label: 'Đang hoạt động', severity: 'success' }; // Màu xanh lá cho trạng thái đang hoạt động
    };

    // Đánh giá mức độ sử dụng mã giảm giá
    const getUsagePercentage = (discountItem) => {
        if (!discountItem || discountItem.maxUses === 0) {
            return 0;
        }

        const usagePercent = (discountItem.usedCount / discountItem.maxUses) * 100;
        return Math.min(Math.round(usagePercent), 100);
    };

    // Mở dialog tạo mã giảm giá mới
    const openNew = () => {
        discount.value = initNewDiscount();
        submitted.value = false;
        discountDialog.value = true;
    };

    // Mở dialog tạo nhiều mã giảm giá
    const openGenerateDialog = () => {
        discount.value = {
            ...initNewDiscount(),
            prefix: 'PROMO',
            count: 5
        };
        submitted.value = false;
        generateDiscountDialog.value = true;
    };

    // Ẩn dialog
    const hideDialog = () => {
        discountDialog.value = false;
        generateDiscountDialog.value = false;
        submitted.value = false;
    };

    // Lưu mã giảm giá
    const saveDiscount = async () => {
        try {
            submitted.value = true;

            if (!validateDiscountForm()) {
                return;
            }

            const discountData = { ...discount.value };

            // Chuyển đổi đối tượng Date thành chuỗi ngày
            if (discountData.validFrom instanceof Date) {
                discountData.validFrom = discountData.validFrom.toISOString().split('T')[0];
            }
            if (discountData.validTo instanceof Date) {
                discountData.validTo = discountData.validTo.toISOString().split('T')[0];
            }

            let result;
            if (discountData.id) {
                // Cập nhật mã giảm giá hiện có
                result = await updateDiscount(discountData.id, discountData);
            } else {
                // Tạo mã giảm giá mới
                result = await createDiscount(discountData);
            }

            if (result) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Lỗi khi lưu mã giảm giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Có lỗi xảy ra khi lưu mã giảm giá',
                life: 3000
            });
            return false;
        }
    };

    // Tạo nhiều mã giảm giá
    const saveGeneratedDiscounts = async () => {
        try {
            submitted.value = true;

            if (!discount.value.discountType || !discount.value.discountValue || !discount.value.validFrom || !discount.value.validTo) {
                toast.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng điền đầy đủ thông tin',
                    life: 3000
                });
                return false;
            }

            const generateOptions = {
                prefix: discount.value.prefix || 'PROMO',
                count: discount.value.count || 5,
                length: discount.value.length || 8,
                discountType: discount.value.discountType,
                discountValue: discount.value.discountValue,
                validFrom: discount.value.validFrom instanceof Date ? discount.value.validFrom.toISOString().split('T')[0] : discount.value.validFrom,
                validTo: discount.value.validTo instanceof Date ? discount.value.validTo.toISOString().split('T')[0] : discount.value.validTo,
                maxUses: discount.value.maxUses || 100,
                minOrderValue: discount.value.minOrderValue || 0,
                isActive: discount.value.isActive !== undefined ? discount.value.isActive : true
            };

            const result = await generateDiscounts(generateOptions);
            if (result) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Lỗi khi tạo mã giảm giá hàng loạt:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Có lỗi xảy ra khi tạo mã giảm giá hàng loạt',
                life: 3000
            });
            return false;
        }
    };

    // Chỉnh sửa mã giảm giá
    const editDiscount = (editDiscount) => {
        discount.value = { ...editDiscount };

        // Chuyển đổi string thành Date object cho các trường ngày tháng
        if (typeof discount.value.validFrom === 'string') {
            discount.value.validFrom = new Date(discount.value.validFrom);
        }
        if (typeof discount.value.validTo === 'string') {
            discount.value.validTo = new Date(discount.value.validTo);
        }

        discountDialog.value = true;
    };

    // Xác nhận xóa mã giảm giá
    const confirmDeleteDiscount = (discountItem) => {
        selectedDiscount.value = discountItem;
        deleteDiscountDialog.value = true;
    };

    // Thực hiện xóa mã giảm giá
    const confirmDelete = async (discountToDelete) => {
        try {
            console.log('Xác nhận xóa mã giảm giá:', discountToDelete);

            if (!discountToDelete || !discountToDelete.id) {
                console.error('Không thể xóa mã giảm giá - không có ID', discountToDelete);
                toast.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể xóa mã giảm giá do thiếu ID',
                    life: 3000
                });
                return false;
            }

            const success = await deleteDiscount(discountToDelete.id);
            if (success) {
                // Không cần lọc lại mảng discounts vì fetchDiscounts đã được gọi trong deleteDiscount
                deleteDiscountDialog.value = false;
                selectedDiscount.value = null;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Lỗi trong quá trình xóa mã giảm giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Có lỗi xảy ra khi xóa mã giảm giá',
                life: 3000
            });
            return false;
        }
    };

    const validateDiscountForm = () => {
        const { code, discountType, discountValue, validFrom, validTo } = discount.value;

        if (!code || !discountType || !discountValue || !validFrom || !validTo) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Vui lòng điền đầy đủ thông tin bắt buộc',
                life: 3000
            });
            return false;
        }

        // Kiểm tra định dạng mã giảm giá
        if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Mã giảm giá chỉ được chứa chữ hoa, số, gạch dưới hoặc gạch ngang, độ dài từ 3-20 ký tự',
                life: 3000
            });
            return false;
        }

        // Kiểm tra ngày hợp lệ
        const fromDate = validFrom instanceof Date ? validFrom : new Date(validFrom);
        const toDate = validTo instanceof Date ? validTo : new Date(validTo);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Ngày không hợp lệ',
                life: 3000
            });
            return false;
        }

        if (fromDate > toDate) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Ngày bắt đầu phải trước ngày kết thúc',
                life: 3000
            });
            return false;
        }

        // Kiểm tra giá trị giảm giá
        if (discountType === 'PERCENT' && (discountValue <= 0 || discountValue > 100)) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Phần trăm giảm giá phải nằm trong khoảng 1-100%',
                life: 3000
            });
            return false;
        }

        if (discountType === 'FIXED' && discountValue <= 0) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Giá trị giảm phải lớn hơn 0',
                life: 3000
            });
            return false;
        }

        return true;
    };

    // Cập nhật trạng thái mã giảm giá
    const updateDiscountStatus = async (discount) => {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return null;

            // Cập nhật trạng thái active
            const updatedDiscount = {
                ...discount,
                active: !discount.active
            };

            const response = await fetch(`${API_BASE_URL}/api/v1/discounts/${discount.id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(updatedDiscount)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Lỗi khi cập nhật trạng thái mã giảm giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: `Đã ${result.active ? 'kích hoạt' : 'vô hiệu hóa'} mã giảm giá`,
                life: 3000
            });

            // Cập nhật danh sách mã giảm giá
            await fetchDiscounts();

            return result;
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái mã giảm giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể cập nhật trạng thái mã giảm giá',
                life: 3000
            });
            return null;
        }
    };

    return {
        discounts,
        loading,
        totalRecords,
        discountDialog,
        deleteDiscountDialog,
        generateDiscountDialog,
        discount,
        selectedDiscount,
        selectedDiscounts,
        submitted,
        discountTypes,

        fetchDiscounts,
        fetchDiscountById,
        fetchDiscountByCode,
        fetchActiveDiscounts,
        createDiscount,
        generateDiscounts,
        updateDiscount,
        deleteDiscount,
        validateDiscountCode,
        applyDiscount,
        useDiscountCode,

        formatDiscountValue,
        calculateDaysRemaining,
        getDiscountStatus,
        getUsagePercentage,

        openNew,
        openGenerateDialog,
        hideDialog,
        saveDiscount,
        saveGeneratedDiscounts,
        editDiscount,
        confirmDeleteDiscount,
        confirmDelete,
        validateDiscountForm,
        updateDiscountStatus
    };
}
