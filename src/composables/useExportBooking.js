import { ref } from 'vue';

export function useExportBooking() {
    const exporting = ref(false);

    const exportToExcel = async (bookings, formatDate, formatCurrency, getStatusLabel, getPaymentStatusLabel) => {
        try {
            exporting.value = true;

            // Kiểm tra dữ liệu trước khi tải thư viện
            if (!bookings || bookings.length === 0) {
                throw new Error('Không có dữ liệu để xuất');
            }

            // Import động ExcelJS và FileSaver
            const ExcelJSModule = await import('exceljs');
            const ExcelJS = ExcelJSModule.default || ExcelJSModule;
            const FileSaver = await import('file-saver');

            // Tạo workbook mới
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Hotel Management System';
            workbook.created = new Date();

            const worksheet = workbook.addWorksheet('Đặt phòng', {
                properties: { tabColor: { argb: '4F81BD' } }
            });

            // Định nghĩa cột với style
            worksheet.columns = [
                { header: 'Mã đơn', key: 'id', width: 12, style: { font: { bold: true } } },
                { header: 'Khách hàng', key: 'fullName', width: 20 },
                { header: 'SĐT', key: 'phone', width: 15 },
                { header: 'Phòng', key: 'rooms', width: 20 },
                { header: 'Ngày nhận', key: 'checkInDate', width: 14 },
                { header: 'Ngày trả', key: 'checkOutDate', width: 14 },
                { header: 'Trạng thái', key: 'status', width: 16 },
                { header: 'Tổng tiền', key: 'finalPrice', width: 15 },
                { header: 'Thanh toán', key: 'paymentStatus', width: 15 },
                { header: 'Ngày tạo', key: 'createdAt', width: 14 }
            ];

            // Style cho header
            worksheet.getRow(1).font = { bold: true, size: 12 };
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'E2EFDA' }
            };

            // Thêm dữ liệu
            bookings.forEach((booking) => {
                worksheet.addRow({
                    id: booking.id,
                    fullName: booking.fullName,
                    phone: booking.phone,
                    rooms: booking.rooms?.map((r) => `${r.roomNumber} (${r.roomType})`).join(', ') || 'Không có phòng',
                    checkInDate: formatDate(booking.checkInDate),
                    checkOutDate: formatDate(booking.checkOutDate),
                    status: getStatusLabel(booking.status),
                    finalPrice: formatCurrency(booking.finalPrice).replace('₫', 'VND'),
                    paymentStatus: getPaymentStatusLabel(booking.paymentStatus),
                    createdAt: formatDate(booking.createdAt)
                });
            });

            // Canh giữa cột ID, Ngày nhận, Ngày trả, Trạng thái, Thanh toán
            ['A', 'E', 'F', 'G', 'I', 'J'].forEach((col) => {
                worksheet.getColumn(col).alignment = { horizontal: 'center' };
            });

            // Canh phải cột Tổng tiền
            worksheet.getColumn('H').alignment = { horizontal: 'right' };

            // Thêm border cho bảng
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                row.eachCell({ includeEmpty: false }, (cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Xuất file
            const buffer = await workbook.xlsx.writeBuffer();
            const fileName = `bookings_export_${new Date().toISOString().split('T')[0]}.xlsx`;

            FileSaver.saveAs(new Blob([buffer]), fileName);
        } catch (error) {
            console.error('Lỗi khi xuất Excel:', error);
            // Thông báo lỗi cho người dùng
            alert('Đã xảy ra lỗi khi xuất Excel: ' + error.message);
        } finally {
            exporting.value = false;
        }
    };

    return {
        exporting,
        exportToExcel
    };
}
