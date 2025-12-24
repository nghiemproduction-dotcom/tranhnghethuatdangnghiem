'use client';

import React from 'react';
import { Mail, Phone, MessageCircle, CalendarCheck, FileText, Settings } from 'lucide-react';
import AvatarSection from './AvatarSection';
import { useLevel3Context } from './Level3Context'; // 🟢

// Nút chức năng nhỏ gọn
const SmallActionButton = ({ icon: Icon, label, onClick }: any) => (
    <button onClick={onClick} className="group flex flex-col items-center justify-center p-2 bg-[#161210] border border-[#8B5E3C]/20 rounded-lg hover:bg-[#C69C6D] hover:text-[#1a120f] transition-all shadow-md active:scale-95">
        <Icon size={16} className="text-[#8B5E3C] group-hover:text-[#1a120f] mb-1"/>
        <span className="text-[8px] font-bold uppercase text-[#5D4037] group-hover:text-[#1a120f] text-center leading-tight">{label}</span>
    </button>
);

export default function ThongTinChung() {
    // 🟢 Lấy hàng từ kho
    const { formData, isEditing, uploadingImg, onImageUpload, config } = useLevel3Context();
    
    // Tìm cột ảnh từ config có trong kho
    const imgColKey = config.danhSachCot.find(c => c.key === 'hinh_anh' || c.key === 'avatar')?.key || 'hinh_anh';

    return (
        <div className="shrink-0 bg-[#161210] border-b border-[#8B5E3C]/20 p-6 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-auto flex justify-center md:justify-start shrink-0">
                <AvatarSection 
                    imgUrl={formData[imgColKey]} 
                    onUpload={onImageUpload} 
                    uploading={uploadingImg} 
                    canEdit={isEditing} 
                    label={formData.ten_hien_thi || 'CHƯA ĐẶT TÊN'} 
                    subLabel={formData.vi_tri} 
                />
            </div>

            <div className="flex-1 w-full pt-2">
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    <SmallActionButton icon={Phone} label="Gọi" onClick={() => window.location.href = `tel:${formData.so_dien_thoai}`} />
                    <SmallActionButton icon={MessageCircle} label="SMS" onClick={() => window.open(`sms:${formData.so_dien_thoai}`)} />
                    <SmallActionButton icon={Mail} label="Email" onClick={() => window.location.href = `mailto:${formData.email}`} />
                    <SmallActionButton icon={CalendarCheck} label="Công" onClick={() => {}} />
                    <SmallActionButton icon={FileText} label="Hồ Sơ" onClick={() => {}} />
                    <SmallActionButton icon={Settings} label="Lệnh" onClick={() => {}} />
                </div>
            </div>
        </div>
    );
}