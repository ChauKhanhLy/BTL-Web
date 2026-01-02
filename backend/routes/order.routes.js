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
    getOrdersByDate,
    getDashboard,
    getRecentOrders,
    cancelOrderController,
    
 } from "../controllers/order.controller.js";

   

const router = express.Router();

router.post("/checkout", checkout);
router.get("/dashboard", getDashboard);
router.get("/stats", getOrderStats);

router.put("/:id/confirm-paid", confirmCash);
router.get("/", getOrdersByDate);
/* ===== USER ===== */
router.post("/user/checkout", userCheckout);
router.get("/user/recent", getUserRecentOrders);

router.get("/user/stats", getUserStats);
router.get("/user/:userId", getUserOrders);
router.get("/user/:userId/details", getUserOrderDetails);
router.get("/:id/details", getOrderDetails); // Thêm route này

//router.get("/cancelable", getCancelableOrders);
router.post("/:id/cancel", cancelOrderController);

export default router;