import React, { useState } from "react";
import { Plus, Search, Calendar, Filter } from "lucide-react";

export default function MenuManagementPage() {
    const [view, setView] = useState("week");

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Menu Management</h1>
                    <p className="text-sm text-gray-500">Weekly Menu Planner</p>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-green-100 rounded-lg text-sm flex items-center gap-2">
                        <Calendar size={16} /> This Week
                    </button>
                    <button className="px-4 py-2 bg-green-100 rounded-lg text-sm">Export</button>
                </div>
            </div>

            {/* Top controls */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    {['Week', 'Day', 'Month'].map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v.toLowerCase())}
                            className={`px-4 py-1 rounded-full text-sm ${view === v.toLowerCase() ? 'bg-emerald-700 text-white' : 'bg-gray-100'}`}
                        >
                            {v}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow">
                        <Search size={16} className="text-gray-400" />
                        <input
                            placeholder="Search dishes"
                            className="ml-2 outline-none text-sm"
                        />
                    </div>
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-1">
                        <Plus size={16} /> Add Dish
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard title="Active Dishes" value="58" note="12 categories" />
                <StatCard title="Avg Price" value="₫45,800" note="Tax excluded" />
                <StatCard title="Out of Stock" value="4" note="Across 3 items" />
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Menu by Day */}
                <section className="bg-white rounded-xl p-5 shadow">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-semibold">Menu by Day</h3>
                        <button className="text-sm bg-green-100 px-3 py-1 rounded">Reset Week</button>
                    </div>

                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                        <div key={day} className="border rounded-lg p-3 mb-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{day}</span>
                                <button className="text-gray-400">–</button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">Sample Dish</span>
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">Another Dish</span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Dish Library */}
                <section className="bg-white rounded-xl p-5 shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Dish Library</h3>
                        <button className="flex items-center gap-1 text-sm bg-green-100 px-3 py-1 rounded">
                            <Filter size={14} /> Filters
                        </button>
                    </div>

                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex justify-between items-center border rounded-lg p-3 mb-3">
                            <div>
                                <p className="font-medium">Dish name</p>
                                <p className="text-xs text-gray-500">Category • ₫45,000</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 text-xs bg-green-100 rounded">Edit</button>
                                <button className="px-3 py-1 text-xs bg-orange-100 text-orange-600 rounded">Archive</button>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}

function StatCard({ title, value, note }) {
    return (
        <div className="bg-green-100 rounded-xl p-4">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{note}</p>
        </div>
    );
}