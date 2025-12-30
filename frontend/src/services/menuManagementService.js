import {
    fetchCategories,
    fetchFoods,
    fetchFoodsByCategory,
    createFoodApi,
} from "../api/menu.api";

/* ========= MAP FUNCTIONS ========= */

function mapCategoryFromApi(cat) {
    return {
        id: cat.id,
        name: cat.CategoryName,
    };
}

function mapFoodFromApi(food, categoriesMap = {}) {
    return {
        id: food.id,
        name: food.name,
        meta: food.ingredients
            ? Array.isArray(food.ingredients)
                ? food.ingredients.join(", ")
                : "Có thành phần"
            : "Chưa có mô tả",
        price: `${Number(food.price).toLocaleString("vi-VN")}đ`,
        imageUrl: food.image_url,
        categoryId: food.category,
        categoryName: categoriesMap[food.category] || "Khác",
    };
}

/* ========= SERVICE ========= */

export const getAllCategories = async () => {
    const categories = await fetchCategories();
    return categories.map(mapCategoryFromApi);
};

export const getAllFoods = async () => {
    const [foods, categories] = await Promise.all([
        fetchFoods(),
        fetchCategories(),
    ]);

    const categoriesMap = {};
    categories.forEach(c => {
        categoriesMap[c.id] = c.CategoryName;
    });

    return foods.map(f => mapFoodFromApi(f, categoriesMap));
};

export const getFoodsByCategory = async (categoryId) => {
    const [foods, categories] = await Promise.all([
        fetchFoodsByCategory(categoryId),
        fetchCategories(),
    ]);

    const categoriesMap = {};
    categories.forEach(c => {
        categoriesMap[c.id] = c.CategoryName;
    });

    return foods.map(f => mapFoodFromApi(f, categoriesMap));
};

export const createFood = async (payload) => {
    return createFoodApi({
        name: payload.name,
        description: payload.description,
        category: payload.categoryId,
        ingredients: payload.ingredients,
        image_url: payload.imageUrl,
        price: payload.price,
    });
};
export const getMenuByDay = async (day) => {
    // tạm thời trả tất cả food
    return getAllFoods();
};

const menuService = {
    getAllCategories,
    getAllFoods,
    getFoodsByCategory,
    createFood,
    getMenuByDay,

};

export default menuService;
