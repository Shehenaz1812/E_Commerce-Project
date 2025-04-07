import React from "react";
import "./Hero.css";
import arrow_icon from "../Assets/arrow.png";

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1 className="hero-brand">
            Welcome to<br />ELEVATE FASHION
        </h1>
        <p className="hero-tagline">Unleash Your Style, Elevate Your Elegance</p>

        {/* ✅ Smooth scroll anchor link */}
        <a href="#new-collections" className="hero-latest-btn">
          <div>Explore Now</div>
          <img src={arrow_icon} alt="Arrow Icon" />
        </a>
      </div>
    </div>
  );
};

export default Hero;
