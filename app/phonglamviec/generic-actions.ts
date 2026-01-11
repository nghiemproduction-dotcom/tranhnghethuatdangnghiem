'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Tạo Client chung
async function createActionClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => 
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// --- GENERIC CREATE ---
export async function genericCreate(table: string, data: any, pathToRevalidate: string = '/phonglamviec') {
  const supabase = await createActionClient()
  
  try {
    // 1. Loại bỏ id nếu rỗng để DB tự sinh (UUID/Auto increment)
    if (!data.id) delete data.id

    // 2. Thêm .select() để trả về data vừa tạo (hữu ích nếu cần ID ngay)
    const { data: createdData, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()
    
    if (error) throw error

    revalidatePath(pathToRevalidate)
    return { success: true, data: createdData, message: 'Tạo mới thành công' }

  } catch (error: any) {
    console.error(`[CREATE ERROR] Table: ${table}`, error) // Log server để debug
    return { success: false, message: error.message || 'Lỗi tạo dữ liệu' }
  }
}

// --- GENERIC UPDATE ---
export async function genericUpdate(table: string, id: string, data: any, pathToRevalidate: string = '/phonglamviec') {
  const supabase = await createActionClient()
  
  try {
    // 1. Tách ID ra khỏi data update để tránh lỗi update primary key
    // Dùng destructuring để loại bỏ 'id', giữ lại phần còn lại vào 'updateData'
    const { id: _, ...updateData } = data;

    const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)

    if (error) throw error

    revalidatePath(pathToRevalidate)
    return { success: true, message: 'Cập nhật thành công' }

  } catch (error: any) {
    console.error(`[UPDATE ERROR] Table: ${table}, ID: ${id}`, error)
    return { success: false, message: error.message || 'Lỗi cập nhật dữ liệu' }
  }
}

// --- GENERIC DELETE (ONE) ---
export async function genericDelete(table: string, id: string, pathToRevalidate: string = '/phonglamviec') {
  const supabase = await createActionClient()
  
  try {
    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) throw error

    revalidatePath(pathToRevalidate)
    return { success: true, message: 'Xóa thành công' }

  } catch (error: any) {
    console.error(`[DELETE ERROR] Table: ${table}, ID: ${id}`, error)
    return { success: false, message: error.message || 'Lỗi xóa dữ liệu' }
  }
}

// --- [NEW] GENERIC DELETE BULK (MANY) ---
// Dùng để xóa nhiều dòng cùng lúc (Nút "Chọn nhiều" -> "Xóa")
export async function genericDeleteBulk(table: string, ids: string[], pathToRevalidate: string = '/phonglamviec') {
    const supabase = await createActionClient()
    
    try {
      if (!ids || ids.length === 0) return { success: false, message: 'Không có mục nào được chọn' }

      // Dùng .in() để xóa danh sách ID
      const { error } = await supabase.from(table).delete().in('id', ids)
  
      if (error) throw error
  
      revalidatePath(pathToRevalidate)
      return { success: true, message: `Đã xóa ${ids.length} mục` }
  
    } catch (error: any) {
      console.error(`[BULK DELETE ERROR] Table: ${table}`, error)
      return { success: false, message: error.message || 'Lỗi xóa nhiều dữ liệu' }
    }
  }