import express from "express";
import { getStats, getSummary } from "../controllers/stats.controller.js";


const router = express.Router();

router.get("/meals", getStats);
router.get("/summary", getSummary);

export default router;