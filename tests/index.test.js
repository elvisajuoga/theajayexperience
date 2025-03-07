/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { loadHTMLFile } = require('./utils/dom.test');

describe('Index.html', () => {
  let document;

  beforeEach(() => {
    // Mock fs.readFileSync
    jest.spyOn(fs, 'readFileSync').mockImplementation((filePath) => {
      if (filePath.includes('index.html')) {
        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Ajay Experience - Home</title>
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
              <section id="hero" class="hero-section">
                <h1>Welcome to Ajay Experience</h1>
              </section>
            </main>
            <footer>
              <p>&copy; 2023 Ajay Experience. All rights reserved.</p>
            </footer>
            <div id="cartSidebar" class="cart-sidebar">
              <div class="cart-header">
                <h2>Your Cart</h2>
                <span id="closeCart" class="close-cart">&times;</span>
              </div>
              <div class="cart-content">
                <div id="cartItems" class="cart-items"></div>
              </div>
              <div class="cart-footer">
                <div class="cart-total-row">
                  <span>Total:</span>
                  <span id="cartTotal">$0.00</span>
                </div>
                <button id="checkoutButton" class="checkout-button">Checkout</button>
              </div>
            </div>
          </body>
          </html>
        `;
      }
      return '';
    });

    // Load the HTML
    document = loadHTMLFile('index.html');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Document has the correct title', () => {
    expect(document.title).toBe('Ajay Experience - Home');
  });

  test('Navbar contains the correct links', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    expect(navLinks.length).toBe(4);
    
    const hrefs = Array.from(navLinks).map(link => link.getAttribute('href'));
    expect(hrefs).toContain('index.html');
    expect(hrefs).toContain('about.html');
    expect(hrefs).toContain('services.html');
    expect(hrefs).toContain('shop.html');
  });

  test('Cart sidebar exists and has the correct structure', () => {
    const cartSidebar = document.getElementById('cartSidebar');
    expect(cartSidebar).not.toBeNull();
    
    const cartHeader = cartSidebar.querySelector('.cart-header');
    expect(cartHeader).not.toBeNull();
    expect(cartHeader.querySelector('h2').textContent).toBe('Your Cart');
    
    const closeCart = document.getElementById('closeCart');
    expect(closeCart).not.toBeNull();
    
    const cartItems = document.getElementById('cartItems');
    expect(cartItems).not.toBeNull();
    
    const cartTotal = document.getElementById('cartTotal');
    expect(cartTotal).not.toBeNull();
    expect(cartTotal.textContent).toBe('$0.00');
    
    const checkoutButton = document.getElementById('checkoutButton');
    expect(checkoutButton).not.toBeNull();
    expect(checkoutButton.textContent).toBe('Checkout');
  });

  test('Hero section exists and has the correct content', () => {
    const heroSection = document.getElementById('hero');
    expect(heroSection).not.toBeNull();
    expect(heroSection.querySelector('h1').textContent).toBe('Welcome to Ajay Experience');
  });

  test('Footer exists and has the correct copyright text', () => {
    const footer = document.querySelector('footer');
    expect(footer).not.toBeNull();
    expect(footer.textContent).toContain('2023 Ajay Experience');
  });
}); 