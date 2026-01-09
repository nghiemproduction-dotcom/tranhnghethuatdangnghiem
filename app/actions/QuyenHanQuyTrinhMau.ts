'use server';

import postgres from 'postgres';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function requireAuth() {
    // 🟢 FIX: Thêm await
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value }, set() {}, remove() {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return user.id; // Trả về ID của user (Admin)
}

// 1. LẤY DANH SÁCH
export async function getQuyTrinhMauAction(page: number, pageSize: number, search: string) {
    try {
        await requireAuth();
        
        let query = `
            SELECT 
                qt.id, qt.tao_luc,
                ns.ho_ten as nguoi_tao,
                
                -- Thông tin từ bảng tac_pham_trung_bay
                tp.kich_thuoc, tp.chat_lieu, tp.ky_thuat_thuc_hien,
                
                -- Thông tin từ bảng mau_thiet_ke
                mtk.mo_ta as ten_mau_thiet_ke, mtk.hinh_anh

            FROM "quy_trinh_san_xuat_mau" qt
            JOIN "tac_pham_trung_bay" tp ON qt.tac_pham_trung_bay = tp.id
            LEFT JOIN "mau_thiet_ke" mtk ON tp.mau_thiet_ke = mtk.id
            LEFT JOIN "nhan_su" ns ON qt.nguoi_tao = ns.id
            WHERE 1=1
        `;
        
        const params: any[] = [];
        if (search) {
            query += ` AND (mtk.mo_ta ILIKE $1 OR tp.chat_lieu ILIKE $1)`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY qt.tao_luc DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
        
        const data = await sql.unsafe(query, params);
        return { success: true, data: Array.from(data) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 2. TẠO MỚI (Insert vào cả 2 bảng)
export async function createQuyTrinhMauAction(data: any) {
    try {
        const userId = await requireAuth();

        await sql.begin(async sql => {
            // Bước 1: Tạo Tác Phẩm Trưng Bày trước
            const [tp] = await sql`
                INSERT INTO "tac_pham_trung_bay" (mau_thiet_ke, kich_thuoc, chat_lieu, ky_thuat_thuc_hien)
                VALUES (${data.mau_thiet_ke}, ${data.kich_thuoc}, ${data.chat_lieu}, ${data.ky_thuat_thuc_hien})
                RETURNING id
            `;

            // Bước 2: Tạo Quy Trình liên kết với Tác phẩm vừa tạo
            await sql`
                INSERT INTO "quy_trinh_san_xuat_mau" (nguoi_tao, tac_pham_trung_bay, tao_luc)
                VALUES (${userId}, ${tp.id}, now())
            `;
        });

        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 3. XÓA
export async function deleteQuyTrinhMauAction(id: string) {
    try {
        await requireAuth();
        // Do có ON DELETE CASCADE, chỉ cần xóa quy trình là tác phẩm đi theo (hoặc ngược lại tùy thiết kế DB, ở đây xóa bảng cha trước)
        await sql`DELETE FROM "quy_trinh_san_xuat_mau" WHERE id = ${id}`;
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 4. LẤY OPTION MẪU THIẾT KẾ (Cho dropdown)
export async function getMauThietKeOptionsAction() {
    try {
        await requireAuth();
        const data = await sql`SELECT id, mo_ta as label, hinh_anh FROM "mau_thiet_ke" ORDER BY tao_luc DESC`;
        return { success: true, data: Array.from(data) };
    } catch (error: any) { return { success: false, error: error.message }; }
}