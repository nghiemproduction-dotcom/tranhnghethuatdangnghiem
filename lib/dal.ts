// lib/dal.ts
import 'server-only' // 🛡️ Tiêu chuẩn 3: Chặn import vào Client Component
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

// --- 1. Khởi tạo Client (Hỗ trợ Next.js 15 Async Cookies) ---
const createClient = async () => {
  const cookieStore = await cookies() // 🛡️ Tiêu chuẩn 3: await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Server Component (Read-only) không cần set cookie, để trống.
        },
      },
    }
  )
}

// --- 2. Hàm lấy User (Memoization) ---
// ⚡ Tiêu chuẩn 2: Dùng cache để không gọi lại auth nhiều lần trong 1 render
export const getSessionUser = cache(async () => {
  const supabase = await createClient()
  // 🛡️ Tiêu chuẩn 3: Dùng getUser() thay vì getSession() để chống giả mạo
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// --- 3. Định nghĩa Generics cho Query ---
interface FetchOptions {
  select?: string
  filter?: { column: string; value: any }[]
  sort?: { column: string; ascending?: boolean }
  limit?: number
}

// --- 4. Hàm Fetch Data Tổng Quát (Core) ---
// ⚡ Tiêu chuẩn 2: Cache kết quả query
export const fetchTableData = cache(async <T>(
  table: string,
  options: FetchOptions = {}
): Promise<T[]> => {
  const supabase = await createClient()

  // 🛡️ Tiêu chuẩn 5: RLS sẽ tự lo việc lọc dữ liệu theo user.
  // Chúng ta chỉ kiểm tra user có tồn tại để tránh lỗi connection thôi.
  const user = await getSessionUser()
  if (!user) return [] // Hoặc throw error tùy logic

  let query = supabase.from(table).select(options.select || '*')

  // Áp dụng Filter dynamic
  if (options.filter) {
    options.filter.forEach((f) => {
      query = query.eq(f.column, f.value)
    })
  }

  // Áp dụng Sort
  if (options.sort) {
    query = query.order(options.sort.column, { ascending: options.sort.ascending ?? true })
  }

  // Áp dụng Limit
  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error(`[DAL Error] Table: ${table}`, error.message)
    throw new Error(error.message)
  }

  return data as T[]
})