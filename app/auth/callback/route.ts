import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Lấy đường dẫn "next" nếu có (để redirect đúng chỗ)
  const next = searchParams.get("next") ?? "/dashboard";

  // Google OAuth disabled: do not process auth code
  if (code) {
    // Redirect back to login with message
    return NextResponse.redirect(`${origin}/login?message=google_disabled`);
  }

  // Nếu lỗi, trả về trang lỗi
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}