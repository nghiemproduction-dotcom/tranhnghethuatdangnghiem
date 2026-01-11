import 'server-only'
import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import { fetchGenericData } from '@/app/phonglamviec/generic-fetch'
import { Nhansu3DTO, toNhansu3DTO } from './dto'

export const getDsNhansu3 = cache(async (): Promise<Nhansu3DTO[]> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isVip = false;
  if (user) {
     const { data: info } = await supabase.from('nhan_su').select('phan_loai').eq('id', user.id).single();
     const role = info?.phan_loai || '';
     isVip = ['admin', 'quanly'].includes(role.toLowerCase());
  }
  const columnsToSelect = isVip ? '*' : 'id,tao_luc,ho_ten,so_dien_thoai,email,phan_loai,madangnhap,hinh_anh,trang_thai,ngan_hang,so_tai_khoan,diem_cong_hien,cap_bac_game';
  const rawData = await fetchGenericData<any>(
      'nhan_su', 
      columnsToSelect, 
      { column: 'id', ascending: false }
  );
  return rawData.map(toNhansu3DTO);
})