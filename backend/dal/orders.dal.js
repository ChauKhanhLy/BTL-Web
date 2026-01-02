import { supabase } from '../database/supabase.js'

export const getAllOrders = async () => {
  const { data, error } = await supabase.from('orders').select('*')
  if (error) throw error
  return data
}

export const getOrderById = async (id) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createOrder = async (order) => {
  try {
    console.log("Creating order in DB:", order);
    
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase create order error:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log("Order created successfully:", data);
    return data;
    
  } catch (err) {
    console.error("createOrder DAL error:", err);
    throw new Error(`Không thể tạo đơn hàng: ${err.message}`);
  }
};
  

export const updateOrder = async (id, order) => {
  const { data, error } = await supabase
    .from('orders')
    .update(order)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteOrder = async (id) => {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function getOrdersByDate(startDate) {
  const { data, error } = await supabase
    .from("orders")
    .select("id, date, price, status, paid")
    .gte("date", startDate);

  if (error) throw error;
  return data;
}

export const getOrdersByUser = async (userId) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getOrdersByUserAndDate = async (userId, fromDate, toDate) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      paid,
      payment_method,
      created_at,
      orderDetails (
        amount,
        food (
          name,
          price
        )
      )
    `)
    .eq("user_id", userId)
    .gte("created_at", fromDate.toISOString())
    .lte("created_at", toDate.toISOString());

  if (error) throw error;
  return data;
};
export async function getOrdersByDateAndRange(fromDate, toDate) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      price,
      paid,
      status,
      date,
      users (
        id,
        name
      )
    `)
    .gte("date", fromDate)
    .lte("date", toDate);

  if (error) throw error;

  return data.map(o => ({
    id: o.id,
    user_id: o.users?.id,
    user_name: o.users?.name, // ✅ CÓ user_name
    price: o.price,
    paid: o.paid,
    status: o.status,
    date: o.date,
  }));
}
