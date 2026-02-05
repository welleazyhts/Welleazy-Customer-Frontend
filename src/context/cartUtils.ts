// utils/cartUtils.ts
export interface CartItem {
  id: string;
  type: 'appointment' | 'pharmacy' | 'lab';
  name: string;
  price: number;
  quantity: number;
  doctorName?: string;
  doctorImage?: string;
  consultationType?: string;
  appointmentTime?: string;
  caseLeadId?: string;
  cartUniqueId?: number;
}

export const getCartKey = (): string => {
  const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
  return `app_cart_${employeeRefId}`;
};

export const addToCart = (item: Omit<CartItem, 'id'>): CartItem => {
  const cartKey = getCartKey();
  const currentCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
  
  const newItem: CartItem = {
    ...item,
    id: `${item.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  const updatedCart = [...currentCart, newItem];
  localStorage.setItem(cartKey, JSON.stringify(updatedCart));
  
  // Dispatch event for header update
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  
  return newItem;
};

export const getCartItems = (): CartItem[] => {
  const cartKey = getCartKey();
  return JSON.parse(localStorage.getItem(cartKey) || '[]');
};

export const getCartCount = (): number => {
  const cartItems = getCartItems();
  return cartItems.length;
};

export const getCartTotal = (): number => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const removeFromCart = (id: string): void => {
  const cartKey = getCartKey();
  const currentCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
  const updatedCart = currentCart.filter((item: CartItem) => item.id !== id);
  localStorage.setItem(cartKey, JSON.stringify(updatedCart));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

export const clearCart = (): void => {
  const cartKey = getCartKey();
  localStorage.removeItem(cartKey);
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};