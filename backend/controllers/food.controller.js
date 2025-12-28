import * as foodService from '../services/food.service.js'

export const getAllFood = async (req, res) => {
  try {
    const data = await foodService.getAllFoodService()
    res.json(data)
  } catch (err) {
    console.error("API ERROR:", err.message)
    res.status(500).json({ message: err.message })
  }
}

export const getFoodById = async (req, res) => {
  try {
    const data = await foodService.getFoodByIdService(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}
