import express from "express";
import { 
    checkout, //admin 
    getOrderStats, //admin
    userCheckout, //user
    getUserOrders, 
    getUserRecentOrders,
    getUserStats,
    confirmCash,
    getUserOrderDetails,
    getOrderDetails,
    
 } from "../controllers/order.controller.js";

const router = express.Router();

// Trang checkout
router.post("/checkout", checkout);

// Trang dashboard / thống kê
router.get("/stats", getOrderStats);
router.put("/:id/confirm-cash", confirmCash); // Admin confirm cash payment

/* ===== USER ===== */
router.post("/user/checkout", userCheckout);
router.get("/user/:userId", getUserOrders);
router.get("/user/recent", getUserRecentOrders);
router.get("/user/stats", getUserStats);
router.get("/user/:userId/details", getUserOrderDetails);
router.get("/:id/details", getOrderDetails); // Thêm route này
export default router;