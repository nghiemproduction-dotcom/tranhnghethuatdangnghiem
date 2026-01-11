'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- CÁC HÀM GHI DỮ LIỆU (WRITE ONLY) ---

// 1. THÊM MỚI (CREATE)
export async function createNhanSu(formData: any) {
  const supabase = await createClient();
  
  const { id, ...dataToInsert } = formData; 

  const { data, error } = await supabase
    .from('nhan_su')
    .insert([dataToInsert])
    .select();

  if (error) {
    console.error("Lỗi thêm mới:", error);
    throw new Error(error.message);
  }

  revalidatePath('/phonglamviec');
  return { success: true, data };
}

// 2. CẬP NHẬT (UPDATE)
export async function updateNhanSu(id: string, formData: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('nhan_su')
    .update(formData)
    .eq('id', id)
    .select();

  if (error) {
    console.error("Lỗi cập nhật:", error);
    throw new Error(error.message);
  }

  revalidatePath('/phonglamviec');
  return { success: true, data };
}

// 3. XÓA MỘT (DELETE)
export async function deleteNhanSu(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('nhan_su')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Lỗi xóa:", error);
    throw new Error(error.message);
  }

  revalidatePath('/phonglamviec');
  return { success: true };
}

// 4. XÓA NHIỀU (BULK DELETE)
export async function deleteNhanSuBulk(ids: string[]) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('nhan_su')
    .delete()
    .in('id', ids);

  if (error) {
    console.error("Lỗi xóa nhiều:", error);
    throw new Error(error.message);
  }

  revalidatePath('/phonglamviec');
  return { success: true };
}