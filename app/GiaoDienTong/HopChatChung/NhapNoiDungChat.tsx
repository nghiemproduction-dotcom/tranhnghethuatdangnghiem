'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, CornerDownLeft, X, Paperclip } from 'lucide-react';
import { supabase } from '../../ThuVien/ketNoiSupabase'; 
import imageCompression from 'browser-image-compression'; 

export default function ChatInputBottom() {
    const [message, setMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [currentUser, setCurrentUser] = useState({ email: '', name: 'Ẩn danh' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                // Lấy tên từ email hoặc bảng nhan_su nếu cần
                setCurrentUser({ email: user.email, name: user.email.split('@')[0] });
            }
        };
        getUser();
    }, []);

    const handleSendMessage = async () => {
        if ((!message.trim() && !file) || isUploading) return;

        const msgToSend = message;
        const fileToSend = file;
        setMessage('');
        setFile(null);

        let finalFileUrl = undefined;
        let finalFileType = undefined;

        if (fileToSend) {
            setIsUploading(true);
            try {
                let uploadFile = fileToSend;
                if (fileToSend.type.startsWith('image/')) {
                    uploadFile = await imageCompression(fileToSend, { maxSizeMB: 0.5, useWebWorker: true });
                }
                const fileName = `${Date.now()}_${uploadFile.name.replace(/[^\w.]/g, '_')}`;
                const { error } = await supabase.storage.from('chat_assets').upload(fileName, uploadFile);
                if (error) throw error;
                const { data: publicData } = supabase.storage.from('chat_assets').getPublicUrl(fileName);
                finalFileUrl = publicData.publicUrl;
                finalFileType = fileToSend.type.startsWith('image/') ? 'image' : 'file';
            } catch (e) {
                alert('Lỗi upload file');
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        await supabase.from('chat_messages').insert({
            room_name: 'general',
            user_name: currentUser.name,
            user_email: currentUser.email,
            content: msgToSend,
            file_url: finalFileUrl,
            file_type: finalFileType
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-4 left-0 right-0 z-[500] px-4 max-w-4xl mx-auto">
            {file && (
                <div className="mb-2 bg-[#1E1F20] text-gray-300 text-xs rounded-lg p-2 inline-flex items-center gap-2 border border-gray-700 shadow-xl">
                    <Paperclip size={14} />
                    <span className="max-w-[200px] truncate">{file.name}</span>
                    <button onClick={() => setFile(null)} className="hover:text-white"><X size={14}/></button>
                </div>
            )}

            <div className="relative flex items-center bg-[#1E1F20] rounded-full p-2 ring-1 ring-white/10 shadow-2xl shadow-black/50 transition-all duration-300 hover:ring-white/20">
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                
                <input 
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isUploading ? "Đang gửi..." : "Nhập tin nhắn..."}
                    disabled={isUploading}
                    className="w-full bg-transparent text-[#E3E3E3] placeholder:text-gray-500 px-4 py-2 outline-none text-base font-medium"
                />

                <div className="flex items-center gap-2 pr-2 shrink-0">
                    <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-full transition-colors ${file ? 'text-blue-400 bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                        <ImageIcon size={20} />
                    </button>
                    <button onClick={handleSendMessage} disabled={(!message.trim() && !file) || isUploading} className={`p-3 rounded-full transition-colors shadow-lg flex items-center justify-center ${(!message.trim() && !file) ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-[#004A77] hover:bg-[#005A8F] text-blue-100'}`}>
                        {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={18} className="ml-0.5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}