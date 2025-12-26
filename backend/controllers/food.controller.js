import * as foodDAL from '../dal/food.dal.js'

export const getAllFood = async (req, res) => {
  try {
    const data = await foodDAL.getAllFood()
    console.log("DATA:", data)
    res.json(data)
  } catch (err) {
    console.error(err)
    console.error("API ERROR:", err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getFoodById = async (req, res) => {
  try {
    const data = await foodDAL.getFoodById(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
