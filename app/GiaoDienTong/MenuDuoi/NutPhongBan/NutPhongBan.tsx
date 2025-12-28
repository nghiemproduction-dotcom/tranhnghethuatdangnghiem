'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { Building2 } from 'lucide-react';

import NutMenu from '@/app/GiaoDienTong/MenuDuoi/GiaoDien/NutMenu';
import ThanhDieuKhien from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuKhien';
import GiaoDienDanhSach from './GiaoDienDanhSach';
import { DANH_SACH_PHONG_BAN } from '@/app/GiaoDienTong/MenuDuoi/DuLieu';

// Import các Modal con
import ModalPhongQuanLy from '@/app/GiaoDienTong/ModalDaCap/ModalPhongQuanLy';
import ModalPhongAdmin from '@/app/GiaoDienTong/ModalDaCap/ModalPhongAdmin';
import ModalPhongSales from '@/app/GiaoDienTong/ModalDaCap/ModalPhongSales';
import ModalPhongTho from '@/app/GiaoDienTong/ModalDaCap/ModalPhongTho';
import ModalPhongCTV from '@/app/GiaoDienTong/ModalDaCap/ModalPhongCTV';
import ModalPhongPartTime from '@/app/GiaoDienTong/ModalDaCap/ModalPhongPartTime'; 
import ModalPhongThietKe from '@/app/GiaoDienTong/ModalDaCap/ModalPhongThietKe'; 

interface Props {
    nguoiDung: any;
    isOpen: boolean;       
    onToggle: () => void;  
    onClose: () => void;
}

export default function NutPhongBan({ nguoiDung, isOpen, onToggle, onClose }: Props) {
    const [trang, setTrang] = useState(1);
    const [mounted, setMounted] = useState(false);
    const [openStates, setOpenStates] = useState({
        admin: false, quanly: false, sales: false, tho: false, 
        parttime: false, ctv: false, thietke: false 
    });
    const searchParams = useSearchParams();

    useEffect(() => { setMounted(true); }, []);

    const closeAllModals = () => {
        setOpenStates({ 
            admin: false, quanly: false, sales: false, tho: false, 
            parttime: false, ctv: false, thietke: false 
        });
    };

    useEffect(() => {
        const portal = searchParams.get('portal');
        if (portal && ['admin', 'quanly', 'sales', 'tho', 'parttime', 'ctv', 'thietke'].includes(portal)) {
            setOpenStates(p => ({ ...p, [portal]: true }));
            if (isOpen) onToggle();
        }
    }, [searchParams]);

    const handleListClick = (idPhong: string) => {
        if (idPhong === 'admin') setOpenStates(p => ({...p, admin: true}));
        else if (idPhong === 'quanly') setOpenStates(p => ({...p, quanly: true}));
        else if (idPhong === 'thietke') setOpenStates(p => ({...p, thietke: true}));
        else if (['thosanxuat', 'kythuat', 'tho'].includes(idPhong)) setOpenStates(p => ({...p, tho: true}));
        else if (['sales', 'kinhdoanh'].includes(idPhong)) setOpenStates(p => ({...p, sales: true}));
        else if (['parttime', 'thoivu'].includes(idPhong)) setOpenStates(p => ({...p, parttime: true}));
        else if (['congtacvien', 'ctv'].includes(idPhong)) setOpenStates(p => ({...p, ctv: true}));

        if (isOpen) onToggle();
    };

    const danhSachHienThi = DANH_SACH_PHONG_BAN;
    const SO_MUC_MOI_TRANG = 8; 
    const tongSoTrang = Math.ceil(danhSachHienThi.length / SO_MUC_MOI_TRANG);
    const duLieuTrangNay = danhSachHienThi.slice((trang - 1) * SO_MUC_MOI_TRANG, trang * SO_MUC_MOI_TRANG);

    // 🟢 CẬP NHẬT LOGIC LIST CONTENT
    const listContent = isOpen ? (
        // Wrapper ngoài cùng: pointer-events-none (để click xuyên qua các vùng trống)
        <div className="fixed inset-0 z-[10000] flex flex-col animate-in fade-in zoom-in-95 duration-300 pointer-events-none">
            
            {/* Container cuộn: Vẫn giữ pointer-events-none.
               Lưu ý: Nếu user để chuột vào vùng trống và lăn chuột, có thể sẽ không cuộn được danh sách 
               vì sự kiện lăn chuột sẽ xuyên qua xuống dưới. Nhưng đây là đánh đổi để đạt được yêu cầu "click xuyên qua".
            */}
            <div className="w-full h-full overflow-y-auto custom-scroll pt-28 pb-36 px-4 md:px-8 pointer-events-none">
                
                <div className="w-full max-w-7xl mx-auto min-h-min pointer-events-none"> 
                    
                    {/* CHỈ BẬT SỰ KIỆN CLICK CHO NỘI DUNG DANH SÁCH */}
                    <div className="pointer-events-auto">
                        <GiaoDienDanhSach 
                            data={duLieuTrangNay} 
                            nguoiDung={nguoiDung} 
                            onDongModal={onClose} 
                            onMoModal={handleListClick} 
                        />
                    </div>

                    {/* VÀ THANH PHÂN TRANG */}
                    {tongSoTrang > 1 && (
                        <div className="mt-8 flex justify-center pointer-events-auto">
                            <div className="bg-black/40 backdrop-blur-md rounded-full px-4 border border-white/10">
                                <ThanhDieuKhien hienThiPhanTrang={true} trangHienTai={trang} tongSoTrang={tongSoTrang} 
                                    onTrangTruoc={() => trang > 1 && setTrang(t=>t-1)} onTrangSau={() => trang < tongSoTrang && setTrang(t=>t+1)} onLuiLichSu={onClose} onToiLichSu={() => setTrang(tongSoTrang)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : null;

    const subModalsContent = (
        <>
            <ModalPhongThietKe isOpen={openStates.thietke} onClose={closeAllModals} />
            <ModalPhongAdmin isOpen={openStates.admin} onClose={closeAllModals} />
            <ModalPhongQuanLy isOpen={openStates.quanly} onClose={closeAllModals} />
            <ModalPhongSales isOpen={openStates.sales} onClose={closeAllModals} />
            <ModalPhongTho isOpen={openStates.tho} onClose={closeAllModals} />
            <ModalPhongPartTime isOpen={openStates.parttime} onClose={closeAllModals} />
            <ModalPhongCTV isOpen={openStates.ctv} onClose={closeAllModals} />
        </>
    );

    return (
        <>
            <div className="relative z-[3000]">
                <NutMenu 
                    label="Phòng Ban" icon={Building2} 
                    active={isOpen || Object.values(openStates).some(v => v)} 
                    onClick={() => {
                        const isAnyChildOpen = Object.values(openStates).some(v => v);
                        if (isAnyChildOpen) { closeAllModals(); if (isOpen) onToggle(); } 
                        else { onToggle(); }
                    }} 
                />
            </div>
            
            {mounted && listContent && createPortal(listContent, document.body)}
            {mounted && createPortal(subModalsContent, document.body)}
        </>
    );
}