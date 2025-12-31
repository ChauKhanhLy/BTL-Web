import * as foodDAL from "../dal/food.dal.js";
import * as categoryRepo from "../dal/category.dal.js";

export const getAllFoodService = async () => {
  const foods = await foodDAL.getAllFood();
  return foods.map(f => ({
    ...f,
    price: Number(f.price),
  }));
};

export const getFoodByIdService = async (id) => {
  if (!id) throw new Error("Food ID is required");

  const food = await foodDAL.getFoodById(id);
  if (!food) throw new Error("Food not found");

  return food;
};

export function validateFoodData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Tên món không hợp lệ");
  }
  if (!data.price || Number(data.price) <= 0) {
    errors.push("Giá phải lớn hơn 0");
  }
  if (!data.category) {
    errors.push("Danh mục không được để trống");
  }

  if (errors.length) {
    const err = new Error(errors.join(", "));
    err.code = "INVALID_FOOD_DATA";
    throw err;
  }
}

export const createFood = async (data) => {
  validateFoodData(data);

  // 👉 CHECK CATEGORY BẰNG DAL
  const category = await categoryRepo.getCategoryById(data.category);
  if (!category) {
    const err = new Error("Danh mục không tồn tại");
    err.code = "CATEGORY_NOT_FOUND";
    throw err;
  }

  // 👉 INSERT BẰNG DAL
  return foodDAL.createFood({
    name: data.name,
    description: data.description || null,
    category: data.category,
    ingredients: data.ingredients || [],
    image_url: data.image_url || null,
    price: data.price,
  });
};

// 👉 CATEGORY
export const getCategories = async () => {
  return categoryRepo.getCategories();
};

export const updateFood = async (foodId, payload) => {
  if (!foodId) {
    throw new Error("foodId is required");
  }

  const {
    name,
    description,
    price,
    ingredients,
    imageUrl,

  } = payload;

  if (!name || !price) {
    throw new Error("name and price are required");
  }

  return foodDAL.updateFood2(foodId, {
    name,
    description,
    price,
    ingredients,
    imageUrl: imageUrl ?? null,

  });
};
