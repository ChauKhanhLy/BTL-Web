import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, Tag, UserPlus, Send, Bell } from "lucide-react";

const API_URL = "http://localhost:3000/api";

export default function FeedbackAdminPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [replyText, setReplyText] = useState("");
    
    const fetchFeedbacks = async () => {
        try {
            const res = await axios.get(`${API_URL}/feedbacks`, {
                params: { search: searchTerm }
            });
            setFeedbacks(res.data);
            if (!selectedId && res.data.length > 0) setSelectedId(res.data[0].id);
        } catch (error) {
            console.error("Error loading feedbacks:", error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchFeedbacks(), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const active = feedbacks.find(f => f.id === selectedId) || {};

    const handleResolve = async () => {
        if (!selectedId) return;
        try {
            await axios.patch(`${API_URL}/feedbacks/${selectedId}/resolve`, { status: "Resolved" });
            fetchFeedbacks(); // Refresh status in list
            alert("Feedback marked as resolved.");
        } catch (error) {
            alert("Error resolving feedback");
        }
    };

    const handleReply = async () => {
        if (!replyText) return;
        try {
            await axios.post(`${API_URL}/feedbacks/${selectedId}/reply`, { replyText });
            setReplyText("");
            fetchFeedbacks();
            alert("Reply sent successfully.");
        } catch (error) {
            alert("Error sending reply");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <input
                    className="w-1/3 rounded-lg border px-4 py-2 text-sm"
                    placeholder="Search feedback, user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* ... Header buttons ... */}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Inbox List */}
                <div className="col-span-4 bg-white rounded-xl p-4 border h-[calc(100vh-120px)] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">Inbox ({feedbacks.length})</span>
                    </div>

                    <div className="space-y-2">
                        {feedbacks.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedId(item.id)}
                                className={`p-3 rounded-lg cursor-pointer border transition-colors ${selectedId === item.id
                                    ? "bg-green-50 border-green-300"
                                    : "hover:bg-gray-50 border-transparent"
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="text-sm font-medium truncate">{item.title}</div>
                                    <div className={`text-xs px-2 py-0.5 rounded ${item.status === 'Resolved' ? 'bg-green-200' : 'bg-yellow-100'}`}>
                                        {item.status}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {item.type} • {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail View */}
                {active.id ? (
                    <div className="col-span-8 bg-white rounded-xl p-6 border h-[calc(100vh-120px)] overflow-y-auto">
                        {/* Title & Actions */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">{active.title}</h2>
                            <div className="flex gap-2">
                                <button className="btn-secondary flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-50 text-sm">
                                    <Tag className="w-4 h-4" /> Tag
                                </button>
                                <button 
                                    onClick={handleResolve}
                                    className="btn-primary flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                >
                                    <CheckCircle className="w-4 h-4" /> {active.status === 'Resolved' ? 'Re-open' : 'Resolve'}
                                </button>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            <InfoCard label="Rating" value={active.rating || 'N/A'} />
                            <InfoCard label="Customer" value={active.customer_name || 'Anonymous'} />
                            <InfoCard label="Channel" value={active.channel || 'Web'} />
                            <InfoCard label="Related order" value={active.order_ref || 'None'} />
                        </div>

                        {/* Content */}
                        <div className="text-sm mb-6">
                            <div className="p-4 bg-gray-50 rounded-lg border mb-3">
                                <p className="text-gray-800">{active.content}</p>
                            </div>
                            {active.internal_note && (
                                <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 border border-yellow-200">
                                    <b>Internal note:</b> {active.internal_note}
                                </div>
                            )}
                            {active.reply_text && (
                                <div className="mt-3 bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-200">
                                    <b>You replied:</b> {active.reply_text}
                                </div>
                            )}
                        </div>

                        {/* Reply Input */}
                        <div className="border-t pt-4">
                            <label className="text-sm font-medium block mb-2">Reply to customer</label>
                            <textarea
                                rows={4}
                                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Type your response..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />

                            <div className="flex justify-end gap-2 mt-3">
                                <button 
                                    onClick={handleReply}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                >
                                    <Send className="w-4 h-4" /> Send Reply
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="col-span-8 flex items-center justify-center text-gray-400">
                        Select a feedback item to view details
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-sm font-semibold text-gray-800 truncate">{value}</div>
        </div>
    );
}