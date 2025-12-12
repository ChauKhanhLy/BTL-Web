import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MiniCart() {
  const { cart, removeFromCart } = useCart();

  const subtotal = cart.reduce((t, i) => t + i.qty * i.price, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}   // bắt đầu lệch phải
        animate={{ x: 0, opacity: 1 }}     // trượt vào
        exit={{ x: 300, opacity: 0 }}      // trượt ra (nếu cần)
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed right-4 top-24 w-72 bg-white shadow-xl rounded-xl p-4 border z-50"
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

        <a
          href="/cart"
          className="block text-center bg-orange-500 text-white py-2 rounded-xl mt-3"
        >
          Xem giỏ hàng
        </a>
      </motion.div>
    </AnimatePresence>
  );
}
