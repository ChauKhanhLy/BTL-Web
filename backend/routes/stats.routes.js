import express from "express"
import { getMealStats } from "../controllers/stats.controller.js"

const router = express.Router()

// GET /api/stats/meals
router.get("/meals", getMealStats)

export default router
