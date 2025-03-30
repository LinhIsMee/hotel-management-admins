import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

export function useReviewManagement() {
    const reviews = ref([]);
    const loading = ref(true);
    const reviewDialog = ref(false);
    const deleteReviewDialog = ref(false);
    const deleteReviewsDialog = ref(false);
    const review = ref({});
    const selectedReviews = ref(null);
    const filters = ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        guestName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        displayName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        bookingId: { value: null, matchMode: FilterMatchMode.CONTAINS },
        roomNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
        roomType: { value: null, matchMode: FilterMatchMode.CONTAINS },
        comment: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const submitted = ref(false);
    const toast = useToast();
    const totalElements = ref(0);
    const pageSize = ref(10);
    const stats = ref(null);

    // Định nghĩa địa chỉ cơ sở của API backend
    const API_BASE_URL = 'http://localhost:9000';

    // Trạng thái đánh giá
    const statuses = ref([
        { name: 'Đã phản hồi', value: 'REPLIED' },
        { name: 'Đang xem xét', value: 'PENDING' },
        { name: 'Đã ẩn', value: 'HIDDEN' }
    ]);

    // Hàm helper lấy token từ localStorage
    const getAuthToken = () => {
        try {
            // Lấy dữ liệu từ admin_token trong localStorage
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

            // Parse chuỗi JSON
            const adminTokenObj = JSON.parse(adminTokenData);

            // Lấy accessToken từ object
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

    // Lấy thống kê đánh giá
    const fetchStatistics = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return;

            const response = await fetch(`${API_BASE_URL}/api/v1/reviews/statistics`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải thống kê đánh giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();

            // API trả về thống kê trực tiếp, không phải trong thuộc tính data
            if (result.data) {
                stats.value = result.data;
            } else {
                // Trường hợp API trả về trực tiếp object thống kê
                stats.value = result;
            }
        } catch (error) {
            console.error('Lỗi khi tải thống kê đánh giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải thống kê đánh giá',
                life: 3000
            });
        }
    };

    // Tải tất cả dữ liệu
    const fetchAllData = async () => {
        try {
            loading.value = true;

            const headers = getAuthHeaders();
            if (!headers) {
                loading.value = false;
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/v1/reviews/`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải danh sách đánh giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();
            console.log('Dữ liệu nhận được từ API:', result);

            // API trả về mảng trực tiếp
            if (Array.isArray(result)) {
                reviews.value = result;
                totalElements.value = result.length;
            } else if (result.data) {
                // Giữ trường hợp này phòng khi API thay đổi
                reviews.value = Array.isArray(result.data.content) ? result.data.content : [];
                totalElements.value = reviews.value.length;
            } else {
                reviews.value = [];
                totalElements.value = 0;
            }

            // Tải thống kê đánh giá
            fetchStatistics();
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu đánh giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải danh sách đánh giá',
                life: 3000
            });
            reviews.value = [];
        } finally {
            loading.value = false;
        }
    };

    const openNew = () => {
        review.value = {
            rating: 3,
            cleanliness: 5,
            service: 5,
            comfort: 5,
            location: 4,
            facilities: 5,
            valueForMoney: 4,
            status: 'PENDING',
            isAnonymous: false,
            isFeatured: false,
            images: []
        };
        submitted.value = false;
        reviewDialog.value = true;
    };

    const hideDialog = () => {
        reviewDialog.value = false;
        submitted.value = false;
        review.value = {};
    };

    const saveReview = async () => {
        submitted.value = true;
        console.log('Đang lưu đánh giá:', review.value);

        if (review.value.guestName?.trim() && review.value.comment?.trim() && review.value.rating) {
            try {
                const headers = getAuthHeaders(true);
                if (!headers) return;

                let url;
                let method;

                if (review.value.id) {
                    // Cập nhật đánh giá hiện có
                    url = `${API_BASE_URL}/api/v1/reviews/update/${review.value.id}`;
                    method = 'PUT';
                    console.log('Cập nhật đánh giá ID:', review.value.id, 'tại URL:', url);

                    // Quan trọng: Đảm bảo có đầy đủ thông tin đánh giá theo tài liệu API
                    // Cần giữ nguyên ID và đảm bảo có đầy đủ các trường
                    const requiredFields = [
                        'id',
                        'bookingId',
                        'guestName',
                        'displayName',
                        'roomNumber',
                        'roomType',
                        'rating',
                        'cleanliness',
                        'service',
                        'comfort',
                        'location',
                        'facilities',
                        'valueForMoney',
                        'comment',
                        'images',
                        'replyComment',
                        'replyBy',
                        'replyDate',
                        'isFeatured',
                        'isAnonymous',
                        'status',
                        'createdAt',
                        'updatedAt'
                    ];

                    // Kiểm tra và đảm bảo tất cả các trường đều tồn tại
                    for (const field of requiredFields) {
                        if (review.value[field] === undefined) {
                            console.warn(`Thiếu trường ${field} trong dữ liệu cập nhật. Đang thiết lập giá trị mặc định.`);

                            // Thiết lập giá trị mặc định nếu thiếu
                            if (field === 'images') review.value[field] = [];
                            else if (field === 'isFeatured' || field === 'isAnonymous') review.value[field] = false;
                            else if (field === 'status') review.value[field] = 'PENDING';
                            else if (field === 'rating' || field === 'cleanliness' || field === 'service' || field === 'comfort' || field === 'location' || field === 'facilities' || field === 'valueForMoney') review.value[field] = 5;
                            else if (field !== 'id' && field !== 'createdAt' && field !== 'updatedAt' && field !== 'replyComment' && field !== 'replyBy' && field !== 'replyDate') {
                                review.value[field] = '';
                            }
                        }
                    }
                } else {
                    // Tạo đánh giá mới
                    url = `${API_BASE_URL}/api/v1/reviews/`;
                    method = 'POST';
                    console.log('Tạo đánh giá mới tại URL:', url);
                }

                console.log('Dữ liệu gửi đi:', JSON.stringify(review.value));

                const response = await fetch(url, {
                    method: method,
                    headers: headers,
                    body: JSON.stringify(review.value)
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error('Server response:', errorData);
                    throw new Error(`Lỗi khi ${review.value.id ? 'cập nhật' : 'tạo'} đánh giá: ${response.statusText} (${response.status})`);
                }

                const resultData = await response.json();
                console.log('Phản hồi từ server sau khi lưu:', resultData);

                if (review.value.id) {
                    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật đánh giá thành công', life: 3000 });
                } else {
                    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm đánh giá thành công', life: 3000 });
                }

                reviewDialog.value = false;
                review.value = {};

                // Tải lại dữ liệu sau khi lưu
                fetchAllData();
            } catch (error) {
                console.error('Lỗi khi lưu dữ liệu đánh giá:', error);
                toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
            }
        } else {
            console.log('Thông tin đánh giá không hợp lệ:', {
                guestName: review.value.guestName,
                comment: review.value.comment,
                rating: review.value.rating
            });
            toast.add({
                severity: 'error',
                summary: 'Thông tin không đầy đủ',
                detail: 'Vui lòng nhập đầy đủ tên khách hàng, nội dung và điểm đánh giá',
                life: 3000
            });
        }
    };

    const editReview = async (editReview) => {
        try {
            // Mở dialog và hiển thị dữ liệu sơ bộ ngay lập tức
            review.value = { ...editReview };
            reviewDialog.value = true;

            const headers = getAuthHeaders();
            if (!headers) return;

            // Lấy thông tin chi tiết của đánh giá từ API
            const response = await fetch(`${API_BASE_URL}/api/v1/reviews/${editReview.id}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi tải thông tin đánh giá: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();

            // Cập nhật dữ liệu đánh giá đầy đủ
            if (result.data) {
                review.value = result.data;
            } else {
                // API trả về trực tiếp
                review.value = result;
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin đánh giá:', error);
            toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
        }
    };

    const replyReview = async (replyReview) => {
        review.value = { ...replyReview };
        reviewDialog.value = true;
    };

    const submitReply = async () => {
        try {
            const headers = getAuthHeaders(true);
            if (!headers) return;

            const replyData = {
                replyComment: review.value.replyComment,
                replyBy: 'Admin' // Có thể lấy từ thông tin người dùng đăng nhập
            };

            const response = await fetch(`${API_BASE_URL}/api/v1/reviews/${review.value.id}/reply`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(replyData)
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi phản hồi đánh giá: ${response.statusText} (${response.status})`);
            }

            await response.json();
            toast.add({ severity: 'success', summary: 'Thành công', detail: 'Phản hồi đánh giá thành công', life: 3000 });

            reviewDialog.value = false;
            review.value = {};

            // Tải lại dữ liệu
            fetchAllData();
        } catch (error) {
            console.error('Lỗi khi phản hồi đánh giá:', error);
            toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
        }
    };

    const confirmDeleteReview = (editReview) => {
        review.value = editReview;
        deleteReviewDialog.value = true;
    };

    const deleteReview = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return;

            const response = await fetch(`${API_BASE_URL}/api/v1/reviews/${review.value.id}`, {
                method: 'DELETE',
                headers: headers
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Server response:', errorData);
                throw new Error(`Không thể xóa đánh giá: ${response.statusText} (${response.status})`);
            }

            toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa đánh giá thành công', life: 3000 });
            deleteReviewDialog.value = false;
            review.value = {};

            // Tải lại dữ liệu sau khi xóa
            fetchAllData();
        } catch (error) {
            console.error('Lỗi khi xóa đánh giá:', error);
            toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
        }
    };

    const confirmDeleteSelected = () => {
        deleteReviewsDialog.value = true;
    };

    const deleteSelectedReviews = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return;

            const deletePromises = selectedReviews.value.map((reviewToDelete) =>
                fetch(`${API_BASE_URL}/api/v1/reviews/${reviewToDelete.id}`, {
                    method: 'DELETE',
                    headers: headers
                }).then((response) => {
                    if (!response.ok) {
                        throw new Error(`Lỗi khi xóa đánh giá ID ${reviewToDelete.id}: ${response.statusText}`);
                    }
                    return response;
                })
            );

            await Promise.all(deletePromises);
            toast.add({ severity: 'success', summary: 'Thành công', detail: `Xóa ${deletePromises.length} đánh giá thành công`, life: 3000 });

            deleteReviewsDialog.value = false;
            selectedReviews.value = null;

            // Tải lại dữ liệu sau khi xóa
            fetchAllData();
        } catch (error) {
            console.error('Lỗi khi xóa nhiều đánh giá:', error);
            toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Có lỗi xảy ra khi xóa đánh giá', life: 3000 });
        }
    };

    const formatDate = (value) => {
        if (value) {
            try {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    return value; // Trả về giá trị gốc nếu không phải ngày hợp lệ
                }
                return new Intl.DateTimeFormat('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).format(date);
            } catch (error) {
                console.error('Lỗi khi format ngày:', error);
                return value;
            }
        }
        return '';
    };

    const getStatusName = (statusValue) => {
        const status = statuses.value.find((s) => s.value === statusValue);
        return status ? status.name : statusValue;
    };

    const getSeverity = (status) => {
        switch (status) {
            case 'REPLIED':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'HIDDEN':
                return 'danger';
            default:
                return null;
        }
    };

    const getReviewSeverity = (rating) => {
        if (rating >= 4.5) return 'success';
        if (rating >= 3.5) return 'info';
        if (rating >= 2.5) return 'warning';
        return 'danger';
    };

    // Thêm hàm xử lý upload ảnh
    const uploadImage = () => {
        // Hiện tại chỉ là một chức năng giả, sau này sẽ triển khai logic upload thực tế
        toast.add({
            severity: 'info',
            summary: 'Thông báo',
            detail: 'Chức năng upload ảnh đang được phát triển',
            life: 3000
        });
    };

    return {
        reviews,
        loading,
        reviewDialog,
        deleteReviewDialog,
        deleteReviewsDialog,
        review,
        selectedReviews,
        filters,
        submitted,
        totalElements,
        pageSize,
        stats,
        statuses,
        fetchAllData,
        openNew,
        hideDialog,
        saveReview,
        editReview,
        replyReview,
        submitReply,
        confirmDeleteReview,
        deleteReview,
        confirmDeleteSelected,
        deleteSelectedReviews,
        formatDate,
        getStatusName,
        getSeverity,
        getReviewSeverity,
        uploadImage
    };
}
