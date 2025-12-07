export default function Feedback() {
  return (
    <div className="mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
      <h2 className="font-semibold mb-4">Phản ánh chất lượng</h2>

      <div className="flex justify-between py-3 border-b">
        <div>
          <p className="font-medium">Suất 27/10 – Cơm hơi nguội</p>
          <p className="text-sm text-gray-500">Đã xử lý</p>
        </div>
        <button className="bg-green-700 hover:bg-green-600 text-white px-4 py-1 rounded-lg">
          Gửi thêm
        </button>
      </div>

      <div className="flex justify-between py-3">
        <div>
          <p className="font-medium">Suất 25/10 – Mặn</p>
          <p className="text-sm text-gray-500">Đã phản hồi</p>
        </div>
        <button className="bg-green-700 hover:bg-green-600 text-white px-4 py-1 rounded-lg">
          Gửi thêm
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Cảm ơn bạn đã giúp cải thiện chất lượng bữa ăn.
      </p>
    </div>
  );
}
