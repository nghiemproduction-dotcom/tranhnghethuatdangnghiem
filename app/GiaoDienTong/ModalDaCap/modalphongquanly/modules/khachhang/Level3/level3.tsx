'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Loader2, User, History, CreditCard } from 'lucide-react';
import { ModuleConfig, CotHienThi } from '../../../../../DashboardBuilder/KieuDuLieuModule';

import ThanhDieuHuong from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuHuong';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';
import ThanhTab, { TabItem } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhTab'; 
import { VN_BANKS } from '@/app/GiaoDienTong/ModalDaCap/QuyTac/DuLieuMacDinh';
import { mapSqlTypeToUiType, getLabelFromColumn } from '@/app/GiaoDienTong/ModalDaCap/QuyTac/QuyTacMapCot';

// Import các component con trong cùng thư mục Level3
import NutChucNangLevel3 from './NutChucNang';
import ThongTinChung from './thongtinchung';
import TabContent from './TabContent';
import { Level3Provider } from './Level3Context';
import Tab_NhatKyHoatDong from './Tab_NhatKyHoatDong';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    config: ModuleConfig;
    initialData?: any; 
    userRole: string; 
    userEmail?: string;
}

const BUCKET_NAME = 'images'; 

// Hàm tiện ích viết hoa chữ cái đầu
const toVietnameseTitleCase = (str: string) => str ? str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

export default function Level3_FormChiTiet({ isOpen, onClose, onSuccess, config, initialData, userRole, userEmail }: Props) {
    const [dynamicColumns, setDynamicColumns] = useState<CotHienThi[]>([]);
    const [orderedColumns, setOrderedColumns] = useState<CotHienThi[]>([]);
    
    // Config
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

    // 🟢 CHECK QUYỀN
    const canEditColumn = (col: CotHienThi) => {
        if (isCreateMode) return !col.tuDong && !col.readOnly;
        if (col.readOnly) return false;
        const allowed = col.permEdit && col.permEdit.length > 0 ? col.permEdit : ['admin', 'quanly'];
        if (allowed.includes('all')) return true;
        if (allowed.includes(userRole)) return true;
        return false;
    };

    // 🟢 FETCH SCHEMA TỪ DATABASE (Dynamic Rules)
    const fetchSchema = useCallback(async () => {
        if (config.danhSachCot?.length) { setOrderedColumns(config.danhSachCot); return; }

        // 1. Lấy thông tin cột vật lý
        const { data: tableInfo } = await supabase.rpc('get_table_schema', { t_name: config.bangDuLieu });
        
        // 2. Lấy cấu hình hiển thị từ bảng 'cau_hinh_cot'
        const { data: dbConfig } = await supabase
            .from('cau_hinh_cot')
            .select('*')
            .eq('bang_du_lieu', config.bangDuLieu)
            .order('thu_tu', { ascending: true });

        if (tableInfo) {
            const mappedCols = tableInfo.map((col: any) => {
                const colKey = col.column_name;
                const setting = dbConfig?.find((c: any) => c.cot_du_lieu === colKey) || {};
                const isSystemCol = ['id', 'tao_luc', 'updated_at', 'nguoi_tao'].includes(colKey);

                return {
                    key: colKey, 
                    label: setting.tieu_de || getLabelFromColumn(colKey), 
                    kieuDuLieu: setting.loai_hien_thi || mapSqlTypeToUiType(col.data_type, colKey),
                    hienThiList: !isSystemCol, 
                    hienThiDetail: setting.an_hien_thi === true ? false : true, 
                    tuDong: isSystemCol,
                    readOnly: setting.cho_phep_sua === false || isSystemCol,
                    batBuoc: (col.is_nullable === 'NO' || setting.bat_buoc_nhap === true) && !isSystemCol,
                    permRead: setting.quyen_xem || ['all'], 
                    permEdit: isSystemCol ? [] : (setting.quyen_sua || ['admin', 'quanly', 'owner'])
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
        const { data } = await (supabase as any).from(config.bangDuLieu).select('*').eq('id', initialData.id).single();
        if (data) setFormData(data);
        setFetching(false);
    }, [initialData, config, isCreateMode]);

    useEffect(() => { if (isOpen) { fetchSchema(); if (!isCreateMode) refreshData(); else setFormData({}); } }, [isOpen]);

    useEffect(() => {
        activeConfig.danhSachCot.forEach(col => { if (col.kieuDuLieu === 'select_dynamic') loadDynamicOptions(col); });
    }, [dynamicColumns, orderedColumns]); 

    const loadDynamicOptions = async (col: CotHienThi) => {
        try {
            const { data } = await (supabase as any).from(config.bangDuLieu).select(col.key).not(col.key, 'is', null);
            let dbOptions = data ? Array.from(new Set(data.map((r: any) => r[col.key]))).filter(Boolean) as string[] : [];
            let finalOptions = (col.key.includes('ngan_hang')) ? Array.from(new Set([...VN_BANKS, ...dbOptions])) : dbOptions;
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

    const compressImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 800; 
                if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                if(!ctx) return reject("Canvas Error");
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if(blob) resolve(blob); else reject("Compression Error");
                }, 'image/jpeg', 0.8);
            };
            img.onerror = (err) => reject(err);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploadingImg(true);
        try {
            const originalFile = e.target.files[0];
            const compressedBlob = await compressImage(originalFile);
            const newFile = new File([compressedBlob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const filePath = `${Date.now()}_${newFile.name}`; 
            const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, newFile, { upsert: false });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
            const imgCol = activeConfig.danhSachCot.find(c => c.key === 'hinh_anh' || c.key === 'avatar');
            if (imgCol) setFormData((p: any) => ({ ...p, [imgCol.key]: publicUrl }));
        } catch (err: any) { alert(`Lỗi tải ảnh: ${err.message}`); } finally { setUploadingImg(false); }
    };

    const handleSave = async () => {
        setLoading(true); setError('');
        try {
            const cleanPayload: any = {};
            for (const col of activeConfig.danhSachCot) {
                if (!col.hienThiDetail) continue; 
                if (col.readOnly) continue;
                if (col.tuDong) continue;
                if (!canEditColumn(col) && !isCreateMode) continue;

                let val = formData[col.key];
                if (col.batBuoc && (val === null || val === undefined || val === '')) {
                    throw new Error(`Trường "${col.label}" là bắt buộc nhập.`);
                }
                if (['number', 'currency', 'percent', 'int4', 'bigint', 'numeric'].includes(col.kieuDuLieu)) {
                    val = val ? Number(String(val).replace(/,/g, '')) : null;
                }
                cleanPayload[col.key] = val;
            }

            let result;
            if (isCreateMode) {
                result = await (supabase.from(activeConfig.bangDuLieu) as any).insert(cleanPayload);
            } else {
                if (!initialData.id) throw new Error("Không tìm thấy ID bản ghi.");
                result = await (supabase.from(activeConfig.bangDuLieu) as any).update(cleanPayload).eq('id', initialData.id);
            }

            if (result.error) throw result.error;
            alert("Đã lưu thành công!");
            if (isCreateMode) { onSuccess(); onClose(); } else { await refreshData(); setIsEditing(false); onSuccess(); }
        } catch (err: any) { setError(err.message); alert("Lỗi lưu: " + err.message); } finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm('Xóa vĩnh viễn?')) return;
        setLoading(true);
        const { error } = await (supabase.from(activeConfig.bangDuLieu) as any).delete().eq('id', initialData.id);
        setLoading(false);
        if (!error) { onSuccess(); onClose(); } else alert(error.message);
    };

    // Tab items
    const tabList: TabItem[] = [
        { id: 'form', label: 'Hồ Sơ', icon: User }, 
        // Bỏ tab lương nếu muốn, hoặc giữ lại nếu tương lai khách hàng có ví tiền
        { id: 'nhat_ky_hoat_dong', label: 'NHẬT KÝ', icon: History }, 
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
                        { id: 'd', ten: (formData?.ten_hien_thi || formData?.ho_ten || 'CHI TIẾT').toUpperCase() }
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
                            
                            {activeTab === 'nhat_ky_hoat_dong' ? (
                                <Tab_NhatKyHoatDong nhanSuId={initialData?.id} loginHistory={formData?.lich_su_dang_nhap} />
                            ) : (
                                <TabContent activeTab={activeTab} virtualData={virtualData} /> 
                            )}
                        </div>
                    </div>
                </NoidungModal>
                
                <NutChucNangLevel3 isCreateMode={isCreateMode} isEditing={isEditing} isArranging={isArranging} loading={loading} canEditRecord={canEditRecord} canDeleteRecord={['admin'].includes(userRole)} isAdmin={userRole === 'admin'} hasError={!!error} onSave={handleSave} onEdit={() => setIsEditing(true)} onCancel={() => setIsEditing(false)} onDelete={handleDelete} onClose={onClose} onFixDB={() => {}} onToggleArrange={() => setIsArranging(!isArranging)} onSaveLayout={() => {}} />
            </div>
        </Level3Provider>
    );
}