'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FieldConfig } from '@/app/types/core'
import { Edit3, Trash2, User, LayoutList, ArrowLeft, Camera, Loader2, Save } from 'lucide-react'
import { compressImage } from '@/lib/compressImage'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/lib/UserContext'
import { GenericDisplayConfig } from './GenericList'

// Interface gộp cho cấu hình chi tiết
export interface GenericDetailConfig extends GenericDisplayConfig {
  storageBucket?: string;   // Tên bucket (Mặc định: 'avatar')
  badgeKey?: string;        // Cột hiển thị Badge/Rank
}

export interface DetailTab {
  id: string;
  label: string;
  icon: any; 
  content: React.ReactNode; 
}

interface GenericDetailProps {
  item: any
  fields: FieldConfig[]
  tableName: string 
  config?: GenericDetailConfig 
  onEdit: () => void
  onBack: () => void
  onImageUpdate?: (base64Image: string) => Promise<void>
  additionalTabs?: DetailTab[] 
}

export default function GenericDetail({ 
  item, 
  fields, 
  tableName, 
  config,
  onEdit, 
  onBack, 
  onImageUpdate,
  additionalTabs = [] 
}: GenericDetailProps) {
  
  if (!item) return null

  const router = useRouter();
  const { user } = useUser();
  const supabase = createClient();

  // --- 1. RBAC (Quyền hạn) ---
  const rawRole = user?.phan_loai || user?.role || 'nhan_vien';
  const userRole = String(rawRole).toLowerCase().trim(); 
  const currentUserId = user?.id;

  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'quanly' || userRole === 'quan_ly'; 
  const isOwner = item.id === currentUserId;

  // Quyền: Admin/Quản lý hoặc Chính chủ mới được sửa ảnh
  const canEdit = isAdmin || isManager || isOwner;

  // --- 2. CONFIG ---
  const titleKey = config?.colTitle || fields.find(f => f.type === 'text')?.key || 'id';
  const subKey = config?.colSubTitle;
  const imageKey = config?.colImage || 'hinh_anh';
  const storageBucket = config?.storageBucket || 'avatar'; 

  const title = item[titleKey];
  const subTitle = subKey ? item[subKey] : 'Chi tiết hồ sơ';

  const [activeTab, setActiveTab] = useState('ho_so');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(item[imageKey] || item.avatar || null);

  // --- TABS ---
  const TABS = [
    { id: 'ho_so', label: 'HỒ SƠ CHUNG', icon: LayoutList },
    ...additionalTabs.map(tab => ({ 
        id: tab.id, 
        label: tab.label, 
        icon: tab.icon || LayoutList 
    }))
  ];

  const handleAvatarClick = () => {
    if (canEdit && !isUploading) {
        if (fileInputRef.current) fileInputRef.current.value = '';
        fileInputRef.current?.click();
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        setIsUploading(true);
        // 1. Nén ảnh
        const compressedFile = await compressImage(file, 0.8, 1200);
        
        // 2. Upload Supabase
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${item.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from(storageBucket) 
            .upload(fileName, compressedFile, { cacheControl: '3600', upsert: true });
        
        if (uploadError) throw uploadError;
        
        // 3. Get URL
        const { data: { publicUrl } } = supabase.storage.from(storageBucket).getPublicUrl(fileName);
        
        // 4. Update Database (Chỉ update cột ảnh)
        const { error: updateError } = await supabase
            .from(tableName)
            .update({ [imageKey]: publicUrl }) 
            .eq('id', item.id);
        
        if (updateError) throw updateError;

        setAvatarUrl(publicUrl);
        if (onImageUpdate) await onImageUpdate(publicUrl);
        
        router.refresh(); // Refresh dữ liệu nền
    } catch (error: any) {
        alert(`Lỗi cập nhật ảnh: ${error.message}`);
    } finally {
        setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white animate-in slide-in-from-right-10 duration-300">
      
      {/* HEADER (Đồng bộ style với GenericForm) */}
      <div className="shrink-0 h-[60px] flex items-center justify-between px-6 bg-[#0a0a0a] border-b border-white/5 relative z-20">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded bg-[#111] text-gray-400 hover:text-white hover:bg-[#222] border border-white/10 transition-all"><ArrowLeft size={18}/></button>
            <div className="h-6 w-[1px] bg-white/10" />
            <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">THÔNG TIN CHI TIẾT</h2>
                <p className="text-[10px] text-[#C69C6D] font-bold uppercase tracking-[0.2em] mt-1">ID: {item.id?.substring(0,8) || 'UNKNOWN'}</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            {canEdit && (
                <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-[#C69C6D]/10 text-[#C69C6D] border border-[#C69C6D]/50 hover:bg-[#C69C6D] hover:text-black rounded text-xs font-bold uppercase tracking-wide transition-all">
                    <Edit3 size={14} /> Chỉnh sửa
                </button>
            )}
         </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-hidden relative">
          <div className="h-full flex flex-col lg:flex-row">
              
              {/* CỘT TRÁI (AVATAR & INFO CƠ BẢN) */}
              <div className="w-full lg:w-[350px] shrink-0 bg-[#080808] border-r border-white/5 p-6 flex flex-col items-center overflow-y-auto custom-scrollbar relative">
                  <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-[#C69C6D]/10 to-transparent pointer-events-none"/>

                  <div className={`relative w-32 h-32 mb-6 mt-4 group ${canEdit ? 'cursor-pointer' : 'cursor-default'}`} onClick={handleAvatarClick}>
                      <div className="absolute inset-0 bg-[#C69C6D] blur-xl opacity-20 rounded-full animate-pulse group-hover:opacity-40 transition-opacity"/>
                      <div className={`w-full h-full rounded-xl border-2 p-1 rotate-3 shadow-2xl relative z-10 overflow-hidden transition-all duration-300 ${isUploading ? 'border-yellow-400 animate-pulse' : 'border-[#C69C6D] group-hover:border-white group-hover:scale-105'}`}>
                          <div className="w-full h-full bg-[#1a1a1a] -rotate-3 overflow-hidden rounded-lg relative">
                             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar" /> : <div className="w-full h-full flex items-center justify-center bg-[#111]"><User size={48} className="text-gray-600"/></div>}
                             {canEdit && (
                                 <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-all duration-300 pointer-events-none ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                     {isUploading ? <Loader2 size={24} className="text-[#C69C6D] animate-spin" /> : <><Camera size={24} className="text-[#C69C6D] mb-1" /><span className="text-[8px] font-bold text-white uppercase tracking-widest">Thay đổi</span></>}
                                 </div>
                             )}
                          </div>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>

                  <div className="text-center mb-8 relative z-10 w-full px-4">
                      <h1 className="text-xl font-black text-white uppercase tracking-wider mb-2 break-words">{title || 'NO NAME'}</h1>
                      <div className="inline-block px-3 py-1 bg-white/5 rounded border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{subTitle}</div>
                  </div>
              </div>

              {/* CỘT PHẢI (DATA & TABS) */}
              <div className="flex-1 flex flex-col bg-[#050505] h-full overflow-hidden">
                  <div className="flex items-center gap-1 px-6 pt-6 border-b border-white/5 overflow-x-auto no-scrollbar">
                      {TABS.map(tab => {
                          const IconComp = tab.icon; 
                          return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all relative top-[1px] whitespace-nowrap ${activeTab === tab.id ? 'text-[#C69C6D] border-b-2 border-[#C69C6D] bg-gradient-to-t from-[#C69C6D]/10 to-transparent' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                                <IconComp size={14} /> {tab.label}
                            </button>
                          )
                      })}
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                      {activeTab === 'ho_so' && (
                          <div className="max-w-5xl animate-in fade-in zoom-in-95 duration-300">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                  {fields.filter(f => f.showInDetail !== false && f.key !== imageKey).map((field) => (
                                      <div key={field.key} className="group">
                                          <div className="flex items-center gap-2 mb-1.5">
                                              <div className="w-1 h-1 bg-[#C69C6D] rounded-full opacity-50 group-hover:opacity-100 transition-opacity"/>
                                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#C69C6D] transition-colors">{field.label}</span>
                                          </div>
                                          <div className="p-3 bg-[#111] border border-white/5 rounded group-hover:border-[#C69C6D]/30 transition-all">
                                              <p className="text-sm font-medium text-gray-200 break-words whitespace-pre-line">
                                                {item[field.key] !== null && item[field.key] !== undefined ? String(item[field.key]) : <span className="text-gray-700 italic text-xs">---</span>}
                                              </p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {additionalTabs.map(tab => (
                          activeTab === tab.id && (
                              <div key={tab.id} className="animate-in fade-in zoom-in-95 duration-300">
                                  {tab.content}
                              </div>
                          )
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  )
}