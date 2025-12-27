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
    const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single()
    if (error) throw error
    return data
}

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