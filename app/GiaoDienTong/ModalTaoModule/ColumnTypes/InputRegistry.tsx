'use client';

import React from 'react';
import { Calendar, Check, Clock, ExternalLink, Hash, Link as LinkIcon, Minus, Plus, ToggleLeft, ToggleRight, Upload, X } from 'lucide-react';

// Interface chung cho mọi Input
interface InputProps {
    value: any;
    onChange: (val: any) => void;
    col: any;
    isReadOnly?: boolean;
}

// 1. INPUT TEXT (Cơ bản)
export const InputText = ({ value, onChange, col, isReadOnly }: InputProps) => (
    <input 
        type="text" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        disabled={isReadOnly} 
        className="w-full bg-[#1a120f] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-sm text-[#F5E6D3] focus:border-[#C69C6D] outline-none placeholder-[#5D4037] disabled:opacity-50"
        placeholder={`Nhập ${col.label}...`}
    />
);

// 2. INPUT NUMBER
export const InputNumber = ({ value, onChange, col, isReadOnly }: InputProps) => (
    <div className="relative group">
        <input 
            type="number" 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)} 
            disabled={isReadOnly} 
            className="w-full bg-[#1a120f] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-sm text-[#F5E6D3] focus:border-[#C69C6D] outline-none"
            placeholder="0"
        />
        <Hash size={16} className="absolute right-3 top-3 text-[#5D4037]"/>
    </div>
);

// 3. INPUT BOOLEAN (Switch)
export const InputBoolean = ({ value, onChange, isReadOnly }: InputProps) => {
    const isTrue = value === true;
    return (
        <div 
            onClick={() => !isReadOnly && onChange(!isTrue)} 
            className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all ${isTrue ? 'bg-[#C69C6D]/10 border-[#C69C6D]' : 'bg-[#1a120f] border-[#8B5E3C]/30'}`}
        >
            {isTrue ? <ToggleRight size={32} className="text-[#C69C6D]"/> : <ToggleLeft size={32} className="text-gray-500"/>}
            <span className={`text-sm font-bold uppercase ${isTrue ? 'text-[#C69C6D]' : 'text-gray-500'}`}>{isTrue ? 'Kích hoạt' : 'Tắt'}</span>
        </div>
    );
};

// 4. INPUT ARRAY LINK (Drive)
export const InputLinkArray = ({ value, onChange, isReadOnly }: InputProps) => {
    const links = Array.isArray(value) ? value : [];
    return (
        <div className="space-y-2 bg-[#1a120f]/50 p-3 rounded-xl border border-[#8B5E3C]/20">
            {links.map((link: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={link} 
                        onChange={(e) => { const n = [...links]; n[idx] = e.target.value; onChange(n); }} 
                        className="flex-1 bg-[#1a120f] border border-[#8B5E3C]/30 rounded px-3 py-2 text-sm text-[#F5E6D3] focus:border-[#C69C6D] outline-none"
                        disabled={isReadOnly}
                    />
                    {link && <a href={link} target="_blank" className="p-2 text-[#C69C6D] hover:bg-[#C69C6D]/10 rounded"><ExternalLink size={16}/></a>}
                    {!isReadOnly && <button onClick={() => onChange(links.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:bg-red-900/20 rounded"><Minus size={16}/></button>}
                </div>
            ))}
            {!isReadOnly && (
                <button onClick={() => onChange([...links, ''])} className="flex items-center gap-2 text-xs font-bold text-[#C69C6D] w-full justify-center py-2 border border-dashed border-[#8B5E3C]/50 hover:bg-[#C69C6D]/10 rounded">
                    <Plus size={14}/> Thêm Link
                </button>
            )}
        </div>
    );
};

// 5. INPUT DATE
export const InputDate = ({ value, onChange, isReadOnly }: InputProps) => (
    <div className="relative group">
        <input 
            type="date" 
            value={value ? String(value).split('T')[0] : ''} 
            onChange={(e) => onChange(e.target.value)} 
            disabled={isReadOnly} 
            className="w-full bg-[#1a120f] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-sm text-[#F5E6D3] focus:border-[#C69C6D] outline-none [color-scheme:dark]"
        />
        <Calendar size={16} className="absolute right-3 top-3 text-[#5D4037] pointer-events-none"/>
    </div>
);

// 6. READONLY (System)
export const InputReadOnly = ({ value, col }: InputProps) => (
    <div className="relative opacity-70">
        <input 
            type="text" 
            value={value || '(Tự động)'} 
            disabled 
            className="w-full bg-[#2a1e1b] border border-[#8B5E3C]/10 rounded-lg px-4 py-3 text-sm text-[#C69C6D] cursor-not-allowed italic font-mono"
        />
        <div className="absolute right-3 top-3 text-[#5D4037]"><Clock size={14}/></div>
    </div>
);

// 🟢 NHÀ MÁY RENDER (FACTORY)
export const renderField = (col: any, value: any, onChange: any, isReadOnly: boolean) => {
    switch (col.kieuDuLieu) {
        case 'boolean': return <InputBoolean value={value} onChange={onChange} col={col} isReadOnly={isReadOnly} />;
        case 'integer':
        case 'float':
        case 'number': return <InputNumber value={value} onChange={onChange} col={col} isReadOnly={isReadOnly} />;
        case 'date': 
        case 'timestamptz': return <InputDate value={value} onChange={onChange} col={col} isReadOnly={isReadOnly} />;
        case 'link_array':
        case 'text[]': return <InputLinkArray value={value} onChange={onChange} col={col} isReadOnly={isReadOnly} />;
        case 'readonly': 
        case 'history': return <InputReadOnly value={value} onChange={onChange} col={col} isReadOnly={isReadOnly} />;
        default: return <InputText value={value} onChange={onChange} col={col} isReadOnly={isReadOnly} />;
    }
};