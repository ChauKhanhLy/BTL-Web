import axiosClient from "../api/axiosClient";

export async function fetchOrderStats(range) {
    const res = await axiosClient.get("/orders/stats", {
        params: { range },
    });

    // Chuẩn hóa data cho UI
    return {
        stats: {
            reg: res.data.totalRegistered,
            real: res.data.totalActual,
            noshow: res.data.noShowRate,
            paid: res.data.paidRate,
            debt: res.data.debtCount,
        },
        chart: res.data.chart,
        table: res.data.users,
    };
}
