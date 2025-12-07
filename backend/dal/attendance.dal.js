import { supabase } from '../database/supabase.js'

/**
 * Lấy tất cả attendance
 */
export const getAllAttendance = async () => {
    const { data, error } = await supabase
        .from('attendance')
        .select('*')

    if (error) throw error
    return data
}

/**
 * Lấy attendance theo user
 */
export const getAttendanceByUser = async (userId) => {
    const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)

    if (error) throw error
    return data
}

/**
 * Lấy attendance theo id
 */
export const getAttendanceById = async (id) => {
    const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}



/**
 * Thêm attendance
 * attendance = {
 *   user_id,
 *   oder_id,
 *   time,
 *   status
 * }
 */
export const createAttendance = async (attendance) => {
    const { data, error } = await supabase
        .from('attendance')
        .insert([attendance])
        .select()
        .single()

    if (error) throw error
    return data
}


/**
 * Cập nhật attendance
 */
export const updateAttendance = async (id, attendance) => {
    const { data, error } = await supabase
        .from('attendance')
        .update(attendance)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Xoá attendance
 */
export const deleteAttendance = async (id) => {
    const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}
