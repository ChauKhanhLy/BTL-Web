import * as menuService from "../services/menu.service.js";

/**
 * GET /menus/day
 */
export const getMenuByDay = async (req, res) => {
    try {
        const { day } = req.query;

        if (!day) {
            return res.status(400).json({ message: "day is required" });
        }

        const foods = await menuService.getFoodsByDay(day);
        res.json(foods);
        console.log("DAY FROM FE =", day);
        console.log("FOODS =", foods);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get menu by day" });
    }
};

/**
 * POST /menu/add
 */
export const addFoodToDay = async (req, res) => {
    try {
        const { day, food_id } = req.body;

        if (!day || !food_id) {
            return res.status(400).json({ message: "day and food_id are required" });
        }

        await menuService.addFoodToDay(day, food_id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to add food to day" });
    }
};

/**
 * DELETE /menu/remove
 */
export const removeFoodFromDay = async (req, res) => {
    try {
        const { day, food_id } = req.body;

        if (!day || !food_id) {
            return res.status(400).json({ message: "day and food_id are required" });
        }

        await menuService.removeFoodFromDay(day, food_id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to remove food from day" });
    }
};
export const generateMenu = async (req, res) => {
    try {
        const { day, prevDay, limit } = req.body;

        if (!day || !prevDay) {
            return res.status(400).json({
                message: "day and prevDay are required",
            });
        }

        const result = await generateMenuForDay(day, prevDay, limit);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message || "Failed to generate menu",
        });
    }
};