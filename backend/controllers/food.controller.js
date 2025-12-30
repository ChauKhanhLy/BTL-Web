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
export async function createFood(req, res) {
  try {
    const food = await foodService.createFood(req.body);

    res.status(201).json(food);
  } catch (err) {
    res.status(400).json({
      message: err.message || "Create food failed",
      code: err.code,
    });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await foodService.getCategories();
    res.json(categories);


  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ message: "Failed to get categories" });
  }
}