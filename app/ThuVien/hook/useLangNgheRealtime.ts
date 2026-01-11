'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface CauHinhRealtime {
  bang: string;             
  suKien?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'; 
  boLoc: string;            
  callback: (payload: RealtimePostgresChangesPayload<any>) => void;
}

export function useLangNgheRealtime({ bang, suKien = '*', boLoc, callback }: CauHinhRealtime) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Cảnh báo nếu thiếu bộ lọc
    if (!boLoc) {
      console.warn(`⚠️ CẢNH BÁO: Đang lắng nghe bảng ${bang} mà KHÔNG CÓ BỘ LỌC.`);
    }

    // 2. Tạo kênh
    const kenh = supabase
      .channel(`realtime-${bang}-${Math.random()}`)
      .on(
        'postgres_changes',
        // ✅ FIX LỖI: Ép kiểu 'as any' cho object cấu hình. 
        // Lý do: TypeScript strict mode đôi khi không nhận diện đúng overload của Supabase 
        // khi truyền biến vào thuộc tính 'event'. 'as any' giúp bypass lỗi này an toàn.
        {
          event: suKien, 
          schema: 'public', 
          table: bang,
          filter: boLoc,
        } as any, 
        
        (payload: RealtimePostgresChangesPayload<any>) => {
          // console.log(`🔔 Realtime [${bang}]:`, payload);
          callback(payload);
          router.refresh(); 
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // console.log(`✅ Đã kết nối Realtime vào bảng: ${bang}`);
        }
      });

    // 3. Cleanup
    return () => {
      supabase.removeChannel(kenh);
    };
  }, [bang, suKien, boLoc, router, supabase]);
}