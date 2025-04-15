<script setup>
import nha_nghi_1 from '@/assets/images/nha-nghi-1.webp';
import nha_nghi_2 from '@/assets/images/nha-nghi-2.webp';
import { useHead } from '@vueuse/head';

// Mock ảnh đội ngũ
const teamMembers = [
  {
    name: "Nguyễn Văn A",
    position: "Giám đốc điều hành",
    experience: "15 năm kinh nghiệm quản lý khách sạn cao cấp",
    image: "https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/avatar-facebook-dep/top-36-anh-dai-dien-dep-cho-nu/anh-dai-dien-dep-cho-nu-che-mat-anime.jpg?1708401649581"
  },
  {
    name: "Trần Thị B",
    position: "Giám đốc vận hành",
    experience: "12 năm kinh nghiệm quản lý vận hành",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Lê Văn C",
    position: "Giám đốc marketing",
    experience: "10 năm kinh nghiệm trong ngành du lịch",
    image: "https://randomuser.me/api/portraits/men/62.jpg"
  },
  {
    name: "Phạm Thị D",
    position: "Bếp trưởng",
    experience: "Chuyên gia ẩm thực với kinh nghiệm quốc tế",
    image: "https://randomuser.me/api/portraits/women/68.jpg"
  }
];

// Thiết lập meta tags cho trang giới thiệu
useHead({
  title: 'Giới thiệu - Luxury Hotel',
  meta: [
    {
      name: 'description',
      content: 'Khám phá câu chuyện của Luxury Hotel - Khách sạn 5 sao hàng đầu tại Việt Nam với đầy đủ tiện nghi và dịch vụ đẳng cấp quốc tế.'
    }
  ]
})
</script>

<template>
  <div class="about-page bg-gray-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Về chúng tôi</h1>

      <!-- Giới thiệu -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Giới thiệu Luxury Hotel</h2>
        <div class="flex flex-col md:flex-row gap-6">
          <div class="md:w-2/3">
            <p class="text-gray-700 mb-4">
              Được thành lập vào năm 2010, Luxury Hotel là một trong những khách sạn hàng đầu tại Việt Nam, mang đến trải nghiệm lưu trú sang trọng và thoải mái cho du khách từ khắp nơi trên thế giới.
            </p>
            <p class="text-gray-700 mb-4">
              Với vị trí đắc địa tại trung tâm thành phố, chúng tôi tự hào cung cấp dịch vụ khách sạn 5 sao với các tiện nghi hiện đại và dịch vụ chuyên nghiệp, tận tâm.
            </p>
            <p class="text-gray-700">
              Tại Luxury Hotel, chúng tôi cam kết mang đến cho quý khách những trải nghiệm đáng nhớ và thoải mái nhất trong suốt thời gian lưu trú. Từ những phòng nghỉ sang trọng đến nhà hàng với các món ăn đa dạng, chúng tôi luôn nỗ lực để đáp ứng mọi nhu cầu của quý khách.
            </p>
          </div>
          <div class="md:w-1/3">
            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Luxury Hotel" class="w-full h-auto rounded-lg" />
          </div>
        </div>
      </div>

      <!-- Thư viện ảnh -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Thư viện ảnh</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <!-- Ảnh bên ngoài khách sạn -->
          <div>
            <img src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" alt="Luxury Hotel - Bên ngoài" class="w-full h-48 object-cover rounded-lg" />
            <p class="text-center text-gray-600 mt-2">Bên ngoài khách sạn</p>
          </div>

          <!-- Hội trường -->
          <div>
            <img src="https://images.unsplash.com/photo-1562778612-e1e0cda9915c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" alt="Luxury Hotel - Hội trường" class="w-full h-48 object-cover rounded-lg" />
            <p class="text-center text-gray-600 mt-2">Hội trường sự kiện</p>
          </div>

          <!-- Nhà hàng -->
          <div>
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Luxury Hotel - Nhà hàng" class="w-full h-48 object-cover rounded-lg" />
            <p class="text-center text-gray-600 mt-2">Nhà hàng</p>
          </div>

          <!-- Bể bơi -->
          <div>
            <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Luxury Hotel - Bể bơi" class="w-full h-48 object-cover rounded-lg" />
            <p class="text-center text-gray-600 mt-2">Bể bơi vô cực</p>
          </div>

          <!-- Spa -->
          <div>
            <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Luxury Hotel - Spa" class="w-full h-48 object-cover rounded-lg" />
            <p class="text-center text-gray-600 mt-2">Khu vực spa</p>
          </div>

          <!-- Phòng gym -->
          <div>
            <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Luxury Hotel - Gym" class="w-full h-48 object-cover rounded-lg" />
            <p class="text-center text-gray-600 mt-2">Phòng tập gym</p>
          </div>

          <!-- Bãi đậu xe -->
          <div>
            <img src="https://images.unsplash.com/photo-1609258612713-a5a57aa2f8b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Luxury Hotel - Bãi đậu xe" class="w-full h-48 object-cover rounded-lg" />
            <p class="text-center text-gray-600 mt-2">Bãi đậu xe</p>
          </div>

          <!-- Sảnh chờ -->
          <div>
            <img src="https://images.unsplash.com/photo-1590073844006-33379778ae09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" alt="Luxury Hotel - Sảnh chờ" class="w-full h-48 object-cover rounded-lg" />
            <p class="text-center text-gray-600 mt-2">Sảnh chờ</p>
          </div>
        </div>
      </div>

      <!-- Tầm nhìn & Sứ mệnh -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Tầm nhìn</h2>
          <p class="text-gray-700">
            Trở thành khách sạn hàng đầu Việt Nam, mang đến trải nghiệm lưu trú đẳng cấp quốc tế với những dịch vụ độc đáo mang đậm bản sắc văn hóa Việt Nam. Chúng tôi hướng tới sự hài lòng tuyệt đối của khách hàng và liên tục nâng cao chất lượng dịch vụ.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Sứ mệnh</h2>
          <p class="text-gray-700">
            Tạo ra không gian lưu trú sang trọng, thoải mái và an toàn cho khách hàng. Mang đến dịch vụ chuyên nghiệp, chu đáo với tinh thần hiếu khách. Đóng góp vào sự phát triển của ngành du lịch Việt Nam thông qua việc nâng cao chất lượng dịch vụ lưu trú.
          </p>
        </div>
      </div>

      <!-- Giá trị cốt lõi -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Giá trị cốt lõi</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="bg-amber-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3">
              <i class="pi pi-heart-fill text-amber-600 text-2xl"></i>
            </div>
            <h3 class="text-lg font-semibold mb-2">Tận tâm</h3>
            <p class="text-gray-600">Chúng tôi luôn đặt lợi ích và sự hài lòng của khách hàng lên hàng đầu, tận tâm phục vụ mọi nhu cầu.</p>
          </div>

          <div class="text-center">
            <div class="bg-amber-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3">
              <i class="pi pi-shield text-amber-600 text-2xl"></i>
            </div>
            <h3 class="text-lg font-semibold mb-2">Chất lượng</h3>
            <p class="text-gray-600">Cam kết cung cấp dịch vụ chất lượng cao, không ngừng cải tiến và nâng cao trải nghiệm khách hàng.</p>
          </div>

          <div class="text-center">
            <div class="bg-amber-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3">
              <i class="pi pi-users text-amber-600 text-2xl"></i>
            </div>
            <h3 class="text-lg font-semibold mb-2">Đồng đội</h3>
            <p class="text-gray-600">Xây dựng môi trường làm việc chuyên nghiệp, đoàn kết, nơi mỗi nhân viên đều là một phần quan trọng.</p>
          </div>
        </div>
      </div>

      <!-- Liên hệ -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Liên hệ với chúng tôi</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex items-start">
            <i class="pi pi-map-marker text-amber-600 text-xl mr-3 mt-1"></i>
            <div>
              <h3 class="font-semibold mb-1">Địa chỉ</h3>
              <p class="text-gray-600">123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </div>

          <div class="flex items-start">
            <i class="pi pi-phone text-amber-600 text-xl mr-3 mt-1"></i>
            <div>
              <h3 class="font-semibold mb-1">Điện thoại</h3>
              <p class="text-gray-600">+84 28 1234 5678</p>
              <p class="text-gray-600">+84 901 234 567</p>
            </div>
          </div>

          <div class="flex items-start">
            <i class="pi pi-envelope text-amber-600 text-xl mr-3 mt-1"></i>
            <div>
              <h3 class="font-semibold mb-1">Email</h3>
              <p class="text-gray-600">info@luxuryhotel.vn</p>
              <p class="text-gray-600">booking@luxuryhotel.vn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
