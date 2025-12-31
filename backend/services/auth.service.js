import bcrypt from "bcrypt";
import { getUserByUsername } from "../dal/users.dal.js";


const hash = "$2b$10$QZQw7KxF1U6xjLw8nFqN0e9mV7ZJkA8bJ0Y2nF5h7ZrQpQkQk9z9a";

(async () => {
  console.log(await bcrypt.compare("matkhau123", hash));
  console.log(await bcrypt.compare("123456", hash));
  console.log(await bcrypt.compare("admin", hash));
})();
export const loginService = async (ten_dang_nhap, password) => {
  const user = await getUserByUsername(ten_dang_nhap);

  console.log("FOUND USER:", user);
  console.log("INPUT PASSWORD:", `"${password}"`);
  console.log("HASH FROM DB:", user.password);

  if (!user) {
    throw new Error("Không tìm thấy user");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log("PASSWORD MATCH:", isMatch);

  if (!isMatch) {
    throw new Error("Sai mật khẩu");
  }

  return {
    user,
    //token: "test",
    mustChangePassword: user.is_first_login,
  };
};
