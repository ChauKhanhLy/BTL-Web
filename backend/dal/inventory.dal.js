import { supabase } from "../database/supabase.js";

/* ================= INVENTORY OVERVIEW ================= */

export const fetchStock = async () => {
    const { data, error } = await supabase
        .from("rawmaterial")
        .select("id, name, remain, amount")
        .eq("status", true)
        .order("name");

    if (error) throw error;

    return data.map((r) => ({
        id: r.id,
        name: r.name,
        stock: r.remain,
        par: r.amount,
    }));
};

export const fetchStats = async () => {
    const { data, error } = await supabase
        .from("rawmaterial")
        .select("remain, amount")
        .eq("status", true);

    if (error) throw error;

    const lowStock = data.filter(
        (r) => r.remain < r.amount
    ).length;

    return {
        total_products: data.length,
        low_stock: lowStock,
    };
};

export const fetchImportSumByRange = async (fromDate) => {
    const { data, error } = await supabase
        .from("purchase_orders")
        .select("id, completed_at")
        .eq("status", "COMPLETED")
        .not("completed_at", "is", null)
        .gte("completed_at", fromDate);

    if (error) throw error;
    if (!data || data.length === 0) return 0;

    const poIds = data.map((p) => p.id);

    const { data: items, error: itemError } = await supabase
        .from("purchase_order_items")
        .select("quantity, price")
        .in("po_id", poIds);

    if (itemError) throw itemError;

    return items.reduce(
        (sum, i) =>
            sum +
            Number(i.quantity || 0) * Number(i.price || 0),
        0
    );
};

export const fetchSuggestions = async () => {
    const { data, error } = await supabase
        .from("rawmaterial")
        .select("id, name, remain, amount")
        .eq("status", true);

    if (error) throw error;

    return data
        .filter((r) => r.remain < r.amount)
        .sort((a, b) => a.remain - b.remain)
        .slice(0, 5)
        .map((r) => ({
            id: r.id,
            name: r.name,
        }));
};

export const fetchRecentPOs = async () => {
    const { data, error } = await supabase
        .from("purchase_orders")
        .select("id, code, status, created_at, total_price")
        .order("created_at", { ascending: false })
        .limit(5);

    if (error) throw error;
    return data || [];
};

/* ================= PURCHASE ORDER ================= */

export const createPurchaseOrder = async () => {
    const { data, error } = await supabase
        .from("purchase_orders")
        .insert([{}])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getPurchaseOrderDetail = async (poId) => {
    const { data: po, error } = await supabase
        .from("purchase_orders")
        .select("id, code, status, created_at, completed_at, total_price")
        .eq("id", poId)
        .single();

    if (error) return null;

    const { data: items, error: itemError } = await supabase
        .from("purchase_order_items")
        .select(`
            id,
            rawmaterial_id,
            quantity,
            price,
            supplier,
            rawmaterial ( name )
        `)
        .eq("po_id", poId);

    if (itemError) throw itemError;

    return {
        ...po,
        items: items.map((i) => ({
            id: i.id,
            rawmaterialId: i.rawmaterial_id,
            productName: i.rawmaterial.name,
            quantity: i.quantity,
            price: i.price,
            supplier: i.supplier,
        })),
    };
};

export const addItemToPO = async (
    poId,
    rawmaterialId,
    quantity,
    price,
    supplier
) => {
    const { error } = await supabase
        .from("purchase_order_items")
        .insert([{
            po_id: poId,
            rawmaterial_id: rawmaterialId,
            quantity,
            price,
            supplier,
        }]);

    if (error) throw error;
};

export const deleteItemFromPO = async (itemId) => {
    const { error } = await supabase
        .from("purchase_order_items")
        .delete()
        .eq("id", itemId);

    if (error) throw error;
};

export const completePurchaseOrder = async (poId) => {
    const { data: items, error } = await supabase
        .from("purchase_order_items")
        .select("rawmaterial_id, quantity, price")
        .eq("po_id", poId);

    if (error) throw error;

    let totalPrice = 0;

    for (const item of items) {
        totalPrice +=
            Number(item.quantity) * Number(item.price);

        const { data: material, error: mErr } =
            await supabase
                .from("rawmaterial")
                .select("remain")
                .eq("id", item.rawmaterial_id)
                .single();

        if (mErr) throw mErr;

        const { error: uErr } = await supabase
            .from("rawmaterial")
            .update({
                remain:
                    Number(material.remain) +
                    Number(item.quantity),
            })
            .eq("id", item.rawmaterial_id);

        if (uErr) throw uErr;
    }

    const { error: poErr } = await supabase
        .from("purchase_orders")
        .update({
            status: "COMPLETED",
            completed_at: new Date().toISOString(),
            total_price: totalPrice,
        })
        .eq("id", poId);

    if (poErr) throw poErr;
};

/* ================= RAW MATERIAL ================= */

export const fetchRawMaterials = async () => {
    const { data, error } = await supabase
        .from("rawmaterial")
        .select("id, name, amount")
        .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
};

export const createRawMaterial = async (payload) => {
    const { data, error } = await supabase
        .from("rawmaterial")
        .insert([{
            name: payload.name,
            amount: payload.par,
            remain: 0,
            status: true,
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};
