// Ví dụ cách dùng (Không cần copy vào file, chỉ để minh họa)
/*
import ThanhTieuDe from './Giaodien/ThanhTieuDe';
import ThanhDieuHuong from './Giaodien/ThanhDieuHuong';
import NoidungModal from './Giaodien/NoidungModal';
import NutModal from './Giaodien/NutModal';

export default function ModalDaCap(...) {
  return (
    <div className="fixed inset-0 z-[2000] bg-[#0a0807] flex flex-col">
       <ThanhTieuDe tieuDe="CHI TIẾT NHÂN SỰ" />
       <ThanhDieuHuong danhSachCap={...} />
       
       <div className="flex-1 relative overflow-hidden flex flex-col">
          <NoidungModal>
             {children}
          </NoidungModal>
          
          <NutModal danhSachTacVu={[
             { id: 'add', icon: Plus, nhan: 'Thêm mới', onClick: ... },
             { id: 'save', icon: Save, nhan: 'Lưu lại', onClick: ... }
          ]} />
       </div>
    </div>
  )
}
*/