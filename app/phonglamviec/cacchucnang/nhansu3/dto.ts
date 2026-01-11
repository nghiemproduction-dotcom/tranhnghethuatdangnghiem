export type Nhansu3DTO = {
    id: string;
    tao_luc: string;
    ho_ten: string;
    so_dien_thoai: string;
    email: string;
    phan_loai: string;
    madangnhap: string;
    hinh_anh: string;
    trang_thai: string;
    ngan_hang: string;
    so_tai_khoan: string;
    diem_cong_hien: number;
    cap_bac_game: string;
};

export function toNhansu3DTO(raw: any): Nhansu3DTO {
    return {
        id: raw.id,
        tao_luc: raw.tao_luc ?? '',
        ho_ten: raw.ho_ten ?? '',
        so_dien_thoai: raw.so_dien_thoai ?? '',
        email: raw.email ?? '',
        phan_loai: raw.phan_loai ?? '',
        madangnhap: raw.madangnhap ?? '',
        hinh_anh: raw.hinh_anh ?? '',
        trang_thai: raw.trang_thai ?? '',
        ngan_hang: raw.ngan_hang ?? '',
        so_tai_khoan: raw.so_tai_khoan ?? '',
        diem_cong_hien: raw.diem_cong_hien ?? 0,
        cap_bac_game: raw.cap_bac_game ?? '',
    };
}