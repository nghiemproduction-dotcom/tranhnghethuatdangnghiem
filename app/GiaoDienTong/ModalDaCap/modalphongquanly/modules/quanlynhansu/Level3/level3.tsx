'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Loader2, AlertCircle, UserPlus, Split } from 'lucide-react';
import { ModuleConfig, CotHienThi } from '../../../../../DashboardBuilder/KieuDuLieuModule';

// 🟢 1. IMPORT GIAO DIỆN MỚI
import ThanhDieuHuong from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuHuong';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';

// 🟢 2. IMPORT FILE NÚT CHỨC NĂNG VỪA TẠO
import NutChucNangLevel3 from './NutChucNang';

// Components con
import AvatarSection from './AvatarSection';
import TabContent from './TabContent';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    config: ModuleConfig;
    initialData?: any; 
    userRole: string; 
    userEmail?: string;
}

const toVietnameseTitleCase = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

export default function Level3_FormChiTiet({ isOpen, onClose, onSuccess, config, initialData, userRole, userEmail }: Props) {
    // STATE FORM
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [error, setError] = useState('');
    
    // STATE UI
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('form'); 
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
    const [virtualData, setVirtualData] = useState<Record<string, any[]>>({});

    // LOGIC MODE & QUYỀN
    const isCreateMode = !initialData;
    const isOwner = initialData?.email === userEmail;
    const canEditRecord = isCreateMode || ['admin', 'quanly'].includes(userRole) || isOwner;
    const isAdmin = ['admin', 'boss'].includes(userRole);
    const loadedIdRef = useRef<string | null>(null);

    const canEditColumn = (col: CotHienThi) => {
        if (isCreateMode) return !col.tuDong && !col.readOnly;
        const allowed = col.permEdit || ['admin', 'quanly'];
        if (allowed.includes('all')) return true;
        if (allowed.includes(userRole)) return true;
        if (allowed.includes('owner') && isOwner) return true;
        return false;
    };

    // --- INIT ---
    useEffect(() => {
        if (isOpen) {
            const currentId = initialData?.id || 'new';
            if (loadedIdRef.current !== currentId) {
                setFormData(initialData ? JSON.parse(JSON.stringify(initialData)) : {});
                setError('');
                setIsEditing(isCreateMode);
                loadedIdRef.current = currentId;

                // Load dữ liệu phụ
                config.danhSachCot.forEach(col => {
                    if (col.kieuDuLieu === 'select_dynamic') loadDynamicOptions(col);
                });
                if (!isCreateMode && initialData?.id && config.virtualColumns) {
                    config.virtualColumns.forEach(v => fetchVirtualData(v));
                }
            }
        } else {
            loadedIdRef.current = null;
        }
    }, [isOpen, initialData, config, isCreateMode]);

    // --- LOGIC XỬ LÝ DỮ LIỆU ---
    const loadDynamicOptions = async (col: CotHienThi) => { /* ...Giữ nguyên logic cũ... */ };
    const fetchVirtualData = async (vCol: any) => { /* ...Giữ nguyên logic cũ... */ };
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { /* ...Giữ nguyên logic cũ... */ };

    // --- HÀM LƯU DỮ LIỆU (SAVE) ---
    const handleSave = async () => {
        setLoading(true); setError('');
        try {
            const cleanPayload: any = {};
            for (const col of config.danhSachCot) {
                if (!canEditColumn(col) && !isCreateMode) continue;
                if (col.tuDong && !col.computedCode) continue;

                let val = formData[col.key];
                if (col.batBuoc && (val === undefined || val === null || val === '')) throw new Error(`"${col.label}" là bắt buộc.`);
                
                if (col.formatType === 'capitalize' && val) val = toVietnameseTitleCase(String(val));
                if (['number', 'currency', 'percent', 'int4', 'numeric'].includes(col.kieuDuLieu)) {
                    val = val === '' || val === null ? null : Number(String(val).replace(/,/g, ''));
                }
                cleanPayload[col.key] = val;
            }

            if (!isCreateMode) {
                delete cleanPayload.id; 
                const { error: err } = await (supabase.from(config.bangDuLieu) as any).update(cleanPayload).eq('id', initialData.id);
                if (err) throw err;
            } else {
                const { error: err } = await (supabase.from(config.bangDuLieu) as any).insert(cleanPayload);
                if (err) throw err;
            }
            onSuccess(); onClose();
        } catch (err: any) { 
            console.error(err);
            setError(err.message); 
        } 
        finally { setLoading(false); }
    };

    // --- HÀM XÓA ---
    const handleDelete = async () => {
        if (!confirm('Xóa vĩnh viễn hồ sơ này?')) return;
        setLoading(true);
        const { error } = await (supabase.from(config.bangDuLieu) as any).delete().eq('id', initialData.id);
        setLoading(false);
        if (!error) { onSuccess(); onClose(); } else alert(error.message);
    };

    // --- 🟢 HÀM AUTO FIX SQL (Logic tách từ component cũ) ---
    const handleAutoFix = () => {
        let sql = `-- SQL FIX CHO BẢNG: ${config.bangDuLieu}\n`;
        sql += `CREATE TABLE IF NOT EXISTS ${config.bangDuLieu} (\n  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,\n  created_at timestamptz DEFAULT now()\n);\n\n`;
        config.danhSachCot.forEach(col => {
            if (['id', 'created_at'].includes(col.key)) return;
            let type = 'text';
            if (['number', 'int4'].includes(col.kieuDuLieu)) type = 'integer';
            if (['int8'].includes(col.kieuDuLieu)) type = 'bigint';
            if (['numeric', 'currency', 'percent'].includes(col.kieuDuLieu)) type = 'numeric';
            if (col.kieuDuLieu === 'boolean') type = 'boolean';
            if (col.kieuDuLieu === 'date') type = 'date';
            if (col.kieuDuLieu === 'timestamptz' || col.kieuDuLieu === 'datetime') type = 'timestamptz';
            if (['link_array', 'text[]'].includes(col.kieuDuLieu)) type = 'text[]';
            sql += `ALTER TABLE ${config.bangDuLieu} ADD COLUMN IF NOT EXISTS ${col.key} ${type};\n`;
        });
        sql += `\nNOTIFY pgrst, 'reload schema';`;

        navigator.clipboard.writeText(sql);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || '_';
        const url = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
        
        if(confirm("Đã copy lệnh sửa lỗi! Bấm OK để mở trang Supabase SQL Editor và chạy lệnh.")) {
            window.open(url, '_blank');
        }
    };

    const imgCol = config.danhSachCot.find(c => ['hinh_anh', 'avatar', 'image'].includes(c.key) || c.kieuDuLieu === 'image');
    
    // Tên tiêu đề động
    const pageTitle = isCreateMode ? 'THÊM MỚI HỒ SƠ' : (initialData?.ho_ten || initialData?.ten || 'CHI TIẾT HỒ SƠ').toUpperCase();

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bottom-[clamp(65px,16vw,85px)] z-[2300] bg-[#0a0807] flex flex-col animate-in slide-in-from-right-20 duration-300 shadow-2xl">
            
            {/* 🟢 HEADER MỚI: Chỉ dùng ThanhDieuHuong */}
            <div className="shrink-0 z-50 bg-[#0a0807]/95 backdrop-blur-xl border-b border-[#8B5E3C]/30 shadow-lg">
                <ThanhDieuHuong 
                    danhSachCap={[
                        { id: 'close', ten: 'Quay Lại', onClick: onClose }, 
                        { id: 'module', ten: config.tenModule, onClick: onClose },
                        { id: 'detail', ten: pageTitle } // Tiêu đề chính
                    ]} 
                />
            </div>

            <NoidungModal>
                <div className="flex flex-col min-h-full pb-24 relative"> {/* Thêm padding bottom để không bị nút che */}
                    
                    {/* Tabs */}
                    <div className="flex bg-[#161210] border-b border-[#8B5E3C]/20 px-6 gap-6 sticky top-0 z-40 overflow-x-auto no-scrollbar">
                        <button onClick={() => setActiveTab('form')} className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === 'form' ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-gray-500 border-transparent hover:text-white'}`}>Thông Tin Chính</button>
                        
                        {/* Tab Người giới thiệu ví dụ */}
                        <button onClick={() => setActiveTab('nguoi_gioi_thieu')} className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'nguoi_gioi_thieu' ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-gray-500 border-transparent hover:text-white'}`}>
                            <UserPlus size={14}/> Người Giới Thiệu
                        </button>

                        {!isCreateMode && config.virtualColumns && config.virtualColumns.map(v => (
                            <button key={v.key} onClick={() => setActiveTab(v.key)} className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === v.key ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-gray-500 border-transparent hover:text-white'}`}>
                                <Split size={12}/> {v.label} <span className="bg-[#1a120f] px-1.5 rounded text-[9px] border border-[#8B5E3C]/20 text-[#8B5E3C]">{virtualData[v.key]?.length || 0}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
                        {/* Thông báo lỗi */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-950/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 text-xs animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={20} className="shrink-0"/> 
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Avatar */}
                        {imgCol && activeTab === 'form' && (
                            <div className="flex justify-center mb-10 pb-8 border-b border-[#8B5E3C]/10">
                                <AvatarSection 
                                    imgUrl={formData[imgCol.key]} 
                                    onUpload={handleImageUpload} 
                                    uploading={uploadingImg} 
                                    canEdit={isEditing && canEditColumn(imgCol)}
                                    label={imgCol.label}
                                />
                            </div>
                        )}

                        {/* Loading Overlay khi lưu */}
                        {loading && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center rounded-xl">
                                <Loader2 className="animate-spin text-[#C69C6D]" size={40}/>
                                <p className="text-[#C69C6D] text-xs font-bold mt-2 animate-pulse">ĐANG XỬ LÝ...</p>
                            </div>
                        )}

                        {/* Form Fields */}
                        <TabContent 
                            activeTab={activeTab} 
                            config={config} 
                            formData={formData} 
                            setFormData={setFormData} 
                            virtualData={virtualData} 
                            isEditing={isEditing} 
                            canEditColumn={canEditColumn} 
                            dynamicOptions={dynamicOptions} 
                            onAddNewOption={(k) => {
                                const newVal = prompt("Thêm mới:");
                                if(newVal) {
                                    setDynamicOptions(p => ({...p, [k]: [...(p[k]||[]), newVal]}));
                                    setFormData({...formData, [k]: newVal});
                                }
                            }}
                        />
                    </div>
                </div>
            </NoidungModal>

            {/* 🟢 FOOTER MỚI: NÚT NỔI (NutChucNangLevel3) */}
            <NutChucNangLevel3 
                isCreateMode={isCreateMode}
                isEditing={isEditing}
                loading={loading}
                canEditRecord={canEditRecord}
                isAdmin={isAdmin}
                hasError={!!error}
                onSave={handleSave}
                onEdit={() => setIsEditing(true)}
                onCancel={() => { setIsEditing(false); setError(''); }}
                onDelete={handleDelete}
                onClose={onClose}
                onFixDB={handleAutoFix}
            />

        </div>
    );
}