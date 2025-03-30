import { saveAs } from 'file-saver';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

export function useExportData() {
    const isExporting = ref(false);
    const toast = useToast();

    const exportToCSV = (data, filename = 'data.csv') => {
        if (!data || !data.length) {
            toast.add({
                severity: 'warn',
                summary: 'Không có dữ liệu',
                detail: 'Không có dữ liệu để xuất.',
                life: 3000
            });
            return;
        }

        isExporting.value = true;

        try {
            // Lấy các trường (header) từ dữ liệu đầu tiên
            const headers = Object.keys(data[0]);
            
            // Tạo header CSV
            let csvContent = headers.join(',') + '\n';
            
            // Thêm dữ liệu
            data.forEach(item => {
                const row = headers.map(header => {
                    let cell = item[header] || '';
                    
                    // Xử lý các kiểu dữ liệu đặc biệt
                    if (cell instanceof Date) {
                        cell = cell.toLocaleDateString('vi-VN');
                    } else if (typeof cell === 'object') {
                        cell = JSON.stringify(cell);
                    }
                    
                    // Escape dấu phẩy và dấu nháy kép
                    cell = String(cell).replace(/"/g, '""');
                    if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                        cell = `"${cell}"`;
                    }
                    
                    return cell;
                }).join(',');
                
                csvContent += row + '\n';
            });
            
            // Tạo blob và tải xuống
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            saveAs(blob, filename);
            
            toast.add({
                severity: 'success',
                summary: 'Xuất thành công',
                detail: `Đã xuất ${data.length} bản ghi thành file CSV.`,
                life: 3000
            });
        } catch (error) {
            console.error('Lỗi khi xuất CSV:', error);
            toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Có lỗi xảy ra khi xuất dữ liệu.',
                life: 3000
            });
        } finally {
            isExporting.value = false;
        }
    };

    return {
        isExporting,
        exportToCSV
    };
} 