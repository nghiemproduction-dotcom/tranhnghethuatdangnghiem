'use client';
import React, { useState, useEffect } from 'react'; // 🟢 Đã thêm useEffect
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Loader2, User, FileText, Split } from 'lucide-react'; 
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { useRouter } from 'next/navigation';

import ThanhDieuHuong from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuHuong';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';
import ThanhTab, { TabItem } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhTab'; 

// Import các thành phần mới
import { Level3Provider } from './Level3Context';
import { useDuLieuLevel3 } from './useDuLieuLevel3';
import { layCauHinhNgoaiLe } from './CauHinhNgoaiLe';

// TÁI SỬ DỤNG CÁC IMPORT CŨ (Đường dẫn có thể cần chỉnh lại tùy vị trí folder)
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

    // 🟢 FIX QUAN TRỌNG: Reset trạng thái khi Modal mở ra
    useEffect(() => {
        if (isOpen) {
            // Nếu là tạo mới (isCreateMode=true) -> isEditing = true
            // Nếu là xem chi tiết (isCreateMode=false) -> isEditing = false
            setIsEditing(isCreateMode);
            
            // Reset tab về mặc định
            setActiveTab('form');
            setIsArranging(false);
        }
    }, [isOpen, isCreateMode]);

    // Cấu hình ngoại lệ (Tabs, Logout...)
    const { customTabs, showLogout } = layCauHinhNgoaiLe(config.bangDuLieu, isCreateMode);

    // Biến này tên là 'canEdit'
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
            // Loại bỏ các cột ngoại lệ
            excludeColsOnSave.forEach(k => delete payload[k]);

            const { error } = isCreateMode ? await (supabase.from(config.bangDuLieu) as any).insert(payload) : await (supabase.from(config.bangDuLieu) as any).update(payload).eq('id', initialData.id);
            if (error) throw error;
            alert("Đã lưu!"); if(isCreateMode) { onSuccess(); onClose(); } else { setIsEditing(false); onSuccess(); }
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    const handleSaveLayout = async () => {
        setLoading(true);
        await supabase.from('cau_hinh_modules').update({ config_json: { ...config, danhSachCot: orderedColumns } }).eq('module_id', config.id);
        setLoading(false); setIsArranging(false);
    };

    const handleDelete = async () => {
        if(!confirm('Xóa vĩnh viễn?')) return;
        await (supabase.from(config.bangDuLieu) as any).delete().eq('id', initialData.id);
        onSuccess(); onClose();
    };

    const handleLogout = async () => {
        if (confirm("Thoát?")) { await supabase.auth.signOut(); router.push('/'); }
    };

    const tabList: TabItem[] = [
        { id: 'form', label: 'Thông Tin', icon: User },
        ...((config as any).tabs || []).map((t: any) => ({ id: t.id, label: t.label, icon: FileText })),
        ...customTabs, 
        ...(!isCreateMode && config.virtualColumns ? config.virtualColumns.map(v => ({ id: v.key, label: v.label, icon: Split })) : [])
    ];

    if (!isOpen) return null;

    const imgCol = orderedColumns.find(c => ['hinh_anh','avatar'].includes(c.key)) || dynamicColumns.find(c => ['hinh_anh','avatar'].includes(c.key));
    const activeCols = orderedColumns.length > 0 ? orderedColumns : dynamicColumns;
    const title = formData[(config as any).tieuDeCot] || formData.ho_ten || 'CHI TIẾT';

    const contextValue = { 
        config: {...config, danhSachCot: activeCols}, formData, setFormData, isEditing, isArranging, dynamicOptions, 
        onAddNewOption: (k: any) => setDynamicOptions((p: any) => ({...p, [k]: [...(p[k]||[]), 'Mới']})), 
        onImageUpload: handleImageUpload, uploadingImg, canEditColumn, userRole, isOwner, onUpdateColumnOrder: setOrderedColumns 
    };

    return (
        <Level3Provider value={contextValue}>
            <div className="fixed inset-0 bottom-[80px] z-[2300] bg-[#0a0807] flex flex-col shadow-2xl animate-in slide-in-from-right-20">
                <div className="shrink-0 z-[100] bg-[#0a0807] border-b border-[#8B5E3C]/30 shadow-lg p-2"><ThanhDieuHuong danhSachCap={[{id:'b',ten:parentTitle||'Quay lại',onClick:onClose},{id:'c',ten:title.toUpperCase()}]}/></div>
                <NoidungModal>
                    <div className="flex flex-col h-full bg-[#0F0C0B]">
                        <div className="shrink-0 bg-[#0a0807]"><ThanhTab danhSachTab={tabList} tabHienTai={activeTab} onChuyenTab={setActiveTab}/></div>
                        
                        {activeTab === 'form' && <AnhDaiDien imgUrl={imgCol ? formData[imgCol.key] : ''} onUpload={handleImageUpload} uploading={uploadingImg} canEdit={isEditing} label={title}/>}
                        
                        <div className="flex-1 overflow-y-auto custom-scroll p-6 relative">
                            {fetching && <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]"/></div>}
                            {isArranging && <div className="mb-6 p-4 bg-[#C69C6D]/10 border border-[#C69C6D] border-dashed rounded-xl text-center pulse"><p className="text-[#C69C6D] font-bold text-sm uppercase">🔧 Chế độ sắp xếp giao diện</p></div>}
                            
                            {activeTab === 'form' ? <Tab_ThongTin /> 
                            : activeTab === 'thanh_tich' ? <Tab_ThanhTich nhanSuId={initialData?.id} totalKhach={formData?.total_khach || 0} totalViec={formData?.total_viec || 0} totalMau={formData?.total_mau || 0} />
                            : activeTab === 'nhat_ky_hoat_dong' ? <Tab_NhatKyHoatDong nhanSuId={initialData?.id} loginHistory={formData?.lich_su_dang_nhap} />
                            : <TabContent activeTab={activeTab} virtualData={{}} />}
                        </div>
                    </div>
                </NoidungModal>
                
                <NutChucNangLevel3 
                    isCreateMode={isCreateMode} 
                    isEditing={isEditing} 
                    isArranging={isArranging} 
                    loading={loading} 
                    // 🟢 FIX 1: Truyền biến 'canEdit' vào prop 'canEditRecord'
                    canEditRecord={canEdit} 
                    canDeleteRecord={['admin'].includes(userRole)} 
                    isAdmin={userRole==='admin'} 
                    hasError={false}
                    onSave={handleSave} 
                    onEdit={()=>setIsEditing(true)} 
                    onCancel={()=>setIsEditing(false)} 
                    onDelete={handleDelete} 
                    onClose={onClose} 
                    // 🟢 FIX 2: Đổi 'onArrange' thành 'onToggleArrange'
                    onToggleArrange={()=>setIsArranging(!isArranging)} 
                    onSaveLayout={handleSaveLayout} 
                    onLogout={showLogout ? handleLogout : undefined} 
                    onFixDB={() => {}}
                />
            </div>
        </Level3Provider>
    );
}