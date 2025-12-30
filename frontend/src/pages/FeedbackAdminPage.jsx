<<<<<<< Updated upstream
import { useState, useEffect } from "react";
import { CheckCircle, Tag, UserPlus, Send, Bell } from "lucide-react";
import { feedbackApi } from "../services/feedbackAdminService.js";

export default function FeedbackAdminPage() {
    // State
=======
import React, { useState, useEffect } from "react";
import { CheckCircle, Send, Bell } from "lucide-react";
import feedbackService from "../services/feedbackService.js";

export default function FeedbackAdminPage() {
>>>>>>> Stashed changes
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [activeFeedback, setActiveFeedback] = useState(null);
    const [replyText, setReplyText] = useState("");
<<<<<<< Updated upstream
    const [loadingList, setLoadingList] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Load list on mount
    useEffect(() => {
        loadFeedbacks();
    }, []);

    // Load detail when selection changes
    useEffect(() => {
        if (selectedId) {
            loadFeedbackDetail(selectedId);
        }
    }, [selectedId]);

    const loadFeedbacks = async () => {
        setLoadingList(true);
        try {
            const data = await feedbackApi.getList({});
            setFeedbacks(data.feedbacks || []);
            // Auto-select first item if exists
            if (data.feedbacks?.length > 0 && !selectedId) {
                setSelectedId(data.feedbacks[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingList(false);
        }
    };

    const loadFeedbackDetail = async (id) => {
        setLoadingDetail(true);
        try {
            const data = await feedbackApi.getDetail(id);
            setActiveFeedback(data);
            setReplyText(data.reply_text || ""); // Pre-fill if already replied
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Actions
    const handleResolve = async () => {
        if (!selectedId) return;
        try {
            await feedbackApi.resolve(selectedId);
            loadFeedbacks(); // Refresh list to show new status
            loadFeedbackDetail(selectedId); // Refresh detail
        } catch (err) {
            alert("Error resolving feedback");
        }
    };

    const handleReply = async () => {
        if (!selectedId || !replyText) return;
        try {
            await feedbackApi.reply(selectedId, replyText);
            loadFeedbackDetail(selectedId); // Refresh to show saved state
            alert("Reply sent!");
        } catch (err) {
            alert("Error sending reply");
=======
    const [searchTerm, setSearchTerm] = useState("");

    // Initial Fetch
    useEffect(() => {
        const loadFeedbacks = async () => {
            try {
                const data = await feedbackService.getAllFeedbacks({ search: searchTerm });
                // SAFETY CHECK: Ensure data is an array
                setFeedbacks(Array.isArray(data) ? data : []);
                
                if (Array.isArray(data) && data.length > 0 && !selectedId) {
                    setSelectedId(data[0].id);
                }
            } catch (error) {
                console.error("Error loading feedbacks", error);
                setFeedbacks([]);
            }
        };
        loadFeedbacks();
    }, [searchTerm]);

    // Fetch details when selection changes
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

    const handleSendReply = async () => {
        if (!activeFeedback) return;
        try {
            await feedbackService.sendReply(activeFeedback.id, replyText);
            alert("Đã gửi phản hồi!");
            const updated = await feedbackService.getFeedbackById(activeFeedback.id);
            setActiveFeedback(updated);
        } catch (error) {
            alert("Lỗi khi gửi");
        }
    };

    const handleResolve = async () => {
        if (!activeFeedback) return;
        try {
            await feedbackService.markAsResolved(activeFeedback.id);
            alert("Đã đánh dấu xử lý");
            // Refresh List
            const data = await feedbackService.getAllFeedbacks({ search: searchTerm });
            setFeedbacks(Array.isArray(data) ? data : []);
        } catch (error) {
            alert("Lỗi");
>>>>>>> Stashed changes
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex items-center justify-between mb-6">
                <input
                    className="w-1/3 rounded-lg border px-4 py-2 text-sm"
<<<<<<< Updated upstream
                    placeholder="Search feedback..."
                />
                <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium">Admin</span>
=======
                    placeholder="Tìm phản hồi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium">Quản trị viên</span>
>>>>>>> Stashed changes
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Inbox List */}
<<<<<<< Updated upstream
                <div className="col-span-4 bg-white rounded-xl p-4 border h-[calc(100vh-150px)] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">Inbox</span>
                    </div>

                    {loadingList ? <p>Loading...</p> : (
                        <div className="space-y-2">
                            {feedbacks.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    className={`p-3 rounded-lg cursor-pointer border ${
                                        selectedId === item.id
                                            ? "bg-green-50 border-green-300"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex justify-between">
                                        <div className="text-sm font-medium truncate">{item.title}</div>
                                        <span className={`text-xs px-2 rounded-full ${item.status === 'Đã đóng' ? 'bg-gray-200' : 'bg-red-100 text-red-800'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {item.type} • {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                <div className="col-span-8 bg-white rounded-xl p-6 border h-[calc(100vh-150px)] overflow-y-auto">
                    {loadingDetail || !activeFeedback ? (
                        <p className="text-gray-500">Select a feedback item...</p>
                    ) : (
                        <>
                            {/* Title & Actions */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">{activeFeedback.title}</h2>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleResolve}
                                        className={`btn-primary flex items-center gap-1 px-3 py-1 rounded text-white ${
                                            activeFeedback.status === 'Đã đóng' ? 'bg-gray-400' : 'bg-green-600'
                                        }`}
                                        disabled={activeFeedback.status === 'Đã đóng'}
                                    >
                                        <CheckCircle className="w-4 h-4" /> 
                                        {activeFeedback.status === 'Đã đóng' ? 'Resolved' : 'Resolve'}
=======
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
>>>>>>> Stashed changes
                                    </button>
                                </div>
                            </div>

<<<<<<< Updated upstream
                            {/* Info Grid - using optional chaining ?. in case relations are null */}
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                <InfoCard label="Rating" value={activeFeedback.rating + " / 5"} />
                                <InfoCard label="Customer" value={activeFeedback.users?.name || "Anonymous"} />
                                <InfoCard label="Impact" value={activeFeedback.impact} />
                                <InfoCard label="Order #" value={activeFeedback.orders?.id || "N/A"} />
                            </div>

                            {/* Content */}
                            <div className="text-sm mb-4">
                                <p className="mb-2 p-3 bg-gray-50 rounded border">{activeFeedback.comment}</p>
                                {activeFeedback.internal_note && (
                                    <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 border border-yellow-100">
                                        <b>Internal note:</b> {activeFeedback.internal_note}
                                    </div>
                                )}
                            </div>

                            {/* Reply Section */}
                            <div className="mt-6 border-t pt-4">
                                <label className="text-sm font-medium block mb-1">
                                    Reply to customer ({activeFeedback.users?.gmail || "No email"})
                                </label>
                                <textarea
                                    rows={4}
                                    className="w-full border rounded-lg p-3 text-sm"
                                    placeholder="Type your response..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={activeFeedback.status === 'Đã đóng'}
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                    <button 
                                        onClick={handleReply}
                                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
                                        disabled={activeFeedback.status === 'Đã đóng'}
                                    >
                                        <Send className="w-4 h-4" /> Send Reply
=======
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                <InfoCard label="Đánh giá" value={`${activeFeedback.rating || 0} / 5`} />
                                <InfoCard label="Khách hàng" value={activeFeedback.users?.name || "Ẩn danh"} />
                                <InfoCard label="Email" value={activeFeedback.users?.gmail || "N/A"} />
                                <InfoCard label="Đơn liên quan" value={activeFeedback.order_id ? `#${activeFeedback.order_id}` : "Không có"} />
                            </div>

                            <div className="text-sm mb-4">
                                <p className="mb-2 p-3 bg-gray-50 rounded">{activeFeedback.comment}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium block mb-1">Trả lời khách hàng</label>
                                <textarea
                                    rows={4}
                                    className="w-full border rounded-lg p-3 text-sm"
                                    placeholder="Nhập nội dung phản hồi..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                    <button onClick={handleSendReply} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded text-sm">
                                        <Send className="w-4 h-4" /> Gửi
>>>>>>> Stashed changes
                                    </button>
                                </div>
                            </div>
                        </>
<<<<<<< Updated upstream
=======
                    ) : (
                        <div className="text-center text-gray-500 mt-20">Chọn một phản hồi để xem chi tiết</div>
>>>>>>> Stashed changes
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-xs text-gray-600">{label}</div>
            <div className="text-sm font-semibold truncate" title={value}>{value}</div>
        </div>
    );
}