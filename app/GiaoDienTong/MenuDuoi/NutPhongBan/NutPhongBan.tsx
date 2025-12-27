'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2 } from 'lucide-react';

import NutMenu from '@/app/GiaoDienTong/MenuDuoi/GiaoDien/NutMenu';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';
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

    // Khi đóng danh sách chính (isOpen = false), thì cũng đóng luôn các modal con (trừ khi đang thao tác đặc biệt)
    // Tuy nhiên logic dưới đây chỉ chạy khi props isOpen thay đổi từ ngoài vào
    useEffect(() => {
        if (!isOpen) {
            // Kiểm tra xem có modal con nào đang mở không? Nếu có thì không đóng vội để tránh mất trạng thái
            // Nhưng logic hiện tại của bạn là đóng tất cả khi menu đóng -> OK
            // closeAllModals(); // (Tạm comment dòng này nếu muốn giữ trạng thái modal con khi menu đóng, nhưng thường là nên đóng)
        }
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
            // Nếu mở từ URL, đảm bảo danh sách chính đóng lại
            if (isOpen) onToggle();
        }
    }, [searchParams]);

    const handleListClick = (idPhong: string) => {
        // 1. Mở modal con tương ứng
        if (idPhong === 'admin') openSpecificModal('admin');
        else if (idPhong === 'quanly') openSpecificModal('quanly');
        else if (idPhong === 'thietke') openSpecificModal('thietke'); 
        else if (['thosanxuat', 'kythuat', 'tho'].includes(idPhong)) openSpecificModal('tho');
        else if (['sales', 'kinhdoanh'].includes(idPhong)) openSpecificModal('sales');
        else if (['parttime', 'thoivu'].includes(idPhong)) openSpecificModal('parttime');
        else if (['congtacvien', 'ctv'].includes(idPhong)) openSpecificModal('ctv');

        // 🟢 QUAN TRỌNG: Đóng danh sách "Phòng Ban" ngay lập tức để không bị đè
        if (isOpen) {
            onToggle(); 
        }
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
                            // Nếu đang mở Modal con -> Đóng Modal con, và ĐÓNG LUÔN danh sách (reset về trạng thái nghỉ)
                            closeAllModals();
                            if (isOpen) onToggle(); 
                        } else {
                            // Nếu không mở Modal con -> Toggle danh sách
                            onToggle();
                        }
                    }} 
                />
            </div>

            {isOpen && (
                <div className="fixed top-[85px] bottom-[100px] left-0 right-0 z-[2000] flex flex-col animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 flex flex-col justify-center">
                        <GiaoDienDanhSach 
                            data={duLieuTrangNay} 
                            nguoiDung={nguoiDung} 
                            onDongModal={onClose} 
                            onMoModal={handleListClick} 
                        />
                    </div>
                    
                    {tongSoTrang > 1 && (
                        <div className="shrink-0 flex justify-center pb-4">
                            <div className="bg-black/40 backdrop-blur-md rounded-full px-4 border border-white/10">
                                <ThanhDieuKhien hienThiPhanTrang={true} trangHienTai={trang} tongSoTrang={tongSoTrang} 
                                    onTrangTruoc={() => trang > 1 && setTrang(t=>t-1)} onTrangSau={() => trang < tongSoTrang && setTrang(t=>t+1)} onLuiLichSu={onClose} onToiLichSu={() => setTrang(tongSoTrang)}
                                />
                            </div>
                        </div>
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