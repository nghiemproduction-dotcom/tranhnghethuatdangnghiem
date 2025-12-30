// Type definitions for form extensions
export interface FormExtensions {
  // Override toàn bộ form component
  customFormComponent?: React.ComponentType<any>;

  // Extension functions
  beforeSubmit?: (data: any, config: any) => Promise<any> | any;
  afterSubmit?: (data: any, config: any) => Promise<void> | void;
  customValidation?: (data: any, config: any) => { isValid: boolean; errors: Record<string, string> };
  customFieldRenderer?: (field: any, value: any, onChange: (value: any) => void, error?: string) => React.ReactNode;

  // Field-level customizations
  fieldOverrides?: Record<string, any>;

  // Table-specific logic
  onFormInit?: (formData: any, config: any) => any;
  onFormChange?: (field: string, value: any, formData: any, config: any) => any;
}