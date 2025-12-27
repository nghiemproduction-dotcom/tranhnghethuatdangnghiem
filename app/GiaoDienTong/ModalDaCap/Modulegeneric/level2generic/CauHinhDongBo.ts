import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

export interface SyncConfig {
    visible: boolean;
    label: string;
    tooltip: string;
    rpcFunc: string;
}

export const layCauHinhDongBo = (config: ModuleConfig): SyncConfig => {
    switch (config.bangDuLieu) {
        case 'nhan_su':
            return {
                visible: true,
                label: 'Cấp User NV',
                tooltip: 'Tạo tài khoản đăng nhập cho Nhân sự',
                rpcFunc: 'sync_users_to_auth'
            };
        case 'khach_hang':
            return {
                visible: true,
                label: 'Cấp User KH',
                tooltip: 'Tạo tài khoản đăng nhập cho Khách hàng (Pass: SĐT)',
                rpcFunc: 'sync_customers_to_auth'
            };
        default:
            return { visible: false, label: '', tooltip: '', rpcFunc: '' };
    }
};