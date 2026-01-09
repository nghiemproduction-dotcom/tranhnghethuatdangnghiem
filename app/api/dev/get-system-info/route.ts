import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Dev only' }, { status: 403 });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // 1. Lấy Roles Nhân sự
    const { data: staff } = await supabase.from('nhan_su').select('vi_tri_normalized').not('vi_tri_normalized', 'is', null);
    
    // 2. Lấy Phân loại Khách hàng (MỚI)
    const { data: customers } = await supabase.from('khach_hang').select('phan_loai_normalized').not('phan_loai_normalized', 'is', null);

    // 3. Lấy Tables
    const { data: tables } = await supabase.rpc('get_all_tables');

    // Gộp và lọc trùng
    const roles = Array.from(new Set([
      ...(staff?.map(r => r.vi_tri_normalized) || []),
      ...(customers?.map(c => c.phan_loai_normalized) || [])
    ])).sort();

    const tableList = tables?.map((t: any) => t.table_name) || [];

    return NextResponse.json({ roles, tables: tableList });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}