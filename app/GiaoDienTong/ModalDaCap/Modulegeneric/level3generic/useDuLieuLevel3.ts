import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { CotHienThi, ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { mapSqlTypeToUiType, getLabelFromColumn } from './QuyTacMapCot';
import { VN_BANKS } from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/level3generic/DuLieuMacDinh';
import { layCauHinhNgoaiLe } from './CauHinhNgoaiLe';

const BUCKET_NAME = 'images';

export const useDuLieuLevel3 = (config: ModuleConfig, isOpen: boolean, initialData: any, userRole: string, userEmail: string = '') => {
    const [formData, setFormData] = useState<any>({});
    const [dynamicColumns, setDynamicColumns] = useState<CotHienThi[]>([]);
    const [orderedColumns, setOrderedColumns] = useState<CotHienThi[]>([]);
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    
    const isCreateMode = !initialData;
    const isOwner = formData?.email && userEmail && formData.email.trim().toLowerCase() === userEmail.trim().toLowerCase();
    
    // Lấy cấu hình ngoại lệ
    const { tableToQuery, excludeColsOnSave } = layCauHinhNgoaiLe(config.bangDuLieu, isCreateMode);

    // 1. Fetch Schema (Cấu trúc bảng)
    // 🟢 FIX: Dùng JSON.stringify(config.danhSachCot) làm dependency để tránh so sánh tham chiếu object gây loop
    const fetchSchema = useCallback(async () => {
        if (config.danhSachCot?.length) { 
            setOrderedColumns(config.danhSachCot); 
            return; 
        }

        const { data: tableInfo } = await supabase.rpc('get_table_schema', { t_name: config.bangDuLieu });
        const { data: dbConfig } = await supabase.from('cau_hinh_cot').select('*').eq('bang_du_lieu', config.bangDuLieu).order('thu_tu', { ascending: true });

        if (tableInfo) {
            const mappedCols = tableInfo
                .filter((col: any) => !['luong_theo_gio', 'lan_dang_nhap_ts', 'nguoi_tao', 'tao_luc', 'id'].includes(col.column_name))
                .map((col: any) => {
                    const colKey = col.column_name;
                    const setting = dbConfig?.find((c: any) => c.cot_du_lieu === colKey) || {};
                    const isSystemCol = ['id', 'tao_luc', 'updated_at', 'nguoi_tao'].includes(colKey) || setting.la_cot_he_thong === true;

                    return {
                        key: colKey, 
                        label: setting.tieu_de || getLabelFromColumn(colKey), 
                        kieuDuLieu: setting.loai_hien_thi || mapSqlTypeToUiType(col.data_type, colKey),
                        hienThiList: !setting.an_hien_thi, 
                        hienThiDetail: !setting.an_hien_thi, 
                        tuDong: isSystemCol,
                        readOnly: isSystemCol || setting.cho_phep_sua === false,
                        batBuoc: setting.bat_buoc_nhap === true || (col.is_nullable === 'NO' && !isSystemCol),
                        permRead: setting.quyen_xem || ['all'], 
                        permEdit: setting.quyen_sua || ['admin', 'quanly']
                    };
                });
            
            if (dbConfig?.length) {
                mappedCols.sort((a: any, b: any) => {
                    const idxA = dbConfig.findIndex((c: any) => c.cot_du_lieu === a.key);
                    const idxB = dbConfig.findIndex((c: any) => c.cot_du_lieu === b.key);
                    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
                });
            }
            setDynamicColumns(mappedCols); 
            setOrderedColumns(mappedCols);
        }
    }, [config.bangDuLieu, JSON.stringify(config.danhSachCot)]); 

    // 2. Load Data (Tải dữ liệu chi tiết)
    // 🟢 FIX: Chỉ phụ thuộc vào ID (initialData.id) thay vì toàn bộ object initialData
    const refreshData = useCallback(async () => {
        if (isCreateMode) { setFormData({}); return; }
        
        setFetching(true);
        // Query động dựa trên cấu hình ngoại lệ
        const { data } = await (supabase as any).from(tableToQuery).select('*').eq('id', initialData.id).single();
        
        if (data) setFormData(data);
        setFetching(false);
    }, [initialData?.id, tableToQuery, isCreateMode]);

    // 3. Upload Image
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploadingImg(true);
        try {
            const file = e.target.files[0];
            const filePath = `${Date.now()}_${file.name}`; 
            const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
            
            const imgCol = orderedColumns.find(c => ['hinh_anh', 'avatar'].includes(c.key)) || dynamicColumns.find(c => ['hinh_anh', 'avatar'].includes(c.key));
            if (imgCol) setFormData((p: any) => ({ ...p, [imgCol.key]: publicUrl }));
        } catch (err: any) { alert(`Lỗi tải ảnh: ${err.message}`); } finally { setUploadingImg(false); }
    };

    // 4. Load Options (Dữ liệu select box)
    useEffect(() => {
        const loadOpts = async (col: CotHienThi) => {
            const { data } = await (supabase as any).from(config.bangDuLieu).select(col.key).not(col.key, 'is', null);
            let opts = data ? Array.from(new Set(data.map((r: any) => r[col.key]))).filter(Boolean) as string[] : [];
            if (col.key.includes('ngan_hang')) opts = Array.from(new Set([...VN_BANKS, ...opts]));
            
            setDynamicOptions(p => ({ ...p, [col.key]: opts.sort() }));
        };
        const cols = orderedColumns.length ? orderedColumns : dynamicColumns;
        cols.forEach(col => { if (col.kieuDuLieu === 'select_dynamic') loadOpts(col); });
        
    // 🟢 FIX: Stringify mảng columns để tránh loop do thay đổi tham chiếu
    }, [JSON.stringify(orderedColumns), JSON.stringify(dynamicColumns), config.bangDuLieu]);

    // 5. Init Effect
    useEffect(() => { 
        if (isOpen) { 
            fetchSchema(); 
            refreshData(); 
        } 
    }, [isOpen, fetchSchema, refreshData]);

    return {
        formData, setFormData, loading, setLoading, fetching, uploadingImg,
        dynamicColumns, orderedColumns, setOrderedColumns, dynamicOptions, setDynamicOptions,
        handleImageUpload, isCreateMode, isOwner, excludeColsOnSave
    };
};