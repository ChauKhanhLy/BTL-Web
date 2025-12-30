import { generateMenuForDay, getFoodsByDay } from "./menu.service.js";

const formatDate = (d) => d.toISOString().split("T")[0];

const getNextWeekWeekdays = () => {
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (8 - today.getDay()));

    const days = [];
    for (let i = 0; i < 5; i++) {
        const d = new Date(nextMonday);
        d.setDate(nextMonday.getDate() + i);
        days.push(formatDate(d));
    }
    return days;
};

export const autoGenerateMenu = async () => {
    const today = new Date();
    const weekday = today.getDay(); // 0 CN, 6 T7
    const todayStr = formatDate(today);

    // Thứ 2 → Thứ 6: nếu chưa có menu hôm nay thì tạo
    if (weekday >= 1 && weekday <= 5) {
        const todayMenu = await getFoodsByDay(todayStr);

        if (!todayMenu || todayMenu.length === 0) {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            await generateMenuForDay(
                todayStr,
                formatDate(yesterday),
                6
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
