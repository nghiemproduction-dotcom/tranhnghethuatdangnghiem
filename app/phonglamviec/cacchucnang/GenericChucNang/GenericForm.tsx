'use client'
import { useState, useEffect } from 'react'
import { FieldConfig } from '@/app/types/core'
import { Save, ArrowLeft, PenTool, PlusCircle, AlertCircle, Upload, X as XIcon, RotateCcw, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { compressImage } from '@/lib/compressImage' // Đảm bảo file này tồn tại

interface GenericFormProps {
  fields: FieldConfig[]
  initialData?: any
  isEditing: boolean
  onSave: (data: any) => void
  onCancel: () => void
}

export default function GenericForm({ fields, initialData, isEditing, onSave, onCancel }: GenericFormProps) {
  const [formData, setFormData] = useState(initialData || {})
  // State để track xem field nào đang được upload ảnh
  const [uploadingField, setUploadingField] = useState<string | null>(null); 
  const supabase = createClient();

  useEffect(() => { setFormData(initialData || {}) }, [initialData])

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  // --- HÀM UPLOAD ẢNH TRỰC TIẾP ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          setUploadingField(fieldKey);
          
          // 1. Nén ảnh (giảm dung lượng server)
          const compressedFile = await compressImage(file, 0.8, 1200);
          
          // 2. Tạo tên file unique
          const fileExt = compressedFile.name.split('.').pop();
          const fileName = `generic_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const bucketName = 'avatar'; // Đảm bảo bucket 'avatar' đã tạo trên Supabase và set Public
          
          // 3. Upload lên Supabase
          const { error: uploadError } = await supabase.storage
              .from(bucketName)
              .upload(fileName, compressedFile, { cacheControl: '3600', upsert: false });

          if (uploadError) throw uploadError;

          // 4. Lấy Public URL
          const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);

          // 5. Cập nhật URL vào form data
          handleChange(fieldKey, publicUrl);

      } catch (error: any) {
          alert(`Lỗi upload ảnh: ${error.message}`);
      } finally {
          setUploadingField(null);
          // Reset input để cho phép chọn lại cùng 1 file nếu muốn
          e.target.value = '';
      }
  }

  const handleReset = () => { setFormData(isEditing ? initialData : {}) }

  const inputStyle = "w-full bg-[#111] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-[#C69C6D] focus:shadow-[0_0_15px_rgba(198,156,109,0.15)] transition-all placeholder:text-gray-700 font-medium"
  const labelStyle = "text-[10px] uppercase font-bold text-gray-500 mb-2 ml-1 tracking-wider flex items-center gap-1"

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white animate-in slide-in-from-bottom-5 duration-300">
       {/* HEADER */}
       <div className="shrink-0 h-[60px] flex items-center justify-between px-6 bg-[#0a0a0a] border-b border-white/5 relative z-20">
          <div className="flex items-center gap-4">
             <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded bg-[#111] text-gray-400 hover:text-white hover:bg-[#222] border border-white/10 transition-all"><ArrowLeft size={18}/></button>
             <div className="h-6 w-[1px] bg-white/10" />
             <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${isEditing ? 'bg-[#C69C6D]/10 text-[#C69C6D]' : 'bg-green-500/10 text-green-500'}`}>
                     {isEditing ? <PenTool size={18} /> : <PlusCircle size={18} />}
                 </div>
                 <div>
                     <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">{isEditing ? 'HIỆU CHỈNH DỮ LIỆU' : 'THÊM MỚI DỮ LIỆU'}</h2>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em] mt-1">{isEditing ? 'Update Entry' : 'New Entry'}</p>
                 </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleReset} className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1a1a1a] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Reset Form"><RotateCcw size={16}/></button>
             <button onClick={() => onSave(formData)} className="flex items-center gap-2 px-6 py-2 bg-[#C69C6D] hover:bg-[#e0b88a] text-black font-black text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(198,156,109,0.3)] active:scale-95 tracking-widest uppercase border border-[#C69C6D]">
                 <Save size={16} strokeWidth={3}/> LƯU LẠI
             </button>
          </div>
       </div>

       {/* FORM CONTENT */}
       <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
         <div className="max-w-5xl mx-auto">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-[#C69C6D]/5 to-transparent pointer-events-none rounded-full blur-3xl"/>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 relative z-10">
                {fields.filter(f => f.showInForm !== false).map((field) => (
                <div key={field.key} className={`flex flex-col group ${field.type === 'textarea' || field.type === 'image' ? 'col-span-full md:col-span-2 lg:col-span-1' : ''}`}>
                    <label className={labelStyle}>
                        {field.label} {field.required && <AlertCircle size={10} className="text-red-500 ml-1" />}
                    </label>
                    
                    {/* --- XỬ LÝ CÁC LOẠI INPUT --- */}
                    
                    {/* TYPE: SELECT */}
                    {field.type === 'select' ? (
                        <div className="relative">
                            <select 
                                value={formData[field.key] || ''} 
                                onChange={(e) => handleChange(field.key, e.target.value)} 
                                className={`${inputStyle} appearance-none cursor-pointer`}
                            >
                                <option value="" className="bg-[#111] text-gray-500">-- Chọn giá trị --</option>
                                {field.options?.map((opt: any) => (
                                    <option key={opt.value} value={opt.value} className="bg-[#111] text-gray-200 py-2">{opt.label}</option>
                                ))}
                            </select>
                            {/* Icon mũi tên tùy chỉnh */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </div>
                    
                    ) : field.type === 'textarea' ? (
                        <textarea 
                            rows={5} 
                            value={formData[field.key] || ''} 
                            onChange={(e) => handleChange(field.key, e.target.value)} 
                            className={`${inputStyle} resize-none`} 
                            placeholder={field.placeholder || `Nhập ${field.label}...`} 
                        />
                    
                    ) : field.type === 'image' ? (
                        // [NÂNG CẤP] UI UPLOAD ẢNH
                        <div className={`relative p-4 bg-[#1a1a1a] border border-dashed ${uploadingField === field.key ? 'border-[#C69C6D] bg-[#C69C6D]/5' : 'border-white/20 hover:border-[#C69C6D]'} rounded-lg transition-all group/img`}>
                             {formData[field.key] ? (
                                 // Trường hợp ĐÃ CÓ ẢNH
                                 <div className="relative w-full aspect-square md:aspect-video rounded overflow-hidden bg-black flex items-center justify-center border border-white/10">
                                     <img src={formData[field.key]} alt="Preview" className="h-full w-full object-contain" />
                                     
                                     {/* Nút xóa ảnh */}
                                     <button 
                                        onClick={() => handleChange(field.key, '')} 
                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded shadow-lg hover:bg-red-700 transition-colors z-10"
                                        title="Xóa ảnh"
                                     >
                                        <XIcon size={14}/>
                                     </button>
                                     <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-center text-[10px] text-gray-300">
                                         {field.label} hiện tại
                                     </div>
                                 </div>
                             ) : (
                                 // Trường hợp CHƯA CÓ ẢNH
                                 <div 
                                    className="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer" 
                                    onClick={() => !uploadingField && document.getElementById(`file-${field.key}`)?.click()}
                                 >
                                     <div className={`p-4 rounded-full transition-all ${uploadingField === field.key ? 'bg-[#C69C6D]/20' : 'bg-white/5 group-hover/img:bg-[#C69C6D] group-hover/img:text-black'}`}>
                                         {uploadingField === field.key ? <Loader2 size={24} className="text-[#C69C6D] animate-spin"/> : <Upload size={24} />}
                                     </div>
                                     <div className="text-center">
                                         <div className={`text-xs font-bold uppercase tracking-wider ${uploadingField === field.key ? 'text-[#C69C6D]' : 'text-gray-400 group-hover/img:text-white'}`}>
                                             {uploadingField === field.key ? 'Đang tải lên...' : 'Tải ảnh lên'}
                                         </div>
                                         <div className="text-[10px] text-gray-600 mt-1">Hỗ trợ JPG, PNG (Max 5MB)</div>
                                     </div>
                                 </div>
                             )}
                             
                             {/* Input ẩn để chọn file */}
                             <input 
                                id={`file-${field.key}`}
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleImageUpload(e, field.key)}
                                disabled={uploadingField === field.key} // Khóa khi đang upload
                             />
                        </div>
                    
                    ) : field.type === 'date' ? (
                         <input 
                            type="date" 
                            value={formData[field.key] ? String(formData[field.key]).split('T')[0] : ''} 
                            onChange={(e) => handleChange(field.key, e.target.value)} 
                            className={inputStyle} 
                         />
                    
                    ) : (
                        // TYPE: TEXT / NUMBER
                        <input 
                            type={field.type === 'number' ? 'number' : 'text'} 
                            value={formData[field.key] || ''} 
                            onChange={(e) => handleChange(field.key, e.target.value)} 
                            className={inputStyle} 
                            placeholder={field.placeholder || `Nhập ${field.label}...`} 
                        />
                    )}
                </div>
                ))}
            </div>
            <div className="h-24" /> {/* Spacer bottom */}
         </div>
       </div>
    </div>
  )
}