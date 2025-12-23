'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShieldAlert, X, Save, Check, User, Globe, Lock, Crown } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

export const toSlug = (str: string | null | undefined) => {
    if (!str) return '';
    return str.trim().toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, ""); 
};

interface SecurityContextType {
    roleSlug: string; 
    rawRole: string; 
    isAdmin: boolean;
    check: (targetId: string, config: ModuleConfig, itemOwnerId?: string) => boolean;
    openConfig: (targetId: string, title: string, config: ModuleConfig, onSave: (cfg: ModuleConfig) => void) => void;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurity = () => {
    const context = useContext(SecurityContext);
    if (!context) throw new Error("useSecurity phải dùng bên trong SecurityProvider");
    return context;
};

export const SecurityProvider = ({ children }: { children: React.ReactNode }) => {
    const [rawRole, setRawRole] = useState('khach');
    const [roleSlug, setRoleSlug] = useState('khach');
    const [modalData, setModalData] = useState<any>(null);

    const updateRole = () => {
        const storedRole = localStorage.getItem('USER_ROLE') || localStorage.getItem('user_role') || 'khach';
        const slug = toSlug(storedRole);
        setRawRole(prev => prev !== storedRole ? storedRole : prev);
        setRoleSlug(prev => prev !== slug ? slug : prev);
    };

    useEffect(() => {
        updateRole();
        const interval = setInterval(updateRole, 500);
        window.addEventListener('storage', updateRole);
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', updateRole);
        };
    }, []);

    // 1. ADMIN LÀ BẤT TỬ (Thấy hết)
    const isAdmin = roleSlug.includes('admin'); 

    const check = (targetId: string, config: ModuleConfig, itemOwnerId?: string) => {
        // Nếu là Admin -> Cho qua luôn, không cần check gì nữa
        if (isAdmin) return true; 

        const granular = (config as any).granularPermissions || {};
        const allowedRaw: string[] = granular[targetId] || [];
        const allowedSlugs = allowedRaw.map(r => toSlug(r));

        // 2. NẾU CHƯA CẤU HÌNH -> MẶC ĐỊNH HIỆN (ALL)
        if (!allowedSlugs || allowedSlugs.length === 0) return true;

        // 3. CHECK CHI TIẾT
        if (allowedSlugs.includes('all')) return true;
        
        // Check chính chủ
        if (allowedSlugs.includes('owner')) {
            const currentUserId = localStorage.getItem('USER_ID');
            if (currentUserId && itemOwnerId === currentUserId) return true;
        }

        // 4. SO KHỚP ROLE (Ví dụ: quanly === quanly)
        return allowedSlugs.includes(roleSlug);
    };

    const openConfig = (targetId: string, title: string, config: ModuleConfig, onSave: (cfg: ModuleConfig) => void) => {
        if (!isAdmin) return;
        setModalData({ isOpen: true, targetId, title, config, onSave });
    };

    return (
        <SecurityContext.Provider value={{ roleSlug, rawRole, isAdmin, check, openConfig }}>
            {children}
            {modalData?.isOpen && (
                <SimpleSecurityModal 
                    targetId={modalData.targetId}
                    title={modalData.title}
                    config={modalData.config}
                    onClose={() => setModalData({ ...modalData, isOpen: false })}
                    onSave={modalData.onSave}
                />
            )}
        </SecurityContext.Provider>
    );
};

// MODAL CẤU HÌNH
const SimpleSecurityModal = ({ targetId, title, config, onClose, onSave }: any) => {
    const [rolesFromDB, setRolesFromDB] = useState<string[]>([]);
    const rawAllowed = ((config as any).granularPermissions && (config as any).granularPermissions[targetId]) || [];
    const [allowed, setAllowed] = useState<string[]>(rawAllowed);

    useEffect(() => {
        const fetchRoles = async () => {
            const { data } = await supabase.from('nhan_su').select('vi_tri').not('vi_tri', 'is', null);
            if (data) {
                const uniqueRoles = Array.from(new Set(data.map((r: any) => r.vi_tri)))
                                         .filter(r => r && !toSlug(r).includes('admin'));
                setRolesFromDB(uniqueRoles as string[]);
            }
        };
        fetchRoles();
    }, []);

    const togglePermission = (roleName: string) => {
        if (allowed.includes(roleName)) setAllowed(allowed.filter(r => r !== roleName));
        else setAllowed([...allowed, roleName]);
    };

    const handleSave = () => {
        const currentGranular = (config as any).granularPermissions || {};
        const newGranular = { ...currentGranular, [targetId]: allowed };
        
        onSave({ ...config, granularPermissions: newGranular });
        
        // Bắn sự kiện để UI cập nhật ngay
        window.dispatchEvent(new Event('SECURITY_UPDATE'));
        alert(`✅ Đã lưu cấu hình phân quyền!`); 
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 pointer-events-auto">
            <div className="w-full max-w-md bg-[#110d0c] border border-[#8B5E3C] rounded-2xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-[#8B5E3C]/30 flex justify-between items-center bg-[#1a120f] rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <Lock className="text-[#C69C6D]" size={20} />
                        <div><h2 className="text-base font-bold text-[#F5E6D3] uppercase">Phân Quyền: {title}</h2></div>
                    </div>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-2">
                    <div onClick={() => setAllowed([])} className={`flex items-center justify-between p-3 rounded border cursor-pointer border-red-500/30 text-red-500 hover:bg-red-900/10 mb-4`}>
                         <div className="flex items-center gap-2"><ShieldAlert size={16}/><span className="font-bold text-sm">Mặc định (Ai cũng thấy)</span></div>
                         {allowed.length === 0 && <Check size={16}/>}
                    </div>

                    <p className="text-[#8B5E3C] text-xs uppercase font-bold mb-2">Nhóm đặc biệt:</p>
                    
                    <div onClick={() => togglePermission('admin')} className={`flex items-center justify-between p-3 rounded border cursor-pointer ${allowed.includes('admin') ? 'bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]' : 'border-[#8B5E3C]/30 text-gray-500'}`}>
                        <div className="flex items-center gap-2"><Crown size={16}/><span className="font-bold text-sm">Admin (Quản trị viên)</span></div>
                        {allowed.includes('admin') && <Check size={16}/>}
                    </div>
                    
                    <div onClick={() => togglePermission('owner')} className={`flex items-center justify-between p-3 rounded border cursor-pointer ${allowed.includes('owner') ? 'bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]' : 'border-[#8B5E3C]/30 text-gray-500'}`}>
                        <div className="flex items-center gap-2"><User size={16}/><span className="font-bold text-sm">Chính Chủ</span></div>
                        {allowed.includes('owner') && <Check size={16}/>}
                    </div>

                    <div onClick={() => togglePermission('all')} className={`flex items-center justify-between p-3 rounded border cursor-pointer ${allowed.includes('all') ? 'bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]' : 'border-[#8B5E3C]/30 text-gray-500'}`}>
                        <div className="flex items-center gap-2"><Globe size={16}/><span className="font-bold text-sm">Tất Cả</span></div>
                        {allowed.includes('all') && <Check size={16}/>}
                    </div>

                    <div className="h-px bg-[#8B5E3C]/20 my-2"></div>
                    <p className="text-[#8B5E3C] text-xs uppercase font-bold mb-2">Vị trí nhân sự:</p>

                    {rolesFromDB.map(r => (
                        <div key={r} onClick={() => togglePermission(r)} className={`flex items-center justify-between p-3 rounded border cursor-pointer ${allowed.includes(r) ? 'bg-[#8B5E3C] border-[#8B5E3C] text-white' : 'border-[#8B5E3C]/30 text-gray-500'}`}>
                            <span className="font-medium text-sm capitalize">{r}</span>
                            {allowed.includes(r) && <Check size={16}/>}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-[#8B5E3C]/30 bg-[#1a120f] flex justify-end gap-3 rounded-b-2xl">
                    <button onClick={handleSave} className="px-6 py-2 bg-[#C69C6D] text-[#1a120f] font-bold text-xs uppercase rounded-lg hover:bg-[#F5E6D3] flex items-center gap-2 w-full justify-center">
                        <Save size={16}/> Lưu Cấu Hình
                    </button>
                </div>
            </div>
        </div>
    );
};