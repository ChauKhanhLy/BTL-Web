import {
  Bell,
  User,
  Gauge,
  RefreshCw,
  Settings,
  LogOut,
  Languages
} from "lucide-react";
import { useState } from "react";

/* dữ liệu demo – sau này thay bằng API */
const dishes = [
  { id: 1, name: "Cơm gà nướng" },
  { id: 2, name: "Cơm sườn mật ong" },
  { id: 3, name: "Bún bò Huế" },
  { id: 4, name: "Salad ức gà" },
];

export default function Header({ user, setCurrentPage, searchKeyword, setSearchKeyword, currentPage, onLogout }) {
  const [open, setOpen] = useState(false);

  const suggestions =
    searchKeyword?.length > 0
      ? dishes.filter(d =>
          d.name.toLowerCase().includes(searchKeyword.toLowerCase())
        )
      : [];

  return (
    <div className="h-16 flex items-center justify-between px-4 border-b bg-white">

      {/* SEARCH */}
      <div className="relative w-1/2 mt-1">
        <input
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          type="text"
          placeholder={
            currentPage === "menu"
              ? "Tìm món ăn..."
              : "Tìm món ăn, ngày ăn..."
          }
          className="w-full p-3 border rounded-xl bg-white shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* AUTOCOMPLETE */}
        {suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg z-50">
            {suggestions.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  setSearchKeyword(item.name);
                  setCurrentPage("menu");
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6 relative">
        <Bell className="cursor-pointer" />

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <User size={22} />
          <span>{user?.fullName || "Người dùng"}</span>
        </div>

        {open && (
          <div className="absolute top-12 right-0 bg-white shadow-lg rounded-xl w-48 p-3 space-y-1">
            <MenuItem
              icon={<Gauge size={18} />}
              text="Trang cá nhân"
              onClick={() => setCurrentPage("profile")}
            />
            <MenuItem icon={<RefreshCw size={18} />} text="Cập nhật" />
            <MenuItem icon={<Settings size={18} />} text="Cài đặt" />
            <MenuItem icon={<Languages size={18} />} text="Ngôn ngữ" />
            <MenuItem 
              icon={<LogOut size={18} />} 
              text="Đăng xuất" 
              onClick={() => {
                onLogout();
              }} />
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
