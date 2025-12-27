'use client';
import React from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

export default function HieuUngNen() {
    const baseUrl = SUPABASE_URL ? BASE_IMG_URL : '';
    const bgMobile = `${baseUrl}/login-mobile.jpg?v=4`; // v=4 để refresh cache
    const bgDesktop = `${baseUrl}/login-desktop.jpg?v=4`;

    return (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none bg-black">
            {SUPABASE_URL && (
                <>
                    {/* Ảnh nền */}
                    <img src={bgMobile} className="absolute inset-0 w-full h-full object-cover md:hidden animate-fade-in opacity-70" alt="bg-m" />
                    <img src={bgDesktop} className="absolute inset-0 w-full h-full object-cover hidden md:block animate-fade-in opacity-70" alt="bg-d" />
                    
                    {/* 🟢 SỬA LẠI GRADIENT: Mảng đen mỏng hơn, lan tỏa nhẹ hơn */}
                    <div 
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to bottom, 
                                rgba(0,0,0,0.9) 0%, 
                                rgba(0,0,0,0.6) 8%, 
                                transparent 20%, 
                                transparent 80%, 
                                rgba(0,0,0,0.6) 92%, 
                                rgba(0,0,0,1) 100%
                            )`
                        }}
                    />
                </>
            )}
        </div>
    );
}