import { createClient } from "@/utils/supabase/client";

export interface NhanSu {
  id: string;
  ho_ten: string;
  email: string;
  so_dien_thoai?: string;
  hinh_anh?: string;
  vi_tri?: string;
  vi_tri_normalized?: string;
  trang_thai?: string;
  luong_thang?: number;
  luong_theo_gio?: number;
  thuong_doanh_thu?: number;
  ngan_hang?: string;
  so_tai_khoan?: string;
  tao_luc?: string;
}

const supabase = createClient();

// 1. Lấy danh sách (Có hỗ trợ params nhưng hiện tại lấy hết để xử lý client-side cho mượt)
export const getNhanSuList = async (page?: number, limit?: number, search?: string, filter?: string): Promise<NhanSu[]> => {
  try {
    let query = supabase.from("nhan_su").select("*").order("tao_luc", { ascending: false });

    // Nếu muốn filter server-side thì viết logic ở đây, tạm thời return hết
    const { data, error } = await query;
    if (error) throw error;
    return (data as NhanSu[]) || [];
  } catch (e) {
    console.error("Lỗi lấy DS nhân sự:", e);
    return [];
  }
};

// 2. Tạo mới
export const createNhanSu = async (payload: Partial<NhanSu>) => {
  try {
    const { data, error } = await supabase.from("nhan_su").insert(payload).select().single();
    if (error) throw error;
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

// 3. Cập nhật
export const updateNhanSu = async (id: string, payload: Partial<NhanSu>) => {
  try {
    const { data, error } = await supabase.from("nhan_su").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

// 4. Xóa
export const deleteNhanSu = async (id: string) => {
  try {
    const { error } = await supabase.from("nhan_su").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

// 5. Lấy danh sách vị trí duy nhất (Cho dropdown)
export const getDistinctViTri = async () => {
  try {
    const { data } = await supabase.from("nhan_su").select("vi_tri");
    if (!data) return { success: true, data: [] };
    
    // Lọc trùng lặp bằng Set
    const unique = [...new Set(data.map((item: any) => item.vi_tri).filter(Boolean))];
    return { success: true, data: unique };
  } catch (e: any) {
    return { success: false, data: [] };
  }
};