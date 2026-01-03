import express from "express";
import {
  getUsers,
  getUserProfile,
  createUser,
  deleteUser,
  updateUserStatus,
  sendInvite
} from "../controllers/users.controller.js";

const router = express.Router();
console.log("🔥 USERS ROUTES LOADED");

router.get("/", getUsers);                // GET /api/users
router.get("/:id", getUserProfile);       // GET /api/users/:id
router.post("/", createUser);             // POST /api/users
router.delete("/:id", deleteUser);        // DELETE /api/users/:id
router.put("/:id/status", updateUserStatus); // PUT /api/users/:id/status

export default router;
