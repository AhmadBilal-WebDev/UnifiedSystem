import { useState, useEffect } from "react";

export const useCart = () => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("delightCart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("delightCart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const exist = prev.find(
        (x) =>
          x.id === product.id &&
          JSON.stringify(x.extras) === JSON.stringify(product.extras),
      );

      if (exist) {
        return prev.map((x) =>
          x.id === product.id &&
          JSON.stringify(x.extras) === JSON.stringify(product.extras)
            ? { ...x, quantity: x.quantity + product.quantity }
            : x,
        );
      }
      return [...prev, { ...product }];
    });
  };

  const removeItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("delightCart");
  };

  return { cartItems, addToCart, removeItem, clearCart };
};
