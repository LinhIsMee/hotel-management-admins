<script setup>
import nha_nghi_3 from '@/assets/images/nha-nghi-3.webp';
import { useHead } from '@vueuse/head';
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import { useToast } from 'primevue/usetoast';

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

const toast = useToast();
const sending = ref(false);

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

// Form dữ liệu liên hệ
const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  subject: null,
  message: '',
  agreement: false
});

// Các options chủ đề
const subjectOptions = [
  { name: 'Đặt phòng', value: 'booking' },
  { name: 'Thông tin giá', value: 'pricing' },
  { name: 'Dịch vụ đặc biệt', value: 'services' },
  { name: 'Tổ chức sự kiện', value: 'events' },
  { name: 'Phản hồi & Góp ý', value: 'feedback' },
  { name: 'Khác', value: 'other' }
];

// Validation rules
const rules = {
  contactForm: {
    name: { required },
    email: { required, email },
    subject: { required },
    message: { required }
  }
};

const v$ = useVuelidate(rules, { contactForm });

// Gửi tin nhắn
const sendMessage = async () => {
  submitted.value = true;

  // Kiểm tra form
  const isFormValid = await v$.value.$validate();
  if (!isFormValid || !contactForm.value.agreement) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Vui lòng điền đầy đủ thông tin và đồng ý với chính sách bảo mật',
      life: 3000
    });
    return;
  }

  sending.value = true;

  try {
    // Giả lập gọi API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Reset form
    contactForm.value = {
      name: '',
      email: '',
      phone: '',
      subject: null,
      message: '',
      agreement: false
    };

    submitted.value = false;
    successMessage.value = true;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.',
      life: 3000
    });
  } finally {
    sending.value = false;
  }
};
</script>

<template>
  <div class="contact-page bg-gray-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Liên hệ với chúng tôi</h1>

      <!-- Banner liên hệ -->
      <div class="relative rounded-xl overflow-hidden mb-12 h-80">
        <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
             alt="Liên hệ Luxury Hotel"
             class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
          <div class="px-8 md:px-12 text-white max-w-xl">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Chúng tôi luôn sẵn sàng lắng nghe</h2>
            <p class="text-lg md:text-xl mb-6">Hãy liên hệ với chúng tôi để được giải đáp mọi thắc mắc và nhận tư vấn tốt nhất</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <!-- Thông tin liên hệ -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 class="text-2xl font-semibold text-gray-800 mb-6">Thông tin liên hệ</h2>

            <div class="space-y-6">
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

            <div class="mt-8">
              <h3 class="font-semibold mb-4">Kết nối với chúng tôi</h3>
              <div class="flex space-x-4">
                <a href="#" class="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center text-amber-600 hover:bg-amber-200 transition-colors">
                  <i class="pi pi-facebook"></i>
                </a>
                <a href="#" class="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center text-amber-600 hover:bg-amber-200 transition-colors">
                  <i class="pi pi-instagram"></i>
                </a>
                <a href="#" class="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center text-amber-600 hover:bg-amber-200 transition-colors">
                  <i class="pi pi-twitter"></i>
                </a>
                <a href="#" class="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center text-amber-600 hover:bg-amber-200 transition-colors">
                  <i class="pi pi-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Form liên hệ -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-6">Gửi tin nhắn cho chúng tôi</h2>

            <form @submit.prevent="sendMessage" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-gray-700 font-medium mb-2" for="name">Họ tên <span class="text-red-500">*</span></label>
                  <InputText id="name" v-model="contactForm.name" class="w-full" :class="{'p-invalid': v$.contactForm.name.$invalid && submitted}" />
                  <small v-if="v$.contactForm.name.$invalid && submitted" class="p-error">Vui lòng nhập họ tên</small>
                </div>

                <div>
                  <label class="block text-gray-700 font-medium mb-2" for="email">Email <span class="text-red-500">*</span></label>
                  <InputText id="email" v-model="contactForm.email" type="email" class="w-full" :class="{'p-invalid': v$.contactForm.email.$invalid && submitted}" />
                  <small v-if="v$.contactForm.email.$invalid && submitted" class="p-error">Vui lòng nhập email hợp lệ</small>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-gray-700 font-medium mb-2" for="phone">Số điện thoại</label>
                  <InputText id="phone" v-model="contactForm.phone" class="w-full" />
                </div>

                <div>
                  <label class="block text-gray-700 font-medium mb-2" for="subject">Chủ đề <span class="text-red-500">*</span></label>
                  <Select id="subject" v-model="contactForm.subject" :options="subjectOptions" optionLabel="name" placeholder="Chọn chủ đề" class="w-full" :class="{'p-invalid': v$.contactForm.subject.$invalid && submitted}" />
                  <small v-if="v$.contactForm.subject.$invalid && submitted" class="p-error">Vui lòng chọn chủ đề</small>
                </div>
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2" for="message">Nội dung tin nhắn <span class="text-red-500">*</span></label>
                <Textarea id="message" v-model="contactForm.message" rows="6" class="w-full" :class="{'p-invalid': v$.contactForm.message.$invalid && submitted}" />
                <small v-if="v$.contactForm.message.$invalid && submitted" class="p-error">Vui lòng nhập nội dung tin nhắn</small>
              </div>

              <div>
                <div class="flex items-start">
                  <Checkbox v-model="contactForm.agreement" :binary="true" id="agreement" name="agreement" class="mt-1" />
                  <label for="agreement" class="ml-2 text-gray-700">
                    Tôi đồng ý với <a href="#" class="text-amber-600 hover:underline">Chính sách bảo mật</a> của Luxury Hotel
                  </label>
                </div>
                <small v-if="!contactForm.agreement && submitted" class="p-error block mt-2">Vui lòng đồng ý với chính sách bảo mật</small>
              </div>

              <div>
                <Button type="submit" label="Gửi tin nhắn" icon="pi pi-send" class="bg-amber-600 hover:bg-amber-700" :loading="sending" />
              </div>
            </form>
          </div>

          <!-- Bản đồ -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-6">Bản đồ</h2>
            <div class="h-96 rounded-lg overflow-hidden">
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
      </div>

      <!-- Câu hỏi thường gặp -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Câu hỏi thường gặp</h2>

        <div class="space-y-4">
          <Accordion>
            <AccordionTab header="Làm thế nào để đặt phòng?">
              <p class="text-gray-700">
                Bạn có thể đặt phòng trực tuyến thông qua website của chúng tôi, gọi điện trực tiếp đến số hotline +84 901 234 567,
                hoặc gửi email đến booking@luxuryhotel.vn. Chúng tôi khuyến khích đặt phòng trực tuyến để nhận được các ưu đãi đặc biệt.
              </p>
            </AccordionTab>

            <AccordionTab header="Chính sách đặt cọc như thế nào?">
              <p class="text-gray-700">
                Để xác nhận đặt phòng, chúng tôi yêu cầu đặt cọc 30% tổng giá trị đơn hàng. Bạn có thể thanh toán bằng thẻ tín dụng/ghi nợ
                hoặc chuyển khoản ngân hàng. Phần còn lại có thể thanh toán khi nhận phòng.
              </p>
            </AccordionTab>

            <AccordionTab header="Làm thế nào để tôi có thể đặt dịch vụ đưa đón sân bay?">
              <p class="text-gray-700">
                Dịch vụ đưa đón sân bay có thể được đặt thêm trong quá trình đặt phòng hoặc sau khi đã đặt phòng bằng cách liên hệ trực tiếp
                với chúng tôi qua email hoặc điện thoại ít nhất 24 giờ trước thời gian nhận phòng.
              </p>
            </AccordionTab>

            <AccordionTab header="Khách sạn có chấp nhận thú cưng không?">
              <p class="text-gray-700">
                Chúng tôi có một số phòng thân thiện với thú cưng. Vui lòng thông báo trước khi đặt phòng nếu bạn mang theo thú cưng.
                Có thể áp dụng phụ phí và giới hạn về kích thước/cân nặng.
              </p>
            </AccordionTab>

            <AccordionTab header="Có dịch vụ đưa đón đến các điểm du lịch không?">
              <p class="text-gray-700">
                Có, chúng tôi cung cấp dịch vụ đưa đón đến các điểm du lịch nổi tiếng trong thành phố. Vui lòng liên hệ lễ tân hoặc
                concierge của chúng tôi để biết thêm chi tiết và đặt lịch.
              </p>
            </AccordionTab>
          </Accordion>
        </div>
      </div>
    </div>

    <!-- Dialog xác nhận gửi tin nhắn thành công -->
    <Dialog v-model:visible="successMessage" header="Gửi tin nhắn thành công" :style="{width: '450px'}" :closable="false" :modal="true">
      <div class="text-center">
        <i class="pi pi-check-circle text-green-500 text-5xl mb-4"></i>
        <h3 class="text-xl font-semibold mb-2">Cảm ơn bạn đã liên hệ!</h3>
        <p class="mb-4">Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
        <Button label="Đóng" @click="successMessage = false" class="bg-amber-600 hover:bg-amber-700" />
      </div>
    </Dialog>
  </div>
</template>
