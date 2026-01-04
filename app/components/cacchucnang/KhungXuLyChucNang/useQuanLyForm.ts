// app/components/KhungXuLyChucNang/useQuanLyForm.ts
import { useState } from 'react';

export function useQuanLyForm<T>(dataSource: any, onSuccess: () => void) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<T>>({});
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = (item?: T) => {
        setFormData(item ? { ...item } : {});
        setIsOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Tự động phân biệt Create hay Update
            if ((formData as any).id) {
                await dataSource.update((formData as any).id, formData);
            } else {
                await dataSource.create(formData);
            }
            onSuccess(); // Refresh list
            setIsOpen(false);
        } catch (e) {
            console.error(e);
            alert("Lỗi lưu dữ liệu");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isOpen,
        close: () => setIsOpen(false),
        open: handleOpen,
        formData,
        setFormData,
        save: handleSave,
        isSaving
    };
}