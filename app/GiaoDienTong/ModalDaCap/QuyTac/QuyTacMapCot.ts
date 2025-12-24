/**
 * TỪ ĐIỂN DỊCH TÊN CỘT (DATABASE -> TIẾNG VIỆT HIỂN THỊ)
 * Bạn cứ thêm vào đây, hệ thống sẽ tự động hiển thị đúng.
 */
export const COLUMN_DICT: Record<string, string> = {
    // Thông tin định danh
    'ho_ten': 'Họ và Tên',
    'ten': 'Tên',
    'ngay_sinh': 'Ngày Sinh',
    'gioi_tinh': 'Giới Tính',
    'cccd': 'CCCD / CMND',
    'cmnd': 'Chứng Minh Thư',
    'ma_so_thue': 'Mã Số Thuế',
    'que_quan': 'Quê Quán',
    'dia_chi': 'Địa Chỉ Thường Trú',
    'tam_tru': 'Địa Chỉ Tạm Trú',

    // Liên hệ
    'so_dien_thoai': 'Số Điện Thoại',
    'sdt': 'SĐT',
    'email': 'Email Liên Hệ',
    'zalo': 'Zalo',
    'facebook': 'Facebook',

    // Công việc
    'vi_tri': 'Vị Trí Công Việc',
    'chuc_vu': 'Chức Vụ',
    'phong_ban': 'Phòng Ban',
    'ngay_vao_lam': 'Ngày Vào Làm',
    'ngay_ky_hop_dong': 'Ngày Ký HĐ',
    'loai_hop_dong': 'Loại Hợp Đồng',
    'trang_thai': 'Trạng Thái',
    'chuyen_mon': 'Chuyên Môn',

    // Tài chính
    'ngan_hang': 'Ngân Hàng Thụ Hưởng',
    'so_tai_khoan': 'Số Tài Khoản',
    'chu_tai_khoan': 'Chủ Tài Khoản',
    'luong_thang': 'Lương Cơ Bản',
    'luong_cung': 'Lương Cứng',
    'tien_cong': 'Tiền Công / Giờ',
    'thuong_doanh_thu': 'Thưởng Doanh Thu (%)',
    'phu_cap': 'Phụ Cấp',

    // Hệ thống & Khác
    'hinh_anh': 'Ảnh Đại Diện',
    'avatar': 'Avatar',
    'ghi_chu': 'Ghi Chú',
    'mo_ta': 'Mô Tả Chi Tiết',
    'nguoi_tao': 'Người Tạo',
    'created_at': 'Ngày Tạo',
    'updated_at': 'Cập Nhật Cuối',
    'id': 'Mã Hệ Thống (ID)'
};

/**
 * Hàm lấy nhãn hiển thị Tiếng Việt cho cột
 */
export const getLabelFromColumn = (colKey: string): string => {
    const key = colKey.toLowerCase();
    
    // 1. Nếu có trong từ điển -> Lấy luôn
    if (COLUMN_DICT[key]) return COLUMN_DICT[key];

    // 2. Nếu không có -> Tự động Format đẹp (viết hoa chữ cái đầu, bỏ gạch dưới)
    // Ví dụ: so_luong_ton -> So Luong Ton
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Hàm phân tích tên cột và kiểu dữ liệu SQL để trả về kiểu UI tương ứng
 */
export const mapSqlTypeToUiType = (sqlType: string, colName: string): string => {
    const type = sqlType ? sqlType.toLowerCase() : '';
    const name = colName ? colName.toLowerCase() : '';

    // 1. HÌNH ẢNH / AVATAR (Ưu tiên số 1)
    if (['hinh_anh', 'avatar', 'img', 'photo', 'logo', 'image'].some(k => name === k || name.includes(k))) return 'image';

    // 2. DROPDOWN
    const selectKeywords = [
        'trang_thai', 'status', 'loai', 'type', 'nhom', 'group', 'phan_loai',
        'vi_tri', 'pos', 'chuc_vu', 'role', 'phong_ban', 'department',
        'bank', 'ngan_hang', 'tinh', 'thanh_pho', 'quan', 'huyen', 'nguon'
    ];
    if (selectKeywords.some(k => name.includes(k))) return 'select_dynamic';

    // 3. TIỀN TỆ & SỐ
    if (['int', 'numeric', 'real', 'double', 'float', 'decimal'].some(k => type.includes(k))) {
        if (['tien', 'luong', 'gia', 'price', 'cost', 'vnd', 'usd', 'thuong', 'phat', 'doanh_thu'].some(k => name.includes(k))) return 'currency';
        if (['phan_tram', 'rate', 'percent', 'tile'].some(k => name.includes(k))) return 'percent';
        return 'number';
    }

    // 4. NGÀY THÁNG
    if (['date', 'timestamp', 'timestamptz'].some(k => type.includes(k)) || ['ngay', 'date', 'time', 'dob', 'created_at', 'han_chot'].some(k => name.includes(k))) return 'date';

    // 5. LIÊN HỆ
    if (['email', 'mail'].some(k => name.includes(k))) return 'email';
    if (['dien_thoai', 'sdt', 'phone', 'mobile', 'tel', 'hotline'].some(k => name.includes(k))) return 'phone';
    if (['link', 'url', 'website', 'facebook', 'zalo', 'hop_dong', 'file'].some(k => name.includes(k))) return 'link_array';

    // 6. BOOLEAN
    if (type === 'boolean' || name.startsWith('is_') || name.startsWith('co_') || name.startsWith('has_') || name.startsWith('duoc_')) return 'boolean';

    // 7. TEXT AREA
    if (['ghi_chu', 'mo_ta', 'noi_dung', 'content', 'description', 'note'].some(k => name.includes(k))) return 'textarea';

    return 'text';
};