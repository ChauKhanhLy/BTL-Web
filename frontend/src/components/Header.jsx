import { Bell, User } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-center justify-between">
      <input
        type="text"
        className="w-1/2 p-2 border rounded-lg"
        placeholder="Tìm món, danh mục..."
      />

      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md">
          Vai trò: NLD
        </span>

        <Bell size={20} />

        <div className="flex items-center gap-2">
          <User size={22} />
          <span>Trần Minh</span>
        </div>
      </div>
    </div>
  );
}
