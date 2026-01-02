import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  getUserByEmail,
  createUser,
  updateUser,
} from "../dal/users.dal.js";
import { loginService } from "../services/auth.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "abc_kitchen_secret";

export const login = async (req, res) => {
  try {
    const { ten_dang_nhap, password } = req.body;
    //console.log("REQ BODY:", req.body);

    const result = await loginService(ten_dang_nhap, password);

    const token = jwt.sign(
      {
        id: result.user.id,
        role: result.user.role,
        //ten_dang_nhap: result.user.ten_dang_nhap,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      user: result.user,
      token,
      mustChangePassword: result.mustChangePassword,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// ================= QUÊN MẬT KHẨU =================
export const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Email không tồn tại" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await updateUser(user.id, { password: hashed });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ================= ĐỔI MẬT KHẨU LẦN ĐẦU =================
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // lấy từ token
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "Thiếu mật khẩu mới" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await updateUser(userId, {
      password: hashed,
      is_first_login: false,
    });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// ================= ADMIN TẠO USER =================
export const createUserByAdmin = async (req, res) => {
  try {
    const { ten_dang_nhap, password, role } = req.body;

    if (!ten_dang_nhap || !password) {
      return res.status(400).json({ error: "Thiếu thông tin" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      ten_dang_nhap,
      password: hashedPassword,
      role: role || "customer",
      is_first_login: true,
    });

    res.json({
      message: "Tạo tài khoản thành công",
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};