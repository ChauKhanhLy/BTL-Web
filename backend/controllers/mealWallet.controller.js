import { getMealWallet } from "../services/mealWallet.service.js";

export async function getWallet(req, res) {
  try {
    const { user_id } = req.query;
    const wallet = await getMealWallet(user_id);
    res.json(wallet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
