'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { Building2 } from 'lucide-react';

import NutMenu from '@/app/GiaoDienTong/MenuDuoi/GiaoDien/NutMenu';
import GiaoDienDanhSach from './GiaoDienDanhSach';
import ThanhPhanTrang from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhPhanTrang'; 

import { DANH_SACH_PHONG_BAN } from '@/app/GiaoDienTong/MenuDuoi/DuLieu';

// Import các Modal con
import ModalPhongQuanLy from '@/app/GiaoDienTong/ModalDaCap/ModalPhongQuanLy';
import ModalPhongAdmin from '@/app/GiaoDienTong/ModalDaCap/ModalPhongAdmin';
import ModalPhongSales from '@/app/GiaoDienTong/ModalDaCap/ModalPhongSales';
import ModalPhongTho from '@/app/GiaoDienTong/ModalDaCap/ModalPhongTho';
import ModalPhongCTV from '@/app/GiaoDienTong/ModalDaCap/ModalPhongCTV';
import ModalPhongPartTime from '@/app/GiaoDienTong/ModalDaCap/ModalPhongPartTime'; 
import ModalPhongThietKe from '@/app/GiaoDienTong/ModalDaCap/ModalPhongThietKe'; 
// 🟢 IMPORT PHÒNG TRƯNG BÀY
import ModalPhongTrungBay from '@/app/GiaoDienTong/ModalDaCap/ModalPhongTrungBay';

interface Props {
    nguoiDung: any;
    isOpen: boolean;       
    onToggle: () => void;  
    onClose: () => void;
}

export default function NutPhongBan({ nguoiDung, isOpen, onToggle, onClose }: Props) {
    const [trang, setTrang] = useState(1);
    const [mounted, setMounted] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10); 

    // 🟢 THÊM STATE: trungbay
    const [openStates, setOpenStates] = useState({
        admin: false, quanly: false, sales: false, tho: false, 
        parttime: false, ctv: false, thietke: false, trungbay: false
    });
    const searchParams = useSearchParams();

    // Responsive items per page
    useEffect(() => { 
        setMounted(true); 
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) setItemsPerPage(6);      
            else if (width < 1024) setItemsPerPage(8); 
            else setItemsPerPage(10);                 
        };
        handleResize(); 
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const closeAllModals = () => {
        setOpenStates({ 
            admin: false, quanly: false, sales: false, tho: false, 
            parttime: false, ctv: false, thietke: false, trungbay: false
        });
    };

    useEffect(() => {
        const portal = searchParams.get('portal');
        if (portal && ['admin', 'quanly', 'sales', 'tho', 'parttime', 'ctv', 'thietke', 'trungbay'].includes(portal)) {
            setOpenStates(p => ({ ...p, [portal]: true }));
            if (isOpen) onToggle();
        }
    }, [searchParams]);

    const handleListClick = (idPhong: string) => {
        if (idPhong === 'admin') setOpenStates(p => ({...p, admin: true}));
        else if (idPhong === 'quanly') setOpenStates(p => ({...p, quanly: true}));
        else if (idPhong === 'thietke') setOpenStates(p => ({...p, thietke: true}));
        // 🟢 XỬ LÝ CLICK TRƯNG BÀY
        else if (idPhong === 'trungbay') setOpenStates(p => ({...p, trungbay: true}));
        
        else if (['thosanxuat', 'kythuat', 'tho'].includes(idPhong)) setOpenStates(p => ({...p, tho: true}));
        else if (['sales', 'kinhdoanh'].includes(idPhong)) setOpenStates(p => ({...p, sales: true}));
        else if (['parttime', 'thoivu'].includes(idPhong)) setOpenStates(p => ({...p, parttime: true}));
        else if (['congtacvien', 'ctv'].includes(idPhong)) setOpenStates(p => ({...p, ctv: true}));

        if (isOpen) onToggle();
    };

    const danhSachHienThi = DANH_SACH_PHONG_BAN;
    const tongSoTrang = Math.ceil(danhSachHienThi.length / itemsPerPage);
    
    useEffect(() => {
        if (trang > tongSoTrang && tongSoTrang > 0) setTrang(tongSoTrang);
    }, [tongSoTrang, trang]);

    const duLieuTrangNay = danhSachHienThi.slice((trang - 1) * itemsPerPage, trang * itemsPerPage);

    // Overlay Danh sách phòng ban (Nền đen 80%)
    const listContent = isOpen ? (
        <div 
            className="fixed inset-0 z-[10000] flex flex-col animate-in fade-in zoom-in-95 duration-300 bg-black/80 backdrop-blur-sm pointer-events-auto overflow-hidden"
            onClick={onClose}
        >
            <div className="w-full h-full flex flex-col pt-[90px] pb-[110px] px-4 md:px-8 pointer-events-none">
                <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col justify-center min-h-0 pointer-events-none"> 
                    
                    <div className="flex-1 w-full pointer-events-auto flex items-center">
                        <GiaoDienDanhSach 
                            data={duLieuTrangNay} 
                            nguoiDung={nguoiDung} 
                            onDongModal={onClose} 
                            onMoModal={handleListClick} 
                        />
                    </div>

                    {tongSoTrang > 1 && (
                        <div className="h-[60px] flex items-center justify-center shrink-0 pointer-events-auto">
                            <ThanhPhanTrang 
                                trangHienTai={trang} 
                                tongSoTrang={tongSoTrang} 
                                onLui={() => trang > 1 && setTrang(t => t - 1)} 
                                onToi={() => trang < tongSoTrang && setTrang(t => t + 1)} 
                            />
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
            
            {/* 🟢 RENDER MODAL TRƯNG BÀY */}
            <ModalPhongTrungBay isOpen={openStates.trungbay} onClose={closeAllModals} />
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