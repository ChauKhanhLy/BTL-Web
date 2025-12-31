import { supabase } from "../database/supabase.js";

export async function getMealWallet(userId) {
  if (!userId) throw new Error("Missing user_id");

  const { data, error } = await supabase
    .from("meal_wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  return data;
}
