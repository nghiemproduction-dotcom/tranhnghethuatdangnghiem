'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Loader2, User, CreditCard, History, Split, Box, FileText, Settings, BarChart, Trophy } from 'lucide-react'; 
import { ModuleConfig, CotHienThi } from '../../../../../DashboardBuilder/KieuDuLieuModule';
import { useRouter } from 'next/navigation';

import ThanhDieuHuong from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuHuong';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';
import ThanhTab, { TabItem } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhTab'; 

import { VN_BANKS } from '@/app/GiaoDienTong/ModalDaCap/QuyTac/DuLieuMacDinh';
import { mapSqlTypeToUiType, getLabelFromColumn } from '@/app/GiaoDienTong/ModalDaCap/QuyTac/QuyTacMapCot';

import NutChucNangLevel3 from './NutChucNang';
import ThongTinChung from './thongtinchung';
import TabContent from './TabContent';
import { Level3Provider } from './Level3Context';
import Tab_NhatKyHoatDong from './Tab_NhatKyHoatDong'; 
import Tab_ThanhTich from './Tab_ThanhTich';

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

const BUCKET_NAME = 'images'; 
const toVietnameseTitleCase = (str: string) => str ? str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

const ICON_MAP: any = {
    'user': User, 'money': CreditCard, 'history': History, 
    'box': Box, 'file': FileText, 'settings': Settings, 'chart': BarChart
};

const HIDDEN_COLS = ['luong_theo_gio', 'lan_dang_nhap_ts', 'nguoi_tao', 'tao_luc', 'id'];

export default function Level3_FormChiTiet({ isOpen, onClose, onSuccess, config, initialData, userRole, userEmail, parentTitle }: Props) {
    const router = useRouter();

    const [dynamicColumns, setDynamicColumns] = useState<CotHienThi[]>([]);
    const [orderedColumns, setOrderedColumns] = useState<CotHienThi[]>([]);
    
    const activeConfig: ModuleConfig = { ...config, danhSachCot: orderedColumns.length > 0 ? orderedColumns : (config.danhSachCot || dynamicColumns) };

    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [error, setError] = useState('');
    const [fetching, setFetching] = useState(false);
    
    const isCreateMode = !initialData;
    const [isEditing, setIsEditing] = useState(isCreateMode); 
    const [isArranging, setIsArranging] = useState(false);
    const [activeTab, setActiveTab] = useState('form'); 
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
    const [virtualData, setVirtualData] = useState<Record<string, any[]>>({});

    const isOwner = formData?.email && userEmail && formData.email.trim().toLowerCase() === userEmail.trim().toLowerCase();
    const canEditRecord = isCreateMode || ['admin', 'quanly', 'boss'].includes(userRole) || isOwner;

    const canEditColumn = (col: CotHienThi) => {
        if (isCreateMode) return !col.tuDong && !col.readOnly;
        if (col.readOnly) return false;
        const allowed = col.permEdit && col.permEdit.length > 0 ? col.permEdit : ['admin', 'quanly'];
        if (allowed.includes('all')) return true;
        if (allowed.includes(userRole)) return true;
        if (isOwner && allowed.includes('owner')) return true;
        return false;
    };

    const fetchSchema = useCallback(async () => {
        if (config.danhSachCot?.length) { setOrderedColumns(config.danhSachCot); return; }

        const { data: tableInfo } = await supabase.rpc('get_table_schema', { t_name: config.bangDuLieu });
        const { data: dbConfig } = await supabase.from('cau_hinh_cot').select('*').eq('bang_du_lieu', config.bangDuLieu).order('thu_tu', { ascending: true });

        if (tableInfo) {
            const filteredTableInfo = tableInfo.filter((col: any) => !HIDDEN_COLS.includes(col.column_name));
            const mappedCols = filteredTableInfo.map((col: any) => {
                const colKey = col.column_name;
                const setting = dbConfig?.find((c: any) => c.cot_du_lieu === colKey) || {};
                const detectedType = mapSqlTypeToUiType(col.data_type, colKey);
                const isSystemCol = ['id', 'tao_luc', 'updated_at', 'nguoi_tao'].includes(colKey) || setting.la_cot_he_thong === true;

                return {
                    key: colKey, 
                    label: setting.tieu_de || getLabelFromColumn(colKey), 
                    kieuDuLieu: setting.loai_hien_thi || detectedType,
                    hienThiList: setting.an_hien_thi === true ? false : true, 
                    hienThiDetail: setting.an_hien_thi === true ? false : true, 
                    tuDong: isSystemCol,
                    readOnly: isSystemCol || setting.cho_phep_sua === false,
                    batBuoc: setting.bat_buoc_nhap === true || (col.is_nullable === 'NO' && !isSystemCol),
                    permRead: setting.quyen_xem || ['all'], 
                    permEdit: setting.quyen_sua || ['admin', 'quanly']
                };
            });

            if (dbConfig && dbConfig.length > 0) {
                mappedCols.sort((a: any, b: any) => {
                    const idxA = dbConfig.findIndex((c: any) => c.cot_du_lieu === a.key);
                    const idxB = dbConfig.findIndex((c: any) => c.cot_du_lieu === b.key);
                    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
                });
            }
            setDynamicColumns(mappedCols); 
            setOrderedColumns(mappedCols);
        }
    }, [config.bangDuLieu, config.danhSachCot]);

    const refreshData = useCallback(async () => {
        if (isCreateMode) return; 
        setFetching(true);
        // Nâng cấp: Lấy dữ liệu từ View thống kê
        const tableToQuery = config.bangDuLieu === 'nhan_su' ? 'view_nhan_su_thong_ke' : config.bangDuLieu;
        const { data } = await (supabase as any).from(tableToQuery).select('*').eq('id', initialData.id).single();
        if (data) setFormData(data);
        if (config.virtualColumns) config.virtualColumns.forEach(v => fetchVirtualData(v, initialData.id));
        setFetching(false);
    }, [initialData, config, isCreateMode]);

    useEffect(() => { 
        if (isOpen) { 
            fetchSchema();
            setIsEditing(isCreateMode); 
            if (!isCreateMode) refreshData(); 
            else setFormData({}); 
        } 
    }, [isOpen, initialData, fetchSchema, isCreateMode, refreshData]);

    useEffect(() => {
        activeConfig.danhSachCot.forEach(col => { if (col.kieuDuLieu === 'select_dynamic') loadDynamicOptions(col); });
    }, [dynamicColumns, orderedColumns, activeConfig.danhSachCot]); 

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

    const compressImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width; let height = img.height; const MAX_SIZE = 500; 
                if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                if(!ctx) return reject("Canvas Error"); ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => { if (blob) resolve(blob); else reject("Compression Error"); }, 'image/jpeg', 0.8);
            };
            img.onerror = (err) => reject(err);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploadingImg(true);
        try {
            const originalFile = e.target.files[0]; const compressedBlob = await compressImage(originalFile);
            const newFile = new File([compressedBlob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const filePath = `${Date.now()}_${newFile.name}`; 
            const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, newFile, { cacheControl: '3600', upsert: false });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
            const imgCol = activeConfig.danhSachCot.find(c => ['hinh_anh', 'avatar', 'hinh_dai_dien'].includes(c.key));
            if (imgCol) setFormData((p: any) => ({ ...p, [imgCol.key]: publicUrl }));
        } catch (err: any) { alert(`Lỗi tải ảnh: ` + (err.message || err)); } finally { setUploadingImg(false); }
    };

    const handleSave = async () => {
        setLoading(true); setError('');
        try {
            const cleanPayload: any = {};
            for (const col of activeConfig.danhSachCot) {
                if (!col.hienThiDetail || col.readOnly || col.tuDong) continue;
                if (!canEditColumn(col) && !isCreateMode) continue;
                let val = formData[col.key];
                if (col.batBuoc && (val === null || val === undefined || val === '')) throw new Error(`Trường "${col.label}" là bắt buộc nhập.`);
                if (['number', 'currency', 'percent'].includes(col.kieuDuLieu)) val = val ? Number(String(val).replace(/,/g, '')) : null;
                cleanPayload[col.key] = val;
            }
            const exclude = ['total_khach', 'total_viec', 'total_mau', 'nguoi_tao', 'tao_luc'];
            exclude.forEach(k => delete cleanPayload[k]);
            let result = isCreateMode ? await (supabase.from(activeConfig.bangDuLieu) as any).insert(cleanPayload) : await (supabase.from(activeConfig.bangDuLieu) as any).update(cleanPayload).eq('id', initialData.id);
            if (result.error) throw result.error;
            alert("Đã lưu thành công!");
            if (isCreateMode) { onSuccess(); onClose(); } else { await refreshData(); setIsEditing(false); onSuccess(); }
        } catch (err: any) { setError(err.message); alert("Lỗi lưu: " + err.message); } finally { setLoading(false); }
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
        setLoading(true); const { error } = await (supabase.from(activeConfig.bangDuLieu) as any).delete().eq('id', initialData.id);
        setLoading(false); if (!error) { onSuccess(); onClose(); } else alert(error.message);
    };

    const handleLogout = async () => {
        if (confirm("⚠️ BẠN CÓ CHẮC CHẮN MUỐN ĐĂNG XUẤT?")) {
            await supabase.auth.signOut(); router.push('/'); window.location.reload(); 
        }
    };

    const tabList: TabItem[] = [
        { id: 'form', label: 'Thông Tin', icon: User },
        ...((config as any).tabs || []).map((t: any) => ({ id: t.id, label: t.label, icon: ICON_MAP[t.icon] || FileText })),
        { id: 'nhat_ky_hoat_dong', label: 'Hoạt Động', icon: History },
        ...(!isCreateMode && activeConfig.virtualColumns ? activeConfig.virtualColumns.map(v => ({ id: v.key, label: v.label, icon: Split, count: virtualData[v.key]?.length || 0 })) : [])
    ];
    if (!isCreateMode && config.bangDuLieu === 'nhan_su') tabList.splice(1, 0, { id: 'thanh_tich', label: 'Thành Tích', icon: Trophy });

    if (!isOpen) return null;

    const contextValue = {
        config: activeConfig, formData, setFormData, isEditing, isArranging, dynamicOptions,
        onAddNewOption: handleAddNewOption, onImageUpload: handleImageUpload, uploadingImg,
        canEditColumn, userRole, isOwner, onUpdateColumnOrder: setOrderedColumns
    };

    return (
        <Level3Provider value={contextValue}>
            <div className="fixed inset-0 bottom-[80px] z-[2300] bg-[#0a0807] flex flex-col shadow-2xl animate-in slide-in-from-right-20">
                <div className="shrink-0 z-[100] bg-[#0a0807] border-b border-[#8B5E3C]/30 shadow-lg flex items-center justify-between pr-4">
                    <div className="flex-1">
                        <ThanhDieuHuong danhSachCap={[
                            { id: 'back', ten: parentTitle || 'Quay Lại', onClick: onClose }, 
                            { id: 'd', ten: ((config as any).tieuDeCot && formData[(config as any).tieuDeCot]) ? formData[(config as any).tieuDeCot].toUpperCase() : (formData?.ho_ten || 'CHI TIẾT').toUpperCase() }
                        ]} />
                    </div>
                </div>
                <NoidungModal>
                    <div className="flex flex-col h-full bg-[#0F0C0B] overflow-hidden">
                        <div className="shrink-0 bg-[#0a0807] border-b border-[#8B5E3C]/20 z-20">
                            <ThanhTab danhSachTab={tabList} tabHienTai={activeTab} onChuyenTab={setActiveTab} />
                        </div>
                        {activeTab === 'form' && <div className="border-b border-[#8B5E3C]/20"><ThongTinChung /></div>}
                        <div className="flex-1 overflow-y-auto custom-scroll p-6 md:p-10 relative">
                            {fetching && <div className="absolute inset-0 bg-[#0a0807]/80 z-50 flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]" size={40}/></div>}
                            {isArranging && <div className="mb-6 p-4 bg-[#C69C6D]/10 border border-[#C69C6D] border-dashed rounded-xl text-center pulse"><p className="text-[#C69C6D] font-bold text-sm uppercase">🔧 Chế độ sắp xếp giao diện</p></div>}
                            {activeTab === 'thanh_tich' ? (
                                <Tab_ThanhTich nhanSuId={initialData?.id} totalKhach={formData?.total_khach || 0} totalViec={formData?.total_viec || 0} totalMau={formData?.total_mau || 0} />
                            ) : activeTab === 'nhat_ky_hoat_dong' ? (
                                <Tab_NhatKyHoatDong nhanSuId={initialData?.id} loginHistory={formData?.lich_su_dang_nhap} />
                            ) : <TabContent activeTab={activeTab} virtualData={virtualData} />}
                        </div>
                    </div>
                </NoidungModal>
                <NutChucNangLevel3 
                    isCreateMode={isCreateMode} isEditing={isEditing} isArranging={isArranging} 
                    loading={loading} canEditRecord={canEditRecord} canDeleteRecord={['admin'].includes(userRole)}
                    isAdmin={userRole === 'admin'} hasError={!!error}
                    onSave={handleSave} onEdit={() => setIsEditing(true)} onCancel={() => setIsEditing(false)} 
                    onDelete={handleDelete} onClose={onClose} onFixDB={() => {}}
                    onToggleArrange={() => setIsArranging(!isArranging)} onSaveLayout={handleSaveLayout}
                    onLogout={config.bangDuLieu === 'nhan_su' ? handleLogout : undefined}
                />
            </div>
        </Level3Provider>
    );
}