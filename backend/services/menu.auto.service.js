import { generateMenuForDay, getFoodsByDay } from "./menu.service.js";
import { countMenuByDay } from "../dal/menu.dal.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

/* ===== FIX 1: nowVN PHẢI LÀ HÀM ===== */
const nowVN = () => dayjs().tz("Asia/Ho_Chi_Minh");

/* ===== GIỮ NGUYÊN ===== */
const formatDate = (d) => d.toISOString().split("T")[0];

/* ===== GIỮ NGUYÊN LOGIC, CHỈ SỬA NGUỒN NGÀY ===== */
const getNextWeekWeekdays = () => {
    const today = nowVN();
    const nextMonday = today.add(1, "week").startOf("week").add(1, "day");

    const days = [];

    for (let i = 0; i < 5; i++) {
        const d = nextMonday.add(i, "day");
        days.push(d.format("YYYY-MM-DD"));
    }

    return days;
};

/* ================= AUTO GENERATE MENU (GIỮ NGUYÊN) ================= */

export const autoGenerateMenu = async () => {
    /* ===== FIX 2: KHÔNG DÙNG new Date ===== */
    const today = nowVN();
    const weekday = today.day(); // 0 CN, 6 T7
    const todayStr = today.format("YYYY-MM-DD");

    // Thứ 2 → Thứ 6: nếu chưa có menu hôm nay thì tạo
    if (weekday >= 1 && weekday <= 5) {
        const todayMenu = await getFoodsByDay(todayStr);

        if (!todayMenu || todayMenu.length === 0) {
            /* ===== FIX 3: yesterday BẰNG dayjs ===== */
            const yesterday = today.subtract(1, "day").format("YYYY-MM-DD");

            await generateMenuForDay(
                todayStr,
                yesterday,
                2
            );
        }
        return;
    }

    // Thứ 7: tạo menu cho TUẦN SAU (T2–T6)
    if (weekday === 6) {
        const days = getNextWeekWeekdays();

        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            const prevDay = i === 0 ? null : days[i - 1];

            if (prevDay) {
                await generateMenuForDay(day, prevDay, 6);
            }
        }
    }
};

/* ================= AUTO GENERATE IF MISSING (GIỮ NGUYÊN) ================= */

export async function autoGenerateMenuIfMissing() {
    /* ===== FIX 4: KHÔNG DÙNG new Date ===== */
    const today = nowVN();
    const day = today.day(); // 0 CN, 6 T7

    // chỉ xử lý T2–T6
    if (day === 0 || day === 6) {
        console.log("Weekend → skip");
        return;
    }

    const todayStr = today.format("YYYY-MM-DD");
    console.log(todayStr);

    const exists = await countMenuByDay(todayStr);
    console.log(exists);
    if (exists) {
        console.log("Menu today already exists");
        return;
    }

    console.log("Menu missing → generating...");

    /* ===== FIX 5: yesterday KHÔNG BỊ THIẾU ===== */
    const yesterday = today.subtract(1, "day").format("YYYY-MM-DD");

    await generateMenuForDay(todayStr, yesterday, 2);
}
