import * as foodDAL from '../dal/food.dal.js'

export const getAllFoodService = async () => {
  const foods = await foodDAL.getAllFood()

  // Ví dụ xử lý logic thêm (optional)
  return foods.map(food => ({
    ...food,
    price: Number(food.price),
  }))
}

export const getFoodByIdService = async (id) => {
  if (!id) {
    throw new Error('Food ID is required')
  }

  const food = await foodDAL.getFoodById(id)

  if (!food) {
    throw new Error('Food not found')
  }

  return food
}