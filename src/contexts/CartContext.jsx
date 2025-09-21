// src/contexts/CartContext.jsx
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, prices, selectedOptions) => {
    // A unique ID for the item in the cart, incorporating options
    const cartItemId = `${product.id}-${JSON.stringify(selectedOptions)}`;
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.cartId === cartItemId);
      if (existingItemIndex > -1) {
        // If item exists, update its quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        // Otherwise, add a new item
        const displayPrice = Object.values(prices)[0] || 0;
        return [
          ...prevCart,
          {
            cartId: cartItemId,
            product,
            prices,
            selectedOptions,
            quantity: 1,
            displayPrice
          }
        ];
      }
    });
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);