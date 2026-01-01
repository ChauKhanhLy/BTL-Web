import express from "express";
import { 
  getStats, 
  getSummary,
  getChartData,
  getTopFoods,
  getPaymentMethodStats
} from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/meals", getStats);
router.get("/summary", getSummary);
router.get("/chart", getChartData);
router.get("/top-foods", getTopFoods);
router.get("/payment-stats", getPaymentMethodStats);

export default router;