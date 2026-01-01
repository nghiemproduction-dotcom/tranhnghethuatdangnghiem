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

// 1. LẤY DANH SÁCH MẪU THIẾT KẾ
export async function getDesignDataAction(page: number, pageSize: number, search: string, filterStatus: string) {
    try {
        await requireAuth();
        // Lấy dữ liệu từ bảng quy_trinh_mau (đại diện cho mẫu) hoặc bảng riêng nếu Boss muốn tách
        // Ở đây em dùng bảng 'vat_tu' loại 'thanh_pham' làm mẫu thiết kế để đồng bộ
        let query = `SELECT * FROM "vat_tu" WHERE loai_vat_tu = 'thanh_pham'`;
        const params: any[] = [];
        let paramCount = 1;

        if (search) {
            query += ` AND (ten_vat_tu ILIKE $${paramCount} OR ma_sku ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }
        
        // Filter theo bộ sưu tập
        if (filterStatus && filterStatus !== 'all') {
            query += ` AND bo_suu_tap = $${paramCount}`;
            params.push(filterStatus);
            paramCount++;
        }

        const countQuery = query.replace('SELECT *', 'SELECT count(*) as total');
        const offset = (page - 1) * pageSize;
        query += ` ORDER BY ten_vat_tu ASC LIMIT ${pageSize} OFFSET ${offset}`;

        const data = await sql.unsafe(query, params);
        const [countResult] = await sql.unsafe(countQuery, params);

        return { success: true, data: Array.from(data), total: Number(countResult.total) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 2. CẬP NHẬT FILE THIẾT KẾ (Lưu link file vào metadata)
export async function updateDesignFileAction(id: string, fileUrl: string, note: string) {
    try {
        await requireAuth();
        // Lưu link file gốc vào cột metadata json
        await sql.unsafe(`
            UPDATE "vat_tu"
            SET metadata = jsonb_set(
                COALESCE(metadata, '{}'::jsonb), 
                '{file_thiet_ke}', 
                $1::jsonb
            )
            WHERE id = $2
        `, [JSON.stringify({ url: fileUrl, note: note, updated_at: new Date().toISOString() }), id]);
        
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}