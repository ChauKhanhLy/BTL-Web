
export default function StatCard({ title, value, icon, sub }) {
    return (
        <div className="bg-white rounded-xl p-4 flex gap-4 items-center">
            <div className="text-emerald-600">{icon}</div>
            <div>
                <div className="text-gray-500 text-sm">{title}</div>
                <div className="text-2xl font-bold">{value}</div>
                {sub && <div className="text-xs text-gray-400">{sub}</div>}
            </div>
        </div>
    );
}
