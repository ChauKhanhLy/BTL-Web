import { createOrder } from "../dal/orders.dal.js"
import { createOrderDetail } from "../dal/orderDetail.dal.js"
import { supabase } from "../database/supabase.js"

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

export const getRecentOrders = async (req, res) => {
  const { user_id } = req.query;

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      orderDetails (
        food ( name )
      )
    `)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) return res.status(500).json({ error: error.message });

  const result = data.map(order => ({
    id: order.id,
    orderId: `#${order.id.slice(0, 6)}`,
    time: new Date(order.created_at).toLocaleString(),
    items: order.orderDetails.map(d => d.food.name)
  }));

  res.json(result);
};

