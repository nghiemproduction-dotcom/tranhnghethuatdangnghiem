"use server";
import postgres from "postgres";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  max: 10,
  idle_timeout: 20,
});

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
  if (!user || !user.email) throw new Error("Unauthorized: Vui lòng đăng nhập");
  return user;
}

// 🛡️ HÀM KIỂM TRA QUYỀN SỞ HỮU (CORE LOGIC)
// Trả về: true nếu được phép, throw Error nếu không
async function checkOwnershipOrAdmin(
  userEmail: string,
  resourceId?: string,
  action: "update" | "delete" = "update"
) {
  // 1. Lấy thông tin nhân sự đang thao tác
  const [nhanSu] = await sql`
        SELECT id, vi_tri_normalized 
        FROM nhan_su 
        WHERE email = ${userEmail}
    `;

  if (!nhanSu) throw new Error("Không tìm thấy thông tin nhân sự của bạn.");

  const role = nhanSu.vi_tri_normalized || "";
  // Danh sách các vai trò được coi là Admin
  const isAdmin = ["admin", "quanly", "boss"].includes(role);

  // 2. Nếu là Admin -> Cho phép hết
  if (isAdmin) return true;

  // 3. Nếu là Xóa -> CHẶN NGAY nếu không phải Admin
  if (action === "delete") {
    throw new Error("⛔ Bạn không có quyền xóa (Chỉ Admin mới được xóa).");
  }

  // 4. Nếu là Sửa -> Kiểm tra "Chính chủ"
  if (resourceId) {
    const [mau] = await sql`
            SELECT nguoi_tao FROM mau_thiet_ke WHERE id = ${resourceId}
        `;

    if (!mau) throw new Error("Mẫu thiết kế không tồn tại.");

    // So sánh ID người tạo với ID nhân sự đang login
    if (mau.nguoi_tao !== nhanSu.id) {
      throw new Error("⛔ Bạn chỉ được phép sửa mẫu do chính mình tạo ra.");
    }
  }

  return true;
}

// --- CÁC HÀM XỬ LÝ CHÍNH ---

// 1. LẤY DANH SÁCH (ĐÃ UPDATE LỌC HAS_FILE)
export async function getMauThietKeDataAction(
  page: number,
  pageSize: number,
  search: string,
  filterCategory: string
) {
  try {
    await requireAuth();
    let query = `
            SELECT m.*, n.ho_ten as ten_nguoi_tao 
            FROM "mau_thiet_ke" m
            LEFT JOIN "nhan_su" n ON m.nguoi_tao = n.id
            WHERE 1=1
        `;
    const params: any[] = [];
    let paramCount = 1;

    // Tìm kiếm
    if (search) {
      query += ` AND (m.mo_ta ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Lọc theo Tab (Phân loại hoặc Has File)
    if (filterCategory && filterCategory !== "all") {
      // 🟢 FIX: Xử lý trường hợp lọc "Đã có file"
      if (filterCategory === "has_file") {
        // Kiểm tra file_thiet_ke khác null, khác chuỗi rỗng và khác mảng rỗng '[]'
        query += ` AND m.file_thiet_ke IS NOT NULL AND m.file_thiet_ke::text != '[]' AND m.file_thiet_ke::text != '' `;
      } else {
        // Lọc phân loại bình thường
        query += ` AND m.phan_loai_normalized = $${paramCount}`;
        params.push(filterCategory);
        paramCount++;
      }
    }

    const countQuery = `SELECT count(*) as total FROM (${query}) as sub`;
    const offset = (page - 1) * pageSize;
    query += ` ORDER BY m.tao_luc DESC LIMIT ${pageSize} OFFSET ${offset}`;

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

// 2. TẠO MỚI MẪU
export async function createMauThietKeAction(data: any) {
  try {
    const user = await requireAuth();
    const [nhanSu] = await sql`SELECT id FROM nhan_su WHERE email = ${
      user.email || ""
    }`;

    if (!nhanSu) throw new Error("Không xác định được danh tính nhân sự.");

    const phanLoaiNorm =
      data.phan_loai_normalized ||
      (data.phan_loai
        ? data.phan_loai
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "")
            .toLowerCase()
        : "");

    // Chuẩn bị file thiết kế (đảm bảo là JSON string)
    const fileThietKeJson = JSON.stringify(data.file_thiet_ke || []);

    await sql.unsafe(
      `
            INSERT INTO "mau_thiet_ke" (
                mo_ta, phan_loai, phan_loai_normalized, hinh_anh, 
                file_thiet_ke, nguoi_tao, tao_luc
            )
            VALUES ($1, $2, $3, $4, $5, $6, now())
        `,
      [
        data.mo_ta,
        data.phan_loai,
        phanLoaiNorm,
        data.hinh_anh,
        fileThietKeJson,
        nhanSu.id,
      ]
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 3. CẬP NHẬT MẪU (Có check quyền)
export async function updateMauThietKeAction(id: string, data: any) {
  try {
    const user = await requireAuth();
    // Check: Admin hoặc Chính chủ mới được sửa
    await checkOwnershipOrAdmin(user.email || "", id, "update");

    const phanLoaiNorm =
      data.phan_loai_normalized ||
      (data.phan_loai
        ? data.phan_loai
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "")
            .toLowerCase()
        : "");

    const fileThietKeJson = JSON.stringify(data.file_thiet_ke || []);

    await sql.unsafe(
      `
            UPDATE "mau_thiet_ke"
            SET mo_ta = $1,
                phan_loai = $2,
                phan_loai_normalized = $3,
                hinh_anh = $4,
                file_thiet_ke = $5
            WHERE id = $6
        `,
      [
        data.mo_ta,
        data.phan_loai,
        phanLoaiNorm,
        data.hinh_anh,
        fileThietKeJson,
        id,
      ]
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. XÓA (Chỉ Admin)
export async function deleteMauThietKeAction(id: string) {
  try {
    const user = await requireAuth();

    // Check: Chỉ Admin mới được xóa
    await checkOwnershipOrAdmin(user.email || "", id, "delete");

    await sql.unsafe(`DELETE FROM "mau_thiet_ke" WHERE id = $1`, [id]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
