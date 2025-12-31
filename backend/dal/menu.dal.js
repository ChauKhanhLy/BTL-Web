import { supabase } from '../database/supabase.js'

export const findMenuByDay = async (day) => {
    const { data, error } = await supabase
        .from("menu_day_food")
        .select(`
            food:food_id (
                id,
                name,
                price,
                category,
                ingredients,
                image_url
            )
        `)
        .eq("day", day);

    if (error) throw error;

    return data.map(row => row.food);
};

export const countMenuByDay = async (day) => {
    const { count, error } = await supabase
        .from("menu_day_food")
        .select("*", { count: "exact", head: true })
        .eq("day", day);

    if (error) throw error;

    return count;
};

export const findFoodIdsByDay = async (day) => {
    const { data, error } = await supabase
        .from("menu_day_food")
        .select("food_id")
        .eq("day", day);

    if (error) throw error;

    return data.map(row => row.food_id);
};

export const findAllFoodIdsExcept = async (excludedIds = []) => {
    let query = supabase
        .from("food")
        .select("id");

    if (excludedIds.length > 0) {
        query = query.not(
            "id",
            "in",
            `(${excludedIds.join(",")})`
        );
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(row => row.id);
};

export const existsMenuItem = async (day, foodId) => {
    const { data, error } = await supabase
        .from("menu_day_food")
        .select("id")
        .eq("day", day)
        .eq("food_id", foodId)
        .maybeSingle();

    if (error) throw error;

    return !!data;
};

export const insertMenuItem = async (day, foodId) => {
    const { error } = await supabase
        .from("menu_day_food")
        .insert({
            day,
            food_id: foodId,
        });

    if (error) throw error;
};

export const insertMenuItems = async (items) => {
    const { error } = await supabase
        .from("menu_day_food")
        .insert(items);

    if (error) throw error;
};

export const deleteMenuItem = async (day, foodId) => {
    const { error } = await supabase
        .from("menu_day_food")
        .delete()
        .eq("day", day)
        .eq("food_id", foodId);

    if (error) throw error;
};
