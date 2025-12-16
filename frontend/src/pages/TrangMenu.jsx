import React, { useState, useContext } from "react";
import { useEffect, useRef } from "react";
import { CartContext } from "../context/CartContext";
import MiniCart from "../components/MiniCart";

// GIẢ LẬP DATA MÓN  có thể fetch API sau
const dishes = [
  {
    id: 1,
    name: "Cơm gà nướng sốt mật ong",
    kcal: 540,
    protein: 32,
    price: 45000,
    image: "/images/com-ga.jpg",
    description: "Cơm gà nướng với sốt mật ong thơm ngon.",
    ingredients: "Gà, mật ong, cơm trắng, rau thơm.",
    rating: 4.6,
    reviews: 28,
  },
  {
    id: 2,
    name: "Cơm cuộn tổng hợp",
    kcal: 410,
    protein: 28,
    price: 55000,
    image: "/images/com-cuon.jpg",
    description: "Cơm cuộn Hàn Quốc nhiều nhân.",
    ingredients: "Rong biển, cơm, trứng, chả, rau củ.",
    rating: 4.8,
    reviews: 40,
  },
  {
    id: 3,
    name: "Salad ngũ cốc xanh",
    kcal: 300,
    protein: 20,
    price: 39000,
    image: "/images/salad.jpg",
    description: "Salad healthy nhiều rau xanh.",
    ingredients: "Diêm mạch, xà lách, bơ, táo, sốt dầu giấm.",
    rating: 4.7,
    reviews: 22,
  },
  {
    id: 4,
    name: "Phở bò tái",
    kcal: 450,
    protein: 30,
    price: 35000,
    image: "/images/pho-bo.jpg",
    description: "Phở bò nước dùng trong, ít béo.",
    ingredients: "Bò tái, bánh phở, hành, gừng, nước hầm xương.",
    rating: 4.9,
    reviews: 60,
  },
];

export default function TrangMenu({searchKeyword, setCurrentPage}) {
  const { addToCart } = useContext(CartContext);

  const [selectedDish, setSelectedDish] = useState(null);
  const [menuOption, setMenuOption] = useState("Hôm nay");

  return (
    <>
      {/* ---------- TIÊU ĐỀ ---------- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu</h1>
        
        <div className="flex gap-3">
          {["Hôm nay", "Ngày mai", "Tuần này", "Tháng này"].map((op) => (
            <button
              key={op}
              onClick={() => setMenuOption(op)}
              className={`px-4 py-2 rounded-lg border 
                ${menuOption === op ? "bg-green-600 text-white" : "bg-white hover:bg-gray-100"}
              `}
            >
              {op}
            </button>
          ))}
        </div>
      </div>
      

      <div className="grid grid-cols-5 gap-6">
        {/* ---------- CỘT LỌC ---------- */}
        <div className="col-span-1 bg-white rounded-xl p-4 shadow">
          <h2 className="font-semibold mb-3">Bộ lọc</h2>

          <div className="space-y-2">
            {["Ưu đãi hôm nay", "Bán chạy", "Ít calo", "Không gluten"].map(
              (text) => (
                <div
                  key={text}
                  className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                >
                  {text}
                </div>
              )
            )}
          </div>
        </div>

        {/* ---------- LIST MÓN ĂN ---------- */}
        <div className="col-span-3 space-y-6">

          {/* COMBO */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-green-700">Combo trưa - tiết kiệm 15%</h2>
                <p className="text-sm text-gray-600">Áp dụng cho các món cơm và mì hôm nay.</p>
              </div>

              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg">
                Xem chi tiết
              </button>
            </div>
          </div>

          {/* GRID MÓN */}
          <div className="grid grid-cols-3 gap-6">
            {dishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-40 object-cover rounded-lg"
                />

                <h3 className="font-semibold mt-3">{dish.name}</h3>
                <p className="text-sm text-gray-500">
                  {dish.kcal} kcal • Protein {dish.protein}g
                </p>

                <p className="font-bold mt-2">
                  {dish.price.toLocaleString()}đ
                </p>

                <div className="flex justify-between mt-3">
                  <button
                    className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                    onClick={() => setSelectedDish(dish)}
                  >
                    Chi tiết
                  </button>

                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded-lg"
                    onClick={() => addToCart(dish)}
                  >
                    Thêm
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* ---------- MINI CART ---------- */}
          <div className="col-span-1">
            <MiniCart setCurrentPage={setCurrentPage} />
          </div>
      </div>

      {/* ---------- POPUP CHI TIẾT MÓN ---------- */}
      {selectedDish && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
            <h2 className="font-bold text-xl">{selectedDish.name}</h2>

            <img
              src={selectedDish.image}
              alt=""
              className="w-full h-48 object-cover rounded-xl mt-3"
            />

            <p className="mt-3 text-gray-600">{selectedDish.description}</p>

            <p className="mt-2 text-sm text-gray-500">
              <strong>Nguyên liệu:</strong> {selectedDish.ingredients}
            </p>

            <p className="mt-2">
              ⭐ {selectedDish.rating} ({selectedDish.reviews} đánh giá)
            </p>

            <div className="flex justify-between mt-4">
              <button
                className="px-3 py-1 border rounded-lg"
                onClick={() => setSelectedDish(null)}
              >
                Đóng
              </button>

              <button
                className="px-3 py-1 bg-green-600 text-white rounded-lg"
                onClick={() => {
                  addToCart(selectedDish);
                  setSelectedDish(null);
                }}
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
