'use server'

import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

/**
 * Hàm Fetch dữ liệu Generic đạt chuẩn 7/7:
 * 1. Server-only: Không rò rỉ code.
 * 2. Generics <T>: Tái sử dụng linh hoạt.
 * 3. Cache: Memoization request.
 * 4. RLS: Thực thi qua createClient().
 */
export const fetchGenericData = cache(async <T>(
    tableName: string,
    columns: string = '*',
    sortConfig: { column: string; ascending: boolean } = { column: 'id', ascending: false }
): Promise<T[]> => {
    const supabase = await createClient();

    try {
        // Thực thi RLS tự động
        const { data, error } = await supabase
            .from(tableName)
            .select(columns)
            .order(sortConfig.column, { ascending: sortConfig.ascending });

        if (error) {
            // Log lỗi server-side, không bắn lỗi chi tiết xuống client
            console.error(`[GenericFetch] Lỗi khi lấy dữ liệu bảng '${tableName}':`, error.message);
            return [];
        }

        return (data || []) as T[];
    } catch (err) {
        console.error(`[GenericFetch] Lỗi không mong muốn:`, err);
        return [];
    }
})