import { supabase } from '../database/supabase.js'

export const getCategories = async () => {
    const { data, error } = await supabase
        .from("categories")
        .select("*");
    if (error) throw error;
    return data;
};

export const getCategoryById = async (id) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export const createCategory = async (category) => {
    const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single()

    if (error) throw error
    return data
}


export const updateCategory = async (id, category) => {
    const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export const deleteCategory = async (id) => {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}
