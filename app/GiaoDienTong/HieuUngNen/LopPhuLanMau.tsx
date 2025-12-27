'use client';
import React from 'react';

export default function LopPhuLanMau() {
    return (
        // Z-Index 8000: Nằm dưới Menu (9999) nhưng đè lên Modal (2000)
        <div className="fixed inset-0 w-full h-full pointer-events-none z-[8000]">
            
            {/* Dải Gradient Trên: Sát mép trên (top-0) */}
            {/* Dùng h-32 để che phủ vùng Menu Trên (85px) giúp chữ dễ đọc */}
            <div 
                className="absolute top-0 left-0 right-0 h-32"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)'
                }}
            />

            {/* Dải Gradient Dưới: Sát mép dưới (bottom-0) */}
            {/* Dùng h-32 để che phủ vùng Menu Dưới */}
            <div 
                className="absolute bottom-0 left-0 right-0 h-32"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)'
                }}
            />
        </div>
    );
}