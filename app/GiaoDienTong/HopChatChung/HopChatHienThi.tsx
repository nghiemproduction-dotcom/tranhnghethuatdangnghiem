'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../ThuVien/ketNoiSupabase'; 
import { FileText, RotateCcw } from 'lucide-react';

export interface Message {
  id: string
  created_at: string
  room_name: string
  user_name: string
  user_email: string
  content: string
  file_url?: string
  file_type?: string
  reactions: Record<string, string[]> 
}

export default function HopChatHienThi() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const roomName = 'general';

  // 1. Lấy dữ liệu ban đầu
  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) setCurrentUserEmail(user.email);

    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_name', roomName)
      .order('created_at', { ascending: true })
      .limit(100);
      
    if (data) {
        setMessages(data);
        scrollToBottom();
    }
  };

  useEffect(() => { loadData() }, []);

  // 2. Lắng nghe tin nhắn mới (Realtime)
  useEffect(() => {
    const channel = supabase.channel('chat_display_listener') 
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.room_name === roomName) {
              setMessages((prev) => [...prev, newMsg]);
              scrollToBottom();
          }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, []);

  const scrollToBottom = () => {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full h-full flex flex-col bg-[#1c1917] overflow-hidden">
        {/* Header nhỏ */}
        <div className="bg-stone-900/50 p-2 border-b border-stone-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-stone-400 uppercase">Live Chat</span>
            </div>
            <button onClick={loadData} className="text-stone-500 hover:text-amber-500 transition-colors" title="Làm mới">
                <RotateCcw className="w-3 h-3" />
            </button>
        </div>

        {/* Danh sách tin nhắn */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide bg-black/20">
            {messages.length === 0 && (
                <div className="text-center text-xs text-stone-600 mt-10">Chưa có tin nhắn nào...</div>
            )}
            
            {messages.map((msg, idx) => {
                const isMe = msg.user_email === currentUserEmail;
                return (
                    <div key={`${msg.id}-${idx}`} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                        {!isMe && <span className="text-[9px] text-stone-500 ml-1 mb-0.5">{msg.user_name}</span>}
                        
                        <div className={`max-w-[90%] relative text-sm p-2 rounded-xl border border-stone-800/50 shadow-sm 
                            ${isMe ? 'bg-[#2E2F30] text-stone-100 rounded-br-none' : 'bg-[#1E1F20] text-stone-200 rounded-tl-none'}
                        `}>
                            {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                            
                            {msg.file_url && msg.file_type === 'image' && (
                                <img src={msg.file_url} alt="attachment" className="mt-1 rounded-lg max-h-40 object-cover border border-stone-700" loading="lazy" onClick={() => window.open(msg.file_url, '_blank')} />
                            )}
                            
                            <div className={`text-[8px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                {formatTime(msg.created_at)}
                            </div>
                        </div>
                    </div>
                )
            })}
            <div ref={chatEndRef} />
        </div>
    </div>
  );
}