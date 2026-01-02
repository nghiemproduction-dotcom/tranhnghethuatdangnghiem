/**
 * ============================================================
 * CÁC CHỨC NĂNG - PHÒNG CHUẨN
 * ============================================================
 *
 * Thư mục chứa tất cả các chức năng dùng chung.
 * Mỗi chức năng nằm trong 1 folder riêng.
 *
 * CẤU TRÚC:
 * cacchucnang/
 * ├── nhansu/          - Quản lý nhân sự
 * ├── khachhang/       - Quản lý khách hàng (TODO)
 * ├── donhang/         - Quản lý đơn hàng (TODO)
 * ├── vattu/           - Quản lý vật tư kho (TODO)
 * └── thuchi/          - Quản lý thu chi (TODO)
 *
 * CÁCH SỬ DỤNG:
 * import { NhanSuChucNang } from '@/app/components/cacchucnang';
 */

// Nhân sự
export {
  NhanSuChucNang,
  createNhanSuConfig,
  type NhanSu,
  type NhanSuPermissions,
} from "./nhansu";

// TODO: Thêm các chức năng khác
// export { KhachHangChucNang } from './khachhang';
// export { DonHangChucNang } from './donhang';
// export { VatTuChucNang } from './vattu';
// export { ThuChiChucNang } from './thuchi';
export { MauThietKeChucNang } from "./mauthietke";
