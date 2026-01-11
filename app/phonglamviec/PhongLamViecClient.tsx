'use client'
import { useState, useEffect, useMemo } from 'react'
import { Users, Package, ChevronDown, Check, Cpu, Layout, Box } from 'lucide-react'
import GenericManager from '@/app/phonglamviec/cacchucnang/GenericChucNang/GenericManager'
import TaoChucNang from '@/app/phonglamviec/TaoChucNang/page'
import { useUser } from '@/lib/UserContext'
import { fetchGenericData } from './generic-fetch'
import { FieldConfig } from '@/app/types/core'
import { GenericDisplayConfig } from '@/app/phonglamviec/cacchucnang/GenericChucNang/GenericList'

// [AUTO-GEN-IMPORT-START: nhansu3]
import { NHANSU3_FIELDS, NHANSU3_DISPLAY_CONFIG, NHANSU3_TABS } from '@/app/phonglamviec/cacchucnang/nhansu3/config'
// [AUTO-GEN-IMPORT-END: nhansu3]

import { NHAN_SU_FIELDS, NHAN_SU_DISPLAY_CONFIG } from '@/app/phonglamviec/cacchucnang/nhansu/config'

interface FunctionItem {
    id: string;
    label: string;
    icon: any;
    type: 'static' | 'dynamic' | 'custom';
    tableName?: string;
    fields?: FieldConfig[];
    displayConfig?: GenericDisplayConfig;
    getAdditionalTabs?: (item: any) => any[];
}

interface PhongLamViecClientProps {
    nhanSuData: any[]
    dynamicFeatures: any[]
}

export default function PhongLamViecClient({ nhanSuData, dynamicFeatures }: PhongLamViecClientProps) {
    const { user } = useUser();
    const [activeFuncId, setActiveFuncId] = useState<string>('nhan-su')
    const [showMenu, setShowMenu] = useState(false)
    const [dynamicData, setDynamicData] = useState<any[]>([])
    const [loadingData, setLoadingData] = useState(false)

    // --- CẤU HÌNH DANH SÁCH CHỨC NĂNG ---
    const allFunctions = useMemo<FunctionItem[]>(() => {
        // 1. Danh sách các chức năng ĐÃ ĐƯỢC IMPORT CỨNG (Static + Auto-Gen)
        const hardcodedFeatures: FunctionItem[] = [
            // [AUTO-GEN-BLOCK-START: nhansu3]
            {
                id: 'nhansu3',
                label: 'Nhân Sự 3',
                icon: Package,
                type: 'dynamic',
                tableName: 'nhan_su',
                fields: NHANSU3_FIELDS,
                displayConfig: NHANSU3_DISPLAY_CONFIG,
                getAdditionalTabs: (item) => NHANSU3_TABS(item)
            },
            // [AUTO-GEN-BLOCK-END: nhansu3]
            
            // Chức năng gốc
            {
                id: 'nhan-su',
                label: 'Quản Lý Nhân Sự',
                icon: Users,
                type: 'static',
                fields: NHAN_SU_FIELDS,
                displayConfig: NHAN_SU_DISPLAY_CONFIG
            },
            // Tool Admin
            {
                id: 'tao-chuc-nang',
                label: 'System Generator',
                icon: Cpu,
                type: 'custom',
            }
        ];

        // 2. Tạo Set chứa các ID đã tồn tại để lọc trùng
        const existingIds = new Set(hardcodedFeatures.map(f => f.id));

        // 3. Map danh sách động (Chỉ lấy những cái CHƯA có trong code cứng)
        // Đây là Fallback: Nếu generator chưa kịp inject code, nó sẽ hiện bản basic từ meta.json
        const scannedFeatures: FunctionItem[] = dynamicFeatures
            .filter(f => !existingIds.has(f.id)) // <--- [FIX QUAN TRỌNG NHẤT Ở ĐÂY]
            .map(f => ({
                id: f.id,
                label: f.featureLabel,
                icon: Box,
                type: 'dynamic' as const, 
                tableName: f.tableName,
                fields: f.columns.map((c: any) => ({
                    key: c.key,
                    label: c.label,
                    type: c.inputType,
                    showInList: c.showInList,
                    showInForm: c.showInForm,
                    required: c.required,
                    placeholder: c.placeholder
                })),
                displayConfig: {
                    colTitle: f.columns.find((c: any) => c.showInList && c.key !== 'id')?.key || 'id',
                    colSubTitle: f.columns.find((c: any) => c.showInList && c.key !== 'id' && c.key !== (f.columns.find((cc: any) => cc.showInList)?.key))?.key || '',
                    colImage: f.columns.find((c: any) => c.inputType === 'image')?.key,
                    tabFilterKey: f.tabFilterColumn
                }
            }));

        return [...hardcodedFeatures, ...scannedFeatures];
    }, [dynamicFeatures]);

    // ... (Phần còn lại của file giữ nguyên không đổi) ...
    // Lọc chức năng theo quyền hạn
    const visibleFunctions = useMemo(() => allFunctions.filter(f => {
        if (f.id === 'tao-chuc-nang' && user?.phan_loai !== 'admin') return false;
        return true;
    }), [allFunctions, user?.phan_loai]);

    const activeFunc = useMemo(() =>
        allFunctions.find(f => f.id === activeFuncId) || allFunctions[0],
        [allFunctions, activeFuncId]);

    useEffect(() => {
        const shouldFetch = activeFunc.tableName && activeFunc.id !== 'nhan-su';
        if (shouldFetch) {
            setLoadingData(true);
            setDynamicData([]); 
            fetchGenericData<any>(activeFunc.tableName!)
                .then((data) => {
                    if (Array.isArray(data)) setDynamicData(data);
                    else setDynamicData([]);
                })
                .catch(err => {
                    console.error(`Lỗi fetch data bảng ${activeFunc.tableName}:`, err);
                    setDynamicData([]);
                })
                .finally(() => setLoadingData(false));
        } else {
            setDynamicData([]);
        }
    }, [activeFunc]);

    const currentData = activeFunc.id === 'nhan-su' ? nhanSuData : dynamicData;
    const isLoading = loadingData && activeFunc.id !== 'nhan-su' && activeFunc.id !== 'tao-chuc-nang';

    return (
        <div className="flex flex-col h-full w-full bg-[#050505] text-white overflow-hidden relative selection:bg-[#C69C6D] selection:text-black">
            <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-[#C69C6D]/5 to-transparent pointer-events-none z-0" />
            <div className="shrink-0 h-[60px] flex items-center justify-between px-6 z-40 border-b border-white/5 bg-transparent relative">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-black text-white uppercase tracking-[0em] leading-none">
                            <span className="text-[#C69C6D]">PHÒNG LÀM VIỆC</span>
                        </h1>
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center gap-3 px-5 py-2 rounded-sm transition-all group relative overflow-hidden border border-white/10 hover:border-[#C69C6D]/50 bg-black/20 backdrop-blur-md"
                    >
                        <div className="absolute inset-0 bg-[#C69C6D]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        {activeFunc.icon && <activeFunc.icon size={16} className="text-[#C69C6D] relative z-10" />}
                        <span className="text-xs font-bold text-gray-200 group-hover:text-white uppercase tracking-widest relative z-10">
                            {activeFunc.label}
                        </span>
                        <ChevronDown size={14} className={`text-gray-500 group-hover:text-[#C69C6D] transition-transform duration-300 relative z-10 ${showMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div className="absolute top-full right-0 mt-2 w-72 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right max-h-[80vh] overflow-y-auto custom-scrollbar">
                                <div className="px-4 py-3 border-b border-white/5">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Chọn Chức Năng</p>
                                </div>
                                <div className="p-2 space-y-1">
                                    {visibleFunctions.map(func => {
                                        const isActive = activeFuncId === func.id
                                        return (
                                            <button
                                                key={func.id}
                                                onClick={() => { setActiveFuncId(func.id); setShowMenu(false); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all text-xs font-bold uppercase tracking-wide group ${isActive ? 'bg-[#C69C6D] text-black shadow-[0_0_15px_rgba(198,156,109,0.4)]' : 'text-gray-400 hover:bg-white/5 hover:text-white hover:pl-5'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {func.icon && <func.icon size={16} className={isActive ? "text-black" : "text-gray-600 group-hover:text-[#C69C6D]"} />}
                                                    {func.label}
                                                </div>
                                                {isActive && <Check size={14} strokeWidth={4} />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="flex-1 relative overflow-hidden bg-transparent z-10">
                {activeFunc.type === 'custom' && activeFunc.id === 'tao-chuc-nang' && (
                    <div className="w-full h-full pt-[0px]">
                        <TaoChucNang />
                    </div>
                )}
                {(activeFunc.type === 'static' || activeFunc.type === 'dynamic') && activeFunc.fields && (
                    isLoading ? (
                        <div className="flex items-center justify-center h-full text-[#C69C6D] gap-2 font-bold uppercase tracking-widest text-xs">
                            <div className="w-4 h-4 border-2 border-[#C69C6D] border-t-transparent rounded-full animate-spin" /> Loading Data...
                        </div>
                    ) : (
                        <GenericManager
                            key={activeFunc.id}
                            tableName={activeFunc.tableName || activeFunc.id.replace(/-/g, '_')}
                            basePath="/phonglamviec"
                            title={activeFunc.label}
                            fields={activeFunc.fields}
                            initialData={currentData}
                            displayConfig={activeFunc.displayConfig}
                            getAdditionalTabs={activeFunc.type === 'dynamic' && 'getAdditionalTabs' in activeFunc ? (activeFunc as any).getAdditionalTabs : undefined}
                            onClose={() => { }}
                        />
                    )
                )}
            </div>
        </div>
    )
}