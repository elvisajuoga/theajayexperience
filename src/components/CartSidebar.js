import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  // You'll need to implement the cart logic
  // This would replace your current cart.js functionality

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`} id="cartSidebar">
      <div className="cart-header">
        <h2>Your Bag</h2>
        <button className="close-cart" onClick={() => setIsOpen(false)}>&times;</button>
      </div>
      <div className="cart-content">
        <div id="cartItems">
          {/* Cart items will be rendered here */}
        </div>
      </div>
      <div className="cart-footer">
        <div className="cart-total-row">
          <span>Total:</span>
          <span id="cartTotal">${total.toFixed(2)}</span>
        </div>
        <Link to="/checkout" className="checkout-button">Checkout</Link>
        <Link to="/cart" className="view-cart-button">View Bag</Link>
      </div>
    </div>
  );
}

export default CartSidebar; 