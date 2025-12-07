import { supabase } from '../database/supabase.js'

/**
 * Lấy tất cả user
 */
export const getAllUsers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('*')

    if (error) throw error
    return data
}

/**
 * Lấy user theo id
 */
export const getUserById = async (id) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

/**
 * Tạo user mới
 */
export const createUser = async (user) => {
    const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Cập nhật user
 */
export const updateUser = async (id, user) => {
    const { data, error } = await supabase
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Xoá user
 */
export const deleteUser = async (id) => {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}
