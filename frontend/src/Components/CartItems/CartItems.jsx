import React, { useContext, useState } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";

const CartItems = () => {
  const { products, cartItems, removeFromCart, getTotalCartAmount } = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Checkout process simulation
  const handleCheckout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Checkout successful!");
      // Add actual logic here
    }, 2000);
  };

  // Promo code handler
  const handlePromoCode = () => {
    if (promoCode.trim().toUpperCase() === 'OFFER50') {
      setDiscount(0.5); // 50% discount
    } else {
      setDiscount(0);
      alert("Invalid promo code!");
    }
  };

  // Discounted total calculation
  const getDiscountedTotal = () => {
    const total = getTotalCartAmount();
    return (total - total * discount).toFixed(2);
  };

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />

      {products.map((e) => {
        const cartItem = cartItems[e.id];
        if (cartItem && cartItem.quantity > 0) {
          return (
            <div key={e.id}>
              <div className="cartitems-format-main cartitems-format">
                <img className="cartitems-product-icon" src={backend_url + e.image} alt={e.name} />
                <div className="cartitems-product-details">
                  <p className="cartitems-product-title">{e.name}</p>
                  <p className="cartitems-product-size">Size: {cartItem.size}</p>
                </div>
                <p>{currency}{e.new_price}</p>
                <button className="cartitems-quantity">{cartItem.quantity}</button>
                <p>{currency}{(e.new_price * cartItem.quantity).toFixed(2)}</p>
                <img onClick={() => removeFromCart(e.id)} className="cartitems-remove-icon" src={cross_icon} alt="remove" />
              </div>
              <hr />
            </div>
          );
        }
        return null;
      })}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>{currency}{getTotalCartAmount().toFixed(2)}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Promo Code Discount</p>
              <p>-{currency}{(getTotalCartAmount() * discount).toFixed(2)}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>{currency}{getDiscountedTotal()}</h3>
            </div>
          </div>
          <button onClick={handleCheckout} disabled={loading}>
            {loading ? "Processing..." : "PROCEED TO CHECKOUT"}
          </button>
          {loading && <div className="loader"></div>}
        </div>

        <div className="cartitems-promocode">
          <p>If you have a promo code, enter it here:</p>
          <div className="cartitems-promobox">
            <input
              type="text"
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button onClick={handlePromoCode}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
