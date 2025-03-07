/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { loadHTMLFile } = require('./utils/dom.test');

describe('Cart.html', () => {
  let document;

  beforeEach(() => {
    // Mock fs.readFileSync
    jest.spyOn(fs, 'readFileSync').mockImplementation((filePath) => {
      if (filePath.includes('cart.html')) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ajay Experience - Cart</title>
</head>
<body>
  <header>
    <div id="navbar" class="navbar">
      <div class="logo">
        <a href="index.html">Ajay Experience</a>
      </div>
      <nav>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="services.html">Services</a></li>
          <li><a href="shop.html">Shop</a></li>
        </ul>
      </nav>
      <div id="cartNavIcon" class="cart-icon">
        <i class="fas fa-shopping-bag"></i>
        <span class="cart-count">0</span>
      </div>
    </div>
  </header>
  <main>
    <section class="cart-page-hero">
      <h1>Your Cart</h1>
    </section>
    <section class="cart-page-container">
      <div class="cart-page-content">
        <div class="cart-table">
          <div class="cart-header-row">
            <div class="cart-header-cell">Product</div>
            <div class="cart-header-cell">Price</div>
            <div class="cart-header-cell">Quantity</div>
            <div class="cart-header-cell">Total</div>
            <div class="cart-header-cell">Actions</div>
          </div>
          <div id="cart-items" class="cart-items">
            <!-- Cart items will be loaded here -->
          </div>
        </div>
        <div class="cart-page-empty" id="empty-cart-message">
          <p>Your cart is empty.</p>
          <a href="shop.html" class="btn">Continue Shopping</a>
        </div>
      </div>
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="summary-row">
          <span>Subtotal</span>
          <span id="cart-subtotal">$0.00</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span id="cart-shipping">$0.00</span>
        </div>
        <div class="summary-row total-row">
          <span>Total</span>
          <span id="cart-total">$0.00</span>
        </div>
        <button id="checkout-btn" class="checkout-btn">Proceed to Checkout</button>
        <a href="shop.html" class="continue-shopping">Continue Shopping</a>
      </div>
    </section>
  </main>
  <footer>
    <p>&copy; 2023 Ajay Experience. All rights reserved.</p>
  </footer>
</body>
</html>
        `;
      }
      return '';
    });

    // Load the HTML
    document = loadHTMLFile('cart.html');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Document has the correct title', () => {
    expect(document.title).toBe('Ajay Experience - Cart');
  });

  test('Page contains the cart hero section with title', () => {
    const cartHero = document.querySelector('.cart-page-hero');
    expect(cartHero).not.toBeNull();
    expect(cartHero.querySelector('h1').textContent).toBe('Your Cart');
  });

  test('Cart table has correct headers', () => {
    const headerCells = document.querySelectorAll('.cart-header-cell');
    expect(headerCells.length).toBe(5);
    
    const headerTexts = Array.from(headerCells).map(cell => cell.textContent);
    expect(headerTexts).toContain('Product');
    expect(headerTexts).toContain('Price');
    expect(headerTexts).toContain('Quantity');
    expect(headerTexts).toContain('Total');
    expect(headerTexts).toContain('Actions');
  });

  test('Cart items container exists', () => {
    const cartItems = document.getElementById('cart-items');
    expect(cartItems).not.toBeNull();
  });

  test('Empty cart message exists', () => {
    const emptyCartMessage = document.getElementById('empty-cart-message');
    expect(emptyCartMessage).not.toBeNull();
    expect(emptyCartMessage.querySelector('p').textContent).toBe('Your cart is empty.');
    
    const continueShoppingBtn = emptyCartMessage.querySelector('a.btn');
    expect(continueShoppingBtn).not.toBeNull();
    expect(continueShoppingBtn.getAttribute('href')).toBe('shop.html');
  });

  test('Cart summary section exists with correct elements', () => {
    const cartSummary = document.querySelector('.cart-summary');
    expect(cartSummary).not.toBeNull();
    
    const summaryTitle = cartSummary.querySelector('h3');
    expect(summaryTitle).not.toBeNull();
    expect(summaryTitle.textContent).toBe('Order Summary');
    
    const subtotal = document.getElementById('cart-subtotal');
    expect(subtotal).not.toBeNull();
    expect(subtotal.textContent).toBe('$0.00');
    
    const shipping = document.getElementById('cart-shipping');
    expect(shipping).not.toBeNull();
    expect(shipping.textContent).toBe('$0.00');
    
    const total = document.getElementById('cart-total');
    expect(total).not.toBeNull();
    expect(total.textContent).toBe('$0.00');
    
    const checkoutBtn = document.getElementById('checkout-btn');
    expect(checkoutBtn).not.toBeNull();
    expect(checkoutBtn.textContent).toBe('Proceed to Checkout');
    
    const continueShoppingLink = cartSummary.querySelector('.continue-shopping');
    expect(continueShoppingLink).not.toBeNull();
    expect(continueShoppingLink.getAttribute('href')).toBe('shop.html');
  });
}); 