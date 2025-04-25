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

    // Mở form thêm mới
    const openNew = () => {
        review.value = initNewReview();
        submitted.value = false;
        reviewDialog.value = true;
    };

    const hideDialog = () => {
        reviewDialog.value = false;
        submitted.value = false;
        review.value = {};
    };

    const fetchUserInfo = async () => {
        try {
            if (!review.value.userId) {
                toast.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng nhập ID người dùng',
                    life: 3000
                });
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/v1/users/${review.value.userId}`);
            if (!response.ok) {
                throw new Error('Không thể tải thông tin người dùng');
            }

            const userData = await response.json();
            review.value.guestName = userData.fullName || userData.email;

        } catch (error) {
            console.error('Lỗi khi tải thông tin người dùng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải thông tin người dùng',
                life: 3000
            });
        }
    };

    const fetchBookingInfo = async () => {
        try {
            if (!review.value.bookingId) {
                toast.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng nhập ID đặt phòng',
                    life: 3000
                });
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${review.value.bookingId}`);
            if (!response.ok) {
                throw new Error('Không thể tải thông tin đặt phòng');
            }

            const bookingData = await response.json();
            if (bookingData.rooms && bookingData.rooms.length > 0) {
                const room = bookingData.rooms[0];
                review.value.roomNumber = room.roomNumber;
                review.value.roomType = room.roomType;
            }

        } catch (error) {
            console.error('Lỗi khi tải thông tin đặt phòng:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể tải thông tin đặt phòng',
                life: 3000
            });
        }
    };

    const initNewReview = () => {
        return {
            id: null,
            userId: null,
            bookingId: null,
            guestName: '',
            roomNumber: '',
            roomType: '',
            rating: 5,
            cleanliness: 5,
            service: 4,
            comfort: 5,
            location: 4,
            facilities: 5,
            valueForMoney: 4,
            comment: '',
            isAnonymous: false,
            status: 'PENDING',
            createdAt: new Date(),
            isFeatured: false,
            replyComment: '',
            replyDate: null,
            replyBy: null
        };
    };

    const saveReview = async () => {
        submitted.value = true;

        if (!review.value.userId || !review.value.bookingId || !review.value.comment || !review.value.rating) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Vui lòng điền đầy đủ thông tin bắt buộc',
                life: 3000
            });
            return;
        }

        try {
            let method = 'POST';
            let url = `${API_BASE_URL}/api/v1/reviews/`;
            let successMessage = 'Đánh giá đã được tạo thành công';

            if (review.value.id) {
                method = 'PUT';
                url = `${API_BASE_URL}/api/v1/reviews/${review.value.id}`;
                successMessage = 'Đánh giá đã được cập nhật thành công';
            }

            // Chuẩn bị dữ liệu để gửi lên API
            const reviewData = {
                userId: review.value.userId,
                bookingId: review.value.bookingId,
                rating: review.value.rating,
                cleanliness: review.value.cleanliness,
                service: review.value.service,
                comfort: review.value.comfort,
                location: review.value.location,
                facilities: review.value.facilities,
                valueForMoney: review.value.valueForMoney,
                comment: review.value.comment,
                isAnonymous: review.value.isAnonymous
            };

            // Nếu là cập nhật, bổ sung các trường khác
            if (review.value.id) {
                reviewData.status = review.value.status;
                reviewData.isFeatured = review.value.isFeatured;
                reviewData.replyComment = review.value.replyComment;
                reviewData.replyDate = review.value.replyDate;
                reviewData.replyBy = review.value.replyBy;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể lưu đánh giá');
            }

            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: successMessage,
                life: 3000
            });

            reviewDialog.value = false;
            fetchAllData(); // Tải lại dữ liệu
        } catch (error) {
            console.error('Lỗi khi lưu đánh giá:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể lưu đánh giá',
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
        fetchUserInfo,
        fetchBookingInfo
    };
}
