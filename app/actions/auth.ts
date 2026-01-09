"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// 1. Định nghĩa Schema (Tiêu chuẩn số 3: Input Validation)
const LoginSchema = z.object({
  email: z.string().email({ message: "Email không đúng định dạng" }),
  password: z.string().min(6, { message: "Mật khẩu phải từ 6 ký tự" }),
});

export async function login(prevState: any, formData: FormData) {
  // Validate dữ liệu đầu vào
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = LoginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
      validationErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  // Đăng nhập
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Tiêu chuẩn UX: Không lộ rõ lỗi "Email chưa tồn tại" để tránh dò user
    return { error: "Email hoặc mật khẩu không chính xác." };
  }

  // Đăng nhập thành công -> Xóa cache -> Chuyển hướng
  revalidatePath("/", "layout");
  
  // Lấy return URL nếu có
  const nextUrl = formData.get("next") as string;
  redirect(nextUrl || "/dashboard");
}

