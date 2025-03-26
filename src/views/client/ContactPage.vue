<script setup>
import nha_nghi_3 from '@/assets/images/nha-nghi-3.webp';
import { useHead } from '@vueuse/head';
import { ref } from 'vue';

// Mock ảnh cho social media
const socialMediaIcons = {
  facebook: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png",
  instagram: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png",
  twitter: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png",
  youtube: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png"
};

const form = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
});

const submitted = ref(false);
const loading = ref(false);
const successMessage = ref(false);

const validateForm = () => {
  const errors = {};

  if (!form.value.name.trim()) {
    errors.name = 'Vui lòng nhập họ tên';
  }

  if (!form.value.email.trim()) {
    errors.email = 'Vui lòng nhập email';
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.value.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!form.value.subject.trim()) {
    errors.subject = 'Vui lòng nhập tiêu đề';
  }

  if (!form.value.message.trim()) {
    errors.message = 'Vui lòng nhập nội dung tin nhắn';
  }

  return errors;
};

const submitForm = () => {
  submitted.value = true;
  const errors = validateForm();

  if (Object.keys(errors).length === 0) {
    loading.value = true;

    // Giả lập gửi form
    setTimeout(() => {
      loading.value = false;
      successMessage.value = true;
      form.value = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      };
      submitted.value = false;

      // Ẩn thông báo thành công sau 5 giây
      setTimeout(() => {
        successMessage.value = false;
      }, 5000);
    }, 1500);
  }
};

// Thiết lập meta tags cho trang liên hệ
useHead({
  title: 'Liên hệ - Luxury Hotel',
  meta: [
    {
      name: 'description',
      content: 'Liên hệ với Luxury Hotel qua điện thoại, email hoặc form liên hệ. Đội ngũ hỗ trợ khách hàng 24/7 sẵn sàng giải đáp mọi thắc mắc và hỗ trợ đặt phòng.'
    }
  ]
})
</script>

<template>
  <div class="contact-page min-h-screen">
    <!-- Hero Banner -->
    <div class="relative h-64 md:h-80 bg-gray-900">
      <img :src="nha_nghi_3" alt="Liên hệ với chúng tôi" class="w-full h-full object-cover opacity-60" />
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Liên hệ với chúng tôi</h1>
          <p class="text-xl text-white max-w-3xl mx-auto px-4">Chúng tôi luôn sẵn sàng hỗ trợ và lắng nghe ý kiến của bạn</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <div class="flex flex-col lg:flex-row gap-10">
        <!-- Contact Information -->
        <div class="lg:w-1/3">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Thông tin liên hệ</h2>

          <div class="space-y-6">
            <div class="flex items-start">
              <div class="bg-amber-100 p-3 rounded-full text-amber-600 mr-4">
                <i class="pi pi-map-marker text-xl"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-1">Địa chỉ</h3>
                <p class="text-gray-600">123 Đường ABC, Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="bg-amber-100 p-3 rounded-full text-amber-600 mr-4">
                <i class="pi pi-phone text-xl"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-1">Điện thoại</h3>
                <p class="text-gray-600">+84 123 456 789</p>
                <p class="text-gray-600">+84 987 654 321</p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="bg-amber-100 p-3 rounded-full text-amber-600 mr-4">
                <i class="pi pi-envelope text-xl"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-1">Email</h3>
                <p class="text-gray-600">info@luxuryhotel.com</p>
                <p class="text-gray-600">booking@luxuryhotel.com</p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="bg-amber-100 p-3 rounded-full text-amber-600 mr-4">
                <i class="pi pi-clock text-xl"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-1">Giờ làm việc</h3>
                <p class="text-gray-600">Thứ Hai - Chủ Nhật: 24/7</p>
                <p class="text-gray-600">Lễ tân: Phục vụ 24/7</p>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <h3 class="font-semibold text-gray-800 mb-3">Kết nối với chúng tôi</h3>
            <div class="flex space-x-4">
              <a href="#" class="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
                <img :src="socialMediaIcons.facebook" alt="Facebook" class="w-5 h-5" />
              </a>
              <a href="#" class="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 transition-colors">
                <img :src="socialMediaIcons.instagram" alt="Instagram" class="w-5 h-5" />
              </a>
              <a href="#" class="bg-blue-400 text-white p-3 rounded-full hover:bg-blue-500 transition-colors">
                <img :src="socialMediaIcons.twitter" alt="Twitter" class="w-5 h-5" />
              </a>
              <a href="#" class="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors">
                <img :src="socialMediaIcons.youtube" alt="YouTube" class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="lg:w-2/3">
          <div class="bg-white rounded-lg shadow-md p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Gửi tin nhắn cho chúng tôi</h2>

            <div v-if="successMessage" class="mb-6 bg-green-50 p-4 rounded-lg text-green-800 flex items-start">
              <i class="pi pi-check-circle mr-3 mt-0.5 text-green-500 text-xl"></i>
              <div>
                <p class="font-semibold">Tin nhắn đã được gửi thành công!</p>
                <p>Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.</p>
              </div>
            </div>

            <form @submit.prevent="submitForm" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                  <label for="name" class="block text-gray-700 font-medium mb-2">Họ tên <span class="text-red-500">*</span></label>
                  <InputText
                    id="name"
                    v-model="form.name"
                    :class="{ 'p-invalid': submitted && !form.name }"
                    class="w-full"
                    placeholder="Nguyễn Văn A"
                  />
                  <small v-if="submitted && !form.name" class="text-red-500">Vui lòng nhập họ tên</small>
                </div>

                <div class="form-group">
                  <label for="email" class="block text-gray-700 font-medium mb-2">Email <span class="text-red-500">*</span></label>
                  <InputText
                    id="email"
                    v-model="form.email"
                    :class="{ 'p-invalid': submitted && (!form.email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) }"
                    class="w-full"
                    placeholder="example@email.com"
                  />
                  <small v-if="submitted && !form.email" class="text-red-500">Vui lòng nhập email</small>
                  <small v-else-if="submitted && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)" class="text-red-500">Email không hợp lệ</small>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                  <label for="phone" class="block text-gray-700 font-medium mb-2">Số điện thoại</label>
                  <InputText
                    id="phone"
                    v-model="form.phone"
                    class="w-full"
                    placeholder="0123456789"
                  />
                </div>

                <div class="form-group">
                  <label for="subject" class="block text-gray-700 font-medium mb-2">Tiêu đề <span class="text-red-500">*</span></label>
                  <InputText
                    id="subject"
                    v-model="form.subject"
                    :class="{ 'p-invalid': submitted && !form.subject }"
                    class="w-full"
                    placeholder="Tiêu đề tin nhắn"
                  />
                  <small v-if="submitted && !form.subject" class="text-red-500">Vui lòng nhập tiêu đề</small>
                </div>
              </div>

              <div class="form-group">
                <label for="message" class="block text-gray-700 font-medium mb-2">Tin nhắn <span class="text-red-500">*</span></label>
                <Textarea
                  id="message"
                  v-model="form.message"
                  :class="{ 'p-invalid': submitted && !form.message }"
                  class="w-full"
                  rows="5"
                  placeholder="Nội dung tin nhắn..."
                />
                <small v-if="submitted && !form.message" class="text-red-500">Vui lòng nhập nội dung tin nhắn</small>
              </div>

              <div>
                <Button
                  type="submit"
                  label="Gửi tin nhắn"
                  :loading="loading"
                  class="w-full md:w-auto"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Map -->
      <div class="mt-16">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Bản đồ</h2>
        <div class="rounded-lg overflow-hidden shadow-md h-96">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197667!2d106.69901371471864!3d10.777224992318737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e31%3A0xe4abd26d892e8463!2sNha%20Tho%20Duc%20Ba!5e0!3m2!1svi!2s!4v1651288586024!5m2!1svi!2s"
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
  </div>
</template>
