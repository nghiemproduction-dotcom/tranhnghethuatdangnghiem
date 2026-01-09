import React from 'react';

interface HienThiLoadingProps {
  tieuDe?: string; // Tiêu đề tùy chỉnh (Ví dụ: "Đang vào kho...", "Đang tính tiền...")
}

export default function HienThiLoading({ tieuDe = "Đang tải dữ liệu..." }: HienThiLoadingProps) {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-4 bg-transparent p-6">
      {/* Icon Loading Xoay */}
      <div className="relative h-12 w-12">
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-white/10 border-t-white"></div>
      </div>
      
      {/* Text thông báo */}
      <p className="animate-pulse text-center text-sm font-medium tracking-wide text-white/70">
        {tieuDe}
      </p>
    </div>
  );
}