import express from "express"
import { checkout } from "../controllers/order.controller.js"
import { getRecentOrders } from "../controllers/order.controller.js"

const router = express.Router()

router.post("/checkout", checkout)
router.get("/", getRecentOrders);

export default router
