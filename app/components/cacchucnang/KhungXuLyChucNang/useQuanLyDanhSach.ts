// app/components/KhungXuLyChucNang/useQuanLyDanhSach.ts
import { useState, useEffect, useMemo, useCallback } from 'react';

export function useQuanLyDanhSach<T>(dataSource: any, initialSort: string = 'name') {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState(initialSort);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Tự động fetch data khi mount
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await dataSource.fetchList(1, 100, "", ""); // Gọi API
            if (res.success) setItems(res.data);
        } finally {
            setLoading(false);
        }
    }, [dataSource]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Logic lọc và search chung (giúp file chính gọn hơn)
    const processedItems = useMemo(() => {
        let result = items;
        // ... logic search và sort dùng chung ở đây ...
        return result;
    }, [items, searchTerm, sortBy]);

    return {
        items: processedItems,
        loading,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        refresh: fetchData,
        selection: { selectedIds, setSelectedIds }
    };
}