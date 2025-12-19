'use server';

import postgres from 'postgres';

// Kết nối DB
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 10, // Tăng kết nối để xử lý mượt hơn
});

// --- 1. LẤY DANH SÁCH BẢNG & TRẠNG THÁI RLS (Cho Bước 0) ---
export async function getTablesWithRLSAction() {
    try {
        const tables = await sql`
            SELECT 
                c.relname as table_name,
                c.relrowsecurity as rls_enabled
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' 
              AND c.relkind = 'r'
            ORDER BY c.relname;
        `;
        return { success: true, data: tables };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 2. TOGGLE RLS (BẬT/TẮT BẢO MẬT - Cho Bước 0) ---
export async function toggleRLSAction(tableName: string, enable: boolean) {
    try {
        if (enable) {
            await sql`ALTER TABLE ${sql(tableName)} ENABLE ROW LEVEL SECURITY`;
        } else {
            await sql`ALTER TABLE ${sql(tableName)} DISABLE ROW LEVEL SECURITY`;
            // Unrestricted: Cấp full quyền cho mọi người
            await sql`GRANT ALL ON TABLE ${sql(tableName)} TO anon, authenticated, service_role`;
        }
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 3. LẤY DỮ LIỆU PHÂN TRANG (Cho Bước 2) ---
export async function getTableDataPaginatedAction(tableName: string, page: number, pageSize: number) {
    try {
        const offset = (page - 1) * pageSize;
        const data = await sql`
            SELECT * FROM ${sql(tableName)}
            ORDER BY created_at DESC
            LIMIT ${pageSize} OFFSET ${offset}
        `;
        // Đếm tổng số dòng
        const [count] = await sql`SELECT count(*) as total FROM ${sql(tableName)}`;
        return { success: true, data: data, total: Number(count.total) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 4. TẠO KHÓA NGOẠI (RELATIONSHIP - Cho Bước 3) ---
export async function createForeignKeyAction(table: string, col: string, refTable: string, refCol: string = 'id') {
    try {
        const constraintName = `fk_${table}_${col}_${Date.now()}`;
        await sql.unsafe(`
            ALTER TABLE "${table}"
            ADD CONSTRAINT "${constraintName}"
            FOREIGN KEY ("${col}")
            REFERENCES "${refTable}" ("${refCol}")
            ON DELETE SET NULL
        `);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 5. QUẢN LÝ CẤU TRÚC BẢNG (CORE) ---
export async function manageTableStructureAction(tableName: string, columnsDef: any[]) {
  try {
    if (!tableName) throw new Error("Tên bảng không được để trống");

    await sql`
      CREATE TABLE IF NOT EXISTS ${sql(tableName)} (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at timestamptz DEFAULT now()
      )
    `;

    // Mặc định tắt RLS khi tạo mới để tiện dev
    try {
        await sql`ALTER TABLE ${sql(tableName)} DISABLE ROW LEVEL SECURITY`;
        await sql`GRANT ALL ON TABLE ${sql(tableName)} TO anon, authenticated, service_role`;
    } catch (e) {}

    for (const col of columnsDef) {
        if (col.name === 'id' || col.name === 'created_at') continue;

        try {
            const [existing] = await sql`
                SELECT column_name FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = ${tableName} AND column_name = ${col.name}
            `;

            // Xử lý giá trị mặc định an toàn
            let safeDefault = '';
            if (col.defaultValue) {
                let val = col.defaultValue.trim();
                // Fix lỗi malformed array literal: thêm {} nếu là mảng
                if (col.type.endsWith('[]') && !val.startsWith('{')) val = `{${val}}`;
                
                const isFunc = ['now()', 'gen_random_uuid()', 'true', 'false'].includes(val);
                safeDefault = isFunc ? val : `'${val}'`;
            }

            if (existing) {
                await sql.unsafe(`ALTER TABLE "${tableName}" ALTER COLUMN "${col.name}" TYPE ${col.type} USING "${col.name}"::${col.type}`);
                const nullCmd = col.isNullable ? 'DROP NOT NULL' : 'SET NOT NULL';
                await sql.unsafe(`ALTER TABLE "${tableName}" ALTER COLUMN "${col.name}" ${nullCmd}`);
                
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

// --- 6. MỞ KHÓA BẢNG (Unlock - Hàm bạn đang thiếu) ---
export async function unlockTableAction(tableName: string) {
    try {
        await sql`ALTER TABLE ${sql(tableName)} DISABLE ROW LEVEL SECURITY`;
        await sql`GRANT ALL ON TABLE ${sql(tableName)} TO anon, authenticated, service_role`;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 7. THÊM CỘT NHANH ---
export async function addColumnAction(tableName: string, colName: string, colType: string) {
    try {
        await sql.unsafe(`ALTER TABLE "${tableName}" ADD COLUMN "${colName}" ${colType}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}