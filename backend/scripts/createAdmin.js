import bcrypt from "bcrypt";
import { supabase } from "../database/supabase.js";

console.log("SUPABASE_URL =", process.env.SUPABASE_URL);

const createAdmin = async () => {
  const password = "matkhau123"; // mật khẩu ban đầu
  const hashed = await bcrypt.hash(password, 10);

  const { error } = await supabase.from("users").insert([
    {
      ten_dang_nhap: "tranthib",
      password: hashed,
      role: "admin",
      name: "Quản trị viên",
      is_first_login: false,
    },
  ]);

  if (error) {
    console.error(error);
  } else {
    console.log("Tạo admin thành công");
  }
};

createAdmin();
