// Đường dẫn: ThanhPhan/NutBam/NutChinh.tsx
export default function NutChinh({ tenNut }: { tenNut: string }) {
  return (
    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      {tenNut}
    </button>
  );
}