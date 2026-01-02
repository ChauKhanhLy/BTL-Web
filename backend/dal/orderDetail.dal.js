import { supabase } from '../database/supabase.js'

export const getDetailsByOrder = async (orderId) => {
    const { data, error } = await supabase
        .from('orderDetails')
        .select(`
            *,
            food:food_id (
                id,
                name,
                price,
                image_url,
                description,
                kcal,
                protein
            )
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Format data để dễ sử dụng
    return data.map(item => ({
        order_id: item.order_id,
        food_id: item.food_id,
        amount: item.amount,
        price: item.price,
        created_at: item.created_at,
        food: item.food || {}
    }));
}

export const getOrderDetailsWithFood = async (orderId) => {
    const { data, error } = await supabase
        .from('orderDetails')
        .select(`
            id,
            order_id,
            food_id,
            amount,
            price,
            created_at,
            food:food_id (
                id,
                name,
                image_url,
                description,
                kcal,
                protein,
                category
            )
        `)
        .eq('order_id', orderId);
    
    if (error) throw error;
    
    return data || [];
}


export const createOrderDetail = async (detail) => {
    console.log("🔵 [DAL] createOrderDetail called:", detail);
    
    try {
        const insertData = {
            order_id: detail.order_id,
            food_id: detail.food_id,
            amount: detail.amount,
            price: detail.price || 0,
            original_price: detail.original_price || detail.price || 0,
            is_combo_item: detail.is_combo_item || false,
            created_at: new Date().toISOString()
        };
        
        console.log("Insert data:", insertData);
        
        const { data, error } = await supabase
            .from('orderDetails')
            .insert([insertData])
            .select()
            .single();
        
        if (error) {
            console.error("[DAL] createOrderDetail ERROR:", error);
            throw error;
        }
        
        console.log("[DAL] createOrderDetail SUCCESS:", data);
        return data;
        
    } catch (err) {
        console.error("[DAL] createOrderDetail CATCH ERROR:", err);
        throw err;
    }
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