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

// 1. LẤY THỐNG KÊ HOA HỒNG (Dashboard)
export async function getCTVStatsAction() {
    try {
        const user = await requireAuth();
        
        // Tính tổng đơn hàng mà CTV này giới thiệu (nguoi_tao_id là CTV)
        // Giả sử hoa hồng cứng là 10% (Boss có thể chỉnh sau)
        const [stats] = await sql`
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(tong_tien), 0) as total_revenue,
                COALESCE(SUM(CASE WHEN trang_thai = 'hoan_thanh' THEN tong_tien ELSE 0 END), 0) * 0.1 as commission_earned
            FROM "don_hang"
            WHERE nguoi_tao_id = ${user.id}
        `;
        
        return { success: true, data: stats };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 2. LẤY SẢN PHẨM ĐỂ BÁN (Kèm link ảnh để đăng bài)
export async function getCTVProductsAction() {
    try {
        await requireAuth();
        const data = await sql`
            SELECT id, ten_vat_tu, gia_ban, hinh_anh, ton_kho, bo_suu_tap
            FROM "vat_tu"
            WHERE loai_vat_tu = 'thanh_pham' AND ton_kho > 0
            ORDER BY ten_vat_tu ASC
        `;
        return { success: true, data: Array.from(data) };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 3. CTV TẠO ĐƠN (Giản lược hơn Sales POS)
export async function createCTVOrderAction(data: any) {
    try {
        const user = await requireAuth();
        
        // Tạo khách hàng mới nếu chưa có (CTV thường bán cho khách lạ)
        let khachId = data.khach_hang_id;
        if (!khachId && data.khach_moi) {
            const [newCust] = await sql`
                INSERT INTO "khach_hang" (ho_ten, so_dien_thoai, dia_chi, phan_loai, phan_loai_normalized, nguoi_gioi_thieu_id)
                VALUES (${data.khach_moi.ho_ten}, ${data.khach_moi.sdt}, ${data.khach_moi.dia_chi}, 'Khách CTV', 'moi', ${user.id})
                RETURNING id
            `;
            khachId = newCust.id;
        }

        // Tạo đơn hàng
        const [newOrder] = await sql`
            INSERT INTO "don_hang" (
                khach_hang_id, nguoi_tao_id, sales_phu_trach_id, 
                trang_thai, tong_tien, da_thanh_toan, kenh_ban_hang, ghi_chu
            ) VALUES (
                ${khachId}, ${user.id}, ${user.id}, -- CTV tự là sales phụ trách ban đầu
                'moi', ${data.tong_tien}, 0, 'ctv', ${data.ghi_chu}
            ) RETURNING id, ma_don
        `;

        // Tạo chi tiết
        for (const item of data.items) {
            await sql`
                INSERT INTO "don_hang_chi_tiet" (
                    don_hang_id, vat_tu_id, ten_item_hien_thi, so_luong, don_gia
                ) VALUES (
                    ${newOrder.id}, ${item.id}, ${item.ten_vat_tu}, ${item.so_luong}, ${item.don_gia}
                )
            `;
        }

        return { success: true, ma_don: newOrder.ma_don };
    } catch (error: any) { return { success: false, error: error.message }; }
}