import express from "express";
import { getWallet } from "../controllers/mealWallet.controller.js";

const router = express.Router();

router.get("/", getWallet);

export default router;
