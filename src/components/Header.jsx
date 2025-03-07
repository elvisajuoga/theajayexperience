import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/icons/ajayXpLogo.PNG';

function Header() {
  return (
    <header className="navbar" id="navbar">
      <div className="logo">
        <img src={logo} alt="Ajay Logo" />
      </div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/events">Events</Link></li>
          <li><Link to="/mixes">Mixes</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
      <div className="social-icons">
        <a href="https://www.instagram.com/theajayexperience/" target="_blank" rel="noopener noreferrer" className="social-icon-link">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="https://www.tiktok.com/@ajaythedj" target="_blank" rel="noopener noreferrer" className="social-icon-link">
          <i className="fab fa-tiktok"></i>
        </a>
        <a href="https://www.facebook.com/share/1C5XEqcUQp/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="social-icon-link">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href="https://www.youtube.com/@AjaytheDJ254" target="_blank" rel="noopener noreferrer" className="social-icon-link">
          <i className="fab fa-youtube"></i>
        </a>
        <a href="https://soundcloud.com/ajay-the-dj-722866087" target="_blank" rel="noopener noreferrer" className="social-icon-link">
          <i className="fab fa-soundcloud"></i>
        </a>
        <div className="cart-icon" id="cartNavIcon">
          <i className="fas fa-shopping-bag"></i>
          <span className="cart-count" id="cartCountBadge">0</span>
        </div>
      </div>
    </header>
  );
}

export default Header; 