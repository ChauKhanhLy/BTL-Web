import * as orderDAL from '../dal/orders.dal.js'
import * as orderDetailDAL from '../dal/ordersdetail.dal.js'

export const createOrder = async (req, res) => {
  try {
    const { user_id, items, total } = req.body

    const order = await orderDAL.createOrder({
      user_id,
      total,
      status: 'pending',
      created_at: new Date()
    })

    for (const item of items) {
      await orderDetailDAL.createOrderDetail({
        order_id: order.id,
        food_id: item.id,
        qty: item.qty,
        price: item.price
      })
    }

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
