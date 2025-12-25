import { createOrder } from "../dal/orders.dal.js"
import { createOrderDetail } from "../dal/ordersdetail.dal.js"

export const checkout = async (req, res) => {
  try {
    const { user_id, cart, address, note } = req.body

    // 1. tạo order
    const order = await createOrder({
      user_id,
      total_price: cart.reduce((s, i) => s + i.price * i.qty, 0),
      status: "pending",
      paid: false,
      address,
      note
    })

    // 2. tạo order details
    for (const item of cart) {
      await createOrderDetail({
        order_id: order.id,
        food_id: item.id,
        quantity: item.qty,
        price: item.price
      })
    }

    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
