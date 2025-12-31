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
        paid: order.paid,
        payment_method: order.payment_method,
      });
    });
  });

  return meals;
}

export async function getStatsSummary({ user_id, filter, date }) {
  const meals = await getMealStats({ user_id, filter, date });

  const summary = {
    total_meals: meals.length,
    total_amount: 0,
    paid: 0,
    unpaid: 0,
    meal_card_debt: 0,
  };

  meals.forEach(m => {
    summary.total_amount += m.price;

    if (m.paid) {
      summary.paid += m.price;
    } else {
      summary.unpaid += m.price;

      if (m.payment_method === "meal_card") {
        summary.meal_card_debt += m.price;
      }
    }
  });

  return summary;
}
