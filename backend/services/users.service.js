import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { getUserByUsername } from "../dal/users.dal.js"

const JWT_SECRET = process.env.JWT_SECRET || "abc_kitchen_secret"
const JWT_EXPIRES_IN = "7d"

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
