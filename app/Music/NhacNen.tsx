'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';

export default function NhacNen() {
    // 1. CẤU HÌNH DANH SÁCH PHÁT (PLAYLIST)
    // Bạn hãy chép các file nhạc vào public/sounds/ và sửa tên ở đây
    const DANH_SACH_NHAC = [
        '/sounds/bai-1.mp3',
        '/sounds/bai-2.mp3',
        '/sounds/bai-3.mp3',
        '/sounds/bai-4.mp3',
    ];

    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(0.5); 
    const [isHovered, setIsHovered] = useState(false);
    
    // State lưu chỉ số bài hát hiện tại (bắt đầu từ 0)
    const [currentSongIndex, setCurrentSongIndex] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);

    // Cập nhật âm lượng
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Tự động phát khi đổi bài (currentSongIndex thay đổi)
    useEffect(() => {
        if (audioRef.current) {
            // Load lại source mới
            audioRef.current.load(); 
            
            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Chặn Autoplay khi đổi bài:", error);
                        // Nếu bị chặn thì vẫn giữ index nhưng set state là pause
                        setIsPlaying(false);
                    });
                }
            }
        }
    }, [currentSongIndex]);

    // Autoplay lần đầu tiên vào trang
    useEffect(() => {
        const firstPlay = async () => {
            if (audioRef.current) {
                try {
                    audioRef.current.volume = volume;
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch (error) {
                    console.log("Autoplay ban đầu bị chặn:", error);
                    setIsPlaying(false);
                }
            }
        };
        firstPlay();
    }, []);

    // HÀM: Chuyển bài tiếp theo
    const playNext = () => {
        setCurrentSongIndex((prevIndex) => {
            // Nếu là bài cuối cùng thì quay lại bài đầu (Loop Playlist)
            if (prevIndex === DANH_SACH_NHAC.length - 1) {
                return 0;
            }
            return prevIndex + 1;
        });
        setIsPlaying(true);
    };

    // HÀM: Quay lại bài trước
    const playPrev = () => {
        setCurrentSongIndex((prevIndex) => {
            if (prevIndex === 0) {
                return DANH_SACH_NHAC.length - 1;
            }
            return prevIndex - 1;
        });
        setIsPlaying(true);
    };

    // HÀM: Bật / Tắt
    const togglePlay = () => {
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.error(e));
            setIsPlaying(true);
        }
    };

    return (
        <div 
            className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-2 pr-4 transition-all duration-300 hover:bg-black/80 shadow-lg group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* QUAN TRỌNG: 
                - src: Lấy từ mảng theo index
                - onEnded: Tự động gọi playNext khi hát xong
                - loop: Đã XÓA (để nó không lặp 1 bài mãi)
            */}
            <audio 
                ref={audioRef} 
                src={DANH_SACH_NHAC[currentSongIndex]} 
                onEnded={playNext} 
            />

            {/* Icon hiển thị trạng thái đang phát (Option: Animation sóng nhạc nhỏ) */}
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'} mr-1`}></div>

            {/* Nút Previous - Chỉ hiện khi Hover */}
            {isHovered && (
                <button onClick={playPrev} className="text-gray-400 hover:text-[#C69C6D] transition-colors">
                    <SkipBack size={16} fill="currentColor" />
                </button>
            )}

            {/* Nút Bật/Tắt (Chính) */}
            <button 
                onClick={togglePlay}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isPlaying ? 'bg-[#C69C6D] text-black shadow-[0_0_10px_#C69C6D]' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                title={isPlaying ? "Tắt nhạc" : "Bật nhạc"}
            >
                {volume === 0 || !isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Nút Next - Chỉ hiện khi Hover */}
            {isHovered && (
                <button onClick={playNext} className="text-gray-400 hover:text-[#C69C6D] transition-colors">
                    <SkipForward size={16} fill="currentColor" />
                </button>
            )}

            {/* Thanh Volume - Hiện khi Hover */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out flex items-center ${isHovered ? 'w-20 opacity-100 ml-2' : 'w-0 opacity-0'}`}>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#C69C6D] hover:h-1.5 transition-all"
                />
            </div>
        </div>
    );
}