import * as orderDAL from "../dal/orders.dal.js";

export async function getOrderStats(range = "week") {
    if (!["day", "week", "month"].includes(range)) {
        throw new Error("Invalid range");
    }

    const startDate = getStartDate(range);
    const orders = await orderDAL.getOrdersByDate(startDate);

    const reg = orders.length;
    const real = orders.filter(o => o.status === true).length;
    const noshowCount = orders.filter(o => o.status === false).length;

    const paidCount = orders.filter(o => o.paid === true).length;
    const debtCount = orders.filter(o => o.paid === false).length;

    /* ===== STATS ===== */
    const stats = {
        reg,
        real,
        noshow: reg ? `${((noshowCount / reg) * 100).toFixed(1)}%` : "0%",
        paid: reg ? `${((paidCount / reg) * 100).toFixed(0)}%` : "0%",
        debt: debtCount
    };

    /* ===== CHART ===== */
    const chart = orders.map(o => ({
        name: new Date(o.date).toLocaleDateString("vi-VN"),
        reg: 1,
        real: o.status ? 1 : 0,
        noshow: o.status ? 0 : 1
    }));

    /* ===== TABLE ===== */
    const table = orders.map(o => ({
        code: `ORD-${o.id}`,
        name: "NLD",
        reg: 1,
        real: o.status ? 1 : 0,
        noshow: o.status ? 0 : 1,
        fee: `${o.price.toLocaleString("vi-VN")}đ`,
        status: o.paid ? "paid" : "debt"
    }));

    return { stats, chart, table };
}
function getStartDate(range) {
    const now = new Date();

    if (range === "day") {
        return new Date(now.setDate(now.getDate() - 1)).toISOString();
    }
    if (range === "week") {
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
    }
    if (range === "month") {
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    }
}

function buildChart(orders) {
    return orders.map(o => ({
        name: new Date(o.created_at).toLocaleDateString("vi-VN"),
        reg: o.register_count,
        real: o.actual_count,
        noshow: o.register_count - o.actual_count
    }));
}

function buildTable(orders) {
    return orders.map(o => ({
        code: o.user_code,
        name: o.user_name,
        reg: o.register_count,
        real: o.actual_count,
        noshow: o.register_count - o.actual_count,
        fee: `${Number(o.total_price).toLocaleString("vi-VN")}đ`,
        status: o.paid ? "paid" : "debt"
    }));
}
