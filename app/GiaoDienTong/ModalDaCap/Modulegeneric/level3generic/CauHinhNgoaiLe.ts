import { Trophy, History } from 'lucide-react';

export const layCauHinhNgoaiLe = (bangDuLieu: string, isCreateMode: boolean) => {
    // 1. Cấu hình Tabs bổ sung (Ngoài tab Thông tin)
    let customTabs: any[] = [];
    
    // Ngoại lệ cho Nhân sự: Thêm tab Thành tích
    if (bangDuLieu === 'nhan_su') {
        customTabs.push({ 
            id: 'thanh_tich', 
            label: 'Thành Tích', 
            icon: Trophy,
            componentName: 'Tab_ThanhTich' // Đánh dấu để render đúng component
        });
    }

    // Tab Nhật ký hoạt động (Mặc định ai cũng có)
    customTabs.push({
        id: 'nhat_ky_hoat_dong',
        label: 'Hoạt Động',
        icon: History,
        componentName: 'Tab_NhatKyHoatDong'
    });

    // 2. Cấu hình bảng truy vấn (View hay Table gốc?)
    const tableToQuery = bangDuLieu === 'nhan_su' ? 'view_nhan_su_thong_ke' : bangDuLieu;

    // 3. Cấu hình các cột cần loại bỏ khi Lưu (Save)
    // (Các cột tính toán trong View không được lưu ngược vào Table)
    let excludeColsOnSave = ['nguoi_tao', 'tao_luc', 'id', 'updated_at'];
    if (bangDuLieu === 'nhan_su') {
        excludeColsOnSave = [...excludeColsOnSave, 'total_khach', 'total_viec', 'total_mau', 'sale_id'];
    }

    // 4. Có hiện nút đăng xuất không?
    const showLogout = bangDuLieu === 'nhan_su';

    return { customTabs, tableToQuery, excludeColsOnSave, showLogout };
};