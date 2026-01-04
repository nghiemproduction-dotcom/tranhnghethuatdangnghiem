"use server";

import postgres from "postgres";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// 👇 IMPORT MỚI
import { sendNotificationToRoles } from "./NotificationAction";

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  max: 10,
  idle_timeout: 20,
});

// Helper: Lấy thông tin nhân viên đang login
async function getStaffUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized: Bạn chưa đăng nhập");

  // Lấy role và organization_id
  const [ns] =
    await sql`SELECT id, ho_ten, vi_tri_normalized, organization_id FROM nhan_su WHERE id = ${user.id} LIMIT 1`;
  if (!ns) throw new Error("Not a staff member: Không tìm thấy hồ sơ nhân sự");

  return ns;
}

// --- 1. NGHIỆP VỤ CHAT TƯ VẤN (Cũ) ---
export async function claimChatSessionAction(sessionId: string) {
  try {
    const staff = await getStaffUser();

    const [session] =
      await sql`SELECT nhan_su_phu_trach_id FROM tu_van_sessions WHERE id = ${sessionId} LIMIT 1`;
    if (!session) throw new Error("Cuộc hội thoại không tồn tại");

    if (
      session.nhan_su_phu_trach_id &&
      session.nhan_su_phu_trach_id !== staff.id
    ) {
      if (["admin", "quanly", "boss"].includes(staff.vi_tri_normalized)) {
        // Admin được quyền cướp
      } else {
        return {
          success: false,
          error: "Cuộc hội thoại này đã có Sales khác hỗ trợ!",
        };
      }
    }

    await sql`
            UPDATE tu_van_sessions 
            SET nhan_su_phu_trach_id = ${staff.id}, 
                trang_thai = 'dang_tu_van' 
            WHERE id = ${sessionId}
        `;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- 2. NGHIỆP VỤ BÁN HÀNG (POS) ---

// Lấy danh sách sản phẩm để bán
export async function getProductsForPOS(search: string) {
  try {
    await getStaffUser();
    let query = `SELECT * FROM "vat_tu" WHERE loai_vat_tu = 'thanh_pham' AND ton_kho > 0`;
    const params: any[] = [];

    if (search) {
      query += ` AND (ten_vat_tu ILIKE $1 OR ma_sku ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY ten_vat_tu ASC LIMIT 20`;
    const data = await sql.unsafe(query, params);
    return { success: true, data: Array.from(data) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Tìm khách hàng nhanh
export async function searchCustomer(term: string) {
  try {
    await getStaffUser();
    const data = await sql`
            SELECT id, ho_ten, so_dien_thoai, phan_loai 
            FROM "khach_hang" 
            WHERE ho_ten ILIKE ${"%" + term + "%"} OR so_dien_thoai ILIKE ${
      "%" + term + "%"
    }
            LIMIT 5
        `;
    return { success: true, data: Array.from(data) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 🔥 QUAN TRỌNG: TẠO ĐƠN & TỰ ĐỘNG BẮN LỆNH SẢN XUẤT
export async function createPOSOrder(orderData: any) {
  try {
    const staff = await getStaffUser();

    // 1. Tạo Đơn hàng
    // Trạng thái 'dang_san_xuat' để kích hoạt quy trình
    const [newOrder] = await sql`
            INSERT INTO "don_hang" (
                khach_hang_id, sales_phu_trach_id, nguoi_tao_id, organization_id,
                trang_thai, tong_tien, da_thanh_toan, kenh_ban_hang, ghi_chu
            ) VALUES (
                ${orderData.khach_hang_id}, ${staff.id}, ${staff.id}, ${staff.organization_id},
                'dang_san_xuat', ${orderData.tong_tien}, ${orderData.da_thanh_toan}, 'pos', ${orderData.ghi_chu}
            ) RETURNING id, ma_don
        `;

    // 2. Lấy quy trình mẫu mặc định (Để gắn vào lệnh SX)
    // Trong thực tế có thể chọn quy trình, ở đây lấy mặc định cái đầu tiên tìm thấy
    const [defaultProcess] = await sql`SELECT id FROM quy_trinh_mau LIMIT 1`;
    const quyTrinhId = defaultProcess?.id || null;
    let hasJob = false;

    // 3. Tạo Chi tiết đơn & Lệnh Sản Xuất (Job)
    for (const item of orderData.items) {
      // A. Insert Chi tiết đơn
      const [newItem] = await sql`
                INSERT INTO "don_hang_chi_tiet" (
                    don_hang_id, vat_tu_id, ten_item_hien_thi, so_luong, don_gia
                ) VALUES (
                    ${newOrder.id}, ${item.id}, ${item.ten_vat_tu}, ${item.so_luong}, ${item.don_gia}
                ) RETURNING id
            `;

      // B. TẠO LỆNH SẢN XUẤT (Treo lên "Sàn việc" cho thợ nhận)
      if (quyTrinhId) {
        hasJob = true;
        // Tạo mã lệnh ngẫu nhiên
        const maLenh = "LSX-" + Math.floor(100000 + Math.random() * 900000);

        await sql`
                    INSERT INTO "lenh_san_xuat" (
                        ma_lenh, organization_id, don_hang_chi_tiet_id, quy_trinh_id,
                        trang_thai, tien_do, nguoi_phu_trach
                    ) VALUES (
                        ${maLenh}, 
                        ${staff.organization_id},
                        ${newItem.id}, ${quyTrinhId},
                        'moi', 0, NULL -- NULL = Chưa ai nhận (Available Job)
                    )
                `;
      }
    }

    // 4. Ghi nhận Thu tiền (nếu khách trả ngay)
    if (orderData.da_thanh_toan > 0) {
      await sql`
                INSERT INTO "so_cai_tai_chinh" (
                    loai_giao_dich, so_tien, mo_ta, tham_chieu_id, nguoi_thuc_hien, organization_id
                ) VALUES (
                    'thu', ${orderData.da_thanh_toan}, ${
        "Thu tiền đơn " + newOrder.ma_don
      }, ${newOrder.id}, ${staff.id}, ${staff.organization_id}
                )
            `;
    }

    // 🔔 GỬI THÔNG BÁO ĐA KÊNH
    // Logic: Báo cho Admin, Quản lý, Kho, Kế toán
    const targetRoles = ["admin", "boss", "quanly", "kho", "ketoan"];
    // Nếu có lệnh sản xuất -> Báo thêm cho Thợ
    if (hasJob) targetRoles.push("thosanxuat");

    sendNotificationToRoles(
      targetRoles,
      `Đơn hàng mới: ${newOrder.ma_don}`,
      `${staff.ho_ten} vừa chốt đơn thành công! Doanh thu: ${Number(
        orderData.tong_tien
      ).toLocaleString()}đ`,
      "/dathang", // Link mở danh sách đơn
      "order_created", // Icon
      staff.ho_ten
    );

    return { success: true, ma_don: newOrder.ma_don };
  } catch (error: any) {
    console.error("Lỗi tạo đơn POS:", error);
    return { success: false, error: error.message };
  }
}
