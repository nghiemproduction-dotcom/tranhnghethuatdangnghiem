export interface CustomAction {
    id: string;
    label: string;
    icon: string;
    color: string;
    location: 'widget' | 'list_header' | 'row_action' | 'detail_footer'; 
    actionType: 'update_status' | 'delete' | 'custom';
    targetField: string; 
    targetValue: string; 
}

export interface ModuleConfig {
    id: string;
    title: string;
    tableName: string; 
    icon?: string;
    
    // Widget Config
    viewType: 'list' | 'chart' | 'kanban' | 'metric' | 'bar' | 'button_circle' | 'button_rect' | 'button_triangle';
    
    // 🟢 MỚI: Cấu hình chi tiết cho Widget
    chartLabelColumn?: string; // Cột Nhãn (Trục X hoặc Tên phần)
    chartDataColumn?: string;  // Cột Dữ liệu (Trục Y hoặc Giá trị)
    
    // Modal Config
    modalViewType?: 'table' | 'gallery' | 'kanban'; 
    imageColumn?: string; 
    
    // Data Filter
    filterColumn?: string; 
    filterValue?: string;  
    groupByColumn?: string; // Dùng cho Kanban hoặc Chart đơn giản
    
    displayColumns?: string[]; // Các cột hiển thị chung
    customActions?: CustomAction[];
}