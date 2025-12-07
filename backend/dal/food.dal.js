import { supabase } from '../database/supabase.js'

export const getAllFood = async () => {
    const { data, error } = await supabase.from('food').select('*')
    if (error) throw error
    return data
}

export const getFoodById = async (id) => {
    const { data, error } = await supabase
        .from('food')
        .select('*')
        .eq('id', id)
        .single()
    if (error) throw error
    return data
}

export const createFood = async (food) => {
    const { data, error } = await supabase
        .from('food')
        .insert([food])
        .select()
        .single()
    if (error) throw error
    return data
}

export const updateFood = async (id, food) => {
    const { data, error } = await supabase
        .from('food')
        .update(food)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data
}

export const deleteFood = async (id) => {
    const { error } = await supabase.from('food').delete().eq('id', id)
    if (error) throw error
    return true
}
