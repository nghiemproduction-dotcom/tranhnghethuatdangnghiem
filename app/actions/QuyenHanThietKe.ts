"use server";
import postgres from "postgres";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// 👇 IMPORT MỚI: Action gửi thông báo trung tâm
import { sendNotificationToRoles } from "./NotificationAction";

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  max: 10,
  idle_timeout: 20,
});

// --- HELPER: CHUẨN HÓA TÊN FILE (Chỉ xử lý text, không gắn user) ---
const standardizeBasicName = (inputName: string) => {
  let name = inputName.trim();

  // 1. Viết hoa chữ cái đầu (VD: "thọ" -> "Thọ")
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  // 2. Tự động thêm "cm" và dấu gạch ngang cho kích thước
  // VD: "20x30" -> " - 20x30cm"
  name = name.replace(/(\d+)\s*[xX*]\s*(\d+)\s*(cm|CM)?/g, (match, w, h) => {
    return ` - ${w}x${h}cm`;
  });

  // 3. Xử lý dấu gạch ngang bị thừa
  name = name
    .replace(/\s*-\s*-\s*/g, " - ")
    .replace(/\s*-\s*/g, " - ")
    .replace(/^\s*-\s*/, "");

  return name;
};

// --- HELPER: XỬ LÝ LIST FILE TRƯỚC KHI LƯU ---
const processFileList = (input: any, currentUser: string) => {
  if (!input) return "[]";

  let files: any[] = [];

  // Parse dữ liệu đầu vào
  try {
    if (Array.isArray(input)) files = input;
    else if (typeof input === "string") {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) files = parsed;
    }
  } catch {
    return "[]";
  }

  // Xử lý từng file
  const processedFiles = files
    .map((file: any) => {
      const now = new Date().toISOString();

      // TRƯỜNG HỢP 1: File là string (kiểu cũ) -> convert sang object mới
      if (typeof file === "string") {
        return {
          ten: standardizeBasicName("File đính kèm"),
          url: file,
          nguoi_dang: currentUser, // Gắn người đang sửa vì file cũ chưa có info
          last_modified: now,
        };
      }

      // TRƯỜNG HỢP 2: Là object chuẩn
      if (typeof file === "object" && file.url) {
        // Logic bảo toàn lịch sử:
        // - Nếu file đã có 'nguoi_dang' (file cũ) -> Giữ nguyên.
        // - Nếu chưa có (file mới thêm) -> Gán currentUser.
        const uploader = file.nguoi_dang || currentUser;

        // - Nếu file cũ -> Giữ nguyên thời gian.
        // - Nếu mới -> Lấy thời gian hiện tại.
        const timestamp = file.last_modified || now;

        return {
          ...file,
          // Luôn chuẩn hóa lại tên (để sửa lỗi chính tả nếu user mới nhập)
          ten: standardizeBasicName(file.ten || "File thiết kế"),
          nguoi_dang: uploader,
          last_modified: timestamp,
        };
      }
      return null;
    })
    .filter(Boolean); // Lọc bỏ null

  return JSON.stringify(processedFiles);
};

// --- CORE AUTH ---
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

async function checkOwnershipOrAdmin(
  userEmail: string,
  resourceId?: string,
  action: "update" | "delete" = "update"
) {
  const [nhanSu] = await sql`
        SELECT id, vi_tri_normalized, ho_ten 
        FROM nhan_su 
        WHERE email = ${userEmail}
    `;

  if (!nhanSu) throw new Error("Không tìm thấy thông tin nhân sự.");

  const role = nhanSu.vi_tri_normalized || "";
  const isAdmin = ["admin", "quanly", "boss"].includes(role);

  // Trả về cả info nhân sự để dùng tên
  const userInfo = { id: nhanSu.id, name: nhanSu.ho_ten || "Nhân viên" };

  if (isAdmin) return userInfo;

  if (action === "delete") {
    throw new Error("⛔ Bạn không có quyền xóa (Chỉ Admin mới được xóa).");
  }

  if (resourceId) {
    const [mau] =
      await sql`SELECT nguoi_tao FROM mau_thiet_ke WHERE id = ${resourceId}`;
    if (!mau) throw new Error("Mẫu không tồn tại.");
    if (mau.nguoi_tao !== nhanSu.id) {
      throw new Error("⛔ Bạn chỉ được phép sửa mẫu do chính mình tạo ra.");
    }
  }
  return userInfo;
}

// --- ACTIONS ---

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

    if (search) {
      query += ` AND (m.mo_ta ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (filterCategory && filterCategory !== "all") {
      if (filterCategory === "has_file") {
        query += ` AND m.file_thiet_ke IS NOT NULL AND m.file_thiet_ke::text != '[]' AND m.file_thiet_ke::text != '' `;
      } else {
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

export async function createMauThietKeAction(data: any) {
  try {
    const user = await requireAuth();
    // Lấy thông tin người dùng đang thao tác
    const [nhanSu] = await sql`SELECT id, ho_ten FROM nhan_su WHERE email = ${
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

    // 🟢 TỰ ĐỘNG CHUẨN HÓA TÊN FILE + GẮN NGƯỜI TẠO
    const fileThietKeJson = processFileList(
      data.file_thiet_ke,
      nhanSu.ho_ten || "Admin"
    );

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

    // 🔔 GỬI THÔNG BÁO TỰ ĐỘNG
    // Logic: Báo cho Admin, Boss, Quản lý và Phòng Thiết kế
    sendNotificationToRoles(
      ["admin", "boss", "quanly", "thietke"],
      "Mẫu thiết kế mới",
      `${nhanSu.ho_ten} vừa thêm mẫu: "${data.mo_ta}"`,
      "/phongthietke", // Link mở khi click
      "artwork_new", // Icon type
      nhanSu.ho_ten // Người gửi
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMauThietKeAction(id: string, data: any) {
  try {
    const user = await requireAuth();
    // Check quyền và lấy luôn thông tin người đang sửa (currentUser)
    const currentUser = await checkOwnershipOrAdmin(
      user.email || "",
      id,
      "update"
    );

    const phanLoaiNorm =
      data.phan_loai_normalized ||
      (data.phan_loai
        ? data.phan_loai
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "")
            .toLowerCase()
        : "");

    // 🟢 TỰ ĐỘNG CHUẨN HÓA TÊN FILE
    const fileThietKeJson = processFileList(
      data.file_thiet_ke,
      currentUser.name || "Admin"
    );

    await sql.unsafe(
      `
            UPDATE "mau_thiet_ke"
            SET mo_ta = $1,
                phan_loai = $2,
                phan_loai_normalized = $3,
                hinh_anh = $4,
                file_thiet_ke = $5,
                tao_luc = now()
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

    // 🔔 GỬI THÔNG BÁO CẬP NHẬT
    sendNotificationToRoles(
      ["admin", "boss", "quanly", "thietke"],
      "Cập nhật mẫu thiết kế",
      `${currentUser.name} vừa cập nhật mẫu: "${data.mo_ta}"`,
      "/phongthietke",
      "system_update",
      currentUser.name
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMauThietKeAction(id: string) {
  try {
    const user = await requireAuth();
    const currentUser = await checkOwnershipOrAdmin(
      user.email || "",
      id,
      "delete"
    );

    await sql.unsafe(`DELETE FROM "mau_thiet_ke" WHERE id = $1`, [id]);

    // 🔔 GỬI THÔNG BÁO XÓA (Chỉ báo cho Admin/Boss biết có người xóa)
    sendNotificationToRoles(
      ["admin", "boss"],
      "Đã xóa mẫu thiết kế",
      `${currentUser.name} đã xóa một mẫu thiết kế khỏi hệ thống.`,
      "/phongthietke",
      "system_alert",
      currentUser.name
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
