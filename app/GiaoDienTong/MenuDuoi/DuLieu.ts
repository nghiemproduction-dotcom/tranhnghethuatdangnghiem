import { 
    Building2, 
    Users, 
    ShoppingCart, 
    Hammer, 
    Paintbrush, 
    Briefcase,
    ShieldCheck // 🟢 Thêm icon khiên bảo vệ cho Admin
} from 'lucide-react';

export const kiemTraQuyen = (nguoiDung: any, quyenYeuCau: string[]) => {
    if (!nguoiDung) return false;
    // Admin cấp cao luôn được phép
    const isSuperAdmin = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
    if (isSuperAdmin) return true;

    // Lấy role hiện tại
    const userRole = nguoiDung.role || nguoiDung.chuc_vu || 'khach';
    
    // Nếu user là admin thì vào được hết
    if (userRole === 'admin') return true;

    // Kiểm tra role có nằm trong danh sách cho phép không
    return quyenYeuCau.includes(userRole);
};

export const DANH_SACH_PHONG_BAN = [
    // 🟢 1. THÊM PHÒNG ADMIN VÀO ĐÂY
    {
        id: 'admin',
        ten: 'Phòng Admin',
        moTa: 'Quản trị hệ thống & Cấu hình',
        icon: ShieldCheck,
        mauSac: 'text-red-500', // Màu đỏ quyền lực
        duongDan: '/?portal=admin', // Link kích hoạt modal
        quyenTruyCap: ['admin', 'boss'] // Chỉ admin/boss mới mở được
    },
    // ------------------------------------------------

    {
        id: 'quanly',
        ten: 'Phòng Quản Lý',
        moTa: 'Điều hành & Báo cáo tổng hợp',
        icon: Building2,
        mauSac: 'text-yellow-500',
        duongDan: '/?portal=quanly',
        quyenTruyCap: ['admin', 'quanly', 'boss']
    },
    {
        id: 'sales',
        ten: 'Phòng Sales',
        moTa: 'Kinh doanh & Doanh số',
        icon: ShoppingCart,
        mauSac: 'text-green-500',
        duongDan: '/?portal=sales',
        quyenTruyCap: ['admin', 'quanly', 'sales', 'kinhdoanh']
    },
    {
        id: 'thietke',
        ten: 'Phòng Thiết Kế',
        moTa: 'Sáng tạo Mẫu & Sản phẩm mới',
        icon: Paintbrush,
        mauSac: 'text-pink-500',
        duongDan: '/?portal=thietke',
        quyenTruyCap: ['admin', 'quanly', 'thietke', 'designer']
    },
    {
        id: 'tho',
        ten: 'Phòng Thợ',
        moTa: 'Sản xuất & Thi công dự án',
        icon: Hammer,
        mauSac: 'text-blue-500',
        duongDan: '/?portal=tho',
        quyenTruyCap: ['admin', 'quanly', 'kythuat', 'thosanxuat', 'tho']
    },
    {
        id: 'ctv',
        ten: 'Phòng CTV',
        moTa: 'Cộng tác viên mở rộng',
        icon: Users,
        mauSac: 'text-orange-500',
        duongDan: '/?portal=ctv',
        quyenTruyCap: ['admin', 'quanly', 'congtacvien', 'ctv']
    },
    {
        id: 'parttime',
        ten: 'Phòng Part-time',
        moTa: 'Nhân sự thời vụ',
        icon: Briefcase,
        mauSac: 'text-purple-500',
        duongDan: '/?portal=parttime',
        quyenTruyCap: ['admin', 'quanly', 'parttime', 'thoivu']
    }
];