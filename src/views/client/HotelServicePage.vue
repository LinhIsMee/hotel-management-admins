<template>
  <div class="hotel-service-page bg-gray-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Dịch vụ khách sạn</h1>

      <!-- Banner dịch vụ -->
      <div class="relative h-80 rounded-xl overflow-hidden mb-12">
        <img src="https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
             alt="Dịch vụ khách sạn"
             class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
          <div class="px-8 md:px-12 text-white max-w-xl">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Dịch vụ đẳng cấp</h2>
            <p class="text-lg">Trải nghiệm dịch vụ chăm sóc khách hàng xuất sắc và các tiện ích đẳng cấp quốc tế tại Luxury Hotel</p>
          </div>
        </div>
      </div>

      <!-- Danh sách dịch vụ -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div v-for="(service, index) in services" :key="index" class="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
          <div class="relative h-64">
            <img :src="service.image" :alt="service.name" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div class="absolute top-0 right-0 p-3 bg-amber-500 text-white font-semibold">
              {{ service.category }}
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-2">{{ service.name }}</h3>
            <p class="text-gray-600 mb-4">{{ service.description }}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="(feature, i) in service.features" :key="i" class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {{ feature }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="font-semibold text-amber-600">{{ service.price }}</span>
              <Button label="Chi tiết" class="p-button-outlined" @click="showServiceDetails(service)" />
            </div>
          </div>
        </div>
      </div>

      <!-- Đặt dịch vụ -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Đặt dịch vụ</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p class="text-gray-700 mb-4">
              Để đặt dịch vụ hoặc tìm hiểu thêm thông tin chi tiết, vui lòng liên hệ với chúng tôi qua các kênh sau:
            </p>

            <div class="space-y-4 mb-6">
              <div class="flex items-center">
                <i class="pi pi-phone text-amber-600 mr-3"></i>
                <span>+84 28 1234 5678</span>
              </div>
              <div class="flex items-center">
                <i class="pi pi-envelope text-amber-600 mr-3"></i>
                <span>service@luxuryhotel.vn</span>
              </div>
              <div class="flex items-center">
                <i class="pi pi-comments text-amber-600 mr-3"></i>
                <span>Lễ tân 24/7</span>
              </div>
            </div>

            <div>
              <Button label="Liên hệ ngay" icon="pi pi-send" class="bg-amber-600 hover:bg-amber-700" />
            </div>
          </div>

          <div>
            <h3 class="font-semibold text-gray-800 mb-3">Gửi yêu cầu dịch vụ</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-gray-700 mb-1">Họ tên</label>
                <InputText v-model="contactForm.name" class="w-full" placeholder="Nhập họ tên của bạn" />
              </div>

              <div>
                <label class="block text-gray-700 mb-1">Email</label>
                <InputText v-model="contactForm.email" class="w-full" placeholder="Nhập email của bạn" />
              </div>

              <div>
                <label class="block text-gray-700 mb-1">Dịch vụ quan tâm</label>
                <Dropdown v-model="contactForm.service" :options="serviceOptions" optionLabel="name" class="w-full" placeholder="Chọn dịch vụ" />
              </div>

              <div>
                <label class="block text-gray-700 mb-1">Yêu cầu của bạn</label>
                <Textarea v-model="contactForm.message" rows="3" class="w-full" placeholder="Nhập yêu cầu chi tiết của bạn" />
              </div>

              <Button label="Gửi yêu cầu" icon="pi pi-check" class="w-full bg-amber-600 hover:bg-amber-700" @click="sendServiceRequest" />
            </div>
          </div>
        </div>
      </div>

      <!-- Chính sách sử dụng dịch vụ -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Chính sách dịch vụ</h2>

        <div class="space-y-4 text-gray-700">
          <div>
            <h3 class="font-semibold text-gray-800 mb-2">Đặt dịch vụ trước</h3>
            <p>Để đảm bảo sự sẵn sàng, vui lòng đặt trước các dịch vụ ít nhất 24 giờ. Đặc biệt với các dịch vụ spa và đưa đón nên đặt trước 48 giờ.</p>
          </div>

          <div>
            <h3 class="font-semibold text-gray-800 mb-2">Hủy dịch vụ</h3>
            <p>Dịch vụ có thể hủy miễn phí trước 12 giờ. Hủy trong vòng 12 giờ sẽ phải trả 50% phí dịch vụ. Không đến sẽ bị tính 100% phí dịch vụ.</p>
          </div>

          <div>
            <h3 class="font-semibold text-gray-800 mb-2">Thanh toán</h3>
            <p>Các dịch vụ có thể được thanh toán trực tiếp tại khách sạn hoặc tính vào hóa đơn phòng của bạn khi trả phòng.</p>
          </div>

          <div>
            <h3 class="font-semibold text-gray-800 mb-2">Trẻ em</h3>
            <p>Trẻ em dưới 6 tuổi thường được miễn phí với nhiều dịch vụ. Trẻ em từ 6-12 tuổi được giảm 50%. Vui lòng kiểm tra chính sách cụ thể cho từng dịch vụ.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog chi tiết dịch vụ -->
    <Dialog v-model:visible="serviceDialogVisible" :header="selectedService?.name || ''" :modal="true" :style="{width: '90vw', maxWidth: '768px'}">
      <div v-if="selectedService">
        <div class="mb-4">
          <img :src="selectedService.image" :alt="selectedService.name" class="w-full h-64 object-cover rounded-lg" />
        </div>

        <div class="mb-4">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Mô tả</h3>
          <p class="text-gray-700">{{ selectedService.fullDescription || selectedService.description }}</p>
        </div>

        <div class="mb-4">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Thông tin chi tiết</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center">
              <i class="pi pi-tag text-amber-600 mr-2"></i>
              <span class="font-medium">Loại dịch vụ:</span>
              <span class="ml-2">{{ selectedService.category }}</span>
            </div>
            <div class="flex items-center">
              <i class="pi pi-clock text-amber-600 mr-2"></i>
              <span class="font-medium">Thời gian:</span>
              <span class="ml-2">{{ selectedService.duration }}</span>
            </div>
            <div class="flex items-center">
              <i class="pi pi-dollar text-amber-600 mr-2"></i>
              <span class="font-medium">Giá:</span>
              <span class="ml-2">{{ selectedService.price }}</span>
            </div>
            <div class="flex items-center">
              <i class="pi pi-users text-amber-600 mr-2"></i>
              <span class="font-medium">Phù hợp cho:</span>
              <span class="ml-2">{{ selectedService.suitableFor }}</span>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Tính năng nổi bật</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="(feature, i) in selectedService.features" :key="i" class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {{ feature }}
            </span>
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <Button label="Đặt dịch vụ này" icon="pi pi-check" class="bg-amber-600 hover:bg-amber-700" @click="bookSelectedService" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();

// Form liên hệ
const contactForm = ref({
  name: '',
  email: '',
  service: null,
  message: ''
});

// Dialog hiển thị chi tiết dịch vụ
const serviceDialogVisible = ref(false);
const selectedService = ref(null);

// Danh sách dịch vụ
const services = ref([
  {
    id: 1,
    name: 'Spa & Massage',
    category: 'Chăm sóc sức khỏe',
    description: 'Trải nghiệm liệu pháp spa đẳng cấp thế giới với các phương pháp massage truyền thống và hiện đại.',
    fullDescription: 'Spa của chúng tôi cung cấp một loạt các liệu pháp chăm sóc da, massage và các liệu pháp trị liệu khác nhằm giúp bạn thư giãn, làm dịu các cơ bắp mệt mỏi và cải thiện sức khỏe tổng thể. Tất cả các liệu pháp của chúng tôi được thực hiện bởi các chuyên gia có chứng chỉ, sử dụng các sản phẩm cao cấp và các kỹ thuật được nghiên cứu kỹ lưỡng.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    price: 'Từ 500.000đ/người',
    duration: '60-120 phút',
    suitableFor: 'Cá nhân, Cặp đôi',
    features: ['Massage Thụy Điển', 'Massage đá nóng', 'Liệu pháp thải độc', 'Chăm sóc da mặt', 'Tắm thảo dược']
  },
  {
    id: 2,
    name: 'Nhà hàng Fine Dining',
    category: 'Ẩm thực',
    description: 'Thưởng thức ẩm thực đẳng cấp với thực đơn được thiết kế bởi đầu bếp nổi tiếng, kết hợp hương vị Á - Âu.',
    fullDescription: 'Nhà hàng của chúng tôi mang đến trải nghiệm ẩm thực tinh tế với các món ăn được chế biến từ những nguyên liệu tươi ngon nhất và được trình bày một cách nghệ thuật. Thực đơn của chúng tôi kết hợp giữa hương vị truyền thống Á Đông và phong cách Âu hiện đại, tạo nên những món ăn độc đáo và hấp dẫn.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    price: 'Từ 350.000đ/người',
    duration: 'Phục vụ từ 6:00 - 22:00',
    suitableFor: 'Cá nhân, Nhóm, Gia đình',
    features: ['Buffet sáng', 'Thực đơn À la carte', 'Rượu vang cao cấp', 'Món chay', 'Đặt bàn riêng']
  },
  {
    id: 3,
    name: 'Dịch vụ đưa đón sân bay',
    category: 'Vận chuyển',
    description: 'Dịch vụ đưa đón sang trọng, an toàn với đội xe hiện đại và tài xế chuyên nghiệp, thân thiện.',
    fullDescription: 'Dịch vụ đưa đón sân bay của chúng tôi cung cấp một phương tiện di chuyển tiện lợi và sang trọng giữa sân bay và khách sạn. Với đội xe hiện đại và các tài xế chuyên nghiệp, bạn có thể yên tâm về chất lượng dịch vụ và sự an toàn trong suốt hành trình.',
    image: 'https://images.unsplash.com/photo-1590374504314-249efece7228?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    price: '350.000đ/chiều',
    duration: '24/7',
    suitableFor: 'Cá nhân, Nhóm, Gia đình',
    features: ['Xe sang trọng', 'Điều hòa', 'WiFi miễn phí', 'Nước uống', 'Tài xế thông thạo tiếng Anh']
  },
  {
    id: 4,
    name: 'Hồ bơi vô cực',
    category: 'Giải trí',
    description: 'Thư giãn tại hồ bơi vô cực trên sân thượng với tầm nhìn toàn cảnh thành phố.',
    fullDescription: 'Hồ bơi vô cực trên sân thượng của chúng tôi mang đến một không gian thư giãn lý tưởng với tầm nhìn tuyệt đẹp ra toàn cảnh thành phố. Thiết kế độc đáo tạo cảm giác như nước hòa vào đường chân trời, mang đến trải nghiệm bơi lội tuyệt vời và là nơi lý tưởng để ngắm hoàng hôn.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    price: 'Miễn phí cho khách lưu trú',
    duration: '6:00 - 22:00 hàng ngày',
    suitableFor: 'Tất cả khách lưu trú',
    features: ['Tầm nhìn panorama', 'Ghế tắm nắng', 'Quầy bar bể bơi', 'Khăn tắm miễn phí', 'Phòng thay đồ']
  },
  {
    id: 5,
    name: 'Phòng tập Gym',
    category: 'Thể thao',
    description: 'Duy trì thói quen tập luyện với phòng gym hiện đại được trang bị đầy đủ thiết bị cao cấp.',
    fullDescription: 'Phòng tập thể dục của chúng tôi được trang bị các thiết bị tập luyện hiện đại nhất, từ máy chạy bộ, xe đạp tập đến các máy tập tạ và không gian dành cho yoga và pilates. Chúng tôi cũng cung cấp dịch vụ huấn luyện viên cá nhân cho những khách hàng muốn có một chương trình tập luyện được thiết kế riêng.',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    price: 'Miễn phí cho khách lưu trú',
    duration: 'Mở cửa 24/7',
    suitableFor: 'Tất cả khách lưu trú',
    features: ['Thiết bị Technogym', 'Khu vực cardio', 'Khu vực tạ tự do', 'Yoga studio', 'Huấn luyện viên riêng (có phí)']
  },
  {
    id: 6,
    name: 'Tổ chức sự kiện',
    category: 'Sự kiện',
    description: 'Dịch vụ tổ chức sự kiện chuyên nghiệp cho hội nghị, tiệc cưới, sinh nhật và các dịp đặc biệt khác.',
    fullDescription: 'Với các không gian đa năng có thể phục vụ từ các cuộc họp nhỏ đến các sự kiện lớn, đội ngũ tổ chức sự kiện của chúng tôi sẽ giúp bạn lên kế hoạch và thực hiện sự kiện một cách hoàn hảo. Từ trang trí, âm thanh, ánh sáng đến ẩm thực, chúng tôi chăm chút từng chi tiết để đảm bảo sự kiện của bạn thành công rực rỡ.',
    image: 'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    price: 'Liên hệ báo giá',
    duration: 'Theo yêu cầu',
    suitableFor: 'Doanh nghiệp, Cá nhân, Nhóm',
    features: ['Phòng hội nghị', 'Thiết bị audiovisual', 'Dịch vụ ẩm thực', 'Trang trí sự kiện', 'Đội ngũ chuyên nghiệp']
  }
]);

// Tạo options cho dropdown
const serviceOptions = ref(services.value.map(s => ({ name: s.name, id: s.id })));

// Hiển thị chi tiết dịch vụ
const showServiceDetails = (service) => {
  selectedService.value = service;
  serviceDialogVisible.value = true;
};

// Đặt dịch vụ đã chọn
const bookSelectedService = () => {
  if (!selectedService.value) return;

  // Đóng dialog
  serviceDialogVisible.value = false;

  // Cập nhật form với dịch vụ đã chọn
  contactForm.value.service = serviceOptions.value.find(s => s.id === selectedService.value.id);

  // Scroll đến phần đặt dịch vụ
  setTimeout(() => {
    document.querySelector('#booking-section')?.scrollIntoView({ behavior: 'smooth' });
  }, 300);
};

// Gửi yêu cầu dịch vụ
const sendServiceRequest = () => {
  // Xác thực form
  if (!contactForm.value.name || !contactForm.value.email || !contactForm.value.service) {
    toast.add({
      severity: 'warn',
      summary: 'Thông tin chưa đủ',
      detail: 'Vui lòng điền đầy đủ thông tin họ tên, email và dịch vụ',
      life: 3000
    });
    return;
  }

  // Giả lập gửi API
  toast.add({
    severity: 'success',
    summary: 'Đã gửi yêu cầu',
    detail: 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất',
    life: 3000
  });

  // Reset form
  contactForm.value = {
    name: '',
    email: '',
    service: null,
    message: ''
  };
};

// Thiết lập meta tags cho trang dịch vụ
useHead({
  title: 'Dịch vụ - Luxury Hotel',
  meta: [
    {
      name: 'description',
      content: 'Khám phá các dịch vụ đẳng cấp tại Luxury Hotel - Spa, nhà hàng, hồ bơi, phòng tập gym và nhiều tiện ích cao cấp khác.'
    }
  ]
});
</script>
