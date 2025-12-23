'use client';
import React from 'react';
import { 
    Calendar, Type, Hash, AlignLeft, Phone, Mail, Copy, 
    ExternalLink, Plus, ChevronLeft, Link as LinkIcon, Trash2, MapPin 
} from 'lucide-react';
import { CotHienThi } from '../../../../../DashboardBuilder/KieuDuLieuModule';

interface Props {
    col: CotHienThi;
    value: any;
    onChange: (val: any) => void;
    disabled: boolean;
    dynamicOptions?: string[];
    onAddNewOption?: (colKey: string) => void;
}

export default function InputRenderer({ col, value, onChange, disabled, dynamicOptions, onAddNewOption }: Props) {
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Đã sao chép: " + text);
    };

    const commonClass = `w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg px-3 py-2 text-sm text-[#F5E6D3] outline-none focus:border-[#C69C6D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors placeholder-[#5D4037] ${disabled ? 'bg-[#161210] border-transparent' : ''}`;

    if (col.kieuDuLieu === 'currency') {
        const displayVal = (value !== '' && value !== null && value !== undefined) ? new Intl.NumberFormat('vi-VN').format(value) : '';
        return (
            <div className="relative group">
                <input 
                    type="text" value={displayVal} 
                    onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); onChange(raw ? Number(raw) : null); }}
                    onBlur={() => { if (!disabled && col.inputMultiplier && col.inputMultiplier > 1 && value > 0 && value < 1000) onChange(value * col.inputMultiplier); }}
                    disabled={disabled} className={`${commonClass} pl-9 font-mono text-right`} placeholder="0"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5E3C] text-xs font-bold">VNĐ</span>
            </div>
        );
    }

    if (col.kieuDuLieu === 'percent') return ( <div className="relative group"><input type="number" value={value || ''} onChange={e => onChange(e.target.value)} disabled={disabled} className={`${commonClass} pr-8 font-mono text-right`} placeholder="0"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B5E3C]">%</span></div>);
    if (col.kieuDuLieu === 'select_dynamic') { const opts = dynamicOptions || []; return ( <div className="flex gap-2"><div className="relative flex-1"><select value={value || ''} onChange={e => onChange(e.target.value)} disabled={disabled} className={`${commonClass} appearance-none cursor-pointer`}><option value="">{disabled ? (value || '---') : `-- Chọn ${col.label} --`}</option>{opts.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}</select>{!disabled && <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 rotate-[-90deg] text-[#8B5E3C] pointer-events-none" size={14}/>}</div>{col.allowNewOption && !disabled && onAddNewOption && (<button onClick={() => onAddNewOption(col.key)} className="p-2 bg-[#2a1e1b] border border-[#8B5E3C]/30 rounded-lg hover:bg-[#C69C6D] hover:text-[#1a120f] transition-colors"><Plus size={18}/></button>)}</div>); }
    if (col.kieuDuLieu === 'link_array') { const links: string[] = Array.isArray(value) ? value : []; return ( <div className="space-y-2">{links.map((link, idx) => (<div key={idx} className="flex gap-2 items-center"><div className="flex-1 bg-[#1a120f] border border-[#8B5E3C]/20 rounded px-3 py-2 text-xs text-[#C69C6D] truncate flex items-center gap-2"><LinkIcon size={12}/><a href={link} target="_blank" rel="noreferrer" className="hover:underline truncate">{link}</a></div>{!disabled && <button onClick={() => onChange(links.filter((_, i) => i !== idx))} className="p-1.5 text-red-400 hover:bg-red-900/20 rounded"><Trash2 size={14}/></button>}</div>))}{!disabled && <button onClick={() => { const newLink = prompt("Nhập đường dẫn file (URL):"); if (newLink) onChange([...links, newLink]); }} className="flex items-center gap-2 px-3 py-1.5 bg-[#2a1e1b] border border-[#8B5E3C]/30 rounded text-[10px] font-bold text-[#8B5E3C] hover:text-[#F5E6D3] hover:border-[#F5E6D3] transition-colors"><Plus size={12}/> THÊM LINK</button>}</div>); }
    if (col.formatType === 'link' || col.formatType === 'location') { return (<div className="flex gap-2 relative group"><input type="text" value={value || ''} onChange={e => onChange(e.target.value)} disabled={disabled} className={commonClass} placeholder={col.formatType === 'location' ? "Dán link Google Map..." : "https://..."}/>{col.formatType === 'location' && <MapPin size={14} className="absolute right-12 top-1/2 -translate-y-1/2 text-[#8B5E3C]"/>}{value && <a href={value} target="_blank" rel="noreferrer" className="p-2 bg-[#1a4d2e] text-green-200 rounded-lg hover:bg-[#276f45] border border-[#276f45] flex items-center justify-center shrink-0">{col.formatType === 'location' ? <MapPin size={18}/> : <ExternalLink size={18}/>}</a>}</div>); }
    if (col.formatType === 'phone' || col.formatType === 'email') { return (<div className="relative group"><input type="text" value={value || ''} onChange={e => onChange(e.target.value)} disabled={disabled} className={`${commonClass} pl-9`} placeholder={col.formatType === 'phone' ? "09..." : "example@mail.com"}/><div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5E3C]">{col.formatType === 'phone' ? <Phone size={14}/> : <Mail size={14}/>}</div>{value && (<div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => copyToClipboard(value)} className="p-1 hover:text-[#C69C6D] text-[#5D4037]" title="Sao chép"><Copy size={14}/></button>{col.formatType === 'phone' && <a href={`tel:${value}`} className="p-1 hover:text-[#C69C6D] text-[#5D4037]" title="Gọi ngay"><Phone size={14}/></a>}</div>)}</div>); }
    if (col.kieuDuLieu === 'date') { const dateVal = value ? String(value).split('T')[0] : ''; return ( <div className="relative group"><input type="date" value={dateVal} onChange={e => onChange(e.target.value)} disabled={disabled} className={`${commonClass} pl-9`}/><Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5E3C] pointer-events-none"/></div>); }
    if (col.kieuDuLieu === 'textarea' || ['ghi_chu', 'mo_ta', 'dia_chi'].includes(col.key)) { return (<div className="relative group"><textarea value={value || ''} onChange={e => onChange(e.target.value)} disabled={disabled} className={`${commonClass} h-24 resize-none custom-scroll`} placeholder={`Nhập ${col.label.toLowerCase()}...`}/><AlignLeft size={14} className="absolute right-3 top-3 text-[#5D4037] pointer-events-none group-focus-within:text-[#C69C6D]"/></div>); }
    if (col.kieuDuLieu === 'boolean') { return (<label className="flex items-center gap-3 cursor-pointer p-2 border border-[#8B5E3C]/20 rounded-lg bg-[#0a0807] hover:border-[#C69C6D]/50 transition-colors w-fit min-w-[150px]"><div className={`w-10 h-5 rounded-full relative transition-colors ${value ? 'bg-[#C69C6D]' : 'bg-[#2a1e1b]'}`}><div className={`absolute top-1 w-3 h-3 rounded-full bg-[#1a120f] transition-all ${value ? 'left-6' : 'left-1'}`}></div></div><input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} disabled={disabled} className="hidden"/><span className={`text-xs font-bold ${value ? 'text-[#C69C6D]' : 'text-[#5D4037]'}`}>{value ? 'KÍCH HOẠT' : 'TẮT'}</span></label>); }

    // 10. MẶC ĐỊNH
    return (
        <div className="relative group">
            <input 
                type={['int4','int8','numeric','number'].includes(col.kieuDuLieu) ? 'number' : 'text'} 
                value={value !== undefined && value !== null ? value : ''} 
                onChange={e => onChange(e.target.value)} // Truyền thẳng giá trị, không sửa đổi gì
                disabled={disabled}
                className={`${commonClass} pl-9`}
                placeholder={`Nhập ${col.label.toLowerCase()}...`}
            />
            {['int4','int8','numeric','number'].includes(col.kieuDuLieu) ? (
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5E3C] pointer-events-none group-focus-within:text-[#C69C6D]"/>
            ) : (
                <Type size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5E3C] pointer-events-none group-focus-within:text-[#C69C6D]"/>
            )}
        </div>
    );
}