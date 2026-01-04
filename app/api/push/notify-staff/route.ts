import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Khởi tạo Supabase Admin (Quyền tối cao để ghi thông báo cho người khác)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Lưu ý: Cần biến môi trường này trong .env.local
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, body: message, url, sessionId, targetStaffId } = body;

    // 1. XÁC ĐỊNH NGƯỜI NHẬN
    let targetIds: string[] = [];

    if (targetStaffId) {
      // A. Nếu đã chỉ định đích danh (VD: Khách cũ nhắn cho Sales phụ trách)
      targetIds = [targetStaffId];
    } else {
      // B. Nếu không chỉ định (VD: Khách mới, Đăng ký mới) -> Gửi cho toàn bộ Admin/Sales/Quản lý
      // Lấy danh sách nhân viên đang làm việc có role phù hợp
      const { data: staff } = await supabaseAdmin
        .from("nhan_su")
        .select("id")
        .eq("trang_thai", "dang_lam_viec")
        .in("vi_tri_normalized", ["admin", "quanly", "sales"]);

      if (staff) {
        targetIds = staff.map((s) => s.id);
      }
    }

    if (targetIds.length === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy nhân viên nào để báo" },
        { status: 200 }
      );
    }

    // 2. TẠO DỮ LIỆU THÔNG BÁO (Chuẩn bị insert vào DB)
    const notificationsToInsert = targetIds.map((userId) => ({
      user_id: userId,
      type: "system_alert", // Loại thông báo
      category: sessionId ? "chat" : "system", // Phân loại
      title: title,
      message: message,
      action_url: url,
      related_id: sessionId || null,
      is_read: false,
      from_user_name: "Hệ thống",
      from_user_avatar:
        "https://ui-avatars.com/api/?name=System&background=C69C6D&color=fff",
    }));

    // 3. LƯU VÀO BẢNG notifications
    const { error } = await supabaseAdmin
      .from("notifications")
      .insert(notificationsToInsert);

    if (error) {
      console.error("Lỗi lưu thông báo:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // --- (NÂNG CAO) PHẦN BẮN WEB PUSH (Nếu mày có cài thư viện web-push) ---
    // Phần này để mở rộng sau: Duyệt qua bảng push_subscriptions và bắn tin tới trình duyệt
    // ...

    return NextResponse.json({ success: true, count: targetIds.length });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
