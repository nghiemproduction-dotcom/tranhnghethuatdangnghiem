import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Khởi tạo response để có thể ghi/xóa cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Kết nối Supabase (Server Client)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Cập nhật cookie vào request để xử lý ngay
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Cập nhật cookie vào response để trả về browser
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 3. Kiểm tra User từ Supabase
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 4. LUẬT BẢO VỆ
  
  // Case A: Chưa đăng nhập mà đòi vào trang nội bộ (/trangchu...)
  if (!user && path.startsWith('/trangchu')) {
    // Chuyển hướng về trang login (/)
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Case B: Đã đăng nhập mà còn ở trang login (/)
  if (user && path === '/') {
    // Chuyển hướng vào trang chủ
    return NextResponse.redirect(new URL('/trangchu', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Chạy middleware trên tất cả các route TRỪ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Các file tài nguyên (.svg, .png, .jpg...)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}