import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { getUserByUsername } from "../dal/users.dal.js"
import { supabase } from '../database/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || "abc_kitchen_secret"
const JWT_EXPIRES_IN = "7d"

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey)

export const loginService = async (ten_dang_nhap, password) => {
  // 1. tìm user
  const user = await getUserByUsername(ten_dang_nhap)
  if (!user) {
    throw new Error("Sai tên đăng nhập hoặc mật khẩu")
  }

  // 2. check password
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error("Sai tên đăng nhập hoặc mật khẩu")
  }

  // 3. tạo token
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      ten_dang_nhap: user.ten_dang_nhap,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  // 4. ẩn password
  delete user.password

  return { user, token }
}

const fetchUsers = async (query) => {
  const users = await userDal.getAllUsers(query);
  const stats = await userDal.getUserStats();
  return { users, stats };
};

const changeUserStatus = async (userId, action) => {
  let newStatus;
  switch (action) {
    case 'verify': newStatus = 'Verified'; break;
    case 'suspend': newStatus = 'Suspended'; break;
    case 'unlock': newStatus = 'Verified'; break;
    default: throw new Error("Invalid action");
  }
  return await userDal.updateUserStatus(userId, newStatus);
};

const inviteUser = async (userId) => {
  const user = await userDal.getAllUsers({ id: userId });
  console.log(`Sending email to ${user.gmail}...`);
  return { message: "Invitation sent successfully" };
};

export const getUserProfile = async (userId) => {
  const user = await userDal.findUserById(userId);
  if (!user) throw new Error('User not found');

  return {
    id: user.id,
    name: user.name,
    email: user.gmail, // Database: gmail
    phone: user.sdt,   // Database: sdt
    role: user.role,
    unit: user.unit || "",
    shift: user.shift || "",
    avatar: user.avatar_url || "/default-avatar.png"
  };
};

export const updateUserProfile = async (userId, data) => {
  const dbData = {};
  if (data.name) dbData.name = data.name;
  if (data.email) dbData.gmail = data.email;
  if (data.phone) dbData.sdt = data.phone;
  if (data.unit) dbData.unit = data.unit;
  if (data.shift) dbData.shift = data.shift;

  const updatedUser = await userDal.updateUser(userId, dbData);
  
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.gmail,
    phone: updatedUser.sdt,
    unit: updatedUser.unit,
    shift: updatedUser.shift,
    role: updatedUser.role,
    avatar: updatedUser.avatar_url
  };
};

export const updateUserAvatar = async (userId, file) => {
  // 1. Upload to Supabase Storage
  const filePath = `public/${userId}_${Date.now()}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) throw new Error('Storage upload failed: ' + error.message);

  // 2. Get Public URL
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  // 3. Update DB
  await userDal.updateUser(userId, { avatar_url: publicUrl });

  return publicUrl;
};

module.exports = {
  fetchUsers,
  changeUserStatus,
  inviteUser
};
