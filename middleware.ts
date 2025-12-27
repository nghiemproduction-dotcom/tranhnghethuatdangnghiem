import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 🟢 LOGIC KIỂM TRA PHÂN QUYỀN NÂNG CAO
  const isAllowedToEnter = async () => {
      if (!user || !user.email) return false;
      
      // 1. Kiểm tra Nhân Sự (Ưu tiên)
      const { data: ns } = await supabase.from('nhan_su').select('id').eq('email', user.email).single();
      if (ns) return true;

      // 2. Kiểm tra Khách Hàng VIP / Trọng Tâm
      const { data: kh } = await supabase.from('khach_hang').select('phan_loai').eq('email', user.email).single();
      if (kh && kh.phan_loai) {
          const type = kh.phan_loai.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          if (type.includes('vip') || type.includes('trong tam')) return true;
      }

      return false;
  };

  // Case A: Chưa đăng nhập hoặc không đủ quyền -> Chặn vào trang nội bộ
  if (path.startsWith('/trangchu')) {
      if (!user) return NextResponse.redirect(new URL('/', request.url));
      
      // Kiểm tra kỹ hơn trong DB (Optional: Nếu muốn bảo mật tuyệt đối thì bật dòng này)
      // Lưu ý: Việc query DB ở middleware sẽ làm chậm request một chút.
      const allowed = await isAllowedToEnter();
      if (!allowed) {
          // Logout và đá về trang chủ nếu tài khoản không hợp lệ
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL('/?error=access_denied', request.url));
      }
  }

  // Case B: Đã đăng nhập hợp lệ mà còn ở trang login -> Đẩy vào trong
  if (user && path === '/') {
      const allowed = await isAllowedToEnter();
      if (allowed) return NextResponse.redirect(new URL('/trangchu', request.url));
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}