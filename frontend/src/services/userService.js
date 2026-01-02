import {
  getAll,
  createUser as apiCreateUser,
  deleteUser as apiDeleteUser,
  updateStatus as apiUpdateStatus,
  sendInvite,
  getProfile,
} from "../api/user.api";

/* ================= USERS ================= */

async function fetchUsers({ status, search }) {
  return await getAll({ status, search });
}

async function createUser(payload) {
  return await apiCreateUser(payload);
}

async function deleteUser(userId) {
  return await apiDeleteUser(userId);
}

async function updateUserStatus(userId, status) {
  return await apiUpdateStatus(userId, status);
}

async function inviteUser(userId) {
  return await sendInvite(userId);
}

async function getUserProfile(userId) {
  return await getProfile(userId);
}

/* ================= DEFAULT EXPORT ================= */

export default {
  fetchUsers,
  createUser,
  deleteUser,
  updateUserStatus,
  inviteUser,
  getUserProfile,
};
