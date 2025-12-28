import * as orderDAL from "../dal/orders.dal.js";

export async function getMealStats({ user_id, filter, date }) {
  const baseDate = date ? new Date(date) : new Date();

  let fromDate, toDate;

  switch (filter) {
    case "week":
      fromDate = new Date(baseDate);
      fromDate.setDate(baseDate.getDate() - baseDate.getDay());
      toDate = new Date(fromDate);
      toDate.setDate(fromDate.getDate() + 6);
      break;

    case "month":
      fromDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      toDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      break;

    case "year":
      fromDate = new Date(baseDate.getFullYear(), 0, 1);
      toDate = new Date(baseDate.getFullYear(), 11, 31);
      break;

    default:
      fromDate = new Date(baseDate.setHours(0, 0, 0, 0));
      toDate = new Date(baseDate.setHours(23, 59, 59, 999));
  }

  const orders = await orderDAL.getOrdersByUserAndDate(
    user_id,
    fromDate,
    toDate
  );

  const meals = [];

  orders.forEach(order => {
    order.orderDetails?.forEach(item => {
      meals.push({
        date: order.date.slice(0, 10),
        name: item.food.name,
        price: item.food.price * item.amount,
        paid: order.paid
      });
    });
  });

  return meals;
}