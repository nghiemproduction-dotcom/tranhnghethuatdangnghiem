'use server';

import postgres from 'postgres';

// Kết nối DB
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20, 
});

// --- 1. LẤY DANH SÁCH BẢNG & TRẠNG THÁI RLS ---
export async function getTablesWithRLSAction() {
    try {
        const tables = await sql`
            SELECT c.relname as table_name, c.relrowsecurity as rls_enabled
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relkind = 'r'
            ORDER BY c.relname;
        `;
        return { success: true, data: Array.from(tables).map(t => ({ table_name: t.table_name, rls_enabled: t.rls_enabled })) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 2. KIỂM TRA TRẠNG THÁI RLS CỦA 1 BẢNG ---
export async function checkTableRLSAction(tableName: string) {
    try {
        const [result] = await sql`
            SELECT c.relrowsecurity as rls_enabled
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' 
              AND c.relkind = 'r'
              AND c.relname = ${tableName}
        `;
        
        if (!result) return { success: false, error: "Bảng không tồn tại" };
        return { success: true, rls_enabled: result.rls_enabled };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 3. LẤY SCHEMA (DANH SÁCH CỘT) CỦA BẢNG (MỚI) ---
// Hàm này phục vụ cho Bước 1 để load các cột vào dropdown
export async function getTableSchemaAction(tableName: string) {
    try {
        const columns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = ${tableName}
            ORDER BY ordinal_position;
        `;
        return { success: true, data: Array.from(columns) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 4. TOGGLE RLS (BẬT/TẮT) ---
export async function toggleRLSAction(tableName: string, enable: boolean) {
    try {
        if (enable) {
            await sql`ALTER TABLE ${sql(tableName)} ENABLE ROW LEVEL SECURITY`;
        } else {
            await sql`ALTER TABLE ${sql(tableName)} DISABLE ROW LEVEL SECURITY`;
            await sql`GRANT ALL ON TABLE ${sql(tableName)} TO anon, authenticated, service_role`;
        }
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// --- 5. LẤY DỮ LIỆU PHÂN TRANG ---
export async function getTableDataPaginatedAction(tableName: string, page: number, pageSize: number) {
    try {
        const offset = (page - 1) * pageSize;
        const data = await sql`SELECT * FROM ${sql(tableName)} ORDER BY tao_luc DESC LIMIT ${pageSize} OFFSET ${offset}`;
        const [count] = await sql`SELECT count(*) as total FROM ${sql(tableName)}`;
        return { success: true, data: Array.from(data), total: Number(count.total) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// --- 6. TẠO KHÓA NGOẠI ---
export async function createForeignKeyAction(table: string, col: string, refTable: string, refCol: string = 'id') {
    try {
        const constraintName = `fk_${table}_${col}_${Date.now()}`;
        await sql.unsafe(`
            ALTER TABLE "${table}" ADD CONSTRAINT "${constraintName}" 
            FOREIGN KEY ("${col}") REFERENCES "${refTable}" ("${refCol}") ON DELETE SET NULL
        `);
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// --- 7. QUẢN LÝ CẤU TRÚC BẢNG (CORE) ---
export async function manageTableStructureAction(tableName: string, columnsDef: any[]) {
  try {
    if (!tableName) throw new Error("Tên bảng không được để trống");

    await sql`
      CREATE TABLE IF NOT EXISTS ${sql(tableName)} (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        tao_luc timestamptz DEFAULT now()
      )
    `;

    try {
        await sql`ALTER TABLE ${sql(tableName)} DISABLE ROW LEVEL SECURITY`;
        await sql`GRANT ALL ON TABLE ${sql(tableName)} TO anon, authenticated, service_role`;
    } catch (e) {}

    for (const col of columnsDef) {
        if (['id', 'tao_luc'].includes(col.name)) continue;

        try {
            const [existing] = await sql`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${tableName} AND column_name = ${col.name}`;

            let safeDefault = '';
            if (col.defaultValue !== undefined && col.defaultValue !== null && col.defaultValue !== '') {
                let val = String(col.defaultValue).trim();
                val = val.replace(/::[a-zA-Z0-9_ ]+$/, ''); 

                const isFuncOrNum = ['now()', 'gen_random_uuid()', 'true', 'false', 'current_timestamp'].includes(val.toLowerCase()) || !isNaN(Number(val));

                if (isFuncOrNum) {
                    safeDefault = val;
                } else {
                    if (val.startsWith("'") && val.endsWith("'")) {
                        safeDefault = val;
                    } else {
                        if (col.type.endsWith('[]') && !val.startsWith('{')) val = `{${val}}`;
                        safeDefault = `'${val}'`;
                    }
                }
            }

            if (existing) {
                await sql.unsafe(`ALTER TABLE "${tableName}" ALTER COLUMN "${col.name}" TYPE ${col.type} USING "${col.name}"::${col.type}`);
                await sql.unsafe(`ALTER TABLE "${tableName}" ALTER COLUMN "${col.name}" ${col.isNullable ? 'DROP NOT NULL' : 'SET NOT NULL'}`);
                if (safeDefault) await sql.unsafe(`ALTER TABLE "${tableName}" ALTER COLUMN "${col.name}" SET DEFAULT ${safeDefault}`);
                else await sql.unsafe(`ALTER TABLE "${tableName}" ALTER COLUMN "${col.name}" DROP DEFAULT`);
            } else {
                let query = `ALTER TABLE "${tableName}" ADD COLUMN "${col.name}" ${col.type}`;
                if (!col.isNullable) query += ` NOT NULL`;
                if (safeDefault) query += ` DEFAULT ${safeDefault}`;
                await sql.unsafe(query);
            }
        } catch (colErr: any) {
            throw new Error(`Lỗi cột '${col.name}': ${colErr.message}`);
        }
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// --- 8. CÁC HÀM KHÁC ---
export async function unlockTableAction(tableName: string) {
    return toggleRLSAction(tableName, false);
}

export async function addColumnAction(tableName: string, colName: string, colType: string) {
    try {
        await sql.unsafe(`ALTER TABLE "${tableName}" ADD COLUMN "${colName}" ${colType}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}