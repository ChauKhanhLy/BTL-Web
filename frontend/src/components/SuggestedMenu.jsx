export default function SuggestedMenu() {
  const menus = [
    { name: "Cơm gà nướng sốt mật ong", kcal: 540, price: "45.000đ", tag: "Mới" },
    { name: "Cơm cuộn tổng hợp", kcal: 410, price: "55.000đ", tag: "Xem" },
    { name: "Salad ngũ cốc xanh", kcal: 300, price: "39.000đ" },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Món gợi ý cho bạn</h2>

      {menus.map((m, i) => (
        <div
          key={i}
          className="flex justify-between items-center border-b last:border-none py-3"
        >
          <div>
            <p className="font-medium">{m.name}</p>
            <span className="text-sm text-gray-500">{m.kcal} kcal</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-semibold">{m.price}</span>
            <button className="px-4 py-1 bg-green-700 text-white rounded-lg">
              {m.tag || "Đặt món"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
