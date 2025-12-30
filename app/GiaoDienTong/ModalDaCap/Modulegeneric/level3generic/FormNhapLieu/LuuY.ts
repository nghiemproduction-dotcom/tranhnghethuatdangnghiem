// 🟢 FILE CẤU HÌNH LOGIC NGHIỆP VỤ (BUSINESS LOGIC)
// Tại đây định nghĩa mọi quy tắc ứng xử cho FormGeneric

export const CAU_HINH_LUU_Y: Record<string, Record<string, any>> = {
    // 🟢 BẢNG NHÂN SỰ
    'nhan_su': {
        // Cấu hình Vị trí: Gợi ý + Nhập mới
        'vi_tri': {
            kieuNhap: 'goi_y_tu_du_lieu_cu', 
            choPhepTaoMoi: true,
            tieuDe: 'Chọn hoặc nhập vị trí'
        },
        'chuc_vu': {
            kieuNhap: 'goi_y_tu_du_lieu_cu',
            choPhepTaoMoi: true
        },
        // Trạng thái giống vị trí
        'trang_thai': {
            kieuNhap: 'goi_y_tu_du_lieu_cu',
            choPhepTaoMoi: true
        },
        // Cột Lương: Tự động tính -> Khóa & Không gửi lên Server
        'luong_theo_gio': {
            readOnly: true, 
            khongLuu: true, // 🛑 QUAN TRỌNG: FormGeneric sẽ đọc cờ này để xóa field trước khi save
            ghiChu: 'Hệ thống tự tính toán'
        },
        // Cột ID: Chỉ hiển thị, không sửa
        'id': {
            readOnly: true,
            hienThi: true // Vẫn hiện nhưng mờ
        },
        // Cột Người tạo: Xử lý đặc biệt trong FormGeneric (hiển thị tên)
        'nguoi_tao': {
            readOnly: true,
            khongLuu: false // FormGeneric sẽ tự xử lý logic gán ID người dùng hiện tại
        }
    },
    
    // Bảng Tác Phẩm
    'tac_pham': {
        'chat_lieu': {
            kieuNhap: 'goi_y_tu_du_lieu_cu',
            choPhepTaoMoi: true
        }
    }
};