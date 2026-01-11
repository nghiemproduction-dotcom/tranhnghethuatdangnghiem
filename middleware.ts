import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 1. CÁC ROUTE CÔNG KHAI
const PUBLIC_ROUTES = [
  '/', 
  '/phongtrungbay', 
  '/trangchu', 
  '/dathang', 
  '/CongDangNhap',
  '/auth/callback',
  '/login',
  '/error'
];

// 2. CÁC FILE TĨNH
const STATIC_PATHS = [
  '/_next', '/api', '/static', '/favicon.ico', '/manifest.json', 
  '.png', '.jpg', '.jpeg', '.svg', '.css', '.js', '.mp3', '.woff', '.woff2'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // --- BƯỚC 1: BỎ QUA FILE TĨNH ---
  if (STATIC_PATHS.some(p => path.startsWith(p) || path.endsWith(p))) {
    return NextResponse.next();
  }

  // --- BƯỚC 2: KHỞI TẠO SUPABASE CLIENT ---
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // --- BƯỚC 3: REFRESH TOKEN ---
  const { data: { user } } = await supabase.auth.getUser();


  // --- BƯỚC 4: XỬ LÝ CHUYỂN HƯỚNG VỀ PHONGLAMVIEC ---
  
  // Kiểm tra cookie staff_session (Logic cũ của bạn)
  const staffSession = request.cookies.get('staff_session');

  // Logic chuyển hướng chung: Bất kể là ai, hễ đang ở trang login mà đã đăng nhập thì về /phonglamviec
  const isLoginPage = path === '/CongDangNhap' || path === '/login' || path === '/auth/callback';

  if (staffSession) {
    if (isLoginPage) {
      // ✅ THAY ĐỔI: Không switch case nữa, chuyển thẳng về /phonglamviec
      return NextResponse.redirect(new URL('/phonglamviec', request.url));
    }
    // Nếu ở các trang khác thì cho đi tiếp
    return response;
  }

  // Logic dự phòng với User của Supabase (nếu không dùng staff_session)
  if (user) {
    if (isLoginPage) {
      // ✅ THAY ĐỔI: Có user Supabase cũng chuyển thẳng về /phonglamviec
      return NextResponse.redirect(new URL('/phonglamviec', request.url));
    }
    return response;
  }

  // --- BƯỚC 5: BẢO VỆ ROUTE ---
  // Nếu chưa đăng nhập (không có user và không có staff_session)
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  if (!user && !staffSession) {
    if (!isPublicRoute) {
      // Nếu cố vào trang nội bộ mà chưa login -> Về trang chủ
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};