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

// 🛡️ 1. CHECK QUYỀN SUPER ADMIN (CHỈ ADMIN & BOSS)
async function requireSuperAdmin() {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value },
                set(name: string, value: string, options: any) {},
                remove(name: string, options: any) {},
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) throw new Error("Unauthorized: Bạn chưa đăng nhập");

    const { data: nhanSu } = await supabase
        .from('nhan_su')
        .select('vi_tri, vi_tri_normalized')
        .eq('email', user.email)
        .single();
    
    // 🔒 CHỈ CHO PHÉP ADMIN VÀ BOSS
    const allowedRoles = ['admin', 'boss'];
    const userRoleNormalized = (nhanSu?.vi_tri_normalized || '').toLowerCase();
    
    const isAllowed = allowedRoles.includes(userRoleNormalized);

    if (!isAllowed) {
        throw new Error("Forbidden: Chỉ Super Admin mới có quyền truy cập System Core");
    }
}

// 🛡️ 2. VALIDATE INPUT
function validateIdentifier(name: string) {
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        throw new Error(`Tên không hợp lệ: ${name}. Chỉ chấp nhận chữ, số và gạch dưới.`);
    }
}

// --- CÁC HÀM HỆ THỐNG (SYSTEM ACTIONS) ---

// 1. LẤY DANH SÁCH BẢNG
export async function getTablesWithRLSAction() {
    try {
        await requireSuperAdmin();
        const tables = await sql`
            SELECT c.relname as table_name, c.relrowsecurity as rls_enabled
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relkind = 'r'
            ORDER BY c.relname;
        `;
        return { success: true, data: Array.from(tables).map(t => ({ table_name: t.table_name, rls_enabled: t.rls_enabled })) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 2. LẤY SCHEMA CẤU TRÚC BẢNG
export async function getTableSchemaAction(tableName: string) {
    try {
        await requireSuperAdmin();
        validateIdentifier(tableName);
        const columns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = ${tableName}
            ORDER BY ordinal_position;
        `;
        return { success: true, data: Array.from(columns) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 3. TOGGLE RLS (BẬT/TẮT BẢO MẬT)
export async function toggleRLSAction(tableName: string, enable: boolean) {
    try {
        await requireSuperAdmin();
        validateIdentifier(tableName);
        if (enable) {
            await sql.unsafe(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY`);
        } else {
            await sql.unsafe(`ALTER TABLE "${tableName}" DISABLE ROW LEVEL SECURITY`);
            await sql.unsafe(`GRANT ALL ON TABLE "${tableName}" TO anon, authenticated, service_role`);
        }
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 4. LẤY DỮ LIỆU THÔ (RAW DATA VIEWER)
export async function getTableDataPaginatedAction(tableName: string, page: number, pageSize: number) {
    try {
        await requireSuperAdmin();
        validateIdentifier(tableName);
        
        const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${tableName}`;
        const colNames = Array.from(columns).map(c => c.column_name);
        
        let sortCol = 'id';
        if (colNames.includes('tao_luc')) sortCol = 'tao_luc';
        else if (colNames.includes('created_at')) sortCol = 'created_at';
        else if (!colNames.includes('id') && colNames.length > 0) sortCol = colNames[0];

        const offset = (page - 1) * pageSize;
        const data = await sql.unsafe(`SELECT * FROM "${tableName}" ORDER BY "${sortCol}" DESC LIMIT ${pageSize} OFFSET ${offset}`);
        const [countResult] = await sql.unsafe(`SELECT count(*) as total FROM "${tableName}"`);
        
        return { success: true, data: Array.from(data), total: Number(countResult.total) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 5. CẬP NHẬT Ô DỮ LIỆU BẤT KỲ (RAW EDIT)
export async function updateTableCellAction(tableName: string, id: string, column: string, value: any) {
    try {
        await requireSuperAdmin();
        validateIdentifier(tableName);
        validateIdentifier(column);

        let finalValue = value === '' ? null : value;
        await sql.unsafe(`UPDATE "${tableName}" SET "${column}" = $1 WHERE id = $2`, [finalValue, id]);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 6. QUẢN LÝ CẤU TRÚC (CREATE TABLE / ALTER COLUMN)
export async function manageTableStructureAction(tableName: string, columnsDef: any[]) {
  try {
    await requireSuperAdmin();
    if (!tableName) throw new Error("Tên bảng trống");
    validateIdentifier(tableName);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        tao_luc timestamptz DEFAULT now()
      )
    `);

    // Tự động tắt RLS khi tạo bảng mới để tránh lỗi quyền
    try {
        await sql.unsafe(`ALTER TABLE "${tableName}" DISABLE ROW LEVEL SECURITY`);
        await sql.unsafe(`GRANT ALL ON TABLE "${tableName}" TO anon, authenticated, service_role`);
    } catch (e) {}

    for (const col of columnsDef) {
        if (['id', 'tao_luc'].includes(col.name)) continue;
        validateIdentifier(col.name);

        const [existing] = await sql`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${tableName} AND column_name = ${col.name}`;
        
        // ... (Logic xử lý default value giữ nguyên từ file cũ)
        let safeDefault = '';
        if (col.defaultValue !== undefined && col.defaultValue !== null && col.defaultValue !== '') {
             let val = String(col.defaultValue).trim();
             const isFunc = ['now()', 'true', 'false'].includes(val.toLowerCase()) || !isNaN(Number(val));
             safeDefault = isFunc ? val : `'${val.replace(/'/g, "''")}'`;
        }

        if (existing) {
            await sql.unsafe(`ALTER TABLE "${tableName}" ALTER COLUMN "${col.name}" TYPE ${col.type} USING "${col.name}"::${col.type}`);
        } else {
            let query = `ALTER TABLE "${tableName}" ADD COLUMN "${col.name}" ${col.type}`;
            if (safeDefault) query += ` DEFAULT ${safeDefault}`;
            await sql.unsafe(query);
        }
    }
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function addColumnAction(tableName: string, colName: string, colType: string) {
    try {
        await requireSuperAdmin();
        validateIdentifier(tableName); validateIdentifier(colName);
        await sql.unsafe(`ALTER TABLE "${tableName}" ADD COLUMN "${colName}" ${colType}`);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}