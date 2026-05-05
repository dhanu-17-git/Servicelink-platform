import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    try {
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  // Save cart to localStorage
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cartItems]);

  const addToCart = (item, type) => {
    // Check if already in cart
    const exists = cartItems.find(i => i.id === item.id && i.type === type);
    if (exists) return false;

    setCartItems([...cartItems, { 
      ...item, 
      type, 
      cartId: Date.now(),
      hours: type === 'WORKER' ? 8 : undefined 
    }]);
    return true;
  };

  const updateCartItem = (cartId, updates) => {
    setCartItems(cartItems.map(item => 
      item.cartId === cartId ? { ...item, ...updates } : item
    ));
  };

  const removeFromCart = (cartId) => {
    setCartItems(cartItems.filter(i => i.cartId !== cartId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
