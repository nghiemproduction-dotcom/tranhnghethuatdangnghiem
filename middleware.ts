import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getProfileByEmailUsingClient } from '@/lib/dal';

// 1. CÁC ROUTE CÔNG KHAI
const PUBLIC_ROUTES = [
  '/', 
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // ============================================================
  // [CẬP NHẬT MỚI]: KIỂM TRA COOKIE NỘI BỘ (STAFF SESSION)
  // ============================================================
  const staffSession = request.cookies.get('staff_session');

  if (staffSession) {
    // SỬA: Bỏ chặn trang chủ ('/'). Chỉ redirect nếu họ cố vào lại trang đăng nhập.
    if (path === '/CongDangNhap' || path === '/login') {
      try {
        const sessionData = JSON.parse(staffSession.value);
        let dest = '/dashboard';
        
        switch (sessionData.role) {
            case 'admin': dest = '/phongadmin'; break;
            case 'sales': dest = '/dathang'; break;
            case 'thosanxuat': dest = '/sanxuat'; break;
            case 'thietke': dest = '/thietke'; break;
            case 'kho': dest = '/kho'; break;
            case 'ketoan': dest = '/ketoan'; break;
            default: dest = '/dashboard';
        }
        return NextResponse.redirect(new URL(dest, request.url));
      } catch (e) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    
    // Nếu có cookie nhân viên -> CHO PHÉP ĐI TIẾP (Bypass Supabase Auth check)
    return response;
  }
  // ============================================================


  // --- BƯỚC 3: LẤY THÔNG TIN USER (LOGIC CŨ - SUPABASE AUTH) ---
  const { data: { user } } = await supabase.auth.getUser();

  // --- BƯỚC 4: XỬ LÝ ĐIỀU HƯỚNG ---
  
  // TRƯỜNG HỢP A: CHƯA ĐĂNG NHẬP
  if (!user) {
    if (!PUBLIC_ROUTES.includes(path)) {
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return response; 
  }

  // TRƯỜNG HỢP B: ĐÃ ĐĂNG NHẬP
  if (user) {
    // 1. Lấy quyền
    const appMetadata = user.app_metadata || {};
    let userRole = appMetadata.app_role; 
    let userPerm = appMetadata.app_permission || 'khach';

    if (!userRole && user.email) {
      try {
        const profile = await getProfileByEmailUsingClient(supabase, user.email);
        if (profile?.role) {
          if (profile.role === 'admin') {
            userRole = 'nhan_su';
            userPerm = 'admin';
          } else {
            userRole = 'khach_hang';
            userPerm = profile.role || 'khach';
          }
        }
      } catch (e) { }
    }

    // 2. Định nghĩa trang đích
    let destination = '/trangchu';

    if (userRole === 'nhan_su') {
        switch (userPerm) {
            case 'admin':
            case 'quan_tri': destination = '/phongadmin'; break;
            case 'thietke': destination = '/phongthietke'; break;
            case 'ketoan': destination = '/phongketoan'; break;
            case 'thukho': destination = '/phongkho'; break;
            case 'parttime':
            case 'thosanxuat':
            case 'tho': destination = '/phongsanxuat'; break;
            case 'congtacvien': destination = '/phongctv'; break;
            default: destination = '/dashboard'; 
        }
    } else if (userRole === 'khach_hang') {
        destination = '/khach-hang/tong-quan'; 
    }

    // 3. Logic Redirect "Thông Minh"
    // SỬA: Bỏ chặn trang chủ ('/'). Để user có thể ở lại trang chủ sau khi login/logout.
    if (path === '/CongDangNhap' || path === '/auth/callback') {
        return NextResponse.redirect(new URL(destination, request.url));
    }

    // 4. Logic Bảo vệ
    if (userPerm === 'admin' || userPerm === 'quan_tri') {
        return response;
    }

    if (path.startsWith('/phong') && !path.startsWith(destination)) {
         return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};