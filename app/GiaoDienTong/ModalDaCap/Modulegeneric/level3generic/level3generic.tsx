'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
    const [shake, setShake] = useState(false);

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
        if (!isEditing && !isCreateMode) return;
        setLoading(true);
        try {
            const payload: any = {};
            const cols = orderedColumns.length ? orderedColumns : dynamicColumns;
            for (const col of cols) {
                if (col.readOnly || col.tuDong || (!isCreateMode && !canEditColumn(col))) continue;
                let val = formData[col.key];
                
                if (col.batBuoc && (val === undefined || val === null || val === '')) {
                    setShake(true); setTimeout(() => setShake(false), 500); 
                    throw new Error(`${col.label} là bắt buộc nhập!`);
                }
                
                if (['number','currency'].includes(col.kieuDuLieu)) val = val ? Number(String(val).replace(/,/g, '')) : null;
                payload[col.key] = val;
            }
            excludeColsOnSave.forEach(k => delete payload[k]);

            const { error } = isCreateMode ? await (supabase.from(config.bangDuLieu) as any).insert(payload) : await (supabase.from(config.bangDuLieu) as any).update(payload).eq('id', initialData.id);
            if (error) throw error;
            alert("Đã lưu hồ sơ thành công!"); 
            if(isCreateMode) { onSuccess(); onClose(); } else { setIsEditing(false); onSuccess(); }
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (isOpen && (isEditing || isCreateMode)) handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isEditing, isCreateMode, formData]);

    const handleSaveLayout = async () => {
        setLoading(true);
        await supabase.from('cau_hinh_modules').update({ config_json: { ...config, danhSachCot: orderedColumns } }).eq('module_id', config.id);
        setLoading(false); setIsArranging(false);
    };

    const handleDelete = async () => {
        if(!confirm('Xóa vĩnh viễn hồ sơ này? Hành động không thể hoàn tác.')) return;
        await (supabase.from(config.bangDuLieu) as any).delete().eq('id', initialData.id);
        onSuccess(); onClose();
    };

    const handleLogout = async () => {
        if (confirm("Bạn muốn đăng xuất khỏi hệ thống?")) {
            await supabase.auth.signOut();
            window.location.href = '/'; 
        }
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
    const title = formData[(config as any).tieuDeCot] || formData.ho_ten || formData.ten || 'TẠO MỚI';
    const subTitle = formData.chuc_vu || formData.role || formData.ma || 'New Item';

    const contextValue = { 
        config: {...config, danhSachCot: activeCols}, formData, setFormData, isEditing, isArranging, dynamicOptions, 
        onAddNewOption: (k: any) => setDynamicOptions((p: any) => ({...p, [k]: [...(p[k]||[]), 'Mới']})), 
        onImageUpload: handleImageUpload, uploadingImg, canEditColumn, userRole, isOwner, onUpdateColumnOrder: setOrderedColumns 
    };

    return (
        <Level3Provider value={contextValue}>
            {/* 🟢 Z-INDEX 4000: Cao nhất (chỉ dưới Menu) */}
            <div className={`fixed inset-0 z-[4000] flex flex-col items-center justify-center pointer-events-none transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
                
                {/* Lớp nền mờ */}
                <div className="absolute inset-0 bg-black/80 pointer-events-auto backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

                {/* KHUNG GIAO DIỆN CHÍNH */}
                <div className="
                    relative pointer-events-auto overflow-hidden flex flex-col md:flex-row bg-[#0f0c0b] 
                    w-full h-full md:w-[95%] md:max-w-6xl md:h-[85vh] 
                    md:border md:border-[#8B5E3C]/40 md:shadow-[0_0_50px_rgba(0,0,0,0.8)] md:rounded-xl 
                    animate-in zoom-in-95 duration-300
                ">
                    
                    {/* CỘT TRÁI */}
                    <div className="w-full md:w-[350px] shrink-0 bg-gradient-to-b from-[#1a1512] to-[#0a0807] border-b md:border-b-0 md:border-r border-[#8B5E3C]/30 relative flex flex-col transition-all">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                        <div className="p-4 md:p-6 text-center z-10">
                            <div className="flex items-center justify-center gap-2 text-[#C69C6D] mb-1 opacity-80">
                                <Shield size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{parentTitle || 'DETAIL'}</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-[#E8D4B9] uppercase tracking-wide leading-none drop-shadow-md line-clamp-2">{title}</h2>
                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#C69C6D]/10 border border-[#C69C6D]/30 rounded-full">
                                <Star size={10} className="text-[#C69C6D] fill-[#C69C6D]" />
                                <span className="text-[10px] font-bold text-[#C69C6D] uppercase truncate max-w-[200px]">{subTitle}</span>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center relative p-4 min-h-[200px] md:min-h-0">
                            <div className="absolute w-48 h-48 md:w-64 md:h-64 border border-[#8B5E3C]/10 rounded-full animate-spin-slow pointer-events-none" />
                            <div className="absolute w-40 h-40 md:w-56 md:h-56 border border-dashed border-[#8B5E3C]/20 rounded-full pointer-events-none" />
                            <div className="relative z-20 scale-100 md:scale-110 transition-transform">
                                <AnhDaiDien imgUrl={imgCol ? formData[imgCol.key] : ''} onUpload={handleImageUpload} uploading={uploadingImg} canEdit={isEditing} label="" />
                            </div>
                        </div>
                        <div className="p-3 md:p-4 grid grid-cols-3 gap-2 border-t border-[#8B5E3C]/20 bg-black/20">
                            <div className="flex flex-col items-center"><Zap size={14} className="text-yellow-500 mb-1" /><span className="text-xs font-bold text-white">{isCreateMode ? 'NEW' : 'EDIT'}</span></div>
                            <div className="flex flex-col items-center border-x border-[#8B5E3C]/20"><span className="text-[10px] text-gray-400">ID</span><span className="text-xs font-bold text-white">#{initialData?.id || '---'}</span></div>
                            <div className="flex flex-col items-center"><span className="text-[10px] text-gray-400">STATUS</span><div className={`w-2 h-2 rounded-full mt-1 shadow-[0_0_5px] ${isEditing ? 'bg-yellow-500 shadow-yellow-500' : 'bg-green-500 shadow-lime'}`} /></div>
                        </div>
                    </div>

                    {/* CỘT PHẢI */}
                    <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md relative overflow-hidden min-h-0">
                        <div className="shrink-0 border-b border-[#8B5E3C]/30 bg-black/40 overflow-x-auto scrollbar-hide"><ThanhTab danhSachTab={tabList} tabHienTai={activeTab} onChuyenTab={setActiveTab}/></div>
                        <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-6 relative">
                            {fetching && (<div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm"><div className="flex flex-col items-center gap-3"><Loader2 className="animate-spin text-[#C69C6D]" size={32}/><span className="text-xs font-bold text-[#C69C6D] tracking-widest animate-pulse">LOADING DATA...</span></div></div>)}
                            {isArranging && (<div className="mb-6 p-3 bg-[#C69C6D]/10 border border-[#C69C6D] border-dashed rounded-xl text-center flex items-center justify-center gap-2"><div className="w-2 h-2 bg-[#C69C6D] animate-ping" /><p className="text-[#C69C6D] font-bold text-xs md:text-sm uppercase tracking-widest">ĐANG CHỈNH SỬA GIAO DIỆN</p></div>)}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 md:pb-0">
                                {activeTab === 'form' ? <Tab_ThongTin /> : activeTab === 'thanh_tich' ? <Tab_ThanhTich nhanSuId={initialData?.id} totalKhach={formData?.total_khach || 0} totalViec={formData?.total_viec || 0} totalMau={formData?.total_mau || 0} /> : activeTab === 'nhat_ky_hoat_dong' ? <Tab_NhatKyHoatDong nhanSuId={initialData?.id} loginHistory={formData?.lich_su_dang_nhap} /> : <TabContent activeTab={activeTab} virtualData={{}} />}
                            </div>
                        </div>
                        <div className="shrink-0 p-3 md:p-4 border-t border-[#8B5E3C]/30 bg-black/90 md:bg-black/60 flex justify-end gap-3 backdrop-blur-md z-30">
                             <div className="w-full flex justify-end items-center gap-2">
                                <NutChucNangLevel3 isCreateMode={isCreateMode} isEditing={isEditing} isArranging={isArranging} loading={loading} canEditRecord={canEdit} canDeleteRecord={['admin'].includes(userRole)} isAdmin={userRole==='admin'} hasError={false} onSave={handleSave} onEdit={()=>setIsEditing(true)} onCancel={()=>setIsEditing(false)} onDelete={handleDelete} onClose={onClose} onToggleArrange={()=>setIsArranging(!isArranging)} onSaveLayout={handleSaveLayout} onLogout={showLogout ? handleLogout : undefined} onFixDB={() => {}} />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
                .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
                .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </Level3Provider>
    );
}