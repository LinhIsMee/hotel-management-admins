<script setup>
import { useRoomManagement } from '@/composables/useRoomManagement';
import { useHead } from '@vueuse/head';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Rating from 'primevue/rating';
import DatePicker from 'primevue/datepicker';
import ProgressSpinner from 'primevue/progressspinner';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import GuestSelector from '@/components/client/GuestSelector.vue';
import RadioButton from 'primevue/radiobutton';

const route = useRoute();
const router = useRouter();
const roomId = computed(() => Number(route.params.id));
const room = ref(null);
const loading = ref(true);
const reviews = ref([]);
const relatedRooms = ref([]);
const toast = useToast();

// Room Management Composable
const {
  fetchRoomById,
  fetchRoomsByType,
  formatCurrency,
  formatDate
} = useRoomManagement();

// Mảng chứa đường dẫn ảnh mặc định
const defaultImages = [
  '/images/rooms/default-1.jpg',
  '/images/rooms/default-2.jpg',
  '/images/rooms/default-3.jpg'
];

// Form đặt phòng
const booking = ref({
    checkInDate: null,
    checkOutDate: null,
    adults: 1,
    children: 0,
    childrenAges: [], // Mảng lưu tuổi của từng trẻ em
    specialRequests: '',
    payViaVnpay: false,
    payAtHotel: true, // Mặc định là thanh toán tại khách sạn
    discountCode: '',
    services: [],
    paymentMethod: 'CASH'
});

// Thêm vào các thuộc tính cho gallery
const roomImages = ref([]);
const selectedImage = ref(null);
const galleryVisible = ref(false);
const currentGalleryIndex = ref(0);

// Thêm vào biến cho phần mã giảm giá
const discountStatus = ref({
    loading: false,
    valid: false,
    applied: false,
    message: '',
    discount: 0,
    code: ''
});

// Thêm danh sách dịch vụ
const availableServices = ref([
    { id: 1, name: 'Bữa sáng', price: 150000, description: 'Buffet bữa sáng cho mỗi khách' },
    { id: 2, name: 'Đưa đón sân bay', price: 350000, description: 'Dịch vụ đưa đón sân bay' },
    { id: 3, name: 'Giặt ủi', price: 100000, description: 'Dịch vụ giặt ủi' },
    { id: 4, name: 'Spa', price: 500000, description: 'Dịch vụ Spa và massage' }
]);

// Tính tổng tiền dịch vụ
const serviceTotal = computed(() => {
    if (!booking.value.services || booking.value.services.length === 0) return 0;
    return booking.value.services.reduce((total, serviceId) => {
        const service = availableServices.value.find(s => s.id === serviceId);
        return total + (service ? service.price : 0);
    }, 0);
});

// Tính số đêm
const days = computed(() => {
    if (!booking.value.checkInDate || !booking.value.checkOutDate) return 0;
    const checkIn = new Date(booking.value.checkInDate);
    const checkOut = new Date(booking.value.checkOutDate);
    return Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
});


// Tính tổng tiền đặt phòng - cập nhật theo độ tuổi trẻ em
const totalPrice = computed(() => {
    if (!room.value || !booking.value.checkInDate || !booking.value.checkOutDate) return 0;

    // Tính giá người lớn
    const adultPrice = room.value.pricePerNight * booking.value.adults * days.value;

    // Tính giá trẻ em dựa trên độ tuổi
    let childPrice = 0;
    if (booking.value.childrenAges && booking.value.childrenAges.length > 0) {
        booking.value.childrenAges.forEach(age => {
            if (age <= 6) {
                // Trẻ em 0-6 tuổi: miễn phí
                childPrice += 0;
            } else if (age <= 11) {
                // Trẻ em 7-11 tuổi: giảm 50%
                childPrice += room.value.pricePerNight * 0.5 * days.value;
            } else {
                // Từ 12 tuổi trở lên: tính như người lớn (không nên xảy ra vì đã phân loại là người lớn)
                childPrice += room.value.pricePerNight * days.value;
            }
        });
    }

    // Tổng tiền phòng
    let roomTotal = adultPrice + childPrice;

    // Cộng với tiền dịch vụ
    const total = roomTotal + serviceTotal.value;

    // Áp dụng giảm giá nếu có
    if (discountStatus.value.applied && discountStatus.value.discount > 0) {
        return total * (1 - discountStatus.value.discount / 100);
    }

    return total;
});

// Các phương thức xử lý thư viện ảnh
const openGallery = (index) => {
  currentGalleryIndex.value = index;
  galleryVisible.value = true;
};

const prevImage = () => {
  if (roomImages.value.length === 0) return;
  currentGalleryIndex.value = (currentGalleryIndex.value - 1 + roomImages.value.length) % roomImages.value.length;
};

const nextImage = () => {
  if (roomImages.value.length === 0) return;
  currentGalleryIndex.value = (currentGalleryIndex.value + 1) % roomImages.value.length;
};

// Tải phòng liên quan (cùng loại nhưng khác phòng)
const loadRelatedRooms = async () => {
    if (!room.value || !room.value.roomTypeId) return;

    try {
        const relatedRoomsData = await fetchRoomsByType(room.value.roomTypeId);
        // Lọc bỏ phòng hiện tại
        relatedRooms.value = relatedRoomsData
            .filter(r => r.id !== roomId.value)
            .slice(0, 3)
            .map((room, index) => {
                // Thêm ảnh nếu cần
                if (!room.images || room.images.length === 0) {
                    room.imageUrl = defaultImages[(index + 1) % 3];
                } else {
                    room.imageUrl = room.images[0];
                }
                return room;
            });
    } catch (error) {
        console.error('Lỗi khi tải phòng liên quan:', error);
    }
};

// Tải đánh giá từ API
const fetchRoomRatings = async (roomNumber) => {
    try {
        const response = await fetch(`http://127.0.0.1:9000/api/v1/reviews/room/number/${roomNumber}`);
        if (!response.ok) throw new Error('Không thể tải đánh giá');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi tải đánh giá:', error);
        return [];
    }
};

// Xử lý chuyển hướng sang phòng khác
const navigateToRoom = (roomId) => {
    // Lưu lại các query params hiện tại
    const currentQuery = { ...route.query };
    router.push({
        path: `/room/${roomId}`,
        query: currentQuery // Giữ lại các thông tin tìm kiếm (ngày, số khách...)
    });
};

// Add this new ref for storing booked dates
const bookedDateRanges = ref([]);
const disabledDates = ref([]);
const isLoadingBookedDates = ref(false);

// Tải ngày đã đặt và tạo mảng vô hiệu hóa
const fetchBookedDates = async (roomId) => {
    if (!roomId) return;

    isLoadingBookedDates.value = true;
    try {
        const response = await fetch(`http://localhost:9000/api/v1/bookings/room/${roomId}/booked-dates`);
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu lịch đặt phòng');
        }
        const data = await response.json();

        // Chuyển đổi chuỗi ngày thành đối tượng Date
        bookedDateRanges.value = data.map(range => ({
            checkInDate: new Date(range.checkInDate),
            checkOutDate: new Date(range.checkOutDate)
        }));

        // Tạo mảng các ngày đã đặt (vô hiệu hóa)
        updateDisabledDates();

        console.log('Lịch đặt phòng đã tải:', bookedDateRanges.value);
    } catch (error) {
        console.error('Lỗi khi tải lịch đặt phòng:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tải lịch đặt phòng, vui lòng thử lại sau',
            life: 3000
        });
    } finally {
        isLoadingBookedDates.value = false;
    }
};

// Cập nhật mảng các ngày vô hiệu hóa
const updateDisabledDates = () => {
    const disabled = [];

    // Thêm các ngày đã đặt
    bookedDateRanges.value.forEach(range => {
        const start = new Date(range.checkInDate);
        const end = new Date(range.checkOutDate);

        // Điều chỉnh giờ để đảm bảo so sánh chính xác
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        let currentDate = new Date(start);
        while (currentDate < end) {
            disabled.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    disabledDates.value = disabled;
};

// Hàm xử lý khi ngày nhận phòng thay đổi
const handleCheckInChange = (value) => {
    // Nếu ngày trả phòng nhỏ hơn ngày nhận phòng + 1, reset ngày trả phòng
    if (booking.value.checkOutDate && booking.value.checkOutDate <= value) {
        booking.value.checkOutDate = null;
    }
};

// Kiểm tra mã giảm giá (API thực tế)
const checkDiscountCode = async () => {
    if (!booking.value.discountCode) {
        discountStatus.value.message = 'Vui lòng nhập mã giảm giá';
        return;
    }

    discountStatus.value.loading = true;

    try {
        // Gọi API kiểm tra mã giảm giá
        const response = await fetch(`http://localhost:9000/api/v1/discounts/validate/${booking.value.discountCode}`);
        const result = await response.json();

        if (response.ok && result.valid) {
                discountStatus.value.valid = true;
                discountStatus.value.applied = true;
            discountStatus.value.discount = result.discountValue || 10; // Giá trị mặc định 10% nếu API không trả về
            discountStatus.value.message = `Đã áp dụng mã giảm giá ${discountStatus.value.discount}%`;
            } else {
                discountStatus.value.valid = false;
            discountStatus.value.applied = false;
            discountStatus.value.message = 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
            }
    } catch (error) {
        console.error('Lỗi khi kiểm tra mã giảm giá:', error);
        discountStatus.value.valid = false;
        discountStatus.value.applied = false;
        discountStatus.value.message = 'Có lỗi xảy ra khi kiểm tra mã giảm giá';
    } finally {
        discountStatus.value.loading = false;
    }
};

// Thêm phương thức xóa mã giảm giá
const clearDiscountCode = () => {
    booking.value.discountCode = '';
    discountStatus.value.valid = false;
    discountStatus.value.applied = false;
    discountStatus.value.message = '';
    discountStatus.value.discount = 0;
    discountStatus.value.code = '';
};

// Tổng số khách (người lớn + trẻ em)
const totalGuests = computed(() => {
    return booking.value.adults + booking.value.children;
});

// Hiển thị dropdown chọn khách
const showGuestSelect = ref(false);

// Chuẩn bị dữ liệu đặt phòng
const prepareBookingData = () => {
    if (!room.value || !booking.value.checkInDate || !booking.value.checkOutDate) {
        return null;
    }

    return {
        roomId: room.value.id,
        roomNumber: room.value.roomNumber,
        roomType: room.value.roomTypeName,
        checkInDate: formatDate(booking.value.checkInDate),
        checkOutDate: formatDate(booking.value.checkOutDate),
        adults: booking.value.adults,
        children: booking.value.children,
        childrenAges: booking.value.childrenAges,
        specialRequests: booking.value.specialRequests,
        totalPrice: totalPrice.value,
        discountCode: discountStatus.value.applied ? booking.value.discountCode : null,
        services: booking.value.services.map(serviceId => {
            const service = availableServices.value.find(s => s.id === serviceId);
            return {
                id: service.id,
                name: service.name,
                price: service.price
            };
        }),
        paymentMethod: booking.value.paymentMethod
    };
};

// Xử lý đặt phòng
const handleBooking = () => {
    if (!room.value || !booking.value.checkInDate || !booking.value.checkOutDate) {
        alert('Vui lòng chọn ngày nhận và trả phòng');
        return;
    }

    // Kiểm tra xem người dùng đã chọn phương thức thanh toán chưa
    if (!booking.value.paymentMethod) {
        toast.add({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: 'Vui lòng chọn phương thức thanh toán',
            life: 3000
        });
        return;
    }

    const bookingData = prepareBookingData();
    console.log('Dữ liệu đặt phòng:', bookingData);

    // Xác định phương thức thanh toán cho query params
    const paymentMethod = booking.value.paymentMethod.toLowerCase();

    // Chuyển đến trang xác nhận đặt phòng
    router.push({
        path: '/booking/confirm',
        query: {
            roomId: roomId.value,
            checkIn: formatDate(booking.value.checkInDate),
            checkOut: formatDate(booking.value.checkOutDate),
            adults: booking.value.adults,
            children: booking.value.children,
            childrenAges: booking.value.childrenAges.join(','),
            services: booking.value.services.join(','),
            discount: booking.value.discountCode,
            payment: paymentMethod
        }
    });
};

// Kiểm tra và cập nhật số khách khi thay đổi
watch(totalGuests, (newValue) => {
    if (room.value && newValue > room.value.maxOccupancy) {
        toast.add({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: `Phòng này chỉ cho phép tối đa ${room.value.maxOccupancy} người`,
            life: 3000
        });

        // Điều chỉnh số lượng khách về giới hạn tối đa
        const excess = newValue - room.value.maxOccupancy;
        if (booking.value.children >= excess) {
            booking.value.children -= excess;
        } else {
            booking.value.children = 0;
            booking.value.adults = room.value.maxOccupancy;
        }
    }
});

// Form đánh giá
const reviewForm = ref({
    rating: 5,
    cleanliness: 5,
    service: 4,
    comfort: 5,
    location: 4,
    facilities: 5,
    valueForMoney: 4,
    comment: '',
    isAnonymous: false
});

const isSubmittingReview = ref(false);
const showReviewForm = ref(false);
const userBookings = ref([]);
const hasBookedRoom = ref(false);

// Tạo đánh giá mới
const submitReview = async () => {
    try {
        // Lấy token từ localStorage
        const userDataStr = localStorage.getItem('user_token');
        if (!userDataStr) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Vui lòng đăng nhập để đánh giá!',
                life: 3000
            });
            return;
        }

        const userData = JSON.parse(userDataStr);
        if (!userData.accessToken) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!',
                life: 3000
            });
            return;
        }

        // Kiểm tra người dùng đã từng đặt phòng này chưa
        if (!hasBookedRoom.value) {
            toast.add({
                severity: 'warn',
                summary: 'Thông báo',
                detail: 'Bạn cần đặt phòng và sử dụng dịch vụ trước khi đánh giá',
                life: 3000
            });
            return;
        }

        if (!reviewForm.value.rating || !reviewForm.value.comment) {
            toast.add({
                severity: 'warn',
                summary: 'Thiếu thông tin',
                detail: 'Vui lòng nhập đầy đủ đánh giá và bình luận',
                life: 3000
            });
            return;
        }

        isSubmittingReview.value = true;

        // Tìm booking gần nhất của phòng này
        const latestBooking = userBookings.value.filter(booking => {
            const hasValidStatus = ['COMPLETED', 'CHECKED_OUT'].includes(booking.status);
            const hasRoom = booking.rooms && booking.rooms.some(room => room.roomId === roomId.value);
            return hasValidStatus && hasRoom;
        }).sort((a, b) => new Date(b.checkOutDate) - new Date(a.checkOutDate))[0];

        if (!latestBooking) {
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không tìm thấy thông tin đặt phòng của bạn',
                life: 3000
            });
            isSubmittingReview.value = false;
            return;
        }

        // Chuyển đổi bookingId từ "B123" thành 123
        const bookingId = latestBooking.bookingId
            ? parseInt(latestBooking.bookingId.replace('B', ''))
            : latestBooking.id;

        console.log('Gửi đánh giá với bookingId:', bookingId);

        const response = await fetch('http://localhost:9000/api/v1/reviews/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.accessToken}`
            },
            body: JSON.stringify({
                userId: userData.id,
                bookingId: bookingId,
                rating: reviewForm.value.rating,
                cleanliness: reviewForm.value.cleanliness,
                service: reviewForm.value.service,
                comfort: reviewForm.value.comfort,
                location: reviewForm.value.location,
                facilities: reviewForm.value.facilities,
                valueForMoney: reviewForm.value.valueForMoney,
                comment: reviewForm.value.comment,
                isAnonymous: reviewForm.value.isAnonymous
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể gửi đánh giá');
        }

        // Tải lại đánh giá mới
        const ratingsData = await fetchRoomRatings(room.value.roomNumber);
        reviews.value = ratingsData.map(rating => ({
            id: rating.id,
            name: rating.isAnonymous ? 'Khách hàng ẩn danh' : rating.guestName,
            rating: rating.rating,
            date: new Date(rating.createdAt).toLocaleDateString('vi-VN'),
            comment: rating.comment,
            cleanliness: rating.cleanliness,
            service: rating.service,
            comfort: rating.comfort,
            location: rating.location,
            facilities: rating.facilities,
            valueForMoney: rating.valueForMoney,
            replyComment: rating.replyComment,
            replyBy: rating.replyBy,
            replyDate: rating.replyDate,
            status: rating.status,
            isAnonymous: rating.isAnonymous
        }));

        // Reset form và đóng modal
        reviewForm.value = {
            rating: 5,
            cleanliness: 5,
            service: 4,
            comfort: 5,
            location: 4,
            facilities: 5,
            valueForMoney: 4,
            comment: '',
            isAnonymous: false
        };
        showReviewForm.value = false;

        // Hiển thị thông báo thành công
        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Cảm ơn bạn đã gửi đánh giá!',
            life: 3000
        });

    } catch (error) {
        console.error('Lỗi khi gửi đánh giá:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
            life: 3000
        });
    } finally {
        isSubmittingReview.value = false;
    }
};

// Kiểm tra xem người dùng đã từng đặt phòng này chưa
const checkUserBookings = async () => {
    try {
        const userDataStr = localStorage.getItem('user_token');
        if (!userDataStr) return;

        const userData = JSON.parse(userDataStr);
        if (!userData.accessToken) return;

        const response = await fetch('http://localhost:9000/api/v1/user/bookings/my-bookings', {
            headers: {
                'Authorization': `Bearer ${userData.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu đặt phòng');
        }

        const bookingsData = await response.json();
        userBookings.value = Array.isArray(bookingsData) ? bookingsData : [];

        console.log('Danh sách đặt phòng của người dùng:', userBookings.value);
        console.log('ID phòng hiện tại:', roomId.value);

        // Kiểm tra xem có đơn đặt phòng nào có phòng hiện tại không
        hasBookedRoom.value = userBookings.value.some(booking => {
            // Kiểm tra xem đặt phòng này đã hoàn thành hoặc đã trả phòng chưa
            const hasValidStatus = ['COMPLETED', 'CHECKED_OUT'].includes(booking.status);

            // Kiểm tra nếu phòng này có trong booking
            const hasRoom = booking.rooms && booking.rooms.some(room => {
                console.log('So sánh roomId:', room.roomId, roomId.value);
                return room.roomId === roomId.value;
            });

            return hasValidStatus && hasRoom;
        });

        console.log('Có thể đánh giá phòng:', hasBookedRoom.value);

    } catch (error) {
        console.error('Lỗi khi kiểm tra đặt phòng của người dùng:', error);
    }
};

useHead({
    title: computed(() => room.value ? `${room.value.roomTypeName} - Chi tiết phòng` : 'Chi tiết phòng'),
  meta: [
    {
      name: 'description',
            content: computed(() => room.value ?
                `${room.value.description || 'Chi tiết phòng khách sạn sang trọng với nhiều tiện nghi hiện đại.'}` :
                'Chi tiết phòng khách sạn')
    }
  ]
});

// Tải dữ liệu phòng
const loadRoomData = async () => {
    try {
        loading.value = true;

        // Lấy thông tin tìm kiếm từ query params
        if (route.query.checkIn) {
            booking.value.checkInDate = new Date(route.query.checkIn);
        }
        if (route.query.checkOut) {
            booking.value.checkOutDate = new Date(route.query.checkOut);
        }
        if (route.query.adults) {
            booking.value.adults = parseInt(route.query.adults);
        }
        if (route.query.children) {
            booking.value.children = parseInt(route.query.children);
        }
        // Xử lý danh sách tuổi trẻ em từ query parameter
        if (route.query.childrenAges) {
            booking.value.childrenAges = route.query.childrenAges.split(',').map(age => parseInt(age));
        } else {
            // Khởi tạo mảng trống hoặc với giá trị mặc định nếu có trẻ em
            booking.value.childrenAges = Array(booking.value.children).fill(0);
        }

        // Tải thông tin chi tiết phòng từ API
        const roomData = await fetchRoomById(roomId.value);

        if (roomData) {
            room.value = roomData;

            // Kiểm tra và điều chỉnh số khách nếu vượt quá giới hạn
            let totalRequestedGuests = booking.value.adults + booking.value.children;

            if (totalRequestedGuests > roomData.maxOccupancy) {
                // Lưu giá trị trước khi điều chỉnh để hiển thị thông báo
                const originalAdults = booking.value.adults;
                const originalChildren = booking.value.children;

                // Ưu tiên giữ người lớn trước
                if (booking.value.adults > roomData.maxOccupancy) {
                    booking.value.adults = roomData.maxOccupancy;
                    booking.value.children = 0;
                } else {
                    // Giữ số người lớn và điều chỉnh số trẻ em
                    booking.value.children = Math.max(0, roomData.maxOccupancy - booking.value.adults);
                }

                // Điều chỉnh mảng tuổi trẻ em
                booking.value.childrenAges = booking.value.childrenAges.slice(0, booking.value.children);

                // Hiển thị thông báo
                toast.add({
                    severity: 'warn',
                    summary: 'Số khách đã được điều chỉnh',
                    detail: `Phòng này chỉ cho phép tối đa ${roomData.maxOccupancy} người. Số khách đã được điều chỉnh từ ${originalAdults} người lớn, ${originalChildren} trẻ em xuống ${booking.value.adults} người lớn, ${booking.value.children} trẻ em.`,
                    life: 7000
                });

                // Cập nhật URL để phản ánh thay đổi
                router.replace({
                    path: route.path,
                    query: {
                        ...route.query,
                        adults: booking.value.adults,
                        children: booking.value.children,
                        childrenAges: booking.value.childrenAges.join(',')
                    }
                });
            }

            // Xử lý ảnh
            if (roomData.images && roomData.images.length > 0) {
                roomImages.value = roomData.images;
            } else {
                roomImages.value = defaultImages;
            }
            selectedImage.value = roomImages.value[0];

            // Tải phòng liên quan
            await loadRelatedRooms();

            // Tải đánh giá
            const ratingsData = await fetchRoomRatings(roomData.roomNumber);
            reviews.value = ratingsData.map(rating => ({
                id: rating.id,
                name: rating.isAnonymous ? 'Khách hàng ẩn danh' : rating.guestName,
                rating: rating.rating,
                date: new Date(rating.createdAt).toLocaleDateString('vi-VN'),
                comment: rating.comment,
                cleanliness: rating.cleanliness,
                service: rating.service,
                comfort: rating.comfort,
                location: rating.location,
                facilities: rating.facilities,
                valueForMoney: rating.valueForMoney,
                replyComment: rating.replyComment,
                replyBy: rating.replyBy,
                replyDate: rating.replyDate,
                status: rating.status,
                isAnonymous: rating.isAnonymous
            }));

            // Đảm bảo lịch đặt phòng đã được tải
            if (bookedDateRanges.value.length === 0) {
                await fetchBookedDates(roomId.value);
            }

        } else {
            // Không tìm thấy phòng, chuyển về trang danh sách
            router.push('/rooms');
        }
    } catch (error) {
        console.error('Lỗi khi tải thông tin phòng:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tải thông tin phòng. Vui lòng thử lại sau.',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Theo dõi thay đổi của roomId
watch(roomId, async (newId, oldId) => {
    if (newId !== oldId) {
        window.scrollTo(0, 0); // Cuộn lên đầu trang
        await fetchBookedDates(newId); // Tải lịch đặt phòng trước
        await loadRoomData(); // Sau đó tải thông tin phòng
    }
});

onMounted(async () => {
    // Tải lịch đặt phòng trước, sau đó tải dữ liệu phòng
    await fetchBookedDates(roomId.value);
    await loadRoomData();
    await checkUserBookings();

    // Click outside để đóng dropdown - cập nhật để không đóng khi chọn tuổi trẻ em
    document.addEventListener('click', (e) => {
        const guestSelectDropdown = document.querySelector('.guest-select-dropdown');
        const button = document.querySelector('.guest-select-button');
        if (showGuestSelect.value &&
            guestSelectDropdown &&
            button &&
            !button.contains(e.target) &&
            !guestSelectDropdown.contains(e.target) &&
            !e.target.closest('.guest-selector') &&
            !e.target.closest('.p-dropdown-panel')) {
            showGuestSelect.value = false;
        }
    });
});

// Thêm computed properties để kiểm tra ngày
const today = computed(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
});

const minCheckOutDate = computed(() => {
    if (!booking.value.checkInDate) return today.value;
    const nextDay = new Date(booking.value.checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
});

// Theo dõi thay đổi phương thức thanh toán
watch(() => booking.value.payViaVnpay, (newValue) => {
    if (newValue) {
        booking.value.payAtHotel = false;
    } else if (!booking.value.payAtHotel) {
        // Nếu không có phương thức nào được chọn, mặc định là thanh toán tại khách sạn
        booking.value.payAtHotel = true;
    }
});

watch(() => booking.value.payAtHotel, (newValue) => {
    if (newValue) {
        booking.value.payViaVnpay = false;
    } else if (!booking.value.payViaVnpay) {
        // Nếu không có phương thức nào được chọn, mặc định là VNPay
        booking.value.payViaVnpay = true;
    }
});
</script>

<template>
    <div class="room-detail-page bg-gray-50 min-h-screen py-8">
        <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-20">
            <ProgressSpinner strokeWidth="5" class="w-20 h-20" />
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" v-else-if="room">
            <!-- Thông tin phòng -->
            <div class="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
                <!-- Thư viện ảnh phòng -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    <!-- Ảnh chính -->
                    <div class="md:col-span-2 md:row-span-2">
                        <img :src="selectedImage || room.imageUrl" :alt="room.name"
                            class="w-full h-full object-cover rounded-lg cursor-pointer"
                            @click="openGallery(selectedImageIndex || 0)" />
                    </div>

                    <!-- 2 ảnh phụ -->
                    <div v-for="(image, index) in roomImages.slice(1, 3)" :key="index"
                        class="cursor-pointer relative h-[200px]">
                        <img :src="image" :alt="`${room.name} - Ảnh ${index + 1}`"
                            class="w-full h-full object-cover rounded-lg hover:opacity-90 transition"
                            @click="openGallery(index + 1)" />

                        <!-- Overlay cho ảnh cuối nếu có nhiều hơn 3 ảnh -->
                        <div v-if="index === 1 && roomImages.length > 3"
                            class="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg cursor-pointer"
                            @click="openGallery(index + 1)">
                            <span class="text-white text-xl font-semibold">
                                +{{ roomImages.length - 3 }} ảnh
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Gallery Modal -->
                <Dialog v-model:visible="galleryVisible"
                    modal
                    :style="{width: '90vw', height: '90vh'}"
                    :dismissableMask="true"
                    :showHeader="false"
                    class="gallery-dialog"
                >
                    <div class="relative h-full flex flex-col">
                        <!-- Thanh công cụ phía trên -->
                        <div class="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
                            <div class="text-white flex items-center gap-2">
                                <span class="text-lg">{{ currentGalleryIndex + 1 }}/{{ roomImages.length }}</span>
                                <span class="text-sm">{{ room.name }}</span>
                            </div>
                            <button @click="galleryVisible = false"
                                class="text-white hover:text-gray-300 transition-colors">
                                <i class="pi pi-times text-2xl"></i>
                            </button>
                        </div>

                        <!-- Container chính cho ảnh -->
                        <div class="flex-1 flex items-center justify-center relative">
                            <!-- Nút previous -->
                            <button @click="prevImage"
                                class="absolute left-4 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white z-10">
                                <i class="pi pi-chevron-left text-2xl"></i>
                            </button>

                            <!-- Ảnh chính -->
                            <div class="w-full h-full flex items-center justify-center">
                                <img
                                    v-if="roomImages.length > 0"
                                    :src="roomImages[currentGalleryIndex]"
                                    :alt="`${room.name} - Ảnh ${currentGalleryIndex + 1}`"
                                    class="max-h-[calc(90vh-180px)] max-w-full object-contain"
                                />
                            </div>

                            <!-- Nút next -->
                            <button @click="nextImage"
                                class="absolute right-4 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white z-10">
                                <i class="pi pi-chevron-right text-2xl"></i>
                            </button>
                        </div>

                        <!-- Thumbnails phía dưới -->
                        <div class="h-[100px] bg-black/90 mt-auto">
                            <div class="h-full flex items-center gap-2 px-4 overflow-x-auto">
                                <div v-for="(image, index) in roomImages"
                                    :key="index"
                                    @click="currentGalleryIndex = index"
                                    class="h-[80px] min-w-[120px] cursor-pointer relative group"
                                >
                                    <img
                                        :src="image"
                                        :alt="`${room.name} - Thumbnail ${index + 1}`"
                                        class="h-full w-full object-cover"
                                        :class="{'opacity-50': currentGalleryIndex !== index}"
                                    />
                                    <div v-if="currentGalleryIndex === index"
                                        class="absolute inset-0 border-2 border-amber-500">
                                    </div>
                                    <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>

                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-800 mb-2">
                                {{ room.roomTypeName }} - {{ room.roomNumber }}
                            </h1>
                            <div class="flex items-center gap-4 mb-2">
                                <div class="flex items-center">
                                    <i class="pi pi-users mr-2 text-gray-600"></i>
                                    <span>{{ room.maxOccupancy }} người</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="pi pi-building mr-2 text-gray-600"></i>
                                    <span>Tầng {{ room.floor }}</span>
                                </div>
                                <!-- <div class="flex items-center">
                                    <i class="pi pi-tag mr-2 text-gray-600"></i>
                                    <span :class="{
                                        'text-green-600': room.status === 'AVAILABLE',
                                        'text-red-600': room.status === 'OCCUPIED',
                                        'text-yellow-600': room.status === 'BOOKED'
                                    }">
                                        {{ getStatusText(room.status) }}
                                    </span>
                                </div> -->
                            </div>
                            <!-- Hiển thị đánh giá -->
                            <div class="flex items-center">
                                <Rating v-if="room.averageRating"
                                    v-model="room.averageRating"
                                    readonly
                                    :cancel="false" />
                                <span v-if="room.totalReviews > 0" class="ml-2 text-gray-600">
                                    ({{ room.totalReviews }} đánh giá)
                                </span>
                                <span v-else class="text-gray-500">Chưa có đánh giá</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-3xl font-bold text-amber-600">
                                {{ formatCurrency(room.pricePerNight) }}
                            </div>
                            <div class="text-sm text-gray-600">/ đêm</div>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h2 class="text-xl font-semibold text-gray-800 mb-2">Mô tả</h2>
                        <p class="text-gray-700">{{ room.specialFeatures || room.notes }}</p>
                    </div>

                    <!-- Tiện nghi phòng -->
                    <div class="mb-6">
                        <h2 class="text-xl font-semibold text-gray-800 mb-2">Tiện nghi phòng</h2>
                        <Accordion class="room-accordion">
                            <AccordionTab header="Tiện nghi cơ bản">
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
                                    <div v-for="(amenity, index) in room.amenities.filter(a => !a.includes('Wi-Fi') && !a.includes('TV'))"
                                         :key="index"
                                         class="flex items-center">
                                <i class="pi pi-check-circle mr-2 text-green-500"></i>
                                <span>{{ amenity }}</span>
                            </div>
                        </div>
                            </AccordionTab>

                            <AccordionTab header="Internet & Giải trí">
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
                                    <div v-for="(amenity, index) in room.amenities.filter(a => a.includes('Wi-Fi') || a.includes('TV'))"
                                         :key="index"
                                         class="flex items-center">
                                        <i class="pi pi-wifi mr-2 text-blue-500"></i>
                                        <span>{{ amenity }}</span>
                                    </div>
                                    <div class="flex items-center">
                                        <i class="pi pi-desktop mr-2 text-blue-500"></i>
                                        <span>TV màn hình phẳng</span>
                                    </div>
                                </div>
                            </AccordionTab>

                            <AccordionTab header="Chính sách phòng">
                                <div class="p-2">
                                    <div class="flex items-start mb-3">
                                        <i class="pi pi-clock text-amber-600 mr-2 mt-1"></i>
                                        <div>
                                            <p class="font-medium">Nhận phòng & Trả phòng</p>
                                            <p class="text-gray-600">Nhận phòng từ 14:00, trả phòng trước 12:00</p>
                                        </div>
                                    </div>

                                    <div class="flex items-start mb-3">
                                        <i class="pi pi-wallet text-amber-600 mr-2 mt-1"></i>
                                        <div>
                                            <p class="font-medium">Hủy phòng & Hoàn tiền</p>
                                            <p class="text-gray-600">Bạn có thể hủy miễn phí trước 1 ngày so với ngày nhận phòng. Nếu hủy muộn hơn, bạn sẽ bị tính phí 1 đêm đầu tiên.</p>
                                        </div>
                                    </div>

                                    <div class="flex items-start">
                                        <i class="pi pi-ban text-red-500 mr-2 mt-1"></i>
                                        <div>
                                            <p class="font-medium">Quy định đặc biệt</p>
                                            <p class="text-gray-600">Không hút thuốc, không mang thú cưng, giữ yên lặng từ 22:00-07:00</p>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTab>
                        </Accordion>
                    </div>

                    <!-- Form đặt phòng -->
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <h2 class="text-xl font-bold mb-4 text-gray-800">Đặt phòng</h2>

                        <!-- Thêm cảnh báo nếu phòng đã được đặt -->
                        <div v-if="room.isBookedNextFiveDays"
                            class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div class="flex items-center text-yellow-700">
                                <i class="pi pi-exclamation-triangle mr-2"></i>
                                <span>Phòng này đã được đặt trong 5 ngày tới</span>
                            </div>
                        </div>

                        <!-- Hiển thị các khoảng thời gian đã đặt -->
                        <div v-if="room.bookingPeriods && room.bookingPeriods.length > 0"
                            class="mb-4 p-4 bg-gray-50 rounded-lg">
                            <h3 class="font-medium text-gray-700 mb-2">Lịch đặt phòng sắp tới:</h3>
                            <div class="space-y-2">
                                <div v-for="(period, index) in room.bookingPeriods"
                                    :key="index"
                                    class="flex items-center text-sm text-gray-600">
                                    <i class="pi pi-calendar mr-2"></i>
                                    <span>{{ formatDate(period.checkInDate) }} - {{ formatDate(period.checkOutDate) }}</span>
                                </div>
                            </div>
                        </div>

                        <Accordion class="booking-accordion" :activeIndex="0">
                            <!-- Thông tin lưu trú -->
                            <AccordionTab header="Thông tin lưu trú">
                                <div class="p-2">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-gray-700 font-medium mb-2">Ngày nhận phòng</label>
                                <DatePicker
                                    v-model="booking.checkInDate"
                                    placeholder="Chọn ngày"
                                    class="w-full"
                                    showIcon
                                    :minDate="today"
                                    @change="handleCheckInChange"
                                    :disabledDates="disabledDates"
                                    :showClear="true"
                                />
                            </div>
                            <div>
                                <label class="block text-gray-700 font-medium mb-2">Ngày trả phòng</label>
                                <DatePicker
                                    v-model="booking.checkOutDate"
                                    placeholder="Chọn ngày"
                                    class="w-full"
                                    showIcon
                                    :minDate="minCheckOutDate"
                                    :disabled="!booking.checkInDate"
                                    :disabledDates="disabledDates"
                                    :showClear="true"
                                />
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-gray-700 mb-1">Số khách</label>
                            <div class="relative overflow-visible" style="z-index: 100;">
                                <button @click="showGuestSelect = !showGuestSelect"
                                    class="guest-select-button w-full bg-white border rounded-lg px-4 py-2 text-left flex items-center justify-between hover:border-amber-500 focus:outline-none focus:border-amber-500">
                                    <span class="text-gray-700">
                                        {{ booking.adults }} người lớn{{ booking.children ? `, ${booking.children} trẻ em` : '' }}
                                    </span>
                                    <i class="pi pi-chevron-down text-gray-400"></i>
                                </button>

                                <!-- GuestSelector hiển thị ở giữa màn hình như một modal -->
                                <div v-if="showGuestSelect" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                                    <div class="fixed inset-0 bg-black bg-opacity-30" @click="showGuestSelect = false"></div>
                                    <div class="relative z-[1001]">
                                        <GuestSelector
                                            v-model:adults="booking.adults"
                                            v-model:children="booking.children"
                                            v-model:childrenAges="booking.childrenAges"
                                            :maxOccupancy="room ? room.maxOccupancy : 5"
                                            @close="showGuestSelect = false"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-gray-700 mb-1">Yêu cầu đặc biệt</label>
                            <Textarea v-model="booking.specialRequests" rows="3" class="w-full" placeholder="Nhập yêu cầu đặc biệt (nếu có)" />
                        </div>
                                </div>
                            </AccordionTab>

                            <!-- Dịch vụ bổ sung -->
                            <AccordionTab header="Dịch vụ bổ sung">
                                <div class="p-2">
                                    <div class="space-y-3">
                                        <div v-for="service in availableServices" :key="service.id"
                                             class="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                            <div class="flex items-start">
                                    <Checkbox
                                        v-model="booking.services"
                                        :value="service.id"
                                        :binary="false"
                                        :inputId="`service_${service.id}`"
                                                    class="mt-1 mr-3"
                                    />
                                                <div>
                                                    <label :for="`service_${service.id}`" class="font-medium cursor-pointer">
                                        {{ service.name }}
                                    </label>
                                                    <p class="text-sm text-gray-500">{{ service.description }}</p>
                                </div>
                            </div>
                                            <div class="text-amber-600 font-semibold">
                                                {{ formatCurrency(service.price) }}
                        </div>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTab>

                            <!-- Mã giảm giá và thanh toán -->
                            <AccordionTab header="Giảm giá & Thanh toán">
                                <div class="p-2">
                                    <!-- Mã giảm giá -->
                        <div class="mb-4">
                            <h3 class="font-semibold text-gray-700 mb-2">Mã giảm giá</h3>
                            <div class="flex space-x-2">
                                <InputText
                                    v-model="booking.discountCode"
                                    placeholder="Nhập mã giảm giá"
                                    class="flex-grow"
                                    :disabled="discountStatus.applied"
                                />
                                            <span v-if="discountStatus.loading" class="pi pi-spin pi-spinner text-blue-500 flex items-center"></span>
                                <Button v-else-if="discountStatus.applied"
                                    icon="pi pi-times"
                                                class="p-button-danger p-button-text"
                                    @click="clearDiscountCode"
                                    aria-label="Xóa mã giảm giá" />
                                <Button v-else
                                    type="button"
                                    label="Áp dụng"
                                    @click="checkDiscountCode" />
                            </div>
                            <small v-if="discountStatus.message" :class="discountStatus.valid ? 'text-green-600' : 'text-red-600'">
                                {{ discountStatus.message }}
                            </small>
                        </div>

                                    <!-- Phương thức thanh toán -->
                                    <div class="mb-4">
                                        <h3 class="font-semibold text-gray-700 mb-2">Phương thức thanh toán</h3>
                                        <div class="space-y-2">
                                            <div class="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                                                <RadioButton v-model="booking.paymentMethod" value="CASH" inputId="pay_at_hotel" />
                                                <label for="pay_at_hotel" class="ml-2 flex items-center cursor-pointer">
                                                    <span>Thanh toán tại khách sạn</span>
                                                </label>
                                            </div>
                                            <div class="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                                                <RadioButton v-model="booking.paymentMethod" value="VNPAY" inputId="pay_vnpay" />
                                                <label for="pay_vnpay" class="ml-2 flex items-center cursor-pointer">
                                                    <span class="mr-2">Thanh toán qua VNPay</span>
                                                    <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPay" class="h-6" />
                                                </label>
                                            </div>
                                        </div>
                                        <small class="text-gray-500 mt-1 block">Bạn sẽ được chuyển đến cổng thanh toán VNPay sau khi nhấn nút tiếp tục nếu chọn thanh toán qua VNPay</small>
                                    </div>
                                </div>
                            </AccordionTab>
                        </Accordion>

                        <!-- Chi tiết giá -->
                        <div v-if="days > 0" class="bg-gray-50 p-4 rounded-lg my-6">
                            <h3 class="font-semibold text-gray-800 mb-3">Chi tiết giá</h3>
                            <div class="space-y-2 mb-4">
                                <div class="flex justify-between">
                                <span class="text-gray-700">Giá phòng:</span>
                                <span class="font-semibold">{{ formatCurrency(room.pricePerNight) }}/đêm</span>
                            </div>
                                <div class="flex justify-between">
                                <span class="text-gray-700">Số đêm:</span>
                                <span class="font-semibold">{{ days }} đêm</span>
                            </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-700">Người lớn ({{ booking.adults }}):</span>
                                    <span class="font-semibold">{{ formatCurrency(room.pricePerNight * booking.adults * days) }}</span>
                                </div>
                                <!-- Hiện thị chi tiết giá theo từng trẻ em -->
                                <template v-if="booking.children > 0">
                                    <div v-for="(age, index) in booking.childrenAges" :key="index" class="flex justify-between">
                                        <span class="text-gray-700">
                                            Trẻ em {{ index + 1 }} ({{ age }} tuổi):
                                        </span>
                                        <span class="font-semibold">
                                            <template v-if="age <= 6">
                                                Miễn phí
                                            </template>
                                            <template v-else-if="age <= 11">
                                                {{ formatCurrency(room.pricePerNight * 0.5 * days) }} (giảm 50%)
                                            </template>
                                            <template v-else>
                                                {{ formatCurrency(room.pricePerNight * days) }}
                                            </template>
                                        </span>
                                    </div>
                                </template>
                                <div v-if="booking.services && booking.services.length > 0" class="flex justify-between">
                                <span class="text-gray-700">Dịch vụ bổ sung:</span>
                                <span class="font-semibold">{{ formatCurrency(serviceTotal) }}</span>
                            </div>
                                <div v-if="discountStatus.applied" class="flex justify-between text-green-600">
                                    <span>Giảm giá ({{ booking.discountCode }}):</span>
                                    <span class="font-semibold">-{{ discountStatus.discount }}%</span>
                            </div>
                            </div>

                            <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                <span>Tổng cộng:</span>
                                <span class="text-amber-600">{{ formatCurrency(totalPrice) }}</span>
                            </div>
                        </div>

                        <Button @click="handleBooking" label="Tiếp tục đặt phòng" class="w-full p-button-lg" :disabled="!booking.checkInDate || !booking.checkOutDate" />

                        <div class="mt-4 text-center text-gray-500 text-sm">
                            <p>Bạn chưa bị trừ tiền ở bước này</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Phòng liên quan -->
            <div v-if="relatedRooms.length > 0" class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-2xl font-bold mb-4 text-gray-800">Phòng cùng loại</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div v-for="relatedRoom in relatedRooms" :key="relatedRoom.id"
                        class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <!-- Ảnh phòng -->
                        <div class="relative h-48">
                            <img :src="relatedRoom.images[0]"
                                :alt="'Phòng ' + relatedRoom.roomNumber"
                                class="w-full h-full object-cover" />
                            <!-- Badge trạng thái -->
                            <!-- <div class="absolute top-2 right-2 px-2 py-1 rounded text-sm font-medium"
                                :class="{
                                    'bg-green-100 text-green-800': relatedRoom.status === 'AVAILABLE',
                                    'bg-red-100 text-red-800': relatedRoom.status === 'OCCUPIED',
                                    'bg-yellow-100 text-yellow-800': relatedRoom.status === 'BOOKED'
                                }">
                                {{ getStatusText(relatedRoom.status) }}
                            </div> -->
                        </div>

                        <div class="p-4">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="font-semibold text-gray-800">Phòng {{ relatedRoom.roomNumber }}</h3>
                                    <p class="text-sm text-gray-600">Tầng {{ relatedRoom.floor }}</p>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-amber-600">
                                        {{ formatCurrency(relatedRoom.pricePerNight) }}
                                    </div>
                                    <div class="text-xs text-gray-500">/đêm</div>
                                </div>
                            </div>

                            <!-- Mô tả ngắn -->
                            <p v-if="relatedRoom.notes" class="text-sm text-gray-600 mb-4 line-clamp-2">
                                {{ relatedRoom.notes }}
                            </p>

                            <!-- Đánh giá -->
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <Rating v-if="relatedRoom.averageRating"
                                        :modelValue="relatedRoom.averageRating"
                                        readonly
                                        :cancel="false"
                                        class="text-sm" />
                                    <span v-if="relatedRoom.totalReviews" class="ml-1 text-sm text-gray-600">
                                        ({{ relatedRoom.totalReviews }})
                                    </span>
                                    <span v-else class="text-sm text-gray-500">Chưa có đánh giá</span>
                                </div>
                                <Button
                                    @click="navigateToRoom(relatedRoom.id)"
                                    label="Xem chi tiết"
                                    class="p-button-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Phần đánh giá -->
            <div class="bg-white p-6 rounded-lg shadow-md my-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Đánh giá từ khách hàng</h2>
                    <Button
                        v-if="hasBookedRoom"
                        label="Viết đánh giá"
                        icon="pi pi-pencil"
                        @click="showReviewForm = true"
                        class="text-white" />
                </div>

                <!-- Danh sách đánh giá -->
                <div v-if="reviews.length > 0" class="space-y-6">
                    <div v-for="review in reviews" :key="review.id" class="border-b border-gray-200 pb-6 last:border-0">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h3 class="font-medium text-gray-800">{{ review.name }}</h3>
                                <div class="flex items-center gap-2">
                                    <Rating :modelValue="review.rating" readonly :cancel="false" />
                                    <span class="text-sm text-gray-500">{{ review.date }}</span>
                                </div>
                            </div>
                        </div>
                        <p class="text-gray-600 mb-3">{{ review.comment }}</p>

                        <!-- Hiển thị chi tiết đánh giá -->
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 mb-3">
                            <div class="flex items-center text-sm text-gray-500">
                                <span class="font-medium mr-1">Vệ sinh:</span>
                                <Rating :modelValue="review.cleanliness" readonly :cancel="false" :stars="5" class="scale-75 origin-left" />
                            </div>
                            <div class="flex items-center text-sm text-gray-500">
                                <span class="font-medium mr-1">Dịch vụ:</span>
                                <Rating :modelValue="review.service" readonly :cancel="false" :stars="5" class="scale-75 origin-left" />
                            </div>
                            <div class="flex items-center text-sm text-gray-500">
                                <span class="font-medium mr-1">Thoải mái:</span>
                                <Rating :modelValue="review.comfort" readonly :cancel="false" :stars="5" class="scale-75 origin-left" />
                            </div>
                            <div class="flex items-center text-sm text-gray-500">
                                <span class="font-medium mr-1">Vị trí:</span>
                                <Rating :modelValue="review.location" readonly :cancel="false" :stars="5" class="scale-75 origin-left" />
                            </div>
                            <div class="flex items-center text-sm text-gray-500">
                                <span class="font-medium mr-1">Tiện nghi:</span>
                                <Rating :modelValue="review.facilities" readonly :cancel="false" :stars="5" class="scale-75 origin-left" />
                            </div>
                            <div class="flex items-center text-sm text-gray-500">
                                <span class="font-medium mr-1">Đáng giá:</span>
                                <Rating :modelValue="review.valueForMoney" readonly :cancel="false" :stars="5" class="scale-75 origin-left" />
                            </div>
                        </div>

                        <!-- Hiển thị phản hồi từ khách sạn nếu có -->
                        <div v-if="review.replyComment" class="mt-3 pl-4 border-l-4 border-amber-200 bg-amber-50 p-3 rounded">
                            <div class="flex justify-between">
                                <h4 class="font-medium text-gray-700">Phản hồi từ {{ review.replyBy || 'Khách sạn' }}</h4>
                                <span class="text-xs text-gray-500">{{ review.replyDate }}</span>
                            </div>
                            <p class="text-gray-600 mt-1">{{ review.replyComment }}</p>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                    Chưa có đánh giá !
                </div>
            </div>

            <!-- Dialog đánh giá -->
            <Dialog
                v-model:visible="showReviewForm"
                modal
                header="Đánh giá phòng"
                :style="{ width: '90%', maxWidth: '600px' }"
            >
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Đánh giá chung</label>
                        <Rating v-model="reviewForm.rating" :cancel="false" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">Vệ sinh</label>
                            <Rating v-model="reviewForm.cleanliness" :cancel="false" />
                        </div>
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">Dịch vụ</label>
                            <Rating v-model="reviewForm.service" :cancel="false" />
                        </div>
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">Thoải mái</label>
                            <Rating v-model="reviewForm.comfort" :cancel="false" />
                        </div>
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">Vị trí</label>
                            <Rating v-model="reviewForm.location" :cancel="false" />
                        </div>
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">Tiện nghi</label>
                            <Rating v-model="reviewForm.facilities" :cancel="false" />
                        </div>
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">Đáng giá tiền</label>
                            <Rating v-model="reviewForm.valueForMoney" :cancel="false" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Bình luận</label>
                        <Textarea
                            v-model="reviewForm.comment"
                            rows="4"
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            class="w-full"
                        />
                    </div>

                    <div class="flex items-center mt-3">
                        <Checkbox
                            v-model="reviewForm.isAnonymous"
                            :binary="true"
                            inputId="anonymous-review"
                        />
                        <label for="anonymous-review" class="ml-2 text-gray-700">
                            Đánh giá ẩn danh
                        </label>
                    </div>

                    <div v-if="!hasBookedRoom" class="p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="pi pi-exclamation-triangle mr-2"></i>
                            </div>
                            <div>
                                <p>Bạn cần đặt và sử dụng phòng này trước khi có thể đánh giá.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <div class="flex justify-end gap-2">
                        <Button
                            label="Hủy"
                            class="p-button-text"
                            @click="showReviewForm = false" />
                        <Button
                            label="Gửi đánh giá"
                            :loading="isSubmittingReview"
                            :disabled="!hasBookedRoom"
                            @click="submitReview" />
                    </div>
                </template>
            </Dialog>
        </div>

        <!-- Loading state -->
        <div v-else-if="loading === false && !room" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <i class="pi pi-exclamation-triangle text-5xl text-amber-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy phòng</h2>
            <p class="text-gray-600 mb-6">Phòng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Button label="Quay lại danh sách phòng" @click="router.push('/rooms')" />
        </div>
    </div>
</template>

<style scoped>
:deep(.p-rating .p-rating-item.p-rating-item-active .p-rating-icon) {
  color: #f59e0b !important; /* amber-500 */
}

:deep(.p-datepicker),
:deep(.p-dropdown),
:deep(.p-inputtext),
:deep(.p-textarea) {
  width: 100%;
}

:deep(.p-button) {
  background: #d97706; /* amber-600 */
  border-color: #d97706; /* amber-600 */
}

:deep(.p-button:hover) {
  background: #b45309; /* amber-700 */
  border-color: #b45309; /* amber-700 */
}

:deep(.p-button.p-button-sm) {
  font-size: 0.875rem;
  padding: 0.4rem 0.8rem;
}

:deep(.p-galleria-thumbnail-container) {
  background: #f3f4f6; /* gray-100 */
}

/* Thêm style cho phần hiển thị ảnh */
.md\:row-span-2 {
  height: 400px;
}

.room-images-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  max-height: 400px;
}

.main-image {
  grid-row: span 2;
}

.image-overlay {
  transition: all 0.3s ease;
}

.image-overlay:hover {
  background-color: rgba(0, 0, 0, 0.6);
}

/* Styles cho dropdown chọn khách */
.guest-select-button {
  cursor: pointer;
  transition: all 0.2s ease;
}

.guest-select-dropdown {
  border: 1px solid #e5e7eb;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
}

/* Thêm styles cho gallery */
.gallery-dialog {
    @apply bg-black;
}

:deep(.gallery-dialog .p-dialog-content) {
    @apply p-0 bg-black h-full;
}

:deep(.gallery-dialog) .p-dialog-mask {
    @apply bg-black/90;
}

/* Tùy chỉnh thanh cuộn cho thumbnails */
.overflow-x-auto {
    scrollbar-width: thin;
    scrollbar-color: #666 #333;
}

.overflow-x-auto::-webkit-scrollbar {
    height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    background: #333;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background-color: #666;
    border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background-color: #888;
}

/* Animation cho chuyển ảnh */
.gallery-dialog img {
    transition: opacity 0.3s ease;
}

/* Hiệu ứng hover cho nút */
.gallery-dialog button {
    opacity: 0.8;
    transition: all 0.2s ease;
}

.gallery-dialog button:hover {
    opacity: 1;
    transform: scale(1.1);
}

/* Custom styling cho Accordion */
:deep(.room-accordion),
:deep(.booking-accordion) {
    border-radius: 0.5rem;
    overflow: hidden;
    margin-bottom: 1.5rem;
}

:deep(.room-accordion .p-accordion-header-link),
:deep(.booking-accordion .p-accordion-header-link) {
    border: none;
    background: #f9fafb;
    padding: 1rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

:deep(.room-accordion .p-accordion-header-link:hover),
:deep(.booking-accordion .p-accordion-header-link:hover) {
    background: #f3f4f6;
}

:deep(.room-accordion .p-accordion-header-link:focus),
:deep(.booking-accordion .p-accordion-header-link:focus) {
    box-shadow: none;
    border-color: #d97706;
}

:deep(.room-accordion .p-accordion-header-text),
:deep(.booking-accordion .p-accordion-header-text) {
    color: #374151;
    font-weight: 500;
}

:deep(.room-accordion .p-accordion-tab),
:deep(.booking-accordion .p-accordion-tab) {
    margin-bottom: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
}

:deep(.room-accordion .p-accordion-content),
:deep(.booking-accordion .p-accordion-content) {
    background: white;
    border: none;
    padding: 0;
}

/* Thêm style cho backdrop */
.guest-selector-backdrop {
    z-index: 1000;
}
</style>
