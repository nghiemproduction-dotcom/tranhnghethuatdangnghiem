// app/components/ChucNangGeneric/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Hàm helper tạo client auth
async function getAuthedClient() {
  const cookieStore = await cookies();
  const supabase = await createClient(); // Next 15: await createClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

export async function createGenericItem(tableName: string, data: any, path: string) {
  try {
    const supabase = await getAuthedClient();
    
    // Loại bỏ các field rỗng hoặc undefined
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );

    const { error } = await supabase.from(tableName).insert(cleanData);
    if (error) throw new Error(error.message);

    revalidatePath(path); // Refresh lại trang Server Component
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateGenericItem(tableName: string, id: string, data: any, path: string) {
  try {
    const supabase = await getAuthedClient();
    
    const { error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath(path);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteGenericItem(tableName: string, id: string, path: string) {
  try {
    const supabase = await getAuthedClient();
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath(path);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}