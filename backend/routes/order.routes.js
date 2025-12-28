import express from "express";
import { checkout, getOrderStats } from "../controllers/order.controller.js";

const router = express.Router();

// Trang checkout
router.post("/checkout", checkout);

// Trang dashboard / thống kê
router.get("/stats", getOrderStats);

export default router;
