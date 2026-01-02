'use client';

import React, { useState } from 'react';
import { 
    X, User, Phone, Mail, CreditCard, Edit3, Trash2, Loader2,
    ShieldCheck, Clock, Percent, Banknote, Award, Target, Trophy,
    Lock, Unlock, Star, Medal, Gift, Crown, Zap, Heart, Flame
} from 'lucide-react';

// Danh sách huy hiệu mẫu (sau này sẽ load từ DB)
const SAMPLE_BADGES = [
    { id: 'first_sale', name: 'Đơn Hàng Đầu Tiên', icon: Star, color: 'text-yellow-400', description: 'Hoàn thành đơn hàng đầu tiên', reward: '100,000 VNĐ' },
    { id: 'sales_10', name: 'Thợ Săn 10 Đơn', icon: Target, color: 'text-green-400', description: 'Hoàn thành 10 đơn hàng', reward: '500,000 VNĐ' },
    { id: 'sales_50', name: 'Chiến Binh 50 Đơn', icon: Medal, color: 'text-blue-400', description: 'Hoàn thành 50 đơn hàng', reward: '1,000,000 VNĐ' },
    { id: 'sales_100', name: 'Vua Doanh Số', icon: Crown, color: 'text-purple-400', description: 'Hoàn thành 100 đơn hàng', reward: '2,000,000 VNĐ' },
    { id: 'perfect_month', name: 'Tháng Hoàn Hảo', icon: Trophy, color: 'text-orange-400', description: 'Không có đơn hủy trong tháng', reward: '300,000 VNĐ' },
    { id: 'speed_demon', name: 'Tốc Độ Ánh Sáng', icon: Zap, color: 'text-cyan-400', description: 'Hoàn thành đơn trong 24h', reward: '200,000 VNĐ' },
    { id: 'loyal_1year', name: 'Trung Thành 1 Năm', icon: Heart, color: 'text-pink-400', description: 'Làm việc đủ 1 năm', reward: '1,000,000 VNĐ' },
    { id: 'top_performer', name: 'Top Performer', icon: Flame, color: 'text-red-400', description: 'Doanh số cao nhất tháng', reward: '500,000 VNĐ' },
];

interface NhanSuDetailFullProps {
    data: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    allowDelete?: boolean;
    onDelete?: (id: string) => Promise<void>;
}

export default function NhanSuDetailFull({ data, isOpen, onClose, onEdit, allowDelete = false, onDelete }: NhanSuDetailFullProps) {
    const [activeTab, setActiveTab] = useState<'hoso' | 'muctieu' | 'thanhtich'>('hoso');
    const [deleting, setDeleting] = useState(false);

    // Mock data cho thành tích (sau này load từ DB)
    const [earnedBadges] = useState<string[]>(['first_sale', 'speed_demon']); // ID của huy hiệu đã đạt

    const handleDelete = async () => {
        if (!data || !onDelete) return;
        if (!confirm(`Bạn có chắc muốn xóa nhân sự: ${data.ho_ten}?`)) return;
        setDeleting(true);
        await onDelete(data.id);
        setDeleting(false);
        onClose();
    };

    if (!isOpen || !data) return null;

    const formatMoney = (amount: any) => {
        if (!amount && amount !== 0) return '0 VNĐ';
        return Number(amount).toLocaleString('vi-VN') + ' VNĐ';
    };

    const luongTheoGio = data.luong_theo_gio > 0 
        ? data.luong_theo_gio 
        : (data.luong_thang ? Math.round((data.luong_thang / 24 / 8) / 1000) * 1000 : 0);

    const TABS = [
        { id: 'hoso', label: 'HỒ SƠ', icon: User },
        { id: 'muctieu', label: 'MỤC TIÊU', icon: Target },
        { id: 'thanhtich', label: 'THÀNH TÍCH', icon: Trophy },
    ];

    return (
        <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col animate-in fade-in duration-200">
            {/* HEADER - Compact với tabs */}
            <div className="shrink-0 h-[44px] bg-[#080808] border-b border-[#C69C6D]/30 flex items-center px-3 gap-3 shadow-lg">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                    <X size={18} />
                </button>

                {/* Avatar Mini + Name */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full border border-[#C69C6D]/50 overflow-hidden bg-[#1a1a1a]">
                        {data.hinh_anh ? (
                            <img src={data.hinh_anh} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"><User size={14} className="text-[#C69C6D]/50" /></div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-wide leading-none">{data.ho_ten}</h2>
                        <p className="text-[9px] text-[#C69C6D] font-bold">{data.vi_tri || '---'}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex-1 flex items-center justify-center gap-2">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                    isActive 
                                        ? 'bg-[#C69C6D]/20 text-[#C69C6D] border border-[#C69C6D]/50' 
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        onClick={onEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C69C6D] hover:bg-white text-black text-[10px] font-black rounded-lg transition-all active:scale-95"
                    >
                        <Edit3 size={12} /> SỬA
                    </button>
                    {allowDelete && (
                        <button 
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg disabled:opacity-50 transition-all"
                        >
                            {deleting ? <Loader2 size={12} className="animate-spin"/> : <Trash2 size={12}/>}
                        </button>
                    )}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                {/* TAB: HỒ SƠ */}
                {activeTab === 'hoso' && (
                    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-in fade-in duration-300">
                        {/* Avatar lớn */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative w-32 h-32 rounded-full border-4 border-[#C69C6D] p-1 bg-black shadow-[0_0_30px_rgba(198,156,109,0.3)]">
                                <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
                                    {data.hinh_anh ? (
                                        <img src={data.hinh_anh} alt={data.ho_ten} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-[#C69C6D]/50" />
                                    )}
                                </div>
                                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-black rounded-full"></div>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-wide mt-4 mb-1">{data.ho_ten}</h3>
                            <span className="px-4 py-1.5 bg-[#C69C6D]/20 text-[#C69C6D] border border-[#C69C6D]/40 rounded-lg text-xs font-bold uppercase">
                                {data.vi_tri || 'CHƯA CẬP NHẬT'}
                            </span>
                        </div>

                        {/* Thông tin chi tiết */}
                        <div className="space-y-4">
                            <InfoCard icon={Mail} label="EMAIL LIÊN HỆ" value={data.email} />
                            <InfoCard icon={Phone} label="SỐ ĐIỆN THOẠI" value={data.so_dien_thoai} 
                                action={() => window.open(`tel:${data.so_dien_thoai}`)} actionLabel="GỌI" />
                            <InfoCard icon={Banknote} label="LƯƠNG CỨNG (THÁNG)" value={formatMoney(data.luong_thang)} highlight />
                            
                            <div className="grid grid-cols-2 gap-3">
                                <InfoCard icon={Clock} label="LƯƠNG THEO GIỜ" value={formatMoney(luongTheoGio)} />
                                <InfoCard icon={Percent} label="THƯỞNG DOANH SỐ" value={data.thuong_doanh_thu ? `${data.thuong_doanh_thu}%` : '0%'} />
                            </div>

                            {/* Ngân hàng */}
                            <div className="p-4 rounded-xl bg-[#151515] border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck size={16} className="text-[#C69C6D]" />
                                    <span className="text-[11px] font-black text-[#C69C6D] uppercase tracking-wider">THÔNG TIN THANH TOÁN</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pl-3 border-l-2 border-[#C69C6D]/30">
                                    <div>
                                        <p className="text-[9px] text-white/40 font-bold uppercase">NGÂN HÀNG</p>
                                        <p className="text-sm font-bold text-white">{data.ngan_hang || '---'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-white/40 font-bold uppercase">SỐ TÀI KHOẢN</p>
                                        <p className="text-sm font-bold text-white font-mono">{data.so_tai_khoan || '---'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: MỤC TIÊU */}
                {activeTab === 'muctieu' && (
                    <div className="p-4 md:p-8 animate-in fade-in duration-300">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-black text-[#C69C6D] uppercase tracking-widest mb-2">🎯 HUY HIỆU & PHẦN THƯỞNG</h3>
                                <p className="text-xs text-white/40">Hoàn thành mục tiêu để mở khóa huy hiệu và nhận thưởng</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {SAMPLE_BADGES.map(badge => {
                                    const Icon = badge.icon;
                                    const isUnlocked = earnedBadges.includes(badge.id);
                                    return (
                                        <div 
                                            key={badge.id}
                                            className={`relative p-4 rounded-xl border transition-all ${
                                                isUnlocked 
                                                    ? 'bg-[#151515] border-[#C69C6D]/30 hover:border-[#C69C6D]' 
                                                    : 'bg-[#0a0a0a] border-white/5 opacity-60 grayscale'
                                            }`}
                                        >
                                            {/* Lock/Unlock indicator */}
                                            <div className="absolute top-2 right-2">
                                                {isUnlocked ? (
                                                    <Unlock size={14} className="text-green-400" />
                                                ) : (
                                                    <Lock size={14} className="text-white/20" />
                                                )}
                                            </div>

                                            {/* Badge Icon */}
                                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-3 ${
                                                isUnlocked ? 'bg-[#C69C6D]/10' : 'bg-white/5'
                                            }`}>
                                                <Icon size={32} className={isUnlocked ? badge.color : 'text-white/20'} />
                                            </div>

                                            {/* Badge Info */}
                                            <h4 className={`font-bold text-sm uppercase mb-1 ${isUnlocked ? 'text-white' : 'text-white/30'}`}>
                                                {badge.name}
                                            </h4>
                                            <p className="text-[10px] text-white/40 mb-3">{badge.description}</p>

                                            {/* Reward */}
                                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                                isUnlocked ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5'
                                            }`}>
                                                <Gift size={12} className={isUnlocked ? 'text-green-400' : 'text-white/20'} />
                                                <span className={`text-[10px] font-bold ${isUnlocked ? 'text-green-400' : 'text-white/30'}`}>
                                                    {badge.reward}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Admin Actions */}
                            {allowDelete && (
                                <div className="mt-8 p-4 rounded-xl bg-[#C69C6D]/5 border border-[#C69C6D]/20">
                                    <p className="text-[10px] text-[#C69C6D] font-bold uppercase mb-3">⚙️ ADMIN: QUẢN LÝ HUY HIỆU</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold rounded-lg transition-all">
                                            + THÊM HUY HIỆU MỚI
                                        </button>
                                        <button className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold rounded-lg transition-all">
                                            CẤP HUY HIỆU THỦ CÔNG
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: THÀNH TÍCH */}
                {activeTab === 'thanhtich' && (
                    <div className="p-4 md:p-8 animate-in fade-in duration-300">
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-black text-[#C69C6D] uppercase tracking-widest mb-2">🏆 THÀNH TÍCH ĐẠT ĐƯỢC</h3>
                                <p className="text-xs text-white/40">Những huy hiệu vinh quang đã chinh phục</p>
                            </div>

                            {earnedBadges.length === 0 ? (
                                <div className="text-center py-20 text-white/20">
                                    <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-xs uppercase tracking-widest font-bold">Chưa có thành tích nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {SAMPLE_BADGES.filter(b => earnedBadges.includes(b.id)).map((badge, idx) => {
                                        const Icon = badge.icon;
                                        return (
                                            <div 
                                                key={badge.id}
                                                className="flex items-center gap-4 p-4 rounded-xl bg-[#151515] border border-[#C69C6D]/20 hover:border-[#C69C6D]/50 transition-all"
                                                style={{ animationDelay: `${idx * 0.1}s` }}
                                            >
                                                <div className="w-16 h-16 rounded-xl bg-[#C69C6D]/10 flex items-center justify-center shrink-0">
                                                    <Icon size={32} className={badge.color} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white uppercase mb-1">{badge.name}</h4>
                                                    <p className="text-[10px] text-white/40">{badge.description}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[9px] text-white/30 uppercase mb-1">PHẦN THƯỞNG</p>
                                                    <p className="text-sm font-bold text-green-400">{badge.reward}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Thống kê tổng */}
                            <div className="mt-8 p-4 rounded-xl bg-[#C69C6D]/10 border border-[#C69C6D]/30">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-black text-[#C69C6D]">{earnedBadges.length}</p>
                                        <p className="text-[9px] text-white/40 uppercase">Huy hiệu</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-green-400">
                                            {SAMPLE_BADGES.filter(b => earnedBadges.includes(b.id))
                                                .reduce((sum, b) => sum + parseInt(b.reward.replace(/[^\d]/g, '')), 0)
                                                .toLocaleString('vi-VN')}
                                        </p>
                                        <p className="text-[9px] text-white/40 uppercase">Tổng thưởng (VNĐ)</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-white">{Math.round(earnedBadges.length / SAMPLE_BADGES.length * 100)}%</p>
                                        <p className="text-[9px] text-white/40 uppercase">Hoàn thành</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Component con
function InfoCard({ icon: Icon, label, value, highlight = false, action, actionLabel }: any) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all group w-full
            ${highlight ? 'bg-[#C69C6D]/10 border-[#C69C6D]/40' : 'bg-[#151515] border-white/5 hover:border-white/20'}`}
        >
            <div className={`p-2 rounded-lg shrink-0 ${highlight ? 'bg-[#C69C6D] text-black' : 'bg-black text-[#C69C6D]'}`}>
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
                <p className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${highlight ? 'text-[#C69C6D]' : 'text-white/40'}`}>{label}</p>
                <p className={`text-sm font-bold truncate ${highlight ? 'text-white' : 'text-gray-200'}`}>{value || '---'}</p>
            </div>
            {action && value && (
                <button onClick={(e) => { e.stopPropagation(); action(); }}
                    className="px-2 py-1 bg-white/10 hover:bg-[#C69C6D] text-white hover:text-black text-[9px] font-bold rounded uppercase transition-colors shrink-0">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
