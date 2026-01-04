"use server";
import postgres from "postgres";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// 👇 IMPORT MỚI
import { sendNotificationToRoles } from "./NotificationAction";

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
  // Lấy thêm tên để gửi noti
  const [ns] = await sql`SELECT id, ho_ten FROM nhan_su WHERE id = ${user.id}`;
  return ns;
}

// 1. LẤY VIỆC CỦA TÔI (Đã nhận, chưa xong)
export async function getMyTasksAction() {
  try {
    const user = await requireAuth();

    const data = await sql`
            SELECT 
                lsx.id, lsx.ma_lenh, lsx.trang_thai, lsx.tien_do, lsx.bat_dau_luc,
                ct.ten_item_hien_thi, ct.so_luong,
                qt.ten_quy_trinh,
                dh.ma_don, dh.ghi_chu as ghi_chu_don
            FROM "lenh_san_xuat" lsx
            JOIN "don_hang_chi_tiet" ct ON lsx.don_hang_chi_tiet_id = ct.id
            JOIN "don_hang" dh ON ct.don_hang_id = dh.id
            LEFT JOIN "quy_trinh_mau" qt ON lsx.quy_trinh_id = qt.id
            WHERE lsx.nguoi_phu_trach = ${user.id}
            AND lsx.trang_thai != 'hoan_thanh'
            ORDER BY dh.tao_luc ASC
        `;

    return { success: true, data: Array.from(data) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. LẤY VIỆC MỚI (Sàn việc - Chưa ai nhận)
export async function getAvailableJobsAction() {
  try {
    await requireAuth();

    // Lấy các lệnh SX mà nguoi_phu_trach là NULL
    const data = await sql`
            SELECT 
                lsx.id, lsx.ma_lenh, lsx.trang_thai,
                ct.ten_item_hien_thi, ct.so_luong,
                qt.ten_quy_trinh,
                dh.ma_don, dh.ghi_chu as ghi_chu_don
            FROM "lenh_san_xuat" lsx
            JOIN "don_hang_chi_tiet" ct ON lsx.don_hang_chi_tiet_id = ct.id
            JOIN "don_hang" dh ON ct.don_hang_id = dh.id
            LEFT JOIN "quy_trinh_mau" qt ON lsx.quy_trinh_id = qt.id
            WHERE lsx.nguoi_phu_trach IS NULL 
            AND lsx.trang_thai = 'moi'
            ORDER BY dh.tao_luc DESC
            LIMIT 50
        `;
    return { success: true, data: Array.from(data) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 3. NHẬN VIỆC (Claim Job)
export async function claimJobAction(jobId: string) {
  try {
    const user = await requireAuth();

    // Update người phụ trách = User đang login
    const result = await sql`
            UPDATE "lenh_san_xuat"
            SET nguoi_phu_trach = ${user.id},
                trang_thai = 'dang_lam',
                bat_dau_luc = NOW()
            WHERE id = ${jobId} 
            AND nguoi_phu_trach IS NULL
            RETURNING ma_lenh
        `;

    if (result.count === 0) {
      return {
        success: false,
        error: "Công việc này đã bị người khác nhận mất rồi!",
      };
    }

    // 🔔 BÁO QUẢN LÝ
    sendNotificationToRoles(
      ["admin", "quanly"],
      "Tiến độ sản xuất",
      `Thợ ${user.ho_ten} đã nhận lệnh sản xuất: ${result[0].ma_lenh}`,
      "/phongsanxuat",
      "workshop_new",
      user.ho_ten
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. BẮT ĐẦU LÀM (Start Timer)
export async function startJobAction(jobId: string) {
  try {
    await requireAuth();
    await sql`
            UPDATE "lenh_san_xuat"
            SET trang_thai = 'dang_lam', 
                bat_dau_luc = COALESCE(bat_dau_luc, NOW()), -- Chỉ set nếu chưa có
                cap_nhat_luc = NOW()
            WHERE id = ${jobId}
        `;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 5. HOÀN THÀNH VIỆC (Finish & Get Paid)
export async function completeJobAction(
  jobId: string,
  resultImage: string,
  note: string
) {
  try {
    const user = await requireAuth();

    // Dùng transaction để đảm bảo tính toàn vẹn
    await sql.begin(async (sql) => {
      // A. Cập nhật Lệnh SX thành hoàn thành
      const [job] = await sql`
                UPDATE "lenh_san_xuat"
                SET trang_thai = 'hoan_thanh',
                    tien_do = 100,
                    ket_thuc_luc = NOW()
                WHERE id = ${jobId}
                RETURNING ma_lenh
            `;

      // B. Ghi nhật ký (Để kích hoạt Trigger tính lương)
      // Lấy thông tin từ lệnh sx để ghi log
      await sql`
                INSERT INTO "nhat_ky_san_xuat" (
                    lenh_san_xuat_id, nhan_su_thuc_hien, 
                    thoi_gian_bat_dau, thoi_gian_ket_thuc,
                    ket_qua, anh_thanh_pham, diem_thuong_nhan_duoc
                )
                SELECT 
                    id, ${user.id}, 
                    bat_dau_luc, NOW(),
                    'dat', ${resultImage}, 10 -- Thưởng mặc định 10 điểm
                FROM "lenh_san_xuat"
                WHERE id = ${jobId}
            `;

      // 🔔 BÁO SALES & ADMIN ĐỂ GIAO HÀNG
      sendNotificationToRoles(
        ["admin", "quanly", "sales"],
        "Sản xuất hoàn tất ✅",
        `${user.ho_ten} đã hoàn thành lệnh ${job.ma_lenh}. Sản phẩm đã sẵn sàng giao!`,
        "/phongsanxuat",
        "artwork_featured",
        user.ho_ten
      );
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 6. LẤY LƯƠNG HÔM NAY (Motivational Metric)
export async function getMySalaryToday() {
  try {
    const user = await requireAuth();
    // Tính tổng lương của tháng hiện tại
    const [res] = await sql`
            SELECT SUM(tong_thu_nhap) as total
            FROM "bang_luong"
            WHERE nhan_su_id = ${user.id}
            AND thang = EXTRACT(MONTH FROM CURRENT_DATE)
            AND nam = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
    return { success: true, total: Number(res?.total || 0) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
