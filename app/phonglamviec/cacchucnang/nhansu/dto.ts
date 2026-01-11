// app/phonglamviec/cacchucnang/nhansu/dto.ts

// 1. Type cho dữ liệu hiển thị (Output)
export type NhanSuDTO = {
    id: string;
    ho_ten: string;      // ⚠️ QUAN TRỌNG: Phải khớp với config.ts
    phan_loai: string;   // ⚠️ QUAN TRỌNG: Phải khớp với config.ts
    so_dien_thoai: string;
    hinh_anh: string;
    cap_bac_game: string;
    diem_cong_hien: number;
};

// 2. Mapper function
export function toNhanSuDTO(raw: any): NhanSuDTO {
    return {
        id: raw.id,
        // Map đúng key từ DB sang key của DTO (giữ nguyên snake_case)
        ho_ten: raw.ho_ten || 'Chưa đặt tên',
        phan_loai: raw.phan_loai || 'Nhân viên',
        so_dien_thoai: raw.so_dien_thoai || '',
        hinh_anh: raw.hinh_anh || '', 
        cap_bac_game: raw.cap_bac_game || 'Tân Binh',
        diem_cong_hien: raw.diem_cong_hien || 0
    };
}