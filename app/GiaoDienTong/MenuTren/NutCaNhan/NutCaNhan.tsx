'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserCircle } from 'lucide-react';

 
import ModalProfile from '@/app/GiaoDienTong/MenuTren/NutCaNhan/ModalProfile';
import { useAppSettings } from '@/lib/AppSettingsContext';

interface Props {
    nguoiDung: any; 
    isOpen: boolean;       
    onToggle: () => void;  
    onClose: () => void;
}

export default function NutCaNhan({ nguoiDung, isOpen, onToggle, onClose }: Props) {
    const [mounted, setMounted] = useState(false);
    const { t } = useAppSettings();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Modal nội dung Profile mới
    const modalContent = isOpen && nguoiDung ? (
        <ModalProfile
            isOpen={true}
            onClose={onClose}
            nguoiDung={nguoiDung}
        />
    ) : null;

    return (
        <>
          

            {mounted && modalContent && createPortal(modalContent, document.body)}
        </>
    );
}