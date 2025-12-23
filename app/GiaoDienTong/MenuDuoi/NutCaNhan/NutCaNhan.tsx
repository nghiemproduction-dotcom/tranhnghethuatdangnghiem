'use client';
import React, { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';

import NutMenu from '../GiaoDien/NutMenu';
// 🟢 ĐÃ XÓA IMPORT ThanhTieuDe
import ThanhDieuHuong from '../../ModalDaCap/GiaoDien/ThanhDieuHuong';
import NoidungModal from '../../ModalDaCap/GiaoDien/NoidungModal';
import GiaoDienChiTiet from './GiaoDienChiTiet';

interface Props {
    nguoiDung: any;
    isOpen: boolean;       
    onToggle: () => void;  
    onClose: () => void;
}

export default function NutCaNhan({ nguoiDung, isOpen, onToggle, onClose }: Props) {
    const [openStates, setOpenStates] = useState({});

    const closeAllModals = () => {
        setOpenStates({});
    };

    useEffect(() => {
        if (!isOpen) {
            closeAllModals();
        }
    }, [isOpen]);

    return (
        <>
            <div className="relative z-[3000]">
                <NutMenu 
                    label="Cá Nhân" 
                    icon={UserCircle} 
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
                <div className="fixed top-0 left-0 right-0 bottom-[clamp(60px,15vw,80px)] z-[2000] bg-[#0a0807] flex flex-col animate-in fade-in duration-200 border-b border-[#8B5E3C]/30 shadow-2xl">
                    
                    {/* 🟢 THANH ĐIỀU HƯỚNG KIÊM TIÊU ĐỀ */}
                    <ThanhDieuHuong 
                        danhSachCap={[
                            { id: 'home', ten: 'Trang Chủ', onClick: onClose },
                            { id: 'canhan', ten: 'HỒ SƠ CÁ NHÂN' } // Tự động thành tiêu đề to
                        ]} 
                    />
                    {/* 🟢 ĐÃ XÓA ThanhTieuDe Ở ĐÂY */}

                    <NoidungModal>
                        <div className="pb-20">
                            <GiaoDienChiTiet nguoiDung={nguoiDung} />
                        </div>
                    </NoidungModal>
                </div>
            )}
        </>
    );
}