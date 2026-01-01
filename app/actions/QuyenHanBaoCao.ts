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

export async function getAdminDashboardStats() {
    try {
        await requireAuth();

        // 1. Doanh thu tháng này (Dựa vào sổ cái - THU)
        const [revenue] = await sql`
            SELECT COALESCE(SUM(so_tien), 0) as total 
            FROM "so_cai_tai_chinh" 
            WHERE loai_giao_dich = 'thu' 
            AND date_trunc('month', tao_luc) = date_trunc('month', CURRENT_DATE)
        `;

        // 2. Tổng đơn hàng hôm nay
        const [ordersToday] = await sql`
            SELECT COUNT(*) as count 
            FROM "don_hang" 
            WHERE date_trunc('day', tao_luc) = date_trunc('day', CURRENT_DATE)
        `;

        // 3. Giá trị tồn kho hiện tại (Số lượng * Giá vốn)
        const [inventoryValue] = await sql`
            SELECT COALESCE(SUM(ton_kho * gia_von), 0) as total 
            FROM "vat_tu"
        `;

        // 4. Lương tạm tính tháng này phải trả (Dựa vào nhật ký sản xuất)
        // (Tính sơ bộ: tổng điểm * 1000đ hoặc logic lương giờ, ở đây lấy sum từ bảng lương tạm)
        const [salaryPending] = await sql`
            SELECT COALESCE(SUM(tong_thu_nhap), 0) as total 
            FROM "bang_luong" 
            WHERE thang = EXTRACT(MONTH FROM CURRENT_DATE)
        `;

        return {
            success: true,
            data: {
                revenueMonth: Number(revenue.total),
                ordersToday: Number(ordersToday.count),
                inventoryValue: Number(inventoryValue.total),
                salaryPending: Number(salaryPending.total)
            }
        };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// Lấy 10 hoạt động gần nhất của hệ thống
export async function getRecentActivities() {
    try {
        await requireAuth();
        const data = await sql`
            SELECT 'don_hang' as type, ma_don as ref, ('Đơn hàng mới: ' || tong_tien) as content, tao_luc FROM "don_hang"
            UNION ALL
            SELECT 'san_xuat' as type, ma_lenh as ref, 'Lệnh SX hoàn thành' as content, ket_thuc_luc as tao_luc FROM "lenh_san_xuat" WHERE trang_thai = 'hoan_thanh'
            UNION ALL
            SELECT 'tai_chinh' as type, substring(id::text, 1, 8) as ref, (loai_giao_dich || ': ' || so_tien) as content, tao_luc FROM "so_cai_tai_chinh"
            ORDER BY tao_luc DESC
            LIMIT 10
        `;
        return { success: true, data: Array.from(data) };
    } catch (error: any) { return { success: false, error: error.message }; }
}