import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getRedirectUrl, isRouteAllowed } from './RoleRedirectService';

const PUBLIC_ROUTES = ['/trangchu', '/CongDangNhap', '/auth/callback', '/login', '/dathang'];
const ROOT_PATH = '/';

const isStaticPath = (path: string): boolean => {
  return path.startsWith('/_next/') || path.startsWith('/api/') || path.includes('.');
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (isStaticPath(path)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // A. CHƯA ĐĂNG NHẬP
  if (!user) {
    if (PUBLIC_ROUTES.includes(path) || path === ROOT_PATH) {
      return response; // Cho phép truy cập các trang công khai
    }
    return NextResponse.redirect(new URL('/CongDangNhap', request.url)); // Chuyển về trang đăng nhập
  }

  // B. ĐÃ ĐĂNG NHẬP
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, role_normalized')
    .eq('id', user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/', request.url));
  }

  const { user_type, role_normalized } = profile;

  // 1. LẤY URL ĐIỂM ĐẾN CHUẨN
  const destinationUrl = await getRedirectUrl(user_type, role_normalized);
  const absoluteDestinationUrl = new URL(destinationUrl, request.url);

  // 2. NẾU ĐANG Ở TRANG CÔNG KHAI (SAU KHI ĐĂNG NHẬP) -> ĐIỀU HƯỚNG VỀ PHÒNG CHUẨN
  if (PUBLIC_ROUTES.includes(path) || path === ROOT_PATH) {
    return NextResponse.redirect(absoluteDestinationUrl);
  }

  // 3. NẾU CỐ GẮNG VÀO TRANG KHÁC -> KIỂM TRA QUYỀN
  const allowed = await isRouteAllowed(user_type, role_normalized, path);

  if (allowed) {
    return response; // Cho phép đi tiếp
  } else {
    // Nếu không được phép, trả về phòng chuẩn của họ
    return NextResponse.redirect(absoluteDestinationUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|sounds/|icons/).*)',
  ],
};
