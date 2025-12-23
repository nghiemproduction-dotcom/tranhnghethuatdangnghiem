'use client';
import React from 'react';

interface Props {
    children: React.ReactNode;
}

export default function NoidungModal({ children }: Props) {
    return (
        <div className="flex-1 w-full overflow-y-auto custom-scroll relative bg-[#0a0807] p-[clamp(10px,3vw,20px)]">
            {/* Wrapper để đảm bảo nội dung không bị sát lề trên mobile */}
            <div className="w-full min-h-full pb-[80px]"> 
                {children}
            </div>
        </div>
    );
}