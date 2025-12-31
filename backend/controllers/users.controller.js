import { loginService } from "../services/users.service.js"
import * as userService from '../services/user.service.js';

export const login = async (req, res) => {
  try {
    const { ten_dang_nhap, password } = req.body

    const user = await loginService(ten_dang_nhap, password)

    res.json({
      message: "Đăng nhập thành công",
      user
    })
  } catch (err) {
    switch (err.message) {
      case "MISSING_CREDENTIALS":
        return res.status(400).json({ message: "Thiếu thông tin đăng nhập" })

      case "INVALID_PASSWORD":
        return res.status(401).json({ message: "Sai mật khẩu" })

      case "USER_INACTIVE":
        return res.status(403).json({ message: "Tài khoản bị khoá" })

      default:
        return res.status(401).json({
          message: "Tên đăng nhập không tồn tại"
        })
    }
  }
}

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const profile = await userService.getUserProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    const updatedUser = await userService.updateUserProfile(userId, updateData);
    res.json(updatedUser);
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = await userService.updateUserAvatar(userId, file);
    res.json({ avatarUrl });
  } catch (error) {
    console.error('Avatar Upload Error:', error);
    res.status(500).json({ message: error.message });
  }
};
