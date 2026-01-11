"use server";

import postgres from "postgres";
import webPush from "web-push";

// Kết nối DB
const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

// Cấu hình Web Push (Lấy từ biến môi trường của bạn)
if (
  !process.env.VAPID_PRIVATE_KEY ||
  !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
) {
  console.warn(
    "⚠️ [NotificationAction] Chưa cấu hình VAPID keys. Web Push sẽ không hoạt động."
  );
} else {
  try {
    webPush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:admin@nghiemart.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
  } catch (err) {
    console.error("⚠️ [NotificationAction] Lỗi cấu hình VAPID:", err);
  }
}

/**
 * HÀM GỬI THÔNG BÁO THÔNG MINH (Centralized Notification Handler)
 * ------------------------------------------------------------------
 * @param targetRoles Danh sách role/phòng nhận tin (vd: ['admin', 'thietke', 'quanly'])
 * @param title Tiêu đề thông báo (vd: "Mẫu thiết kế mới")
 * @param message Nội dung chi tiết
 * @param url Link khi click vào (vd: '/phongthietke')
 * @param type Loại icon hiển thị (mặc định: 'system_alert')
 * @param senderName Tên người gửi (Optional, mặc định là Hệ thống)
 */
export async function sendNotificationToRoles(
  targetRoles: string[],
  title: string,
  message: string,
  url: string = "/",
  type: string = "system_alert",
  senderName: string = "Hệ thống"
) {
  try {
    // 1. CHUẨN HÓA ROLE & TÌM USER
    // Chuyển hết về chữ thường để so sánh chính xác với vi_tri_normalized
    const rolesNormalized = targetRoles.map((r) => r.toLowerCase().trim());

    // Tìm ID của những nhân sự thuộc các phòng này VÀ đang hoạt động
    // Lưu ý: Nếu muốn gửi cho tất cả nhân viên (vd: thông báo chung), truyền targetRoles = ['all']
    let users;
    if (rolesNormalized.includes("all")) {
      users =
        await sql`SELECT id FROM "nhan_su" WHERE trang_thai = 'dang_lam_viec'`;
    } else {
      users = await sql`
        SELECT id FROM "nhan_su" 
        WHERE vi_tri_normalized = ANY(${rolesNormalized})
        AND trang_thai = 'dang_lam_viec' 
        `;
    }

    if (users.length === 0) {
      return {
        success: true,
        count: 0,
        message: "Không tìm thấy người nhận phù hợp",
      };
    }

    const userIds = users.map((u) => u.id);

    // 2. LƯU VÀO DATABASE (Bảng notifications) - Để hiện chuông đỏ trên Web
    // Tạo avatar mặc định dựa trên tên người gửi
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      senderName
    )}&background=C69C6D&color=fff&size=128`;

    const notificationsToInsert = userIds.map((uid) => ({
      user_id: uid,
      type: type,
      category: "from_system",
      title: title,
      message: message,
      action_url: url,
      is_read: false,
      tao_luc: new Date().toISOString(),
      from_user_name: senderName,
      from_user_avatar: avatarUrl,
    }));

    // Batch Insert (Nhanh hơn insert từng dòng)
    if (notificationsToInsert.length > 0) {
      await sql`INSERT INTO "notifications" ${sql(notificationsToInsert)}`;
    }

    // 3. GỬI PUSH NOTIFICATION (Đến điện thoại/trình duyệt)
    // Tìm các thiết bị đã đăng ký nhận tin của những user này
    const subscriptions = await sql`
      SELECT * FROM "push_subscriptions" 
      WHERE user_id = ANY(${userIds})
    `;

    if (subscriptions.length > 0) {
      const payload = JSON.stringify({
        title: title,
        body: message,
        url: url,
        icon: "/icon-192.png", // Icon app
        data: { url: url }, // Dữ liệu mở rộng cho Service Worker
      });

      // Gửi song song (Promise.all)
      const pushPromises = subscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { auth: sub.auth, p256dh: sub.p256dh },
            },
            payload
          );
        } catch (err: any) {
          // Xử lý thiết bị cũ/hỏng (Lỗi 410 Gone hoặc 404 Not Found)
          if (err.statusCode === 410 || err.statusCode === 404) {
            await sql`DELETE FROM "push_subscriptions" WHERE id = ${sub.id}`;
          }
        }
      });

      // Chạy ngầm, không await để trả kết quả nhanh
      Promise.all(pushPromises).catch((err) =>
        console.error("Lỗi Push Batch:", err)
      );
    }

    return { success: true, count: userIds.length };
  } catch (error: any) {
    console.error("❌ Lỗi [sendNotificationToRoles]:", error);
    // Không throw error để tránh làm crash chức năng chính
    return { success: false, error: error.message };
  }
}
