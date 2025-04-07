import React, { useEffect, useState } from "react";
import axios from "axios";
import { backend_url, currency } from "../App";


const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    const auth = localStorage.getItem("auth-token");
    if (!auth) {
      alert("Please login to view your wishlist");
      return;
    }

    try {
      const res = await axios.post(`${backend_url}/getwishlist`, {}, {
        headers: { "auth-token": auth },
      });
      setWishlist(res.data || []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  const removeFromWishlist = async (itemId) => {
    const auth = localStorage.getItem("auth-token");
    if (!auth) {
      alert("Please login first");
      return;
    }

    try {
      await axios.post(`${backend_url}/removefromwishlist`, { itemId }, {
        headers: { "auth-token": auth },
      });
      setWishlist((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Error removing item from wishlist:", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (wishlist.length === 0) {
    return <div className="wishlist-empty">Your wishlist is empty</div>;
  }

  return (
    <div className="wishlist-container">
      <h2>Your Wishlist</h2>
      <div className="wishlist-items">
        {wishlist.map((product) => (
          <div key={product.id} className="wishlist-card">
            <img
              src={backend_url + product.image}
              alt={product.name}
              className="wishlist-product-img"
            />
            <div className="wishlist-info">
              <h3>{product.name}</h3>
              <p className="wishlist-price">
                <span className="old-price">{currency}{product.old_price}</span> → <span className="new-price">{currency}{product.new_price}</span>
              </p>
              <button
                className="wishlist-remove-btn"
                onClick={() => removeFromWishlist(product.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
