'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, X, Send, User, CheckCircle2, 
    Clock, Search, AlertCircle, Shield, Briefcase 
} from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { useUser } from '@/app/ThuVien/UserContext';
import { claimChatSessionAction } from '@/app/actions/QuyenHanSales';

// Helper format thời gian
const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function TuVanKhachHang() {
    const { user } = useUser();
    
    // --- KHAI BÁO TOÀN BỘ HOOK Ở ĐẦU ---
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'waiting' | 'my_chats' | 'all'>('waiting');
    
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMsg, setInputMsg] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // Hàm fetch sessions
    const fetchSessions = async () => {
        if (!user) return; 

        let query = supabase.from('tu_van_sessions')
            .select('*')
            .order('cap_nhat_luc', { ascending: false });

        if (activeTab === 'waiting') query = query.is('nhan_su_phu_trach_id', null);
        if (activeTab === 'my_chats') query = query.eq('nhan_su_phu_trach_id', user.id);
        
        const { data, error } = await query;
        if (data) setSessions(data);
    };

    // 1. LOAD DANH SÁCH KHÁCH (REALTIME)
    useEffect(() => {
        if (!isOpen || !user) return;
        
        fetchSessions();

        const channel = supabase.channel('staff_dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tu_van_sessions' }, () => {
                fetchSessions();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [isOpen, activeTab, user]); 

    // 2. LOAD TIN NHẮN CHI TIẾT
    useEffect(() => {
        if (!selectedSession) return;

        const loadMsgs = async () => {
            const { data } = await supabase.from('tu_van_messages')
                .select('*')
                .eq('session_id', selectedSession.id)
                .order('tao_luc', { ascending: true });
            if (data) setMessages(data);
            scrollToBottom();
        };
        loadMsgs();

        const channel = supabase.channel(`chat_room_${selectedSession.id}`)
            .on('postgres_changes', { 
                event: 'INSERT', schema: 'public', table: 'tu_van_messages', 
                filter: `session_id=eq.${selectedSession.id}` 
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
                scrollToBottom();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [selectedSession]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 100);
    };

    // 3. HÀNH ĐỘNG: TIẾP NHẬN KHÁCH (CLAIM)
    const handleClaimSession = async () => {
        if (!selectedSession || !user) return;
        setIsClaiming(true);
        
        try {
            const res = await claimChatSessionAction(selectedSession.id);
            
            if (res.success) {
                setSelectedSession((prev: any) => ({ ...prev, nhan_su_phu_trach_id: user.id, trang_thai: 'dang_tu_van' }));
                setActiveTab('my_chats'); 
            } else {
                alert(res.error || "Không thể nhận khách này.");
                fetchSessions(); 
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsClaiming(false);
        }
    };

    // 4. HÀNH ĐỘNG: GỬI TIN TRẢ LỜI
    const handleSend = async () => {
        if (!inputMsg.trim() || !selectedSession || !user) return;
        
        const isManager = ['admin', 'quanly', 'boss'].includes(user.role || '');

        if (!selectedSession.nhan_su_phu_trach_id && !isManager) {
            if (confirm("Bạn cần 'Tiếp nhận' khách này trước khi chat. Tiếp nhận ngay?")) {
                await handleClaimSession();
            } else {
                return;
            }
        }

        const text = inputMsg;
        setInputMsg('');

        await supabase.from('tu_van_messages').insert({
            session_id: selectedSession.id,
            nguoi_gui_id: user.id,
            la_nhan_vien: true,
            noi_dung: text
        });

        await supabase.from('tu_van_sessions').update({
            tin_nhan_cuoi: 'Tư vấn viên: ' + text,
            cap_nhat_luc: new Date().toISOString()
        }).eq('id', selectedSession.id);
    };

    // --- RENDER ---
    if (!user || user.userType !== 'nhan_su') return null;

    const isManager = ['admin', 'quanly', 'boss'].includes(user.role || '');
    const UserIcon = isManager ? Shield : Briefcase;

    return (
        <div className="fixed bottom-6 left-6 z-[9000] font-sans flex flex-col items-start gap-3">   
            {/* PANEL GIAO DIỆN CHÍNH */}
            {isOpen && (
                <div className="
                    fixed left-4 right-4 bottom-24 h-[80vh] 
                    md:static md:w-[800px] md:h-[500px] 
                    bg-[#0a0a0a] border border-[#C69C6D]/50 rounded-2xl shadow-2xl 
                    flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-5 duration-300
                ">
                    
                    {/* CỘT TRÁI: DANH SÁCH */}
                    {/* Mobile: Cao 35%, Desktop: Rộng 30% */}
                    <div className="w-full h-[35%] md:w-[30%] md:h-full border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#111]">
                        {/* Header Cột Trái */}
                        <div className="p-3 border-b border-white/10 bg-[#C69C6D]/10">
                            <div className="flex items-center gap-2 mb-3">
                                <UserIcon size={16} className="text-[#C69C6D]"/>
                                <span className="text-xs font-bold text-white uppercase truncate">{user.ho_ten}</span>
                            </div>
                            {/* Tabs */}
                            <div className="flex bg-black/50 p-1 rounded-lg">
                                <button onClick={() => setActiveTab('waiting')} className={`flex-1 text-[10px] py-1.5 rounded font-bold transition-all ${activeTab==='waiting' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                                    CHỜ ({sessions.filter(s => !s.nhan_su_phu_trach_id).length})
                                </button>
                                <button onClick={() => setActiveTab('my_chats')} className={`flex-1 text-[10px] py-1.5 rounded font-bold transition-all ${activeTab==='my_chats' ? 'bg-[#C69C6D] text-black' : 'text-gray-400 hover:text-white'}`}>
                                    CỦA TÔI
                                </button>
                            </div>
                        </div>

                        {/* List Sessions */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {sessions.length === 0 && <div className="text-center text-white/20 text-xs py-10">Không có dữ liệu</div>}
                            {sessions.map(s => (
                                <div 
                                    key={s.id} 
                                    onClick={() => setSelectedSession(s)}
                                    className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all relative ${selectedSession?.id === s.id ? 'bg-white/10' : ''}`}
                                >
                                    {!s.nhan_su_phu_trach_id && <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                                    <div className="font-bold text-xs text-white mb-1 truncate pr-4">{s.ten_hien_thi}</div>
                                    <div className="text-[10px] text-gray-400 truncate mb-1">{s.tin_nhan_cuoi || 'Bắt đầu chat...'}</div>
                                    <div className="flex justify-between items-center text-[9px] text-gray-500">
                                        <span>{formatTime(s.cap_nhat_luc)}</span>
                                        {s.loai_khach === 'vip' && <span className="text-yellow-500 font-bold border border-yellow-500/30 px-1 rounded">VIP</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CỘT PHẢI: CHAT */}
                    {/* Mobile: Cao 65% (flex-1), Desktop: Rộng 70% */}
                    <div className="flex-1 flex flex-col bg-[#050505] relative h-[65%] md:h-full">
                        {selectedSession ? (
                            <>
                                {/* Header Chat */}
                                <div className="h-12 md:h-14 border-b border-white/10 flex justify-between items-center px-4 bg-[#111] shrink-0">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-white max-w-[150px] truncate">{selectedSession.ten_hien_thi}</h3>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase ${!selectedSession.nhan_su_phu_trach_id ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
                                                {!selectedSession.nhan_su_phu_trach_id ? 'Mới' : 'Đang chat'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        {!selectedSession.nhan_su_phu_trach_id ? (
                                            <button 
                                                onClick={handleClaimSession} 
                                                disabled={isClaiming}
                                                className="px-3 py-1.5 bg-[#C69C6D] hover:bg-white text-black text-[10px] md:text-xs font-bold rounded shadow-lg animate-pulse transition-all disabled:opacity-50"
                                            >
                                                {isClaiming ? '...' : 'TIẾP NHẬN'}
                                            </button>
                                        ) : (
                                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-900/20 border border-green-500/30 rounded text-green-500 text-xs font-bold">
                                                <CheckCircle2 size={14}/> 
                                                Phụ trách
                                            </div>
                                        )}
                                        <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded"><X size={18} className="text-gray-400"/></button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/50" ref={scrollRef}>
                                    {messages.map(m => (
                                        <div key={m.id} className={`flex ${m.la_nhan_vien ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] md:max-w-[70%] p-2.5 md:p-3 rounded-xl text-xs font-sans break-words ${
                                                m.la_nhan_vien 
                                                    ? 'bg-[#C69C6D] text-black rounded-br-none shadow-[0_0_10px_rgba(198,156,109,0.2)]' 
                                                    : 'bg-white/10 text-white rounded-bl-none border border-white/10'
                                            }`}>
                                                <p>{m.noi_dung}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {!selectedSession.nhan_su_phu_trach_id && (
                                        <div className="flex justify-center my-4">
                                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] px-3 py-1 rounded-full flex items-center gap-2">
                                                <AlertCircle size={12}/> Vui lòng tiếp nhận trước
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-3 border-t border-white/10 bg-[#111] flex gap-2 shrink-0">
                                    <input 
                                        className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-xs text-white focus:border-[#C69C6D] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder={!selectedSession.nhan_su_phu_trach_id && !isManager ? "Cần tiếp nhận..." : "Nhập tin nhắn..."}
                                        value={inputMsg}
                                        onChange={e => setInputMsg(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                        disabled={!selectedSession.nhan_su_phu_trach_id && !isManager}
                                    />
                                    <button 
                                        onClick={handleSend} 
                                        disabled={!selectedSession.nhan_su_phu_trach_id && !isManager}
                                        className="p-2 bg-[#C69C6D] text-black rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={18}/>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-white/20 select-none">
                                <MessageSquare size={48} className="mb-4 opacity-20"/>
                                <p className="text-xs font-bold uppercase tracking-widest text-center">Chọn khách để chat</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* NÚT TRÒN CHÍNH (DÀNH CHO NHÂN VIÊN) */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(198,156,109,0.5)] transition-all hover:scale-110 active:scale-95 border-2 border-[#C69C6D]
                    ${isOpen ? 'bg-[#1a1a1a] text-[#C69C6D]' : 'bg-[#C69C6D] text-black animate-bounce-slow'}
                `}
            >
                {isOpen ? <X size={24}/> : <User size={28} fill="currentColor" />}
                
                {!isOpen && sessions.filter(s => !s.nhan_su_phu_trach_id).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border-2 border-[#1a1a1a] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm animate-pulse">
                        {sessions.filter(s => !s.nhan_su_phu_trach_id).length}
                    </span>
                )}
            </button>
        </div>
    );
}