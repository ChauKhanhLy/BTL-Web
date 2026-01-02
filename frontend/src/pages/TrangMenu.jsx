import React, { useState, useContext } from "react";
import { useEffect, useRef } from "react";
import { CartContext } from "../context/CartContext";
import MiniCart from "../components/MiniCart";
import dayjs from "dayjs";

export default function TrangMenu({ searchKeyword, setCurrentPage }) {
  const { addToCart } = useContext(CartContext);
  const highlight = (text) => {
    if (!searchKeyword) return text;
    return text.split(new RegExp(`(${searchKeyword})`, "gi")).map((part, i) =>
      part.toLowerCase() === searchKeyword.toLowerCase() ? (
        <span key={i} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const [dishes, setDishes] = useState([]);
  const [allDishes, setAllDishes] = useState([]); // tất cả món
  const [menuDishes, setMenuDishes] = useState([]); // món theo ngày

  const [selectedDish, setSelectedDish] = useState(null);
  const [menuOption, setMenuOption] = useState("Hôm nay");
  const [filterTag, setFilterTag] = useState(null);
  const [showCombo, setShowCombo] = useState(false);
  useEffect(() => {
    console.log("USE EFFECT RUNNING");
    fetch("http://localhost:5000/api/food")
      .then((res) => {
        if (!res.ok) {
          throw new Error("API error");
        }
        return res.json();
      })
      /*.then((data) => setDishes(data))*/
      .then((data) => {
        console.log("FOOD FROM API:", data);
        setDishes(data);
      })

      .catch((err) => console.error("Fetch food error:", err));
  }, []);
  const filteredDishes = (dishes || []).filter((dish) =>
    dish.name.toLowerCase().includes((searchKeyword || "").toLowerCase())
  );

  const getDayByOption = (option) => {
    const today = dayjs();

    switch (option) {
      case "Hôm nay":
        return today.format("YYYY-MM-DD");

      case "Ngày mai":
        return today.add(1, "day").format("YYYY-MM-DD");

      case "Tuần này":
        return today.startOf("week").add(1, "day").format("YYYY-MM-DD");
      // Thứ 2 tuần này

      case "Tháng này":
        return today.startOf("month").format("YYYY-MM-DD");

      default:
        return today.format("YYYY-MM-DD");
    }
  };

  useEffect(() => {
    const day = getDayByOption(menuOption);

    fetch(`http://localhost:5000/api/menu?day=${day}`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setDishes(list);
        setMenuDishes(list); // ✅ BẮT BUỘC
      })
      .catch((err) => {
        console.error("Fetch menu error:", err);
        setDishes([]);
      });
  }, [menuOption]);

  const comboDishes = [...menuDishes]
    .filter((dish) => !dish.isExtra) // nếu có topping thì loại
    .sort((a, b) => a.price - b.price)
    .slice(0, 2);

  const comboOriginalPrice = comboDishes.reduce((sum, d) => sum + d.price, 0);

  const comboDiscountPrice = comboOriginalPrice * 0.85;

  const handleAddCombo = () => {
    comboDishes.forEach((dish) => {
      addToCart({
        ...dish,
        comboPrice: dish.price * 0.85, // giá combo
      });
    });

    setShowCombo(false);
  };

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
                ${menuOption === op
                  ? "bg-green-600 text-white"
                  : "bg-white hover:bg-gray-100"
                }
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
                  onClick={() => setFilterTag(text)}
                  className={`p-2 rounded cursor-pointer
                    ${filterTag === text
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                    }
                 `}
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
                <h2 className="font-bold text-green-700">
                  Combo trưa – tiết kiệm 15%
                </h2>
                <p className="text-sm text-gray-600">
                  Áp dụng cho các món cơm và mì hôm nay.
                </p>
              </div>

              <button
                className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                onClick={() => setShowCombo(true)}
              >
                Xem chi tiết
              </button>
            </div>
          </div>

          {showCombo && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl w-[500px] shadow-lg">
                <h2 className="font-bold text-xl mb-4">
                  Combo trưa – Giảm 15%
                </h2>

                {comboDishes.length < 2 ? (
                  <p className="text-gray-500 text-center py-6">
                    Hôm nay chưa có combo trưa phù hợp
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {comboDishes.map((dish) => (
                        <div
                          key={dish.id}
                          className="flex items-center justify-between gap-3"
                        >
                          {/* Hình */}
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-14 h-14 object-cover rounded-lg border"
                          />

                          {/* Tên + info */}
                          <div className="flex-1">
                            <p className="font-medium">{dish.name}</p>
                            <p className="text-sm text-gray-500">
                              {dish.kcal} kcal
                            </p>
                          </div>

                          {/* Giá */}
                          <div className="text-right">
                            <p className="line-through text-gray-400 text-sm">
                              {dish.price.toLocaleString()}đ
                            </p>
                            <p className="font-bold text-green-600">
                              {(dish.price * 0.85).toLocaleString()}đ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <hr className="my-3" />

                <div className="flex justify-between">
                  <span className="line-through text-gray-400">
                    {comboOriginalPrice.toLocaleString()}đ
                  </span>

                  <span className="font-bold text-green-600">
                    {comboDiscountPrice.toLocaleString()}đ
                  </span>
                </div>

                <div className="flex justify-between items-center mt-6">
                  {comboDishes.length >= 2 && (
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg"
                      onClick={handleAddCombo}
                    >
                      Thêm toàn bộ combo
                    </button>
                  )}

                  <button
                    className="px-4 py-2 border rounded-lg"
                    onClick={() => setShowCombo(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GRID MÓN */}
          <div className="grid grid-cols-3 gap-6">
            {filteredDishes.map((dish) => (
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

                <p className="font-bold mt-2">{dish.price.toLocaleString()}đ</p>

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
