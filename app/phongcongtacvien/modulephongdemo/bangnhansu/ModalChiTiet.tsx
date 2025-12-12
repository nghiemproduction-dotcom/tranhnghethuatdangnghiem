'use client';
import React from 'react';
import { NhanSu } from './KieuDuLieu';
import DauBang from './DauBang';
import NoiDungBang from './NoiDungBang';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: NhanSu[];
    onRefresh: () => void;
}

export default function ModalChiTiet({ isOpen, onClose, data, onRefresh }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#131314] w-full max-w-5xl h-[85vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <DauBang onClose={onClose} onRefresh={onRefresh} />
                
                {/* Body */}
                <NoiDungBang data={data} />
            </div>
        </div>
    );
}