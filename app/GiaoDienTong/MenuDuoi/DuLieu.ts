import { 
    Building2, 
    Users, 
    ShoppingCart, 
    Hammer, 
    Paintbrush, 
    Briefcase,
    ShieldCheck
} from 'lucide-react';

// 🟢 1. HÀM MÁY XAY SINH TỐ (Chuẩn hóa chữ viết)
// Biến "  Quản Lý  " -> "quanly"
// Biến "Admin" -> "admin"
const chuanHoa = (str: string | null | undefined) => {
    if (!str) return '';
    return str.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
              .toLowerCase()                   // Chuyển thành chữ thường
              .replace(/[^a-z0-9]/g, "")       // Xóa hết ký tự lạ và khoảng trắng
              .trim();
};

// 🟢 2. HÀM KIỂM TRA QUYỀN (THÔNG MINH HƠN)
export const kiemTraQuyen = (nguoiDung: any, quyenYeuCau: string[]) => {
    if (!nguoiDung) return false;

    // Admin cấp cao (được cài cứng trong LocalStorage) luôn được phép
    const isSuperAdmin = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
    if (isSuperAdmin) return true;

    // Lấy vị trí từ Database (Cột vi_tri hoặc role)
    const rawRole = nguoiDung.vi_tri || nguoiDung.role || nguoiDung.chuc_vu || 'khach';
    
    // Chuẩn hóa role của người dùng hiện tại
    const userRoleSlug = chuanHoa(rawRole);

    // Nếu user là "admin" hoặc "boss" -> Vào được hết
    if (userRoleSlug.includes('admin') || userRoleSlug.includes('boss')) return true;

    // Chuẩn hóa danh sách quyền yêu cầu và so sánh
    // Ví dụ: quyenYeuCau = ['Quản Lý', 'Sales'] -> ['quanly', 'sales']
    // User là "  Quản   Lý " -> "quanly" -> KHỚP -> CHO VÀO
    return quyenYeuCau.some(q => chuanHoa(q) === userRoleSlug);
};

// 🟢 3. DANH SÁCH PHÒNG BAN (CẤU HÌNH CỨNG TẠI ĐÂY)
export const DANH_SACH_PHONG_BAN = [
    {
        id: 'admin',
        ten: 'Phòng Admin',
        moTa: 'Quản trị hệ thống & Cấu hình',
        icon: ShieldCheck,
        mauSac: 'text-red-500',
        duongDan: '/?portal=admin',
        // Mày viết kiểu gì cũng được, miễn sao đọc lên nghe giống nhau là nó hiểu
        quyenTruyCap: ['admin', 'boss', 'sep', 'chu tich'] 
    },
    {
        id: 'quanly',
        ten: 'Phòng Quản Lý',
        moTa: 'Điều hành & Báo cáo tổng hợp',
        icon: Building2,
        mauSac: 'text-yellow-500',
        duongDan: '/?portal=quanly',
        quyenTruyCap: ['admin', 'quanly', 'manager', 'giam doc', 'pho giam doc']
    },
    {
        id: 'sales',
        ten: 'Phòng Sales',
        moTa: 'Kinh doanh & Doanh số',
        icon: ShoppingCart,
        mauSac: 'text-green-500',
        duongDan: '/?portal=sales',
        quyenTruyCap: ['admin', 'quanly', 'sales', 'kinhdoanh', 'ban hang', 'cskh']
    },
    {
        id: 'thietke',
        ten: 'Phòng Thiết Kế',
        moTa: 'Sáng tạo Mẫu & Sản phẩm mới',
        icon: Paintbrush,
        mauSac: 'text-pink-500',
        duongDan: '/?portal=thietke',
        quyenTruyCap: ['admin', 'quanly', 'thietke', 'designer', 'hoa si']
    },
    {
        id: 'tho',
        ten: 'Phòng Thợ',
        moTa: 'Sản xuất & Thi công dự án',
        icon: Hammer,
        mauSac: 'text-blue-500',
        duongDan: '/?portal=tho',
        quyenTruyCap: ['admin', 'quanly', 'kythuat', 'thosanxuat', 'tho', 'lap dat']
    },
    {
        id: 'ctv',
        ten: 'Phòng CTV',
        moTa: 'Cộng tác viên mở rộng',
        icon: Users,
        mauSac: 'text-orange-500',
        duongDan: '/?portal=ctv',
        quyenTruyCap: ['admin', 'quanly', 'congtacvien', 'ctv', 'doi tac']
    },
    {
        id: 'parttime',
        ten: 'Phòng Part-time',
        moTa: 'Nhân sự thời vụ',
        icon: Briefcase,
        mauSac: 'text-purple-500',
        duongDan: '/?portal=parttime',
        quyenTruyCap: ['admin', 'quanly', 'parttime', 'thoivu', 'sinh vien']
    }
];