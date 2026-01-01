'use server';
import postgres from 'postgres';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

// Hàm check quyền (Clone từ QuyenHanQuanLy)
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

// --- QUẢN LÝ VẬT TƯ ---
export async function getVatTuDataAction(page: number, pageSize: number, search: string, filterGroup: string) {
    try {
        await requireAuth();
        let query = `SELECT * FROM "vat_tu" WHERE 1=1`;
        const params: any[] = [];
        let paramCount = 1;

        if (search) {
            query += ` AND (ten_vat_tu ILIKE $${paramCount} OR ma_sku ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        // Lọc theo loại (Nguyên liệu / Thành phẩm)
        if (filterGroup && filterGroup !== 'all') {
            query += ` AND loai_vat_tu = $${paramCount}`;
            params.push(filterGroup);
            paramCount++;
        }

        const countQuery = query.replace('SELECT *', 'SELECT count(*) as total');
        const offset = (page - 1) * pageSize;
        query += ` ORDER BY ton_kho ASC, ten_vat_tu ASC LIMIT ${pageSize} OFFSET ${offset}`; // Ưu tiên hiện hàng sắp hết

        const data = await sql.unsafe(query, params);
        const [countResult] = await sql.unsafe(countQuery, params);

        return { success: true, data: Array.from(data), total: Number(countResult.total) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function createVatTuAction(data: any) {
    try {
        await requireAuth();
        await sql.unsafe(`
            INSERT INTO "vat_tu" (ma_sku, ten_vat_tu, loai_vat_tu, don_vi_tinh, gia_von, gia_ban, ton_kho, canh_bao_toi_thieu, hinh_anh)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            data.ma_sku, data.ten_vat_tu, data.loai_vat_tu, data.don_vi_tinh,
            data.gia_von || 0, data.gia_ban || 0, data.ton_kho || 0, data.canh_bao_toi_thieu || 10,
            data.hinh_anh
        ]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function updateVatTuAction(id: string, data: any) {
    try {
        await requireAuth();
        await sql.unsafe(`
            UPDATE "vat_tu"
            SET ma_sku = $1, ten_vat_tu = $2, loai_vat_tu = $3, don_vi_tinh = $4,
                gia_von = $5, gia_ban = $6, ton_kho = $7, canh_bao_toi_thieu = $8, hinh_anh = $9
            WHERE id = $10
        `, [
            data.ma_sku, data.ten_vat_tu, data.loai_vat_tu, data.don_vi_tinh,
            data.gia_von, data.gia_ban, data.ton_kho, data.canh_bao_toi_thieu,
            data.hinh_anh, id
        ]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function deleteVatTuAction(id: string) {
    try {
        await requireAuth();
        await sql.unsafe(`DELETE FROM "vat_tu" WHERE id = $1`, [id]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}