// FILE: app/actions/employeeActions.ts
'use server'

import { createClient } from '@supabase/supabase-js'

export async function syncAllUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Lưu ý: Phải dùng SERVICE_ROLE_KEY (Lấy trong file .env.local)
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Tạo kết nối quyền Admin
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // 1. Lấy danh sách nhân sự
  const { data: employees, error } = await supabaseAdmin
    .from('nhan_su')
    .select('email, so_dien_thoai, ten_day_du')
  
  if (error || !employees) {
    return { count: 0, errors: ['Không lấy được danh sách nhân sự'] }
  }

  let count = 0
  let errors: string[] = []

  // 2. Duyệt từng người và tạo tài khoản
  for (const emp of employees) {
    if (!emp.email) continue

    // Mật khẩu mặc định là Số điện thoại (hoặc 12345678 nếu thiếu)
    const password = emp.so_dien_thoai || '12345678'

    // Lệnh tạo User của Supabase Admin
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: emp.email,
      password: password,
      email_confirm: true, // Tự động xác thực email luôn
      user_metadata: {
        full_name: emp.ten_day_du
      }
    })

    if (createError) {
      // Bỏ qua lỗi nếu user đã tồn tại
      if (!createError.message.includes('already been registered')) {
        errors.push(`${emp.email}: ${createError.message}`)
      }
    } else {
      count++
    }
  }

  return { count, errors }
}