import React, { useContext, useState } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import heart_icon from "../Assets/heart_icon.png"; // outline heart
import heart_filled_icon from "../Assets/heart_filled_icon.png"; // filled heart
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const toggleWishlist = () => {
    const auth = localStorage.getItem("auth-token");
    if (!auth) {
      alert("Please login first");
      return;
    }
    setIsWishlisted(!isWishlisted);

    // Optional: Add logic to send wishlist to backend
    // axios.post("/wishlist", { userId, productId: product.id })
  };

  const handleAddToCart = () => {
    const auth = localStorage.getItem("auth-token");
    if (!auth) {
      alert("Please login first");
      return;
    }
    addToCart(product.id);
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={backend_url + product.image} alt="img" />
          <img src={backend_url + product.image} alt="img" />
          <img src={backend_url + product.image} alt="img" />
          <img src={backend_url + product.image} alt="img" />
        </div>
        <div className="productdisplay-img">
          <img
            className="productdisplay-main-img"
            src={backend_url + product.image}
            alt="img"
          />
        </div>
      </div>
      <div className="productdisplay-right">
        <div className="productdisplay-header" style={{ display: "flex", alignItems: "center" }}>
          <h1 style={{ marginRight: "10px" }}>{product.name}</h1>
          <img
            className="wishlist-icon"
            src={isWishlisted ? heart_filled_icon : heart_icon}
            alt="wishlist"
            onClick={toggleWishlist}
            style={{ width: "30px", cursor: "pointer" }}
          />
        </div>
        <div className="productdisplay-right-stars">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">
            {currency}
            {product.old_price}
          </div>
          <div className="productdisplay-right-price-new">
            {currency}
            {product.new_price}
          </div>
        </div>
        <div className="productdisplay-right-description">
          {product.description}
        </div>
        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            <div>S</div>
            <div>M</div>
            <div>L</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>
        <button onClick={handleAddToCart}>ADD TO CART</button>
        
      </div>
    </div>
  );
};

export default ProductDisplay;
