import express from 'express'
import * as foodController from '../controllers/food.controller.js'

const router = express.Router()

router.get('/', foodController.getAllFood)
router.get('/:id', foodController.getFoodById)

export default router
