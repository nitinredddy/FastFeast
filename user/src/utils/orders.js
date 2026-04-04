export const parseOrderItems = (items) => {
  if (Array.isArray(items)) {
    return items;
  }

  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

export const normalizeOrders = (orders) =>
  Array.isArray(orders)
    ? orders.map((order) => ({
        ...order,
        items: parseOrderItems(order.items),
      }))
    : [];
