import bcrypt from "bcrypt";
import { getUserByUsername } from "../dal/users.dal.js";
import { getUserByEmail, updateUser } from "../dal/users.dal.js";
import { saveOtp, verifyOtp } from "../services/otp.store.js";
import { sendResetMail } from "./mail.service.js";


export const loginService = async (ten_dang_nhap, password) => {
  const user = await getUserByUsername(ten_dang_nhap);

  if (!user) {
    throw new Error("Không tìm thấy user");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Sai mật khẩu");
  }

  return {
    user,
    mustChangePassword: user.is_first_login,
  };
};
export const forgotPasswordService = async (email) => {
  const user = await getUserByEmail(email);
  console.log(user.gmail);
  // không tiết lộ email có tồn tại hay không
  if (!user) return;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  saveOtp(email, otp);
  await sendResetMail(user.gmail, otp);
};

// ===== RESET PASSWORD BẰNG OTP =====
export const resetPasswordService = async (email, otp, newPassword) => {

  const isValid = verifyOtp(email, otp);
  if (!isValid) {
    throw new Error("OTP không hợp lệ hoặc đã hết hạn");
  }
  const user = await getUserByEmail(email);
  if (!user) {
    // rất hiếm khi xảy ra, nhưng vẫn check
    throw new Error("User không tồn tại");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUser(user.id, {
    password: hashedPassword,
    is_first_login: false,
  });
};
