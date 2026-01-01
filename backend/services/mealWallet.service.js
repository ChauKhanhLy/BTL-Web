import { supabase } from "../database/supabase.js";
import * as walletDAL from "../dal/mealWallet.dal.js";

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

export async function payByMealCard({ userId, amount, orderId }) {
  const wallet = await walletDAL.getWalletByUser(userId);

  const newBalance = wallet.balance - amount;

  await walletDAL.updateBalance(userId, newBalance);

  await walletDAL.addTransaction({
    user_id: userId,
    order_id: orderId,
    amount: -amount,
    type: "payment",
    note: "Thanh toán bữa ăn"
  });

  return {
    paid: true,
    balance_after: newBalance
  };
}