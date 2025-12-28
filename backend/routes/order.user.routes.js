import express from "express";
import { getMyOrders, getMyStats } from "../controllers/order.user.controller.js";

const router = express.Router();

router.get("/", getMyOrders);
router.get("/stats", getMyStats);

export default router;