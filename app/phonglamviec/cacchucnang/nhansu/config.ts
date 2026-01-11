import { FieldConfig } from "@/app/types/core";
import { GenericDisplayConfig } from "../GenericChucNang/GenericList"; // Import type này để gợi ý code chuẩn

// 1. Config Fields (Giữ nguyên như cũ)
export const NHAN_SU_FIELDS: FieldConfig[] = [
  { key: "ho_ten", label: "Họ và Tên", type: "text", required: true, showInList: true },
  { key: "phan_loai", label: "Chức vụ", type: "select", showInList: true, options: [/*...*/] },
  { key: "so_dien_thoai", label: "SĐT", type: "phone", showInList: true },
  { key: "cap_bac_game", label: "Rank", type: "text", showInList: true },
  { key: "diem_cong_hien", label: "Điểm", type: "number", showInList: false },
  { key: "hinh_anh", label: "Ảnh đại diện", type: "image", showInList: false },
  // ... các field khác
];

// 2. [MỚI] Cấu hình hiển thị (Mapping)
// Generic sẽ đọc cái này để biết hiển thị cái gì ra ngoài
export const NHAN_SU_DISPLAY_CONFIG: GenericDisplayConfig & { storageBucket?: string, badgeKey?: string } = {
    // A. Cột hiển thị chính
    colTitle: 'ho_ten',       // Dòng to nhất lấy từ cột 'ho_ten'
    colSubTitle: 'phan_loai', // Dòng nhỏ bên dưới lấy từ cột 'phan_loai'
    colImage: 'hinh_anh',     // Ảnh lấy từ cột 'hinh_anh'
    
    // B. Cấu hình Game (Chỉ nhân sự mới có)
    gamification: {
        hasRank: true,
        rankKey: 'cap_bac_game',    // Hiển thị rank từ cột này
        scoreKey: 'diem_cong_hien'  // Hiển thị điểm từ cột này
    },

    // C. Cấu hình Detail (Cho GenericDetail)
    storageBucket: 'avatar',   // Upload ảnh vào bucket 'avatar'
    badgeKey: 'cap_bac_game'   // Hiển thị cái badge LV ở avatar chi tiết
};