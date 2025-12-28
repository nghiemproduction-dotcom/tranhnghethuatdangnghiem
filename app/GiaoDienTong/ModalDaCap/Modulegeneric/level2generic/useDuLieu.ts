import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig, CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

export const useDuLieu = (config: ModuleConfig, isOpen: boolean, extraFilter?: any, isEmbedded: boolean = false) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [groupByCol, setGroupByCol] = useState('');
    
    // CẤU HÌNH SỐ MỤC/TRANG RESPONSIVE
    const [itemsPerPage, setItemsPerPage] = useState(isEmbedded ? 6 : 20);

    // Cấu hình cột
    const columns = useMemo(() => config.danhSachCot || [], [config.danhSachCot]);
    const [existingColumns, setExistingColumns] = useState<string[]>([]);
    const [searchableColumns, setSearchableColumns] = useState<string[]>([]);
    
    // EFFECT: RESPONSIVE ITEMS_PER_PAGE
    useEffect(() => {
        if (isEmbedded) return;
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) setItemsPerPage(8);
            else if (width < 1024) setItemsPerPage(10);
            else setItemsPerPage(12);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isEmbedded]);

    // KHI ĐỔI SỐ LƯỢNG MỤC/TRANG -> RESET VỀ TRANG 1
    useEffect(() => {
        if (isOpen && config.bangDuLieu && existingColumns.length > 0) {
            setPage(1);
            fetchData(1, 'ALL', search); 
        }
    }, [itemsPerPage]);

    // Logic xác định cột nhóm
    useEffect(() => {
        if (config.listConfig?.groupByColumn) {
            setGroupByCol(config.listConfig.groupByColumn);
        } else {
            const priorityCols = ['trang_thai', 'vi_tri', 'loai', 'chuc_vu', 'phong_ban', 'role', 'nhom'];
            const found = priorityCols.find(key => columns.some(c => c.key === key));
            if (found) setGroupByCol(found);
        }
    }, [config, columns]);

    // 🟢 HÀM LẤY SCHEMA (ĐÃ FIX: TẮT LOADING NẾU LỖI)
    const fetchSchema = useCallback(async () => {
        // Nếu không có bảng dữ liệu, tắt loading ngay
        if (!config.bangDuLieu) {
            setLoading(false);
            return;
        }

        try {
            const { data: tableInfo } = await supabase.rpc('get_table_schema', { t_name: config.bangDuLieu });
            
            if (tableInfo && tableInfo.length > 0) {
                const allCols = tableInfo.map((col: any) => col.column_name);
                
                // Chỉ update state nếu có sự thay đổi (Chống Loop)
                setExistingColumns(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(allCols)) return prev;
                    return allCols;
                });

                const textCols = tableInfo.filter((col: any) => ['text', 'varchar', 'char'].includes(col.data_type)).map((col: any) => col.column_name);
                setSearchableColumns(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(textCols)) return prev;
                    return textCols;
                });
            } else {
                console.warn(`Bảng ${config.bangDuLieu} không tồn tại hoặc không có cột.`);
                setLoading(false); // Quan trọng: Tắt loading để không xoay mãi
            }
        } catch (e) { 
            console.error("Lỗi Schema:", e); 
            setLoading(false);
        }
    }, [config.bangDuLieu]);

    // 🟢 HÀM TẢI DỮ LIỆU
    const fetchData = useCallback(async (p = page, tab = 'ALL', kw = search) => {
        // Nếu chưa có cột nào được load, HỦY để tránh lỗi query
        if (existingColumns.length === 0) return;

        setLoading(true);
        try {
            const from = (p - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            
            let selectQuery = '*';
            // Tự động detect cột relation
            if (config.bangDuLieu === 'nhan_su' && existingColumns.includes('id')) {
                // Kiểm tra sơ bộ để tránh lỗi nếu DB chưa có relation
                selectQuery = '*, khach_hang!nguoi_tao(count)'; 
            }

            let query = supabase.from(config.bangDuLieu).select(selectQuery, { count: 'exact' });

            if (extraFilter) {
                Object.entries(extraFilter).forEach(([key, value]) => {
                    if (existingColumns.includes(key)) query = query.eq(key, value);
                });
            }

            if (tab !== 'ALL' && groupByCol && existingColumns.includes(groupByCol)) {
                query = query.eq(groupByCol, tab);
            }

            if (kw.trim() && searchableColumns.length > 0) {
                // Chỉ tìm trên các cột có thật trong DB
                const validSearchCols = searchableColumns.filter(c => existingColumns.includes(c));
                if (validSearchCols.length > 0) {
                    const filterString = validSearchCols.map(col => `${col}.ilike.%${kw}%`).join(',');
                    query = query.or(filterString);
                }
            }

            const sortCol = existingColumns.includes('tao_luc') ? 'tao_luc' : (existingColumns.includes('id') ? 'id' : '');
            if (sortCol) query = query.order(sortCol, { ascending: false });

            query = query.range(from, to);

            const { data: res, count, error } = await query;
            if (error) {
                // Nếu lỗi relation, thử query thường
                if (error.message.includes('relation') || error.code === 'PGRST200') {
                    console.warn("Lỗi Relation, thử query đơn giản...");
                    const simpleQuery = supabase.from(config.bangDuLieu).select('*', { count: 'exact' }).range(from, to);
                    const { data: simpleRes, count: simpleCount } = await simpleQuery;
                    setData(simpleRes || []);
                    setTotal(simpleCount || 0);
                    return;
                }
                throw error;
            }

            const formatted = (res as any[])?.map((item: any) => {
                if (item.khach_hang && Array.isArray(item.khach_hang)) {
                    return { ...item, total_khach: item.khach_hang[0]?.count || 0 };
                }
                return item;
            });

            setData(formatted || []);
            setTotal(count || 0);
        } catch (err) { 
            console.error("Fetch Data Error:", err); 
        } finally { 
            setLoading(false); 
        }
    }, [page, search, itemsPerPage, config.bangDuLieu, existingColumns, groupByCol, extraFilter, searchableColumns]);

    // 🟢 INIT 1: KHI MỞ MODULE -> CHỈ GỌI FETCH SCHEMA
    useEffect(() => {
        if (isOpen && config.bangDuLieu) {
            setLoading(true); // Bật loading ngay khi mở
            setExistingColumns([]); // Reset cột để tránh dùng cột của bảng cũ
            fetchSchema();
        }
    }, [isOpen, config.bangDuLieu]); // Bỏ fetchSchema khỏi dependency

    // 🟢 INIT 2: KHI SCHEMA ĐÃ CÓ -> MỚI GỌI FETCH DATA
    // Đây là fix quan trọng nhất: Tách việc gọi data ra khỏi promise chain
    useEffect(() => {
        if (isOpen && existingColumns.length > 0) {
            setPage(1);
            fetchData(1, 'ALL', '');
        }
    }, [isOpen, existingColumns]); // Chỉ chạy khi existingColumns thực sự thay đổi (có dữ liệu)

    return {
        data, setData, loading, setLoading,
        search, setSearch, page, setPage, total,
        groupByCol, setGroupByCol,
        existingColumns, columns,
        fetchData, fetchSchema,
        ITEMS_PER_PAGE: itemsPerPage
    };
};