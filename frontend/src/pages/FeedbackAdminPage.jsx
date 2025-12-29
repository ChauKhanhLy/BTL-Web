import { useState } from "react";
import {
    CheckCircle,
    Tag,
    UserPlus,
    Send,
    Bell
} from "lucide-react";

export default function FeedbackAdminPage() {
    const [selectedId, setSelectedId] = useState(1);

    const feedbacks = [
        {
            id: 1,
            title: "Checkout failed with promo code",
            type: "Issue",
            status: "Unresolved",
            time: "2h ago",
            order: "#8432",
            rating: "2 / 5",
            customer: "Nora Patel",
            channel: "Web",
            content:
                "The promo code SUMMER20 shows as applied but total doesn't change. Happened twice today.",
            note:
                "Likely cart rounding bug when delivery fee is waived by coupon."
        },
        {
            id: 2,
            title: "Add dark mode scheduling",
            type: "Feature",
            status: "Triaged",
            time: "6h ago"
        },
        {
            id: 3,
            title: "Love the new menu browsing",
            type: "Praise",
            status: "New",
            time: "1d ago"
        }
    ];

    const active = feedbacks.find(f => f.id === selectedId);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <input
                    className="w-1/3 rounded-lg border px-4 py-2 text-sm"
                    placeholder="Search feedback, user, order..."
                />

                <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <button className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                        + New Response
                    </button>
                    <span className="text-sm font-medium">Admin</span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Inbox */}
                <div className="col-span-4 bg-white rounded-xl p-4 border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">Inbox</span>
                        <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            Mark all read
                        </button>
                    </div>

                    <input
                        className="w-full mb-4 rounded-lg border px-3 py-2 text-sm"
                        placeholder="Filter by keyword, rating, or tag"
                    />

                    <div className="space-y-2">
                        {feedbacks.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedId(item.id)}
                                className={`p-3 rounded-lg cursor-pointer border ${selectedId === item.id
                                    ? "bg-green-50 border-green-300"
                                    : "hover:bg-gray-50"
                                    }`}
                            >
                                <div className="text-sm font-medium">{item.title}</div>
                                <div className="text-xs text-gray-500">
                                    {item.type} • {item.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail */}
                <div className="col-span-8 bg-white rounded-xl p-6 border">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">{active.title}</h2>

                        <div className="flex gap-2">
                            <button className="btn-secondary">
                                <Tag className="w-4 h-4" /> Tag
                            </button>
                            <button className="btn-secondary">
                                <UserPlus className="w-4 h-4" /> Assign
                            </button>
                            <button className="btn-primary">
                                <CheckCircle className="w-4 h-4" /> Resolve
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        <InfoCard label="Rating" value={active.rating} />
                        <InfoCard label="Customer" value={active.customer} />
                        <InfoCard label="Channel" value={active.channel} />
                        <InfoCard label="Related order" value={active.order} />
                    </div>

                    {/* Content */}
                    <div className="text-sm mb-4">
                        <p className="mb-2">{active.content}</p>

                        <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                            <b>Internal note:</b> {active.note}
                        </div>
                    </div>

                    {/* Reply */}
                    <div>
                        <label className="text-sm font-medium block mb-1">
                            Reply to customer
                        </label>
                        <textarea
                            rows={4}
                            className="w-full border rounded-lg p-3 text-sm"
                            placeholder="Type your response..."
                        />

                        <div className="flex justify-end gap-2 mt-3">
                            <button className="btn-secondary">Save draft</button>
                            <button className="btn-primary">
                                <Send className="w-4 h-4" /> Send
                            </button>
                        </div>
                    </div>

                    {/* Link records */}
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold mb-2">Link to records</h4>

                        <table className="w-full text-sm border rounded-lg overflow-hidden">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="text-left p-2">Entity</th>
                                    <th className="text-left p-2">Reference</th>
                                    <th className="text-left p-2">Status</th>
                                    <th className="text-left p-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t">
                                    <td className="p-2">Order</td>
                                    <td className="p-2">#8432</td>
                                    <td className="p-2">Refund pending</td>
                                    <td className="p-2">
                                        <button className="btn-secondary">Open</button>
                                    </td>
                                </tr>
                                <tr className="border-t">
                                    <td className="p-2">Coupon</td>
                                    <td className="p-2">SUMMER20</td>
                                    <td className="p-2">Active</td>
                                    <td className="p-2">
                                        <button className="btn-secondary">Open</button>
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
            <div className="text-sm font-semibold">{value}</div>
        </div>
    );
}
