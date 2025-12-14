'use client';
import Link from 'next/link';

export default function NutMenu({ href, icon, label, active }: any) {
  return (
    <Link href={href} className="group flex flex-col items-center justify-center gap-1 md:gap-0.5 w-full h-full cursor-pointer active:scale-90 transition-transform">
       {/* Icon: Mobile size 26, Desktop size 20 */}
       <div className={`transition-all duration-300 ${active ? 'text-[#A1887F] -translate-y-1' : 'text-gray-500 group-hover:text-gray-300'}`}>
          {icon}
       </div>
       {/* Label: Mobile text-xs (12px), Desktop text-[10px] */}
       <span className={`text-[11px] md:text-[10px] font-bold ${active ? 'text-[#A1887F]' : 'text-gray-600'}`}>
          {label}
       </span>
    </Link>
  );
}