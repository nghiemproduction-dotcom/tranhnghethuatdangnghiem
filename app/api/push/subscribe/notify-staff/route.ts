import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { title, body, url } = await req.json();

    // 1. Lấy danh sách ID của nhân sự có quyền Sales/Admin/Quản lý
    const { data: staffList } = await supabase
      .from("nhan_su")
      .select("id")
      .in("vi_tri_normalized", ["admin", "boss", "quanly", "sales"]);

    if (!staffList || staffList.length === 0) {
      return NextResponse.json({ message: "No staff found" });
    }

    const staffIds = staffList.map((s) => s.id);

    // 2. Lấy các thiết bị đã đăng ký Push của những nhân sự này
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", staffIds);

    if (!subs || subs.length === 0) {
      return NextResponse.json({ message: "No subscriptions found" });
    }

    // 3. Gửi thông báo hàng loạt
    const payload = JSON.stringify({
      title: title || "Khách hàng mới!",
      body: body || "Có khách hàng đang cần tư vấn.",
      url: url || "/phongsales",
    });

    const promises = subs.map((sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: { auth: sub.auth, p256dh: sub.p256dh },
      };
      return webPush.sendNotification(pushConfig, payload).catch((err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          supabase.from("push_subscriptions").delete().eq("id", sub.id).then();
        }
      });
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true, count: subs.length });
  } catch (error: any) {
    console.error("Notify Staff Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
