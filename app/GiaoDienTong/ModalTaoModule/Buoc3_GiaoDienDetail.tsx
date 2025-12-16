import React from 'react';
import { FileText, Settings, ShieldAlert, Printer, History } from 'lucide-react';

export default function Buoc3_GiaoDienDetail({ config, setConfig }: any) {

  // Các quyền hạn trong trang chi tiết
  const detailActions = [
    { id: 'edit', label: 'Cho phép Sửa', icon: <Settings size={18}/> },
    { id: 'delete', label: 'Cho phép Xóa', icon: <ShieldAlert size={18}/> },
    { id: 'print', label: 'In ấn (Print)', icon: <Printer size={18}/> },
    { id: 'history', label: 'Xem lịch sử (Log)', icon: <History size={18}/> },
  ];

  const toggleDetailPerm = (permId: string) => {
    const currentPerms = config.quyenAdminDetail || [];
    if (currentPerms.includes(permId)) {
      setConfig({ ...config, quyenAdminDetail: currentPerms.filter((p: string) => p !== permId) });
    } else {
      setConfig({ ...config, quyenAdminDetail: [...currentPerms, permId] });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-300">
      
      <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-xl flex items-start gap-4">
        <div className="p-3 bg-blue-600 rounded-lg text-white">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-blue-100">Cấu hình Trang Chi Tiết</h3>
          <p className="text-sm text-blue-200/70 mt-1">
            Đây là giao diện sẽ hiện ra khi người dùng nhấp vào một dòng trong danh sách.
            Hệ thống sẽ tự động tạo form dựa trên các cột dữ liệu bạn đã chọn ở Bước 1.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-400 uppercase">Các hành động cho phép</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {detailActions.map((action) => {
            const isChecked = (config.quyenAdminDetail || []).includes(action.id);
            return (
              <button
                key={action.id}
                onClick={() => toggleDetailPerm(action.id)}
                className={`flex items-center justify-between px-6 py-4 rounded-xl border transition-all
                  ${isChecked 
                    ? 'bg-[#333] border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                    : 'bg-[#252526] border-white/10 opacity-60 hover:opacity-100'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isChecked ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    {action.icon}
                  </div>
                  <span className={`font-bold ${isChecked ? 'text-white' : 'text-gray-400'}`}>
                    {action.label}
                  </span>
                </div>
                
                {/* Toggle Switch UI */}
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isChecked ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview giả lập (Optional) */}
      <div className="mt-8 pt-8 border-t border-white/10 text-center opacity-50">
        <p className="text-xs text-gray-500 italic">
          * Form chi tiết sẽ tự động Responsive và sắp xếp layout thông minh dựa trên kiểu dữ liệu.
        </p>
      </div>

    </div>
  );
}