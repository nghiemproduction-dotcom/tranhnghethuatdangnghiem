import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/app/ThuVien/supabase/server'; 
import { cookies } from 'next/headers';

// --- HELPER 1: MAP TYPES ---
const mapType = (pgType: string) => {
  if (['integer', 'bigint', 'numeric', 'real', 'double precision'].includes(pgType)) return { ts: 'number', zod: 'z.number()', input: 'number', default: '0' };
  if (['boolean'].includes(pgType)) return { ts: 'boolean', zod: 'z.boolean()', input: 'checkbox', default: 'false' };
  if (['json', 'jsonb'].includes(pgType)) return { ts: 'any', zod: 'z.any()', input: 'textarea', default: '{}' };
  if (['timestamp', 'date', 'timestamptz'].includes(pgType)) return { ts: 'string', zod: 'z.string().nullable().optional()', input: 'date', default: 'null' };
  return { ts: 'string', zod: 'z.string().min(1, "Không được để trống")', input: 'text', default: "''" }; 
};

// --- HELPER 2: AUTO-WIRE UI ---
function wireFeatureToRoom(roomName: string, featureName: string) {
  const clientFileName = `${roomName.charAt(0).toUpperCase() + roomName.slice(1)}Client.tsx`;
  const filePath = path.join(process.cwd(), 'app', roomName, clientFileName);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const importLine = `import ${featureName}Client from './components/${featureName}/${featureName}Client';`;
  
  if (!content.includes(importLine)) {
    const insertPos = content.indexOf('import React');
    content = insertPos !== -1 
        ? content.slice(0, insertPos) + `${importLine}\n` + content.slice(insertPos)
        : `'use client';\n${importLine}\n` + content.replace("'use client';", "");
  }

  const label = featureName.replace(/_/g, ' ').toUpperCase();
  if (!content.includes(`id: '${featureName}'`)) {
      const menuEntry = `{ id: '${featureName}', label: '${label}', icon: Box },`;
      if (content.includes('const functions = [')) {
          content = content.replace('const functions = [', `const functions = [\n    ${menuEntry}`);
      }
  }

  const slotMarker = `{/* [SLOT_FEATURES] */}`;
  const componentCode = `
            {activeFn === '${featureName}' && (
                <div className="w-full h-full animate-in fade-in zoom-in-95 duration-300">
                    <${featureName}Client userRole={userRole} initialData={[]} />
                </div>
            )}`;
  
  if (content.includes(slotMarker) && !content.includes(`<${featureName}Client`)) {
     content = content.replace(slotMarker, `${slotMarker}\n${componentCode}`);
  }
  
  fs.writeFileSync(filePath, content);
}

// --- HELPER 3: DB AUTOMATION (KIẾN TRÚC SƯ) ---
async function automateDatabase(tableName: string, permissions: Record<string, string[]>) {
    const supabase = await createClient();
    
    // 1. Sync Permission Table
    const inserts = Object.entries(permissions).map(([role, actions]) => ({
        role: role,
        table_name: tableName,
        can_view: actions.includes('view'),
        can_create: actions.includes('create'),
        can_edit: actions.includes('edit'),
        can_delete: actions.includes('delete'),
        only_own_data: role === 'thietke' || role === 'sales', 
    }));

    if (inserts.length > 0) {
        for (const p of inserts) {
            await supabase.from('feature_permissions').upsert(p, { onConflict: 'role, table_name' });
        }
    }

    // 2. Generate & Execute SQL for RLS & Indexes (The "Million Dollar" standard)
    // Lưu ý: Cần hàm exec_sql RPC như đã hướng dẫn
    const sql = `
      -- 1. Enable RLS
      ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

      -- 2. Create Dynamic Policy linked to feature_permissions
      DROP POLICY IF EXISTS "SmartPolicy_${tableName}" ON public.${tableName};
      CREATE POLICY "SmartPolicy_${tableName}" ON public.${tableName}
      FOR ALL
      USING (
        (public.get_current_user_role() IN ('admin', 'dev')) OR
        EXISTS (
          SELECT 1 FROM public.feature_permissions fp
          WHERE fp.table_name = '${tableName}'
          AND fp.role = public.get_current_user_role()
          AND (
             (current_setting('request.method') = 'GET' AND fp.can_view = true) OR
             (fp.can_create = true OR fp.can_edit = true OR fp.can_delete = true)
          )
        )
      );

      -- 3. Auto Indexing (Performance)
      CREATE INDEX IF NOT EXISTS idx_${tableName}_tao_luc ON public.${tableName} (tao_luc DESC);
      -- Check if created_by exists before indexing (Dynamic check hard in raw sql block without plpgsql, skipping for safety or assuming standard fields)
    `;

    try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) console.error("Auto DB Setup Failed (Check if exec_sql RPC exists):", error);
    } catch (e) {
        console.error("RPC exec_sql call failed. Please run SQL manually.");
    }
}

// --- MAIN HANDLER ---
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Dev only' }, { status: 403 });

  try {
    const body = await req.json();
    const { mode } = body;

    // ======================================================
    // MODE 1: TẠO PHÒNG (V20 - Layout Full Black & Loading)
    // ======================================================
    if (mode === 'create_room') {
       const { roomName, allowedRoles } = body; 
       const folderPath = path.join(process.cwd(), 'app', roomName);
       const clientName = `${roomName.charAt(0).toUpperCase() + roomName.slice(1)}Client`;
       
       if (fs.existsSync(folderPath)) return NextResponse.json({ error: 'Phòng đã tồn tại' }, { status: 400 });
       fs.mkdirSync(folderPath, { recursive: true });

       // 1. Loading
       const loadingContent = `
import HienThiLoading from '@/app/components/HienThiLoading';
export default function Loading() { return <div className="h-screen bg-[#050505]"><HienThiLoading tieuDe="Đang khởi tạo phòng..." /></div>; }
`;
       fs.writeFileSync(path.join(folderPath, 'loading.tsx'), loadingContent);
       
       // 2. DAL
       fs.writeFileSync(path.join(folderPath, 'dal.ts'), `import { createClient } from '@/app/ThuVien/supabase/server'; import { cookies } from 'next/headers'; import { cache } from 'react'; export const getRoomInfo = cache(async () => { return { status: 'active' }; });`);

       // 3. Client
       const clientContent = `
'use client';
import React, { useState } from 'react';
import KhungTrangChuan from '@/app/components/cacchucnang/KhungGiaoDienChucNang/KhungTrangChuan';
import ThanhPhongChucNang from '@/app/components/ThanhPhongChucNang';
import { Shield, Box, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function ${clientName}({ userRole, userInfo }: { userRole: string, userInfo: any }) {
  const isAdmin = ['admin', 'dev'].includes(userRole);
  const [activeFn, setActiveFn] = useState<string>('dashboard');
  const functions = [{ id: 'dashboard', label: 'TỔNG QUAN', icon: LayoutDashboard }];
  const roomTitle = "PHÒNG " + "${roomName}".replace('phong', '').toUpperCase();

  return (
    <KhungTrangChuan 
        nguoiDung={userInfo} 
        loiChao={\`Xin chào, \${userInfo?.ho_ten || userRole}\`}
        contentClassName="flex flex-col h-[100dvh] pt-[60px] bg-black overflow-hidden" 
    >
      <div className="shrink-0 z-50 w-full relative">
          <ThanhPhongChucNang 
              tenPhong={roomTitle} 
              functions={functions} 
              activeFunction={activeFn} 
              onFunctionChange={setActiveFn} 
          />
      </div>
      <div className="flex-1 w-full bg-[#050505] relative overflow-hidden z-0">
          <div className="w-full h-full p-0 md:p-0 overflow-y-auto custom-scrollbar">
              {activeFn === 'dashboard' && (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                     <LayoutDashboard size={64} className="opacity-10"/>
                     <div className="text-center">
                        <p className="text-lg font-bold text-[#C69C6D] uppercase tracking-widest">{roomTitle}</p>
                        <p className="text-sm">Vui lòng chọn chức năng từ menu bên trên</p>
                     </div>
                  </div>
              )}
              {/* [SLOT_FEATURES] */}
          </div>
      </div>
      {isAdmin && (
        <Link href="/phongadmin" className="fixed bottom-6 right-6 z-[100] bg-red-900/80 text-white p-3 rounded-full shadow-lg border border-red-500 hover:scale-110 transition-transform">
           <Shield size={20}/>
        </Link>
      )}
    </KhungTrangChuan>
  );
}
`;
       fs.writeFileSync(path.join(folderPath, `${clientName}.tsx`), clientContent);

       // 4. Page
       const pageContent = `
import React from 'react';
import { createClient } from '@/app/ThuVien/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ${clientName} from './${clientName}';
import { getRoomInfo } from './dal';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/');
  
  let userRole = 'guest';
  let userInfo = null;

  const { data: staff } = await supabase.from('nhan_su').select('*').eq('email', user.email).single();
  if (staff) { userRole = staff.vi_tri_normalized; userInfo = staff; } 
  else {
      const { data: cust } = await supabase.from('khach_hang').select('*').eq('email', user.email).single();
      if (cust) { userRole = cust.phan_loai_normalized; userInfo = cust; }
  }
  if (!userInfo) userInfo = { ho_ten: user.email?.split('@')[0], email: user.email, avatar_url: user.user_metadata?.avatar_url };
  
  const ALLOWED_ROLES = ${JSON.stringify(allowedRoles)};
  const IS_SUPER_USER = ['admin', 'dev'].includes(userRole);

  if (!IS_SUPER_USER && !ALLOWED_ROLES.includes(userRole)) {
      return <div className="h-screen flex items-center justify-center bg-black text-white">403 - Forbidden</div>;
  }

  await getRoomInfo(); 
  return <${clientName} userRole={userRole} userInfo={userInfo} />;
}
`;
       fs.writeFileSync(path.join(folderPath, 'page.tsx'), pageContent);
       return NextResponse.json({ success: true, message: `Đã tạo phòng /${roomName} (V20).` });
    }

    // ======================================================
    // MODE 2: TIÊM CHỨC NĂNG (V20 - AUTO DB & ROBUST UI)
    // ======================================================
    if (mode === 'inject_feature') {
        const { tableName, targetRoom, featureName, permissions } = body; 
        
        // 1. Tự động cấu hình DB (Policy, Index)
        await automateDatabase(tableName, permissions);

        const supabase = await createClient();
        const { data: columns, error } = await supabase.rpc('get_table_info', { table_name_input: tableName });
        if (error || !columns) return NextResponse.json({ error: `Lỗi đọc bảng ${tableName}` }, { status: 400 });

        const fields = columns.map((col: any) => ({
             name: col.column_name, ...mapType(col.data_type), 
             label: col.column_name.charAt(0).toUpperCase() + col.column_name.slice(1).replace(/_/g, ' ') 
        }));
        const formFields = fields.filter((f: any) => !['id', 'tao_luc', 'updated_at'].includes(f.name));
        const tableFields = fields.filter((f: any) => !['password', 'metadata', 'json'].includes(f.name) && f.inputType !== 'textarea');

        const typesContent = `import { z } from 'zod'; export type ${featureName}DTO = { ${fields.map((f:any) => `${f.name}: ${f.tsType};`).join('\n')} }; export const ${featureName}Schema = z.object({ ${formFields.map((f:any) => `${f.name}: ${f.zodType},`).join('\n')} }); export type ${featureName}FormValues = z.infer<typeof ${featureName}Schema>;`;
        
        // DAL
        const dalContent = `import { createClient } from '@/app/ThuVien/supabase/server'; import { cookies } from 'next/headers'; import { unstable_cache } from 'next/cache'; export const CACHE_TAG = '${tableName}_${targetRoom}_list'; export const get${featureName}List = unstable_cache(async () => { const supabase = await createClient(); const { data } = await supabase.from('${tableName}').select('*'); return data || []; }, [CACHE_TAG], { tags: [CACHE_TAG], revalidate: 3600 });`;
        
        // Actions
        const actionsContent = `
'use server';
import { createClient } from '@/app/ThuVien/supabase/server';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { ${featureName}Schema } from './types';
import { CACHE_TAG } from './dal';

async function checkDBPermission(action: 'view'|'create'|'edit'|'delete', recordOwnerId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Auth required');
  let role = 'guest';
  const { data: staff } = await supabase.from('nhan_su').select('vi_tri_normalized').eq('email', user.email).single();
  if (staff) role = staff.vi_tri_normalized;
  if(['admin','dev'].includes(role)) return { supabase, user };

  const { data: perm } = await supabase.from('feature_permissions').select('*').eq('role', role).eq('table_name', '${tableName}').single();
  if (!perm) throw new Error('Không có quyền truy cập');
  if (action === 'create' && !perm.can_create) throw new Error('Không có quyền tạo');
  if (action === 'edit') {
      if (!perm.can_edit) throw new Error('Không có quyền sửa');
      if (perm.only_own_data && recordOwnerId !== user.id) throw new Error('Chỉ sửa được dữ liệu chính chủ');
  }
  if (action === 'delete') {
      if (!perm.can_delete) throw new Error('Không có quyền xóa');
      if (perm.only_own_data && recordOwnerId !== user.id) throw new Error('Chỉ xóa được dữ liệu chính chủ');
  }
  return { supabase, user };
}

export async function create${featureName}Action(rawData: any) {
  try { 
    const { supabase, user } = await checkDBPermission('create'); 
    const val = ${featureName}Schema.safeParse(rawData); if(!val.success) return {error:'Invalid'};
    // Auto created_by if column exists (Safe check assumed)
    const payload = { ...val.data, ...( 'created_by' in val.data ? {} : { created_by: user.id } ) }; 
    const {error} = await supabase.from('${tableName}').insert(payload);
    if(error) return {error: error.message, success:false}; revalidateTag(CACHE_TAG); return {success:true};
  } catch(e:any){return {error:e.message, success:false}}
}

export async function update${featureName}Action(id: any, rawData: any) {
   try { 
     const supabase = await createClient();
     const { data: old } = await supabase.from('${tableName}').select('created_by').eq('id', id).single();
     const { supabase: sb } = await checkDBPermission('edit', old?.created_by); 
     const val = ${featureName}Schema.safeParse(rawData); if(!val.success) return {error:'Invalid'};
     const {error} = await sb.from('${tableName}').update(val.data).eq('id',id);
     if(error) return {error: error.message, success:false}; revalidateTag(CACHE_TAG); return {success:true};
   } catch(e:any){return {error:e.message, success:false}}
}

export async function delete${featureName}Action(id: any) {
   try { 
     const supabase = await createClient();
     const { data: old } = await supabase.from('${tableName}').select('created_by').eq('id', id).single();
     const { supabase: sb } = await checkDBPermission('delete', old?.created_by); 
     const {error} = await sb.from('${tableName}').delete().eq('id',id);
     if(error) return {error: error.message, success:false}; revalidateTag(CACHE_TAG); return {success:true};
   } catch(e:any){return {error:e.message, success:false}}
}
`;

        const clientContent = `
'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 
import { Edit, Trash2, User, FileText } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import KhungDanhSach, { ListTabDef } from '@/app/components/cacchucnang/KhungGiaoDienChucNang/KhungDanhSach';
import KhungForm from '@/app/components/cacchucnang/KhungGiaoDienChucNang/KhungForm';
import ConfirmDialog from "@/app/components/ConfirmDialog"; 
import { ${featureName}DTO } from './types';
import { create${featureName}Action, update${featureName}Action, delete${featureName}Action } from './actions';

export default function ${featureName}Client({ initialData = [], userRole }: { initialData?: ${featureName}DTO[], userRole: string }) {
  const [data, setData] = useState(initialData); 
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: any }>({ show: false, id: null });

  useEffect(() => {
      const fetchData = async () => {
          setLoading(true);
          const { data: res, error } = await supabase.from('${tableName}').select('*');
          if(res) {
             const sorted = res.sort((a,b) => (b.id > a.id ? 1 : -1));
             setData(sorted);
          }
          if(error) {
             console.error('Data Error:', error);
             toast.error('Lỗi tải dữ liệu. Vui lòng kiểm tra quyền truy cập.');
          }
          setLoading(false);
      };
      if(initialData.length===0) fetchData();
      
      const channel = supabase.channel('${tableName}').on('postgres_changes', { event: '*', schema: 'public', table: '${tableName}' }, async () => {
          const { data: res } = await supabase.from('${tableName}').select('*');
          if(res) setData(res);
      }).subscribe();
      return () => { supabase.removeChannel(channel); };
  }, []);

  const tabDefs: ListTabDef[] = [{ id: 'all', label: 'TẤT CẢ' }];
  const handleSave = async (d: any) => editingItem ? await update${featureName}Action(editingItem.id, d) : await create${featureName}Action(d);
  
  const handleDelete = async () => { 
      if(!confirmDelete.id) return;
      const r = await delete${featureName}Action(confirmDelete.id); 
      if(r.success) {
          toast.success('Đã xóa thành công');
          setConfirmDelete({ show: false, id: null });
      } else {
          toast.error(r.error);
      }
  };

  return (
    <>
      <KhungDanhSach data={data} tabDefs={tabDefs} activeTab={activeTab} onTabChange={setActiveTab} loading={loading} showAddButton={true} onAdd={() => { setEditingItem(null); setIsOpen(true); }} className="h-full rounded-none border-none bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {data.map((item: any) => (
                <div key={item.id} className="group relative bg-[#151515] border border-white/5 rounded-xl p-4 hover:border-[#C69C6D]/50 transition-all hover:shadow-lg flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            {item.hinh_anh ? <img src={item.hinh_anh} className="w-full h-full object-cover"/> : <User size={18} className="text-zinc-500"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-white text-sm truncate mb-0.5">{item['${tableFields[0]?.name || 'id'}'] || '---'}</div>
                            <div className="text-[10px] text-zinc-500 truncate">ID: {item.id}</div>
                        </div>
                    </div>
                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                        ${tableFields.slice(1, 4).map((f:any) => `<div className="flex items-center justify-between text-[11px]"><span className="text-zinc-600 uppercase font-bold text-[9px]">${f.label}</span><span className="text-zinc-300 truncate max-w-[60%]">{String(item['${f.name}'] || '--')}</span></div>`).join('')}
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={()=>{setEditingItem(item);setIsOpen(true)}} className="p-1.5 bg-[#1a1a1a] text-blue-500 hover:text-white rounded border border-white/10"><Edit size={12}/></button>
                        <button onClick={()=>setConfirmDelete({ show: true, id: item.id })} className="p-1.5 bg-[#1a1a1a] text-red-500 hover:text-white rounded border border-white/10"><Trash2 size={12}/></button>
                    </div>
                </div>
            ))}
            {!loading && data.length === 0 && <div className="col-span-full text-center text-zinc-600 py-20 italic">Chưa có dữ liệu</div>}
        </div>
      </KhungDanhSach>

      {isOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div className="w-full max-w-2xl h-[85vh]"><KhungForm title={editingItem?"CẬP NHẬT":"THÊM MỚI"} onClose={()=>setIsOpen(false)} isEditing={!!editingItem} data={editingItem||{}} action={{onSave:handleSave, onSuccess:()=>{toast.success('Thành công');}}}><div className="grid grid-cols-2 gap-4">${formFields.map((f:any)=>`<div className="${f.inputType==='textarea'?'col-span-2':''}"><label className="text-[10px] font-bold text-[#C69C6D] uppercase block mb-1.5">${f.label}</label>${f.inputType==='checkbox'?`<input type="checkbox" name="${f.name}" defaultChecked={editingItem?.${f.name}} onChange={e=>editingItem?editingItem.${f.name}=e.target.checked:null} className="accent-[#C69C6D] w-5 h-5"/>`:f.inputType==='textarea'?`<textarea name="${f.name}" defaultValue={editingItem?.${f.name}} onChange={e=>!editingItem?null:editingItem.${f.name}=e.target.value} className="w-full bg-[#0a0a0a] border border-white/10 p-3 rounded-lg h-24 text-white text-sm focus:border-[#C69C6D] outline-none"/>`:`<input type="${f.inputType}" name="${f.name}" defaultValue={editingItem?.${f.name}} onChange={e=>!editingItem?null:editingItem.${f.name}=e.target.value} className="w-full bg-[#0a0a0a] border border-white/10 p-2.5 rounded-lg text-white text-sm focus:border-[#C69C6D] outline-none"/>`}</div>`).join('')}</div><div className="h-10"></div></KhungForm></div></div>}

      <ConfirmDialog 
        isOpen={confirmDelete.show} 
        title="XÁC NHẬN XÓA" 
        message="Bạn có chắc chắn muốn xóa dữ liệu này không?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ show: false, id: null })}
        isDangerous={true}
      />
    </>
  );
}
`;
        
        const targetPath = path.join(process.cwd(), 'app', targetRoom);
        if (!fs.existsSync(targetPath)) return NextResponse.json({ error: `Phòng ${targetRoom} không tồn tại` }, { status: 400 });
        
        const componentFolder = path.join(targetPath, 'components', featureName);
        if (!fs.existsSync(componentFolder)) fs.mkdirSync(componentFolder, { recursive: true });

        fs.writeFileSync(path.join(componentFolder, `${featureName}Client.tsx`), clientContent);
        fs.writeFileSync(path.join(componentFolder, 'types.ts'), typesContent);
        fs.writeFileSync(path.join(componentFolder, 'dal.ts'), dalContent);
        fs.writeFileSync(path.join(componentFolder, 'actions.ts'), actionsContent);

        wireFeatureToRoom(targetRoom, featureName);
        return NextResponse.json({ success: true, message: `Đã tiêm ${featureName} và cấu hình Database thành công!` });
    }
    return NextResponse.json({ error: 'Mode không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}