import React, { useState, useEffect } from "react";
import {
  User, Mail, Phone, Briefcase, Clock,
  Shield, Edit3, LogOut, RotateCcw, X, Camera
} from "lucide-react";
import userService from "../services/userService";

const ProfilePage = ({ setCurrentPage }) => {
  const [user, setUser] = useState({
    name: "",
    id: "",
    role: "",
    email: "",
    phone: "",
    unit: "",
    shift: "",
    avatar: "/default-avatar.png",
    stats: {
      mealsOrdered: 0,
      freeMealsLeft: 0,
      weeklyCost: 0,
      costLimit: 0,
      satisfaction: 0,
      totalReviews: 0
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [currentLang, setCurrentLang] = useState("vi");
  const [loading, setLoading] = useState(false);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getUserProfile("me");

        setUser(prev => ({
          ...prev,
          ...data,
          email: data.gmail,
          phone: data.sdt,
          avatar: data.avatar_url || prev.avatar
        }));
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  /* ================= ACTIONS ================= */

  const handleTabClick = (tab) => {
    if (tab === "Bảng điều khiển") {
      setCurrentPage("home");
    }
  };

  const handleEditClick = () => {
    setEditFormData({ ...user });
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await userService.updateProfile({
        name: editFormData.name,
        gmail: editFormData.email,
        sdt: editFormData.phone,
        unit: editFormData.unit,
        shift: editFormData.shift,
      });

      setUser(prev => ({
        ...prev,
        ...updated,
        email: updated.gmail,
        phone: updated.sdt
      }));

      alert("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
    } catch (error) {
      alert("Lỗi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const data = await userService.uploadAvatar(formData);
      setUser(prev => ({ ...prev, avatar: data.avatar_url }));
    } catch (err) {
      alert("Không thể tải ảnh");
    }
  };

  const handleLogout = () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  };

  const toggle2FA = () => setIs2FAEnabled(!is2FAEnabled);

  /* ================= UI ================= */

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6 relative">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6" /> Hồ sơ & Bảng điều khiển
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">

            {/* PROFILE CARD */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex gap-6">
                <div className="text-center">
                  <img src={user.avatar} className="w-32 h-32 rounded-full object-cover" />
                  <h4 className="font-bold mt-2">{user.name}</h4>
                  <p className="text-xs text-gray-500">ID: {user.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                  <InfoRow icon={Mail} label="Email" value={user.email} />
                  <InfoRow icon={Phone} label="SĐT" value={user.phone} />
                  <InfoRow icon={Briefcase} label="Đơn vị" value={user.unit} />
                  <InfoRow icon={Clock} label="Ca làm" value={user.shift} />

                  <div className="col-span-2 mt-4 flex gap-3">
                    <button onClick={handleEditClick} className="btn-primary">
                      <Edit3 size={14} /> Chỉnh sửa
                    </button>
                    <button onClick={handleLogout} className="btn-danger">
                      <LogOut size={14} /> Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-[400px] rounded-xl p-6">
            <h3 className="font-bold mb-4">Chỉnh sửa hồ sơ</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <input name="name" value={editFormData.name} onChange={handleInputChange} className="input" placeholder="Tên" />
              <input name="email" value={editFormData.email} onChange={handleInputChange} className="input" placeholder="Email" />
              <input name="phone" value={editFormData.phone} onChange={handleInputChange} className="input" placeholder="SĐT" />
              <input name="unit" value={editFormData.unit} onChange={handleInputChange} className="input" placeholder="Đơn vị" />
              <input name="shift" value={editFormData.shift} onChange={handleInputChange} className="input" placeholder="Ca" />

              <div className="flex justify-end gap-2">
                <button type="button" onClick={handleCloseEdit}>Hủy</button>
                <button type="submit">{loading ? "Đang lưu..." : "Lưu"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= UI Helpers ================= */

const InfoRow = ({ icon: Icon, label, value }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-emerald-600" />
      {value}
    </div>
  </div>
);

export default ProfilePage;
