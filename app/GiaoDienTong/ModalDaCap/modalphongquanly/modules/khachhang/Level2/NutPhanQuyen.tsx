'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Settings, X, Save, Check, ChevronDown, Eye, Edit, Trash2, Globe, User, Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { TacVuModal } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NutModal';

// --- 1. HOOK ---
interface HookProps {
    config: ModuleConfig;
    canConfig: boolean;
    onSave: (newConfig: ModuleConfig) => void;
}

export const useNutPhanQuyen = ({ config, canConfig, onSave }: HookProps) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!canConfig) return { button: null, modal: null };

    const button: TacVuModal = {
        id: 'config',
        icon: Settings,
        nhan: 'Phân Quyền',
        onClick: () => setIsOpen(true)
    };

    const modal = isOpen ? (
        <ModalPhanQuyen
            isOpen={true}
            onClose={() => setIsOpen(false)}
            config={config}
            onSave={onSave}
        />
    ) : null;

    return { button, modal };
};

// --- 2. CẤU TRÚC DỮ LIỆU ---
type PermissionType = 'view' | 'edit' | 'delete';
interface ColumnPermissions {
    [columnKey: string]: {
        [key in PermissionType]?: string[];
    };
}

// --- 3. COMPONENT POPUP CHỌN ROLE ---
interface PermissionPopupProps {
    title: string;
    allRoles: string[];
    selectedRoles: string[];
    onChange: (newRoles: string[]) => void;
    onClose: () => void;
}

const PermissionPopup = ({ title, allRoles, selectedRoles, onChange, onClose }: PermissionPopupProps) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const toggleRole = (role: string) => {
        // 🟢 FIX LỖI 7034: Khai báo rõ kiểu mảng string
        let newRoles: string[]; 

        if (role === 'Tất cả') {
            if (selectedRoles.includes('Tất cả')) newRoles = [];
            else newRoles = ['Tất cả'];
        } else {
            if (selectedRoles.includes(role)) {
                newRoles = selectedRoles.filter(r => r !== role);
            } else {
                newRoles = [...selectedRoles.filter(r => r !== 'Tất cả'), role];
            }
        }
        onChange(newRoles);
    };

    return (
        <div ref={popupRef} className="absolute top-full left-0 mt-2 w-64 bg-[#1a120f] border border-[#8B5E3C] rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-3 border-b border-[#8B5E3C]/30 bg-[#2a1e1a]">
                <h4 className="text-xs font-bold text-[#C69C6D] uppercase">{title}</h4>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto custom-scroll">
                {/* Option: Tất cả */}
                <div 
                    onClick={() => toggleRole('Tất cả')}
                    className="flex items-center gap-3 p-2 hover:bg-[#C69C6D]/10 rounded cursor-pointer group"
                >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedRoles.includes('Tất cả') ? 'bg-[#C69C6D] border-[#C69C6D]' : 'border-[#8B5E3C] group-hover:border-[#C69C6D]'}`}>
                        {selectedRoles.includes('Tất cả') && <Check size={10} className="text-black"/>}
                    </div>
                    <span className="text-sm text-[#F5E6D3] font-bold"><Globe size={12} className="inline mr-1"/> Tất cả</span>
                </div>

                {/* Option: Chính chủ */}
                <div 
                    onClick={() => toggleRole('Chính chủ')}
                    className="flex items-center gap-3 p-2 hover:bg-[#C69C6D]/10 rounded cursor-pointer group"
                >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedRoles.includes('Chính chủ') ? 'bg-[#C69C6D] border-[#C69C6D]' : 'border-[#8B5E3C] group-hover:border-[#C69C6D]'}`}>
                        {selectedRoles.includes('Chính chủ') && <Check size={10} className="text-black"/>}
                    </div>
                    <span className="text-sm text-[#F5E6D3] font-bold"><User size={12} className="inline mr-1"/> Chính chủ</span>
                </div>

                <div className="h-px bg-[#8B5E3C]/20 my-1"></div>

                {/* Dynamic Roles */}
                {allRoles.map(role => (
                    <div 
                        key={role}
                        onClick={() => toggleRole(role)}
                        className="flex items-center gap-3 p-2 hover:bg-[#C69C6D]/10 rounded cursor-pointer group"
                    >
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedRoles.includes(role) ? 'bg-[#C69C6D] border-[#C69C6D]' : 'border-[#8B5E3C] group-hover:border-[#C69C6D]'}`}>
                            {selectedRoles.includes(role) && <Check size={10} className="text-black"/>}
                        </div>
                        <span className="text-sm text-[#A1887F]">{role}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 4. COMPONENT CHÍNH ---
interface Props {
    isOpen: boolean;
    onClose: () => void;
    config: ModuleConfig;
    onSave: (newConfig: ModuleConfig) => void;
}

export default function ModalPhanQuyen({ isOpen, onClose, config, onSave }: Props) {
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    
    // State lưu cấu hình phân quyền
    const [permissions, setPermissions] = useState<ColumnPermissions>(
        (config as any).columnPermissions || {}
    );

    const [activePopup, setActivePopup] = useState<{ colKey: string, type: PermissionType } | null>(null);

    // 1. Fetch danh sách Role
    useEffect(() => {
        if (isOpen && config.bangDuLieu) {
            const fetchRoles = async () => {
                setLoading(true);
                try {
                    const { data } = await supabase
                        .from('nhan_su') 
                        .select('vi_tri')
                        .not('vi_tri', 'is', null);
                    
                    if (data) {
                        const uniqueRoles = Array.from(new Set(data.map((r: any) => r.vi_tri)));
                        setRoles(uniqueRoles.sort());
                    }
                } catch (error) {
                    console.error("Lỗi lấy roles:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchRoles();
        }
    }, [isOpen, config]);

    const updatePermission = (colKey: string, type: PermissionType, newRoles: string[]) => {
        setPermissions(prev => ({
            ...prev,
            [colKey]: {
                ...prev[colKey],
                [type]: newRoles
            }
        }));
    };

    const handleSave = () => {
        const newConfig = { ...config, columnPermissions: permissions } as any;
        onSave(newConfig);
        onClose();
    };

    const renderButton = (colKey: string, type: PermissionType, icon: any, label: string, colorClass: string) => {
        const currentRoles = permissions[colKey]?.[type] || [];
        const isActive = activePopup?.colKey === colKey && activePopup?.type === type;
        
        let displayInfo = "Chưa cấu hình";
        if (currentRoles.includes('Tất cả')) displayInfo = "Tất cả";
        else if (currentRoles.length > 0) displayInfo = `${currentRoles.length} vai trò`;

        return (
            <div className="relative">
                <button
                    onClick={() => setActivePopup(isActive ? null : { colKey, type })}
                    className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded border text-xs font-bold uppercase w-32 transition-all
                        ${currentRoles.length > 0 
                            ? `${colorClass} bg-opacity-10 border-opacity-50` 
                            : 'border-[#8B5E3C]/30 text-gray-500 hover:border-[#8B5E3C]'}
                    `}
                >
                    <span className="flex items-center gap-1.5 truncate">
                        {React.createElement(icon, { size: 12 })}
                        <span className="truncate">{displayInfo}</span>
                    </span>
                    <ChevronDown size={10} className={`transition-transform ${isActive ? 'rotate-180' : ''}`}/>
                </button>

                {isActive && (
                    <PermissionPopup
                        title={`Quyền ${label} - Cột ${colKey}`}
                        allRoles={roles}
                        selectedRoles={currentRoles}
                        onChange={(newRoles) => updatePermission(colKey, type, newRoles)}
                        onClose={() => setActivePopup(null)}
                    />
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    const columns = config.danhSachCot && config.danhSachCot.length > 0 
        ? config.danhSachCot 
        : [{ key: 'id', label: 'ID' }];

    return (
        <div className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-5xl bg-[#110d0c] border border-[#8B5E3C] rounded-2xl shadow-2xl flex flex-col h-[80vh]">
                
                {/* Header */}
                <div className="p-5 border-b border-[#8B5E3C]/30 flex justify-between items-center bg-[#1a120f] rounded-t-2xl shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#C69C6D]/10 rounded-lg"><Settings className="text-[#C69C6D]" size={24} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-[#F5E6D3] uppercase">Phân Quyền Cột (Field Security)</h2>
                            <p className="text-[10px] text-[#8B5E3C]">Module: {config.tenModule} | Bảng: {config.bangDuLieu}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>

                {/* Body - Table */}
                <div className="flex-1 overflow-auto custom-scroll p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-[#C69C6D]"><Loader2 className="animate-spin mr-2"/> Đang tải roles...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-[#1a120f] z-10 text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
                                <tr>
                                    <th className="p-3 border-b border-[#8B5E3C]/30 w-1/4">Tên Cột (Field)</th>
                                    <th className="p-3 border-b border-[#8B5E3C]/30 text-center">Quyền Xem (View)</th>
                                    <th className="p-3 border-b border-[#8B5E3C]/30 text-center">Quyền Sửa (Edit)</th>
                                    <th className="p-3 border-b border-[#8B5E3C]/30 text-center">Quyền Xóa (Clear)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#8B5E3C]/10 text-sm text-[#F5E6D3]">
                                {columns.map((col) => (
                                    <tr key={col.key} className="hover:bg-[#C69C6D]/5 transition-colors">
                                        <td className="p-3 font-mono text-[#C69C6D]">
                                            <div className="font-bold">{col.label || col.key}</div>
                                            <div className="text-[10px] text-[#5D4037]">{col.key}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center">
                                                {renderButton(col.key, 'view', Eye, 'Xem', 'text-blue-400 border-blue-400 bg-blue-400')}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center">
                                                {renderButton(col.key, 'edit', Edit, 'Sửa', 'text-green-400 border-green-400 bg-green-400')}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center">
                                                {renderButton(col.key, 'delete', Trash2, 'Xóa', 'text-red-400 border-red-400 bg-red-400')}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#8B5E3C]/30 bg-[#1a120f] flex justify-end gap-3 rounded-b-2xl shrink-0">
                    <button onClick={onClose} className="px-5 py-2 text-[#8B5E3C] font-bold text-xs uppercase hover:text-white">Hủy</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-[#C69C6D] text-[#1a120f] font-bold text-xs uppercase rounded-lg hover:bg-[#F5E6D3] flex items-center gap-2">
                        <Save size={16}/> Lưu Phân Quyền
                    </button>
                </div>
            </div>
        </div>
    );
}