<script setup>
import { useHead } from '@vueuse/head';
import { useRouter } from 'vue-router';

const router = useRouter();

// Thiết lập meta tags cho trang giới thiệu
useHead({
  title: 'Giới thiệu - Luxury Hotel',
  meta: [
    {
      name: 'description',
      content: 'Khám phá câu chuyện của Luxury Hotel - Khách sạn 5 sao hàng đầu tại Việt Nam với đầy đủ tiện nghi và dịch vụ đẳng cấp quốc tế.'
    }
  ]
});
</script>

<template>
    <div class="about-hotel-page bg-gray-50 min-h-screen py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">Về chúng tôi</h1>

        <!-- Banner chính -->
        <div class="relative rounded-xl overflow-hidden mb-12 h-96">
          <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
               alt="Khách sạn sang trọng"
               class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
            <div class="px-8 md:px-12 text-white max-w-xl">
              <h2 class="text-3xl md:text-4xl font-bold mb-4">Luxury Hotel</h2>
              <p class="text-lg md:text-xl mb-6">Trải nghiệm dịch vụ lưu trú đẳng cấp 5 sao cùng những kỷ niệm khó quên</p>
              <Button label="Đặt phòng ngay"
                      @click="router.push('/rooms')"
                      class="bg-amber-500 hover:bg-amber-600" />
            </div>
          </div>
        </div>

        <!-- Giới thiệu -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-12">
          <div class="flex flex-col md:flex-row gap-8">
            <div class="md:w-2/3">
              <h2 class="text-2xl font-semibold text-gray-800 mb-6">Giới thiệu về Luxury Hotel</h2>
              <div class="space-y-4 text-gray-700">
                <p>
                  Luxury Hotel là một khách sạn 5 sao tọa lạc tại trung tâm thành phố, nơi mang đến cho du khách không chỉ sự tiện nghi sang trọng
                  mà còn là không gian nghỉ dưỡng đẳng cấp và dịch vụ chuyên nghiệp hàng đầu.
                </p>
                <p>
                  Được thành lập vào năm 2010, với hơn 10 năm kinh nghiệm phục vụ, chúng tôi tự hào là điểm đến lý tưởng cho cả khách du lịch và
                  doanh nhân. Với tổ hợp 150 phòng nghỉ được thiết kế tinh tế, nhà hàng phục vụ ẩm thực Á - Âu đẳng cấp, và các tiện ích cao cấp
                  như bể bơi vô cực, spa, phòng tập gym hiện đại... Luxury Hotel cam kết mang đến trải nghiệm lưu trú hoàn hảo cho mỗi vị khách.
                </p>
                <p>
                  Đội ngũ nhân viên chuyên nghiệp, thân thiện và tận tâm của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7, đảm bảo mỗi khoảnh khắc
                  tại Luxury Hotel đều trở thành những kỷ niệm đáng nhớ.
                </p>
              </div>
            </div>
            <div class="md:w-1/3">
              <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
                   alt="Sảnh khách sạn"
                   class="w-full h-full object-cover rounded-lg" />
            </div>
          </div>
        </div>

        <!-- Thư viện ảnh -->
        <div class="mb-12">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Thư viện ảnh</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Ảnh bên ngoài khách sạn -->
            <div class="relative group overflow-hidden rounded-lg h-60">
              <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                   alt="Bên ngoài khách sạn"
                   class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="text-white p-4 font-medium">Bên ngoài khách sạn</p>
              </div>
            </div>

            <!-- Sảnh chờ -->
            <div class="relative group overflow-hidden rounded-lg h-60">
              <img src="https://images.unsplash.com/photo-1590073844006-33379778ae09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
                   alt="Sảnh chờ"
                   class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="text-white p-4 font-medium">Sảnh chờ</p>
              </div>
            </div>

            <!-- Hồ bơi -->
            <div class="relative group overflow-hidden rounded-lg h-60">
              <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                   alt="Hồ bơi"
                   class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="text-white p-4 font-medium">Hồ bơi</p>
              </div>
            </div>

            <!-- Nhà hàng -->
            <div class="relative group overflow-hidden rounded-lg h-60">
              <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                   alt="Nhà hàng"
                   class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="text-white p-4 font-medium">Nhà hàng</p>
              </div>
            </div>

            <!-- Phòng tập gym -->
            <div class="relative group overflow-hidden rounded-lg h-60">
              <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                   alt="Phòng tập gym"
                   class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="text-white p-4 font-medium">Phòng tập gym</p>
              </div>
            </div>

            <!-- Spa -->
            <div class="relative group overflow-hidden rounded-lg h-60">
              <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                   alt="Spa"
                   class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="text-white p-4 font-medium">Spa</p>
              </div>
            </div>

            <!-- Hội trường -->
            <div class="relative group overflow-hidden rounded-lg h-60">
              <img src="https://images.unsplash.com/photo-1562778612-e1e0cda9915c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
                   alt="Hội trường"
                   class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="text-white p-4 font-medium">Hội trường</p>
              </div>
            </div>

            <!-- Bãi đậu xe -->
            <div class="relative group overflow-hidden rounded-lg h-60">
              <img src="https://images.unsplash.com/photo-1609258612713-a5a57aa2f8b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                   alt="Bãi đậu xe"
                   class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="text-white p-4 font-medium">Bãi đậu xe</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Giá trị cốt lõi -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Giá trị cốt lõi</h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <i class="pi pi-heart-fill text-2xl text-amber-600"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-3">Chất lượng vượt trội</h3>
              <p class="text-gray-600">
                Cam kết mang đến cho khách hàng những dịch vụ xuất sắc nhất, từ phòng ốc tiện nghi đến ẩm thực đẳng cấp và các tiện ích giải trí cao cấp.
              </p>
            </div>

            <div class="text-center">
              <div class="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <i class="pi pi-users text-2xl text-amber-600"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-3">Tận tâm phục vụ</h3>
              <p class="text-gray-600">
                Đội ngũ nhân viên chuyên nghiệp, nhiệt tình luôn sẵn sàng đáp ứng mọi nhu cầu của khách hàng, mang đến trải nghiệm lưu trú thoải mái nhất.
              </p>
            </div>

            <div class="text-center">
              <div class="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <i class="pi pi-globe text-2xl text-amber-600"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-3">Bền vững và trách nhiệm</h3>
              <p class="text-gray-600">
                Chúng tôi cam kết hoạt động với tinh thần trách nhiệm với môi trường và cộng đồng địa phương, đóng góp vào sự phát triển bền vững của ngành du lịch.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Liên hệ và địa điểm -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Liên hệ với chúng tôi</h2>

          <div class="space-y-4">
            <div class="flex items-start">
              <div class="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                <i class="pi pi-map-marker text-amber-600 text-xl"></i>
              </div>
              <div>
                <h3 class="font-semibold mb-1">Địa chỉ</h3>
                <p class="text-gray-600">123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                <i class="pi pi-phone text-amber-600 text-xl"></i>
              </div>
              <div>
                <h3 class="font-semibold mb-1">Điện thoại</h3>
                <p class="text-gray-600">+84 28 1234 5678</p>
                <p class="text-gray-600">+84 901 234 567 (Hotline)</p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                <i class="pi pi-envelope text-amber-600 text-xl"></i>
              </div>
              <div>
                <h3 class="font-semibold mb-1">Email</h3>
                <p class="text-gray-600">info@luxuryhotel.vn</p>
                <p class="text-gray-600">booking@luxuryhotel.vn</p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                <i class="pi pi-clock text-amber-600 text-xl"></i>
              </div>
              <div>
                <h3 class="font-semibold mb-1">Giờ làm việc</h3>
                <p class="text-gray-600">Lễ tân: 24/7</p>
                <p class="text-gray-600">Phòng đặt phòng: 7:00 - 22:00 hàng ngày</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Bản đồ</h2>
          <div class="h-80 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4478687301407!2d106.70141011488544!3d10.776941392321238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e31%3A0xa5777fb3a5bb9972!2zTmd1eeG7hW4gSHXhu4csIELhur9uIE5naMOpLCBRdeG6rW4gMSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1649299807299!5m2!1svi!2s"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </div>

      <!-- Câu hỏi thường gặp -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Câu hỏi thường gặp</h2>

        <div class="space-y-4">
          <Accordion>
            <AccordionTab header="Giờ nhận phòng và trả phòng là mấy giờ?">
              <p class="text-gray-700">
                Giờ nhận phòng tiêu chuẩn là 14:00 và giờ trả phòng là 12:00 trưa. Bạn có thể yêu cầu nhận phòng sớm hoặc trả phòng muộn với phụ phí bổ sung, tùy thuộc vào tình trạng sẵn có của phòng.
              </p>
            </AccordionTab>

            <AccordionTab header="Khách sạn có đón khách từ sân bay không?">
              <p class="text-gray-700">
                Có, chúng tôi cung cấp dịch vụ đưa đón sân bay với phí 350.000đ/chiều. Vui lòng đặt trước ít nhất 24 giờ để đảm bảo tính khả dụng.
              </p>
            </AccordionTab>

            <AccordionTab header="Có bể bơi và phòng tập thể dục không?">
              <p class="text-gray-700">
                Có, khách sạn của chúng tôi có bể bơi vô cực trên sân thượng và phòng tập thể dục hiện đại mở cửa 24/7 dành cho khách lưu trú.
              </p>
            </AccordionTab>

            <AccordionTab header="Có phải trả thêm phí cho WiFi không?">
              <p class="text-gray-700">
                Không, WiFi tốc độ cao được cung cấp miễn phí trong tất cả các khu vực của khách sạn, bao gồm cả trong phòng và các khu vực công cộng.
              </p>
            </AccordionTab>

            <AccordionTab header="Chính sách hủy phòng như thế nào?">
              <p class="text-gray-700">
                Đối với hủy phòng trước 72 giờ so với thời gian nhận phòng, bạn sẽ được hoàn lại toàn bộ. Nếu hủy trong vòng 72 giờ đến 24 giờ, sẽ tính phí 50% giá trị đặt phòng. Hủy trong vòng 24 giờ hoặc không đến sẽ tính phí đêm đầu tiên.
              </p>
            </AccordionTab>

            <AccordionTab header="Có cho phép mang thú cưng không?">
              <p class="text-gray-700">
                Chúng tôi có một số phòng thân thiện với thú cưng. Vui lòng thông báo trước khi đặt phòng nếu bạn mang theo thú cưng. Có thể áp dụng phụ phí và giới hạn về kích thước/cân nặng.
              </p>
            </AccordionTab>
          </Accordion>
        </div>
      </div>
    </div>
  </div>
</template>
