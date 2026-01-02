// mealWallet.controller.js - Thêm hàm chi tiết
import { getMealWallet, getWalletWithTransactions } from "../services/mealWallet.service.js";

export async function getWallet(req, res) {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: "Thiếu user_id" });
    }
    
    const wallet = await getMealWallet(user_id);
    res.json(wallet);
  } catch (err) {
    console.error("Get wallet error:", err);
    res.status(400).json({ error: err.message });
  }
}

// Thêm hàm mới để lấy cả số dư và lịch sử
export async function getWalletDetails(req, res) {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: "Thiếu user_id" });
    }
    
    // Lấy số dư
    const wallet = await getMealWallet(user_id);
    
    // Lấy lịch sử giao dịch (nếu cần)
    const { data: transactions, error } = await supabase
      .from("meal_wallet_transactions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    res.json({
      balance: wallet.balance || 0,
      transactions: transactions || [],
      last_updated: new Date().toISOString()
    });
    
  } catch (err) {
    console.error("Get wallet details error:", err);
    res.status(400).json({ error: err.message });
  }
}