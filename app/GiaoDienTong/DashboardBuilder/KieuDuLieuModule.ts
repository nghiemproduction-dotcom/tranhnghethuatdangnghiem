export interface CotHienThi {
  key: string;       
  label: string;     
  kieuDuLieu: string; 
  hienThiList: boolean; 
  hienThiDetail: boolean; 
  batBuoc?: boolean; 
  tuDong?: boolean;  
  readOnly?: boolean; 
  defaultValue?: any;   
  linkedTable?: string; 
  options?: string[];           
  allowNewOption?: boolean;     
  formatType?: 'currency' | 'percent' | 'phone' | 'email' | 'link' | 'location' | 'capitalize'; 
  inputMultiplier?: number;     
  computedCode?: string;        
  permRead?: string[];   
  permEdit?: string[];   
  logicCode?: string;    
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

export interface FormExtensions {
  // Override toàn bộ form component
  customFormComponent?: React.ComponentType<any>;

  // Extension functions
  beforeSubmit?: (data: any, config: ModuleConfig) => Promise<any> | any;
  afterSubmit?: (data: any, config: ModuleConfig) => Promise<void> | void;
  customValidation?: (data: any, config: ModuleConfig) => { isValid: boolean; errors: Record<string, string> };
  customFieldRenderer?: (field: CotHienThi, value: any, onChange: (value: any) => void, error?: string) => React.ReactNode;

  // Field-level customizations
  fieldOverrides?: Record<string, Partial<CotHienThi> & {
    customRenderer?: (value: any, onChange: (value: any) => void, error?: string) => React.ReactNode;
    customValidation?: (value: any) => string;
  }>;

  // Table-specific logic
  onFormInit?: (formData: any, config: ModuleConfig) => any;
  onFormChange?: (field: string, value: any, formData: any, config: ModuleConfig) => any;
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

  // 🟢 CẬP NHẬT: Thêm các viewType mới
  viewType?: 'list' | 'chart' | 'stat' | 'button' | 'direct_l2' | 'direct_l3'; 
  
  // Widget Config
  widgetData?: {
      chartType?: 'Bar' | 'Line' | 'Pie' | 'Donut' | 'Area';
      displayFields?: string[]; 
      labelField?: string;
      valueField?: string;
      
      groupBy?: string;    
      titleField?: string; 
      subField?: string;   

      // Cấu hình cho Button Widget
      buttonLabel?: string;
      buttonColor?: string;
      buttonIcon?: string;

      relations?: {
          sourceCol: string;
          targetTable: string;
          targetCol: string;
          type: string;
      }[];
      
      [key: string]: any; 
  };

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
  
  // 🟢 EXTENSIONS: Hỗ trợ customization cho từng bảng
  formExtensions?: FormExtensions;
  
  version: string;
  updatedAt: string;
}