export default function RecentCost() {
  const items = [
    { date: "27/10", name: "Phở bò tái", price: "35.000đ", paid: true },
    { date: "26/10", name: "Bún chả Hà Nội", price: "42.000đ", paid: true },
    { date: "25/10", name: "Cơm tấm sườn", price: "40.000đ", paid: false },
  ];

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="font-semibold mb-3">Chi phí gần đây</h2>

      {items.map((i, index) => (
        <div key={index} className="flex justify-between py-2 border-b last:border-none">
          <div>
            <p className="font-medium">{i.name}</p>
            <p className="text-sm text-gray-500">{i.date}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{i.price}</p>
            <p className={`text-xs ${i.paid ? "text-green-600" : "text-orange-500"}`}>
              {i.paid ? "Đã thanh toán" : "Chưa thanh toán"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
