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
    return user.id;
}

// 1. LẤY DANH SÁCH TÁC PHẨM
export async function getTacPhamDataAction(page: number, pageSize: number, search: string, filterChatLieu: string) {
    try {
        await requireAuth();
        
        let query = `
            SELECT 
                tp.id, tp.kich_thuoc, tp.chat_lieu, tp.ky_thuat_thuc_hien,
                mtk.mo_ta as ten_mau_thiet_ke, 
                mtk.hinh_anh,
                tp.mau_thiet_ke as mau_thiet_ke_id
            FROM "tac_pham_trung_bay" tp
            JOIN "mau_thiet_ke" mtk ON tp.mau_thiet_ke = mtk.id
            WHERE 1=1
        `;
        
        const params: any[] = [];
        let paramCount = 1;

        if (search) {
            query += ` AND (mtk.mo_ta ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (filterChatLieu && filterChatLieu !== 'all') {
            query += ` AND tp.chat_lieu = $${paramCount}`;
            params.push(filterChatLieu);
            paramCount++;
        }

        query += ` ORDER BY tp.id DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
        
        const data = await sql.unsafe(query, params);
        return { success: true, data: Array.from(data) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 2. TẠO TÁC PHẨM MỚI
export async function createTacPhamAction(data: any) {
    try {
        await requireAuth();
        await sql`
            INSERT INTO "tac_pham_trung_bay" (mau_thiet_ke, kich_thuoc, chat_lieu, ky_thuat_thuc_hien)
            VALUES (${data.mau_thiet_ke}, ${data.kich_thuoc}, ${data.chat_lieu}, ${data.ky_thuat_thuc_hien})
        `;
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 3. CẬP NHẬT TÁC PHẨM
export async function updateTacPhamAction(id: string, data: any) {
    try {
        await requireAuth();
        await sql`
            UPDATE "tac_pham_trung_bay"
            SET mau_thiet_ke = ${data.mau_thiet_ke},
                kich_thuoc = ${data.kich_thuoc},
                chat_lieu = ${data.chat_lieu},
                ky_thuat_thuc_hien = ${data.ky_thuat_thuc_hien}
            WHERE id = ${id}
        `;
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 4. XÓA TÁC PHẨM
export async function deleteTacPhamAction(id: string) {
    try {
        await requireAuth();
        await sql`DELETE FROM "tac_pham_trung_bay" WHERE id = ${id}`;
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}