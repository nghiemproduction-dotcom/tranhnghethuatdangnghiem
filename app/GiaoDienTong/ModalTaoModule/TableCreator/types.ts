export interface ColumnDef {
    id: string;
    name: string;
    type: string;
    isPk: boolean;
    isRequired: boolean;
    defaultValue: string;
    permRead: string[];
    permEdit: string[];
    permDelete: string[];
    logicCode?: string;
}