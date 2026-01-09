// app/actions/index.ts

// --- 1. CORE SYSTEM (Ưu tiên dùng QuyenHanAdmin thay vì admindb cũ) ---
// admindb.ts chứa nhiều hàm trùng với QuyenHanAdmin và QuyenHanQuanLy
// nên ta KHÔNG export * từ nó nữa để tránh lỗi "Duplicate identifier".
// Nếu admindb còn hàm nào đặc biệt chưa chuyển sang QuyenHanAdmin, 
// hãy export thủ công tên hàm đó tại đây (ví dụ: export { hamRieng } from './admindb';)

export * from './NotificationAction';
export * from './QuyenHanAdmin'; // Đã bao gồm các hàm quản lý DB, Table, RLS

// --- 2. CÁC PHÒNG BAN CHỨC NĂNG ---
export * from './QuyenHanBaoCao';
export * from './QuyenHanCTV';
export * from './QuyenHanKeToan';
export * from './QuyenHanKhachVip'; // Đã fix lỗi file rỗng
export * from './QuyenHanKho';
export * from './QuyenHanQuanLy'; // Đã bao gồm: Nhân sự, Khách hàng, Chat (Trùng với admindb cũ)
export * from './QuyenHanSales';
export * from './QuyenHanSanXuat';
export * from './QuyenHanThietKe';