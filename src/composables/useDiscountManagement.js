import { ref, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';

// Import axios từ file service
import apiService from '@/services/apiService';

export function useDiscountManagement() {
    const toast = useToast();
    const apiUrl = '/api/discounts';
    const discounts = ref([]);
    const loading = ref(false);
    const totalRecords = ref(0);
    const discountDialog = ref(false);
    const deleteDiscountDialog = ref(false);
    const generateDiscountDialog = ref(false);
    const selectedDiscount = ref(null);
    const selectedDiscounts = ref([]);
    const submitted = ref(false);
    const discount = ref(initNewDiscount());

    // Định nghĩa các loại giảm giá
    const discountTypes = [
        { label: 'Phần trăm', value: 'PERCENT' },
        { label: 'Số tiền cố định', value: 'FIXED' }
    ];

    // Lấy tất cả mã giảm giá
    const fetchDiscounts = async () => {
        loading.value = true;
        try {
            // Sử dụng mock data khi đang phát triển
            // Trong môi trường thực tế, bạn sẽ sử dụng: const response = await apiService.get(apiUrl);
            setTimeout(() => {
                discounts.value = mockDiscounts;
                totalRecords.value = mockDiscounts.length;
                loading.value = false;
            }, 500);
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách mã giảm giá', life: 3000 });
            console.error('Lỗi khi tải mã giảm giá:', error);
            loading.value = false;
        }
    };

    // Lấy mã giảm giá theo ID
    const fetchDiscountById = async (id) => {
        try {
            // Trong môi trường thực tế: return await apiService.get(`${apiUrl}/${id}`);
            return mockDiscounts.find(d => d.id === id);
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: `Không thể tải mã giảm giá ID: ${id}`, life: 3000 });
            console.error('Lỗi khi tải mã giảm giá theo ID:', error);
            return null;
        }
    };

    // Lấy mã giảm giá theo code
    const fetchDiscountByCode = async (code) => {
        try {
            // Trong môi trường thực tế: return await apiService.get(`${apiUrl}/code/${code}`);
            return mockDiscounts.find(d => d.code === code);
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: `Không thể tải mã giảm giá: ${code}`, life: 3000 });
            console.error('Lỗi khi tải mã giảm giá theo code:', error);
            return null;
        }
    };

    // Lấy danh sách mã giảm giá đang hoạt động
    const fetchActiveDiscounts = async () => {
        loading.value = true;
        try {
            // Trong môi trường thực tế: const response = await apiService.get(`${apiUrl}/active`);
            setTimeout(() => {
                const now = new Date();
                discounts.value = mockDiscounts.filter(d => {
                    const startDate = new Date(d.validFrom);
                    const endDate = new Date(d.validTo);
                    return d.valid && now >= startDate && now <= endDate && d.usedCount < d.maxUses;
                });
                totalRecords.value = discounts.value.length;
                loading.value = false;
            }, 500);
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách mã giảm giá đang hoạt động', life: 3000 });
            console.error('Lỗi khi tải mã giảm giá đang hoạt động:', error);
            loading.value = false;
        }
    };

    // Tạo mã giảm giá mới
    const createDiscount = async (discountData) => {
        try {
            // Trong môi trường thực tế: return await apiService.post(apiUrl, discountData);
            const newDiscount = {
                id: mockDiscounts.length + 1,
                ...discountData
            };
            mockDiscounts.push(newDiscount);
            toast.add({ severity: 'success', summary: 'Thành công', detail: 'Tạo mã giảm giá thành công', life: 3000 });
            return newDiscount;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo mã giảm giá', life: 3000 });
            console.error('Lỗi khi tạo mã giảm giá:', error);
            return null;
        }
    };

    // Tạo nhiều mã giảm giá ngẫu nhiên
    const generateDiscounts = async (generateData) => {
        try {
            // Trong môi trường thực tế: return await apiService.post(`${apiUrl}/generate`, generateData);
            const generatedDiscounts = [];
            for (let i = 0; i < generateData.count; i++) {
                const randomCode = `${generateData.prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                const newDiscount = {
                    id: mockDiscounts.length + i + 1,
                    code: randomCode,
                    discountType: generateData.discountType,
                    discountValue: generateData.discountValue,
                    validFrom: generateData.validFrom,
                    validTo: generateData.validTo,
                    maxUses: generateData.maxUses,
                    usedCount: 0,
                    valid: true
                };
                generatedDiscounts.push(newDiscount);
            }
            mockDiscounts.push(...generatedDiscounts);
            toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã tạo ${generateData.count} mã giảm giá`, life: 3000 });
            return generatedDiscounts;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo mã giảm giá ngẫu nhiên', life: 3000 });
            console.error('Lỗi khi tạo mã giảm giá ngẫu nhiên:', error);
            return null;
        }
    };

    // Cập nhật mã giảm giá
    const updateDiscount = async (id, discountData) => {
        try {
            // Trong môi trường thực tế: return await apiService.put(`${apiUrl}/${id}`, discountData);
            const index = mockDiscounts.findIndex(d => d.id === id);
            if (index !== -1) {
                mockDiscounts[index] = { ...mockDiscounts[index], ...discountData };
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật mã giảm giá thành công', life: 3000 });
                return mockDiscounts[index];
            }
            return null;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật mã giảm giá', life: 3000 });
            console.error('Lỗi khi cập nhật mã giảm giá:', error);
            return null;
        }
    };

    // Xóa mã giảm giá
    const deleteDiscount = async (id) => {
        try {
            // Trong môi trường thực tế: await apiService.delete(`${apiUrl}/${id}`);
            const index = mockDiscounts.findIndex(d => d.id === id);
            if (index !== -1) {
                mockDiscounts.splice(index, 1);
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa mã giảm giá', life: 3000 });
                return true;
            }
            return false;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa mã giảm giá', life: 3000 });
            console.error('Lỗi khi xóa mã giảm giá:', error);
            return false;
        }
    };

    // Kiểm tra tính hợp lệ của mã giảm giá
    const validateDiscount = async (code) => {
        try {
            // Trong môi trường thực tế: return await apiService.get(`${apiUrl}/validate/${code}`);
            const discount = mockDiscounts.find(d => d.code === code);
            if (!discount) return false;

            const now = new Date();
            const startDate = new Date(discount.validFrom);
            const endDate = new Date(discount.validTo);

            return discount.valid && now >= startDate && now <= endDate && discount.usedCount < discount.maxUses;
        } catch (error) {
            console.error('Lỗi khi kiểm tra mã giảm giá:', error);
            return false;
        }
    };

    // Áp dụng mã giảm giá
    const applyDiscount = async (code, amount) => {
        try {
            // Trong môi trường thực tế: return await apiService.get(`${apiUrl}/apply?code=${code}&amount=${amount}`);
            const discount = mockDiscounts.find(d => d.code === code);
            if (!discount) return null;

            if (!validateDiscount(code)) {
                toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Mã giảm giá không hợp lệ hoặc đã hết hạn', life: 3000 });
                return null;
            }

            let discountAmount = 0;
            if (discount.discountType === 'PERCENT') {
                discountAmount = amount * discount.discountValue;
            } else {
                discountAmount = discount.discountValue;
            }

            const result = {
                originalAmount: amount,
                discountedAmount: amount - discountAmount,
                discountAmount: discountAmount,
                discountCode: code
            };

            toast.add({ severity: 'success', summary: 'Thành công', detail: 'Áp dụng mã giảm giá thành công', life: 3000 });
            return result;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể áp dụng mã giảm giá', life: 3000 });
            console.error('Lỗi khi áp dụng mã giảm giá:', error);
            return null;
        }
    };

    // Sử dụng mã giảm giá
    const useDiscount = async (code) => {
        try {
            // Trong môi trường thực tế: return await apiService.post(`${apiUrl}/use/${code}`);
            const index = mockDiscounts.findIndex(d => d.code === code);
            if (index !== -1) {
                mockDiscounts[index].usedCount++;
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã sử dụng mã giảm giá', life: 3000 });
                return { message: `Đã cập nhật số lần sử dụng của mã giảm giá: ${code}` };
            }
            return null;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể sử dụng mã giảm giá', life: 3000 });
            console.error('Lỗi khi sử dụng mã giảm giá:', error);
            return null;
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
            valid: true
        };
    }

    // Định dạng giá trị giảm giá
    const formatDiscountValue = (discount) => {
        if (discount.discountType === 'PERCENT') {
            return (discount.discountValue * 100).toFixed(0) + '%';
        } else {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount.discountValue);
        }
    };

    // Tính số ngày còn lại
    const calculateDaysRemaining = (validTo) => {
        const currentDate = new Date();
        const endDate = new Date(validTo);
        const timeDiff = endDate.getTime() - currentDate.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysRemaining > 0 ? daysRemaining : 0;
    };

    // Đánh giá trạng thái của mã giảm giá
    const getDiscountStatus = (discount) => {
        const now = new Date();
        const startDate = new Date(discount.validFrom);
        const endDate = new Date(discount.validTo);

        if (!discount.valid) {
            return { label: 'Vô hiệu', severity: 'danger' };
        } else if (now < startDate) {
            return { label: 'Chưa bắt đầu', severity: 'warning' };
        } else if (now > endDate) {
            return { label: 'Hết hạn', severity: 'danger' };
        } else if (discount.usedCount >= discount.maxUses) {
            return { label: 'Hết lượt', severity: 'danger' };
        } else {
            return { label: 'Đang hoạt động', severity: 'success' };
        }
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
        submitted.value = true;

        if (discount.value.code?.trim() && discount.value.discountValue > 0) {
            const discountData = {
                ...discount.value,
                validFrom: discount.value.validFrom instanceof Date
                    ? discount.value.validFrom.toISOString().split('T')[0]
                    : discount.value.validFrom,
                validTo: discount.value.validTo instanceof Date
                    ? discount.value.validTo.toISOString().split('T')[0]
                    : discount.value.validTo
            };

            if (discount.value.id) {
                // Cập nhật mã giảm giá
                const updated = await updateDiscount(discount.value.id, discountData);
                if (updated) {
                    // Cập nhật mảng discounts
                    const index = discounts.value.findIndex(d => d.id === discount.value.id);
                    if (index !== -1) {
                        discounts.value[index] = updated;
                    }
                }
            } else {
                // Tạo mới mã giảm giá
                const created = await createDiscount(discountData);
                if (created) {
                    discounts.value.push(created);
                }
            }

            discountDialog.value = false;
            discount.value = initNewDiscount();
        }
    };

    // Tạo nhiều mã giảm giá
    const saveGeneratedDiscounts = async () => {
        submitted.value = true;

        if (discount.value.prefix?.trim() && discount.value.discountValue > 0 && discount.value.count > 0) {
            const generateData = {
                prefix: discount.value.prefix,
                discountType: discount.value.discountType,
                discountValue: discount.value.discountValue,
                validFrom: discount.value.validFrom instanceof Date
                    ? discount.value.validFrom.toISOString().split('T')[0]
                    : discount.value.validFrom,
                validTo: discount.value.validTo instanceof Date
                    ? discount.value.validTo.toISOString().split('T')[0]
                    : discount.value.validTo,
                maxUses: discount.value.maxUses,
                count: discount.value.count
            };

            const generated = await generateDiscounts(generateData);
            if (generated) {
                // Thêm mã mới vào danh sách
                discounts.value = [...discounts.value, ...generated];
            }

            generateDiscountDialog.value = false;
            discount.value = initNewDiscount();
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
        if (discountToDelete && discountToDelete.id) {
            const success = await deleteDiscount(discountToDelete.id);
            if (success) {
                discounts.value = discounts.value.filter(d => d.id !== discountToDelete.id);
                deleteDiscountDialog.value = false;
                selectedDiscount.value = null;
            }
        }
    };

    // Đánh giá mức độ sử dụng mã giảm giá
    const getUsagePercentage = (discount) => {
        if (discount.maxUses === 0) return 0;
        return (discount.usedCount / discount.maxUses) * 100;
    };

    // Dữ liệu mẫu để thử nghiệm
    const mockDiscounts = [
        {
            id: 1,
            code: 'SUMMER2023',
            discountType: 'PERCENT',
            discountValue: 0.15,
            validFrom: '2023-06-01',
            validTo: '2023-12-31',
            maxUses: 100,
            usedCount: 45,
            valid: true
        },
        {
            id: 2,
            code: 'WELCOME',
            discountType: 'FIXED',
            discountValue: 100000,
            validFrom: '2023-01-01',
            validTo: '2023-12-31',
            maxUses: 1000,
            usedCount: 387,
            valid: true
        },
        {
            id: 3,
            code: 'NEWYEAR2024',
            discountType: 'PERCENT',
            discountValue: 0.20,
            validFrom: '2023-12-25',
            validTo: '2024-01-15',
            maxUses: 500,
            usedCount: 123,
            valid: true
        },
        {
            id: 4,
            code: 'SPECIALVIP',
            discountType: 'FIXED',
            discountValue: 500000,
            validFrom: '2023-01-01',
            validTo: '2023-12-31',
            maxUses: 50,
            usedCount: 50,
            valid: true
        },
        {
            id: 5,
            code: 'TESTDISCOUNT',
            discountType: 'PERCENT',
            discountValue: 0.05,
            validFrom: '2023-01-01',
            validTo: '2023-06-30',
            maxUses: 100,
            usedCount: 15,
            valid: false
        }
    ];

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
        validateDiscount,
        applyDiscount,
        useDiscount,

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
        confirmDelete
    };
}
