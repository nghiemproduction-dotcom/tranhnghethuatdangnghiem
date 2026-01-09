import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // 🟢 FIX: Định nghĩa kiểu dữ liệu rõ ràng cho cookiesToSet
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // STANDARD 2: Nguồn sự thật duy nhất (getUser)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  
  // Các trang công khai
  const publicPaths = ['/auth', '/dang-ky', '/quen-mat-khau', '/api/push']; 
  const isPublicPath = publicPaths.some(path => url.pathname.startsWith(path));
  
  // Hiệu suất: Bỏ qua file tĩnh
  if (
    url.pathname.includes('.') || 
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/static') ||
    url.pathname.startsWith('/public') ||
    url.pathname.startsWith('/api/dev') 
  ) {
    return response
  }

  // LOGIC CHẶN CỬA
  if (!user) {
    if (url.pathname !== '/' && !isPublicPath) {
       const loginUrl = new URL('/', request.url)
       loginUrl.searchParams.set('next', url.pathname) 
       return NextResponse.redirect(loginUrl)
    }
  }

  if (user) {
    // Nếu đã login mà vào trang chủ (Login) thì đẩy vào dashboard
    if (url.pathname === '/' || url.pathname === '/dang-ky') {
       return NextResponse.redirect(new URL('/phongadmin', request.url)) // Đẩy mặc định về admin hoặc dashboard
    }
  }

  return response
}