import express from "express";
import { getStats } from "../controllers/stats.user.controller.js";

const router = express.Router();

router.get("/meals", getStats);

export default router;