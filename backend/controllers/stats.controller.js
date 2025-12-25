import { supabase } from "../database/supabase.js"

export const getMealStats = async (req, res) => {
  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" })
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        paid,
        orderDetails (
          quantity,
          price,
          food (
            name
          )
        )
      `)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })

    if (error) throw error

    const meals = []

    data.forEach(order => {
      order.orderDetails.forEach(item => {
        meals.push({
          date: order.created_at.slice(0, 10), // yyyy-mm-dd
          name: item.food.name,
          price: item.price * item.quantity,
          paid: order.paid
        })
      })
    })

    res.json(meals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
