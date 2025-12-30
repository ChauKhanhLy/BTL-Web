import {
    findMenuByDay,
    countMenuByDay,
    findFoodIdsByDay,
    findAllFoodIdsExcept,
    insertMenuItems,
    insertMenuItem,
    deleteMenuItem,
    existsMenuItem,
} from "../dal/menu.dal.js";

export const getFoodsByDay = async (day) => {
    if (!day) {
        throw new Error("Thiếu thông tin ngày");
    }

    return findMenuByDay(day);
};

export const addFoodToDay = async (day, foodId) => {
    if (!day || !foodId) {
        throw new Error("Thiếu thông tin ngày hoặc món ăn");
    }

    const existed = await existsMenuItem(day, foodId);
    if (existed) {
        throw new Error("Món ăn đã tồn tại trong ngày này");
    }

    await insertMenuItem(day, foodId);
};

export const removeFoodFromDay = async (day, foodId) => {
    if (!day || !foodId) {
        throw new Error("Thiếu thông tin ngày hoặc món ăn");
    }

    await deleteMenuItem(day, foodId);
};

export const generateMenuForDay = async (day, prevDay, limit = 5) => {
    if (!day || !prevDay) {
        throw new Error("Thiếu thông tin ngày hiện tại hoặc ngày trước đó");
    }

    const count = await countMenuByDay(day);
    if (count > 0) {
        throw new Error("Menu của ngày này đã tồn tại");
    }

    const prevFoodIds = await findFoodIdsByDay(prevDay);
    const availableFoodIds = await findAllFoodIdsExcept(prevFoodIds);

    if (availableFoodIds.length < limit) {
        throw new Error("Không đủ món ăn để tạo menu không trùng ngày trước");
    }

    const shuffled = [...availableFoodIds].sort(() => 0.5 - Math.random());
    const selectedFoodIds = shuffled.slice(0, limit);

    const items = selectedFoodIds.map(foodId => ({
        day,
        food_id: foodId,
    }));

    await insertMenuItems(items);

    return {
        day,
        foodCount: items.length,
    };
};
