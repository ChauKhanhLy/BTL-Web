import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  User, Mail, Phone, Briefcase, Clock, 
  Shield, CheckCircle, AlertCircle, Globe, 
  Settings, LogOut, Edit3, Save, RotateCcw 
} from 'lucide-react';

const ProfilePage = () => {
  const [user, setUser] = useState({
    name: "Trần Minh",
    id: "NLĐ-4832",
    role: "Nhân lao động",
    email: "minh.tran@company.vn",
    phone: "+84 912 345 678",
    unit: "Xưởng Lắp Ráp A",
    shift: "Sáng (06:00 - 14:00)",
    avatar: "Insert avatar here",
    stats: {
      mealsOrdered: 12,
      freeMealsLeft: 3,
      weeklyCost: 560000,
      costLimit: 800000,
      satisfaction: 4.6,
      totalReviews: 18
    }
  });

  const [formData, setFormData] = useState({ ...user });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [currentLang, setCurrentLang] = useState('vi');

  const handleLogout = () => {
    const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (confirm) {
      console.log("Logging out...");
      window.location.href = "/login";
    }
  };

  const handleSaveSettings = () => {
    setUser(formData);
    alert("Đã lưu thay đổi thành công!");
  };

  const handleResetSettings = () => {
    setFormData(user);
    alert("Đã khôi phục dữ liệu gốc.");
  };

  const toggle2FA = () => {
    setIs2FAEnabled(!is2FAEnabled);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-6 h-6" />
              Hồ sơ & Bảng điều khiển
            </h2>
            <div className="flex bg-white rounded-full px-2 py-1 shadow-sm text-sm">
              {['Bảng điều khiển', 'Cập nhật', 'Cài đặt', 'Ngôn ngữ'].map((tab) => (
                <button 
                  key={tab}
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
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-emerald-50 mb-2"
                    />
                    <h4 className="font-bold text-lg">{user.name}</h4>
                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                      Vai trò: {user.role}
                    </span>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm w-full">
                    <InfoRow icon={Mail} label="Email" value={user.email} />
                    <InfoRow icon={Phone} label="Số điện thoại" value={user.phone} />
                    <InfoRow icon={Briefcase} label="Đơn vị" value={user.unit} />
                    <InfoRow icon={Clock} label="Ca làm" value={user.shift} />
                    
                    <div className="col-span-1 md:col-span-2 flex gap-3 mt-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#1a3c35] text-white rounded-lg hover:bg-[#142e29] transition-colors text-sm font-medium">
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
                        <p className="text-xs text-gray-500">Tối ưu tốc độ tải menu và giỏ hàng.</p>
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
                        <p className="text-xs text-gray-500">Bật xác thực hai lớp cho tài khoản của bạn.</p>
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
                  <LangOption 
                    active={currentLang === 'vi'} 
                    onClick={() => setCurrentLang('vi')}
                    label="Tiếng Việt" 
                    sub="Hiện tại" 
                    btnText="Đang dùng"
                    dark
                  />
                  <LangOption 
                    active={currentLang === 'en'} 
                    onClick={() => setCurrentLang('en')}
                    label="English" 
                    sub="Giao diện tiếng Anh" 
                    btnText="Chọn"
                  />
                  <LangOption 
                    active={currentLang === 'jp'} 
                    onClick={() => setCurrentLang('jp')}
                    label="日本語" 
                    sub="Japanese interface" 
                    btnText="Chọn"
                  />
                </div>
              </div>

            </div>

            <div className="space-y-6">

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt nhanh</h3>
                <div className="space-y-4">
                  
                  <div className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                    <div className="flex gap-3">
                      <div className="mt-1"><Clock className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <p className="font-bold text-sm text-gray-700">Suất đã đặt tuần này</p>
                        <p className="text-xs text-gray-500">{user.stats.mealsOrdered} suất • Còn {user.stats.freeMealsLeft} suất miễn phí</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Tốt</span>
                  </div>

                  <div className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                    <div className="flex gap-3">
                      <div className="mt-1"><Briefcase className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <p className="font-bold text-sm text-gray-700">Chi phí tuần</p>
                        <p className="text-xs text-gray-500">
                          {user.stats.weeklyCost.toLocaleString()}đ • Giới hạn {user.stats.costLimit.toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Trong hạn</span>
                  </div>

                  <div className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                    <div className="flex gap-3">
                      <div className="mt-1"><User className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <p className="font-bold text-sm text-gray-700">Điểm hài lòng</p>
                        <p className="text-xs text-gray-500">{user.stats.satisfaction}/5 • {user.stats.totalReviews} đánh giá</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Cao</span>
                  </div>

                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Cài đặt</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Tên hiển thị</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Điện thoại</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Đơn vị</label>
                    <input 
                      type="text" 
                      name="unit" 
                      value={formData.unit} 
                      disabled
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" 
                    />
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                    >
                      Lưu thay đổi
                    </button>
                    <button 
                      onClick={handleResetSettings}
                      className="px-6 py-2.5 bg-green-100 hover:bg-green-200 text-[#1a3c35] text-sm font-bold rounded-xl transition-colors"
                    >
                      Khôi phục
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-400 text-xs mb-1">{label}</span>
    <div className="flex items-center gap-2 font-medium text-gray-700">
      {value}
    </div>
  </div>
);

const LangOption = ({ label, sub, btnText, active, dark, onClick }) => (
  <div className={`flex justify-between items-center p-4 rounded-xl border ${active ? 'bg-gray-50 border-emerald-500' : 'bg-white border-gray-100'}`}>
    <div>
      <p className="font-bold text-sm text-gray-800">{label}</p>
      <p className="text-xs text-gray-500">{sub}</p>
    </div>
    <button 
      onClick={onClick}
      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
        dark 
          ? 'bg-[#1a3c35] text-white' 
          : 'bg-green-100 text-green-700 hover:bg-green-200'
      }`}
    >
      {btnText}
    </button>
  </div>
);

export default ProfilePage;