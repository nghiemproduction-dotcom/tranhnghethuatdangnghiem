export interface CotHienThi {
  key: string;       
  label: string;     
  
  // Các kiểu dữ liệu
  kieuDuLieu: string; 
  
  hienThiList: boolean; 
  hienThiDetail: boolean; 
  
  // Ràng buộc
  batBuoc?: boolean; 
  tuDong?: boolean;  
  readOnly?: boolean; // Cấm sửa tuyệt đối (cho ID, Công thức)
  
  // Logic Mở Rộng
  defaultValue?: any;   
  linkedTable?: string; 
  
  // FORM THÔNG MINH
  options?: string[];           
  allowNewOption?: boolean;     
  formatType?: 'currency' | 'percent' | 'phone' | 'email' | 'link' | 'location' | 'capitalize'; 
  inputMultiplier?: number;     
  computedCode?: string;        
  
  // PHÂN QUYỀN
  permRead?: string[];   
  permEdit?: string[];   
  
  // Logic Code cũ
  logicCode?: string;    

  // Ref
  isRef?: boolean;          
  refTable?: string;        
  isPartOf?: boolean;       
}

export interface VirtualColumn {
  key: string;
  label: string;
  type: 'related_list' | 'formula';
  targetTable: string;      
  matchColumn: string;      
}

export interface ModuleConfig {
  id: string;
  tenModule: string;  
  moduleType?: 'generic' | 'custom';
  customId?: string; 
  bangDuLieu: string; 
  
  // Layout
  doRong?: number;    
  doCao?: number;
  rowId?: string;      
  rowHeight?: number;  
  page_id?: string; 

  // Widget
  viewType?: 'list' | 'chart' | 'stat'; 
  widgetData?: {
      chartType?: 'Bar' | 'Line' | 'Pie' | 'Area';
      displayFields?: string[]; 
      labelField?: string;
      valueField?: string;
      relations?: {
          sourceCol: string;
          targetTable: string;
          targetCol: string;
          type: string;
      }[];
  };

  // List Config
  kieuHienThiList?: 'table' | 'card' | 'kanban';
  listConfig?: {
      columns?: string[]; 
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
      gridCols?: number;
      groupByColumn?: string; 
      showAllTab?: boolean;   
  };
  
  quyenAdminDetail?: string[]; 
  virtualColumns?: VirtualColumn[]; 
  danhSachCot: CotHienThi[];
  
  version: string;
  updatedAt: string;
}