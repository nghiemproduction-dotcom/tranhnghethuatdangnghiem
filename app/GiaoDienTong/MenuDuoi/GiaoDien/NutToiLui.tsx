'use client';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    direction: 'left' | 'right';
    onClick: () => void;
}

export default function NutToiLui({ direction, onClick }: Props) {
    return (
        <button 
            onClick={onClick}
            className="h-full w-[60px] flex items-center justify-center shrink-0 text-[#8B5E3C] hover:text-[#C69C6D] active:scale-90 active:bg-[#C69C6D]/10 transition-all z-20 rounded-lg cursor-pointer"
        >
            {direction === 'left' ? <ChevronLeft size={36} strokeWidth={1.5} /> : <ChevronRight size={36} strokeWidth={1.5} />}
        </button>
    );
}