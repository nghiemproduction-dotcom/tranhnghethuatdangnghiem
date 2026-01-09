// File: utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// 1. Hàm tạo client (Cách dùng chuẩn cho Next.js App Router)
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Thiếu biến môi trường Supabase!')
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}

// 2. [QUAN TRỌNG] Thêm dòng này để cứu các file cũ (NotificationService, AuthService...)
// Các file đó đang gọi: import { supabase } from ... nên bắt buộc phải export biến này.
export const supabase = createClient();