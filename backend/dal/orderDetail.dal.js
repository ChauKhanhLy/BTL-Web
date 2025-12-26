import { supabase } from '../database/supabase.js'

export const getDetailsByOrder = async (orderId) => {
    const { data, error } = await supabase
        .from('orderDetails')
        .select('*')
        .eq('order_id', orderId)
    if (error) throw error
    return data
}

export const createOrderDetail = async (detail) => {
    const { data, error } = await supabase
        .from('orderDetails')
        .insert([detail])
        .select()
        .single()
    if (error) throw error
    return data
}

export const updateOrderDetail = async (id, detail) => {
    const { data, error } = await supabase
        .from('orderDetails')
        .update(detail)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data
}

export const deleteOrderDetail = async (id) => {
    const { error } = await supabase.from('orderDetails').delete().eq('id', id)
    if (error) throw error
    return true
}
