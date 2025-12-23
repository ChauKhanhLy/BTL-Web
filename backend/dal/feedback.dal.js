import { supabase } from '../database/supabase.js'

export const getAllFeedback = async () => {
    const { data, error } = await supabase.from('feedback').select('*')
    if (error) throw error
    return data
}

export const getFeedbackById = async (id) => {
    const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('id', id)
        .single()
    if (error) throw error
    return data
}

export const createFeedback = async (feedback) => {
    const { data, error } = await supabase
        .from('feedback')
        .insert([feedback])
        .select()
        .single()
    if (error) throw error
    return data
}

export const updateFeedback = async (id, feedback) => {
    const { data, error } = await supabase
        .from('feedback')
        .update(feedback)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data
}

export const deleteFeedback = async (id) => {
    const { error } = await supabase.from('feedback').delete().eq('id', id)
    if (error) throw error
    return true
}
