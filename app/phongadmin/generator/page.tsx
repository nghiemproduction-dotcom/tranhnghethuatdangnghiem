import React from 'react';
import { getAdminProfile } from '@/app/phongadmin/dal';
import AdminClient from '@/app/phongadmin/AdminClient';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // 1. Check Login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // 2. Check Role Admin (Bắt buộc)
  const { data: staff } = await supabase
    .from('nhan_su')
    .select('vi_tri_normalized')
    .eq('email', user.email)
    .single();

  // Chỉ cho phép 'admin' hoặc 'dev' vào phòng này
  const role = staff?.vi_tri_normalized || '';
  if (role !== 'admin' && role !== 'dev') {
     return (
       <div className="h-screen w-full flex items-center justify-center bg-black text-white flex-col gap-4">
         <h1 className="text-4xl font-bold text-red-600">403 - FORBIDDEN</h1>
         <p>Khu vực kỹ thuật cấm phận sự ({role})</p>
       </div>
     );
  }

  return <AdminClient userRole={role} />;
}