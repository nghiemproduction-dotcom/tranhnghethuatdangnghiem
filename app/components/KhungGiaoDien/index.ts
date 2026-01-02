/**
 * ============================================================
 * KHUNG GIAO DIỆN
 * ============================================================
 * 
 * Bộ khung UI chuẩn cho toàn bộ ứng dụng.
 * Tất cả đều là INLINE PANEL (không phải modal popup).
 * 
 * COMPONENTS:
 * - KhungDanhSach: Tab bar ngang + Cards + Search/Sort/Bulk
 * - KhungChiTiet: Tab bar ngang + Chi tiết inline
 * - KhungForm: Tab bar ngang + Form inline
 * 
 * STYLE CHUNG:
 * - Tab bar: h-[40px], bg-[#0a0a0a], border-b border-white/5
 * - Tabs: px-2 py-1, text-[10px] font-bold uppercase
 * - Actions: shrink-0 border-l, icon buttons p-1.5
 * 
 * SỬ DỤNG:
 * import { KhungDanhSach, KhungChiTiet, KhungForm } from '@/app/components/KhungGiaoDien';
 */

export { default as KhungDanhSach } from './KhungDanhSach';
export { default as KhungChiTiet } from './KhungChiTiet';
export { default as KhungForm } from './KhungForm';

// Export types
export type { KhungDanhSachProps, TabItem as DanhSachTabItem, SortOption, BulkAction } from './KhungDanhSach';
export type { KhungChiTietProps, TabItem as ChiTietTabItem } from './KhungChiTiet';
export type { KhungFormProps } from './KhungForm';