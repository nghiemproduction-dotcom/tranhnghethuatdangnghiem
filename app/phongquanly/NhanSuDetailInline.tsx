'use client';

import React, { useState, useMemo } from 'react';
import { 
    X, User, Phone, Mail, Edit3, Trash2, Loader2, Search, Plus, Filter,
    ShieldCheck, Clock, Percent, Banknote, Award, Target, Trophy,
    Lock, Unlock, Star, Medal, Gift, Crown, Zap, Heart, Flame, ArrowUpDown
} from 'lucide-react';

// Danh sách huy hiệu mẫu
const SAMPLE_BADGES = [
    { id: 'first_sale', name: 'Đơn Hàng Đầu Tiên', icon: Star, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', description: 'Hoàn thành đơn hàng đầu tiên', reward: '100,000 VNĐ' },
    { id: 'sales_10', name: 'Thợ Săn 10 Đơn', icon: Target, color: 'text-green-400', bgColor: 'bg-green-400/10', description: 'Hoàn thành 10 đơn hàng', reward: '500,000 VNĐ' },
    { id: 'sales_50', name: 'Chiến Binh 50 Đơn', icon: Medal, color: 'text-blue-400', bgColor: 'bg-blue-400/10', description: 'Hoàn thành 50 đơn hàng', reward: '1,000,000 VNĐ' },
    { id: 'sales_100', name: 'Vua Doanh Số', icon: Crown, color: 'text-purple-400', bgColor: 'bg-purple-400/10', description: 'Hoàn thành 100 đơn hàng', reward: '2,000,000 VNĐ' },
    { id: 'perfect_month', name: 'Tháng Hoàn Hảo', icon: Trophy, color: 'text-orange-400', bgColor: 'bg-orange-400/10', description: 'Không có đơn hủy trong tháng', reward: '300,000 VNĐ' },
    { id: 'speed_demon', name: 'Tốc Độ Ánh Sáng', icon: Zap, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10', description: 'Hoàn thành đơn trong 24h', reward: '200,000 VNĐ' },
    { id: 'loyal_1year', name: 'Trung Thành 1 Năm', icon: Heart, color: 'text-pink-400', bgColor: 'bg-pink-400/10', description: 'Làm việc đủ 1 năm', reward: '1,000,000 VNĐ' },
    { id: 'top_performer', name: 'Top Performer', icon: Flame, color: 'text-red-400', bgColor: 'bg-red-400/10', description: 'Doanh số cao nhất tháng', reward: '500,000 VNĐ' },
];

interface NhanSuDetailInlineProps {
    data: any;
    onClose: () => void;
    onEdit: () => void;
    allowDelete?: boolean;
    onDelete?: (id: string) => Promise<void>;
}

export default function NhanSuDetailInline({ data, onClose, onEdit, allowDelete = false, onDelete }: NhanSuDetailInlineProps) {
    const [activeTab, setActiveTab] = useState<'hoso' | 'muctieu' | 'thanhtich'>('hoso');
    const [deleting, setDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'reward'>('name');
    const [showSortMenu, setShowSortMenu] = useState(false);

    // Mock data cho thành tích (sau này load từ DB)
    const [earnedBadges] = useState<string[]>(['first_sale', 'speed_demon']);

    const handleDelete = async () => {
        if (!data || !onDelete) return;
        if (!confirm(`Bạn có chắc muốn xóa nhân sự: ${data.ho_ten}?`)) return;
        setDeleting(true);
        await onDelete(data.id);
        setDeleting(false);
        onClose();
    };

    if (!data) return null;

    const formatMoney = (amount: any) => {
        if (!amount && amount !== 0) return '0 VNĐ';
        return Number(amount).toLocaleString('vi-VN') + ' VNĐ';
    };

    const luongTheoGio = data.luong_theo_gio > 0 
        ? data.luong_theo_gio 
        : (data.luong_thang ? Math.round((data.luong_thang / 24 / 8) / 1000) * 1000 : 0);

    // Tính counts cho tabs
    const tabCounts = useMemo(() => ({
        hoso: 1,
        muctieu: SAMPLE_BADGES.length,
        thanhtich: earnedBadges.length,
    }), [earnedBadges]);

    const TABS = [
        { id: 'hoso', label: 'HỒ SƠ', count: tabCounts.hoso },
        { id: 'muctieu', label: 'MỤC TIÊU', count: tabCounts.muctieu },
        { id: 'thanhtich', label: 'THÀNH TÍCH', count: tabCounts.thanhtich },
    ];

    // Filter badges theo search
    const filteredBadges = useMemo(() => {
        let badges = activeTab === 'thanhtich' 
            ? SAMPLE_BADGES.filter(b => earnedBadges.includes(b.id))
            : SAMPLE_BADGES;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            badges = badges.filter(b => b.name.toLowerCase().includes(term) || b.description.toLowerCase().includes(term));
        }

        // Sort
        if (sortBy === 'name') {
            badges = [...badges].sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'reward') {
            badges = [...badges].sort((a, b) => {
                const aVal = parseInt(a.reward.replace(/[^\d]/g, ''));
                const bVal = parseInt(b.reward.replace(/[^\d]/g, ''));
                return bVal - aVal;
            });
        }

        return badges;
    }, [activeTab, searchTerm, sortBy, earnedBadges]);

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden">
            {/* HEADER - Avatar + Name + Actions */}
            <div className="shrink-0 px-4 py-3 bg-[#0a0a0a] border-b border-white/10 flex items-center gap-3">
                {/* Close */}
                <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    <X size={16} />
                </button>

                {/* Avatar + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full border-2 border-[#C69C6D]/50 overflow-hidden bg-[#1a1a1a] shrink-0">
                        {data.hinh_anh ? (
                            <img src={data.hinh_anh} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"><User size={16} className="text-[#C69C6D]/50" /></div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-black text-white uppercase tracking-wide truncate">{data.ho_ten}</h2>
                        <p className="text-[10px] text-[#C69C6D] font-bold">{data.vi_tri || '---'}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={onEdit} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#C69C6D] hover:bg-white text-black text-[10px] font-black rounded-lg transition-all active:scale-95">
                        <Edit3 size={12} /> SỬA
                    </button>
                    {allowDelete && (
                        <button onClick={handleDelete} disabled={deleting} className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-all">
                            {deleting ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                        </button>
                    )}
                </div>
            </div>

            {/* TAB BAR - Tabs cuộn, Actions cố định phải */}
            <div className="shrink-0 h-[40px] flex items-center border-b border-white/5 bg-[#080808]">
                {/* Tabs - cuộn được */}
                <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto min-w-0">
                    {TABS.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase transition-all rounded shrink-0 ${
                                activeTab === tab.id 
                                    ? 'text-[#C69C6D] bg-[#C69C6D]/10' 
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab.label}
                            <span className={`px-1 py-0.5 rounded text-[8px] ${
                                activeTab === tab.id ? 'bg-[#C69C6D] text-black' : 'bg-white/10 text-gray-400'
                            }`}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Actions - cố định phải */}
                <div className="shrink-0 flex items-center gap-1 px-2 border-l border-white/5">
                    {/* Search - icon only, expand on click */}
                    {(activeTab === 'muctieu' || activeTab === 'thanhtich') && (
                        <>
                            <div className="relative flex items-center">
                                {showSearch ? (
                                    <div className="flex items-center gap-1 animate-in slide-in-from-right-2">
                                        <input autoFocus type="text" placeholder="Tìm huy hiệu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-24 bg-white/5 border border-white/10 rounded pl-2 pr-6 py-1 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#C69C6D]" />
                                        <button onClick={() => { setShowSearch(false); setSearchTerm(''); }} className="absolute right-1 p-0.5 text-white/40 hover:text-white"><X size={12}/></button>
                                    </div>
                                ) : (
                                    <button onClick={() => setShowSearch(true)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded transition-all"><Search size={14}/></button>
                                )}
                            </div>

                            {/* Sort */}
                            <div className="relative">
                                <button onClick={() => setShowSortMenu(!showSortMenu)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded transition-all"><ArrowUpDown size={14}/></button>
                                {showSortMenu && (
                                    <div className="absolute top-full mt-1 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-[100] min-w-[100px] overflow-hidden">
                                        <button onClick={() => { setSortBy('name'); setShowSortMenu(false); }} className={`w-full text-left px-3 py-1.5 text-[10px] font-bold ${sortBy === 'name' ? 'text-[#C69C6D] bg-[#C69C6D]/10' : 'text-white hover:bg-white/10'}`}>TÊN</button>
                                        <button onClick={() => { setSortBy('reward'); setShowSortMenu(false); }} className={`w-full text-left px-3 py-1.5 text-[10px] font-bold ${sortBy === 'reward' ? 'text-[#C69C6D] bg-[#C69C6D]/10' : 'text-white hover:bg-white/10'}`}>THƯỞNG</button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Add - Chỉ cho admin ở tab mục tiêu */}
                    {allowDelete && activeTab === 'muctieu' && (
                        <button className="p-1.5 bg-[#C69C6D] hover:bg-white text-black rounded transition-all"><Plus size={14}/></button>
                    )}
                </div>
            </div>

            {/* CONTENT AREA - Scroll dọc */}
            <div className="flex-1 overflow-y-auto">
                {/* TAB: HỒ SƠ */}
                {activeTab === 'hoso' && (
                    <div className="p-4 space-y-3">
                        {/* Grid thông tin */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoCard icon={Mail} label="EMAIL" value={data.email} />
                            <InfoCard icon={Phone} label="ĐIỆN THOẠI" value={data.so_dien_thoai} />
                            <InfoCard icon={Banknote} label="LƯƠNG THÁNG" value={formatMoney(data.luong_thang)} highlight />
                            <InfoCard icon={Clock} label="LƯƠNG GIỜ" value={formatMoney(luongTheoGio)} />
                            <InfoCard icon={Percent} label="THƯỞNG DS" value={data.thuong_doanh_thu ? `${data.thuong_doanh_thu}%` : '0%'} />
                        </div>

                        {/* Ngân hàng */}
                        <div className="p-3 rounded-xl bg-[#151515] border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck size={14} className="text-[#C69C6D]" />
                                <span className="text-[10px] font-black text-[#C69C6D] uppercase">NGÂN HÀNG</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-[9px] text-white/40 uppercase">Tên NH</p>
                                    <p className="font-bold text-white">{data.ngan_hang || '---'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-white/40 uppercase">STK</p>
                                    <p className="font-bold text-white font-mono">{data.so_tai_khoan || '---'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: MỤC TIÊU */}
                {activeTab === 'muctieu' && (
                    <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredBadges.map(badge => {
                                const Icon = badge.icon;
                                const isUnlocked = earnedBadges.includes(badge.id);
                                return (
                                    <div 
                                        key={badge.id}
                                        className={`relative p-3 rounded-xl border transition-all ${
                                            isUnlocked 
                                                ? 'bg-[#151515] border-[#C69C6D]/30' 
                                                : 'bg-[#0a0a0a] border-white/5 opacity-60 grayscale'
                                        }`}
                                    >
                                        <div className="absolute top-2 right-2">
                                            {isUnlocked ? <Unlock size={12} className="text-green-400" /> : <Lock size={12} className="text-white/20" />}
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isUnlocked ? badge.bgColor : 'bg-white/5'}`}>
                                                <Icon size={20} className={isUnlocked ? badge.color : 'text-white/20'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold text-xs uppercase truncate ${isUnlocked ? 'text-white' : 'text-white/30'}`}>{badge.name}</h4>
                                                <p className="text-[9px] text-white/40 line-clamp-1">{badge.description}</p>
                                                <div className="mt-1 flex items-center gap-1">
                                                    <Gift size={10} className={isUnlocked ? 'text-green-400' : 'text-white/20'} />
                                                    <span className={`text-[9px] font-bold ${isUnlocked ? 'text-green-400' : 'text-white/30'}`}>{badge.reward}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredBadges.length === 0 && (
                            <div className="text-center py-10 text-white/20">
                                <Target size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-[10px] uppercase font-bold">Không tìm thấy huy hiệu</p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: THÀNH TÍCH */}
                {activeTab === 'thanhtich' && (
                    <div className="p-4">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-[#C69C6D]/10 border border-[#C69C6D]/30 text-center">
                                <p className="text-xl font-black text-[#C69C6D]">{earnedBadges.length}</p>
                                <p className="text-[9px] text-white/40 uppercase">Huy hiệu</p>
                            </div>
                            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                                <p className="text-xl font-black text-green-400">
                                    {(SAMPLE_BADGES.filter(b => earnedBadges.includes(b.id))
                                        .reduce((sum, b) => sum + parseInt(b.reward.replace(/[^\d]/g, '')), 0) / 1000).toFixed(0)}K
                                </p>
                                <p className="text-[9px] text-white/40 uppercase">Tổng thưởng</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                <p className="text-xl font-black text-white">{Math.round(earnedBadges.length / SAMPLE_BADGES.length * 100)}%</p>
                                <p className="text-[9px] text-white/40 uppercase">Hoàn thành</p>
                            </div>
                        </div>

                        {/* Danh sách */}
                        {filteredBadges.length === 0 ? (
                            <div className="text-center py-10 text-white/20">
                                <Trophy size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-[10px] uppercase font-bold">Chưa có thành tích</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredBadges.map(badge => {
                                    const Icon = badge.icon;
                                    return (
                                        <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#151515] border border-[#C69C6D]/20">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${badge.bgColor}`}>
                                                <Icon size={20} className={badge.color} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-xs text-white uppercase truncate">{badge.name}</h4>
                                                <p className="text-[9px] text-white/40">{badge.description}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs font-bold text-green-400">{badge.reward}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Component con
function InfoCard({ icon: Icon, label, value, highlight = false }: any) {
    return (
        <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${highlight ? 'bg-[#C69C6D]/10 border-[#C69C6D]/40' : 'bg-[#151515] border-white/5'}`}>
            <div className={`p-1.5 rounded-lg shrink-0 ${highlight ? 'bg-[#C69C6D] text-black' : 'bg-black text-[#C69C6D]'}`}>
                <Icon size={14} />
            </div>
            <div className="min-w-0 flex-1">
                <p className={`text-[8px] font-black uppercase ${highlight ? 'text-[#C69C6D]' : 'text-white/40'}`}>{label}</p>
                <p className={`text-xs font-bold truncate ${highlight ? 'text-white' : 'text-gray-200'}`}>{value || '---'}</p>
            </div>
        </div>
    );
}
