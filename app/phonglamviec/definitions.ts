// app/phonglamviec/definitions.ts

// 1. Dữ liệu thô từ Database (Khớp 100% với bảng DB)
export type PhongRaw = {
  id: string
  tao_luc: string
  ten_phong: string
  trang_thai: 'hoat_dong' | 'bao_tri' | 'trong'
  loai_phong: string
  user_id: string       // ⚠️ Nhạy cảm: ID người tạo
  metadata: any         // ⚠️ Rác: Dữ liệu hệ thống
}

// 2. DTO: Dữ liệu sạch sẽ hiển thị lên UI
// 🛡️ Tiêu chuẩn 4: Lọc bỏ user_id, metadata
export type PhongDTO = {
  id: string
  ten: string
  trangThai: string
  loai: string
  ngayTao: string
}

// 3. Mapper Function: Chuyển Raw -> DTO
export function toPhongDTO(record: PhongRaw): PhongDTO {
  return {
    id: record.id,
    ten: record.ten_phong,
    // Format dữ liệu ngay tại đây
    trangThai: record.trang_thai === 'hoat_dong' ? 'Hoạt động' : 
               record.trang_thai === 'bao_tri' ? 'Bảo trì' : 'Trống',
    loai: record.loai_phong?.toUpperCase() || 'THƯỜNG',
    ngayTao: new Date(record.tao_luc).toLocaleDateString('vi-VN')
  }
}