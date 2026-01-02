import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { LoggerService } from "@/app/ThuVien/LoggerService";

const logger = LoggerService.createScoped("xuLyDangXuat");

export const xuLyDangXuat = async () => {
  try {
    logger.info("🚪 Bắt đầu quá trình đăng xuất...");

    // 1. XÓA THỦ CÔNG TOÀN BỘ LOCALSTORAGE
    if (typeof window !== "undefined") {
      // Xóa các key của App
      localStorage.removeItem("USER_INFO");
      localStorage.removeItem("USER_ROLE");
      localStorage.removeItem("user_role");
      localStorage.removeItem("LA_ADMIN_CUNG");
      localStorage.removeItem("SAVED_EMAIL");

      // QUAN TRỌNG: Xóa token của Supabase (thường có dạng sb-xxxx-auth-token)
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          localStorage.removeItem(key);
        }
      });

      // Xóa sessionStorage
      sessionStorage.clear();
    }

    // 2. XÓA COOKIE THỦ CÔNG (Để Middleware không bắt lại được)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 3. GỌI SUPABASE SIGN OUT (Cho chắc ăn phía server)
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (err) {
      console.warn("Supabase signOut warning:", err);
    }

    logger.info("✅ Đã dọn dẹp sạch sẽ session");

    // 4. FORCE REDIRECT VỀ TRANG CHỦ VỚI PARAM ĐẶC BIỆT
    // Thêm timestamp để trình duyệt không cache
    // Param ?logout=success báo hiệu cho trang chủ biết "Tao vừa logout đấy, đừng có auto-login lại"
    window.location.href = `/?logout=success&t=${Date.now()}`;
  } catch (error) {
    logger.error("❌ Lỗi đăng xuất nghiêm trọng", error);
    // Fallback cuối cùng: Force reload trang gốc
    window.location.href = `/?logout=force&t=${Date.now()}`;
  }
};
