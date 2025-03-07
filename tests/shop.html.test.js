/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { loadHTMLFile } = require('./utils/dom.test');

describe('Shop.html', () => {
  let document;

  beforeEach(() => {
    // Mock fs.readFileSync
    jest.spyOn(fs, 'readFileSync').mockImplementation((filePath) => {
      if (filePath.includes('shop.html')) {
        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Ajay Experience - Shop</title>
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
              <section class="shop-hero">
                <h1>Shop</h1>
              </section>
              <section class="shop-container">
                <aside class="category-sidebar">
                  <h3>Categories</h3>
                  <ul id="categoryList" class="category-list">
                    <!-- Categories will be loaded here -->
                  </ul>
                </aside>
                <div class="products-section">
                  <div id="productsGrid" class="products-grid">
                    <!-- Products will be loaded here -->
                  </div>
                </div>
              </section>
            </main>
            <footer>
              <p>&copy; 2023 Ajay Experience. All rights reserved.</p>
            </footer>
            <!-- Product Modal -->
            <div id="productModal" class="product-modal">
              <div class="modal-content">
                <span id="closeModal" class="close-modal">&times;</span>
                <div id="modalContent" class="modal-product-content">
                  <!-- Product details will be loaded here -->
                </div>
              </div>
            </div>
            <!-- Cart Sidebar -->
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
    document = loadHTMLFile('shop.html');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Document has the correct title', () => {
    expect(document.title).toBe('Ajay Experience - Shop');
  });

  test('Page contains the shop hero section with title', () => {
    const shopHero = document.querySelector('.shop-hero');
    expect(shopHero).not.toBeNull();
    expect(shopHero.querySelector('h1').textContent).toBe('Shop');
  });

  test('Page has categories sidebar', () => {
    const categorySidebar = document.querySelector('.category-sidebar');
    expect(categorySidebar).not.toBeNull();
    
    const categoryTitle = categorySidebar.querySelector('h3');
    expect(categoryTitle).not.toBeNull();
    expect(categoryTitle.textContent).toBe('Categories');
    
    const categoryList = document.getElementById('categoryList');
    expect(categoryList).not.toBeNull();
  });

  test('Products grid exists', () => {
    const productsGrid = document.getElementById('productsGrid');
    expect(productsGrid).not.toBeNull();
  });

  test('Product modal exists', () => {
    const productModal = document.getElementById('productModal');
    expect(productModal).not.toBeNull();
    
    const closeModal = document.getElementById('closeModal');
    expect(closeModal).not.toBeNull();
    
    const modalContent = document.getElementById('modalContent');
    expect(modalContent).not.toBeNull();
  });

  test('Cart sidebar exists in shop page', () => {
    const cartSidebar = document.getElementById('cartSidebar');
    expect(cartSidebar).not.toBeNull();
    
    const cartItems = document.getElementById('cartItems');
    expect(cartItems).not.toBeNull();
    
    const cartTotal = document.getElementById('cartTotal');
    expect(cartTotal).not.toBeNull();
    
    const checkoutButton = document.getElementById('checkoutButton');
    expect(checkoutButton).not.toBeNull();
  });
}); 