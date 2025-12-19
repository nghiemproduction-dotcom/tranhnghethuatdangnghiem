export interface CotHienThi {
  key: string;       
  label: string;     
  
  // Các kiểu dữ liệu (Supabase + Custom)
  // text, number, date, boolean, select_dynamic, link_array, image, user_ref, status_ref...
  kieuDuLieu: string; 
  
  hienThiList: boolean; 
  hienThiDetail: boolean; 
  
  // Ràng buộc
  batBuoc?: boolean; 
  tuDong?: boolean;  
  
  // Logic Mở Rộng (AppSheet Style)
  defaultValue?: any;   
  linkedTable?: string; // Liên kết bảng (Ref)
  options?: string[];   // Enum
  
  // 🟢 PHÂN QUYỀN CHI TIẾT (MỚI - 3 Cột riêng biệt)
  quyenXem?: string[];   // Danh sách vị trí được phép XEM (Read)
  quyenSua?: string[];   // Danh sách vị trí được phép SỬA (Update)
  quyenXoa?: string[];   // Danh sách vị trí được phép XÓA (Delete) - Thường áp dụng cho row, nhưng cứ để ở col cho đồng bộ cấu trúc
  
  // 🟢 LOGIC CODE (MỚI)
  logicCode?: string;    // Mã kiểm tra (Validate) hoặc công thức tính toán (Formula)
}

export interface ModuleConfig {
  id: string;
  tenModule: string;  
  
  // Phân loại Module
  moduleType?: 'generic' | 'custom';
  customId?: string; 

  // Dữ liệu
  bangDuLieu: string; 
  
  // Layout
  doRong?: number;    
  doCao?: number;
  rowId?: string;      
  rowHeight?: number;  
  page_id?: string; 

  // Cấu hình Widget (Lớp 1)
  viewType?: 'list' | 'chart' | 'stat'; 
  widgetData?: {
      chartType?: 'Bar' | 'Line' | 'Pie';
      displayFields?: string[]; 
      labelField?: string;
      valueField?: string;
  };

  // Cấu hình Danh Sách (Lớp 2)
  kieuHienThiList?: 'table' | 'card' | 'kanban';
  
  // Cấu hình mở rộng danh sách
  listConfig?: {
      columns?: string[]; 
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
  };
  
  // Quyền hạn chi tiết (Lớp 3) - Cái này là quyền chung của module, còn quyền từng cột nằm trong danhSachCot
  quyenAdminDetail?: string[]; // ['edit', 'delete', 'history']

  danhSachCot: CotHienThi[];
  
  version: string;
  updatedAt: string;
}