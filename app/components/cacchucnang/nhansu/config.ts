/**
 * ============================================================
 * CHỨC NĂNG: NHÂN SỰ
 * Đường dẫn: phongchuan/cacchucnang/nhansu
 * ============================================================
 * 
 * Chức năng quản lý nhân sự dùng chung cho nhiều phòng.
 * Mỗi phòng gọi ra với quyền khác nhau thông qua props.
 * 
 * QUYỀN HẠN:
 * - allowView: Xem danh sách và chi tiết
 * - allowEdit: Sửa thông tin
 * - allowDelete: Xóa nhân sự
 * - allowBulk: Thao tác hàng loạt
 * 
 * SỬ DỤNG:
 * import { NhanSuChucNang } from '@/app/components/cacchucnang/nhansu';
 * <NhanSuChucNang permissions={{ allowDelete: true }} />
 */

import { Phone, Mail, Banknote, Clock, Percent, ShieldCheck } from 'lucide-react';
import { ManagerConfig, FieldConfig, FilterTabConfig, TabConfig } from '../types';
import { 
    getNhanSuDataAction, 
    createNhanSuAction, 
    updateNhanSuAction, 
    deleteNhanSuAction,
    getDistinctValuesAction 
} from '@/app/actions/QuyenHanQuanLy';

// ============================================================
// INTERFACE
// ============================================================

export interface NhanSu {
    id: string;
    ho_ten: string;
    vi_tri: string;
    vi_tri_normalized: string;
    so_dien_thoai: string;
    email: string;
    hinh_anh?: string;
    trang_thai?: string;
    luong_thang?: number;
    luong_theo_gio?: number;
    thuong_doanh_thu?: number;
    ngan_hang?: string;
    so_tai_khoan?: string;
}

export interface NhanSuPermissions {
    allowView?: boolean;
    allowEdit?: boolean;
    allowDelete?: boolean;
    allowBulk?: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const VN_BANKS = [
    "Vietcombank", "VietinBank", "BIDV", "Agribank", "Techcombank", "MBBank", 
    "ACB", "VPBank", "TPBank", "Sacombank", "HDBank", "VIB", "MSB", "SHB", 
    "SeABank", "OCB", "Eximbank", "LienVietPostBank", "Nam A Bank", "Viet Capital Bank"
];

// ============================================================
// FIELDS CONFIG
// ============================================================

const fields: FieldConfig[] = [
    {
        key: 'hinh_anh',
        label: 'Ảnh đại diện',
        type: 'image',
        showInForm: true,
        showInDetail: false,
        showInCard: true,
    },
    {
        key: 'ho_ten',
        label: 'Họ và Tên',
        type: 'text',
        placeholder: 'Nhập họ tên đầy đủ...',
        required: true,
    },
    {
        key: 'vi_tri',
        label: 'Vị trí / Chức vụ',
        type: 'select-add',
        placeholder: 'Chọn chức vụ...',
        required: true,
        optionsLoader: async () => {
            const res = await getDistinctValuesAction('nhan_su', 'vi_tri');
            return (res.success && res.data) ? res.data as string[] : [];
        },
    },
    {
        key: 'email',
        label: 'Email liên hệ',
        type: 'email',
        placeholder: 'email@example.com',
        required: true,
        icon: Mail,
        colSpan: 2,
    },
    {
        key: 'so_dien_thoai',
        label: 'Số điện thoại',
        type: 'phone',
        placeholder: '09xxxxxxxxx',
        icon: Phone,
    },
    {
        key: 'luong_thang',
        label: 'Lương cứng (VNĐ)',
        type: 'money',
        placeholder: '0',
        icon: Banknote,
        highlight: true,
    },
    {
        key: 'luong_theo_gio',
        label: 'Lương theo giờ',
        type: 'readonly',
        icon: Clock,
        computeFrom: 'luong_thang',
        computeFn: (luongThang: any) => {
            const value = Number(luongThang) || 0;
            if (value <= 0) return '0';
            return Math.round((value / 24 / 8) / 1000) * 1000;
        },
    },
    {
        key: 'thuong_doanh_thu',
        label: 'Thưởng doanh số (%)',
        type: 'percent',
        placeholder: '0 - 30',
        maxValue: 30,
        icon: Percent,
    },
    {
        key: 'ngan_hang',
        label: 'Ngân hàng',
        type: 'select',
        options: VN_BANKS,
        icon: ShieldCheck,
    },
    {
        key: 'so_tai_khoan',
        label: 'Số tài khoản',
        type: 'text',
        placeholder: 'Nhập số tài khoản...',
    },
];

// ============================================================
// FILTER TABS
// ============================================================

const filterTabs: FilterTabConfig[] = [
    { id: 'quanly', label: 'QUẢN LÝ', filterField: 'vi_tri_normalized' },
    { id: 'sales', label: 'SALES', filterField: 'vi_tri_normalized' },
    { id: 'thosanxuat', label: 'THỢ', filterField: 'vi_tri_normalized' },
    { id: 'parttime', label: 'PART-TIME', filterField: 'vi_tri_normalized' },
    { id: 'congtacvien', label: 'CTV', filterField: 'vi_tri_normalized' },
];

// ============================================================
// DETAIL TABS
// ============================================================

const detailTabs: TabConfig[] = [
    { id: 'hoso', label: 'HỒ SƠ' },
    { id: 'muctieu', label: 'MỤC TIÊU', searchable: true, sortable: true, sortOptions: [{ key: 'name', label: 'TÊN' }, { key: 'reward', label: 'THƯỞNG' }], showAddButton: true },
    { id: 'thanhtich', label: 'THÀNH TÍCH', searchable: true },
];

// ============================================================
// DATA SOURCE
// ============================================================

const dataSource = {
    fetchList: async (page: number, limit: number, search: string, filter: string) => {
        const res = await getNhanSuDataAction(page, limit, search, filter);
        return { success: res.success, data: res.data as NhanSu[] | undefined, error: res.error };
    },
    create: async (data: Partial<NhanSu>) => {
        if (data.vi_tri) {
            (data as any).vi_tri_normalized = data.vi_tri.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
        }
        const res = await createNhanSuAction(data as any);
        return { success: res.success, data: (res as any).data as NhanSu, error: res.error };
    },
    update: async (id: string, data: Partial<NhanSu>) => {
        if (data.vi_tri) {
            (data as any).vi_tri_normalized = data.vi_tri.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
        }
        const res = await updateNhanSuAction(id, data as any);
        return { success: res.success, data: (res as any).data as NhanSu, error: res.error };
    },
    delete: async (id: string) => {
        const res = await deleteNhanSuAction(id);
        return { success: res.success, error: res.error };
    },
};

// ============================================================
// CREATE CONFIG FUNCTION
// ============================================================

export function createNhanSuConfig(permissions: NhanSuPermissions = {}): ManagerConfig<NhanSu> {
    const { 
        allowView = true, 
        allowEdit = true, 
        allowDelete = false, 
        allowBulk = false 
    } = permissions;

    return {
        entityName: 'nhân sự',
        entityNamePlural: 'nhân sự',
        idField: 'id',
        fields,
        cardConfig: {
            avatarField: 'hinh_anh',
            titleField: 'ho_ten',
            subtitleField: 'vi_tri',
            infoFields: [{ field: 'so_dien_thoai', icon: Phone }],
        },
        filterTabs,
        detailTabs,
        actions: {
            allowView,
            allowEdit,
            allowDelete,
            allowBulkSelect: allowBulk,
            allowBulkDelete: allowBulk && allowDelete,
        },
        dataSource,
        searchFields: ['ho_ten', 'so_dien_thoai', 'email'],
        sortOptions: [
            { key: 'name', label: 'TÊN', sortFn: (a: NhanSu, b: NhanSu) => a.ho_ten.localeCompare(b.ho_ten) },
            { key: 'vitri', label: 'VỊ TRÍ', sortFn: (a: NhanSu, b: NhanSu) => (a.vi_tri || '').localeCompare(b.vi_tri || '') },
            { key: 'luong', label: 'LƯƠNG', sortFn: (a: NhanSu, b: NhanSu) => (b.luong_thang || 0) - (a.luong_thang || 0) },
        ],
        defaultSort: 'name',
        uploadConfig: { bucket: 'avatar', fileNamePrefix: 'ns' },
    };
}
