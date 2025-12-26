'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2 } from 'lucide-react';

import NutMenu from '@/app/GiaoDienTong/MenuDuoi/GiaoDien/NutMenu';
import ThanhDieuHuong from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuHuong';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';
import ThanhDieuKhien from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuKhien';

import GiaoDienDanhSach from './GiaoDienDanhSach';
import { DANH_SACH_PHONG_BAN, kiemTraQuyen } from '@/app/GiaoDienTong/MenuDuoi/DuLieu';

import ModalPhongQuanLy from '@/app/GiaoDienTong/ModalDaCap/modalphongquanly/ModalPhongQuanLy';
import ModalPhongAdmin from '@/app/GiaoDienTong/ModalDaCap/modalphongadmin/ModalPhongAdmin';
import ModalPhongSales from '@/app/GiaoDienTong/ModalDaCap/modalphongsales/ModalPhongSales';
import ModalPhongTho from '@/app/GiaoDienTong/ModalDaCap/modalphongtho/ModalPhongTho';
import ModalPhongCTV from '@/app/GiaoDienTong/ModalDaCap/modalphongctv/ModalPhongCTV';
import ModalPhongPartTime from '@/app/GiaoDienTong/ModalDaCap/modalphongadmin/modalphongparttime/ModalPhongPartTime'; 
import ModalPhongThietKe from '@/app/GiaoDienTong/ModalDaCap/modalphongthietke/ModalPhongThietKe'; 

interface Props {
    nguoiDung: any;
    isOpen: boolean;       
    onToggle: () => void;  
    onClose: () => void;
}

export default function NutPhongBan({ nguoiDung, isOpen, onToggle, onClose }: Props) {
    const [trang, setTrang] = useState(1);
    const [openStates, setOpenStates] = useState({
        admin: false, quanly: false, sales: false, tho: false, 
        parttime: false, ctv: false, thietke: false 
    });
    const searchParams = useSearchParams();

    const closeAllModals = () => {
        setOpenStates({ 
            admin: false, quanly: false, sales: false, tho: false, 
            parttime: false, ctv: false, thietke: false 
        });
    };

    useEffect(() => {
        if (!isOpen) closeAllModals();
    }, [isOpen]);

    const openSpecificModal = (key: string) => {
        setOpenStates(prev => ({ 
            admin: false, quanly: false, sales: false, tho: false, 
            parttime: false, ctv: false, thietke: false,
            [key]: true 
        }));
    };

    useEffect(() => {
        const portal = searchParams.get('portal');
        if (portal && ['admin', 'quanly', 'sales', 'tho', 'parttime', 'ctv', 'thietke'].includes(portal)) {
            openSpecificModal(portal);
        }
    }, [searchParams]);

    const handleListClick = (idPhong: string) => {
        if (idPhong === 'admin') openSpecificModal('admin');
        else if (idPhong === 'quanly') openSpecificModal('quanly');
        else if (idPhong === 'thietke') openSpecificModal('thietke'); 
        else if (['thosanxuat', 'kythuat', 'tho'].includes(idPhong)) openSpecificModal('tho');
        else if (['sales', 'kinhdoanh'].includes(idPhong)) openSpecificModal('sales');
        else if (['parttime', 'thoivu'].includes(idPhong)) openSpecificModal('parttime');
        else if (['congtacvien', 'ctv'].includes(idPhong)) openSpecificModal('ctv');
    };

    const danhSachHienThi = DANH_SACH_PHONG_BAN;
    const SO_MUC_MOI_TRANG = 8; 
    const tongSoTrang = Math.ceil(danhSachHienThi.length / SO_MUC_MOI_TRANG);
    const duLieuTrangNay = danhSachHienThi.slice((trang - 1) * SO_MUC_MOI_TRANG, trang * SO_MUC_MOI_TRANG);

    return (
        <>
            <div className="relative z-[3000]">
                <NutMenu 
                    label="Phòng Ban" icon={Building2} 
                    active={isOpen || Object.values(openStates).some(v => v)} 
                    onClick={() => {
                        const isAnyChildOpen = Object.values(openStates).some(v => v);
                        if (isAnyChildOpen) {
                            closeAllModals();
                            if (!isOpen) onToggle(); 
                        } else {
                            onToggle();
                        }
                    }} 
                />
            </div>

            {isOpen && (
                <div className="fixed top-0 left-0 right-0 bottom-[clamp(65px,16vw,85px)] z-[2000] bg-[#0a0807] flex flex-col animate-in fade-in duration-200 border-b border-[#8B5E3C]/30 shadow-2xl">
                    
                    {/* 🟢 SỬA: Điền tên vào cấp cuối cùng -> Nó sẽ tự biến thành Tiêu đề */}
                    <ThanhDieuHuong 
                        danhSachCap={[
                            { id: 'home', ten: 'Trang Chủ', onClick: onClose }, 
                            { id: 'phongban', ten: 'DANH SÁCH PHÒNG BAN' } 
                        ]} 
                    />

                    <NoidungModal>
                        <div className="pb-20">
                            <GiaoDienDanhSach 
                                data={duLieuTrangNay} 
                                nguoiDung={nguoiDung} 
                                onDongModal={onClose} 
                                onMoModal={handleListClick} 
                            />
                        </div>
                    </NoidungModal>
                    
                    {tongSoTrang > 1 && (
                        <ThanhDieuKhien hienThiPhanTrang={true} trangHienTai={trang} tongSoTrang={tongSoTrang} 
                            onTrangTruoc={() => trang > 1 && setTrang(t=>t-1)} onTrangSau={() => trang < tongSoTrang && setTrang(t=>t+1)} onLuiLichSu={onClose} onToiLichSu={() => setTrang(tongSoTrang)}
                        />
                    )}
                </div>
            )}

            <ModalPhongThietKe isOpen={openStates.thietke} onClose={closeAllModals} />
            <ModalPhongAdmin isOpen={openStates.admin} onClose={closeAllModals} />
            <ModalPhongQuanLy isOpen={openStates.quanly} onClose={closeAllModals} />
            <ModalPhongSales isOpen={openStates.sales} onClose={closeAllModals} />
            <ModalPhongTho isOpen={openStates.tho} onClose={closeAllModals} />
            <ModalPhongPartTime isOpen={openStates.parttime} onClose={closeAllModals} />
            <ModalPhongCTV isOpen={openStates.ctv} onClose={closeAllModals} />
        </>
    );
}