export interface CotHienThi {
  key: string;       
  label: string;     
  kieuDuLieu: string; 
  hienThiList: boolean; 
  hienThiDetail: boolean; 
  
  // 🟢 THÊM MỚI: Ràng buộc dữ liệu
  batBuoc?: boolean; // Bắt buộc nhập (Not Null)
  tuDong?: boolean;  // Tự động sinh (VD: id, created_at) -> Ẩn khi thêm mới, Disable khi sửa
}

export interface ModuleConfig {
  id: string;
  tenModule: string;  
  bangDuLieu: string; 
  doRong?: number;    
  doCao?: number;

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