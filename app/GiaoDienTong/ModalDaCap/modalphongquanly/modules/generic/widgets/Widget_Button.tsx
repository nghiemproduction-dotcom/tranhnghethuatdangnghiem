'use client';
import React from 'react';
import { ArrowRight, Star, Zap, Link } from 'lucide-react';

interface Props {
    config: any;
    onClick: () => void;
}

export default function Widget_Button({ config, onClick }: Props) {
    const label = config.widgetData?.buttonLabel || config.tenModule || 'Truy Cập';
    const color = config.widgetData?.buttonColor || '#C69C6D'; // Hex color
    const iconKey = config.widgetData?.buttonIcon || 'arrow';

    const renderIcon = () => {
        switch(iconKey) {
            case 'star': return <Star size={24} className="mb-2"/>;
            case 'zap': return <Zap size={24} className="mb-2"/>;
            case 'link': return <Link size={24} className="mb-2"/>;
            default: return <ArrowRight size={24} className="mb-2"/>;
        }
    };

    return (
        <div 
            onClick={onClick}
            className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer p-4 text-center transition-all duration-300 rounded-2xl border border-transparent hover:border-white/10"
            style={{ backgroundColor: `${color}15` }} // 15 = low opacity hex
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at center, ${color}30 0%, transparent 70%)` }}
            />
            
            <div className="z-10 text-[#F5E6D3] group-hover:text-white transition-colors duration-300 flex flex-col items-center">
                <div style={{ color: color }} className="transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300">
                    {renderIcon()}
                </div>
                <span className="font-bold uppercase tracking-wider text-sm">{label}</span>
            </div>

            <div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                <span className="text-[10px] uppercase font-bold" style={{ color: color }}>Nhấn để mở</span>
            </div>
        </div>
    );
}