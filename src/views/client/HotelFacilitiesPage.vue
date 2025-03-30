<script setup>
import { useHead } from '@vueuse/head';

// Thiết lập meta tags cho trang tiện nghi
useHead({
    title: 'Tiện nghi & Dịch vụ - Luxury Hotel',
    meta: [
        {
            name: 'description',
            content: 'Khám phá các tiện nghi và dịch vụ đẳng cấp tại Luxury Hotel - Bể bơi vô cực, spa, nhà hàng, dịch vụ đưa đón và nhiều tiện ích khác.'
        }
    ]
});
</script>

<template>
    <div class="facilities-page bg-gray-50 min-h-screen py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-8">Tiện nghi & Dịch vụ</h1>

            <!-- Tiện nghi nổi bật -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Bể bơi vô cực" class="w-full h-56 object-cover" />
                    <div class="p-6">
                        <h2 class="text-xl font-bold text-gray-800 mb-2">Bể bơi vô cực</h2>
                        <p class="text-gray-600 mb-4">Thư giãn và ngắm cảnh toàn thành phố từ bể bơi vô cực trên sân thượng của chúng tôi.</p>
                        <div class="text-sm text-gray-500">
                            <p><i class="pi pi-clock mr-2"></i>Mở cửa từ 6:00 - 22:00 hàng ngày</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Spa & Massage" class="w-full h-56 object-cover" />
                    <div class="p-6">
                        <h2 class="text-xl font-bold text-gray-800 mb-2">Spa & Massage</h2>
                        <p class="text-gray-600 mb-4">Trải nghiệm dịch vụ spa cao cấp với các liệu pháp thư giãn hiện đại và truyền thống.</p>
                        <div class="text-sm text-gray-500">
                            <p><i class="pi pi-clock mr-2"></i>Mở cửa từ 9:00 - 21:00 hàng ngày</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Phòng tập gym" class="w-full h-56 object-cover" />
                    <div class="p-6">
                        <h2 class="text-xl font-bold text-gray-800 mb-2">Phòng tập hiện đại</h2>
                        <p class="text-gray-600 mb-4">Duy trì thói quen tập luyện của bạn với phòng gym đầy đủ thiết bị hiện đại nhất.</p>
                        <div class="text-sm text-gray-500">
                            <p><i class="pi pi-clock mr-2"></i>Mở cửa 24/7 cho khách lưu trú</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Danh sách tiện nghi -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-12">
                <h2 class="text-2xl font-semibold text-gray-800 mb-6">Tất cả tiện nghi</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <i class="pi pi-home text-amber-600 mr-2"></i>
                            Tiện nghi chung
                        </h3>
                        <ul class="space-y-2 text-gray-600">
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Bãi đậu xe miễn phí</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>WiFi miễn phí tốc độ cao</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Dịch vụ phòng 24/7</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Bể bơi vô cực</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Nhà hàng</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Quầy bar</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Phòng tập gym</li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <i class="pi pi-heart text-amber-600 mr-2"></i>
                            Sức khoẻ & Làm đẹp
                        </h3>
                        <ul class="space-y-2 text-gray-600">
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Spa cao cấp</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Phòng xông hơi</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Dịch vụ massage</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Phòng thư giãn</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Trung tâm làm đẹp</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Gói dịch vụ spa trọn gói</li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <i class="pi pi-map text-amber-600 mr-2"></i>
                            Vị trí & Khu vực
                        </h3>
                        <ul class="space-y-2 text-gray-600">
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Khu vực hút thuốc riêng</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Sân hiên / Ban công</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Vườn</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Khu vực BBQ</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Gần trung tâm mua sắm</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Gần bãi biển</li>
                            <li class="flex items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i>Đỗ xe miễn phí</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Dịch vụ đặc biệt -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-12">
                <h2 class="text-2xl font-semibold text-gray-800 mb-6">Dịch vụ đặc biệt</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="flex">
                        <div class="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                            <i class="pi pi-car text-amber-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-2">Đưa đón sân bay</h3>
                            <p class="text-gray-600 mb-2">Dịch vụ đưa đón tận tình từ sân bay đến khách sạn và ngược lại. Đặt trước ít nhất 24h để được phục vụ tốt nhất.</p>
                            <p class="text-sm text-gray-500">Phí dịch vụ: 350.000đ/chiều</p>
                        </div>
                    </div>

                    <div class="flex">
                        <div class="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                            <i class="pi pi-calendar-plus text-amber-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-2">Nhận/trả phòng linh hoạt</h3>
                            <p class="text-gray-600 mb-2">Cung cấp dịch vụ nhận phòng sớm và trả phòng muộn đáp ứng lịch trình di chuyển của khách hàng.</p>
                            <p class="text-sm text-gray-500">Phí dịch vụ: 200.000đ/lần</p>
                        </div>
                    </div>

                    <div class="flex">
                        <div class="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                            <i class="pi pi-users text-amber-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-2">Tổ chức sự kiện</h3>
                            <p class="text-gray-600 mb-2">Dịch vụ tổ chức tiệc cưới, hội nghị, sinh nhật và các sự kiện đặc biệt khác với đội ngũ chuyên nghiệp.</p>
                            <p class="text-sm text-gray-500">Liên hệ để nhận báo giá theo nhu cầu</p>
                        </div>
                    </div>

                    <div class="flex">
                        <div class="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                            <i class="pi pi-heart text-amber-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-2">Kỷ niệm đặc biệt</h3>
                            <p class="text-gray-600 mb-2">Dịch vụ trang trí phòng cho các dịp kỷ niệm đặc biệt như sinh nhật, tình nhân, kỷ niệm ngày cưới.</p>
                            <p class="text-sm text-gray-500">Từ 500.000đ - 2.000.000đ tùy gói</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chính sách bữa ăn -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-12">
                <h2 class="text-2xl font-semibold text-gray-800 mb-6">Chính sách bữa ăn</h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="text-center p-6 border border-gray-200 rounded-lg">
                        <div class="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-4">
                            <i class="pi pi-sun text-amber-600 text-2xl"></i>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">Bữa sáng</h3>
                        <p class="text-gray-600 mb-4">Buffet quốc tế với nhiều lựa chọn món Á - Âu</p>
                        <p class="text-sm text-gray-500">6:00 - 10:00 hàng ngày</p>
                        <p class="font-medium text-amber-600 mt-2">150.000đ/người</p>
                    </div>

                    <div class="text-center p-6 border border-gray-200 rounded-lg">
                        <div class="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-4">
                            <i class="pi pi-cloud text-amber-600 text-2xl"></i>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">Bữa trưa</h3>
                        <p class="text-gray-600 mb-4">Thực đơn chọn món phong phú hoặc buffet ngày lễ</p>
                        <p class="text-sm text-gray-500">11:30 - 14:00 hàng ngày</p>
                        <p class="font-medium text-amber-600 mt-2">250.000đ/người</p>
                    </div>

                    <div class="text-center p-6 border border-gray-200 rounded-lg">
                        <div class="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-4">
                            <i class="pi pi-moon text-amber-600 text-2xl"></i>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">Bữa tối</h3>
                        <p class="text-gray-600 mb-4">Các món đặc sản, món Âu và ẩm thực địa phương</p>
                        <p class="text-sm text-gray-500">18:00 - 22:00 hàng ngày</p>
                        <p class="font-medium text-amber-600 mt-2">350.000đ/người</p>
                    </div>
                </div>

                <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p class="text-gray-700"><i class="pi pi-info-circle text-amber-600 mr-2"></i> Trẻ em dưới 6 tuổi được miễn phí bữa ăn. Trẻ em từ 6-12 tuổi được giảm 50% giá bữa ăn người lớn.</p>
                </div>
            </div>

            <!-- Câu hỏi thường gặp -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-semibold text-gray-800 mb-6">Câu hỏi thường gặp</h2>

                <div class="space-y-4">
                    <div class="border border-gray-200 rounded-lg p-4">
                        <h3 class="font-semibold text-gray-800 mb-2">Giờ nhận phòng và trả phòng là mấy giờ?</h3>
                        <p class="text-gray-600">Giờ nhận phòng tiêu chuẩn là 14:00 và giờ trả phòng là 12:00 trưa. Bạn có thể yêu cầu nhận phòng sớm hoặc trả phòng muộn với phụ phí bổ sung.</p>
                    </div>

                    <div class="border border-gray-200 rounded-lg p-4">
                        <h3 class="font-semibold text-gray-800 mb-2">Khách sạn có đón khách từ sân bay không?</h3>
                        <p class="text-gray-600">Có, chúng tôi cung cấp dịch vụ đưa đón sân bay với phí 350.000đ/chiều. Vui lòng đặt trước ít nhất 24 giờ để đảm bảo tính khả dụng.</p>
                    </div>

                    <div class="border border-gray-200 rounded-lg p-4">
                        <h3 class="font-semibold text-gray-800 mb-2">Có bể bơi và phòng tập thể dục không?</h3>
                        <p class="text-gray-600">Có, khách sạn của chúng tôi có bể bơi vô cực trên sân thượng và phòng tập thể dục hiện đại mở cửa 24/7 dành cho khách lưu trú.</p>
                    </div>

                    <div class="border border-gray-200 rounded-lg p-4">
                        <h3 class="font-semibold text-gray-800 mb-2">Có phải trả thêm phí cho WiFi không?</h3>
                        <p class="text-gray-600">Không, WiFi tốc độ cao được cung cấp miễn phí trong tất cả các khu vực của khách sạn, bao gồm cả trong phòng và các khu vực công cộng.</p>
                    </div>

                    <div class="border border-gray-200 rounded-lg p-4">
                        <h3 class="font-semibold text-gray-800 mb-2">Chính sách hủy phòng như thế nào?</h3>
                        <p class="text-gray-600">
                            Đối với hủy phòng trước 72 giờ so với thời gian nhận phòng, bạn sẽ được hoàn lại toàn bộ. Nếu hủy trong vòng 72 giờ đến 24 giờ, sẽ tính phí 50% giá trị đặt phòng. Hủy trong vòng 24 giờ hoặc không đến sẽ tính phí đêm đầu
                            tiên.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
