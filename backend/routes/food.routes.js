import express from "express";
import * as foodController from "../controllers/food.controller.js";

const router = express.Router();

/* CATEGORIES */
router.get("/categories", foodController.getCategories);
/* FOOD */
router.get("/", foodController.getAllFood);
router.get("/:id", foodController.getFoodById);
router.post("/", foodController.createFood);


export default router;