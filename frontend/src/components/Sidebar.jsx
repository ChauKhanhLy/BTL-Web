export default function Sidebar() {
  return (
    <div className="w-64 bg-green-900 text-white p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Orion</h1>

      <nav className="flex flex-col gap-3 text-lg">
        <button className="text-left hover:text-green-300">Thống kê ăn & chi phí</button>
        <button className="text-left hover:text-green-300">Trang menu</button>
        <button className="text-left hover:text-green-300">Giỏ hàng</button>
        <button className="text-left hover:text-green-300">Phản ánh chất lượng</button>
      </nav>

      <div className="mt-auto text-sm opacity-70">
        Mẹo nhanh: Đặt món trước 9:30 để đảm bảo suất ăn của bạn.
      </div>
    </div>
  );
}
