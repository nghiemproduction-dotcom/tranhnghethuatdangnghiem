import { 
    Building2, 
    Users, 
    ShoppingCart, 
    Hammer, 
    Paintbrush, 
    Briefcase,
    ShieldCheck,
    Palette // <--- Thêm icon này
} from 'lucide-react';

// 🟢 1. HÀM MÁY XAY SINH TỐ (Chuẩn hóa chữ viết)
const chuanHoa = (str: string | null | undefined) => {
    if (!str) return '';
    return str.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") 
              .toLowerCase()                   
              .replace(/[^a-z0-9]/g, "")       
              .trim();
};

// 🟢 2. HÀM KIỂM TRA QUYỀN
export const kiemTraQuyen = (nguoiDung: any, quyenYeuCau: string[]) => {
    if (!nguoiDung) return false;

    const isSuperAdmin = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
    if (isSuperAdmin) return true;

    const rawRole = nguoiDung.vi_tri || nguoiDung.role || nguoiDung.chuc_vu || 'khach';
    const userRoleSlug = chuanHoa(rawRole);

    if (userRoleSlug.includes('admin') || userRoleSlug.includes('boss')) return true;

    return quyenYeuCau.some(q => chuanHoa(q) === userRoleSlug);
};

// 🟢 3. DANH SÁCH PHÒNG BAN
export const DANH_SACH_PHONG_BAN = [
    {
        id: 'admin',
        ten: 'Phòng Admin',
        moTa: 'Quản trị hệ thống & Cấu hình',
        icon: ShieldCheck,
        mauSac: 'text-red-500',
        duongDan: '/?portal=admin',
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
    // 🟢 PHÒNG MỚI THÊM VÀO ĐÂY
    {
        id: 'trungbay',
        ten: 'Phòng Trưng Bày',
        moTa: 'Triển lãm Dự án & Tác phẩm',
        icon: Palette,
        mauSac: 'text-purple-400', 
        duongDan: '/?portal=trungbay',
        // Cho phép nhiều bộ phận vào xem để phối hợp
        quyenTruyCap: ['admin', 'quanly', 'thietke', 'sales', 'kinhdoanh', 'marketing', 'boss']
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