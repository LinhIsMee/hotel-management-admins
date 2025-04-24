/**
 * Định dạng số thành định dạng tiền tệ VND
 * @param {number} value - Giá trị cần định dạng
 * @param {string} currency - Loại tiền tệ (mặc định: 'VND')
 * @returns {string} Chuỗi định dạng tiền tệ
 */
export const formatCurrency = (value, currency = 'VND') => {
  if (value === null || value === undefined) return '';

  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  });

  return formatter.format(value);
};

/**
 * Định dạng ngày tháng
 * @param {string|Date} date - Ngày cần định dạng
 * @param {string} format - Định dạng mong muốn (mặc định: 'dd/MM/yyyy')
 * @returns {string} Chuỗi ngày đã định dạng
 */
export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return '';

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Kiểm tra nếu là ngày không hợp lệ
    if (isNaN(dateObj.getTime())) return '';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    let formattedDate = format;
    formattedDate = formattedDate.replace('dd', day);
    formattedDate = formattedDate.replace('MM', month);
    formattedDate = formattedDate.replace('yyyy', year);

    return formattedDate;
  } catch (error) {
    console.error('Lỗi khi định dạng ngày:', error);
    return '';
  }
};

/**
 * Cắt ngắn text và thêm dấu "..." nếu quá dài
 * @param {string} text - Văn bản cần cắt ngắn
 * @param {number} maxLength - Độ dài tối đa (mặc định: 50)
 * @returns {string} Văn bản đã cắt ngắn
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength) + '...';
};

/**
 * Định dạng số điện thoại Việt Nam
 * @param {string} phone - Số điện thoại cần định dạng
 * @returns {string} Số điện thoại đã định dạng
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Loại bỏ các ký tự không phải số
  const cleaned = ('' + phone).replace(/\D/g, '');

  // Kiểm tra độ dài
  if (cleaned.length < 9 || cleaned.length > 11) return phone;

  // Định dạng số điện thoại Việt Nam cơ bản
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  }

  return phone;
};
