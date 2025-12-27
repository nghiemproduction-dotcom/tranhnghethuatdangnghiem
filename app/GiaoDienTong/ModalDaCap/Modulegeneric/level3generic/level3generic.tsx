'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Loader2, User, FileText, Split, Shield, Zap, Star } from 'lucide-react'; 
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { useRouter } from 'next/navigation';

import ThanhTab, { TabItem } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhTab'; 

import { Level3Provider } from './Level3Context';
import { useDuLieuLevel3 } from './useDuLieuLevel3';
import { layCauHinhNgoaiLe } from './CauHinhNgoaiLe';

import NutChucNangLevel3 from './NutChucNang';
import Tab_ThongTin from './Tab_ThongTin';
import TabContent from './TabContent';
import Tab_NhatKyHoatDong from './Tab_NhatKyHoatDong'; 
import Tab_ThanhTich from './Tab_ThanhTich';
import AnhDaiDien from './AvatarSection';

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; config: ModuleConfig; initialData?: any; userRole: string; userEmail?: string; parentTitle?: string; }

export default function TrangChuLevel3({ isOpen, onClose, onSuccess, config, initialData, userRole, userEmail, parentTitle }: Props) {
    const router = useRouter();
    const { formData, setFormData, loading, setLoading, fetching, uploadingImg, dynamicColumns, orderedColumns, setOrderedColumns, dynamicOptions, setDynamicOptions, handleImageUpload, isCreateMode, isOwner, excludeColsOnSave } = useDuLieuLevel3(config, isOpen, initialData, userRole, userEmail);

    const [isEditing, setIsEditing] = useState(isCreateMode);
    const [isArranging, setIsArranging] = useState(false);
    const [activeTab, setActiveTab] = useState('form');

    useEffect(() => {
        if (isOpen) {
            setIsEditing(isCreateMode);
            setActiveTab('form');
            setIsArranging(false);
        }
    }, [isOpen, isCreateMode]);

    const { customTabs, showLogout } = layCauHinhNgoaiLe(config.bangDuLieu, isCreateMode);
    const canEdit = isCreateMode || ['admin', 'quanly', 'boss'].includes(userRole) || isOwner;
    const canEditColumn = (col: any) => isCreateMode ? !col.tuDong : (!col.readOnly && (col.permEdit?.includes(userRole) || col.permEdit?.includes('all')));

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload: any = {};
            const cols = orderedColumns.length ? orderedColumns : dynamicColumns;
            for (const col of cols) {
                if (col.readOnly || col.tuDong || (!isCreateMode && !canEditColumn(col))) continue;
                let val = formData[col.key];
                if (col.batBuoc && !val) throw new Error(`${col.label} bắt buộc nhập`);
                if (['number','currency'].includes(col.kieuDuLieu)) val = val ? Number(String(val).replace(/,/g, '')) : null;
                payload[col.key] = val;
            }
            excludeColsOnSave.forEach(k => delete payload[k]);

            const { error } = isCreateMode ? await (supabase.from(config.bangDuLieu) as any).insert(payload) : await (supabase.from(config.bangDuLieu) as any).update(payload).eq('id', initialData.id);
            if (error) throw error;
            alert("Đã lưu hồ sơ nhân vật!"); if(isCreateMode) { onSuccess(); onClose(); } else { setIsEditing(false); onSuccess(); }
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    const handleSaveLayout = async () => {
        setLoading(true);
        await supabase.from('cau_hinh_modules').update({ config_json: { ...config, danhSachCot: orderedColumns } }).eq('module_id', config.id);
        setLoading(false); setIsArranging(false);
    };

    const handleDelete = async () => {
        if(!confirm('Xóa vĩnh viễn nhân vật này?')) return;
        await (supabase.from(config.bangDuLieu) as any).delete().eq('id', initialData.id);
        onSuccess(); onClose();
    };

    const handleLogout = async () => {
        if (confirm("Đăng xuất khỏi hệ thống?")) { await supabase.auth.signOut(); router.push('/'); }
    };

    const tabList: TabItem[] = [
        { id: 'form', label: 'Hồ Sơ', icon: User },
        ...((config as any).tabs || []).map((t: any) => ({ id: t.id, label: t.label, icon: FileText })),
        ...customTabs, 
        ...(!isCreateMode && config.virtualColumns ? config.virtualColumns.map(v => ({ id: v.key, label: v.label, icon: Split })) : [])
    ];

    if (!isOpen) return null;

    const imgCol = orderedColumns.find(c => ['hinh_anh','avatar'].includes(c.key)) || dynamicColumns.find(c => ['hinh_anh','avatar'].includes(c.key));
    const activeCols = orderedColumns.length > 0 ? orderedColumns : dynamicColumns;
    const title = formData[(config as any).tieuDeCot] || formData.ho_ten || 'NHÂN VẬT MỚI';
    const subTitle = formData.chuc_vu || formData.role || 'Chưa phân loại';

    const contextValue = { 
        config: {...config, danhSachCot: activeCols}, formData, setFormData, isEditing, isArranging, dynamicOptions, 
        onAddNewOption: (k: any) => setDynamicOptions((p: any) => ({...p, [k]: [...(p[k]||[]), 'Mới']})), 
        onImageUpload: handleImageUpload, uploadingImg, canEditColumn, userRole, isOwner, onUpdateColumnOrder: setOrderedColumns 
    };

    return (
        <Level3Provider value={contextValue}>
            {/* 🟢 CONTAINER CHÍNH - STYLE GAME UI */}
            <div className="fixed top-[85px] bottom-[100px] left-0 right-0 z-[2000] flex flex-col items-center justify-center pointer-events-none">
                
                {/* Lớp nền mờ không chặn click bên ngoài vùng modal */}
                <div className="absolute inset-0 bg-black/60 pointer-events-auto backdrop-blur-sm" onClick={onClose} />

                {/* 🟢 KHUNG GIAO DIỆN CHÍNH (THE CARD) */}
                <div className="relative w-full max-w-6xl h-full max-h-[90vh] md:h-[85vh] bg-[#0f0c0b] border border-[#8B5E3C]/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row overflow-hidden pointer-events-auto md:rounded-xl animate-in zoom-in-95 duration-300">
                    
                    {/* --- CỘT TRÁI: AVATAR & THÔNG TIN CƠ BẢN (CHARACTER CARD) --- */}
                    <div className="w-full md:w-[350px] shrink-0 bg-gradient-to-b from-[#1a1512] to-[#0a0807] border-b md:border-b-0 md:border-r border-[#8B5E3C]/30 relative flex flex-col">
                        {/* Background Effect */}
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                        
                        {/* Header của thẻ nhân vật */}
                        <div className="p-6 text-center z-10">
                            <div className="flex items-center justify-center gap-2 text-[#C69C6D] mb-1 opacity-80">
                                <Shield size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{parentTitle || 'CLASS'}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-[#E8D4B9] uppercase tracking-wide leading-none drop-shadow-md">{title}</h2>
                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#C69C6D]/10 border border-[#C69C6D]/30 rounded-full">
                                <Star size={10} className="text-[#C69C6D] fill-[#C69C6D]" />
                                <span className="text-[10px] font-bold text-[#C69C6D] uppercase">{subTitle}</span>
                            </div>
                        </div>

                        {/* Avatar Area (Chiếm phần lớn không gian) */}
                        <div className="flex-1 flex flex-col items-center justify-center relative p-4">
                            {/* Vòng tròn trang trí */}
                            <div className="absolute w-64 h-64 border border-[#8B5E3C]/10 rounded-full animate-spin-slow pointer-events-none" />
                            <div className="absolute w-56 h-56 border border-dashed border-[#8B5E3C]/20 rounded-full pointer-events-none" />
                            
                            {/* Component Avatar Gốc (Đã tích hợp upload) */}
                            {/* 🟢 FIX LỖI: Đã xóa prop hideLabel để tránh lỗi TypeScript */}
                            <div className="relative z-20 scale-110">
                                <AnhDaiDien 
                                    imgUrl={imgCol ? formData[imgCol.key] : ''} 
                                    onUpload={handleImageUpload} 
                                    uploading={uploadingImg} 
                                    canEdit={isEditing} 
                                    label="" // Ẩn label bằng cách truyền rỗng (nếu component hỗ trợ)
                                />
                            </div>
                        </div>

                        {/* Footer của cột trái: Chỉ số nhanh (Ví dụ giả lập) */}
                        <div className="p-4 grid grid-cols-3 gap-2 border-t border-[#8B5E3C]/20 bg-black/20">
                            <div className="flex flex-col items-center">
                                <Zap size={14} className="text-yellow-500 mb-1" />
                                <span className="text-xs font-bold text-white">LV.1</span>
                            </div>
                            <div className="flex flex-col items-center border-x border-[#8B5E3C]/20">
                                <span className="text-[10px] text-gray-400">ID</span>
                                <span className="text-xs font-bold text-white">#{initialData?.id || 'NEW'}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-400">STATUS</span>
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-1 shadow-[0_0_5px_lime]" />
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI: CHI TIẾT & TAB (STATS & INVENTORY) --- */}
                    <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md relative overflow-hidden">
                        
                        {/* Thanh Tab: Style HUD */}
                        <div className="shrink-0 border-b border-[#8B5E3C]/30 bg-black/40">
                            <ThanhTab danhSachTab={tabList} tabHienTai={activeTab} onChuyenTab={setActiveTab}/>
                        </div>

                        {/* Nội dung cuộn */}
                        <div className="flex-1 overflow-y-auto custom-scroll p-6 relative">
                            {fetching && (
                                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="animate-spin text-[#C69C6D]" size={32}/>
                                        <span className="text-xs font-bold text-[#C69C6D] tracking-widest animate-pulse">LOADING DATA...</span>
                                    </div>
                                </div>
                            )}
                            
                            {isArranging && (
                                <div className="mb-6 p-4 bg-[#C69C6D]/10 border border-[#C69C6D] border-dashed rounded-xl text-center flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-[#C69C6D] animate-ping" />
                                    <p className="text-[#C69C6D] font-bold text-sm uppercase tracking-widest">EDITING UI LAYOUT</p>
                                </div>
                            )}
                            
                            {/* Render Tab Content */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {activeTab === 'form' ? <Tab_ThongTin /> 
                                : activeTab === 'thanh_tich' ? <Tab_ThanhTich nhanSuId={initialData?.id} totalKhach={formData?.total_khach || 0} totalViec={formData?.total_viec || 0} totalMau={formData?.total_mau || 0} />
                                : activeTab === 'nhat_ky_hoat_dong' ? <Tab_NhatKyHoatDong nhanSuId={initialData?.id} loginHistory={formData?.lich_su_dang_nhap} />
                                : <TabContent activeTab={activeTab} virtualData={{}} />}
                            </div>
                        </div>

                        {/* Thanh tác vụ dưới cùng (Action Bar) */}
                        <div className="shrink-0 p-4 border-t border-[#8B5E3C]/30 bg-black/60 flex justify-end gap-3 backdrop-blur-md relative">
                             {/* 🟢 FIX LỖI: Bọc nút chức năng vào div absolute thay vì dùng customClass */}
                             {/* Để đảm bảo nút nằm gọn trong khung này */}
                             <div className="w-full flex justify-end items-center gap-2">
                                <NutChucNangLevel3 
                                    isCreateMode={isCreateMode} 
                                    isEditing={isEditing} 
                                    isArranging={isArranging} 
                                    loading={loading} 
                                    canEditRecord={canEdit} 
                                    canDeleteRecord={['admin'].includes(userRole)} 
                                    isAdmin={userRole==='admin'} 
                                    hasError={false}
                                    onSave={handleSave} 
                                    onEdit={()=>setIsEditing(true)} 
                                    onCancel={()=>setIsEditing(false)} 
                                    onDelete={handleDelete} 
                                    onClose={onClose} 
                                    onToggleArrange={()=>setIsArranging(!isArranging)} 
                                    onSaveLayout={handleSaveLayout} 
                                    onLogout={showLogout ? handleLogout : undefined} 
                                    onFixDB={() => {}}
                                />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </Level3Provider>
    );
}