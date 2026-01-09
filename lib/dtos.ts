import { DataNormalizer } from './DataNormalizer';

// ==========================================
// 1. DTO NHÂN SỰ (ĐÃ SỬA MAPPING CHO KHỚP DB MỚI)
// ==========================================
export interface NhanSuDTO {
  id: string;
  ho_ten: string;
  email: string;
  so_dien_thoai: string;
  vi_tri: string;      // Tên hiển thị (VD: Quản trị viên)
  vi_tri_code: string; // Mã code (VD: admin) - Quan trọng để phân quyền
  hinh_anh: string;
  trang_thai: string;
  ngan_hang: string;
  so_tai_khoan: string;
  ngay_tham_gia: string;
  diem_cong_hien: number;
  cap_bac: string;
  madangnhap?: string; // Thêm field này nếu cần hiển thị
}

export function toNhanSuDTO(record: any): NhanSuDTO {
  if (!record) return { 
    id: "", ho_ten: "Không rõ", email: "", so_dien_thoai: "", 
    vi_tri: "", vi_tri_code: "", hinh_anh: "", trang_thai: "off",
    ngan_hang: "", so_tai_khoan: "", ngay_tham_gia: "",
    diem_cong_hien: 0, cap_bac: ""
  };
  
  // LOGIC MAP TỪ DATABASE MỚI SANG FRONTEND CŨ
  const mapViTri: Record<string, string> = {
    'admin': 'Quản trị viên',
    'quanly': 'Quản lý',
    'sales': 'Nhân viên Kinh doanh',
    'thosanxuat': 'Thợ sản xuất',
    'thietke': 'Thiết kế viên',
    'ke_toan': 'Kế toán',
    'kho': 'Thủ kho',
    'parttime': 'Cộng tác viên'
  };

  // Lấy code từ DB, fallback về 'nhanvien' nếu không có
  const code = record.phan_loai || "nhanvien";
  // Lấy tên hiển thị từ map, fallback về 'Nhân viên'
  const tenViTri = mapViTri[code] || "Nhân viên";

  return {
    id: record.id,
    ho_ten: record.ho_ten || "Chưa đặt tên",
    email: record.email || "",
    so_dien_thoai: String(record.so_dien_thoai || ""),
    
    // Mapping quan trọng nhất
    vi_tri: tenViTri,
    vi_tri_code: code,
    
    hinh_anh: record.hinh_anh || "/default-avatar.png",
    trang_thai: record.trang_thai || "dang_lam_viec",
    
    ngan_hang: record.ngan_hang || "",
    so_tai_khoan: record.so_tai_khoan || "",
    
    // Map created_at -> ngay_tham_gia
    ngay_tham_gia: record.created_at || new Date().toISOString(),
    
    diem_cong_hien: record.diem_cong_hien || 0,
    cap_bac: record.cap_bac_game || "Học việc",
    madangnhap: record.madangnhap // Optional
  };
}

// ==========================================
// 2. DTO VẬT TƯ
// ==========================================
export interface VatTuDTO {
  id: number;
  ma_sku: string;
  ten_vat_tu: string;
  loai_vat_tu: string;
  bo_suu_tap: string;
  hinh_anh: string;
  don_vi_tinh: string;
  gia_ban: number;
  ton_kho: number;
  canh_bao_toi_thieu: number;
  thong_so: any;
}

export function toVatTuDTO(record: any): VatTuDTO {
  if (!record) return {} as VatTuDTO;

  return {
    id: Number(record.id),
    ma_sku: record.ma_sku || "NO-SKU",
    ten_vat_tu: record.ten_vat_tu || "Vật tư không tên",
    loai_vat_tu: record.loai_vat_tu || "thanh_pham",
    bo_suu_tap: record.bo_suu_tap || "Chưa phân loại",
    hinh_anh: record.hinh_anh || "/no-image.png",
    don_vi_tinh: record.don_vi_tinh || "cái",
    gia_ban: Number(record.gia_ban) || 0,
    ton_kho: Number(record.ton_kho) || 0,
    canh_bao_toi_thieu: Number(record.canh_bao_toi_thieu) || 0,
    thong_so: record.metadata || {}, 
  };
}

// ==========================================
// 3. DTO VIỆC MẪU
// ==========================================
export interface ViecMauDTO {
  id: string;
  mo_ta: string;
  hinh_anh: string;
  nguoi_tao_id: string;
  nguoi_tao: string; 
  phan_loai: string;
  phan_loai_code: string;
  tao_luc: string;
}

export function toViecMauDTO(record: any): ViecMauDTO {
  if (!record) return {} as ViecMauDTO;

  return {
    id: String(record.id),
    mo_ta: record.mo_ta || "Không có mô tả",
    hinh_anh: record.hinh_anh || "",
    nguoi_tao_id: record.nguoi_tao || "",
    nguoi_tao: record.nhan_su?.ho_ten || "Ẩn danh", 
    phan_loai: record.phan_loai || "Chung",
    phan_loai_code: record.phan_loai_normalized || "chung",
    tao_luc: record.tao_luc,
  };
}

// ==========================================
// 4. DTO QUY TRÌNH
// ==========================================
export interface QuyTrinhDTO {
  id: string;
  ten_mau: string;
  hinh_anh_mau: string;
  kich_thuoc: string;
  chat_lieu: string;
  ky_thuat: string;
  nguoi_tao: string;
  tao_luc: string;
}

export function toQuyTrinhDTO(record: any): QuyTrinhDTO {
  if (!record) return {} as QuyTrinhDTO;
  
  const tp = record.tac_pham_trung_bay || {};
  const mtk = tp.mau_thiet_ke || {};

  return {
    id: record.id,
    ten_mau: mtk.mo_ta || "Quy trình mẫu",
    hinh_anh_mau: mtk.hinh_anh || "",
    kich_thuoc: tp.kich_thuoc || "",
    chat_lieu: tp.chat_lieu || "",
    ky_thuat: tp.ky_thuat_thuc_hien || "",
    nguoi_tao: record.nhan_su?.ho_ten || "Admin",
    tao_luc: record.tao_luc
  };
}

// ==========================================
// 5. DTO KHÁCH HÀNG
// ==========================================
export interface KhachHangDTO {
  id: string;
  ten_khach_hang: string;
  so_dien_thoai: string;
  email: string;
  dia_chi: string;
  hinh_anh: string;
  phan_loai: string;
  phan_loai_code: string;
  tong_chi_tieu: number;
  hang_thanh_vien: string;
}

export function toKhachHangDTO(record: any): KhachHangDTO {
  if (!record) return {} as KhachHangDTO;
  return {
    id: record.id,
    ten_khach_hang: record.ho_ten || "Khách vãng lai",
    so_dien_thoai: record.so_dien_thoai || "",
    email: record.email || "",
    dia_chi: record.dia_chi || "",
    hinh_anh: record.hinh_anh || "",
    phan_loai: record.phan_loai || "Mới",
    phan_loai_code: record.phan_loai_normalized || "moi",
    tong_chi_tieu: Number(record.tong_chi_tieu_tich_luy) || 0,
    hang_thanh_vien: record.hang_thanh_vien || "Newbie"
  };
}

// ==========================================
// 6. DTO MẪU THIẾT KẾ
// ==========================================
export interface MauThietKeDTO {
  id: string;
  ten_mau: string;
  hinh_anh: string;
  phan_loai: string;
  file_thiet_ke: string[];
  nguoi_tao_ten: string;
  tao_luc: string;
}

export function toMauThietKeDTO(record: any): MauThietKeDTO {
  if (!record) return {} as MauThietKeDTO;
  
  let files: string[] = [];
  if (Array.isArray(record.file_thiet_ke)) {
    files = record.file_thiet_ke;
  } else if (typeof record.file_thiet_ke === 'string') {
    try { files = JSON.parse(record.file_thiet_ke); } catch {}
  }

  return {
    id: record.id,
    ten_mau: record.mo_ta || "Mẫu chưa đặt tên", 
    hinh_anh: record.hinh_anh || "",
    phan_loai: record.phan_loai || "Chưa phân loại",
    file_thiet_ke: files,
    nguoi_tao_ten: record.nhan_su?.ho_ten || "Thiết kế viên",
    tao_luc: record.tao_luc,
  };
}

// ==========================================
// 7. DTO TÁC PHẨM TRƯNG BÀY
// ==========================================
export interface TacPhamTrungBayDTO {
  id: string;
  ten_tac_pham: string;
  hinh_anh: string;
  kich_thuoc: string;
  chat_lieu: string;
  ky_thuat: string;
  mau_thiet_ke_id: string;
}

export function toTacPhamTrungBayDTO(record: any): TacPhamTrungBayDTO {
  if (!record) return {} as TacPhamTrungBayDTO;
  const mtk = record.mau_thiet_ke || {};

  return {
    id: record.id,
    ten_tac_pham: mtk.mo_ta || "Tác phẩm trưng bày",
    hinh_anh: mtk.hinh_anh || "",
    kich_thuoc: record.kich_thuoc || "",
    chat_lieu: record.chat_lieu || "",
    ky_thuat: record.ky_thuat_thuc_hien || "",
    mau_thiet_ke_id: record.mau_thiet_ke_id || mtk.id || ""
  };
}

// ==========================================
// 8. DTO ĐƠN HÀNG
// ==========================================
export interface DonHangDTO {
  id: string;
  ma_don: string;
  ten_khach_hang: string;
  sdt_khach_hang: string;
  tong_tien: number;
  da_thanh_toan: number;
  trang_thai: string;
  nguoi_tao_ten: string;
  sales_phu_trach_ten: string;
  kenh_ban_hang: string;
  ghi_chu: string;
  tao_luc: string;
}

export function toDonHangDTO(record: any): DonHangDTO {
  if (!record) return {} as DonHangDTO;

  return {
    id: record.id,
    ma_don: record.ma_don || "N/A",
    ten_khach_hang: record.khach_hang?.ho_ten || "Khách lẻ",
    sdt_khach_hang: record.khach_hang?.so_dien_thoai || "",
    tong_tien: Number(record.tong_tien) || 0,
    da_thanh_toan: Number(record.da_thanh_toan) || 0,
    trang_thai: record.trang_thai || "moi",
    nguoi_tao_ten: record.nguoi_tao?.ho_ten || "System",
    sales_phu_trach_ten: record.sales_phu_trach?.ho_ten || "Chưa phân công",
    kenh_ban_hang: record.kenh_ban_hang || "Tai cho",
    ghi_chu: record.ghi_chu || "",
    tao_luc: record.tao_luc
  };
}

// ==========================================
// 9. DTO KẾ HOẠCH SẢN XUẤT
// ==========================================
export interface KeHoachSanXuatDTO {
  id: string;
  ten_viec: string;
  trang_thai: 'cho_viec' | 'dang_lam' | 'hoan_thanh';
  thoi_gian_du_kien: number;
  thu_tu: number;
  nguoi_thuc_hien_ten: string;
  chi_tiet_san_pham: {
    ma_don: string;
    hinh_anh_mau: string;
    ghi_chu: string;
    so_luong: number;
    kich_thuoc: string;
  }
}

export function toKeHoachSanXuatDTO(record: any): KeHoachSanXuatDTO {
  if(!record) return {} as KeHoachSanXuatDTO;
  
  const ctdh = record.chi_tiet_don_hang || {};
  const mtk = ctdh.mau_thiet_ke || {};
  const dh = ctdh.don_hang || {};

  return {
    id: record.id,
    ten_viec: record.ten_viec || "Công việc sản xuất",
    trang_thai: record.trang_thai || "cho_viec",
    thoi_gian_du_kien: record.thoi_gian_du_kien || 0,
    thu_tu: record.thu_tu || 1,
    nguoi_thuc_hien_ten: record.nguoi_thuc_hien?.ho_ten || "Chưa nhận",
    chi_tiet_san_pham: {
        ma_don: dh.ma_don || "Kho",
        hinh_anh_mau: mtk.hinh_anh || "",
        ghi_chu: ctdh.ghi_chu_san_pham || "",
        so_luong: ctdh.so_luong || 1,
        kich_thuoc: ctdh.kich_thuoc || "Chuẩn"
    }
  };
}

// ==========================================
// 10. DTO ADMIN & DASHBOARD
// ==========================================
export interface AdminUserDTO {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
}

export interface DashboardStatsDTO {
  countNhanSu: number;
  countKhachHang: number;
  countMauThietKe: number;
  countViecMau: number;
}