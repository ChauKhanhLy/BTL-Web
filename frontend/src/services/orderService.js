import axiosClient from "../api/axiosClient";

export async function fetchOrderStats(range) {
    const data = await axiosClient.get("/orders/stats", {
        params: { range },
    });

    return {
        stats: {
            reg: data.stats.reg,
            real: data.stats.real,
            noshow: data.stats.noshow,
            paid: data.stats.paid,
            debt: data.stats.debt,
        },
        chart: data.chart,
        table: data.table,
    };
}
