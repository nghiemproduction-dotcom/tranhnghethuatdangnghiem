"use client";

// 1. Import Types
import { Phone, Mail, Banknote, Clock, Percent, ShieldCheck, User } from 'lucide-react';
import { FieldConfig, ListTabDef, DetailTabDef } from "@/app/types/core"; 

import { 
    getNhanSuList, 
    createNhanSu, 
    updateNhanSu, 
    deleteNhanSu,
    getDistinctViTri,
    // Import NhanSu từ DAL
    NhanSu as NhanSuDAL // Đổi tên tạm để extend
} from './dal';

// 🟢 CẬP NHẬT INTERFACE: Đồng bộ với DB
export interface NhanSu extends Omit<NhanSuDAL, 'vi_tri'> {
    phan_loai?: string; // Sửa tên cột cho đúng DB
    // Các trường khác giữ nguyên từ DAL
}

export interface NhanSuPermissions {
    allowView?: boolean;
    allowEdit?: boolean;
    allowDelete?: boolean;
    allowBulk?: boolean;
}

// 2. Constants
const VN_BANKS = [
    "Vietcombank", "VietinBank", "BIDV", "Agribank", "Techcombank", "MBBank", 
    "ACB", "VPBank", "TPBank", "Sacombank", "HDBank", "VIB", "MSB", "SHB", 
    "SeABank", "OCB", "Eximbank", "LienVietPostBank", "Nam A Bank", "Viet Capital Bank"
];

// 🟢 GENERIC HELPER
function createField(
    key: keyof NhanSu, 
    label: string, 
    type: FieldConfig['type'], 
    options: Partial<FieldConfig> = {}
): FieldConfig {
    return {
        key: key as string,
        label,
        type,
        showInList: true, 
        showInForm: true,
        showInDetail: true,
        ...options 
    };
}

// 3. CẤU HÌNH FIELDS
const fields: FieldConfig[] = [
    createField('hinh_anh', 'Ảnh đại diện', 'image', { 
        showInDetail: false 
    }),
    
    createField('ho_ten', 'Họ và Tên', 'text', { 
        required: true, 
        placeholder: 'Nhập họ tên đầy đủ...' 
    }),

    // 🔴 SỬA Ở ĐÂY: Đổi key 'vi_tri' thành 'phan_loai'
    createField('phan_loai', 'Vị trí / Chức vụ', 'select-add', {
        required: true,
        placeholder: 'Chọn chức vụ...',
        optionsLoader: async () => {
            const res = await getDistinctViTri(); // Đảm bảo hàm này trả về list string các chức vụ
            return (res.success && Array.isArray(res.data)) ? res.data : [];
        }
    }),

    createField('email', 'Email liên hệ', 'email', { 
        required: true, 
        colSpan: 2, 
        placeholder: 'email@example.com' 
    }),

    createField('so_dien_thoai', 'Điện thoại', 'phone', { 
        placeholder: '09xxxxxxxxx' 
    }),

    createField('luong_thang', 'Lương cứng', 'money', { 
        highlight: true, 
        placeholder: '0' 
    }),

    createField('luong_theo_gio', 'Lương theo giờ', 'readonly', {
        showInList: false, 
        computeFrom: 'luong_thang',
        computeFn: (luongThang: any) => {
            const value = Number(luongThang) || 0;
            if (value <= 0) return '0';
            return Math.round((value / 24 / 8) / 1000) * 1000;
        },
    }),

    createField('thuong_doanh_thu', 'Thưởng doanh số (%)', 'percent', {
        placeholder: '0 - 30',
        maxValue: 30
    }),

    createField('ngan_hang', 'Ngân hàng', 'select', {
        showInList: false,
        options: VN_BANKS.map(b => ({ value: b, label: b }))
    }),

    createField('so_tai_khoan', 'Số tài khoản', 'text', {
        showInList: false,
        placeholder: 'Nhập số tài khoản...'
    }),
];

// 4. CẤU HÌNH TABS (Sửa lại filterField cho đúng cột DB)
// Lưu ý: matchValue phải khớp với dữ liệu thực tế trong cột phan_loai
const filterTabs: ListTabDef[] = [
    { id: 'all', label: 'TẤT CẢ' },
    { id: 'quanly', label: 'QUẢN LÝ', filterField: 'phan_loai', matchValue: 'Quản lý' }, 
    { id: 'sales', label: 'SALES', filterField: 'phan_loai', matchValue: 'Sales' },
    { id: 'thosanxuat', label: 'THỢ', filterField: 'phan_loai', matchValue: 'Thợ sản xuất' },
    // Nếu DB lưu là 'admin', 'sales'... thì sửa matchValue lại cho khớp
];

const detailTabs: DetailTabDef[] = [
    { 
        id: 'hoso', 
        label: 'HỒ SƠ', 
        icon: User,
        // Sửa vi_tri -> phan_loai trong checkFields
        checkFields: ['email', 'so_dien_thoai', 'phan_loai', 'luong_thang', 'ngan_hang']
    },
    { id: 'chamcong', label: 'CHẤM CÔNG', icon: Clock },
    { id: 'tinhluong', label: 'TÍNH LƯƠNG', icon: Banknote },
];

// ... (DataSource giữ nguyên, chỉ cần đảm bảo API trả về đúng cột phan_loai)
const dataSource = {
    fetchList: async (page: number, limit: number, search: string, filter: string) => {
        const data = await getNhanSuList(page, limit, search, filter);
        return { success: true, data: data, error: null };
    },
    create: async (data: Partial<NhanSu>) => {
        const res = await createNhanSu(data);
        return { success: res.success, data: res.data as any, error: res.error || null };
    },
    update: async (id: string, data: Partial<NhanSu>) => {
        const res = await updateNhanSu(id, data);
        return { success: res.success, data: res.data as any, error: res.error || null };
    },
    delete: async (id: string) => {
        const res = await deleteNhanSu(id);
        return { success: res.success, error: res.error || null };
    },
};

// 5. Factory Function Main
export function createNhanSuConfig(permissions: NhanSuPermissions = {}): any {
    const { allowView = true, allowEdit = true, allowDelete = false, allowBulk = false } = permissions;

    return {
        entityName: 'nhân sự',
        entityNamePlural: 'nhân sự',
        idField: 'id',
        fields, 
        filterTabs,
        detailTabs,
        actions: { allowView, allowEdit, allowDelete, allowBulkSelect: allowBulk, allowBulkDelete: allowBulk && allowDelete },
        dataSource,
        searchFields: ['ho_ten', 'so_dien_thoai', 'email'],
        sortOptions: [
            { key: 'name', label: 'TÊN' },
            { key: 'vitri', label: 'VỊ TRÍ' },
        ],
        defaultSort: 'name',
        uploadConfig: { bucket: 'avatar', fileNamePrefix: 'ns' },
    };
}