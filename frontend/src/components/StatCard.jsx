export default function StatCard({ title, value, icon, sub }) {
    return (
        <div className="bg-green-100 rounded-xl p-4 flex gap-4 items-center">
            {icon && (
                <div className="text-emerald-700 text-xl">
                    {icon}
                </div>
            )}

            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
                {sub && (
                    <p className="text-xs text-gray-500 mt-1">
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
}
