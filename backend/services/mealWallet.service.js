import { supabase } from "../database/supabase.js";
import * as walletDAL from "../dal/mealWallet.dal.js";

// mealWallet.service.js - Cải thiện hàm getMealWallet
export async function getMealWallet(userId) {
  if (!userId) throw new Error("Missing user_id");

  try {
    const { data, error } = await supabase
      .from("meal_wallets")
      .select("balance, updated_at")
      .eq("user_id", userId)
      .single();

    if (error) {
      // Nếu không tìm thấy wallet, tạo mới với balance = 0
      if (error.code === 'PGRST116') {
        console.log("Wallet not found, creating new one for user:", userId);
        
        const { data: newWallet, error: createError } = await supabase
          .from("meal_wallets")
          .insert([{ 
            user_id: userId, 
            balance: 0,
            created_at: new Date(),
            updated_at: new Date()
          }])
          .select()
          .single();
          
        if (createError) throw createError;
        return newWallet;
      }
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Get meal wallet error:", err);
    throw err;
  }
}

// Thêm hàm mới để lấy số dư và lịch sử giao dịch
export async function getWalletWithTransactions(userId) {
  if (!userId) throw new Error("Missing user_id");

  try {
    // Lấy số dư
    const { data: wallet, error: walletError } = await supabase
      .from("meal_wallets")
      .select("balance, updated_at")
      .eq("user_id", userId)
      .single();

    if (walletError) {
      // Nếu không tìm thấy wallet, tạo mới
      if (walletError.code === 'PGRST116') {
        console.log("Creating new wallet for user:", userId);
        
        const { data: newWallet, error: createError } = await supabase
          .from("meal_wallets")
          .insert([{ 
            user_id: userId, 
            balance: 0,
            created_at: new Date(),
            updated_at: new Date()
          }])
          .select()
          .single();
          
        if (createError) throw createError;
        
        return {
          balance: newWallet.balance || 0,
          transactions: [],
          last_updated: newWallet.updated_at
        };
      }
      throw walletError;
    }

    // Lấy lịch sử giao dịch
    const { data: transactions, error: txError } = await supabase
      .from("meal_wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (txError) throw txError;

    return {
      balance: wallet.balance || 0,
      transactions: transactions || [],
      last_updated: wallet.updated_at
    };

  } catch (err) {
    console.error("Get wallet with transactions error:", err);
    throw err;
  }
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