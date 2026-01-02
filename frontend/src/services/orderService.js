// src/services/orderService.js
import {
    getOrderStats,
    getOrders,
    confirmOrderPaid,
    getDashboard,
} from "../api/orders.api";

/* ================= STATS ================= */
async function fetchOrderStats({ range, date }) {
    return await getOrderStats({ range, date });
}

/* ================= ORDERS ================= */

async function fetchOrdersByDate({ range, date }) {
    return await getOrders({ range, date });
}


async function confirmPaid(orderId) {
    return await confirmOrderPaid(orderId);
}
async function fetchDashboardData({ range, date }) {
    return await getDashboard({ range, date });
}
/* ================= DEFAULT EXPORT ================= */
export default {
    fetchOrderStats,
    fetchOrdersByDate,
    confirmPaid,
    fetchDashboardData,
};
