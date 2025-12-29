import express from "express";
import { 
    checkout, //admin 
    getOrderStats, //admin
    userCheckout, //user
    getUserOrders, 
    getUserRecentOrders,
 } from "../controllers/order.controller.js";

const router = express.Router();

// Trang checkout
router.post("/checkout", checkout);

// Trang dashboard / thống kê
router.get("/stats", getOrderStats);

/* ===== USER ===== */
router.post("/user/checkout", userCheckout);
router.get("/user/:userId", getUserOrders);
router.get("/user/recent", getUserRecentOrders);


export default router;