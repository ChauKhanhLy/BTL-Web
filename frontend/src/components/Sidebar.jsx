import { useState } from "react";
import logo from "../../image/logo.png"
import {
  PieChart,
  BookOpenCheck,
  ShoppingCart,
  MessageSquare
} from "lucide-react";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [locked, setLocked] = useState(false); // click lock/unlock

  const handleToggleClick = () => {
    setLocked(!locked);
    setExpanded(!locked ? true : false);
  };

  return (
    <div
      onMouseEnter={() => !locked && setExpanded(true)}
      onMouseLeave={() => !locked && setExpanded(false)}
      className={`
        min-h-screen bg-[#0B3B2E] text-white p-4 flex flex-col 
        transition-all duration-300 shadow-xl relative
        ${expanded ? "w-64" : "w-20"}
      `}
    >
      {/* LOGO + STICKER */}
      <div
        className="flex items-center gap-3 mb-8 px-2 cursor-pointer"
        onClick={handleToggleClick}
      >
        <img
          src={logo}
          alt="logo"
          className="w-10 h-10 rounded-xl object-cover border border-white/20"
        />

        {expanded && (
          <h1 className="text-xl font-bold whitespace-nowrap">
            Bếp Ăn NLD
          </h1>
        )}
      </div>

      {/* MENU */}
      <nav className="flex flex-col mt-4 gap-4">
        <MenuItem expanded={expanded} icon={<PieChart size={22} />} text="Thống kê ăn & chi phí" />
        <MenuItem expanded={expanded} icon={<BookOpenCheck size={22} />} text="Trang menu" />
        <MenuItem expanded={expanded} icon={<ShoppingCart size={22} />} text="Giỏ hàng" />
        <MenuItem expanded={expanded} icon={<MessageSquare size={22} />} text="Phản ánh chất lượng" />
      </nav>

      {/* FOOTER */}
      {expanded && (
        <div className="mt-auto text-xs opacity-80 bg-green-800 p-3 rounded-lg leading-5">
          Mẹo nhanh: Đặt món trước 9:30 để đảm bảo suất ăn.
        </div>
      )}
    </div>
  );
}

function MenuItem({ expanded, icon, text }) {
  return (
    <button className="flex items-center gap-4 p-2 rounded-lg hover:bg-green-800 transition-colors">
      {icon}
      {expanded && <span className="whitespace-nowrap">{text}</span>}
    </button>
  );
}
