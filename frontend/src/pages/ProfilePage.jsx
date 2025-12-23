import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Briefcase, Clock, 
  Shield, Edit3, LogOut, RotateCcw, X, Camera 
} from 'lucide-react';
import { getUserProfile, updateUserProfile, uploadUserAvatar } from '../services/userService';
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
      mealsOrdered: 12,
      freeMealsLeft: 3,
      weeklyCost: 560000,
      costLimit: 800000,
      satisfaction: 4.6,
      totalReviews: 18
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [currentLang, setCurrentLang] = useState('vi');
  const [loading, setLoading] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Uncomment the line below when backend is ready
        // const data = await getUserProfile(); 
        // setUser(prev => ({ ...prev, ...data }));
        
        // For now, using initial state simulation if fetch fails or is commented
        console.log("Fetching profile..."); 
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleTabClick = (tab) => {
    if (tab === 'Bảng điều khiển') {
      setCurrentPage('home');
    } else if (tab === 'Cập nhật') {
        // Handle other tabs if needed
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
      // Simulating backend call
      // const updatedUser = await updateUserProfile(editFormData);
      // setUser(prev => ({ ...prev, ...updatedUser }));
      
      setUser(prev => ({ ...prev, ...editFormData })); // Optimistic update
      alert("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
    } catch (error) {
      alert("Lỗi cập nhật: " + error);
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
      // const data = await uploadUserAvatar(formData);
      // setUser(prev => ({ ...prev, avatar: data.avatarUrl }));
      
      // Simulation for now
      const objectUrl = URL.createObjectURL(file);
      setUser(prev => ({ ...prev, avatar: objectUrl }));
      alert("Tải ảnh lên thành công!");
    } catch (err) {
      console.error("Error uploading avatar:", err);
      alert("Không thể tải ảnh lên.");
    }
  };

  const handleLogout = () => {
    const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (confirm) {
      localStorage.removeItem('token'); // Clear token
      window.location.href = "/login";
    }
  };

  const toggle2FA = () => setIs2FAEnabled(!is2FAEnabled);

  return (

      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        <main className="flex-1 overflow-y-auto p-6 relative">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-6 h-6" />
              Hồ sơ & Bảng điều khiển
            </h2>
            <div className="flex bg-white rounded-full px-2 py-1 shadow-sm text-sm">
              {['Bảng điều khiển', 'Cập nhật', 'Cài đặt', 'Ngôn ngữ'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className="px-4 py-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 font-medium"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin tài khoản</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  
                  <div className="flex-shrink-0 text-center">
                    <div className="relative group">
                      <img
                        src={user.avatar || "/default-avatar.png"}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                      />
                      <label 
                        htmlFor="avatarInput"
                        className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full cursor-pointer hover:bg-emerald-700 transition shadow-sm"
                        title="Đổi ảnh đại diện"
                      >
                        <Camera className="w-4 h-4" />
                      </label>
                      <input
                        id="avatarInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>

                    <h4 className="font-bold text-lg mt-3">{user.name || "Tên người dùng"}</h4>
                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-xs rounded-full text-gray-600 font-medium">
                      {user.role}
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm w-full">
                    <InfoRow icon={Mail} label="Email" value={user.email} />
                    <InfoRow icon={Phone} label="Số điện thoại" value={user.phone} />
                    <InfoRow icon={Briefcase} label="Đơn vị" value={user.unit} />
                    <InfoRow icon={Clock} label="Ca làm" value={user.shift} />
                    
                    <div className="col-span-1 md:col-span-2 flex gap-3 mt-4">
                      <button 
                        onClick={handleEditClick}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a3c35] text-white rounded-lg hover:bg-[#142e29] transition-colors text-sm font-medium"
                      >
                        <Edit3 className="w-4 h-4" /> Chỉnh sửa hồ sơ
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Cập nhật hệ thống</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        <RotateCcw className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-700">Phiên bản 1.2.8</p>
                        <p className="text-xs text-gray-500">Tối ưu tốc độ tải menu.</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200">
                      Chi tiết
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        <Shield className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-700">Bảo mật</p>
                        <p className="text-xs text-gray-500">Bật xác thực hai lớp (2FA).</p>
                      </div>
                    </div>
                    <button 
                      onClick={toggle2FA}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${is2FAEnabled ? 'bg-[#1a3c35] text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {is2FAEnabled ? 'Đang bật 2FA' : 'Bật 2FA'}
                    </button>
                  </div>
                </div>
              </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Ngôn ngữ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <LangOption active={currentLang === 'vi'} onClick={() => setCurrentLang('vi')} label="Tiếng Việt" sub="Hiện tại" btnText="Đang dùng" dark />
                  <LangOption active={currentLang === 'en'} onClick={() => setCurrentLang('en')} label="English" sub="English interface" btnText="Chọn" />
                  <LangOption active={currentLang === 'jp'} onClick={() => setCurrentLang('jp')} label="日本語" sub="Japanese interface" btnText="Chọn" />
                </div>
              </div>

            </div>
          </div>
        </main>

        {isEditing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animation-fade-in">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800">Chỉnh sửa hồ sơ</h3>
                <button onClick={handleCloseEdit} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Họ và tên</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={editFormData.name} 
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={editFormData.email} 
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Số điện thoại</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={editFormData.phone} 
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Đơn vị / Phòng ban</label>
                  <input 
                    type="text" 
                    name="unit" 
                    value={editFormData.unit} 
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                 <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Ca làm việc</label>
                  <input 
                    type="text" 
                    name="shift" 
                    value={editFormData.shift} 
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Role is Read-Only */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <label className="block text-xs font-bold text-gray-400 mb-1">Vai trò (Chỉ quản trị viên có thể thay đổi)</label>
                  <div className="font-medium text-gray-600">{user.role}</div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={handleCloseEdit}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-4 py-2 text-sm font-bold text-white bg-[#1a3c35] hover:bg-[#142e29] rounded-lg shadow-sm"
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-400 text-xs mb-1">{label}</span>
    <div className="flex items-center gap-2 font-medium text-gray-700">
      <Icon className="w-4 h-4 text-emerald-600" />
      {value}
    </div>
  </div>
);

const LangOption = ({ label, sub, btnText, active, dark, onClick }) => (
  <div className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all ${active ? 'bg-gray-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-gray-100 hover:border-emerald-200'}`} onClick={onClick}>
    <div>
      <p className="font-bold text-sm text-gray-800">{label}</p>
      <p className="text-xs text-gray-500">{sub}</p>
    </div>
    <button 
      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
        dark 
          ? 'bg-[#1a3c35] text-white' 
          : 'bg-green-100 text-green-700'
      }`}
    >
      {btnText}
    </button>
  </div>
);

export default ProfilePage;