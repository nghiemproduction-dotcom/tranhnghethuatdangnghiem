'use client';
import Link from 'next/link';
import React from 'react';

interface NutMenuProps {
  href?: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function NutMenu({ href, icon, label, active, onClick }: NutMenuProps) {
  
  // Class chung: Flex column, căn giữa, full chiều cao/rộng
  const contentClass = `
    group flex flex-col items-center justify-center h-full w-full cursor-pointer transition-all duration-300
    ${active ? '-translate-y-[2px]' : 'hover:-translate-y-1'}
  `;

  // Icon Style: Dùng CSS để scale icon, xóa bỏ các hiệu ứng của nút special cũ
  const iconWrapperClass = `
    transition-all duration-300 relative z-10 flex items-center justify-center
    ${active ? 'text-[#C69C6D] drop-shadow-[0_0_8px_rgba(198,156,109,0.6)]' : 'text-[#8B5E3C] group-hover:text-[#C69C6D]'}
  `;

  // Label Style: Font size responsive được định nghĩa từ cha hoặc clamp ở đây
  const labelClass = `
    font-bold tracking-wider uppercase transition-colors duration-300 mt-[0.5vh]
    text-[clamp(9px,2.5vw,12px)] 
    ${active ? 'text-[#C69C6D]' : 'text-[#5D4037] group-hover:text-[#8B5E3C]'}
  `;

  // Nội dung bên trong
  const InnerContent = () => (
    <>
      <div className={iconWrapperClass}>
        {icon}
      </div>
      <span className={labelClass}>
        {label}
      </span>
      
      {/* Hiệu ứng đèn nền khi Active */}
      {active && (
        <div className="absolute bottom-0 w-[40%] h-[3px] bg-[#C69C6D] rounded-t-full blur-[2px] opacity-70"></div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={contentClass}>
        <InnerContent />
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={contentClass}>
      <InnerContent />
    </button>
  );
}