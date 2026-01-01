'use server';

import postgres from 'postgres';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Kết nối DB
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20, 
});

// 🛡️ 1. CHECK QUYỀN QUẢN LÝ (ADMIN + BOSS + QUANLY)
// 🟢 CẬP NHẬT: So sánh Email không phân biệt hoa thường (Case-insensitive)
async function requireManager() {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value },
                set() {}, remove() {},
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) throw new Error("Unauthorized: Bạn chưa đăng nhập");

    // Lấy thông tin nhân sự (Dùng lower(email) để chắc ăn)
    const [nhanSu] = await sql`
        SELECT vi_tri, vi_tri_normalized 
        FROM nhan_su 
        WHERE lower(email) = lower(${user.email})
        LIMIT 1
    `;
    
    // ✅ DANH SÁCH QUYỀN ĐƯỢC PHÉP
    const allowedRoles = ['admin', 'boss', 'quanly'];
    const userRoleNormalized = (nhanSu?.vi_tri_normalized || '').toLowerCase();
    
    const isAllowed = allowedRoles.includes(userRoleNormalized);

    if (!isAllowed) {
        throw new Error("Forbidden: Bạn không có quyền Quản Lý nghiệp vụ này");
    }
    
    return user; // Trả về user để dùng tiếp nếu cần
}

function validateIdentifier(name: string) {
    if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error("Tên bảng/cột không hợp lệ");
}

// --- 💬 NGHIỆP VỤ CHAT & HỖ TRỢ (MỚI BỔ SUNG) ---

// 1. Lấy danh sách tất cả phiên chat (Dành cho quản lý soi)
export async function getManagerChatSessionsAction(filterStatus: string = 'all') {
    try {
        await requireManager();

        let query = `
            SELECT 
                s.*,
                ns.ho_ten as ten_sales_phu_trach
            FROM tu_van_sessions s
            LEFT JOIN nhan_su ns ON s.nhan_su_phu_trach_id = ns.id
            WHERE 1=1
        `;

        if (filterStatus !== 'all') {
            query += ` AND s.trang_thai = '${filterStatus}'`;
        }

        query += ` ORDER BY s.cap_nhat_luc DESC LIMIT 100`;

        const data = await sql.unsafe(query);
        return { success: true, data: Array.from(data) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 2. Lấy nội dung tin nhắn của 1 phiên (Soi chi tiết)
export async function getManagerChatMessagesAction(sessionId: string) {
    try {
        await requireManager();

        const data = await sql`
            SELECT * FROM tu_van_messages 
            WHERE session_id = ${sessionId} 
            ORDER BY tao_luc ASC
        `;
        
        return { success: true, data: Array.from(data) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// --- 👥 NGHIỆP VỤ NHÂN SỰ ---

export async function getNhanSuDataAction(page: number, pageSize: number, search: string, filterRole: string) {
    try {
        await requireManager(); 
        
        let query = `SELECT * FROM "nhan_su" WHERE 1=1`;
        const params: any[] = [];
        let paramCount = 1;

        if (search) {
            query += ` AND (ho_ten ILIKE $${paramCount} OR so_dien_thoai ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (filterRole && filterRole !== 'all') {
            query += ` AND vi_tri_normalized = $${paramCount}`;
            params.push(filterRole);
            paramCount++;
        }

        const countQuery = query.replace('SELECT *', 'SELECT count(*) as total');
        const offset = (page - 1) * pageSize;
        query += ` ORDER BY tao_luc DESC LIMIT ${pageSize} OFFSET ${offset}`;

        const data = await sql.unsafe(query, params);
        const [countResult] = await sql.unsafe(countQuery, params);

        return { success: true, data: Array.from(data), total: Number(countResult.total) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function createNhanSuAction(data: any) {
    try {
        await requireManager();
        await sql.unsafe(`
            INSERT INTO "nhan_su" (
                ho_ten, so_dien_thoai, vi_tri, vi_tri_normalized, email, 
                trang_thai, luong_thang, thuong_doanh_thu, 
                ngan_hang, so_tai_khoan, hinh_anh
            )
            VALUES ($1, $2, $3, $4, $5, 'Đang hoạt động', $6, $7, $8, $9, $10)
        `, [
            data.ho_ten, data.so_dien_thoai, data.vi_tri, data.vi_tri_normalized, data.email,
            data.luong_thang || 0, data.thuong_doanh_thu || 0,
            data.ngan_hang || null, data.so_tai_khoan || null, data.hinh_anh || null
        ]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function updateNhanSuAction(id: string, data: any) {
    try {
        await requireManager();
        await sql.unsafe(`
            UPDATE "nhan_su"
            SET ho_ten = $1, so_dien_thoai = $2, vi_tri = $3, vi_tri_normalized = $4, email = $5,
                luong_thang = $6, thuong_doanh_thu = $7, ngan_hang = $8, so_tai_khoan = $9, hinh_anh = $10
            WHERE id = $11
        `, [
            data.ho_ten, data.so_dien_thoai, data.vi_tri, data.vi_tri_normalized, data.email || '',
            data.luong_thang || 0, data.thuong_doanh_thu || 0,
            data.ngan_hang || null, data.so_tai_khoan || null, data.hinh_anh || null,
            id
        ]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function deleteNhanSuAction(id: string) {
    try {
        await requireManager();
        await sql.unsafe(`DELETE FROM "nhan_su" WHERE id = $1`, [id]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function bulkUpdateNhanSuAction(ids: string[], data: { vi_tri?: string; vi_tri_normalized?: string }) {
    try {
        await requireManager();
        if (!ids.length) return { success: false, error: 'Chưa chọn nhân sự' };

        const setClauses: string[] = [];
        const params: any[] = [];
        let paramCount = 1;

        if (data.vi_tri) { setClauses.push(`vi_tri = $${paramCount}`); params.push(data.vi_tri); paramCount++; }
        if (data.vi_tri_normalized) { setClauses.push(`vi_tri_normalized = $${paramCount}`); params.push(data.vi_tri_normalized); paramCount++; }

        const idPlaceholders = ids.map((_, i) => `$${paramCount + i}`).join(', ');
        params.push(...ids);

        await sql.unsafe(`UPDATE "nhan_su" SET ${setClauses.join(', ')} WHERE id IN (${idPlaceholders})`, params);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// --- 🤝 NGHIỆP VỤ KHÁCH HÀNG ---

export async function getKhachHangDataAction(page: number, pageSize: number, search: string, filterRole: string) {
    try {
        await requireManager();
        let query = `SELECT * FROM "khach_hang" WHERE 1=1`;
        const params: any[] = [];
        let paramCount = 1;

        if (search) {
            query += ` AND (ho_ten ILIKE $${paramCount} OR so_dien_thoai ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }
        if (filterRole && filterRole !== 'all') {
            query += ` AND phan_loai_normalized = $${paramCount}`;
            params.push(filterRole);
            paramCount++;
        }

        const countQuery = query.replace('SELECT *', 'SELECT count(*) as total');
        const offset = (page - 1) * pageSize;
        query += ` ORDER BY tao_luc DESC LIMIT ${pageSize} OFFSET ${offset}`;

        const data = await sql.unsafe(query, params);
        const [countResult] = await sql.unsafe(countQuery, params);

        return { success: true, data: Array.from(data), total: Number(countResult.total) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function createKhachHangAction(data: any) {
    try {
        await requireManager();
        const phanLoaiNorm = data.phan_loai_normalized || (data.phan_loai ? data.phan_loai.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "") : 'moi');
        
        await sql.unsafe(`
            INSERT INTO "khach_hang" (ho_ten, so_dien_thoai, email, phan_loai, phan_loai_normalized, hinh_anh, dia_chi, tao_luc)
            VALUES ($1, $2, $3, $4, $5, $6, $7, now())
        `, [data.ho_ten, data.so_dien_thoai, data.email, data.phan_loai, phanLoaiNorm, data.hinh_anh || null, data.dia_chi || null]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function updateKhachHangAction(id: string, data: any) {
    try {
        await requireManager();
        const phanLoaiNorm = data.phan_loai_normalized || (data.phan_loai ? data.phan_loai.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "") : 'moi');

        await sql.unsafe(`
            UPDATE "khach_hang"
            SET ho_ten = $1, so_dien_thoai = $2, email = $3, phan_loai = $4, phan_loai_normalized = $5, hinh_anh = $6, dia_chi = $7
            WHERE id = $8
        `, [data.ho_ten, data.so_dien_thoai, data.email, data.phan_loai, phanLoaiNorm, data.hinh_anh || null, data.dia_chi || null, id]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function deleteKhachHangAction(id: string) {
    try {
        await requireManager();
        await sql.unsafe(`DELETE FROM "khach_hang" WHERE id = $1`, [id]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function bulkUpdateKhachHangAction(ids: string[], data: { phan_loai?: string; phan_loai_normalized?: string }) {
    try {
        await requireManager();
        if (!ids.length) return { success: false, error: 'Chưa chọn khách hàng' };

        const setClauses: string[] = [];
        const params: any[] = [];
        let paramCount = 1;

        if (data.phan_loai) { setClauses.push(`phan_loai = $${paramCount}`); params.push(data.phan_loai); paramCount++; }
        if (data.phan_loai_normalized) { setClauses.push(`phan_loai_normalized = $${paramCount}`); params.push(data.phan_loai_normalized); paramCount++; }

        const idPlaceholders = ids.map((_, i) => `$${paramCount + i}`).join(', ');
        params.push(...ids);

        await sql.unsafe(`UPDATE "khach_hang" SET ${setClauses.join(', ')} WHERE id IN (${idPlaceholders})`, params);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// --- UTILS (Dropdowns) ---
export async function getDistinctValuesAction(tableName: string, columnName: string) {
    try {
        await requireManager(); // Quản lý cần dùng cái này để load dropdown
        validateIdentifier(tableName); validateIdentifier(columnName);
        
        const data = await sql.unsafe(`
            SELECT DISTINCT "${columnName}" FROM "${tableName}" 
            WHERE "${columnName}" IS NOT NULL AND "${columnName}" != ''
            ORDER BY "${columnName}" ASC
        `);
        return { success: true, data: Array.from(data).map(row => row[columnName]) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 🟢 LẤY TÁC PHẨM HOÀN THIỆN (Dữ liệu cho Phòng Trưng Bày)
export async function getFinishedArtworksAction(limit: number = 50) {
    try {
        await requireManager(); 

        const data = await sql`
            SELECT 
                nk.id, 
                nk.anh_thanh_pham, 
                nk.thoi_gian_ket_thuc,
                ns.ho_ten as ten_nghe_nhan,
                vt.ten_vat_tu as ten_tac_pham,
                vt.ma_sku,
                dh.ma_don
            FROM nhat_ky_san_xuat nk
            JOIN nhan_su ns ON nk.nhan_su_thuc_hien = ns.id
            JOIN lenh_san_xuat lsx ON nk.lenh_san_xuat_id = lsx.id
            JOIN don_hang_chi_tiet dhct ON lsx.don_hang_chi_tiet_id = dhct.id
            JOIN don_hang dh ON dhct.don_hang_id = dh.id
            JOIN vat_tu vt ON dhct.vat_tu_id = vt.id
            WHERE nk.anh_thanh_pham IS NOT NULL 
            AND nk.ket_qua = 'dat'
            ORDER BY nk.thoi_gian_ket_thuc DESC
            LIMIT ${limit}
        `;
        
        return { success: true, data: Array.from(data) };
    } catch (error: any) { 
        return { success: false, error: error.message }; 
    }
}