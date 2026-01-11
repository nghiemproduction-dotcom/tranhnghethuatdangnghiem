export default function Loading() {
  return (
    // 1. Nền đen trùng màu app (#050505)
    <div className="w-full h-full bg-[#050505] p-6 space-y-6 overflow-hidden">
      
      {/* Header Skeleton (Màu tối) */}
      <div className="flex justify-between items-center">
         <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
         <div className="flex gap-2">
            <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
            <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
         </div>
      </div>
      
      {/* Grid Skeleton (Giống hệt GenericList) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            // 2. Card màu đen (#111), viền mờ, animate-pulse nhẹ
            className="h-[140px] bg-[#111] rounded-lg border border-white/5 p-4 animate-pulse flex flex-col justify-between"
          >
            <div className="flex items-center gap-4">
               {/* Avatar tròn */}
               <div className="w-12 h-12 rounded-full bg-white/5" />
               <div className="space-y-2 flex-1">
                  {/* Dòng text */}
                  <div className="h-3 w-3/4 bg-white/10 rounded" />
                  <div className="h-2 w-1/2 bg-white/5 rounded" />
               </div>
            </div>
            
            {/* Footer card */}
            <div className="flex justify-between mt-4">
                <div className="h-4 w-12 bg-white/5 rounded" />
                <div className="h-4 w-12 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}