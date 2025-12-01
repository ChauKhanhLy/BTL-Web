export default function Cart() {
  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="font-semibold mb-3">Giỏ hàng</h2>

      <div className="flex justify-between py-2">
        <p>Bún bò Huế</p>
        <span>38.000đ</span>
      </div>

      <div className="flex justify-between py-2">
        <p>Cơm sườn bí chả</p>
        <span>46.000đ</span>
      </div>

      <div className="flex justify-between border-t pt-3 mt-2 font-semibold">
        <span>Tổng:</span>
        <span>84.000đ</span>
      </div>

      <div className="flex gap-3 mt-3">
        <button className="flex-1 bg-gray-200 py-2 rounded-lg">Xem giỏ</button>
        <button className="flex-1 bg-green-700 text-white py-2 rounded-lg">
          Thanh toán
        </button>
      </div>
    </div>
  );
}
