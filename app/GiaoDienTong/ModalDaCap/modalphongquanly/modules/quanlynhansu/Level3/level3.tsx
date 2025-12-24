'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Loader2, User, CreditCard, History, Split } from 'lucide-react';
import { ModuleConfig, CotHienThi } from '../../../../../DashboardBuilder/KieuDuLieuModule';

import ThanhDieuHuong from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuHuong';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';
import ThanhTab, { TabItem } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhTab'; 

import { VN_BANKS } from '@/app/GiaoDienTong/ModalDaCap/QuyTac/DuLieuMacDinh';
import { mapSqlTypeToUiType, getLabelFromColumn } from '@/app/GiaoDienTong/ModalDaCap/QuyTac/QuyTacMapCot';

import NutChucNangLevel3 from './NutChucNang';
import ThongTinChung from './thongtinchung';
import TabContent from './TabContent';
import { Level3Provider } from './Level3Context';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    config: ModuleConfig;
    initialData?: any; 
    userRole: string; 
    userEmail?: string;
}

const toVietnameseTitleCase = (str: string) => str ? str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

// 🟢 CẬP NHẬT COLUMN_RULES: PHÂN QUYỀN CHẶT CHẼ
const COLUMN_RULES: Record<string, Partial<CotHienThi>> = {
    // 1. TÀI CHÍNH: Chỉ Admin/Quản lý sửa - Owner chỉ được xem
    'tien_cong': { readOnly: true, permRead: ['admin', 'quanly', 'owner'] },
    'luong_thang': { permRead: ['admin', 'quanly', 'owner'], permEdit: ['admin', 'quanly'] },
    'thuong_doanh_thu': { permRead: ['admin', 'quanly', 'owner'], permEdit: ['admin', 'quanly'] },
    'phu_cap': { permRead: ['admin', 'quanly', 'owner'], permEdit: ['admin', 'quanly'] },

    // 2. THÔNG TIN CÁ NHÂN: Cho phép Owner tự sửa
    'so_dien_thoai': { permEdit: ['admin', 'quanly', 'owner'] },
    'dia_chi': { permEdit: ['admin', 'quanly', 'owner'] },
    'ngan_hang': { permEdit: ['admin', 'quanly', 'owner'] },
    'so_tai_khoan': { permEdit: ['admin', 'quanly', 'owner'] },
    'hinh_anh': { permEdit: ['admin', 'quanly', 'owner'] },
    'avatar': { permEdit: ['admin', 'quanly', 'owner'] },
    'email': { permEdit: ['admin', 'quanly', 'owner'] },
    'ten_hien_thi': { permEdit: ['admin', 'quanly', 'owner'] },

    // 3. HỆ THỐNG: Read Only tuyệt đối
    'id': { readOnly: true },
    'created_at': { readOnly: true },
    'updated_at': { readOnly: true },
    'nguoi_tao': { readOnly: true },
    'lich_su_dang_nhap': { readOnly: true, permRead: ['admin'] }, // Chỉ Admin xem log
};

export default function Level3_FormChiTiet({ isOpen, onClose, onSuccess, config, initialData, userRole, userEmail }: Props) {
    const [dynamicColumns, setDynamicColumns] = useState<CotHienThi[]>([]);
    const [orderedColumns, setOrderedColumns] = useState<CotHienThi[]>([]);
    const activeConfig: ModuleConfig = { ...config, danhSachCot: orderedColumns.length > 0 ? orderedColumns : (config.danhSachCot || dynamicColumns) };

    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [error, setError] = useState('');
    const [fetching, setFetching] = useState(false);
    
    // Biến kiểm tra chế độ tạo mới
    const isCreateMode = !initialData;
    
    const [isEditing, setIsEditing] = useState(isCreateMode); 
    const [isArranging, setIsArranging] = useState(false);
    const [activeTab, setActiveTab] = useState('form'); 
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
    const [virtualData, setVirtualData] = useState<Record<string, any[]>>({});

    // Logic Owner: Kiểm tra email đăng nhập có khớp với email trong hồ sơ không
    const isOwner = formData?.email && userEmail && formData.email.trim().toLowerCase() === userEmail.trim().toLowerCase();
    
    // Quyền sửa bản ghi: Tạo mới OR Admin/Quản lý OR Chính chủ
    const canEditRecord = isCreateMode || ['admin', 'quanly', 'boss'].includes(userRole) || isOwner;

    // Logic quyền sửa từng cột
    const canEditColumn = (col: CotHienThi) => {
        if (isCreateMode) return !col.tuDong && !col.readOnly;
        if (col.readOnly) return false;
        
        // Lấy quyền từ config hoặc mặc định là Admin/Quản lý
        const allowed = col.permEdit || ['admin', 'quanly'];
        
        if (allowed.includes('all')) return true;
        if (allowed.includes(userRole)) return true;
        // Nếu là chính chủ và cột cho phép 'owner' sửa -> OK
        if (isOwner && allowed.includes('owner')) return true;
        
        return false;
    };

    const fetchSchema = useCallback(async () => {
        if (config.danhSachCot?.length) { setOrderedColumns(config.danhSachCot); return; }
        const { data } = await supabase.rpc('get_table_schema', { t_name: config.bangDuLieu });
        if (data) {
            const mappedCols = data.map((col: any) => {
                const colKey = col.column_name;
                const detected = mapSqlTypeToUiType(col.data_type, colKey);
                const rule = COLUMN_RULES[colKey] || {};
                const isSystemCol = ['id', 'created_at', 'updated_at', 'nguoi_tao'].includes(colKey);

                return {
                    key: colKey, 
                    label: getLabelFromColumn(colKey), 
                    kieuDuLieu: rule.kieuDuLieu || detected,
                    hienThiList: !isSystemCol, 
                    hienThiDetail: true, 
                    tuDong: isSystemCol,
                    readOnly: rule.readOnly || ['id', 'created_at'].includes(colKey),
                    batBuoc: col.is_nullable === 'NO' && !isSystemCol,
                    formatType: detected === 'email' ? 'email' : (detected === 'phone' ? 'phone' : undefined),
                    // Áp dụng quyền đọc/sửa từ rule
                    permRead: rule.permRead || ['all'], 
                    permEdit: isSystemCol ? [] : (rule.permEdit || ['admin', 'quanly', 'owner'])
                };
            });
            setDynamicColumns(mappedCols); setOrderedColumns(mappedCols);
        }
    }, [config.bangDuLieu, config.danhSachCot]);

    const refreshData = useCallback(async () => {
        if (isCreateMode) return; 
        setFetching(true);
        const { data } = await (supabase as any).from(config.bangDuLieu).select('*').eq('id', initialData.id).single();
        if (data) setFormData(data);
        if (config.virtualColumns) config.virtualColumns.forEach(v => fetchVirtualData(v, initialData.id));
        setFetching(false);
    }, [initialData, config, isCreateMode]);

    useEffect(() => { 
        if (isOpen) { 
            fetchSchema(); 
            if (!isCreateMode) refreshData(); else setFormData({}); 
        } 
    }, [isOpen]);

    useEffect(() => {
        activeConfig.danhSachCot.forEach(col => { if (col.kieuDuLieu === 'select_dynamic') loadDynamicOptions(col); });
    }, [dynamicColumns, orderedColumns]); 

    const loadDynamicOptions = async (col: CotHienThi) => {
        try {
            const { data } = await (supabase as any).from(config.bangDuLieu).select(col.key).not(col.key, 'is', null);
            let dbOptions = data ? Array.from(new Set(data.map((r: any) => r[col.key]))).filter(Boolean) as string[] : [];
            let finalOptions = (col.key.includes('ngan_hang') || col.key.includes('bank')) ? Array.from(new Set([...VN_BANKS, ...dbOptions])) : dbOptions;
            setDynamicOptions(p => ({ ...p, [col.key]: finalOptions.sort() }));
        } catch (e) {}
    };

    const handleAddNewOption = (key: string) => {
        const title = activeConfig.danhSachCot.find(c => c.key === key)?.label || key;
        const newVal = prompt(`Nhập giá trị mới cho "${title}":`);
        if (newVal && newVal.trim()) {
            const cleanVal = toVietnameseTitleCase(newVal.trim());
            setDynamicOptions(prev => ({ ...prev, [key]: [...(prev[key] || []), cleanVal].sort() }));
            setFormData((prev: any) => ({ ...prev, [key]: cleanVal }));
        }
    };

    const fetchVirtualData = async (vCol: any, recordId: string) => {
        if (vCol.type === 'related_list') {
             const { data } = await (supabase as any).from(vCol.targetTable).select('*').eq(vCol.matchColumn, recordId); 
             if (data) setVirtualData(p => ({ ...p, [vCol.key]: data }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploadingImg(true);
        try {
            const file = e.target.files[0];
            const filePath = `avatars/${Date.now()}.${file.name.split('.').pop()}`;
            await supabase.storage.from('avatars').upload(filePath, file);
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const imgCol = activeConfig.danhSachCot.find(c => c.key === 'hinh_anh' || c.key === 'avatar');
            if (imgCol) setFormData((p: any) => ({ ...p, [imgCol.key]: publicUrl }));
        } catch (err: any) { alert('Lỗi: ' + err.message); } finally { setUploadingImg(false); }
    };

    const handleSave = async () => {
        setLoading(true); setError('');
        try {
            const cleanPayload: any = {};
            for (const col of activeConfig.danhSachCot) {
                if (!canEditColumn(col) && !isCreateMode) continue;
                if (col.tuDong) continue;
                let val = formData[col.key];
                if (col.batBuoc && !val) throw new Error(`"${col.label}" là bắt buộc.`);
                if (['number', 'currency', 'int4', 'bigint'].includes(col.kieuDuLieu)) val = val ? Number(String(val).replace(/,/g, '')) : null;
                cleanPayload[col.key] = val;
            }
            const { error } = isCreateMode ? await (supabase.from(activeConfig.bangDuLieu) as any).insert(cleanPayload) : await (supabase.from(activeConfig.bangDuLieu) as any).update(cleanPayload).eq('id', initialData.id);
            if (error) throw error;
            if (isCreateMode) { onSuccess(); onClose(); } else { await refreshData(); setIsEditing(false); onSuccess(); }
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    const handleSaveLayout = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.from('cau_hinh_modules').update({ config_json: { ...config, danhSachCot: orderedColumns } }).eq('module_id', config.id);
            if (error) throw error;
            alert("Đã lưu giao diện thành công!"); setIsArranging(false);
        } catch (err: any) { alert("Lỗi lưu giao diện: " + err.message); } finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm('Xóa vĩnh viễn?')) return;
        setLoading(true);
        const { error } = await (supabase.from(activeConfig.bangDuLieu) as any).delete().eq('id', initialData.id);
        setLoading(false);
        if (!error) { onSuccess(); onClose(); } else alert(error.message);
    };

    const tabList: TabItem[] = [
        { id: 'form', label: 'Hồ Sơ', icon: User }, 
        { id: 'luong_thuong', label: 'Lương', icon: CreditCard }, 
        { id: 'lich_su', label: 'Nhật Ký', icon: History }, 
        ...(!isCreateMode && activeConfig.virtualColumns ? activeConfig.virtualColumns.map(v => ({ id: v.key, label: v.label, icon: Split, count: virtualData[v.key]?.length || 0 })) : [])
    ];

    if (!isOpen) return null;

    const contextValue = {
        config: activeConfig, formData, setFormData, isEditing, isArranging, dynamicOptions,
        onAddNewOption: handleAddNewOption, onImageUpload: handleImageUpload, uploadingImg,
        canEditColumn, userRole, isOwner, onUpdateColumnOrder: setOrderedColumns
    };

    return (
        <Level3Provider value={contextValue}>
            <div className="fixed inset-0 bottom-[80px] z-[2300] bg-[#0a0807] flex flex-col shadow-2xl animate-in slide-in-from-right-20">
                
                <div className="shrink-0 z-[100] bg-[#0a0807] border-b border-[#8B5E3C]/30 shadow-lg">
                    <ThanhDieuHuong danhSachCap={[
                        { id: 'c', ten: 'Quay Lại', onClick: onClose }, 
                        { id: 'd', ten: (formData?.ten_hien_thi || 'CHI TIẾT').toUpperCase() }
                    ]} />
                </div>

                <NoidungModal>
                    <div className="flex flex-col h-full bg-[#0F0C0B] overflow-hidden">
                        <ThongTinChung /> 

                        <div className="shrink-0 bg-[#0a0807] border-b border-[#8B5E3C]/20 z-20">
                            <ThanhTab danhSachTab={tabList} tabHienTai={activeTab} onChuyenTab={setActiveTab} />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scroll p-6 md:p-10 relative">
                            {fetching && <div className="absolute inset-0 bg-[#0a0807]/80 z-50 flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]" size={40}/></div>}
                            {isArranging && <div className="mb-6 p-4 bg-[#C69C6D]/10 border border-[#C69C6D] border-dashed rounded-xl text-center pulse"><p className="text-[#C69C6D] font-bold text-sm uppercase">🔧 Chế độ sắp xếp giao diện</p></div>}
                            <TabContent activeTab={activeTab} virtualData={virtualData} /> 
                        </div>
                    </div>
                </NoidungModal>
                
                <NutChucNangLevel3 isCreateMode={isCreateMode} isEditing={isEditing} isArranging={isArranging} loading={loading} canEditRecord={canEditRecord} canDeleteRecord={['admin'].includes(userRole)} isAdmin={userRole === 'admin'} hasError={!!error} onSave={handleSave} onEdit={() => setIsEditing(true)} onCancel={() => setIsEditing(false)} onDelete={handleDelete} onClose={onClose} onFixDB={() => {}} onToggleArrange={() => setIsArranging(!isArranging)} onSaveLayout={handleSaveLayout} />
            </div>
        </Level3Provider>
    );
}