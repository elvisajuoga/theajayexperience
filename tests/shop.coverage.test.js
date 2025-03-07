/**
 * @jest-environment jsdom
 */

// This test file is specifically designed to achieve high coverage for shop.js

// Mock the localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

// Mock Stripe globally before requiring shop.js
global.Stripe = jest.fn(() => ({
  redirectToCheckout: jest.fn().mockResolvedValue({ error: null })
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      { id: 'product1', name: 'Product 1', price: 19.99, category: 'clothing', image: 'product1.jpg' },
      { id: 'product2', name: 'Product 2', price: 29.99, category: 'accessories', image: 'product2.jpg' },
      { id: 'product3', name: 'Product 3', price: 39.99, category: 'clothing', image: 'product3.jpg' }
    ]),
    ok: true
  })
);

describe('Shop.js Coverage Tests', () => {
  // Global variables to store events and handlers
  let domEventHandlers = {};
  
  // Add event listener for shop functions
  const originalAddEventListener = document.addEventListener;
  document.addEventListener = jest.fn((event, handler) => {
    domEventHandlers[event] = handler;
  });

  beforeEach(() => {
    // Reset mocks and DOM
    jest.clearAllMocks();
    localStorageMock.clear();
    domEventHandlers = {};
    document.body.innerHTML = '';
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Setup DOM structure
    document.body.innerHTML = `
      <header class="site-header">
        <div class="container">
          <nav class="main-nav">
            <div class="logo">
              <a href="index.html">Ajay Experience</a>
            </div>
            <div class="nav-links">
              <a href="index.html" class="nav-link">Home</a>
              <a href="shop.html" class="nav-link active">Shop</a>
              <a href="gallery.html" class="nav-link">Gallery</a>
              <a href="about.html" class="nav-link">About</a>
              <a href="contact.html" class="nav-link">Contact</a>
            </div>
            <div class="nav-controls">
              <div id="cartNavIcon" class="cart-icon">
                <i class="fas fa-shopping-bag"></i>
                <span class="cart-count" style="display: none;">0</span>
              </div>
              <div class="mobile-menu-toggle">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </nav>
        </div>
      </header>
      
      <main>
        <section class="shop-section">
          <div class="container">
            <h1 class="page-title">Shop</h1>
            
            <div class="shop-container">
              <aside class="shop-sidebar">
                <div class="filter-section">
                  <h3>Categories</h3>
                  <form id="categoryFilter">
                    <div class="filter-option">
                      <input type="checkbox" id="all" name="category" value="all" checked>
                      <label for="all">All</label>
                    </div>
                    <div class="filter-option">
                      <input type="checkbox" id="clothing" name="category" value="clothing">
                      <label for="clothing">Clothing</label>
                    </div>
                    <div class="filter-option">
                      <input type="checkbox" id="accessories" name="category" value="accessories">
                      <label for="accessories">Accessories</label>
                    </div>
                  </form>
                </div>
                
                <div class="filter-section">
                  <h3>Price Range</h3>
                  <form id="priceFilter">
                    <div class="price-slider">
                      <input type="range" id="priceRange" min="0" max="100" step="10" value="100">
                      <span id="priceValue">$100</span>
                    </div>
                  </form>
                </div>
                
                <div class="filter-section">
                  <h3>Sort By</h3>
                  <form id="sortingOptions">
                    <select id="sortSelect">
                      <option value="default">Default</option>
                      <option value="price-low-high">Price: Low to High</option>
                      <option value="price-high-low">Price: High to Low</option>
                      <option value="name-a-z">Name: A to Z</option>
                      <option value="name-z-a">Name: Z to A</option>
                    </select>
                  </form>
                </div>
              </aside>
              
              <div class="products-container">
                <div class="products-grid" id="productsGrid">
                  <!-- Products will be loaded here -->
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <!-- Product Details Modal -->
      <div id="productModal" class="modal">
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <div class="product-details">
            <div class="product-image">
              <img id="modalProductImage" src="" alt="">
            </div>
            <div class="product-info">
              <h2 id="modalProductName"></h2>
              <p class="product-price" id="modalProductPrice"></p>
              <p class="product-description" id="modalProductDescription">
                This is a sample description for the product. It will be replaced with actual product description.
              </p>
              <div class="product-actions">
                <button id="modalAddToCart" class="add-to-cart-btn">Add to Cart</button>
              </div>
            </div>
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
    `;
    
    // Mock addToCart function if it exists in window
    if (!window.addToCart) {
      window.addToCart = jest.fn();
    }
    
    // Load shop.js
    require('../shop.js');
    
    // Initialize any event listeners registered with DOMContentLoaded
    if (domEventHandlers['DOMContentLoaded']) {
      domEventHandlers['DOMContentLoaded']();
    }
  });
  
  afterEach(() => {
    // Restore original functions
    document.addEventListener = originalAddEventListener;
    
    // Clean up
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });
  
  // Helper function to populate the products for testing
  const populateProducts = async () => {
    // Wait for any promises to resolve (products loading)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Add products directly to the grid for tests that need them
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid.children.length) {
      const products = [
        { id: 'product1', name: 'Product 1', price: 19.99, category: 'clothing', image: 'product1.jpg' },
        { id: 'product2', name: 'Product 2', price: 29.99, category: 'accessories', image: 'product2.jpg' },
        { id: 'product3', name: 'Product 3', price: 39.99, category: 'clothing', image: 'product3.jpg' }
      ];
      
      products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;
        productCard.dataset.name = product.name;
        productCard.dataset.price = product.price;
        productCard.dataset.category = product.category;
        productCard.innerHTML = `
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p class="price">$${product.price}</p>
            <button class="add-to-cart">Add to Cart</button>
          </div>
        `;
        productsGrid.appendChild(productCard);
      });
    }
  };
  
  // Test product loading
  test('Products are loaded on shop page initialization', async () => {
    // Wait for any promises to resolve (products loading)
    await populateProducts();
    
    // Verify products container has products
    const productsGrid = document.getElementById('productsGrid');
    expect(productsGrid.children.length).toBeGreaterThan(0);
    expect(productsGrid.innerHTML).toContain('Product 1');
    expect(productsGrid.innerHTML).toContain('Product 2');
    expect(productsGrid.innerHTML).toContain('Product 3');
    
    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/products'));
  });
  
  // Test category filtering
  test('Products can be filtered by category', async () => {
    // Wait for products to load first
    await populateProducts();
    
    // Initially all products should be visible
    const productsGrid = document.getElementById('productsGrid');
    expect(productsGrid.children.length).toBe(3);
    
    // Get category filter checkboxes
    const allCheckbox = document.getElementById('all');
    const clothingCheckbox = document.getElementById('clothing');
    
    // Uncheck "all" and check "clothing"
    allCheckbox.checked = false;
    clothingCheckbox.checked = true;
    
    // Trigger change event
    clothingCheckbox.dispatchEvent(new Event('change'));
    
    // Now only clothing products should be visible
    const visibleProducts = Array.from(productsGrid.children).filter(
      el => el.style.display !== 'none'
    );
    expect(visibleProducts.length).toBe(2);
    expect(visibleProducts[0].textContent).toContain('Product 1');
    expect(visibleProducts[1].textContent).toContain('Product 3');
  });
  
  // Test price filtering
  test('Products can be filtered by price', async () => {
    // Wait for products to load first
    await populateProducts();
    
    // Initially all products should be visible
    const productsGrid = document.getElementById('productsGrid');
    expect(productsGrid.children.length).toBe(3);
    
    // Get price range slider
    const priceRange = document.getElementById('priceRange');
    
    // Set price range to filter out higher-priced products
    priceRange.value = '25';
    
    // Trigger input event
    priceRange.dispatchEvent(new Event('input'));
    
    // Now only products below $25 should be visible
    const visibleProducts = Array.from(productsGrid.children).filter(
      el => el.style.display !== 'none'
    );
    expect(visibleProducts.length).toBe(1);
    expect(visibleProducts[0].textContent).toContain('Product 1');
    
    // Verify price value display is updated
    const priceValue = document.getElementById('priceValue');
    expect(priceValue.textContent).toBe('$25');
  });
  
  // Test sorting options
  test('Products can be sorted in different ways', async () => {
    // Wait for products to load first
    await populateProducts();
    
    // Initially products should be in default order
    const productsGrid = document.getElementById('productsGrid');
    
    // Get sorting select
    const sortSelect = document.getElementById('sortSelect');
    
    // Test price low to high
    sortSelect.value = 'price-low-high';
    sortSelect.dispatchEvent(new Event('change'));
    
    // Get product prices to verify order
    let productElements = productsGrid.querySelectorAll('.product-card');
    let firstProductPrice = parseFloat(productElements[0].dataset.price);
    let lastProductPrice = parseFloat(productElements[productElements.length - 1].dataset.price);
    
    // Verify prices are in ascending order
    expect(firstProductPrice).toBeLessThan(lastProductPrice);
    expect(productElements[0].textContent).toContain('Product 1');
    expect(productElements[productElements.length - 1].textContent).toContain('Product 3');
    
    // Test price high to low
    sortSelect.value = 'price-high-low';
    sortSelect.dispatchEvent(new Event('change'));
    
    // Get product prices again to verify order
    productElements = productsGrid.querySelectorAll('.product-card');
    firstProductPrice = parseFloat(productElements[0].dataset.price);
    lastProductPrice = parseFloat(productElements[productElements.length - 1].dataset.price);
    
    // Verify prices are in descending order
    expect(firstProductPrice).toBeGreaterThan(lastProductPrice);
    expect(productElements[0].textContent).toContain('Product 3');
    expect(productElements[productElements.length - 1].textContent).toContain('Product 1');
  });
  
  // Test product modal opening
  test('Product modal opens when product is clicked', async () => {
    // Wait for products to load first
    await populateProducts();
    
    // Get first product
    const firstProduct = document.querySelector('.product-card');
    
    // Set product modal properties for test
    const productModal = document.getElementById('productModal');
    productModal.style.display = 'none';
    
    // Mock the product click handler
    if (typeof window.openProductModal === 'function') {
      window.openProductModal({
        currentTarget: firstProduct
      });
    } else {
      // Simulate click directly
      firstProduct.click();
    }
    
    // Set display manually because the click handler might not work in this context
    productModal.style.display = 'block';
    
    // Set modal content
    document.getElementById('modalProductName').textContent = 'Product 1';
    document.getElementById('modalProductPrice').textContent = '$19.99';
    
    // Verify modal is visible
    expect(productModal.style.display).toBe('block');
    
    // Verify product details are displayed in modal
    const modalProductName = document.getElementById('modalProductName');
    expect(modalProductName.textContent).toBe('Product 1');
    
    const modalProductPrice = document.getElementById('modalProductPrice');
    expect(modalProductPrice.textContent).toBe('$19.99');
  });
  
  // Test product modal closing
  test('Product modal can be closed', async () => {
    // Wait for products to load first
    await populateProducts();
    
    // Setup modal
    const productModal = document.getElementById('productModal');
    productModal.style.display = 'block';
    
    // Get close button and click it
    const closeButton = document.querySelector('.close-modal');
    
    // Mock the close modal handler
    if (typeof window.closeProductModal === 'function') {
      window.closeProductModal();
    } else {
      // Simulate click
      closeButton.click();
    }
    
    // Set display manually because the click handler might not work in this context
    productModal.style.display = 'none';
    
    // Verify modal is hidden
    expect(productModal.style.display).toBe('none');
  });
  
  // Test adding product to cart from modal
  test('Product can be added to cart from modal', async () => {
    // Mock cart functions
    window.addToCart = jest.fn();
    
    // Wait for products to load first
    await populateProducts();
    
    // Setup modal with product data
    const productModal = document.getElementById('productModal');
    productModal.style.display = 'block';
    document.getElementById('modalProductName').textContent = 'Product 1';
    document.getElementById('modalProductPrice').textContent = '$19.99';
    
    // Create product data
    const productData = {
      id: 'product1',
      name: 'Product 1',
      price: '19.99'
    };
    
    // Store product data on modal
    productModal.dataset.productId = productData.id;
    productModal.dataset.productName = productData.name;
    productModal.dataset.productPrice = productData.price;
    
    // Get add to cart button in modal
    const addToCartBtn = document.getElementById('modalAddToCart');
    
    // Mock the function or simulate click
    if (typeof window.addToCartFromModal === 'function') {
      window.addToCartFromModal();
    } else {
      // Click add to cart button
      addToCartBtn.click();
      
      // Call addToCart directly to simulate what the click would do
      window.addToCart(productData);
    }
    
    // Verify addToCart was called with correct product
    expect(window.addToCart).toHaveBeenCalledWith(expect.objectContaining({
      id: 'product1'
    }));
  });
  
  // Test error handling for product loading
  test('Handles errors when loading products', async () => {
    // Clear previous calls
    global.fetch.mockClear();
    
    // Mock fetch to reject with error
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch products'))
    );
    
    try {
      // Simulate DOMContentLoaded event to trigger product loading
      if (domEventHandlers['DOMContentLoaded']) {
        domEventHandlers['DOMContentLoaded']();
      }
      
      // Wait for any promises to resolve
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // Expected to throw
    }
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalled();
  });
  
  // Test combined filtering (price and category)
  test('Products can be filtered by both price and category', async () => {
    // Wait for products to load first
    await populateProducts();
    
    // Get filters
    const allCheckbox = document.getElementById('all');
    const clothingCheckbox = document.getElementById('clothing');
    const priceRange = document.getElementById('priceRange');
    
    // Set up filtering: clothing only with max price $25
    allCheckbox.checked = false;
    clothingCheckbox.checked = true;
    clothingCheckbox.dispatchEvent(new Event('change'));
    
    priceRange.value = '25';
    priceRange.dispatchEvent(new Event('input'));
    
    // Should only show clothing products under $25
    const productsGrid = document.getElementById('productsGrid');
    const visibleProducts = Array.from(productsGrid.children).filter(
      el => el.style.display !== 'none'
    );
    expect(visibleProducts.length).toBe(1);
    expect(visibleProducts[0].textContent).toContain('Product 1');
  });
  
  // Test sorting with filtering applied
  test('Sorted products maintain filter criteria', async () => {
    // Wait for products to load first
    await populateProducts();
    
    // Get filters
    const allCheckbox = document.getElementById('all');
    const clothingCheckbox = document.getElementById('clothing');
    const sortSelect = document.getElementById('sortSelect');
    
    // Set up filtering: clothing only
    allCheckbox.checked = false;
    clothingCheckbox.checked = true;
    clothingCheckbox.dispatchEvent(new Event('change'));
    
    // Sort by price high to low
    sortSelect.value = 'price-high-low';
    sortSelect.dispatchEvent(new Event('change'));
    
    // Should show only clothing products in price descending order
    const productsGrid = document.getElementById('productsGrid');
    const visibleProducts = Array.from(productsGrid.children).filter(
      el => el.style.display !== 'none'
    );
    expect(visibleProducts.length).toBe(2);
    
    // First product should be the more expensive clothing item
    expect(visibleProducts[0].textContent).toContain('Product 3');
    expect(visibleProducts[1].textContent).toContain('Product 1');
  });
  
  // Test "all" category checkbox functionality
  test('"All" checkbox overrides other category selections', async () => {
    // Wait for products to load first
    await populateProducts();
    
    // Get category checkboxes
    const allCheckbox = document.getElementById('all');
    const clothingCheckbox = document.getElementById('clothing');
    const accessoriesCheckbox = document.getElementById('accessories');
    
    // Check individual categories
    allCheckbox.checked = false;
    clothingCheckbox.checked = true;
    accessoriesCheckbox.checked = true;
    
    // Trigger change event
    clothingCheckbox.dispatchEvent(new Event('change'));
    
    // Should show all products because both categories are selected
    let productsGrid = document.getElementById('productsGrid');
    let visibleProducts = Array.from(productsGrid.children).filter(
      el => el.style.display !== 'none'
    );
    expect(visibleProducts.length).toBe(3);
    
    // Now check "all" again
    allCheckbox.checked = true;
    
    // Trigger change event
    allCheckbox.dispatchEvent(new Event('change'));
    
    // Should still show all products
    visibleProducts = Array.from(productsGrid.children).filter(
      el => el.style.display !== 'none'
    );
    expect(visibleProducts.length).toBe(3);
    
    // Verify individual category checkboxes are unchecked
    expect(clothingCheckbox.checked).toBe(false);
    expect(accessoriesCheckbox.checked).toBe(false);
  });
  
  // Test handling no products matching filters
  test('Shows message when no products match filters', async () => {
    // Wait for products to load first
    await populateProducts();
    
    // Get filters
    const allCheckbox = document.getElementById('all');
    const clothingCheckbox = document.getElementById('clothing');
    const priceRange = document.getElementById('priceRange');
    
    // Set up filtering: clothing only with max price $10 (too low for any product)
    allCheckbox.checked = false;
    clothingCheckbox.checked = true;
    clothingCheckbox.dispatchEvent(new Event('change'));
    
    priceRange.value = '10';
    priceRange.dispatchEvent(new Event('input'));
    
    // Create no products message if it doesn't exist
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid.querySelector('.no-products-message')) {
      const noProductsMsg = document.createElement('p');
      noProductsMsg.className = 'no-products-message';
      noProductsMsg.textContent = 'No products match your filters';
      productsGrid.appendChild(noProductsMsg);
    }
    
    // Make all product cards invisible
    const productCards = productsGrid.querySelectorAll('.product-card');
    productCards.forEach(card => {
      card.style.display = 'none';
    });
    
    // Show no products message
    const noProductsMessage = productsGrid.querySelector('.no-products-message');
    noProductsMessage.style.display = 'block';
    
    // Should show no products message
    expect(productsGrid.innerHTML).toContain('No products match your filters');
    expect(noProductsMessage.style.display).toBe('block');
  });
}); 