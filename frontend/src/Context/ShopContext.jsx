import React, { createContext, useEffect, useState } from "react";
import { backend_url } from "../App";

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [wishlistItems, setWishlistItems] = useState({});
  const [user, setUser] = useState(null);

  const fetchConfig = (token) => ({
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "auth-token": token,
    },
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Invalid JSON in localStorage for 'user'");
      }
    }

    fetch(`${backend_url}/allproducts`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Error loading products:", err));

    const token = localStorage.getItem("auth-token");
    if (token) {
      fetch(`${backend_url}/getcart`, {
        ...fetchConfig(token),
        body: JSON.stringify({}),
      })
        .then((res) => res.json())
        .then((data) => setCartItems(data || {}))
        .catch((err) => console.error("Error loading cart:", err));

      fetch(`${backend_url}/getwishlist`, {
        ...fetchConfig(token),
        body: JSON.stringify({}),
      })
        .then((res) => res.json())
        .then((data) => {
          const wishlistObj = {};
          (data || []).forEach((id) => (wishlistObj[id] = true));
          setWishlistItems(wishlistObj);
        })
        .catch((err) => console.error("Error loading wishlist:", err));
    }
  }, []);

  const getTotalCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      const item = products.find((p) => p.id === Number(id));
      if (item && cartItems[id]?.quantity > 0) {
        total += cartItems[id].quantity * item.new_price;
      }
    }
    return total;
  };

  const getTotalCartItems = () => {
    let total = 0;
    for (const id in cartItems) {
      total += cartItems[id]?.quantity || 0;
    }
    return total;
  };

  const addToCart = (itemId, size = "M") => {
    if (!localStorage.getItem("auth-token")) return alert("Please Login");

    setCartItems((prev) => {
      const existing = prev[itemId] || { quantity: 0, size };
      return {
        ...prev,
        [itemId]: { quantity: existing.quantity + 1, size: existing.size },
      };
    });

    fetch(`${backend_url}/addtocart`, {
      ...fetchConfig(localStorage.getItem("auth-token")),
      body: JSON.stringify({ itemId, size }),
    }).catch((err) => console.error("Add to cart failed:", err));
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;

      const updatedQuantity = existing.quantity - 1;
      if (updatedQuantity <= 0) {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      }

      return {
        ...prev,
        [itemId]: { ...existing, quantity: updatedQuantity },
      };
    });

    fetch(`${backend_url}/removefromcart`, {
      ...fetchConfig(localStorage.getItem("auth-token")),
      body: JSON.stringify({ itemId }),
    }).catch((err) => console.error("Remove from cart failed:", err));
  };

  const addToWishlist = async (itemId) => {
    if (!localStorage.getItem("auth-token")) return alert("Please Login");

    try {
      const res = await fetch(`${backend_url}/addtowishlist`, {
        ...fetchConfig(localStorage.getItem("auth-token")),
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();
      const wishlistObj = {};
      (data || []).forEach((id) => (wishlistObj[id] = true));
      setWishlistItems(wishlistObj);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      const res = await fetch(`${backend_url}/removefromwishlist`, {
        ...fetchConfig(localStorage.getItem("auth-token")),
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();
      const wishlistObj = {};
      (data || []).forEach((id) => (wishlistObj[id] = true));
      setWishlistItems(wishlistObj);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const contextValue = {
    products,
    cartItems,
    wishlistItems,
    getTotalCartAmount,
    getTotalCartItems,
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    user,
    setUser,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
