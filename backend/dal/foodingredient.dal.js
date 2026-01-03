import { supabase } from "../database/supabase.js";


export const getByFoodId = async (foodId) => {
    const { data, error } = await supabase
        .from('foodingredients')
        .select('*')
        .eq('food_id', foodId)
    if (error) throw error
    return data
}

export const createIngredient = async (ingredient) => {
    const { data, error } = await supabase
        .from('foodingredients')
        .insert([ingredient])
        .select()
        .single()
    if (error) throw error
    return data
}

export const updateIngredient = async (id, ingredient) => {
    const { data, error } = await supabase
        .from('foodingredients')
        .update(ingredient)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data
}

export const deleteIngredient = async (id) => {
    const { error } = await supabase
        .from('foodingredients')
        .delete()
        .eq('id', id)
    if (error) throw error
    return true
}
