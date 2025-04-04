<template>
  <div class="reviews-section bg-white rounded-lg shadow-md p-6 mb-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Đánh giá từ khách hàng</h2>
      <div class="flex items-center">
        <span class="text-3xl font-bold text-amber-600 mr-2">{{ averageRating }}</span>
        <div>
          <Rating :modelValue="averageRatingValue" readonly :cancel="false" />
          <div class="text-sm text-gray-600">{{ reviews.length }} đánh giá</div>
        </div>
      </div>
    </div>

    <!-- Tạo đánh giá mới -->
    <div v-if="!showReviewForm" class="mb-6">
      <Button label="Viết đánh giá" icon="pi pi-pencil" @click="showReviewForm = true" class="bg-amber-600 hover:bg-amber-700" />
    </div>

    <!-- Form đánh giá -->
    <div v-if="showReviewForm" class="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 class="text-lg font-semibold mb-3">Chia sẻ trải nghiệm của bạn</h3>

      <div class="mb-4">
        <label class="block text-gray-700 mb-1">Đánh giá của bạn</label>
        <Rating v-model="reviewForm.rating" :cancel="false" />
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 mb-1">Nhận xét</label>
        <Textarea v-model="reviewForm.comment" rows="3" class="w-full" placeholder="Chia sẻ trải nghiệm của bạn..." />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-gray-700 mb-1">Họ tên</label>
          <InputText v-model="reviewForm.name" class="w-full" placeholder="Nhập tên của bạn" />
        </div>
        <div>
          <label class="block text-gray-700 mb-1">Email</label>
          <InputText v-model="reviewForm.email" class="w-full" placeholder="Nhập email của bạn" type="email" />
        </div>
      </div>

      <div class="flex justify-end space-x-2">
        <Button label="Hủy" @click="cancelReview" class="p-button-outlined" />
        <Button label="Gửi đánh giá" icon="pi pi-check" @click="submitReview" :loading="isSubmitting" />
      </div>
    </div>

    <!-- Danh sách đánh giá -->
    <div class="space-y-4">
      <div v-for="review in reviews" :key="review.id" class="border-b border-gray-200 pb-4 mb-4 last:border-0">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h4 class="font-semibold text-gray-800">{{ review.name }}</h4>
            <div class="flex items-center">
              <Rating :modelValue="review.rating" readonly :cancel="false" />
              <span class="ml-2 text-sm text-gray-500">{{ formatDate(review.date) }}</span>
            </div>
          </div>
        </div>
        <p class="text-gray-700">{{ review.comment }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Rating from 'primevue/rating';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';

const props = defineProps({
  roomId: {
    type: [String, Number],
    required: true
  },
  initialReviews: {
    type: Array,
    default: () => []
  }
});

const reviews = ref(props.initialReviews || []);
const showReviewForm = ref(false);
const isSubmitting = ref(false);

// Form đánh giá
const reviewForm = ref({
  rating: 0,
  comment: '',
  name: '',
  email: ''
});

// Tính rating trung bình
const averageRatingValue = computed(() => {
  if (!reviews.value.length) return 0;
  return reviews.value.reduce((sum, review) => sum + review.rating, 0) / reviews.value.length;
});

// Format rating trung bình để hiển thị
const averageRating = computed(() => {
  return averageRatingValue.value.toFixed(1);
});

// Format ngày
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Hủy đánh giá
const cancelReview = () => {
  showReviewForm.value = false;
  reviewForm.value = {
    rating: 0,
    comment: '',
    name: '',
    email: ''
  };
};

// Gửi đánh giá
const submitReview = () => {
  // Validate form
  if (reviewForm.value.rating === 0) {
    alert('Vui lòng chọn đánh giá sao');
    return;
  }

  if (!reviewForm.value.comment.trim()) {
    alert('Vui lòng nhập nhận xét của bạn');
    return;
  }

  if (!reviewForm.value.name.trim()) {
    alert('Vui lòng nhập tên của bạn');
    return;
  }

  isSubmitting.value = true;

  // Giả lập gửi API
  setTimeout(() => {
    const newReview = {
      id: Date.now(),
      ...reviewForm.value,
      date: new Date().toISOString().split('T')[0]
    };

    reviews.value.unshift(newReview);
    cancelReview();
    isSubmitting.value = false;
  }, 1000);
};
</script>
