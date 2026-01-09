// ThuVien/KieuDuLieu.ts

export type LoaiNoiDung = 'image' | 'text' | 'task';

export type DuLieuKhoi = {
  id: string;
  tieuDe: string;
  loai: LoaiNoiDung;
  noiDung: string;
  doRongCot: 1 | 2 | 3 | 4; // ColSpan
};

export type DuLieuHang = {
  id: string;
  chieuCao: number;
  danhSachKhoi: DuLieuKhoi[];
};