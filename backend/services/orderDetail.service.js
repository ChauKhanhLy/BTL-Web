import * as orderDetailDAL from "../dal/orderDetail.dal.js";

export async function getOrderDetails(orderId) {
    if (!orderId) throw new Error("Order ID is required");
    
    const details = await orderDetailDAL.getOrderDetailsWithFood(orderId);
    
    // Format response
    return details.map(item => ({
        id: item.id,
        order_id: item.order_id,
        food_id: item.food_id,
        amount: item.amount,
        price: item.price,
        total: item.price * item.amount,
        food_name: item.food?.name || "Không tên",
        food_image: item.food?.image_url || "https://via.placeholder.com/100",
        food_description: item.food?.description || "",
        food_kcal: item.food?.kcal || 0,
        food_protein: item.food?.protein || 0,
        food_category: item.food?.category || "Không phân loại"
    }));
}

export async function createOrderDetail(detail) {
    return await orderDetailDAL.createOrderDetail(detail);
}