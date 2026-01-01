import React, { useEffect, useState } from "react";
import { Plus, Search, X, Upload } from "lucide-react";
import StatCard from "../components/StatCard";
import dayjs from "dayjs";
import menuService from "../services/menuManagementService";
function formatDayLabel(dateStr) {
  const d = new Date(dateStr);
  const map = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  return map[d.getDay()];
}

/* ================= MAIN PAGE ================= */

export default function MenuManagementPage() {
  /* ===== VIEW STATE ===== */
  const [view, setView] = useState("week"); // week | day | all

  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [editingDay, setEditingDay] = useState(null);

  /* ===== MODAL STATE ===== */
  const [openCreateDish, setOpenCreateDish] = useState(false);
  const [openAddDishModal, setOpenAddDishModal] = useState(false);
  const [confirmDish, setConfirmDish] = useState(null);

  /* ===== CONTEXT STATE ===== */
  const [addingForDay, setAddingForDay] = useState(null);

  /* ===== DATA FROM API ===== */
  const [allDishes, setAllDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const daysOfWeek = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];

  /* ===== MENU STATE ===== */

  const weekDates = {
    monday: dayjs().day(1).format("YYYY-MM-DD"),
    tuesday: dayjs().day(2).format("YYYY-MM-DD"),
    wednesday: dayjs().day(3).format("YYYY-MM-DD"),
    thursday: dayjs().day(4).format("YYYY-MM-DD"),
    friday: dayjs().day(5).format("YYYY-MM-DD"),
  };

  const dayLabelToDate = {
    "Thứ 2": weekDates.monday,
    "Thứ 3": weekDates.tuesday,
    "Thứ 4": weekDates.wednesday,
    "Thứ 5": weekDates.thursday,
    "Thứ 6": weekDates.friday,
  };
  const [menuByDay, setMenuByDay] = useState({
    [weekDates.monday]: [],
    [weekDates.tuesday]: [],
    [weekDates.wednesday]: [],
    [weekDates.thursday]: [],
    [weekDates.friday]: [],
  });
  // ===== FILTER DISHES BY CATEGORY (FOR ALL VIEW) =====
  const filteredDishes =
    selectedCategory === "all"
      ? allDishes
      : allDishes.filter((dish) => dish.categoryId === selectedCategory);

  /* ================= LOAD DATA ================= */

  // load categories + all foods
  useEffect(() => {
    async function loadInit() {
      try {
        const [cats, foods] = await Promise.all([
          menuService.getAllCategories(),
          menuService.getAllFoods(),
        ]);
        setCategories(cats);
        setAllDishes(foods);
      } catch (err) {
        console.error(err);
      }
    }
    loadInit();
  }, []);

  // load menu theo ngày
  useEffect(() => {
    if (view !== "day") return;
    if (!selectedDate) return;

    menuService
      .getMenuByDay(selectedDate)
      .then((menu) => {
        console.log("API menu =", menu); // ✅ LOG 1
        console.log("selectedDate =", selectedDate);
        setMenuByDay((prev) => ({
          ...prev,
          [selectedDate]: menu || [],
        }));
      })
      .catch(console.error);
  }, [view, selectedDate]);

  /* ================= HANDLERS ================= */
  const handleAddDishConfirm = async (dish) => {
    const currentMenu = menuByDay[addingForDay] || [];

    // 🔥 1️⃣ CHECK TRÙNG
    const existed = currentMenu.some((item) => item.id === dish.id);

    if (existed) {
      alert("Món này đã có trong menu ngày này ❗");
      setConfirmDish(null);
      return;
    }

    // 🔥 2️⃣ OPTIMISTIC UI (CHỈ KHI KHÔNG TRÙNG)
    setMenuByDay((prev) => ({
      ...prev,
      [addingForDay]: [...currentMenu, dish],
    }));

    try {
      await menuService.addFoodToDay(addingForDay, dish.id);
    } catch (err) {
      console.error(err);
      alert("Không thể thêm món, vui lòng thử lại");
      // console.error(err);
      alert(err.message);
    }

    setConfirmDish(null);
    setOpenAddDishModal(false);
  };

  /* ================= RENDER ================= */

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý thực đơn</h1>
        <p className="text-sm text-gray-500">
          Menu theo ngày / tuần & danh sách món
        </p>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard title="Tổng món" value={allDishes.length} />
        <StatCard title="Danh mục" value={categories.length} />
        <StatCard title="Hết hàng" value="—" />
      </div>

      {/* ===== TOP CONTROLS ===== */}
      <div className="flex justify-between items-center mb-4">
        {/* View switch */}
        <div className="flex items-center gap-2">
          {[
            { label: "Theo tuần", value: "week" },
            { label: "Theo ngày", value: "day" },
            { label: "Danh sách món", value: "all" },
          ].map((v) => (
            <button
              key={v.value}
              onClick={() => {
                setView(v.value);
                setEditingDay(null);
              }}
              className={`px-4 py-1 rounded-full text-sm ${
                view === v.value ? "bg-emerald-700 text-white" : "bg-gray-100"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setOpenCreateDish(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg
                               flex items-center gap-1"
        >
          <Plus size={16} /> Tạo món mới
        </button>
      </div>

      {/* ===== DAY SELECTOR ===== */}
      {view === "day" && (
        <div className="flex gap-2 mb-6">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDate(dayLabelToDate[day])}
              className={`px-4 py-1 rounded-full text-sm ${
                selectedDate === dayLabelToDate[day]
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-100"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* ===== CATEGORY SELECTOR (CHỈ HIỆN KHI XEM DANH SÁCH MÓN) ===== */}
      {view === "all" && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-4 py-1 rounded-full text-sm ${
              selectedCategory === "all"
                ? "bg-emerald-700 text-white"
                : "bg-gray-100"
            }`}
          >
            Tất cả
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-1 rounded-full text-sm ${
                selectedCategory === cat.id
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* ===== CONTENT ===== */}
      <div className="space-y-6">
        {(view === "week" || view === "day") &&
          (view === "week" ? daysOfWeek : [selectedDate]).map((day) => {
            const dateKey = view === "day" ? selectedDate : dayLabelToDate[day];

            const dishes = menuByDay[dateKey] || [];

            return (
              <section key={day} className="bg-white rounded-xl p-5 shadow">
                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold">{day}</h3>

                  {editingDay === day ? (
                    <button
                      onClick={() => setEditingDay(null)}
                      className="px-3 py-1.5 rounded-lg text-sm bg-gray-100"
                    >
                      Xong
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingDay(day)}
                      className="px-3 py-1.5 rounded-lg text-sm border"
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                {editingDay === day && (
                  <button
                    onClick={() => {
                      setAddingForDay(dateKey);
                      setOpenAddDishModal(true);
                    }}
                    className="mb-3 px-4 py-2 rounded-lg text-sm bg-emerald-700 text-white"
                  >
                    + Thêm món vào ngày
                  </button>
                )}

                <div className="space-y-3">
                  {dishes.length === 0 && (
                    <p className="text-sm text-gray-400">Chưa có món</p>
                  )}

                  {dishes.map((d) => (
                    <DailyMenuRow
                      key={d.id}
                      {...d}
                      editable={editingDay === day}
                      onDelete={() => handleDeleteDish(dateKey, d.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
      </div>

      {/* ALL DISHES VIEW */}
      {view === "all" && (
        <section className="bg-white rounded-xl p-5 shadow">
          <h3 className="font-semibold mb-4">📋 Danh sách món ăn</h3>

          <div className="space-y-3">
            {filteredDishes.map((d) => (
              <DailyMenuRow key={d.id} {...d} />
            ))}

            {allDishes.length === 0 && (
              <p className="text-sm text-gray-400">Không có món nào</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
  {/*================= MODALS ================= */}

  {openAddDishModal && (
    <AddDishModal
      dishes={filteredDishes}
      day={addingForDay}
      onClose={() => {
        setOpenAddDishModal(false);
        setAddingForDay(null);
      }}
      onSelect={(dish) => {
        setConfirmDish(dish);
        setOpenAddDishModal(false);
      }}
    />
  );
 }

 {confirmDish && (
    <ConfirmAddDishModal
      dish={confirmDish}
      day={addingForDay}
      onCancel={() => {
        setConfirmDish(null);
        setAddingForDay(null);
      }}
      onConfirm={() => {
        handleAddDishConfirm(confirmDish);
        setConfirmDish(null);
        setAddingForDay(null);
      }}
    />
    );
  }

  {
  openCreateDish && (
    <AddMenuItemModal
      onClose={() => setOpenCreateDish(false)}
      onCreated={(newFood) => {
        setAllDishes((prev) => [newFood, ...prev]);
      }}
    />
    );
  }

/* ================= UI COMPONENTS ================= */

function DailyMenuRow({ name, meta, price }) {
  return (
    <div className="flex justify-between items-center border rounded-2xl px-4 py-3">
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-gray-500">{meta}</p>
      </div>
      <span className="font-semibold text-sm">{price}</span>
    </div>
  );
}

/* ================= ADD DISH MODAL ================= */

function AddDishModal({ dishes, day, onClose, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = dishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-xl p-6">
        <div className="flex justify-between mb-3">
          <div>
            <h3 className="font-semibold">Thêm món vào ngày</h3>
            <p className="text-xs text-gray-500">{day}</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
          <Search size={16} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm món..."
            className="ml-2 outline-none text-sm w-full"
          />
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto">
          {filtered.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelect(d)}
              className="cursor-pointer border rounded-lg px-4 py-3 hover:bg-gray-50"
            >
              <p className="text-sm font-medium">{d.name}</p>
              <p className="text-xs text-gray-500">
                {d.meta} • {d.price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= CONFIRM MODAL ================= */

function ConfirmAddDishModal({ dish, day, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-sm rounded-xl p-6">
        <h3 className="font-semibold mb-2">Thêm món?</h3>
        <p className="text-sm mb-4">
          Thêm <b>{dish.name}</b> vào menu ngày <b>{day}</b>?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 border rounded-lg">
            Không
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg"
          >
            Có
          </button>
        </div>
      </div>
    </div>
  );
}
}

/* ================= CREATE DISH MODAL ================= */

function AddMenuItemModal({ onClose, onCreated }) {
  /* ===== FORM STATE ===== */
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [ingredients, setIngredients] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===== LOAD CATEGORIES ===== */
  useEffect(() => {
    menuService.getAllCategories().then(setCategories).catch(console.error);
  }, []);

  /* ===== SUBMIT ===== */
  const handleSubmit = async () => {
    if (!name || !price || !formCategoryId) {
      alert("Vui lòng nhập Tên món, Giá và Danh mục");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        description,
        price: Number(price),
        categoryId: Number(formCategoryId),
        ingredients: ingredients
          ? ingredients.split(",").map((i) => i.trim())
          : [],
        imageUrl: null,
      };

      // 🔥 NHẬN FOOD VỪA TẠO TỪ BACKEND
      const newFood = await menuService.createFood(payload);

      // 🔥 BÁO NGƯỢC LÊN CHA
      if (onCreated) {
        onCreated(newFood);
      }

      // đóng modal
      onClose();
    } catch (err) {
      console.error(err);
      alert("Tạo món thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-5xl rounded-2xl p-6">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2 className="font-semibold text-lg">➕ Thêm món ăn</h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="space-y-4">
            {/* NAME */}
            <div>
              <label className="text-sm font-medium">Tên món</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl"
                placeholder="VD: Cơm gà nướng"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="text-sm font-medium">Danh mục</label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PRICE */}
            <div>
              <label className="text-sm font-medium">Giá (VND)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl"
                placeholder="45000"
              />
            </div>

            {/* INGREDIENTS */}
            <div>
              <label className="text-sm font-medium">
                Thành phần (phân cách bằng dấu phẩy)
              </label>
              <input
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl"
                placeholder="Cơm, gà, mật ong"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl min-h-[90px]"
                placeholder="Mô tả món ăn"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <label className="text-sm font-medium">Hình ảnh</label>
            <input
              type="file"
              hidden
              id="menu-image"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setImageFile(file);
                setPreview(URL.createObjectURL(file));
              }}
            />
            <label
              htmlFor="menu-image"
              className="mt-2 h-40 border-2 border-dashed rounded-xl
                                       flex items-center justify-center cursor-pointer"
            >
              {preview ? (
                <img
                  src={preview}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <Upload className="text-gray-400" />
              )}
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-xl"
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-emerald-700 text-white rounded-xl disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "Lưu món"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input className="w-full mt-1 px-4 py-2 border rounded-xl" />
    </div>
  );
}

function TextArea({ label }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <textarea className="w-full mt-1 px-4 py-2 border rounded-xl" />
    </div>
  );
}
