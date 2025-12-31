import cron from "node-cron";
import { autoGenerateMenu } from "../services/menu.auto.service.js";

cron.schedule("0 0 * * *", async () => {
    try {
        await autoGenerateMenu();
        console.log("Auto menu check done");
    } catch (err) {
        console.error("Auto menu error:", err.message);
    }
});
