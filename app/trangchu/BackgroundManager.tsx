'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, RefreshCw, Smartphone, Monitor, Tablet, Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { compressImage } from '@/app/ThuVien/compressImage';

interface Props {
  onUpdate: () => void;
}

export default function BackgroundManager({ onUpdate }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [file, setFile] = useState<File | null>(null);
  
  // Trạng thái xử lý: 'idle' | 'compressing' | 'uploading' | 'waiting' | 'done'
  const [status, setStatus] = useState<string>('idle'); 

  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('USER_ROLE') : '';
    if (role === 'admin' || role === 'quan_ly') setIsAdmin(true);
  }, []);

  if (!isAdmin) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Vui lòng chọn ảnh!");
    
    try {
      setStatus('compressing');

      // 1. Xác định tên file chuẩn (Hardcode)
      let targetFileName = '';
      let maxWidth = 1920;

      if (deviceType === 'desktop') {
        targetFileName = 'trangchu-desktop.jpg';
        maxWidth = 1920;
      } else if (deviceType === 'tablet') {
        targetFileName = 'trangchu-tablet.jpg';
        maxWidth = 1024;
      } else {
        targetFileName = 'trangchu-mobile.jpg';
        maxWidth = 800;
      }

      // 2. Nén ảnh
      const compressedBlob = await compressImage(file, 0.8, maxWidth);

      // 3. Tái tạo file với tên chuẩn (để đảm bảo đổi tên đúng)
      const finalFile = new File([compressedBlob], targetFileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      setStatus('uploading');

      // 4. Upload lên Supabase (Ghi đè - Upsert)
      const { data, error } = await supabase.storage
        .from('hinh-nen')
        .upload(targetFileName, finalFile, {
          cacheControl: '0', // Yêu cầu không cache
          upsert: true       // Bắt buộc ghi đè
        });

      if (error) throw error;

      // 5. QUAN TRỌNG: Chờ server đồng bộ (Propagation Delay)
      setStatus('waiting');
      
      // Đợi 2.5 giây để CDN Supabase kịp cập nhật file mới
      setTimeout(() => {
          setStatus('done');
          alert("Cập nhật thành công!");
          setIsOpen(false);
          setFile(null);
          setStatus('idle');
          
          // Lúc này mới báo cho trang chủ load lại ảnh
          onUpdate(); 
      }, 2500);

    } catch (err: any) {
      console.error(err);
      alert("Lỗi upload: " + err.message);
      setStatus('idle');
    }
  };

  // Helper để hiển thị text trạng thái
  const getStatusText = () => {
      switch(status) {
          case 'compressing': return 'Đang nén ảnh...';
          case 'uploading': return 'Đang tải lên...';
          case 'waiting': return 'Đang đồng bộ...';
          case 'done': return 'Hoàn tất!';
          default: return 'Lưu Thay Đổi';
      }
  };

  return (
    <div className="fixed bottom-36 left-6 z-[200] flex flex-col items-start gap-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#C69C6D] flex items-center justify-center hover:bg-[#C69C6D] hover:text-black transition-all shadow-lg"
        title="Đổi hình nền (Admin)"
      >
        <ImageIcon size={20} />
      </button>

      {isOpen && (
        <div className="bg-black/90 border border-[#C69C6D] p-4 rounded-lg shadow-2xl w-64 animate-fade-in-up flex flex-col gap-3">
          <h4 className="text-[#C69C6D] text-xs font-bold uppercase border-b border-white/10 pb-2 mb-1">
            Cập nhật hình nền
          </h4>

          <div className="flex gap-1 bg-white/10 p-1 rounded">
            <button onClick={() => setDeviceType('desktop')} className={`flex-1 p-1.5 rounded flex justify-center ${deviceType === 'desktop' ? 'bg-[#C69C6D] text-black' : 'text-white hover:bg-white/10'}`} title="Desktop">
                <Monitor size={14} />
            </button>
            <button onClick={() => setDeviceType('tablet')} className={`flex-1 p-1.5 rounded flex justify-center ${deviceType === 'tablet' ? 'bg-[#C69C6D] text-black' : 'text-white hover:bg-white/10'}`} title="Tablet">
                <Tablet size={14} />
            </button>
            <button onClick={() => setDeviceType('mobile')} className={`flex-1 p-1.5 rounded flex justify-center ${deviceType === 'mobile' ? 'bg-[#C69C6D] text-black' : 'text-white hover:bg-white/10'}`} title="Mobile">
                <Smartphone size={14} />
            </button>
          </div>

          <input type="file" accept="image/*" onChange={handleFileChange} className="text-[10px] text-white file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#C69C6D] file:text-black hover:file:bg-white cursor-pointer" />

          <button 
            onClick={handleUpload} 
            disabled={status !== 'idle'}
            className="bg-[#C69C6D] text-black text-xs font-bold py-2 rounded flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status !== 'idle' ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14} />}
            {getStatusText()}
          </button>
          
          <div className="text-[9px] text-gray-400 italic text-center">
            *Hệ thống sẽ tự động nén & đổi tên file chuẩn.
          </div>
        </div>
      )}
    </div>
  );
}