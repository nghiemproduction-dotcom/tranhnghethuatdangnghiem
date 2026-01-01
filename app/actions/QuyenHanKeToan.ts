'use server';

import postgres from 'postgres';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function requireAuth() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value }, set() {}, remove() {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return user;
}

// 1. LẤY DANH SÁCH
export async function getThuChiDataAction(page: number, pageSize: number, search: string, filterType: string) {
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

        if (filterType && filterType !== 'all') {
            query += ` AND loai_giao_dich = $${paramCount}`;
            params.push(filterType);
            paramCount++;
        }

        const countQuery = `SELECT count(*) as total FROM (${query}) as sub`;
        const offset = (page - 1) * pageSize;
        query += ` ORDER BY tao_luc DESC LIMIT ${pageSize} OFFSET ${offset}`;

        const data = await sql.unsafe(query, params);
        const [countResult] = await sql.unsafe(countQuery, params);

        return { success: true, data: Array.from(data), total: Number(countResult.total) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 2. TẠO MỚI (Đã thêm)
export async function createThuChiAction(data: any) {
    try {
        const user = await requireAuth();
        await sql.unsafe(`
            INSERT INTO "so_cai_tai_chinh" (
                loai_giao_dich, so_tien, mo_ta, hinh_anh_chung_tu, nguoi_thuc_hien
            )
            VALUES ($1, $2, $3, $4, $5)
        `, [
            data.loai_giao_dich, data.so_tien, data.mo_ta, data.hinh_anh_chung_tu, user.id
        ]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 3. CẬP NHẬT (Đã thêm)
export async function updateThuChiAction(id: string, data: any) {
    try {
        await requireAuth();
        await sql.unsafe(`
            UPDATE "so_cai_tai_chinh"
            SET loai_giao_dich = $1, so_tien = $2, mo_ta = $3, hinh_anh_chung_tu = $4
            WHERE id = $5
        `, [
            data.loai_giao_dich, data.so_tien, data.mo_ta, data.hinh_anh_chung_tu, id
        ]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 4. XÓA (Đã thêm - Cái Boss đang thiếu)
export async function deleteThuChiAction(id: string) {
    try {
        await requireAuth();
        await sql.unsafe(`DELETE FROM "so_cai_tai_chinh" WHERE id = $1`, [id]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}