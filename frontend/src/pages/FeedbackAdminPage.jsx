import React, { useState, useEffect } from "react";
import { CheckCircle, Send, Bell } from "lucide-react";
import feedbackService from "../services/feedbackService";

export default function FeedbackAdminPage() {
    const [selectedId, setSelectedId] = useState(1);

    const feedbacks = [
        {
            id: 1,
            title: "Thanh toán thất bại khi dùng mã khuyến mãi",
            type: "Sự cố",
            status: "Chưa xử lý",
            time: "2 giờ trước",
            order: "#8432",
            rating: "2 / 5",
            customer: "Nora Patel",
            channel: "Web",
            content:
                "Mã khuyến mãi SUMMER20 hiển thị đã áp dụng nhưng tổng tiền không thay đổi. Xảy ra 2 lần hôm nay.",
            note:
                "Có thể lỗi làm tròn giỏ hàng khi phí giao hàng được miễn bởi mã giảm giá."
        },
        {
            id: 2,
            title: "Thêm tính năng hẹn giờ chế độ tối",
            type: "Tính năng",
            status: "Đã phân loại",
            time: "6 giờ trước"
        },
        {
            id: 3,
            title: "Rất thích giao diện duyệt menu mới",
            type: "Khen ngợi",
            status: "Mới",
            time: "1 ngày trước"
        }
    ];

    const active = feedbacks.find(f => f.id === selectedId);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex items-center justify-between mb-6">
                <input
                    className="w-1/3 rounded-lg border px-4 py-2 text-sm"
                    placeholder="Tìm phản hồi, người dùng, đơn hàng..."
                />
                <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <button className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                        + Phản hồi mới
                    </button>
                    <span className="text-sm font-medium">Quản trị viên</span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4 bg-white rounded-xl p-4 border h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">Hộp thư</span>
                        <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            Đánh dấu đã đọc tất cả
                        </button>
                    </div>

                    <input
                        className="w-full mb-4 rounded-lg border px-3 py-2 text-sm"
                        placeholder="Lọc theo từ khóa, đánh giá hoặc thẻ"
                    />

                    <div className="space-y-2">
                        {feedbacks.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedId(item.id)}
                                className={`p-3 rounded-lg cursor-pointer border ${selectedId === item.id
                                        ? "bg-green-50 border-green-300"
                                        : "hover:bg-gray-50"
                                    }`}
                            >
                                <div className="text-sm font-medium">
                                    {item.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {item.type || "General"} • {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                                </div>
                                <div className="text-xs mt-1 text-gray-400">{item.status}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail */}
                <div className="col-span-8 bg-white rounded-xl p-6 border">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                            {active.title}
                        </h2>

                        <div className="flex gap-2">
                            <button className="btn-secondary">
                                <Tag className="w-4 h-4" /> Gắn thẻ
                            </button>
                            <button className="btn-secondary">
                                <UserPlus className="w-4 h-4" /> Phân công
                            </button>
                            <button className="btn-primary">
                                <CheckCircle className="w-4 h-4" /> Đã xử lý
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        <InfoCard label="Đánh giá" value={active.rating} />
                        <InfoCard label="Khách hàng" value={active.customer} />
                        <InfoCard label="Kênh" value={active.channel} />
                        <InfoCard label="Đơn liên quan" value={active.order} />
                    </div>

                    {/* Content */}
                    <div className="text-sm mb-4">
                        <p className="mb-2">{active.content}</p>

                        <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                            <b>Ghi chú nội bộ:</b> {active.note}
                        </div>
                    </div>

                    {/* Reply */}
                    <div>
                        <label className="text-sm font-medium block mb-1">
                            Trả lời khách hàng
                        </label>
                        <textarea
                            rows={4}
                            className="w-full border rounded-lg p-3 text-sm"
                            placeholder="Nhập nội dung phản hồi..."
                        />

                        <div className="flex justify-end gap-2 mt-3">
                            <button className="btn-secondary">
                                Lưu nháp
                            </button>
                            <button className="btn-primary">
                                <Send className="w-4 h-4" /> Gửi
                            </button>
                        </div>
                    </div>

                    {/* Link records */}
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold mb-2">
                            Liên kết bản ghi
                        </h4>

                        <table className="w-full text-sm border rounded-lg overflow-hidden">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="text-left p-2">Đối tượng</th>
                                    <th className="text-left p-2">Tham chiếu</th>
                                    <th className="text-left p-2">Trạng thái</th>
                                    <th className="text-left p-2">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t">
                                    <td className="p-2">Đơn hàng</td>
                                    <td className="p-2">#8432</td>
                                    <td className="p-2">
                                        Đang chờ hoàn tiền
                                    </td>
                                    <td className="p-2">
                                        <button className="btn-secondary">
                                            Mở
                                        </button>
                                    </td>
                                </tr>
                                <tr className="border-t">
                                    <td className="p-2">Mã giảm giá</td>
                                    <td className="p-2">SUMMER20</td>
                                    <td className="p-2">Đang hoạt động</td>
                                    <td className="p-2">
                                        <button className="btn-secondary">
                                            Mở
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="bg-green-100 rounded-lg p-3">
            <div className="text-xs text-gray-600">{label}</div>
            <div className="text-sm font-semibold truncate" title={value}>{value}</div>
        </div>
    );
}