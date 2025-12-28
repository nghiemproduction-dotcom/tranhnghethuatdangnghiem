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
    
    // 🟢 CẤU HÌNH SỐ MỤC/TRANG RESPONSIVE
    // Mặc định 20, nếu nhúng (widget) thì 6
    const [itemsPerPage, setItemsPerPage] = useState(isEmbedded ? 6 : 20);

    // Cấu hình cột
    const columns = useMemo(() => config.danhSachCot || [], [config.danhSachCot]);
    const [existingColumns, setExistingColumns] = useState<string[]>([]);
    const [searchableColumns, setSearchableColumns] = useState<string[]>([]);
    
    // 🟢 EFFECT: LẮNG NGHE KÍCH THƯỚC MÀN HÌNH ĐỂ CHỈNH ITEMS_PER_PAGE
    useEffect(() => {
        if (isEmbedded) return; // Nếu là widget nhỏ thì giữ nguyên, không responsive theo màn hình chính
        
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setItemsPerPage(8);  // Mobile
            } else if (width < 1024) {
                setItemsPerPage(10);  // Tablet
            } else {
                setItemsPerPage(12); // Desktop (Yêu cầu của bạn là 10, mặc định cũ là 20)
            }
        };

        // Chạy ngay khi mount
        handleResize();

        // Lắng nghe sự kiện resize
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isEmbedded]);

    // 🟢 KHI ĐỔI SỐ LƯỢNG MỤC/TRANG -> RESET VỀ TRANG 1
    // Để tránh trường hợp đang ở trang 10, resize xong chỉ còn 5 trang -> lỗi hiển thị
    useEffect(() => {
        setPage(1);
        if (isOpen && config.bangDuLieu) {
            fetchData(1, 'ALL', search); // Gọi lại dữ liệu ngay
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

    // Lấy Schema Database
    const fetchSchema = useCallback(async () => {
        try {
            const { data: tableInfo } = await supabase.rpc('get_table_schema', { t_name: config.bangDuLieu });
            if (tableInfo) {
                const allCols = tableInfo.map((col: any) => col.column_name);
                setExistingColumns(allCols);
                const textCols = tableInfo.filter((col: any) => ['text', 'varchar', 'char'].includes(col.data_type)).map((col: any) => col.column_name);
                setSearchableColumns(textCols);
            }
        } catch (e) { console.error("Lỗi Schema:", e); }
    }, [config.bangDuLieu]);

    // Tải dữ liệu chính
    // 🟢 Dùng useCallback để hàm này ổn định, không bị tạo mới liên tục
    const fetchData = useCallback(async (p = page, tab = 'ALL', kw = search) => {
        setLoading(true);
        try {
            // Sử dụng state itemsPerPage động
            const from = (p - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            
            let selectQuery = '*';
            if (config.bangDuLieu === 'nhan_su' && existingColumns.includes('id')) {
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

            if (kw.trim()) {
                const cols = searchableColumns.length > 0 ? searchableColumns : ['ho_ten', 'ten', 'email'];
                const validSearchCols = cols.filter(c => existingColumns.includes(c));
                const filterString = validSearchCols.map(col => `${col}.ilike.%${kw}%`).join(',');
                if (filterString) query = query.or(filterString);
            }

            const sortCol = existingColumns.includes('tao_luc') ? 'tao_luc' : (existingColumns.includes('id') ? 'id' : '');
            if (sortCol) query = query.order(sortCol, { ascending: false });

            query = query.range(from, to);

            const { data: res, count, error } = await query;
            if (error) throw error;

            const formatted = (res as any[])?.map((item: any) => {
                if (item.khach_hang && Array.isArray(item.khach_hang)) {
                    return { ...item, total_khach: item.khach_hang[0]?.count || 0 };
                }
                return item;
            });

            setData(formatted || []);
            setTotal(count || 0);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [page, search, itemsPerPage, config.bangDuLieu, existingColumns, groupByCol, extraFilter, searchableColumns]);

    // Init Effect
    useEffect(() => {
        if (isOpen && config.bangDuLieu) {
            fetchSchema().then(() => fetchData(1, 'ALL', ''));
        }
    }, [isOpen, config.bangDuLieu, fetchSchema, fetchData]);

    return {
        data, setData, loading, setLoading,
        search, setSearch, page, setPage, total,
        groupByCol, setGroupByCol,
        existingColumns, columns,
        fetchData, fetchSchema,
        ITEMS_PER_PAGE: itemsPerPage // Export biến này để UI sử dụng tính số trang
    };
};