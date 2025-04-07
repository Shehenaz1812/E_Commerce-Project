import React, { useState, useContext } from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { backend_url, currency } from '../../App';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import axios from 'axios';
import { ShopContext } from '../../Context/ShopContext'; // Assuming you have context here

const Item = (props) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { user } = useContext(ShopContext); // Assuming your context has `user`

  const handleWishlist = async () => {
    if (!user || !user._id) {
      alert('Please log in to add to wishlist!');
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/wishlist', //backend port
      {
        userId: user._id,
        productId: props.id,
      });
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Failed to add to wishlist', error);
    }
  };

  return (
    <div className="item">
      <Link to={`/product/${props.id}`} onClick={() => window.scrollTo(0, 0)}>
        <img src={backend_url + props.image} alt="products" />
      </Link>

      {/* Name and Heart in a Row */}
      <div className="item-header">
        <p className="item-name">{props.name}</p>
        <div className="wishlist-icon" onClick={handleWishlist}>
          {isWishlisted ? <AiFillHeart color="red" /> : <AiOutlineHeart />}
        </div>
      </div>

      <div className="item-prices">
        <div className="item-price-new">{currency}{props.new_price}</div>
        <div className="item-price-old">{currency}{props.old_price}</div>
      </div>
    </div>
  );
};

export default Item;
