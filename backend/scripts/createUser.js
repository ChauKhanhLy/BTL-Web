import bcrypt from "bcrypt";
import { supabase } from "../database/supabase.js";

const run = async () => {
  const password = "123456";
  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name: "Nguyen Van A",
        ten_dang_nhap: "user1",
        password: hashed,
        role: "customer",
        gmail: "user1@gmail.com",
      },
    ]);

  if (error) {
    console.error("Lỗi:", error);
  } else {
    console.log("Tạo user thành công:", data);
  }
};

run();
