export default function OrderHistory({ orders }) {
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div
          key={o.id}
          className="border rounded-xl p-4 bg-white flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">
              Đơn #{o.id}
            </p>
            <p className="text-sm text-gray-500">
              Tổng tiền: {o.price.toLocaleString()}đ
            </p>
          </div>

          {/* 👇 CHÍNH XÁC LÀ CHỖ NÀY */}
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold
              ${
                o.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }
            `}
          >
            {o.status === "completed"
              ? "Đã thanh toán"
              : "Chờ thanh toán"}
          </span>
        </div>
      ))}
    </div>
  );
}
