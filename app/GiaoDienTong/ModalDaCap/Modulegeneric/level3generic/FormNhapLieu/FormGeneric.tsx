'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { 
    Camera, X, ChevronDown, UploadCloud, PlusCircle, Database, 
    Loader2, Pencil, RotateCcw, User, Lock, Save,
    ToggleLeft, ToggleRight, Link as LinkIcon, Type, Hash, Calendar, AlertTriangle 
} from 'lucide-react';
import { useQuery, useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { ModuleConfig, CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { CAU_HINH_LUU_Y } from './LuuY';

// 🟢 DYNAMIC IMPORT: Cắt đứt vòng lặp import (Form -> Level3 -> Form)
import dynamic from 'next/dynamic';
const Level3_FormChiTiet = dynamic(() => import('@/app/GiaoDienTong/ModalDaCap/Modulegeneric/GenericModule'), {
    loading: () => <div className="p-4 text-center text-gray-500 animate-pulse">Đang tải form con...</div>,
    ssr: false // Tắt SSR cho modal con
});

interface Props {
    config: ModuleConfig;
    initialData: any;      
    onSuccess: () => void; 
    onCancel: () => void;  
    isCreateMode: boolean; 
}

// 🟢 FIX 2: TĂNG GIỚI HẠN DROPDOWN
const fetchOptions = async (colKey: string, tableName: string, isDistinctMode: boolean) => {
    try {
        if (isDistinctMode) {
            const { data, error } = await supabase.from(tableName).select(colKey);
            if (error || !data) return [];
            const uniqueValues = Array.from(new Set(data.map((i: any) => i[colKey]).filter(Boolean)));
            return uniqueValues.map(val => ({ value: val, label: val }));
        } else {
            // Tăng limit lên 1000 items
            const { data, error } = await supabase.from(tableName).select('*').limit(1000);
            if (error || !data) return [];
            
            if (data.length > 0) {
                const firstRow = data[0];
                const keys = Object.keys(firstRow);
                // Thuật toán đoán tên hiển thị thông minh hơn
                let labelKey = keys.find(k => ['ten', 'name', 'ho_ten', 'tieu_de', 'title', 'label'].some(s => k.toLowerCase().includes(s)));
                if (!labelKey) labelKey = keys.find(k => typeof firstRow[k] === 'string' && k !== 'id' && !k.endsWith('_id') && !k.includes('anh') && !k.includes('url'));
                
                return data.map((item: any) => ({ 
                    value: item.id, 
                    label: item[labelKey || 'id'] || `ID: ${item.id}` 
                }));
            }
            return [];
        }
    } catch (e) {
        console.error(`Lỗi fetchOptions [${tableName}]:`, e);
        return [];
    }
};

export default function FormGeneric({ config, initialData, onSuccess, onCancel, isCreateMode }: Props) {
    const queryClient = useQueryClient();
    
    // State
    const [formData, setFormData] = useState<any>(initialData || {});
    const [uploading, setUploading] = useState<string | null>(null);
    const [nestedModalConfig, setNestedModalConfig] = useState<ModuleConfig | null>(null);
    const [targetFieldKey, setTargetFieldKey] = useState<string | null>(null);
    const [manualInputFields, setManualInputFields] = useState<Record<string, boolean>>({});

    // Reset form khi đổi item
    useEffect(() => { setFormData(initialData || {}); }, [initialData]);

    // 🟢 1. LẤY TÊN NGƯỜI TẠO (Hiển thị đẹp hơn ID)
    const { data: creatorName } = useQuery({
        queryKey: ['creator', formData.nguoi_tao, isCreateMode],
        queryFn: async () => {
            if (isCreateMode) {
                const storedUser = typeof window !== 'undefined' ? localStorage.getItem('USER_INFO') : null;
                return storedUser ? JSON.parse(storedUser).ho_ten || 'Bạn (Hiện tại)' : 'Bạn';
            }
            if (!formData.nguoi_tao) return 'Hệ thống';
            try {
                // Thử lấy tên từ bảng nhan_su, nếu lỗi thì trả về ID gốc
                const { data } = await supabase.from('nhan_su').select('ho_ten').eq('id', formData.nguoi_tao).single();
                return data?.ho_ten || formData.nguoi_tao;
            } catch { return formData.nguoi_tao; }
        },
        staleTime: 1000 * 60 * 30, // Cache 30 phút
    });

    // 🟢 2. LOAD OPTIONS ĐỘNG
    const colsNeedingOptions = (config.danhSachCot || []).filter(col => {
        if (col.readOnly || col.key === 'nguoi_tao') return false;
        const luuYConfig = CAU_HINH_LUU_Y[config.bangDuLieu]?.[col.key];
        const isRelation = ['select_dynamic', 'relation'].includes(col.kieuDuLieu) || col.key.endsWith('_id');
        const isSuggest = luuYConfig?.kieuNhap === 'goi_y_tu_du_lieu_cu';
        return isRelation || isSuggest;
    });

    const optionQueries = useQueries({
        queries: colsNeedingOptions.map(col => {
            const luuYConfig = CAU_HINH_LUU_Y[config.bangDuLieu]?.[col.key];
            const isSuggest = luuYConfig?.kieuNhap === 'goi_y_tu_du_lieu_cu';
            let tableName = config.bangDuLieu;
            let isDistinct = false;

            if (isSuggest) {
                isDistinct = true;
            } else {
                // Xác định bảng liên kết: Ưu tiên config -> Suy luận từ tên cột (vd: chuc_vu_id -> chuc_vu)
                tableName = col.refTable || (col.key.endsWith('_id') ? col.key.replace('_id', '') : '');
            }

            return {
                queryKey: ['options', tableName, col.key, isDistinct],
                queryFn: () => fetchOptions(col.key, tableName, isDistinct),
                staleTime: 1000 * 60 * 5, 
                enabled: !!tableName 
            };
        })
    });

    // Map kết quả query vào object để dễ dùng
    const dynamicOptions: Record<string, any[]> = {};
    colsNeedingOptions.forEach((col, index) => {
        if (optionQueries[index].data) {
            dynamicOptions[col.key] = optionQueries[index].data;
        }
    });

    // 🟢 3. MUTATION: LƯU DỮ LIỆU
    const saveMutation = useMutation({
        mutationFn: async (newData: any) => {
            const payload = { ...newData };
            const luuYConfig = CAU_HINH_LUU_Y[config.bangDuLieu];

            // A. Lọc bỏ trường 'khongLuu' (ví dụ: lương tính toán, cột ảo)
            if (luuYConfig) {
                Object.keys(luuYConfig).forEach(fieldKey => {
                    if (luuYConfig[fieldKey].khongLuu) delete payload[fieldKey];
                });
            }

            // B. Xử lý Audit (nguoi_tao, tao_luc)
            if (isCreateMode) {
                const storedUser = localStorage.getItem('USER_INFO');
                if (storedUser) payload.nguoi_tao = JSON.parse(storedUser).id;
                delete payload.id;      // Để DB tự sinh ID
                delete payload.tao_luc; // Để DB tự sinh time
            } else {
                delete payload.nguoi_tao; // Không cho sửa người tạo
                delete payload.tao_luc;   
            }

            const { error } = isCreateMode 
                ? await supabase.from(config.bangDuLieu).insert(payload) 
                : await supabase.from(config.bangDuLieu).update(payload).eq('id', initialData?.id);
            
            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            // 🟢 INVALIDATE THÔNG MINH: Refresh danh sách liên quan
            queryClient.invalidateQueries({ 
                predicate: (query) => 
                    query.queryKey[0] === 'list' && 
                    (String(query.queryKey[1]) === config.bangDuLieu || String(query.queryKey[1]).includes(config.bangDuLieu))
            });

            // Refresh options (nếu vừa thêm mới danh mục)
            queryClient.invalidateQueries({ queryKey: ['options', config.bangDuLieu] });

            // Refresh chi tiết
            if (!isCreateMode) {
                queryClient.invalidateQueries({ queryKey: ['detail', config.bangDuLieu, initialData?.id] });
            }
            
            alert("✅ Lưu thành công!");
            onSuccess();
        },
        onError: (error: any) => {
            alert("❌ Lỗi lưu dữ liệu: " + error.message);
        }
    });

    // --- CÁC HÀM UI ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
        if (!e.target.files || !e.target.files.length) return;
        setUploading(fieldKey);
        try {
            const file = e.target.files[0];
            // Tạo tên file unique để tránh trùng
            const fileName = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
            
            // Upload vào bucket 'hinh-nen' (Bạn cần tạo bucket này trên Supabase Storage)
            const { error } = await supabase.storage.from('hinh-nen').upload(fileName, file);
            if (error) throw error;
            
            const { data } = supabase.storage.from('hinh-nen').getPublicUrl(fileName);
            setFormData({ ...formData, [fieldKey]: data.publicUrl });
        } catch (error: any) { 
            alert('Lỗi upload ảnh: ' + error.message + '\n(Hãy đảm bảo bạn đã tạo bucket "hinh-nen" trong Supabase Storage)'); 
        } 
        finally { setUploading(null); }
    };

    const handleOpenNestedCreate = (col: CotHienThi) => {
        let tableName = col.refTable || (col.key.endsWith('_id') ? col.key.replace('_id', '') : '');
        if (!tableName) return;
        setTargetFieldKey(col.key);
        // Cấu hình giả lập cho modal con
        setNestedModalConfig({
            id: `nested_${Date.now()}`, tenModule: 'Tạo Mới Nhanh', bangDuLieu: tableName, danhSachCot: [], version: '1.0', updatedAt: ''
        });
    };

    // RENDER INPUT FIELD
    const renderInput = (col: CotHienThi) => {
        const val = formData[col.key] === null || formData[col.key] === undefined ? '' : formData[col.key];
        const luuYConfig = CAU_HINH_LUU_Y[config.bangDuLieu]?.[col.key];
        
        const isSystemCol = ['id', 'tao_luc', 'nguoi_tao'].includes(col.key);
        const isConfigReadOnly = luuYConfig?.readOnly === true;

        // 1. READONLY FIELD
        if (col.readOnly || col.tuDong || isSystemCol || isConfigReadOnly) {
            let displayVal = val;
            let icon = <Lock size={14} className="text-gray-500" />;
            if (col.key === 'nguoi_tao') { displayVal = creatorName || '...'; icon = <User size={14} className="text-[#C69C6D]" />; }
            else if (col.key === 'id') displayVal = val || '(Auto ID)';
            else if (col.key === 'tao_luc') displayVal = val ? new Date(val).toLocaleString('vi-VN') : '(Auto Time)';

            return (
                <div className="relative opacity-80">
                    <input type="text" value={displayVal} disabled className="w-full bg-[#1a120f] border border-[#8B5E3C]/20 rounded-lg pl-3 pr-8 py-2.5 text-gray-400 text-sm font-mono cursor-not-allowed italic"/>
                    <div className="absolute right-3 top-3 pointer-events-none">{icon}</div>
                </div>
            );
        }

        // 2. COMBOBOX NHẬP LIỆU (GOI_Y_TU_DU_LIEU_CU)
        if (luuYConfig?.kieuNhap === 'goi_y_tu_du_lieu_cu') {
            const isManual = manualInputFields[col.key];
            const options = dynamicOptions[col.key] || [];
            
            if (!isManual && options.length > 0) {
                return (
                    <div className="flex gap-2">
                        <div className="relative group flex-1">
                            <select value={val} onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })} className="w-full bg-black/40 border border-[#8B5E3C]/40 rounded-lg pl-3 pr-8 py-2.5 text-[#E8D4B9] text-sm focus:border-[#C69C6D] outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors">
                                <option value="">-- Chọn {col.label} --</option>
                                {options.map((opt: any, idx: number) => <option key={idx} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-[#8B5E3C] pointer-events-none" size={16} />
                        </div>
                        <button type="button" title="Nhập tay giá trị mới" onClick={() => { setManualInputFields(prev => ({...prev, [col.key]: true})); setFormData({ ...formData, [col.key]: '' }); }} className="bg-[#C69C6D]/20 hover:bg-[#C69C6D] text-[#C69C6D] hover:text-black border border-[#C69C6D] w-[42px] flex items-center justify-center rounded-lg transition-all"><Pencil size={18} /></button>
                    </div>
                );
            } else {
                return (
                    <div className="flex gap-2">
                        <input type="text" value={val} autoFocus={isManual} placeholder={`Nhập mới ${col.label}...`} onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })} className="flex-1 bg-black/40 border border-[#C69C6D] rounded-lg px-3 py-2.5 text-[#E8D4B9] text-sm focus:ring-1 focus:ring-[#C69C6D] outline-none animate-in fade-in" />
                        {options.length > 0 && <button type="button" title="Quay lại danh sách chọn" onClick={() => setManualInputFields(prev => ({...prev, [col.key]: false}))} className="bg-[#1a120f] hover:bg-white/10 text-gray-400 border border-white/20 w-[42px] flex items-center justify-center rounded-lg"><RotateCcw size={18} /></button>}
                    </div>
                );
            }
        }

        // 3. DROPDOWN LIÊN KẾT (RELATION)
        if (['select_dynamic', 'relation'].includes(col.kieuDuLieu) || col.key.endsWith('_id')) {
            const options = dynamicOptions[col.key] || [];
            return (
                <div className="flex gap-2">
                    <div className="relative group flex-1">
                        <select value={val} onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })} className="w-full bg-black/40 border border-[#8B5E3C]/40 rounded-lg pl-3 pr-8 py-2.5 text-[#E8D4B9] text-sm focus:border-[#C69C6D] outline-none appearance-none cursor-pointer">
                            <option value="">-- Chọn --</option>
                            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 text-[#8B5E3C] pointer-events-none" size={16} />
                    </div>
                    {/* Nút thêm nhanh record liên quan */}
                    <button type="button" onClick={() => handleOpenNestedCreate(col)} className="bg-[#C69C6D]/20 hover:bg-[#C69C6D] text-[#C69C6D] hover:text-black border border-[#C69C6D] w-[42px] flex items-center justify-center rounded-lg transition-all"><PlusCircle size={20} /></button>
                </div>
            );
        }

        // 4. TEXTAREA
        if (col.kieuDuLieu === 'textarea') return <textarea value={val} onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })} className="w-full bg-black/40 border border-[#8B5E3C]/40 rounded-lg p-3 text-[#E8D4B9] outline-none min-h-[100px] focus:border-[#C69C6D] transition-colors" placeholder="Nhập nội dung chi tiết..." />;
        
        // 5. BOOLEAN
        if (col.kieuDuLieu === 'boolean') return <button type="button" onClick={() => setFormData({ ...formData, [col.key]: !val })} className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all ${val ? 'bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D] shadow-[0_0_10px_rgba(198,156,109,0.2)]' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}>{val ? <ToggleRight size={24} /> : <ToggleLeft size={24} />} <span className="font-bold">{val ? 'Đang Bật' : 'Đang Tắt'}</span></button>;
        
        // 6. DATE/NUMBER/TEXT
        if (col.kieuDuLieu === 'date') return <div className="relative"><input type="date" value={val ? String(val).split('T')[0] : ''} onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })} className="w-full bg-black/40 border border-[#8B5E3C]/40 rounded-lg p-2.5 pl-10 text-[#E8D4B9] outline-none focus:border-[#C69C6D]" /><Calendar className="absolute left-3 top-3 text-gray-500 pointer-events-none" size={16}/></div>;
        if (['number', 'currency'].includes(col.kieuDuLieu)) return <div className="relative"><input type="number" value={val} onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })} className="w-full bg-black/40 border border-[#8B5E3C]/40 rounded-lg p-2.5 pl-10 text-[#E8D4B9] outline-none focus:border-[#C69C6D]" /><Hash className="absolute left-3 top-3 text-gray-500 pointer-events-none" size={16}/></div>;
        
        // Mặc định TEXT
        return <div className="relative"><input type="text" value={val} onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })} className="w-full bg-black/40 border border-[#8B5E3C]/40 rounded-lg p-2.5 pl-10 text-[#E8D4B9] outline-none focus:border-[#C69C6D]" /><Type className="absolute left-3 top-3 text-gray-500 pointer-events-none" size={16}/></div>;
    };

    // Phân loại cột để render layout đẹp
    const columns = config.danhSachCot || [];
    const imageColumns = columns.filter(col => col.kieuDuLieu === 'image' || col.key.includes('hinh_anh') || col.key.includes('avatar'));
    const otherColumns = columns.filter(col => !imageColumns.includes(col));

    return (
        <div className="space-y-6 pb-10">
            {/* Header Form */}
            <div className="flex items-center gap-2 bg-[#8B5E3C]/10 border border-[#8B5E3C]/30 p-2 rounded-lg mb-4 text-xs font-mono text-[#E8D4B9]">
                <Database size={14} className="text-[#C69C6D]" />
                <span>Target Table:</span><span className="font-bold text-[#C69C6D]">{config.bangDuLieu}</span>
            </div>

            {/* AREA ẢNH ĐẠI DIỆN */}
            {imageColumns.length > 0 && (
                <div className="flex justify-center gap-8 mb-8 border-b border-[#8B5E3C]/20 pb-8">
                    {imageColumns.map(col => {
                        const val = formData[col.key];
                        return (
                            <div key={col.key} className="flex flex-col items-center gap-3">
                                <div className="w-36 h-36 bg-[#1a120f] border-2 border-[#C69C6D] rounded-full overflow-hidden flex items-center justify-center relative group shadow-[0_0_20px_rgba(198,156,109,0.3)] transition-all hover:scale-105">
                                    {val ? <img src={val} className="w-full h-full object-cover" /> : <Camera className="text-[#8B5E3C] w-12 h-12 opacity-50"/>}
                                    
                                    {/* Upload Overlay */}
                                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                                        {uploading === col.key ? <Loader2 className="animate-spin text-white mb-1"/> : <UploadCloud className="text-white mb-1"/>}
                                        <span className="text-[10px] text-white uppercase font-bold">Thay đổi</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, col.key)} />
                                    </label>

                                    {val && <button onClick={() => setFormData({...formData, [col.key]: null})} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 rounded-full p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>}
                                </div>
                                <span className="text-[11px] uppercase font-bold text-[#8B5E3C] tracking-wider bg-[#8B5E3C]/10 px-3 py-1 rounded-full">{col.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* GRID INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {otherColumns.map((col) => {
                    const shouldShow = col.hienThiDetail || (!col.hienThiDetail && col.batBuoc);
                    if (!shouldShow && !['id','tao_luc','nguoi_tao'].includes(col.key)) return null;
                    const isFullWidth = ['textarea'].includes(col.kieuDuLieu) || col.key.includes('mo_ta') || col.key.includes('ghi_chu');
                    return (
                        <div key={col.key} className={`flex flex-col gap-2 ${isFullWidth ? 'md:col-span-2' : ''}`}>
                            <label className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#8B5E3C] tracking-wider ml-1">
                                {col.label || col.key} 
                                {col.batBuoc && <span className="text-red-500 text-lg ml-0.5" title="Bắt buộc">*</span>}
                            </label>
                            {renderInput(col)}
                        </div>
                    );
                })}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#8B5E3C]/20 mt-6 sticky bottom-0 bg-[#161210] pb-2 z-10">
                <button onClick={onCancel} className="px-6 py-2.5 border border-[#8B5E3C]/30 text-[#8B5E3C] hover:bg-white/5 rounded-lg text-sm font-bold uppercase transition-colors">Hủy Bỏ</button>
                <button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending} className="px-8 py-2.5 bg-[#C69C6D] text-black hover:bg-[#b08b5e] rounded-lg text-sm font-bold uppercase shadow-lg flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                    {saveMutation.isPending ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                    {saveMutation.isPending ? 'Đang Lưu...' : 'Lưu Hồ Sơ'}
                </button>
            </div>

            {/* MODAL LỒNG NHAU (RECURSIVE) */}
            {nestedModalConfig && (
                <Level3_FormChiTiet mode="level3"
                    isOpen={true}
                    onClose={() => setNestedModalConfig(null)}
                    onSuccess={() => {
                        // Refresh option của cột cha sau khi tạo xong item con
                        if(targetFieldKey) {
                            const tableName = config.danhSachCot.find(c => c.key === targetFieldKey)?.refTable || nestedModalConfig.bangDuLieu;
                            queryClient.invalidateQueries({ queryKey: ['options', tableName] });
                        }
                        setNestedModalConfig(null);
                    }}
                    config={nestedModalConfig}
                    initialData={null}
                    userRole="admin" 
                    parentTitle={`Tạo Nhanh: ${nestedModalConfig.bangDuLieu}`}
                />
            )}
        </div>
    );
}