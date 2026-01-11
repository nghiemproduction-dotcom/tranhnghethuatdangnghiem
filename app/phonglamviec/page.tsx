import { Suspense } from 'react'
import { getDsNhanSu } from '@/app/phonglamviec/cacchucnang/nhansu/dal' 
// [SỬA LỖI] Thay vì gọi getDynamicFeatures (chưa có), ta gọi 2 hàm có sẵn này để tự quét
import { fetchExistingFeatures, loadFeatureMeta } from '@/app/phonglamviec/TaoChucNang/generator' 
import PhongLamViecClient from './PhongLamViecClient'
import Loading from './loading' 

async function PhongLamViecContainer() {
  // 1. Fetch dữ liệu tĩnh (Nhân sự) - Chức năng cốt lõi
  const nhanSuData = await getDsNhanSu();
  
  // 2. Fetch danh sách chức năng động (Logic thay thế cho getDynamicFeatures)
  // Bước A: Lấy danh sách tên các folder chức năng
  const folders = await fetchExistingFeatures();
  
  // Bước B: Lặp qua từng folder để đọc file cấu hình meta.json
  const dynamicFeatures = [];
  if (folders && folders.length > 0) {
      for (const folder of folders) {
          // Hàm này đã có sẵn trong generator.ts của bạn
          const meta = await loadFeatureMeta(folder);
          if (meta) {
              dynamicFeatures.push({
                  id: folder, // ID chính là tên folder
                  ...meta     // Gộp các thông tin như label, tableName, columns...
              });
          }
      }
  }

  return (
    <PhongLamViecClient 
      nhanSuData={nhanSuData} 
      dynamicFeatures={dynamicFeatures} 
    />
  )
}

export default function PhongLamViecPage() {
  return (
    <div className="w-full h-full bg-[#050505]">
      <Suspense fallback={<Loading />}>
        <PhongLamViecContainer />
      </Suspense>
    </div>
  )
}