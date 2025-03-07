import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/community">Community Guidelines</Link>
          <span className="footer-separator">|</span>
          <Link to="/contact">Join the Experience</Link>
        </div>
        <div className="social-links">
          <a href="https://www.instagram.com/theajayexperience/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://www.tiktok.com/@ajaythedj" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-tiktok"></i>
          </a>
          <a href="https://www.facebook.com/share/1C5XEqcUQp/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://www.youtube.com/@AjaytheDJ254" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-youtube"></i>
          </a>
          <a href="https://soundcloud.com/ajay-the-dj-722866087" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-soundcloud"></i>
          </a>
        </div>
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} The Ajay Experience. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 