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
    image: "https://randomuser.me/api/portraits/men/32.jpg"
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
  title: 'Về chúng tôi - Luxury Hotel',
  meta: [
    {
      name: 'description',
      content: 'Luxury Hotel được thành lập từ năm 2010, là một trong những thương hiệu khách sạn hàng đầu Việt Nam với hơn 10 năm kinh nghiệm và 4 cơ sở khách sạn tại các địa điểm du lịch nổi tiếng.'
    }
  ]
})
</script>

<template>
  <div class="about-page min-h-screen">
    <!-- Hero Banner -->
    <div class="relative h-64 md:h-80 bg-gray-900">
      <img :src="nha_nghi_1" alt="Về chúng tôi" class="w-full h-full object-cover opacity-60" />
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Về chúng tôi</h1>
          <p class="text-xl text-white max-w-3xl mx-auto px-4">Khám phá câu chuyện và tầm nhìn của Luxury Hotel</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <!-- Our Story -->
      <div class="mb-16">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Câu chuyện của chúng tôi</h2>
            <p class="text-gray-600 mb-4">
              Luxury Hotel được thành lập vào năm 2010 với sứ mệnh mang đến trải nghiệm lưu trú đẳng cấp 5 sao nhưng với mức giá hợp lý cho du khách trong và ngoài nước.
            </p>
            <p class="text-gray-600 mb-4">
              Sau hơn 10 năm phát triển, chúng tôi đã trở thành một trong những thương hiệu khách sạn hàng đầu Việt Nam, với chuỗi khách sạn tại các địa điểm du lịch nổi tiếng như Hà Nội, Đà Nẵng, Nha Trang và TP. Hồ Chí Minh.
            </p>
            <p class="text-gray-600">
              Chúng tôi tự hào về đội ngũ nhân viên chuyên nghiệp, cơ sở vật chất hiện đại và dịch vụ chăm sóc khách hàng tận tâm, mang đến cho du khách những kỷ niệm đáng nhớ trong mỗi chuyến đi.
            </p>
          </div>
          <div class="md:w-1/2">
            <img :src="nha_nghi_2" alt="Câu chuyện của chúng tôi" class="w-full h-auto rounded-lg shadow-lg" />
          </div>
        </div>
      </div>

      <!-- Our Values -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Giá trị cốt lõi</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-16 h-16 bg-amber-100 text-amber-600 mx-auto rounded-full flex items-center justify-center mb-4">
              <i class="pi pi-star text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Chất lượng</h3>
            <p class="text-gray-600">Không ngừng nâng cao chất lượng dịch vụ, mang đến trải nghiệm 5 sao cho mọi khách hàng</p>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-16 h-16 bg-amber-100 text-amber-600 mx-auto rounded-full flex items-center justify-center mb-4">
              <i class="pi pi-heart text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Tận tâm</h3>
            <p class="text-gray-600">Đặt khách hàng làm trung tâm, lắng nghe và đáp ứng mọi nhu cầu của khách hàng</p>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-16 h-16 bg-amber-100 text-amber-600 mx-auto rounded-full flex items-center justify-center mb-4">
              <i class="pi pi-globe text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Bền vững</h3>
            <p class="text-gray-600">Cam kết phát triển bền vững, bảo vệ môi trường và đóng góp cho cộng đồng</p>
          </div>
        </div>
      </div>

      <!-- Our Team -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Đội ngũ lãnh đạo</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div v-for="member in teamMembers" :key="member.name" class="bg-white rounded-lg overflow-hidden shadow-md">
            <img :src="member.image" :alt="member.name" class="w-full h-64 object-cover" />
            <div class="p-4 text-center">
              <h3 class="text-lg font-bold text-gray-800">{{ member.name }}</h3>
              <p class="text-amber-600 mb-2">{{ member.position }}</p>
              <p class="text-gray-600 text-sm">{{ member.experience }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div>
        <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Thành tựu của chúng tôi</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-xl font-semibold mb-4 text-amber-600">Giải thưởng</h3>
            <ul class="space-y-3">
              <li class="flex items-start">
                <i class="pi pi-check-circle text-green-500 mr-2 mt-1"></i>
                <span class="text-gray-700">Top 10 khách sạn tốt nhất Việt Nam 2022</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check-circle text-green-500 mr-2 mt-1"></i>
                <span class="text-gray-700">Giải thưởng Dịch vụ xuất sắc 2021</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check-circle text-green-500 mr-2 mt-1"></i>
                <span class="text-gray-700">Giải thưởng Khách sạn thân thiện với môi trường 2020</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check-circle text-green-500 mr-2 mt-1"></i>
                <span class="text-gray-700">Chứng nhận Chất lượng 5 sao từ Hiệp hội Du lịch Việt Nam</span>
              </li>
            </ul>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-xl font-semibold mb-4 text-amber-600">Con số ấn tượng</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4">
                <div class="text-3xl font-bold text-amber-600 mb-2">10+</div>
                <p class="text-gray-700">Năm kinh nghiệm</p>
              </div>
              <div class="text-center p-4">
                <div class="text-3xl font-bold text-amber-600 mb-2">4</div>
                <p class="text-gray-700">Cơ sở khách sạn</p>
              </div>
              <div class="text-center p-4">
                <div class="text-3xl font-bold text-amber-600 mb-2">200+</div>
                <p class="text-gray-700">Nhân viên chuyên nghiệp</p>
              </div>
              <div class="text-center p-4">
                <div class="text-3xl font-bold text-amber-600 mb-2">50.000+</div>
                <p class="text-gray-700">Khách hàng hài lòng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="bg-amber-600 py-16">
      <div class="max-w-5xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Trải nghiệm đẳng cấp tại Luxury Hotel</h2>
        <p class="text-white text-lg mb-8">Đặt phòng ngay hôm nay để có kỳ nghỉ tuyệt vời cùng chúng tôi</p>
        <Button
            label="Đặt phòng ngay"
            class="p-button-lg bg-white text-amber-700 hover:bg-gray-100 font-medium"
            aria-label="Đặt phòng khách sạn"
            @click="$router.push('/rooms')"
        />
      </div>
    </div>
  </div>
</template>
