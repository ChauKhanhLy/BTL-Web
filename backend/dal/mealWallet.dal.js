import { supabase } from "../database/supabase.js";

export async function getWalletByUser(userId) {
  const { data, error } = await supabase
    .from("meal_wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateBalance(userId, newBalance) {
  const { data, error } = await supabase
    .from("meal_wallets")
    .update({ 
      balance: newBalance, 
      updated_at: new Date() 
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addTransaction(tx) {
  const { error } = await supabase
    .from("meal_wallet_transactions")
    .insert(tx);

  if (error) throw error;
}
