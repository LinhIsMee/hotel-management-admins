// Mock data service cho toàn bộ ứng dụng
export const mockRooms = [
  {
    id: 'r001',
    name: 'Phòng Deluxe',
    description: 'Phòng Deluxe sang trọng với tầm nhìn ra thành phố, đầy đủ tiện nghi hiện đại và không gian thoải mái.',
    area: 35, // m²
    maxOccupancy: 2,
    pricePerNight: 1200000, // VND
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
      'https://images.unsplash.com/photo-1584132905271-512c958d674a'
    ],
    amenities: [
      'WiFi miễn phí',
      'Điều hòa',
      'TV màn hình phẳng',
      'Minibar',
      'Két an toàn',
      'Bồn tắm',
      'Ban công'
    ],
    status: 'AVAILABLE',
    roomType: 'DELUXE',
    rating: 4.7,
    reviewCount: 24
  },
  {
    id: 'r002',
    name: 'Phòng Superior',
    description: 'Phòng Superior thoáng đãng với thiết kế hiện đại, phù hợp cho cả công việc và nghỉ ngơi.',
    area: 30, // m²
    maxOccupancy: 2,
    pricePerNight: 900000, // VND
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
      'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9'
    ],
    amenities: [
      'WiFi miễn phí',
      'Điều hòa',
      'TV màn hình phẳng',
      'Minibar',
      'Két an toàn'
    ],
    status: 'AVAILABLE',
    roomType: 'SUPERIOR',
    rating: 4.5,
    reviewCount: 18
  },
  {
    id: 'r003',
    name: 'Phòng Family',
    description: 'Phòng Family rộng rãi, lý tưởng cho gia đình với nhiều tiện nghi và không gian sinh hoạt riêng biệt.',
    area: 45, // m²
    maxOccupancy: 4,
    pricePerNight: 1800000, // VND
    images: [
      'https://images.unsplash.com/photo-1584132905271-512c958d674a',
      'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a'
    ],
    amenities: [
      'WiFi miễn phí',
      'Điều hòa',
      'TV màn hình phẳng',
      'Minibar',
      'Két an toàn',
      'Bồn tắm',
      'Góc sinh hoạt gia đình',
      'Sofa giường'
    ],
    status: 'AVAILABLE',
    roomType: 'FAMILY',
    rating: 4.8,
    reviewCount: 32
  }
];

export const mockBookings = [
  {
    id: 'BK123456',
    userId: '1',
    roomId: 'r001',
    roomName: 'Phòng Deluxe',
    roomImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
    checkInDate: '2023-12-25',
    checkOutDate: '2023-12-28',
    adults: 2,
    children: 0,
    pricePerNight: 1200000,
    totalPrice: 3600000,
    services: {
      breakfast: true,
      earlyCheckin: false,
      lateCheckout: true,
      airportPickup: false
    },
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: 'CREDIT_CARD',
    createdAt: '2023-12-01T10:30:00Z',
    contactInfo: {
      fullName: 'Nguyễn Văn A',
      email: 'nguyena@example.com',
      phone: '0987654321',
      nationality: 'VN',
      specialRequests: 'Phòng tầng cao và yên tĩnh nếu có thể.'
    }
  },
  {
    id: 'BK789012',
    userId: '1',
    roomId: 'r002',
    roomName: 'Phòng Superior',
    roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
    checkInDate: '2024-01-15',
    checkOutDate: '2024-01-20',
    adults: 2,
    children: 1,
    pricePerNight: 900000,
    totalPrice: 5500000,
    services: {
      breakfast: true,
      earlyCheckin: true,
      lateCheckout: false,
      airportPickup: true
    },
    status: 'NEW',
    paymentStatus: 'UNPAID',
    paymentMethod: 'BANK_TRANSFER',
    createdAt: '2023-12-05T14:20:00Z',
    contactInfo: {
      fullName: 'Nguyễn Văn A',
      email: 'nguyena@example.com',
      phone: '0987654321',
      nationality: 'VN',
      specialRequests: ''
    }
  },
  {
    id: 'BK345678',
    userId: '1',
    roomId: 'r003',
    roomName: 'Phòng Family',
    roomImage: 'https://images.unsplash.com/photo-1584132905271-512c958d674a',
    checkInDate: '2023-11-10',
    checkOutDate: '2023-11-15',
    adults: 2,
    children: 2,
    pricePerNight: 1800000,
    totalPrice: 7200000,
    services: {
      breakfast: true,
      earlyCheckin: false,
      lateCheckout: false,
      airportPickup: false
    },
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentMethod: 'MOMO',
    createdAt: '2023-10-20T09:15:00Z',
    contactInfo: {
      fullName: 'Nguyễn Văn A',
      email: 'nguyena@example.com',
      phone: '0987654321',
      nationality: 'VN',
      specialRequests: 'Cần 2 giường đơn cho trẻ em'
    }
  }
];

export const mockServices = [
  {
    id: 1,
    name: 'Spa & Massage',
    category: 'Chăm sóc sức khỏe',
    description: 'Trải nghiệm liệu pháp spa đẳng cấp thế giới với các phương pháp massage truyền thống và hiện đại.',
    fullDescription: 'Spa của chúng tôi cung cấp một loạt các liệu pháp chăm sóc da, massage và các liệu pháp trị liệu khác nhằm giúp bạn thư giãn, làm dịu các cơ bắp mệt mỏi và cải thiện sức khỏe tổng thể.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874',
    price: 'Từ 500.000đ/người',
    duration: '60-120 phút',
    features: ['Massage Thụy Điển', 'Massage đá nóng', 'Liệu pháp thải độc', 'Chăm sóc da mặt', 'Tắm thảo dược']
  },
  {
    id: 2,
    name: 'Nhà hàng Fine Dining',
    category: 'Ẩm thực',
    description: 'Thưởng thức ẩm thực đẳng cấp với thực đơn được thiết kế bởi đầu bếp nổi tiếng, kết hợp hương vị Á - Âu.',
    fullDescription: 'Nhà hàng của chúng tôi mang đến trải nghiệm ẩm thực tinh tế với các món ăn được chế biến từ những nguyên liệu tươi ngon nhất và được trình bày một cách nghệ thuật.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
    price: 'Từ 350.000đ/người',
    duration: 'Phục vụ từ 6:00 - 22:00',
    features: ['Buffet sáng', 'Thực đơn À la carte', 'Rượu vang cao cấp', 'Món chay', 'Đặt bàn riêng']
  },
  {
    id: 3,
    name: 'Dịch vụ đưa đón sân bay',
    category: 'Vận chuyển',
    description: 'Dịch vụ đưa đón sang trọng, an toàn với đội xe hiện đại và tài xế chuyên nghiệp, thân thiện.',
    fullDescription: 'Dịch vụ đưa đón sân bay của chúng tôi cung cấp một phương tiện di chuyển tiện lợi và sang trọng giữa sân bay và khách sạn.',
    image: 'https://images.unsplash.com/photo-1590374504314-249efece7228',
    price: '350.000đ/chiều',
    duration: '24/7',
    features: ['Xe sang trọng', 'Điều hòa', 'WiFi miễn phí', 'Nước uống', 'Tài xế thông thạo tiếng Anh']
  }
];

// Mock API service
export const mockAPI = {
  login: async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          name: 'Nguyễn Văn A',
          email: email,
          token: 'mock_token_' + Math.random().toString(36).substr(2, 9)
        });
      }, 1000);
    });
  },

  getRooms: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockRooms);
      }, 1000);
    });
  },

  getRoom: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const room = mockRooms.find(r => r.id === id);
        resolve(room);
      }, 1000);
    });
  },

  getBookings: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userBookings = mockBookings.filter(b => b.userId === userId);
        resolve(userBookings);
      }, 1000);
    });
  },

  getBooking: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const booking = mockBookings.find(b => b.id === id);
        resolve(booking);
      }, 1000);
    });
  },

  getServices: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockServices);
      }, 1000);
    });
  }
};
