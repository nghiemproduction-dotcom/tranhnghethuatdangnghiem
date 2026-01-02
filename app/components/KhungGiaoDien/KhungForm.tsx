'use client';

/**
 * ============================================================
 * KHUNG FORM
 * ============================================================
 * 
 * Panel form inline (không phải modal popup).
 * Style: Tab bar ngang + Actions góc phải (giống GenericFormInline)
 */

import React, { ReactNode, useState, useRef } from 'react';
import { X, Save, Loader2, User, Camera, Plus } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface KhungFormProps {
    // Data
    isEditing?: boolean;
    data?: any;
    onClose: () => void;
    
    // Header
    title?: string;
    avatar?: string;
    avatarFallback?: ReactNode;
    showAvatarUpload?: boolean;
    onAvatarChange?: (file: File | null) => void;
    
    // Form
    onSubmit?: () => void | Promise<void>;
    
    // State
    loading?: boolean;
    isDirty?: boolean;
    
    // Validation
    errors?: Record<string, string>;
    
    // Content
    children: ReactNode;
    
    // Style
    className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function KhungForm({
    isEditing = false,
    data,
    onClose,
    title,
    avatar,
    avatarFallback,
    showAvatarUpload = false,
    onAvatarChange,
    onSubmit,
    loading = false,
    isDirty = false,
    errors = {},
    children,
    className = '',
}: KhungFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClose = () => {
        if (isDirty) {
            setShowConfirm(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowConfirm(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (loading) return;
        await onSubmit?.();
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            
            // Callback
            onAvatarChange?.(file);
        }
    };

    const displayAvatar = avatarPreview || avatar;

    return (
        <div className={`w-full h-full flex flex-col bg-[#050505] overflow-hidden ${className}`}>
            
            {/* ====== TAB BAR ====== */}
            <div className="shrink-0 h-[40px] flex items-center border-b border-white/5 bg-[#0a0a0a]">
                
                {/* Nút đóng + Avatar + Tên - cố định trái */}
                <div className="shrink-0 flex items-center gap-2 px-2 border-r border-white/5">
                    <button 
                        onClick={handleClose} 
                        disabled={loading}
                        className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-all disabled:opacity-50"
                    >
                        <X size={14} />
                    </button>
                    <div className="flex items-center gap-2 pr-2">
                        {/* Avatar với upload */}
                        <div 
                            className={`relative w-6 h-6 rounded-full border border-[#C69C6D]/50 overflow-hidden bg-[#1a1a1a] shrink-0 ${showAvatarUpload ? 'cursor-pointer group' : ''}`}
                            onClick={showAvatarUpload ? handleAvatarClick : undefined}
                        >
                            {displayAvatar ? (
                                <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
                            ) : avatarFallback ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    {avatarFallback}
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={10} className="text-[#C69C6D]/50" />
                                </div>
                            )}
                            
                            {/* Overlay camera icon */}
                            {showAvatarUpload && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera size={10} className="text-white" />
                                </div>
                            )}
                        </div>
                        
                        <span className="text-[12px] font-bold text-[#C69C6D] uppercase tracking-wide">
                            {isEditing ? (title || 'SỬA') : (title || 'THÊM MỚI')}
                        </span>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Actions - cố định phải */}
                <div className="shrink-0 flex items-center gap-1 px-2 border-l border-white/5">
                    <button 
                        onClick={handleClose} 
                        disabled={loading}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded text-[10px] font-bold uppercase transition-all disabled:opacity-50"
                    >
                        HỦY
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="px-3 py-1.5 bg-[#C69C6D] hover:bg-white text-black rounded text-[10px] font-bold uppercase transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={12} className="animate-spin" />
                                <span>ĐANG LƯU...</span>
                            </>
                        ) : (
                            <>
                                <Save size={12} />
                                <span>LƯU</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Hidden file input */}
            {showAvatarUpload && (
                <input 
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            )}

            {/* ====== CONTENT AREA ====== */}
            <div className="flex-1 overflow-y-auto p-4">
                <style jsx>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                
                {/* Avatar upload lớn (nếu có) */}
                {showAvatarUpload && (
                    <div className="flex justify-center mb-6">
                        <div 
                            onClick={handleAvatarClick}
                            className="relative w-24 h-24 rounded-full border-2 border-[#C69C6D]/50 overflow-hidden bg-[#1a1a1a] cursor-pointer group"
                        >
                            {displayAvatar ? (
                                <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={32} className="text-[#C69C6D]/30" />
                                </div>
                            )}
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                                <Camera size={20} className="text-white mb-1" />
                                <span className="text-[8px] text-white/80 uppercase">Đổi ảnh</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Form fields */}
                {children}
            </div>

            {/* ====== CONFIRM DIALOG ====== */}
            {showConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-sm mx-4 text-center">
                        <p className="text-white text-sm mb-6">Bạn có chắc muốn đóng? Các thay đổi chưa lưu sẽ mất.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-2 rounded-lg bg-white/5 text-white/60 font-bold text-xs uppercase hover:bg-white/10"
                            >
                                TIẾP TỤC
                            </button>
                            <button
                                onClick={handleConfirmClose}
                                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-bold text-xs uppercase hover:bg-red-700"
                            >
                                ĐÓNG
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}