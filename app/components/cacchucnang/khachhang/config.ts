/**
 * ============================================================
 * CHỨC NĂNG: KHÁCH HÀNG
 * Đường dẫn: phongchuan/cacchucnang/khachhang
 * ============================================================
 * 
 * Chức năng quản lý khách hàng dùng chung cho nhiều phòng.
 * Mỗi phòng gọi ra với quyền khác nhau thông qua props.
 * 
 * QUYỀN HẠN:
 * - allowView: Xem danh sách và chi tiết
 * - allowEdit: Sửa thông tin
 * - allowDelete: Xóa khách hàng
 * - allowBulk: Thao tác hàng loạt
 * 
 * SỬ DỤNG:
 * import { KhachHangChucNang } from '@/app/components/cacchucnang/khachhang';
 * <KhachHangChucNang permissions={{ allowDelete: true }} />
 */

import { Phone, Mail, MapPin, User } from 'lucide-react';
import { ManagerConfig, FieldConfig, FilterTabConfig, TabConfig } from '../types';
import { 
    getKhachHangDataAction, 
    createKhachHangAction, 
    updateKhachHangAction, 
    deleteKhachHangAction 
} from '@/app/actions/QuyenHanQuanLy';

// ============================================================
// INTERFACE
// ============================================================

export interface KhachHang {
    id: string;
    ho_ten: string;
    so_dien_thoai?: string;
    email?: string;
    dia_chi?: string;
    phan_loai?: string;
    phan_loai_normalized?: string;
    hinh_anh?: string;
    ghi_chu?: string;
    tong_don_hang?: number;
    tao_luc?: string;
    cap_nhat_luc?: string;
}

export interface KhachHangPermissions {
    allowView?: boolean;
    allowEdit?: boolean;
    allowDelete?: boolean;
    allowBulk?: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

export const PHAN_LOAI_OPTIONS = [
    'Tiềm năng',
    'Mới',
    'Thân thiết',
    'VIP',
    'Không hoạt động',
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
        key: 'so_dien_thoai',
        label: 'Số điện thoại',
        type: 'phone',
        placeholder: '09xxxxxxxxx',
        required: true,
        icon: Phone,
    },
    {
        key: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'email@example.com',
        icon: Mail,
        colSpan: 2,
    },
    {
        key: 'dia_chi',
        label: 'Địa chỉ',
        type: 'textarea',
        placeholder: 'Nhập địa chỉ...',
        icon: MapPin,
        colSpan: 2,
    },
    {
        key: 'phan_loai',
        label: 'Phân loại',
        type: 'select',
        options: PHAN_LOAI_OPTIONS,
    },
    {
        key: 'ghi_chu',
        label: 'Ghi chú',
        type: 'textarea',
        placeholder: 'Ghi chú thêm...',
        colSpan: 2,
    },
];

// ============================================================
// FILTER TABS
// ============================================================

const filterTabs: FilterTabConfig[] = [
    { id: 'tiemnang', label: 'TIỀM NĂNG', filterField: 'phan_loai_normalized' },
    { id: 'moi', label: 'MỚI', filterField: 'phan_loai_normalized' },
    { id: 'thanthiet', label: 'THÂN THIẾT', filterField: 'phan_loai_normalized' },
    { id: 'vip', label: 'VIP', filterField: 'phan_loai_normalized' },
    { id: 'khonghoatdong', label: 'KHÔNG HĐ', filterField: 'phan_loai_normalized' },
];

// ============================================================
// DETAIL TABS
// ============================================================

const detailTabs: TabConfig[] = [
    { id: 'thongtin', label: 'THÔNG TIN' },
    { id: 'donhang', label: 'ĐƠN HÀNG', searchable: true, sortable: true },
    { id: 'ghichu', label: 'GHI CHÚ' },
];

// ============================================================
// DATA SOURCE
// ============================================================

const dataSource = {
    fetchList: async (page: number, limit: number, search: string, filter: string) => {
        const res = await getKhachHangDataAction(page, limit, search, filter);
        return { success: res.success, data: res.data as KhachHang[] | undefined, error: res.error };
    },
    create: async (data: Partial<KhachHang>) => {
        if (data.phan_loai) {
            (data as any).phan_loai_normalized = data.phan_loai.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
        }
        const res = await createKhachHangAction(data as any);
        return { success: res.success, data: (res as any).data as KhachHang, error: res.error };
    },
    update: async (id: string, data: Partial<KhachHang>) => {
        if (data.phan_loai) {
            (data as any).phan_loai_normalized = data.phan_loai.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
        }
        const res = await updateKhachHangAction(id, data as any);
        return { success: res.success, data: (res as any).data as KhachHang, error: res.error };
    },
    delete: async (id: string) => {
        const res = await deleteKhachHangAction(id);
        return { success: res.success, error: res.error };
    },
};

// ============================================================
// CREATE CONFIG FUNCTION
// ============================================================

export function createKhachHangConfig(permissions: KhachHangPermissions = {}): ManagerConfig<KhachHang> {
    const { 
        allowView = true, 
        allowEdit = true, 
        allowDelete = false, 
        allowBulk = false 
    } = permissions;

    return {
        entityName: 'khách hàng',
        entityNamePlural: 'khách hàng',
        idField: 'id',
        fields,
        cardConfig: {
            avatarField: 'hinh_anh',
            titleField: 'ho_ten',
            subtitleField: 'phan_loai',
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
            { key: 'name', label: 'TÊN', sortFn: (a: KhachHang, b: KhachHang) => (a.ho_ten || '').localeCompare(b.ho_ten || '') },
            { key: 'phanloai', label: 'PHÂN LOẠI', sortFn: (a: KhachHang, b: KhachHang) => (a.phan_loai || '').localeCompare(b.phan_loai || '') },
            { key: 'ngay', label: 'NGÀY TẠO', sortFn: (a: KhachHang, b: KhachHang) => new Date(b.tao_luc || 0).getTime() - new Date(a.tao_luc || 0).getTime() },
        ],
        defaultSort: 'name',
        uploadConfig: { bucket: 'avatar', fileNamePrefix: 'kh' },
    };
}
