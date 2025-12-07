import { supabase } from '../database/supabase.js'


export const getAllCategories = async () => {
    const { data, error } = await supabase
        .from('catogories')
        .select('*')

    if (error) throw error
    return data
}

export const getCategoryById = async (id) => {
    const { data, error } = await supabase
        .from('catogories')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export const createCategory = async (category) => {
    const { data, error } = await supabase
        .from('catogories')
        .insert([category])
        .select()
        .single()

    if (error) throw error
    return data
}


export const updateCategory = async (id, category) => {
    const { data, error } = await supabase
        .from('catogories')
        .update(category)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export const deleteCategory = async (id) => {
    const { error } = await supabase
        .from('catogories')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}
