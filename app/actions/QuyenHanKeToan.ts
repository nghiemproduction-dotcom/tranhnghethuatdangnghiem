"use server";

import postgres from "postgres";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendNotificationToRoles } from "./NotificationAction"; // 🟢 IMPORT

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

async function requireAuth() {
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
  if (!user) throw new Error("Unauthorized");
  // Lấy thêm tên
  const [ns] = await sql`SELECT id, ho_ten FROM nhan_su WHERE id = ${user.id}`;
  return ns;
}

// 1. LẤY DANH SÁCH
export async function getThuChiDataAction(
  page: number,
  pageSize: number,
  search: string,
  filterType: string
) {
  try {
    await requireAuth();
    let query = `
            SELECT tc.*, ns.ho_ten as nguoi_thuc_hien_ten
            FROM "so_cai_tai_chinh" tc
            LEFT JOIN "nhan_su" ns ON tc.nguoi_thuc_hien = ns.id
            WHERE 1=1
        `;
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (mo_ta ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (filterType && filterType !== "all") {
      query += ` AND loai_giao_dich = $${paramCount}`;
      params.push(filterType);
      paramCount++;
    }

    const countQuery = `SELECT count(*) as total FROM (${query}) as sub`;
    const offset = (page - 1) * pageSize;
    query += ` ORDER BY tao_luc DESC LIMIT ${pageSize} OFFSET ${offset}`;

    const data = await sql.unsafe(query, params);
    const [countResult] = await sql.unsafe(countQuery, params);

    return {
      success: true,
      data: Array.from(data),
      total: Number(countResult.total),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. TẠO MỚI (Đã thêm Noti)
export async function createThuChiAction(data: any) {
  try {
    const user = await requireAuth();
    await sql.unsafe(
      `
            INSERT INTO "so_cai_tai_chinh" (
                loai_giao_dich, so_tien, mo_ta, hinh_anh_chung_tu, nguoi_thuc_hien
            )
            VALUES ($1, $2, $3, $4, $5)
        `,
      [
        data.loai_giao_dich,
        data.so_tien,
        data.mo_ta,
        data.hinh_anh_chung_tu,
        user.id,
      ]
    );

    // 🔔 BÁO CHO BOSS/ADMIN
    const typeText = data.loai_giao_dich === "thu" ? "Khoản thu" : "Khoản chi";
    const icon =
      data.loai_giao_dich === "thu" ? "payment_received" : "system_alert";

    sendNotificationToRoles(
      ["admin", "boss"],
      "Biến động tài chính",
      `${user.ho_ten} vừa tạo ${typeText}: ${Number(
        data.so_tien
      ).toLocaleString()}đ - ${data.mo_ta}`,
      "/phongketoan",
      icon,
      user.ho_ten
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 3. CẬP NHẬT
export async function updateThuChiAction(id: string, data: any) {
  try {
    const user = await requireAuth();
    await sql.unsafe(
      `
            UPDATE "so_cai_tai_chinh"
            SET loai_giao_dich = $1, so_tien = $2, mo_ta = $3, hinh_anh_chung_tu = $4
            WHERE id = $5
        `,
      [
        data.loai_giao_dich,
        data.so_tien,
        data.mo_ta,
        data.hinh_anh_chung_tu,
        id,
      ]
    );

    // 🔔 BÁO CẬP NHẬT
    sendNotificationToRoles(
      ["admin", "boss"],
      "Cập nhật tài chính",
      `${user.ho_ten} đã sửa giao dịch ${data.mo_ta}`,
      "/phongketoan",
      "system_update",
      user.ho_ten
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. XÓA
export async function deleteThuChiAction(id: string) {
  try {
    const user = await requireAuth();
    await sql.unsafe(`DELETE FROM "so_cai_tai_chinh" WHERE id = $1`, [id]);

    // 🔔 BÁO XÓA (Quan trọng với tiền nong)
    sendNotificationToRoles(
      ["admin", "boss"],
      "⚠️ Xóa giao dịch",
      `${user.ho_ten} đã xóa một giao dịch tài chính!`,
      "/phongketoan",
      "security_alert",
      user.ho_ten
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
