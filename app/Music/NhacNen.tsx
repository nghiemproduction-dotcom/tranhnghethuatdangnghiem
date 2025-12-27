'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function NhacNen() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        // Tạo audio một lần duy nhất
        audioRef.current = new Audio('/sounds/bgm_menu.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4; // Âm lượng vừa phải

        // Hàm thử phát nhạc
        const tryPlay = () => {
            if (audioRef.current) {
                audioRef.current.play()
                    .then(() => {
                        // Nếu phát thành công -> Đánh dấu đã tương tác
                        setHasInteracted(true);
                    })
                    .catch((error) => {
                        console.log("Chờ tương tác người dùng để phát nhạc...");
                    });
            }
        };

        // Thử phát ngay lập tức
        tryPlay();

        // Nếu trình duyệt chặn, ta lắng nghe sự kiện click đầu tiên vào trang web
        const handleInteraction = () => {
            if (!hasInteracted && audioRef.current && audioRef.current.paused) {
                tryPlay();
            }
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('scroll', handleInteraction);

        return () => {
            // Cleanup khi component bị hủy
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('scroll', handleInteraction);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [hasInteracted]);

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        // Nút bật tắt nhạc nhỏ gọn ở góc màn hình (Z-index cao nhất)
        <div className="fixed bottom-4 right-4 z-[9999]">
            <button 
                onClick={toggleMute} 
                className="w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#C69C6D] border border-[#8B5E3C]/30 shadow-lg transition-all animate-in fade-in"
                title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className={hasInteracted ? "animate-pulse" : ""} />}
            </button>
        </div>
    );
}