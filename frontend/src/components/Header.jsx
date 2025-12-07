import { Bell, User, Gauge, RefreshCw, Settings, LogOut, Languages } from "lucide-react";
import { useState } from "react";


export default function Header({ user, setCurrentPage }) {   
  const [open, setOpen] = useState(false);
  

  return (
    <div className="flex items-center justify-between pb-3 mb-4 border-b">
      <input
        type="text"
        className="w-1/2 p-3 border rounded-xl bg-white shadow-sm"
        placeholder="Tìm món, danh mục, ưu đãi..."
      />

      <div className="flex items-center gap-6 relative">
        <Bell className="cursor-pointer" />

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <User size={22} />

          {/* TÊN LẤY TỪ PROPS */}
          <span>{user?.fullName || "Người dùng"}</span>
        </div>

        {open && (
          <div className="absolute top-12 right-0 bg-white shadow-lg rounded-xl w-48 p-3 space-y-2">
             <MenuItem
              icon={<Gauge size={18} />}
              text="Bảng điều khiển"
              onClick={() => setCurrentPage("profile")}
            />
            <MenuItem icon={<RefreshCw size={18} />} text="Cập nhật" />
            <MenuItem icon={<Settings size={18} />} text="Cài đặt" />
            <MenuItem icon={<LogOut size={18} />} text="Đăng xuất" />
            <MenuItem icon={<Languages size={18} />} text="Ngôn ngữ" />
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon, text, onClick }) {
   return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg w-full text-left"
    >
      {icon} {text}
    </button>
  );
}
