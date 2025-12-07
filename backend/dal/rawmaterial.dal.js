import { supabase } from '../database/supabase.js'

export const getAllRawMaterials = async () => {
    const { data, error } = await supabase.from('rawmaterial').select('*')
    if (error) throw error
    return data
}

export const getRawMaterialById = async (id) => {
    const { data, error } = await supabase
        .from('rawmaterial')
        .select('*')
        .eq('id', id)
        .single()
    if (error) throw error
    return data
}

export const createRawMaterial = async (material) => {
    const { data, error } = await supabase
        .from('rawmaterial')
        .insert([material])
        .select()
        .single()
    if (error) throw error
    return data
}

export const updateRawMaterial = async (id, material) => {
    const { data, error } = await supabase
        .from('rawmaterial')
        .update(material)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data
}

export const deleteRawMaterial = async (id) => {
    const { error } = await supabase.from('rawmaterial').delete().eq('id', id)
    if (error) throw error
    return true
}
