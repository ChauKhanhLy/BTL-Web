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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);


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

    // ===== các ngày cần check =====
    const daysToCheck = [
        dayjs(day).subtract(1, "day").format("YYYY-MM-DD"), // hôm qua
        day,
        dayjs(day).add(1, "day").format("YYYY-MM-DD"),      // ngày mai
    ];

    for (const d of daysToCheck) {
        const existed = await existsMenuItem(d, foodId);
        if (existed) {
            throw new Error(
                `Món ăn đã tồn tại ở ngày ${d}, không thể thêm liên tiếp`
            );
        }
    }

    await insertMenuItem(day, foodId);
};

export const removeFoodFromDay = async (day, foodId) => {
    if (!day || !foodId) {
        throw new Error("Thiếu thông tin ngày hoặc món ăn");
    }

    await deleteMenuItem(day, foodId);
};

export const generateMenuForDay = async (day, prevDay, limit = 2) => {
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