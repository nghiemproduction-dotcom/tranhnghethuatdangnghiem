'use client';
import Link from 'next/link';

export default function NutMenu({ href, icon, label, active }: any) {
  return (
    <Link href={href} className="group flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer active:scale-95 transition-transform">
       {/* Icon */}
       <div className={`transition-all duration-200 ${active ? 'text-[#0091FF]' : 'text-[#767676] group-hover:text-gray-300'}`}>
          {icon}
       </div>
       {/* Label */}
       <span className={`text-[10px] font-medium ${active ? 'text-[#0091FF]' : 'text-[#767676] group-hover:text-gray-400'}`}>
          {label}
       </span>
    </Link>
  );
}