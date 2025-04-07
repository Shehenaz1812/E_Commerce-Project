import React, { useEffect, useState } from "react";
import "./CSS/ShopCategory.css";
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from "../Components/Item/Item";
import { Link } from "react-router-dom";

const ShopCategory = (props) => {
  const [allProducts, setAllProducts] = useState([]);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');

  const sizes = ['All', 'Small', 'Medium', 'Large'];
  const priceRanges = ['All', 'Below 500', '500 - 1000', '1000 - 2000', 'Above 2000'];

  const fetchInfo = () => { 
    fetch('http://localhost:4000/allproducts') 
      .then((res) => res.json()) 
      .then((data) => {
        setAllProducts(data);
        setSortedProducts(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const sortProducts = (order, products = sortedProducts) => {
    const sorted = [...products].sort((a, b) => {
      if (order === 'asc') {
        return a.new_price - b.new_price;
      } else {
        return b.new_price - a.new_price;
      }
    });
    setSortedProducts(sorted);
  };

  const filterProductsByPrice = (products, range) => {
    switch (range) {
      case 'Below 500':
        return products.filter(product => product.new_price < 500);
      case '500 - 1000':
        return products.filter(product => product.new_price >= 500 && product.new_price <= 1000);
      case '1000 - 2000':
        return products.filter(product => product.new_price > 1000 && product.new_price <= 2000);
      case 'Above 2000':
        return products.filter(product => product.new_price > 2000);
      default:
        return products;
    }
  };

  const filterProducts = (size, priceRange) => {
    let filtered = allProducts;

    if (size !== 'All') {
      filtered = filtered.filter(product => product.size === size);
    }

    filtered = filterProductsByPrice(filtered, priceRange);
    sortProducts(sortOrder, filtered); // Apply sorting after filtering
  };

  const handleSortChange = (e) => {
    const order = e.target.value;
    setSortOrder(order);
    sortProducts(order);
  };

  const handleSizeChange = (e) => {
    const size = e.target.value;
    setSelectedSize(size);
    filterProducts(size, selectedPriceRange);
  };

  const handlePriceRangeChange = (e) => {
    const priceRange = e.target.value;
    setSelectedPriceRange(priceRange);
    filterProducts(selectedSize, priceRange);
  };

  return (
    <div className="shopcategory">
      <img src={props.banner} className="shopcategory-banner" alt="" />

      <div className="shopcategory-filters">
        <div className="shopcategory-sort">
          Sort by
          <select value={sortOrder} onChange={handleSortChange}>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
          <img src={dropdown_icon} alt="" />
        </div>

        <div className="shopcategory-filter">
          Filter by Size
          <select value={selectedSize} onChange={handleSizeChange}>
            {sizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="shopcategory-filter">
          Filter by Price
          <select value={selectedPriceRange} onChange={handlePriceRangeChange}>
            {priceRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="shopcategory-products">
        {sortedProducts
          .filter(item => props.category === item.category)
          .map((item, i) => (
            <Item 
              id={item.id}
              key={i}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        }
      </div>

      <div className="shopcategory-loadmore">
        <Link to='/' style={{ textDecoration: 'none' }}>Explore More</Link>
      </div>
    </div>
  );
};

export default ShopCategory;
