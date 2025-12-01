export default function MealSummary() {
  return (
    <div className="grid grid-cols-3 p-4 bg-white rounded-xl shadow">
      <div>
        <p className="text-gray-500 text-sm">Số suất đã đặt (tuần)</p>
        <p className="text-xl font-bold">12</p>
      </div>
      <div>
        <p className="text-gray-500 text-sm">Chi phí (tuần)</p>
        <p className="text-xl font-bold">560.000đ</p>
      </div>
      <div>
        <p className="text-gray-500 text-sm">Điểm hài lòng</p>
        <p className="text-xl font-bold">4.6/5</p>
      </div>
    </div>
  );
}
