/**
 * Tạo một phiên bản debounced của hàm
 * @param {Function} func - Hàm cần debounce
 * @param {number} wait - Thời gian chờ tính bằng milliseconds
 * @returns {Function} - Phiên bản debounced của hàm
 */
export function debounce(func, wait = 300) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
