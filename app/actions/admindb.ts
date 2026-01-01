'use server';

import postgres from 'postgres';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Kết nối DB (Dùng Postgres.js cho các lệnh DDL mạnh)
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20, 
});

// 🛡️ 1. HÀM KIỂM TRA QUYỀN ADMIN (BẮT BUỘC)
async function requireAdmin() {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: any) {},
                remove(name: string, options: any) {},
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) throw new Error("Unauthorized: Bạn chưa đăng nhập");

    // Check email hoặc bảng nhan_su để xem có phải admin không
    const { data: nhanSu } = await supabase
        .from('nhan_su')
        .select('vi_tri, vi_tri_normalized')
        .eq('email', user.email)
        .single();
    
    // Ưu tiên trường normalized để khớp RLS/routing; vẫn hỗ trợ legacy vi_tri
    const allowedRoles = ['admin', 'quanly', 'boss'];
    const userRoleNormalized = (nhanSu?.vi_tri_normalized || '').toLowerCase();
    const userRoleLegacy = (nhanSu?.vi_tri || '').toLowerCase().replace(/\s/g, '');
    
    const isAllowed = allowedRoles.includes(userRoleNormalized) || allowedRoles.some(r => userRoleLegacy.includes(r));

    if (!isAllowed) {
        throw new Error("Forbidden: Bạn không có quyền quản trị Database");
    }
}

// 🛡️ 2. HÀM KIỂM TRA TÊN BẢNG/CỘT (CHỐNG SQL INJECTION)
function validateIdentifier(name: string) {
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        throw new Error(`Tên không hợp lệ: ${name}. Chỉ chấp nhận chữ, số và gạch dưới.`);
    }
}

// --- CÁC HÀM ACTION ---

// --- 1. LẤY DANH SÁCH BẢNG ---
export async function getTablesWithRLSAction() {
    try {
        await requireAdmin(); // 🛡️ Check quyền
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

// --- 2. KIỂM TRA RLS ---
export async function checkTableRLSAction(tableName: string) {
    try {
        await requireAdmin();
        const [result] = await sql`
            SELECT c.relrowsecurity as rls_enabled
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = ${tableName}
        `;
        if (!result) return { success: false, error: "Bảng không tồn tại" };
        return { success: true, rls_enabled: result.rls_enabled };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 3. LẤY SCHEMA ---
export async function getTableSchemaAction(tableName: string) {
    try {
        await requireAdmin();
        const columns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = ${tableName}
            ORDER BY ordinal_position;
        `;
        return { success: true, data: Array.from(columns) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 4. TOGGLE RLS (NGUY HIỂM - CẦN CHECK KỸ) ---
export async function toggleRLSAction(tableName: string, enable: boolean) {
    try {
        await requireAdmin(); // 🛡️ Check quyền cực quan trọng
        validateIdentifier(tableName); // 🛡️ Check SQL Injection

        if (enable) {
            await sql.unsafe(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY`);
        } else {
            await sql.unsafe(`ALTER TABLE "${tableName}" DISABLE ROW LEVEL SECURITY`);
            await sql.unsafe(`GRANT ALL ON TABLE "${tableName}" TO anon, authenticated, service_role`);
        }
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// --- 5. LẤY DỮ LIỆU PHÂN TRANG (ĐÃ SỬA LỖI SORT COLUMN) ---
export async function getTableDataPaginatedAction(tableName: string, page: number, pageSize: number) {
    try {
        await requireAdmin();
        validateIdentifier(tableName);
        
        // 🟢 BƯỚC 1: Tìm cột sắp xếp hợp lệ (Tránh lỗi column does not exist)
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = ${tableName}
        `;
        
        const colNames = Array.from(columns).map(c => c.column_name);
        let sortCol = 'id'; // Mặc định sort theo id nếu không tìm thấy ngày
        
        // Ưu tiên các cột thời gian phổ biến
        if (colNames.includes('tao_luc')) sortCol = 'tao_luc';
        else if (colNames.includes('created_at')) sortCol = 'created_at';
        else if (colNames.includes('date_created')) sortCol = 'date_created';
        
        // Nếu không có id luôn (hiếm gặp), lấy cột đầu tiên
        if (!colNames.includes('id') && sortCol === 'id' && colNames.length > 0) {
             sortCol = colNames[0];
        }

        const offset = (page - 1) * pageSize;
        
        // 🟢 BƯỚC 2: Query an toàn với cột sắp xếp động
        const data = await sql.unsafe(`SELECT * FROM "${tableName}" ORDER BY "${sortCol}" DESC LIMIT ${pageSize} OFFSET ${offset}`);
        
        const [countResult] = await sql.unsafe(`SELECT count(*) as total FROM "${tableName}"`);
        
        return { 
            success: true, 
            data: Array.from(data), 
            total: Number(countResult.total) 
        };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// --- 6. TẠO KHÓA NGOẠI ---
export async function createForeignKeyAction(table: string, col: string, refTable: string, refCol: string = 'id') {
    try {
        await requireAdmin();
        validateIdentifier(table);
        validateIdentifier(col);
        validateIdentifier(refTable);
        validateIdentifier(refCol);

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
    await requireAdmin();
    if (!tableName) throw new Error("Tên bảng không được để trống");
    validateIdentifier(tableName);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        tao_luc timestamptz DEFAULT now()
      )
    `);

    try {
        await sql.unsafe(`ALTER TABLE "${tableName}" DISABLE ROW LEVEL SECURITY`);
        await sql.unsafe(`GRANT ALL ON TABLE "${tableName}" TO anon, authenticated, service_role`);
    } catch (e) {}

    for (const col of columnsDef) {
        if (['id', 'tao_luc'].includes(col.name)) continue;
        validateIdentifier(col.name);

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
                    if (val.startsWith("'") && val.endsWith("'")) safeDefault = val;
                    else {
                         if (col.type.endsWith('[]') && !val.startsWith('{')) val = `{${val}}`;
                         safeDefault = `'${val.replace(/'/g, "''")}'`; 
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
        await requireAdmin();
        validateIdentifier(tableName);
        validateIdentifier(colName);
        
        await sql.unsafe(`ALTER TABLE "${tableName}" ADD COLUMN "${colName}" ${colType}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 9. CẬP NHẬT DỮ LIỆU ---
export async function updateTableCellAction(tableName: string, id: string, column: string, value: any) {
    try {
        await requireAdmin();
        validateIdentifier(tableName);
        validateIdentifier(column);

        // Xử lý giá trị đặc biệt
        let finalValue = value;
        if (value === '' || value === null) finalValue = null;

        await sql.unsafe(`
            UPDATE "${tableName}" 
            SET "${column}" = $1 
            WHERE id = $2
        `, [finalValue, id]);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 🟢 10. LẤY DỮ LIỆU NHÂN SỰ (CÓ SEARCH & FILTER) ---
export async function getNhanSuDataAction(page: number, pageSize: number, search: string, filterRole: string) {
    try {
        await requireAdmin();
        
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

        return { 
            success: true, 
            data: Array.from(data), 
            total: Number(countResult.total) 
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 🟢 11. CẬP NHẬT NHÂN SỰ ---
export async function updateNhanSuAction(id: string, data: any) {
    try {
        await requireAdmin();
        
        // 🟢 FIX LỖI 428C9: BỎ CỘT luong_theo_gio VÌ LÀ GENERATED COLUMN
        await sql.unsafe(`
            UPDATE "nhan_su"
            SET ho_ten = $1,
                so_dien_thoai = $2,
                vi_tri = $3,
                vi_tri_normalized = $4,
                email = $5,
                luong_thang = $6,
                thuong_doanh_thu = $7,
                ngan_hang = $8,
                so_tai_khoan = $9,
                hinh_anh = $10
            WHERE id = $11
        `, [
            data.ho_ten, 
            data.so_dien_thoai, 
            data.vi_tri, 
            data.vi_tri_normalized, 
            data.email || '',
            data.luong_thang || 0,
            data.thuong_doanh_thu || 0,
            data.ngan_hang || null,
            data.so_tai_khoan || null,
            data.hinh_anh || null,
            id
        ]);
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 🟢 12. TẠO MỚI NHÂN SỰ ---
export async function createNhanSuAction(data: any) {
    try {
        await requireAdmin();
        
        // 🟢 FIX LỖI 428C9: BỎ CỘT luong_theo_gio VÌ LÀ GENERATED COLUMN
        await sql.unsafe(`
            INSERT INTO "nhan_su" (
                ho_ten, so_dien_thoai, vi_tri, vi_tri_normalized, email, 
                trang_thai, luong_thang, thuong_doanh_thu, 
                ngan_hang, so_tai_khoan, hinh_anh
            )
            VALUES ($1, $2, $3, $4, $5, 'Đang hoạt động', $6, $7, $8, $9, $10)
        `, [
            data.ho_ten, 
            data.so_dien_thoai, 
            data.vi_tri, 
            data.vi_tri_normalized, 
            data.email,
            data.luong_thang || 0,
            data.thuong_doanh_thu || 0,
            data.ngan_hang || null,
            data.so_tai_khoan || null,
            data.hinh_anh || null
        ]);
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 🟢 13. LẤY GIÁ TRỊ DUY NHẤT CỦA CỘT (Dùng cho Dropdown) ---
export async function getDistinctValuesAction(tableName: string, columnName: string) {
    try {
        await requireAdmin();
        validateIdentifier(tableName);
        validateIdentifier(columnName);

        const data = await sql.unsafe(`
            SELECT DISTINCT "${columnName}" 
            FROM "${tableName}" 
            WHERE "${columnName}" IS NOT NULL AND "${columnName}" != ''
            ORDER BY "${columnName}" ASC
        `);
        
        return { success: true, data: Array.from(data).map(row => row[columnName]) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
// --- 🟢 14. XÓA NHÂN SỰ ---
export async function deleteNhanSuAction(id: string) {
    try {
        await requireAdmin(); // Chỉ Admin/Quản lý mới gọi được
        validateIdentifier('nhan_su');

        await sql.unsafe(`
            DELETE FROM "nhan_su" WHERE id = $1
        `, [id]);
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 🟢 14b. CẬP NHẬT HÀNG LOẠT NHÂN SỰ (BULK UPDATE) ---
export async function bulkUpdateNhanSuAction(ids: string[], data: { vi_tri?: string; vi_tri_normalized?: string }) {
    try {
        await requireAdmin();
        
        if (!ids || ids.length === 0) {
            return { success: false, error: 'Không có ID nào được chọn' };
        }

        const setClauses: string[] = [];
        const params: any[] = [];
        let paramCount = 1;

        if (data.vi_tri !== undefined) {
            setClauses.push(`vi_tri = $${paramCount}`);
            params.push(data.vi_tri);
            paramCount++;
        }

        if (data.vi_tri_normalized !== undefined) {
            setClauses.push(`vi_tri_normalized = $${paramCount}`);
            params.push(data.vi_tri_normalized);
            paramCount++;
        }

        if (setClauses.length === 0) {
            return { success: false, error: 'Không có dữ liệu để cập nhật' };
        }

        const idPlaceholders = ids.map((_, i) => `$${paramCount + i}`).join(', ');
        params.push(...ids);

        const query = `UPDATE "nhan_su" SET ${setClauses.join(', ')} WHERE id IN (${idPlaceholders})`;
        
        await sql.unsafe(query, params);
        
        return { success: true, updated: ids.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ... (Giữ nguyên các hàm cũ)

// --- 🟢 15. LẤY DỮ LIỆU KHÁCH HÀNG (CÓ SEARCH & FILTER) ---
export async function getKhachHangDataAction(page: number, pageSize: number, search: string, filterRole: string) {
    try {
        await requireAdmin();
        
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
        // Sắp xếp khách hàng mới nhất lên đầu
        query += ` ORDER BY tao_luc DESC LIMIT ${pageSize} OFFSET ${offset}`;

        const data = await sql.unsafe(query, params);
        const [countResult] = await sql.unsafe(countQuery, params);

        return { 
            success: true, 
            data: Array.from(data), 
            total: Number(countResult.total) 
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 🟢 16. TẠO MỚI KHÁCH HÀNG ---
export async function createKhachHangAction(data: any) {
    try {
        await requireAdmin();
        
        // Đảm bảo normalized có giá trị
        const phanLoaiNorm = data.phan_loai_normalized || 
            (data.phan_loai ? data.phan_loai.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "") : 'moi');

        await sql.unsafe(`
            INSERT INTO "khach_hang" (
                ho_ten, so_dien_thoai, email, 
                phan_loai, phan_loai_normalized, 
                hinh_anh, dia_chi, tao_luc
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, now())
        `, [
            data.ho_ten, 
            data.so_dien_thoai, 
            data.email,
            data.phan_loai,
            phanLoaiNorm,
            data.hinh_anh || null,
            data.dia_chi || null
        ]);
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 🟢 17. CẬP NHẬT KHÁCH HÀNG ---
export async function updateKhachHangAction(id: string, data: any) {
    try {
        await requireAdmin();

         const phanLoaiNorm = data.phan_loai_normalized || 
            (data.phan_loai ? data.phan_loai.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "") : 'moi');
        
        await sql.unsafe(`
            UPDATE "khach_hang"
            SET ho_ten = $1,
                so_dien_thoai = $2,
                email = $3,
                phan_loai = $4,
                phan_loai_normalized = $5,
                hinh_anh = $6,
                dia_chi = $7
            WHERE id = $8
        `, [
            data.ho_ten, 
            data.so_dien_thoai, 
            data.email,
            data.phan_loai,
            phanLoaiNorm,
            data.hinh_anh || null,
            data.dia_chi || null,
            id
        ]);
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 🟢 18. XÓA KHÁCH HÀNG ---
export async function deleteKhachHangAction(id: string) {
    try {
        await requireAdmin();
        validateIdentifier('khach_hang');

        await sql.unsafe(`DELETE FROM "khach_hang" WHERE id = $1`, [id]);
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 🟢 19. CẬP NHẬT HÀNG LOẠT KHÁCH HÀNG (BULK UPDATE) ---
export async function bulkUpdateKhachHangAction(ids: string[], data: { phan_loai?: string; phan_loai_normalized?: string }) {
    try {
        await requireAdmin();
        
        if (!ids || ids.length === 0) {
            return { success: false, error: 'Không có ID nào được chọn' };
        }

        // Build SET clause dynamically
        const setClauses: string[] = [];
        const params: any[] = [];
        let paramCount = 1;

        if (data.phan_loai !== undefined) {
            setClauses.push(`phan_loai = $${paramCount}`);
            params.push(data.phan_loai);
            paramCount++;
        }

        if (data.phan_loai_normalized !== undefined) {
            setClauses.push(`phan_loai_normalized = $${paramCount}`);
            params.push(data.phan_loai_normalized);
            paramCount++;
        }

        if (setClauses.length === 0) {
            return { success: false, error: 'Không có dữ liệu để cập nhật' };
        }

        // Create placeholders for IDs: $3, $4, $5, ...
        const idPlaceholders = ids.map((_, i) => `$${paramCount + i}`).join(', ');
        params.push(...ids);

        const query = `UPDATE "khach_hang" SET ${setClauses.join(', ')} WHERE id IN (${idPlaceholders})`;
        
        await sql.unsafe(query, params);
        
        return { success: true, updated: ids.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}