export interface CotHienThi {
  key: string;       
  label: string;     
  kieuDuLieu: string; 
  hienThiList: boolean; 
  hienThiDetail: boolean; 
  
  // 🟢 LEVEL 3: Ràng buộc dữ liệu (Validation)
  batBuoc?: boolean; // Bắt buộc nhập (Not Null)
  tuDong?: boolean;  // Tự động sinh (VD: id, created_at) -> Ẩn khi thêm mới
}

export interface ModuleConfig {
  id: string;
  tenModule: string;  
  bangDuLieu: string; 
  
  // Layout
  doRong?: number;    
  doCao?: number;
  
  // 🟢 MENU: Phân biệt trang (Trang chủ, Nhân sự,...)
  page_id?: string; 

  // Cấu hình Widget (Level 1)
  viewType?: 'list' | 'chart' | 'stat'; 
  widgetData?: {
      chartType?: 'Bar' | 'Line' | 'Pie';
      displayFields?: string[]; 
      labelField?: string;
      valueField?: string;
  };

  // Cấu hình Danh Sách (Level 2)
  kieuHienThiList?: 'table' | 'card' | 'kanban';
  listConfig?: {
      columns?: string[]; 
  };

  danhSachCot: CotHienThi[];
  
  version: string;
  updatedAt: string;
}