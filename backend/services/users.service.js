import * as userDAL from "../dal/users.dal.js";
import bcrypt from 'bcrypt';

/* ================= USERS ================= */

export async function getUsers({ status, search }) {
  const users = await userDAL.getAllUsersByStatus({ status, search });
  const stats = await userDAL.getUserStats();

  return {
    users,
    stats
  };
}

export async function getUserById(id) {
  const user = await userDAL.getUserById(id);
  if (!user) throw new Error("USER_NOT_FOUND");
  return user;
}
export async function createUser(data) {
  console.log("CREATE USER DATA RECEIVED:", data); // THÊM LOG NÀY

  const { name, gmail, sdt } = data;

  if (!name || !gmail || !sdt) {
    throw new Error("MISSING_FIELDS");
  }

  // Kiểm tra email đã tồn tại chưa
  try {
    const existingUser = await userDAL.getUserByEmail(gmail);
    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
  } catch (err) {
    // Email chưa tồn tại, tiếp tục
  }

  const ten_dang_nhap = name.replace(/\s+/g, "").toLowerCase();
  const rawPassword = "123456";

  console.log("Generating hash for password..."); // LOG

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  console.log("Creating user with data:", { // LOG
    name, gmail, sdt, ten_dang_nhap,
    password: "***", role: "customer", status: "Verified"
  });

  try {
    const result = await userDAL.createUser({
      name,
      gmail,
      sdt,
      ten_dang_nhap,
      password: hashedPassword,
      role: "customer",
      status: "Verified", // ĐẢM BẢO CHỮ HOA
    });

    console.log("CREATE USER SUCCESS:", result); // LOG
    return result;
  } catch (err) {
    console.error("CREATE USER DAL ERROR:", err.message, err.details); // LOG CHI TIẾT
    throw new Error(`CREATE_FAILED: ${err.message}`);
  }
}
export async function deleteUser(id) {
  return await userDAL.deleteUser(id);
}

export async function updateStatus(id, status) {
  if (!["Verified", "Unverified", "Suspended"].includes(status)) {
    throw new Error("INVALID_STATUS");
  }

  return await userDAL.updateUserStatus(id, status);
}


