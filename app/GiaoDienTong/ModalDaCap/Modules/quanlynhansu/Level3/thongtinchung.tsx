'use client';

import React from 'react';
import { Mail, Phone, MessageCircle, CalendarCheck, FileText, Settings, Info, ExternalLink, MapPin } from 'lucide-react';
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

const SmallActionButton = ({ icon: Icon, label, onClick, href }: any) => {
    const handleClick = () => {
        if (href) window.open(href, '_blank');
        else if (onClick) onClick();
    };
    
    return (
        <button onClick={handleClick} className="group flex flex-col items-center justify-center p-2 bg-[#161210] border border-[#8B5E3C]/20 rounded-lg hover:bg-[#C69C6D] hover:text-[#1a120f] transition-all shadow-md active:scale-95 w-16 h-16">
            <Icon size={18} className="text-[#8B5E3C] group-hover:text-[#1a120f] mb-1"/>
            <span className="text-[9px] font-bold uppercase text-[#5D4037] group-hover:text-[#1a120f] text-center leading-tight">{label}</span>
        </button>
    );
};

export default function ThongTinChung() {
    const { formData, isEditing, uploadingImg, onImageUpload, config } = useLevel3Context();
    
    // 🟢 1. LOGIC TÌM CỘT ẢNH (Thêm : any để tránh lỗi TS 7006)
    const imgCol = config.danhSachCot.find((c: any) => c.kieuDuLieu === 'image') || config.danhSachCot.find((c: any) => ['hinh_anh', 'avatar', 'logo'].includes(c.key));
    const imgKey = imgCol ? imgCol.key : 'hinh_anh';

    // 🟢 2. LOGIC TÌM TITLE & SUBTITLE
    // Title: Ưu tiên cột được cấu hình là tiêu đề, hoặc cột text bắt buộc đầu tiên, hoặc id
    const titleField = (config as any).tieuDeCot || config.danhSachCot.find((c: any) => c.batBuoc && c.kieuDuLieu === 'text')?.key || 'id';
    // SubTitle: Ưu tiên cột mô tả, hoặc cột text thứ 2 (khác title)
    const subTitleField = (config as any).moTaCot || config.danhSachCot.find((c: any) => c.key !== titleField && c.kieuDuLieu === 'text')?.key;

    // 🟢 3. LOGIC TẠO NÚT ACTION ĐỘNG (Quét dữ liệu thực tế)
    const renderActions = () => {
        const actions = [];
        
        // Tìm cột Phone
        const phoneCol = config.danhSachCot.find((c: any) => c.kieuDuLieu === 'phone' || c.key.includes('dien_thoai') || c.key.includes('mobile'));
        if (phoneCol && formData[phoneCol.key]) {
            actions.push(<SmallActionButton key="call" icon={Phone} label="Gọi" href={`tel:${formData[phoneCol.key]}`} />);
            actions.push(<SmallActionButton key="sms" icon={MessageCircle} label="SMS" href={`sms:${formData[phoneCol.key]}`} />);
        }
        
        // Tìm cột Email
        const emailCol = config.danhSachCot.find((c: any) => c.kieuDuLieu === 'email' || c.key.includes('email'));
        if (emailCol && formData[emailCol.key]) {
            actions.push(<SmallActionButton key="email" icon={Mail} label="Email" href={`mailto:${formData[emailCol.key]}`} />);
        }
        
        // Tìm cột Link/Website/Map
        const linkCol = config.danhSachCot.find((c: any) => c.kieuDuLieu === 'link' || c.key === 'website');
        if (linkCol && formData[linkCol.key]) {
             actions.push(<SmallActionButton key="web" icon={ExternalLink} label="Web" href={formData[linkCol.key]} />);
        }

        return actions;
    };

    const actionButtons = renderActions();

    // Lấy thông tin người tạo
    const ngayTao = formData.tao_luc;
    const nguoiTao = formData.ten_nguoi_tao || formData.nguoi_tao || 'Hệ thống';

    return (
        <div className="shrink-0 bg-[#161210] border-b border-[#8B5E3C]/20 p-6 flex flex-col items-center justify-center">
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl">
                {/* 1. Phần Avatar */}
                <div className="shrink-0 flex justify-center">
                    <AvatarSection 
                        imgUrl={formData[imgKey]} 
                        onUpload={onImageUpload} 
                        uploading={uploadingImg} 
                        canEdit={isEditing} 
                        label={formData[titleField] || '---'} 
                        subLabel={subTitleField ? formData[subTitleField] : ''} 
                    />
                </div>

                {/* 2. Phần Nút chức năng & Thông tin khởi tạo */}
                <div className="shrink-0 flex flex-col items-center gap-4">
                    <div className="flex flex-wrap justify-center gap-3">
                        {actionButtons}
                        {/* Các nút mặc định hệ thống (nếu cần) */}
                        {actionButtons.length === 0 && (
                             <SmallActionButton icon={FileText} label="Chi tiết" onClick={() => {}} />
                        )}
                    </div>

                    {/* HIỂN THỊ THÔNG TIN NGƯỜI TẠO & NGÀY TẠO */}
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