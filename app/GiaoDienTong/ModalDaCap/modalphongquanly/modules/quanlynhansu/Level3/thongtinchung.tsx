'use client';

import React from 'react';
import { Mail, Phone, MessageCircle, CalendarCheck, FileText, Settings, Info } from 'lucide-react';
import AvatarSection from './AvatarSection';
import { useLevel3Context } from './Level3Context'; 

// Hàm format ngày giờ đơn giản
const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    try {
        const d = new Date(dateStr);
        return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} - ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch { return dateStr; }
};

const SmallActionButton = ({ icon: Icon, label, onClick }: any) => (
    <button onClick={onClick} className="group flex flex-col items-center justify-center p-2 bg-[#161210] border border-[#8B5E3C]/20 rounded-lg hover:bg-[#C69C6D] hover:text-[#1a120f] transition-all shadow-md active:scale-95 w-16 h-16">
        <Icon size={18} className="text-[#8B5E3C] group-hover:text-[#1a120f] mb-1"/>
        <span className="text-[9px] font-bold uppercase text-[#5D4037] group-hover:text-[#1a120f] text-center leading-tight">{label}</span>
    </button>
);

export default function ThongTinChung() {
    const { formData, isEditing, uploadingImg, onImageUpload, config } = useLevel3Context();
    
    // Tìm cột ảnh
    const imgColKey = config.danhSachCot.find(c => c.key === 'hinh_anh' || c.key === 'avatar')?.key || 'hinh_anh';

    // 🟢 Lấy thông tin người tạo (nếu có)
    const ngayTao = formData.created_at;
    const nguoiTao = formData.ten_nguoi_tao || 'Hệ thống';

    return (
        <div className="shrink-0 bg-[#161210] border-b border-[#8B5E3C]/20 p-6 flex flex-col items-center justify-center">
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl">
                {/* 1. Phần Avatar */}
                <div className="shrink-0 flex justify-center">
                    <AvatarSection 
                        imgUrl={formData[imgColKey]} 
                        onUpload={onImageUpload} 
                        uploading={uploadingImg} 
                        canEdit={isEditing} 
                        label={formData.ten_hien_thi || 'CHƯA ĐẶT TÊN'} 
                        subLabel={formData.vi_tri} 
                    />
                </div>

                {/* 2. Phần Nút chức năng & Thông tin khởi tạo */}
                <div className="shrink-0 flex flex-col items-center gap-4">
                    <div className="grid grid-cols-4 gap-3 justify-items-center">
                        <SmallActionButton icon={Phone} label="Gọi" onClick={() => window.location.href = `tel:${formData.so_dien_thoai}`} />
                        <SmallActionButton icon={MessageCircle} label="SMS" onClick={() => window.open(`sms:${formData.so_dien_thoai}`)} />
                        <SmallActionButton icon={Mail} label="Email" onClick={() => window.location.href = `mailto:${formData.email}`} />
                        <SmallActionButton icon={CalendarCheck} label="Công" onClick={() => {}} />
                        <SmallActionButton icon={FileText} label="Hồ Sơ" onClick={() => {}} />
                        <SmallActionButton icon={Settings} label="Lệnh" onClick={() => {}} />
                    </div>

                    {/* 🟢 HIỂN THỊ THÔNG TIN NGƯỜI TẠO & NGÀY TẠO */}
                    {!isEditing && ngayTao && (
                        <div className="flex items-center gap-2 text-[10px] text-[#5D4037] bg-[#8B5E3C]/5 px-3 py-1.5 rounded-full border border-[#8B5E3C]/10">
                            <Info size={12} className="text-[#8B5E3C]" />
                            <span>
                                Khởi tạo: <span className="text-[#C69C6D] font-bold">{formatDate(ngayTao)}</span>
                            </span>
                            <span className="w-[1px] h-3 bg-[#8B5E3C]/30 mx-1"></span>
                            <span>
                                Bởi: <span className="text-[#C69C6D] font-bold uppercase">{nguoiTao}</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}