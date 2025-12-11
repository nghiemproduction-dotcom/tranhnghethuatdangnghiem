import { createClient } from '@supabase/supabase-js'

// 1. Lấy biến môi trường từ file .env.local
// Next.js yêu cầu biến dùng ở Client phải có tiền tố NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 2. Kiểm tra kỹ xem biến có nạp được không
// Nếu không tìm thấy, code sẽ dừng ngay và báo lỗi rõ ràng thay vì lỗi chung chung
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Lỗi nghiêm trọng: Không tìm thấy biến môi trường Supabase! Hãy chắc chắn bạn đã tạo file .env.local và khởi động lại server.'
  )
}

// 3. Khởi tạo kết nối an toàn
export const supabase = createClient(supabaseUrl, supabaseAnonKey)