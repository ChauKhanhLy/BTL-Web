import express from 'express'
import * as foodController from '../controllers/food.controller.js'
import { getCategories } from "../controllers/food.controller.js";

const router = express.Router()

router.get('/food', foodController.getAllFood)
router.get('/food/:id', foodController.getFoodById)
router.post("/food", foodController.createFood);
router.get("/categories", getCategories);

export default router
