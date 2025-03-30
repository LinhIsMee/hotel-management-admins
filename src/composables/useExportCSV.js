import { ref } from 'vue';

export function useExportCSV() {
  const exporting = ref(false);

  const exportToCSV = (bookings, formatDate, formatCurrency, getStatusLabel, getPaymentStatusLabel) => {
    try {
      exporting.value = true;

      // Tạo tiêu đề CSV
      const headers = [
        'Mã đơn',
        'Khách hàng',
        'SĐT',
        'Phòng',
        'Ngày nhận',
        'Ngày trả',
        'Trạng thái',
        'Tổng tiền',
        'Thanh toán',
        'Ngày tạo'
      ];

      // Tạo dữ liệu CSV
      const csvData = bookings.map(booking => [
        booking.id,
        booking.fullName,
        booking.phone,
        booking.rooms?.map(r => `${r.roomNumber} (${r.roomType})`).join(', ') || 'Không có phòng',
        formatDate(booking.checkInDate),
        formatDate(booking.checkOutDate),
        getStatusLabel(booking.status),
        formatCurrency(booking.finalPrice).replace('₫', 'VND'),
        getPaymentStatusLabel(booking.paymentStatus),
        formatDate(booking.createdAt)
      ]);

      // Thêm header vào đầu dữ liệu
      csvData.unshift(headers);

      // Chuyển đổi các hàng thành chuỗi CSV
      let csvContent = csvData.map(row => {
        // Đảm bảo các giá trị có dấu phẩy hoặc dấu ngoặc kép được đặt trong dấu ngoặc kép
        return row.map(cell => {
          if (cell === null || cell === undefined) {
            return '';
          }

          const cellText = String(cell);
          if (cellText.includes(',') || cellText.includes('"') || cellText.includes('\n')) {
            return `"${cellText.replace(/"/g, '""')}"`;
          }
          return cellText;
        }).join(',');
      }).join('\n');

      // Thêm BOM để Excel nhận dạng đúng ký tự UTF-8
      const BOM = '\uFEFF';
      csvContent = BOM + csvContent;

      // Tạo blob và tải về
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const fileName = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`;

      // Tạo link tải và kích hoạt
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Lỗi khi xuất CSV:', error);
      alert('Đã xảy ra lỗi khi xuất CSV: ' + error.message);
    } finally {
      exporting.value = false;
    }
  };

  return {
    exporting,
    exportToCSV
  };
}
