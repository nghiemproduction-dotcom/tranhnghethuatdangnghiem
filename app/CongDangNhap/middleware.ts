import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Route công khai
const PUBLIC_ROUTES = [
  '/', 
  '/trangchu', 
  '/dathang', 
  '/CongDangNhap',
  '/auth/callback',
  '/login'
];

// Route tĩnh
const STATIC_PATHS = [
  '/_next', '/api', '/static', '/favicon.ico', '/manifest.json', 
  '.png', '.jpg', '.jpeg', '.svg', '.css', '.js', '.mp3'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Bỏ qua file tĩnh
  if (STATIC_PATHS.some(p => path.startsWith(p) || path.endsWith(p))) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Setup Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 2. Lấy User
  const { data: { user } } = await supabase.auth.getUser();

  // A. CHƯA ĐĂNG NHẬP
  if (!user) {
    if (!PUBLIC_ROUTES.includes(path)) {
      return NextResponse.redirect(new URL('/?login=1', request.url));
    }
    return response;
  }

  // B. ĐÃ ĐĂNG NHẬP
  const email = user.email;
  if (!email) return response;

  // 3. Xác định Role
  let userType = '';
  let roleNormalized = '';

  const { data: nhanSu } = await supabase
    .from('nhan_su')
    .select('vi_tri_normalized')
    .eq('email', email)
    .single();

  if (nhanSu) {
    userType = 'nhan_su';
    roleNormalized = nhanSu.vi_tri_normalized || 'parttime';
  } else {
    const { data: khachHang } = await supabase
      .from('khach_hang')
      .select('phan_loai_normalized')
      .eq('email', email)
      .single();

    if (khachHang) {
      userType = 'khach_hang';
      roleNormalized = khachHang.phan_loai_normalized || 'moi';
    } else {
      // User rác -> Logout
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 4. Kiểm tra quyền (Có Fallback)
  if (roleNormalized === 'admin' || roleNormalized === 'boss') {
    return response; 
  }

  // Thử đọc DB
  const { data: permission } = await supabase
    .from('routing_permissions')
    .select('allowed_routes, default_route')
    .eq('user_type', userType)
    .eq('role_normalized', roleNormalized)
    .single();

  let allowedRoutes: string[] = [];
  let defaultRoute = '/';

  if (permission) {
    // Có dữ liệu DB
    defaultRoute = permission.default_route || '/';
    if (Array.isArray(permission.allowed_routes)) {
        allowedRoutes = permission.allowed_routes;
    } else if (typeof permission.allowed_routes === 'string') {
        try { allowedRoutes = JSON.parse(permission.allowed_routes); } catch {}
    }
  } else {
    // 🟢 DÙNG FALLBACK TRONG CODE (Quan trọng)
    if (userType === 'nhan_su') {
        defaultRoute = `/phong${roleNormalized}`; // VD: /phongparttime
        allowedRoutes = [defaultRoute, '/dashboard'];
        
        // Fix đặc biệt cho trường hợp mapping không đều
        if (roleNormalized === 'thosanxuat') defaultRoute = '/phongtho';
        if (roleNormalized === 'congtacvien') defaultRoute = '/phongctv';
        
        allowedRoutes.push(defaultRoute);
    } else {
        allowedRoutes = ['/trangchu', '/dathang'];
        defaultRoute = '/trangchu';
    }
  }

  // Logic chặn đường
  const isAllowed = PUBLIC_ROUTES.includes(path) || allowedRoutes.some(route => {
    return path === route || path.startsWith(`${route}/`);
  });

  if (isAllowed) {
    return response;
  } else {
    // Redirect về phòng chuẩn
    if (path === defaultRoute) {
        // Tránh loop nếu defaultRoute cũng lỗi
        return NextResponse.redirect(new URL(userType === 'nhan_su' ? '/phongparttime' : '/', request.url));
    }
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};