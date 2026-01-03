import React, { useState, useEffect } from "react";
import { CheckCircle, Send, Bell } from "lucide-react";
import feedbackService from "../services/feedbackService";

export default function FeedbackAdminPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [activeFeedback, setActiveFeedback] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadFeedbacks = async () => {
            try {
                const data = await feedbackService.getAllFeedbacks({
                    search: searchTerm,   // tìm theo title / comment
                    user: searchTerm      // tìm theo tên / email user
                });

                const list = Array.isArray(data) ? data : [];
                setFeedbacks(list);

                if (list.length > 0 && !selectedId) {
                    setSelectedId(list[0].id);
                }
            } catch (error) {
                console.error("Error loading feedbacks", error);
                setFeedbacks([]);
            }
        };

        loadFeedbacks();
    }, [searchTerm]);


    useEffect(() => {
        if (!selectedId) return;
        const loadDetail = async () => {
            try {
                const detail = await feedbackService.getFeedbackById(selectedId);
                setActiveFeedback(detail);
                setReplyText(detail.reply_text || "");
            } catch (error) {
                console.error("Error loading detail", error);
            }
        };
        loadDetail();
    }, [selectedId]);


    const handleResolve = async () => {
        if (!activeFeedback) return;
        try {
            await feedbackService.markAsResolved(activeFeedback.id);
            alert("Đã đánh dấu xử lý");
            const data = await feedbackService.getAllFeedbacks({ search: searchTerm });
            setFeedbacks(Array.isArray(data) ? data : []);
        } catch (error) {
            alert("Lỗi");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex items-center justify-between mb-6">
                <input
                    className="w-1/3 rounded-lg border px-4 py-2 text-sm"
                    placeholder="Tìm phản hồi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium">Quản trị viên</span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4 bg-white rounded-xl p-4 border h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">Hộp thư</span>
                    </div>

                    <div className="space-y-2">
                        {feedbacks.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedId(item.id)}
                                className={`p-3 rounded-lg cursor-pointer border ${selectedId === item.id ? "bg-green-50 border-green-300" : "hover:bg-gray-50"}`}
                            >
                                <div className="text-sm font-medium">{item.title || "No Title"}</div>
                                <div className="text-xs text-gray-500">
                                    {item.type || "General"} • {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                                </div>
                                <div className="text-xs mt-1 text-gray-400">{item.status}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail View */}
                <div className="col-span-8 bg-white rounded-xl p-6 border h-[80vh] overflow-y-auto">
                    {activeFeedback ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">{activeFeedback.title}</h2>
                                <div className="flex gap-2">
                                    <button onClick={handleResolve} className="flex items-center gap-1 bg-green-700 text-white px-3 py-1 rounded text-sm">
                                        <CheckCircle className="w-4 h-4" /> Đã xử lý
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3 mb-4">
                                <InfoCard label="Đánh giá" value={`${activeFeedback.rating || 0} / 5`} />
                                <InfoCard label="Khách hàng" value={activeFeedback.users?.name || "Ẩn danh"} />
                                <InfoCard label="Email" value={activeFeedback.users?.gmail || "N/A"} />
                                <InfoCard label="Đơn liên quan" value={activeFeedback.order_id ? `#${activeFeedback.order_id}` : "Không có"} />
                            </div>

                            <div className="text-sm mb-4">
                                <p className="mb-2 p-3 bg-gray-50 rounded">{activeFeedback.comment}</p>
                            </div>


                        </>
                    ) : (
                        <div className="text-center text-gray-500 mt-20">Chọn một phản hồi để xem chi tiết</div>
                    )}
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