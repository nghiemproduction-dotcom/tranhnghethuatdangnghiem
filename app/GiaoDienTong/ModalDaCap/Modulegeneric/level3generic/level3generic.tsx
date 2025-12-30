'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Loader2, User, FileText, Split, Shield, Zap, X, AlertTriangle } from 'lucide-react';
import { ModuleConfig, CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { useQuery, useQueryClient } from '@tanstack/react-query'; 

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
import FormNhapLieu from './FormNhapLieu/FormNhapLieu';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    config: ModuleConfig;
    initialData?: any;
    userRole: string;
    userEmail?: string;
    parentTitle?: string;
}

export default function TrangChuLevel3({ 
    isOpen, 
    onClose, 
    onSuccess, 
    config, 
    initialData, 
    userRole, 
    userEmail, 
    parentTitle 
}: Props) {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [isArranging, setIsArranging] = useState(false);
    const [activeTab, setActiveTab] = useState('form');
    const [shake, setShake] = useState(false);

    const isCreateMode = !initialData?.id;

    useEffect(() => {
        if (isOpen) {
            setIsEditing(isCreateMode);
            setActiveTab('form');
        }
    }, [isOpen, isCreateMode, initialData?.id]);

    const { data: dbCols, isLoading: loadingSchema } = useQuery({
        queryKey: ['schema', config.bangDuLieu],
        queryFn: async () => {
            try {
                const { data, error } = await supabase.rpc('get_table_columns', { t_name: config.bangDuLieu });
                if (!error && data) return data;
            } catch (e) { return null; }
            return null;
        },
        enabled: isOpen,
        staleTime: Infinity,
    });

    const { data: recordData, isLoading: loadingRecord } = useQuery({
        queryKey: ['detail', config.bangDuLieu, initialData?.id],
        queryFn: async () => {
            if (!initialData?.id) return null;
            const { data, error } = await supabase.from(config.bangDuLieu).select('*').eq('id', initialData.id).single();
            // Cache của trình duyệt đôi khi lưu kết quả cũ, dùng fetch policy để xử lý ở tầng ngoài
            return data || null;
        },
        enabled: isOpen && !isCreateMode,
        // 🟢 CẤM CACHE DETAIL: Luôn lấy mới nhất
        staleTime: 0,
        gcTime: 0
    });

    const extendedConfig: ModuleConfig = useMemo(() => {
        const currentCols = config.danhSachCot || [];
        if (!dbCols || dbCols.length === 0) return config;
        
        const currentKeys = currentCols.map(c => c.key);
        const missingCols: CotHienThi[] = dbCols
            .filter((db: any) => db.column_name && !currentKeys.includes(db.column_name))
            .map((db: any) => {
                let type = 'text';
                const colName = db.column_name || '';
                
                if (db.data_type === 'boolean') type = 'boolean';
                else if (['integer', 'numeric', 'float', 'double precision', 'bigint'].includes(db.data_type)) type = 'number';
                else if (['timestamp', 'date', 'timestamptz'].includes(db.data_type)) type = 'date';
                else if (colName.includes('hinh_anh') || colName.includes('avatar')) type = 'image';
                else if (colName.includes('mo_ta') || colName.includes('ghi_chu')) type = 'textarea';
                else if (colName.endsWith('_id') && colName !== 'id') type = 'select_dynamic';

                return {
                    key: colName,
                    label: colName.replaceAll('_', ' ').toUpperCase(),
                    kieuDuLieu: type,
                    hienThiList: false,
                    hienThiDetail: true,
                    batBuoc: db.is_nullable === 'NO' && colName !== 'id'
                };
            });

        return { ...config, danhSachCot: [...currentCols, ...missingCols] };
    }, [config, dbCols]);

    const { 
        setOrderedColumns, 
        handleImageUpload, 
        orderedColumns: hookColumns,
        formData: hookData 
    } = useDuLieuLevel3(extendedConfig, isOpen, initialData || {}, userRole, userEmail);
    
    const { customTabs, showLogout } = layCauHinhNgoaiLe(config.bangDuLieu, isCreateMode);

    const activeCols = (extendedConfig.danhSachCot && extendedConfig.danhSachCot.length > 0) 
        ? extendedConfig.danhSachCot 
        : (hookColumns || []);

    const finalData = isCreateMode ? {} : (recordData || hookData || initialData || {});
    const canEdit = isCreateMode || ['admin', 'quanly', 'boss'].includes(userRole);
    const hasColumns = activeCols.length > 0;

    const handleDelete = async () => {
        if(!confirm('Xóa vĩnh viễn?')) return;
        const { error } = await supabase.from(config.bangDuLieu).delete().eq('id', initialData.id);
        if (!error) { 
            // 🟢 QUAN TRỌNG: Gọi onSuccess để Level 2 biết đường refresh
            onSuccess(); 
            onClose(); 
        } else { 
            alert("Lỗi xóa: " + error.message); 
        }
    };

    const handleLogout = async () => { if (confirm("Đăng xuất?")) { await supabase.auth.signOut(); window.location.href = '/'; } };
    const handleSaveLayout = async () => { setIsArranging(false); };

    const tabList: TabItem[] = useMemo(() => {
        return [
            { id: 'form', label: 'Thông Tin', icon: User },
            ...((config as any).tabs || []).map((t: any) => ({ id: t.id, label: t.label, icon: FileText })),
            ...customTabs, 
            ...(!isCreateMode && config.virtualColumns ? config.virtualColumns.map(v => ({ id: v.key, label: v.label, icon: Split })) : [])
        ];
    }, [config, customTabs, isCreateMode]);

    if (!isOpen) return null;

    const isDataLoading = (loadingSchema && !activeCols.length) || (!!initialData?.id && loadingRecord && !finalData.id);
    if (isDataLoading && !isEditing) {
        return <div className="fixed inset-0 z-[5000] bg-black/90 flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]" size={40}/></div>;
    }

    const title = finalData[(config as any).tieuDeCot] || finalData.ho_ten || finalData.ten_du_an || finalData.ten || (isCreateMode ? 'TẠO MỚI' : 'CHI TIẾT');
    
    const contextValue = { 
        config: {...extendedConfig, danhSachCot: activeCols}, 
        formData: finalData, 
        setFormData: () => {}, 
        isEditing, isArranging: false, dynamicOptions: {}, onAddNewOption: () => {}, 
        onImageUpload: handleImageUpload, uploadingImg: false, 
        canEditColumn: () => true, userRole, isOwner: false, onUpdateColumnOrder: setOrderedColumns 
    };

    return (
        <Level3Provider value={contextValue}>
            <div className={`fixed inset-0 z-[4000] flex flex-col items-center justify-center pointer-events-none transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
                <div className="absolute inset-0 bg-black/80 pointer-events-auto backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
                <div className="relative pointer-events-auto overflow-hidden flex flex-col md:flex-row bg-[#0f0c0b] w-full h-full md:w-[95%] md:max-w-6xl md:h-[85vh] md:border md:border-[#8B5E3C]/40 md:shadow-[0_0_50px_rgba(0,0,0,0.8)] md:rounded-xl animate-in zoom-in-95 duration-300">
                    {!isEditing && (
                        <div className="w-full md:w-[350px] shrink-0 bg-gradient-to-b from-[#1a1512] to-[#0a0807] border-b md:border-b-0 md:border-r border-[#8B5E3C]/30 relative flex flex-col">
                            <div className="p-6 text-center z-10">
                                <Shield size={14} className="mx-auto text-[#C69C6D] mb-2"/>
                                <h2 className="text-xl font-bold text-[#E8D4B9] uppercase line-clamp-2">{title}</h2>
                                <p className="text-[10px] text-gray-500 font-mono mt-1">ID: {initialData?.id || 'New'}</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                                <AnhDaiDien imgUrl={finalData.avatar || finalData.hinh_anh || ''} onUpload={()=>{}} uploading={false} canEdit={false} label={title.charAt(0)}/>
                            </div>
                        </div>
                    )}
                    <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md relative overflow-hidden min-h-0">
                        {isEditing ? (
                            <div className="flex-1 overflow-y-auto custom-scroll p-6 bg-[#161210]">
                                <div className="max-w-3xl mx-auto">
                                    <div className="flex items-center justify-between border-b border-[#8B5E3C]/30 pb-4 mb-6">
                                        <h3 className="text-lg font-bold text-[#C69C6D] uppercase flex items-center gap-2"><Zap size={18}/> {isCreateMode ? 'Tạo Dữ Liệu Mới' : 'Chỉnh Sửa Thông Tin'}</h3>
                                        <button onClick={() => isCreateMode ? onClose() : setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400"><X size={20}/></button>
                                    </div>
                                    <FormNhapLieu 
                                        config={extendedConfig} formData={finalData} setFormData={() => {}} 
                                        onSubmit={() => { onSuccess(); if(isCreateMode) onClose(); else setIsEditing(false); }}
                                        onCancel={() => isCreateMode ? onClose() : setIsEditing(false)}
                                        loading={false} columns={activeCols} isCreateMode={isCreateMode}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="shrink-0 border-b border-[#8B5E3C]/30 bg-black/40 overflow-x-auto scrollbar-hide"><ThanhTab danhSachTab={tabList} tabHienTai={activeTab} onChuyenTab={setActiveTab}/></div>
                                <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-6">
                                    {!hasColumns && (
                                        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg flex flex-col gap-2 mb-4">
                                            <div className="flex items-center gap-2 text-red-400 font-bold"><AlertTriangle size={20}/><span>KHÔNG LOAD ĐƯỢC CẤU TRÚC BẢNG!</span></div>
                                            <p className="text-sm text-red-200">Kiểm tra tên bảng: <b>{config.bangDuLieu}</b> hoặc quyền truy cập.</p>
                                        </div>
                                    )}
                                    {activeTab === 'form' ? <Tab_ThongTin /> 
                                    : activeTab === 'thanh_tich' ? <Tab_ThanhTich nhanSuId={initialData?.id} totalKhach={finalData?.total_khach || 0} totalViec={finalData?.total_viec || 0} totalMau={finalData?.total_mau || 0} />
                                    : activeTab === 'nhat_ky_hoat_dong' ? <Tab_NhatKyHoatDong nhanSuId={initialData?.id} loginHistory={finalData?.lich_su_dang_nhap} />
                                    : <TabContent activeTab={activeTab} virtualData={{}} />}
                                </div>
                                <div className="shrink-0 p-3 border-t border-[#8B5E3C]/30 bg-black/60 flex justify-end gap-3 backdrop-blur-md">
                                    <NutChucNangLevel3 isCreateMode={false} isEditing={false} isArranging={isArranging} loading={false} canEditRecord={canEdit} canDeleteRecord={['admin'].includes(userRole)} isAdmin={userRole==='admin'} hasError={!hasColumns} onSave={()=>{}} onEdit={()=>setIsEditing(true)} onCancel={()=>{}} onDelete={handleDelete} onClose={onClose} onToggleArrange={()=>setIsArranging(!isArranging)} onSaveLayout={handleSaveLayout} onLogout={showLogout ? handleLogout : undefined} onFixDB={() => {}} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <style jsx global>{` @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 90% { transform: translateX(-5px); } 50% { transform: translateX(5px); } } .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; } `}</style>
        </Level3Provider>
    );
}