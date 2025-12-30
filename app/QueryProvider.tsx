'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Dữ liệu được coi là "tươi" trong 1 phút, sau đó mới fetch lại nếu cần
        staleTime: 60 * 1000, 
        // Tự động fetch lại khi cửa sổ trình duyệt được focus
        refetchOnWindowFocus: false,
        // Số lần thử lại nếu API lỗi
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}