import * as orderDAL from "../dal/orders.dal.js";
import dayjs from "dayjs";

/**
 * @param {"day"|"week"|"month"} range
 * @param {string} dateStr - YYYY-MM-DD
 */
export function resolveRange(range, dateStr) {
    const base = dayjs(dateStr);

    if (!base.isValid()) {
        throw new Error(`Invalid date: ${dateStr}`);
    }

    // ===== DAY =====
    if (range === "day") {
        return {
            fromDate: base.startOf("day").toISOString(),
            toDate: base.endOf("day").toISOString(),
        };
    }

    // ===== WEEK (T2 → T6) =====
    if (range === "week") {
        // dayjs: CN = 0, T2 = 1
        const dayOfWeek = base.day();

        // xác định Thứ 2 của tuần
        const monday =
            dayOfWeek === 0
                ? base.subtract(6, "day") // CN → T2
                : base.subtract(dayOfWeek - 1, "day");

        const friday = monday.add(4, "day");

        return {
            fromDate: monday.startOf("day").toISOString(),
            toDate: friday.endOf("day").toISOString(),
        };
    }

    // ===== MONTH =====
    if (range === "month") {
        return {
            fromDate: base.startOf("month").toISOString(),
            toDate: base.endOf("month").toISOString(),
        };
    }

    throw new Error(`Invalid range: ${range}`);
}

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


/**
 * ADMIN: Lấy danh sách orders theo range + date
 */
export async function getOrdersByRangeAndDate(range, date) {
    if (!range || !date) {
        throw new Error("Missing range or date");
    }

    if (!["day", "week", "month"].includes(range)) {
        throw new Error(`Invalid range: ${range}`);
    }

    const { fromDate, toDate } = resolveRange(range, date);

    return await orderDAL.getOrdersByDateAndRange(fromDate, toDate);
}

export async function confirmCashPayment(orderId) {
    if (!orderId) throw new Error("Missing orderId");

    const order = await orderDAL.getOrderById(orderId);

    if (!order) throw new Error("Order not found");

    if (order.payment_method !== "cash") {
        throw new Error("Không phải đơn tiền mặt");
    }

    if (order.paid) {
        throw new Error("Đơn này đã được thanh toán");
    }

<<<<<<< HEAD
  return await orderDAL.updateOrder(orderId, {
    paid: true,
    status: "completed"
  });
}

export async function getOrderDetails(orderId) {
  const { data, error } = await supabase
    .from("orderDetails")
    .select(`
      *,
      food:food_id (
        id,
        name,
        price,
        image_url
      )
    `)
    .eq("order_id", orderId);
  
  if (error) throw error;
  
  return data.map(item => ({
    food_id: item.food_id,
    food_name: item.food?.name,
    price: item.price,
    amount: item.amount,
    image_url: item.food?.image_url
  }));
}
=======
    return await orderDAL.updateOrder(orderId, {
        paid: true,
        status: "completed"
    });
}
export async function getDashboardData(range, date) {
    console.log("👉 getDashboardData CALLED", { range, date });

    if (!range || !date) {
        console.error("❌ Missing range or date");
        throw new Error("Missing range or date");
    }

    const { fromDate, toDate } = resolveRange(range, date);
    console.log("📅 Resolved range:", { fromDate, toDate });

    const orders = await orderDAL.getOrdersByDateAndRange(fromDate, toDate);
    console.log("📦 Orders fetched:", orders);

    const reg = orders.length;
    const real = orders.filter(o => o.status === true).length;
    const noshow = reg - real;

    const paidCount = orders.filter(o => o.paid).length;
    const debtCount = orders.filter(o => !o.paid).length;

    const result = {
        stats: {
            reg,
            real,
            noshow: reg ? `${((noshow / reg) * 100).toFixed(1)}%` : "0%",
            paid: reg ? `${((paidCount / reg) * 100).toFixed(0)}%` : "0%",
            debt: debtCount,
        },
        chart: buildChartFromOrders(orders),
        orders,
    };

    console.log("✅ Dashboard result:", result);

    return result;
}

function buildChartFromOrders(orders) {
    const map = {};

    orders.forEach(o => {
        const key = dayjs(o.date).format("DD/MM");

        if (!map[key]) {
            map[key] = { name: key, reg: 0, real: 0, noshow: 0 };
        }

        map[key].reg += 1;
        if (o.status) map[key].real += 1;
        else map[key].noshow += 1;
    });

    return Object.values(map);
}
>>>>>>> 8ffe126afcd7ee0f19692afacb7598b29b0931b4
