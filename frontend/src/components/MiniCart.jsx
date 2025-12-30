import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MiniCart({setCurrentPage }) {
  const { cart, removeFromCart } = useCart();

  const subtotal = cart.reduce((t, i) => t + i.qty * i.price, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full bg-white shadow-md rounded-xl p-4 border mt-4"
      >
        <h2 className="font-bold text-lg mb-3">Đơn của bạn</h2>

        {cart.length === 0 && (
          <p className="text-gray-500 text-sm">Chưa có món nào</p>
        )}

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.qty} × {item.price.toLocaleString()}đ
                </p>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
          <span>Tổng:</span>
          <span>{subtotal.toLocaleString()}đ</span>
        </div>

        <button
          onClick={() => setCurrentPage("cart")}
          className="block w-full text-center bg-orange-500 text-white py-2 rounded-xl mt-3"
        >Xem giỏ hàng</button>
      </motion.div>
    </AnimatePresence>
  );
}
