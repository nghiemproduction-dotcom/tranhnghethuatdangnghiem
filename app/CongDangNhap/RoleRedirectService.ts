import { supabase } from '@/app/ThuVien/ketNoiSupabase';

// Hàm chuẩn hóa chuỗi
const normalizeString = (str: string | null | undefined): string => {
    if (!str) return '';
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
};

// 🟢 CẤU HÌNH DỰ PHÒNG (Khớp 100% với file CSV routing_permissions)
// Giúp hệ thống vẫn chạy ngon kể cả khi Database bị chặn quyền đọc
const FALLBACK_ROUTES: Record<string, string> = {
    // Nhóm Quản Trị
    'admin': '/phongadmin',
    'boss': '/phongadmin',
    'quanly': '/phongquanly',
    
    // Nhóm Nghiệp Vụ
    'sales': '/phongsales',
    'ketoan': '/phongketoan',   // ✅ Mới: Kế toán
    'thukho': '/phongkho',      // ✅ Mới: Thủ kho
    
    // Nhóm Sản Xuất
    'congtacvien': '/phongctv',
    'ctv': '/phongctv',
    'parttime': '/phongparttime',
    'thosanxuat': '/phongtho',
    'tho': '/phongtho',
    'kythuat': '/phongtho',
    'thietke': '/phongthietke',
    
    // Nhóm Khách hàng
    'vip': '/trangchu',
    'doitac': '/trangchu',
    'moi': '/trangchu',
    'damuahang': '/trangchu',
    'khtrongtam': '/trangchu',
    'khach': '/trangchu'
};

const FALLBACK_ALLOWED_ROUTES: Record<string, string[]> = {
    // Admin & Boss: Full quyền
    'admin': ['/phongadmin', '/phongquanly', '/phongkho', '/phongketoan', '/phongsales', '/phongparttime', '/phongctv', '/phongthietke', '/dashboard', '/settings'],
    'boss': ['/phongadmin', '/phongquanly', '/phongkho', '/phongketoan', '/phongsales', '/phongparttime', '/phongctv', '/phongthietke', '/dashboard', '/settings'],
    
    // Quản lý: Được xem Kho, Kế toán để duyệt
    'quanly': ['/phongquanly', '/phongkho', '/phongketoan', '/dashboard'],
    
    // Nghiệp vụ cụ thể
    'sales': ['/phongsales', '/dathang', '/phongkho'], // ✅ Sales được xem kho để báo khách
    'ketoan': ['/phongketoan', '/dashboard'],          // ✅ Mới
    'thukho': ['/phongkho', '/dashboard'],             // ✅ Mới
    
    // Sản xuất
    'parttime': ['/phongparttime'],
    'thosanxuat': ['/phongtho'],
    'congtacvien': ['/phongctv'],
    'thietke': ['/phongthietke'],
    
    // Khách hàng
    'khach': ['/trangchu', '/dathang', '/giohang']
};

export class RoleRedirectService {

    // ============================================================
    // 1. LOGIC ĐIỀU HƯỚNG (ƯU TIÊN DB -> DỰ PHÒNG SAU)
    // ============================================================

    static async getRedirectUrl(
        userType: string, 
        roleNormalized: string
    ): Promise<string> {
        try {
            const p_role = normalizeString(roleNormalized);

            // 1. Thử đọc từ Database
            const { data, error } = await supabase
                .from('routing_permissions')
                .select('default_route')
                .eq('user_type', userType)
                .eq('role_normalized', p_role)
                .maybeSingle();

            if (!error && data && data.default_route) {
                return data.default_route;
            }

            // 2. Nếu lỗi hoặc không tìm thấy -> Dùng chế độ DỰ PHÒNG
            // Điều này phá vỡ vòng lặp vô tận khi DB bị lỗi
            if (FALLBACK_ROUTES[p_role]) {
                console.log(`⚠️ Dùng Fallback Route cho ${p_role}: ${FALLBACK_ROUTES[p_role]}`);
                return FALLBACK_ROUTES[p_role];
            }

            // 3. Đường cùng (Mặc định an toàn để không về trang chủ nếu là nhân sự)
            return userType === 'nhan_su' ? '/phongparttime' : '/trangchu';

        } catch (err) {
            console.error('RoleRedirectService Error:', err);
            return '/';
        }
    }

    // ============================================================
    // 2. CHECK QUYỀN TRUY CẬP (DB -> DỰ PHÒNG)
    // ============================================================

    static async isRouteAllowed(
        userType: string, 
        roleNormalized: string, 
        route: string
    ): Promise<boolean> {
        try {
            const p_role = normalizeString(roleNormalized);
            const cleanRoute = route.split('?')[0];

            // Admin luôn được đi mọi nơi
            if (p_role === 'admin' || p_role === 'boss') return true;

            // 1. Thử đọc DB
            const { data, error } = await supabase
                .from('routing_permissions')
                .select('allowed_routes')
                .eq('user_type', userType)
                .eq('role_normalized', p_role)
                .maybeSingle();

            let allowedRoutes: string[] = [];

            if (!error && data && data.allowed_routes) {
                if (Array.isArray(data.allowed_routes)) {
                    allowedRoutes = data.allowed_routes;
                } else if (typeof data.allowed_routes === 'string') {
                    try { allowedRoutes = JSON.parse(data.allowed_routes); } catch {}
                }
            } else {
                // 2. Dùng Dự phòng
                allowedRoutes = FALLBACK_ALLOWED_ROUTES[p_role] || FALLBACK_ALLOWED_ROUTES['khach'];
            }

            // Logic khớp route
            const isAllowed = allowedRoutes.some((r: string) => {
                return cleanRoute === r || cleanRoute.startsWith(r + '/');
            });

            return isAllowed;

        } catch (err) {
            console.error('Permission Check Error:', err);
            return false;
        }
    }

    // ============================================================
    // 3. UI HELPERS (Giữ nguyên)
    // ============================================================

    static isHRAdmin(viTriNormalized: string | null | undefined): boolean {
        if (!viTriNormalized) return false;
        const role = normalizeString(viTriNormalized);
        return ['admin', 'quanly', 'boss', 'sep', 'manager'].includes(role);
    }

    static getModalIdFromPosition(viTriNormalized: string | null | undefined): string | null {
        if (!viTriNormalized) return null;
        const role = normalizeString(viTriNormalized);
        
        const map: Record<string, string> = {
            'admin': 'admin',
            'quanly': 'quanly',
            'boss': 'quanly',
            'sales': 'sales',
            'ketoan': 'ketoan', // ✅ Mới
            'thukho': 'thukho', // ✅ Mới
            'thosanxuat': 'tho',
            'tho': 'tho',
            'kythuat': 'tho',
            'thietke': 'thietke',
            'parttime': 'parttime',
            'thoivu': 'parttime',
            'congtacvien': 'ctv',
            'ctv': 'ctv',
            'khtrongtam': 'trungbay',
            'vip': 'trungbay'
        };
        
        return map[role] || null;
    }

    static getModalDisplayName(viTriNormalized: string | null | undefined): string | null {
        if (!viTriNormalized) return null;
        const role = normalizeString(viTriNormalized);
        
        const map: Record<string, string> = {
            'admin': 'Phòng Admin',
            'quanly': 'Phòng Quản Lý',
            'sales': 'Phòng Sales',
            'ketoan': 'Phòng Kế Toán', // ✅ Mới
            'thukho': 'Kho Tổng',      // ✅ Mới
            'thosanxuat': 'Phòng Thợ',
            'thietke': 'Phòng Thiết Kế',
            'parttime': 'Phòng Part-time',
            'congtacvien': 'Phòng CTV',
            'khtrongtam': 'Phòng Trưng Bày',
            'vip': 'Phòng VIP'
        };
        
        if (!map[role]) {
            return `Phòng ${role.charAt(0).toUpperCase() + role.slice(1)}`;
        }

        return map[role];
    }
}

// Export lẻ
export const getRedirectUrl = RoleRedirectService.getRedirectUrl;
export const isRouteAllowed = RoleRedirectService.isRouteAllowed;
export const isHRAdmin = RoleRedirectService.isHRAdmin;
export const getModalIdFromPosition = RoleRedirectService.getModalIdFromPosition;
export const getModalDisplayName = RoleRedirectService.getModalDisplayName;