import { ReactNode } from 'react'

export default function PhongLamViecLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    // ✅ FIX: Xóa hết padding, max-width. Để w-full h-full để tràn màn hình.
    <div className="w-full h-full bg-[#050505] text-white overflow-hidden">
      <main className="w-full h-full">
        {children}
      </main>
    </div>
  )
}