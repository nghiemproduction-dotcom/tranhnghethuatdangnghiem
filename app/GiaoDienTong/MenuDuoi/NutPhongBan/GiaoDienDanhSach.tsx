'use client';
import React, { useState, useEffect } from 'react'; 
import Link from 'next/link';
import { ChevronRight, Lock } from 'lucide-react';
import { kiemTraQuyen } from '@/app/GiaoDienTong/MenuDuoi/DuLieu';
import Secured from '@/app/components/Secured'; 
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

const toSlug = (str: string | null | undefined) => {
    if (!str) return '';
    return str.trim().toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]/g, "");
};

interface Props {
    data: any[]; 
    nguoiDung: any;
    onDongModal: () => void;
    onMoModal?: (id: string) => void;
}

export default function GiaoDienDanhSach({ data, nguoiDung, onDongModal, onMoModal }: Props) {
    const [savedPermissions, setSavedPermissions] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const saved = localStorage.getItem('TEMP_PERMISSIONS');
        if (saved) setSavedPermissions(JSON.parse(saved));
        
        const handleUpdate = () => {
             const savedNew = localStorage.getItem('TEMP_PERMISSIONS');
             if (savedNew) setSavedPermissions(JSON.parse(savedNew));
        }
        window.addEventListener('SECURITY_UPDATE', handleUpdate);
        return () => window.removeEventListener('SECURITY_UPDATE', handleUpdate);
    }, []);

    if (!data || data.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto pb-10 px-4">
            {data.map((phong) => {
                const Icon = phong.icon;
                const configId = `btn_access_${phong.id}`;
                
                // Mặc định là mảng rỗng nếu chưa cấu hình
                const currentPerms = savedPermissions[configId] || [];

                const fakeConfig = {
                    id: `phong_${phong.id}`, 
                    tenModule: phong.ten,
                    bangDuLieu: 'he_thong', 
                    danhSachCot: [],
                    granularPermissions: {
                        [configId]: currentPerms 
                    }
                } as unknown as ModuleConfig; 

                const handleSaveConfig = (newCfg: ModuleConfig) => {
                    const newPerms = (newCfg as any).granularPermissions[configId];
                    const updated = { ...savedPermissions, [configId]: newPerms };
                    
                    setSavedPermissions(updated);
                    localStorage.setItem('TEMP_PERMISSIONS', JSON.stringify(updated));
                };

                const glowColor = phong.mauSac.includes('red') ? '#ef4444' :
                                  phong.mauSac.includes('blue') ? '#3b82f6' :
                                  phong.mauSac.includes('green') ? '#22c55e' :
                                  phong.mauSac.includes('pink') ? '#ec4899' : '#C69C6D';

                const duocTruyCapNoiDung = kiemTraQuyen(nguoiDung, phong.quyenTruyCap);

                return (
                    <Secured 
                        key={phong.id}
                        id={configId} 
                        title={`Phòng: ${phong.ten}`}
                        config={fakeConfig}
                        onSaveConfig={handleSaveConfig}
                        lockPosition="absolute top-2 right-2"
                        className="w-full h-full"
                    >
                        <div className={`relative group overflow-hidden rounded-2xl border transition-all duration-500 w-full h-full ${duocTruyCapNoiDung ? 'bg-[#120e0d] border-white/5 hover:border-[#C69C6D]/40 hover:bg-[#1a1512] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] cursor-pointer' : 'bg-[#0a0807] border-transparent opacity-60 grayscale cursor-not-allowed'}`}>
                            {duocTruyCapNoiDung && (
                                <>
                                    {onMoModal ? (
                                        <div onClick={(e) => { e.stopPropagation(); onMoModal(phong.id); }} className="absolute inset-0 z-20 w-full h-full bg-transparent" />
                                    ) : (
                                        <Link href={phong.duongDan} onClick={onDongModal} className="absolute inset-0 z-10" />
                                    )}
                                </>
                            )}
                            {duocTruyCapNoiDung && (<div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" style={{ backgroundColor: glowColor }} />)}
                            <div className="flex items-center gap-5 p-5 relative z-10 h-full">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500`}>
                                    <Icon className={`w-7 h-7 ${phong.mauSac} drop-shadow-md`} />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h3 className={`font-black text-[15px] sm:text-[16px] uppercase tracking-wider truncate transition-colors duration-300 ${duocTruyCapNoiDung ? 'text-[#E8DCC8] group-hover:text-white' : 'text-gray-600'}`}>{phong.ten}</h3>
                                    <p className="text-[11px] sm:text-[12px] text-gray-500 mt-1 truncate font-medium group-hover:text-[#C69C6D] transition-colors">{duocTruyCapNoiDung ? phong.moTa : 'Khu vực hạn chế'}</p>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 ${duocTruyCapNoiDung ? 'bg-white/5 group-hover:bg-[#C69C6D] group-hover:text-black group-hover:border-[#C69C6D]' : 'bg-transparent'} transition-all duration-300`}>
                                    {duocTruyCapNoiDung ? <ChevronRight size={16} className="text-gray-400 group-hover:text-[#1a120f] transition-colors" /> : <Lock size={14} className="text-gray-700" />}
                                </div>
                            </div>
                            {duocTruyCapNoiDung && (<div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out opacity-70" style={{ backgroundColor: glowColor }} />)}
                        </div>
                    </Secured>
                );
            })}
        </div>
    );
}