import express from "express";
import {
    getMenuByDay,
    addFoodToDay,
    removeFoodFromDay,

} from "../controllers/menu.controller.js";

const router = express.Router();

router.get("/", getMenuByDay);

router.post("/add", addFoodToDay);

router.delete("/remove", removeFoodFromDay);


export default router;
