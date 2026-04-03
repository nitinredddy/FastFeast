const CART_STORAGE_KEY = "fastfeast-cart";
const CART_UPDATED_EVENT = "fastfeast-cart-updated";

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

export const getCartCount = () =>
  getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);

export const saveCart = (cart) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
};

export const clearCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
};

export const subscribeToCart = (callback) => {
  const handler = () => callback(getCartCount());
  window.addEventListener(CART_UPDATED_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};
