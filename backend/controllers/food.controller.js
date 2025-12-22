import * as foodDAL from '../dal/food.dal.js'

export const getAllFood = async (req, res) => {
  try {
    const data = await foodDAL.getAllFood()
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getFoodById = async (req, res) => {
  try {
    const data = await foodDAL.getFoodById(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}
