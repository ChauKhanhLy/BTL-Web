import { useState } from "react";
import logo from "../../image/logo.png";
import {
  PieChart,
  BookOpenCheck,
  ShoppingCart,
  MessageSquare,
  ClipboardList,
  Boxes,
  Users,
  FileText,
} from "lucide-react";

/* ================= MENU CONFIG THEO ROLE ================= */
const menuByRole = {
  customer: [
    { key: "menu", label: "Menu", icon: BookOpenCheck },
    { key: "home", label: "Thống kê ăn & chi phí", icon: PieChart },
    { key: "cart", label: "Giỏ hàng", icon: ShoppingCart },
    { key: "feedback", label: "Phản ánh chất lượng", icon: MessageSquare },
  ],

  admin: [
    { key: "dashboard", label: "Dashboard", icon: PieChart },
    { key: "dailyorders", label: "Daily Orders", icon: ClipboardList },
    { key: "menumanagement", label: "Menu Management", icon: BookOpenCheck },
    { key: "inventory", label: "Inventory", icon: Boxes },
    { key: "users", label: "User Accounts", icon: Users },
    { key: "adminfeedback", label: "Feedback", icon: FileText },
  ],
};

/* ================= SIDEBAR ================= */
export default function Sidebar({ role = "customer", setCurrentPage }) {
  const [expanded, setExpanded] = useState(false);
  const [locked, setLocked] = useState(false);

  return (
    <div
      onMouseEnter={() => !locked && setExpanded(true)}
      onMouseLeave={() => !locked && setExpanded(false)}
      className={`
        min-h-screen bg-[#0B3B2E] text-white p-4 flex flex-col
        transition-all duration-300 shadow-xl
        ${expanded ? "w-64" : "w-20"}
      `}
    >
      {/* LOGO */}
      <div
        className="flex items-center gap-3 mb-8 px-2 cursor-pointer"
        onClick={() => setCurrentPage(role === "admin" ? "dashboard" : "home")}
      >
        <img
          src={logo}
          alt="logo"
          className="w-10 h-10 rounded-xl object-cover border border-white/20"
        />
        {expanded && <h1 className="text-xl font-bold">Orion</h1>}
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-4">
        {menuByRole[role].map((item) => (
          <MenuItem
            key={item.key}
            expanded={expanded}
            icon={<item.icon size={22} />}
            text={item.label}
            onClick={() => setCurrentPage(item.key)}
          />
        ))}
      </nav>

      {/* FOOTER (CHỈ customer MỚI CÓ) */}
      {expanded && role === "customer" && (
        <div className="mt-auto text-xs opacity-80 bg-green-800 p-3 rounded-lg leading-5">
          Mẹo nhanh: Đặt món trước 9:30 để đảm bảo suất ăn.
        </div>
      )}
    </div>
  );
}

/* ================= MENU ITEM ================= */
function MenuItem({ expanded, icon, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-2 rounded-lg
                 hover:bg-green-800 transition-colors"
    >
      {icon}
      {expanded && <span>{text}</span>}
    </button>
  );
}
