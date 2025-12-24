'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShieldAlert, X, Save, Check, User, Globe, Lock, Crown, Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

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
    check: (targetId: string, itemOwnerId?: string, defaultRoles?: string[]) => boolean; 
    // 🟢 CẬP NHẬT: openConfig nhận thêm defaultRoles để hiển thị đúng khi mở
    openConfig: (targetId: string, title: string, defaultRoles?: string[], onSaveSuccess?: () => void) => void;
    dbPermissions: Record<string, string[]>; 
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
    const [dbPermissions, setDbPermissions] = useState<Record<string, string[]>>({});

    const updateRole = () => {
        const storedRole = localStorage.getItem('USER_ROLE') || localStorage.getItem('user_role') || 'khach';
        const slug = toSlug(storedRole);
        if (slug !== roleSlug) {
            setRawRole(storedRole);
            setRoleSlug(slug);
        }
    };

    const fetchPermissions = async () => {
        const { data, error } = await supabase.from('cau_hinh_phan_quyen').select('*');
        if (data) {
            const map: Record<string, string[]> = {};
            data.forEach((row: any) => {
                map[row.target_id] = row.allowed_roles || [];
            });
            setDbPermissions(map);
        }
        if (error) console.error("Lỗi tải phân quyền:", error);
    };

    useEffect(() => {
        updateRole();
        fetchPermissions();
        const channel = supabase.channel('security_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cau_hinh_phan_quyen' }, () => {
                fetchPermissions();
            })
            .subscribe();

        const interval = setInterval(updateRole, 1000);
        return () => { clearInterval(interval); supabase.removeChannel(channel); };
    }, []);

    const isAdmin = roleSlug.includes('admin') || roleSlug.includes('boss'); 

    const check = (targetId: string, itemOwnerId?: string, defaultRoles?: string[]) => {
        if (isAdmin) return true; 
        
        const dbConfig = dbPermissions[targetId];
        let allowedList: string[] = [];

        if (dbConfig) {
            // Nếu Database có cấu hình -> Dùng Database
            allowedList = dbConfig;
        } else if (defaultRoles && defaultRoles.length > 0) {
            // Nếu Database KHÔNG có -> Dùng mặc định từ Code (DuLieu.ts)
            allowedList = defaultRoles;
        } else {
            // Nếu không có cả 2 -> Mặc định cho phép (tránh lỗi ẩn nhầm)
            return true;
        }

        const allowedSlugs = allowedList.map(r => toSlug(r));

        if (allowedSlugs.includes('all')) return true;
        
        if (allowedSlugs.includes('owner')) {
            const currentUserId = localStorage.getItem('USER_ID');
            if (currentUserId && itemOwnerId === currentUserId) return true;
        }

        return allowedSlugs.includes(roleSlug);
    };

    const openConfig = (targetId: string, title: string, defaultRoles: string[] = [], onSaveSuccess?: () => void) => {
        if (!isAdmin) return;
        setModalData({ isOpen: true, targetId, title, defaultRoles, onSaveSuccess });
    };

    return (
        <SecurityContext.Provider value={{ roleSlug, rawRole, isAdmin, check, openConfig, dbPermissions }}>
            {children}
            {modalData?.isOpen && (
                <SimpleSecurityModal 
                    targetId={modalData.targetId}
                    title={modalData.title}
                    // Nếu DB chưa có, dùng defaultRoles để hiển thị cho Admin biết
                    currentAllowed={dbPermissions[modalData.targetId] || modalData.defaultRoles || []} 
                    onClose={() => setModalData({ ...modalData, isOpen: false })}
                    onSaveSuccess={() => {
                        fetchPermissions(); 
                        if (modalData.onSaveSuccess) modalData.onSaveSuccess();
                    }}
                />
            )}
        </SecurityContext.Provider>
    );
};

const SimpleSecurityModal = ({ targetId, title, currentAllowed, onClose, onSaveSuccess }: any) => {
    const [rolesFromDB, setRolesFromDB] = useState<string[]>([]);
    const [allowed, setAllowed] = useState<string[]>(currentAllowed);
    const [isSaving, setIsSaving] = useState(false);

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
        if (allowed.includes(roleName)) setAllowed(allowed.filter((r:string) => r !== roleName));
        else setAllowed([...allowed, roleName]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        let error = null;

        // 🟢 QUAN TRỌNG: Nếu danh sách rỗng -> XÓA khỏi Database để dùng mặc định
        if (allowed.length === 0) {
            const { error: delErr } = await supabase.from('cau_hinh_phan_quyen').delete().eq('target_id', targetId);
            error = delErr;
        } else {
            // Nếu có chọn -> Lưu đè (Upsert)
            const { error: upErr } = await supabase.from('cau_hinh_phan_quyen').upsert({
                target_id: targetId,
                allowed_roles: allowed,
                updated_at: new Date()
            });
            error = upErr;
        }

        setIsSaving(false);
        if (error) {
            alert(`❌ Lỗi: ${(error as any).message} (${(error as any).code})`);
        } else {
            alert(allowed.length === 0 ? `✅ Đã đặt về Mặc định!` : `✅ Đã lưu cấu hình!`);
            onSaveSuccess();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 pointer-events-auto">
            <div className="w-full max-w-md bg-[#110d0c] border border-[#8B5E3C] rounded-2xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-[#8B5E3C]/30 flex justify-between items-center bg-[#1a120f] rounded-t-2xl">
                    <div className="flex items-center gap-2"><Lock className="text-[#C69C6D]" size={20} /><div><h2 className="text-base font-bold text-[#F5E6D3] uppercase">{title}</h2></div></div>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-2">
                    <div onClick={() => setAllowed([])} className={`flex items-center justify-between p-3 rounded border cursor-pointer border-red-500/30 text-red-500 hover:bg-red-900/10 mb-4`}>
                         <div className="flex items-center gap-2"><ShieldAlert size={16}/><span className="font-bold text-sm">Về Mặc định (Xóa cấu hình)</span></div>
                         {allowed.length === 0 && <Check size={16}/>}
                    </div>
                    
                    <p className="text-[#8B5E3C] text-xs uppercase font-bold mb-2">Nhóm đặc biệt:</p>
                    
                    <div onClick={() => togglePermission('admin')} className={`flex items-center justify-between p-3 rounded border cursor-pointer ${allowed.includes('admin') ? 'bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]' : 'border-[#8B5E3C]/30 text-gray-500'}`}>
                        <div className="flex items-center gap-2"><Crown size={16}/><span className="font-bold text-sm">Chỉ Admin</span></div>
                        {allowed.includes('admin') && <Check size={16}/>}
                    </div>

                    <div onClick={() => togglePermission('owner')} className={`flex items-center justify-between p-3 rounded border cursor-pointer ${allowed.includes('owner') ? 'bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]' : 'border-[#8B5E3C]/30 text-gray-500'}`}>
                        <div className="flex items-center gap-2"><User size={16}/><span className="font-bold text-sm">Chính Chủ (Người tạo)</span></div>
                        {allowed.includes('owner') && <Check size={16}/>}
                    </div>

                    <div onClick={() => togglePermission('all')} className={`flex items-center justify-between p-3 rounded border cursor-pointer ${allowed.includes('all') ? 'bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]' : 'border-[#8B5E3C]/30 text-gray-500'}`}>
                        <div className="flex items-center gap-2"><Globe size={16}/><span className="font-bold text-sm">Công khai (Tất cả)</span></div>
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
                    <button disabled={isSaving} onClick={handleSave} className="px-6 py-2 bg-[#C69C6D] text-[#1a120f] font-bold text-xs uppercase rounded-lg hover:bg-[#F5E6D3] flex items-center gap-2 w-full justify-center disabled:opacity-50">
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
};