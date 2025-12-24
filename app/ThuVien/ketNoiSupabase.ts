import { createBrowserClient } from '@supabase/ssr'

// 1. Lấy biến môi trường
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 2. Kiểm tra biến môi trường
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Lỗi nghiêm trọng: Không tìm thấy biến môi trường Supabase! Hãy kiểm tra file .env.local.'
  )
}

// 3. Khởi tạo Client cho Trình duyệt (Browser Client)
// Dùng createBrowserClient của @supabase/ssr để tự động xử lý Cookies
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)