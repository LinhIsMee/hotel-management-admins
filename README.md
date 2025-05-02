# Hệ Thống Đặt Phòng Khách Sạn Cao Cấp - Luxury Hotel

## Tổng Quan

Luxury Hotel là nền tảng đặt phòng khách sạn trực tuyến sang trọng, được xây dựng với công nghệ tiên tiến. Nền tảng của chúng tôi mang đến trải nghiệm người dùng vượt trội thông qua giao diện trực quan và các tính năng toàn diện, thiết lập tiêu chuẩn mới trong ngành công nghiệp khách sạn.

## Công Nghệ Sử Dụng

- **Frontend:** Vue.js 3, Vite
- **Components UI:** PrimeVue
- **Tạo Style:** Tailwind CSS
- **Quản Lý State:** Vue's Composition API
- **Định Tuyến:** Vue Router

## Tính Năng Chính

- 🏨 Tìm kiếm và lọc phòng nâng cao
- 🔐 Hệ thống xác thực bảo mật cho khách
- 📝 Quản lý thông tin cá nhân toàn diện
- 📅 Trải nghiệm đặt phòng trực tuyến liền mạch
- 📱 Thiết kế đáp ứng cho mọi thiết bị
- 👩‍💼 Kiểm soát truy cập dựa trên vai trò (Admin/Khách)

## Bắt Đầu

```bash
# Cài đặt các gói phụ thuộc
npm install

# Chạy máy chủ phát triển
npm run dev

# Xây dựng cho môi trường production
npm run build
```

## Cấu Trúc Dự Án

```
src/
├── assets/         # Tài nguyên tĩnh: hình ảnh, styles, fonts
│   ├── images/     # Hình ảnh sử dụng trong ứng dụng
│   ├── styles/     # CSS/SCSS toàn cục
│   └── fonts/      # Font chữ được sử dụng
│
├── components/     # Components tái sử dụng trong ứng dụng
│   ├── common/     # Components dùng chung (Button, Input, Modal,...)
│   ├── layout/     # Components bố cục (Header, Footer, Sidebar,...)
│   └── ui/         # Components UI riêng biệt (Card, Alert, Toast,...)
│
├── composables/    # Composables hooks tái sử dụng logic
│
├── services/       # API và các dịch vụ tương tác với backend
│   ├── api/        # Các hàm gọi API
│   ├── auth/       # Dịch vụ xác thực người dùng
│   └── utils/      # Các tiện ích phục vụ service
│
├── stores/         # State management với Pinia/Composition API
│
├── views/          # Các trang giao diện
│   ├── client/     # Giao diện cho khách hàng
│   │   ├── Home/   # Trang chủ
│   │   ├── Room/   # Trang chi tiết phòng
│   │   └── ...     # Các trang khác dành cho khách
│   └── admin/      # Giao diện quản trị
│       ├── Dashboard/  # Bảng điều khiển admin
│       ├── Users/      # Quản lý người dùng
│       └── ...         # Các trang quản trị khác
│
├── router/         # Cấu hình định tuyến
│   ├── index.js    # File chính cấu hình router
│   ├── routes/     # Định nghĩa các routes
│   └── guards/     # Navigation guards
│
├── utils/          # Tiện ích và hàm trợ giúp
│   ├── formatters/ # Các hàm format dữ liệu
│   ├── validators/ # Các hàm kiểm tra dữ liệu
│   └── helpers/    # Các hàm trợ giúp khác
│
├── App.vue         # Component gốc của ứng dụng
└── main.js         # Điểm khởi đầu của ứng dụng
```

## Giải Thích Cấu Trúc Vue

### 1. Hướng Tiếp Cận Component-Based:
- Dự án được tổ chức theo hướng component, giúp tái sử dụng code và bảo trì dễ dàng
- Mỗi component được thiết kế để thực hiện một chức năng cụ thể và có thể tái sử dụng

### 2. Phân Tách Giao Diện:
- **views/client**: Chứa các trang dành cho khách hàng đặt phòng
- **views/admin**: Chứa các trang quản trị để quản lý khách sạn, đặt phòng, phòng

### 3. Luồng Dữ Liệu:
- **services**: Xử lý giao tiếp với API và trung gian giữa giao diện và backend
- **stores**: Quản lý trạng thái toàn cục của ứng dụng
- **components**: Nhận dữ liệu và hiển thị giao diện người dùng

### 4. Định Tuyến:
- **router**: Quản lý việc chuyển hướng giữa các trang
- Hỗ trợ middleware để kiểm tra xác thực và phân quyền

### 5. Logic Ứng Dụng:
- **composables**: Chứa các hooks tái sử dụng, tách biệt logic khỏi giao diện
- **utils**: Cung cấp các hàm tiện ích dùng chung

## Tác Giả

- **Tên:** LinhIsMee
- **Email:** linh.pthth@gmail.com

## Giấy Phép

Dự án này được cấp phép theo Giấy phép MIT - xem tệp LICENSE để biết chi tiết.

---

© 2024 Luxury Hotel. Bảo lưu mọi quyền.

## Phân quyền hệ thống

### Vai trò người dùng
- **ROLE_ADMIN**: Quản trị viên, có đầy đủ quyền trong hệ thống
- **ROLE_EMPLOYEE**: Nhân viên, có quyền hạn chế

### Quyền truy cập theo trang
| Trang | ROLE_ADMIN | ROLE_EMPLOYEE |
|-------|------------|---------------|
| Dashboard | ✅ | ✅ |
| Quản lý người dùng | ✅ | ❌ |
| Quản lý phòng | ✅ | ✅ |
| Quản lý loại phòng | ✅ | ✅ |
| Quản lý đặt phòng | ✅ | ✅ |
| Quản lý dịch vụ | ✅ | ❌ |
| Quản lý đánh giá | ✅ | ✅ |
| Mã giảm giá | ✅ | ❌ |

### Quyền thao tác
| Thao tác | ROLE_ADMIN | ROLE_EMPLOYEE |
|----------|------------|---------------|
| Xem (view) | ✅ | ✅ |
| Tạo mới (create) | ✅ | ❌ |
| Chỉnh sửa (edit) | ✅ | ❌ |
| Xóa (delete) | ✅ | ❌ |
| Xác nhận (confirm) | ✅ | ✅ |
| Hủy (cancel) | ✅ | ❌ |
| Check-in | ✅ | ✅ |
| Check-out | ✅ | ✅ |

### Cơ chế kiểm tra quyền

1. **Kiểm tra quyền trang**
   - Sử dụng route guard `roleBasedGuard` kiểm tra quyền truy cập trang dựa trên vai trò
   - Chuyển hướng đến trang từ chối truy cập nếu không có quyền

2. **Kiểm tra quyền thao tác**
   - Sử dụng `usePermissions` composable để kiểm tra quyền thao tác
   - Ẩn/hiện các nút chức năng dựa trên quyền của người dùng

3. **Luồng xác thực**
   - Đăng nhập riêng biệt cho admin/nhân viên và khách hàng
   - Lưu thông tin người dùng vào localStorage
   - Kiểm tra token và vai trò mỗi khi truy cập trang bảo mật

### Sử dụng
```javascript
// Sử dụng composable usePermissions
import { usePermissions } from '@/composables/usePermissions';

// Lấy thông tin quyền
const { userRole, can, refreshRole } = usePermissions();

// Kiểm tra quyền cụ thể
if (can.edit.value) {
  // Hiển thị chức năng chỉnh sửa
}
```

### An ninh
- Kiểm tra token authentication với mỗi request API
- Kiểm tra vai trò (role) tại cả client và server side
- Chỉ hiển thị các tính năng mà người dùng có quyền truy cập
