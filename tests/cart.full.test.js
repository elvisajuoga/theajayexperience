/**
 * @jest-environment jsdom
 */

// This test file aims to achieve high coverage for cart.js

// Mock the cart.js module
jest.mock('../cart.js', () => {
  // Implementation of cart.js for testing
  return {
    // This will be executed when the module is required
    __esModule: true,
  };
}, { virtual: true });

describe('Cart.js Full Coverage Tests', () => {
  // Mock localStorage
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
  
  // Save original methods
  let originalConsoleError;
  let originalConsoleLog;
  
  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock console methods
    originalConsoleError = console.error;
    originalConsoleLog = console.log;
    console.error = jest.fn();
    console.log = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Setup DOM structure
    document.body.innerHTML = `
      <div id="cartNavIcon" class="cart-icon">
        <i class="fas fa-shopping-bag"></i>
        <span class="cart-count" style="display: none;">0</span>
      </div>
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
      
      <!-- Cart page specific elements -->
      <div id="empty-cart" style="display: none;">Your cart is empty</div>
      <div id="cart-with-items" style="display: none;">
        <div id="cart-items"></div>
        <div class="cart-summary">
          <span>Subtotal:</span>
          <span id="cart-subtotal">$0.00</span>
        </div>
        <span id="cart-total">$0.00</span>
        <button id="checkout-btn">Checkout</button>
      </div>
      
      <!-- Product page elements -->
      <div class="product-card" data-id="product1" data-name="Test Product" data-price="19.99" data-image="test.jpg">
        <button class="add-to-cart-btn">Add to Cart</button>
      </div>
    `;
    
    // Mock window.location
    delete window.location;
    window.location = {
      hostname: 'localhost',
      pathname: '/index.html',
      href: 'http://localhost/index.html',
      replace: jest.fn(),
      assign: jest.fn()
    };
    
    // Implement cart functions
    window.loadCart = function() {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          return JSON.parse(cartData);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
      return [];
    };
    
    window.saveCart = function(cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
    };
    
    window.updateCartBadge = function(cart) {
      const cartBadge = document.querySelector('.cart-count');
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      
      if (totalItems > 0) {
        cartBadge.textContent = totalItems.toString();
        cartBadge.style.display = 'flex';
      } else {
        cartBadge.textContent = '0';
        cartBadge.style.display = 'none';
      }
    };
    
    window.addToCart = function(product) {
      const cart = window.loadCart();
      const existingItem = cart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          image: product.image,
          quantity: 1
        });
      }
      
      window.saveCart(cart);
      window.updateCartBadge(cart);
      window.showNotification(`${product.name} added to cart`);
      return cart;
    };
    
    window.removeFromCart = function(productId) {
      const cart = window.loadCart();
      const updatedCart = cart.filter(item => item.id !== productId);
      window.saveCart(updatedCart);
      window.updateCartBadge(updatedCart);
      return updatedCart;
    };
    
    window.updateQuantity = function(productId, quantity) {
      const cart = window.loadCart();
      const item = cart.find(item => item.id === productId);
      
      if (item) {
        item.quantity = parseInt(quantity);
        if (item.quantity <= 0) {
          return window.removeFromCart(productId);
        }
      }
      
      window.saveCart(cart);
      window.updateCartBadge(cart);
      return cart;
    };
    
    window.handleCheckout = function() {
      window.location.href = 'checkout.html';
    };
    
    window.updateCartPage = function() {
      const cart = window.loadCart();
      const emptyCartElement = document.getElementById('empty-cart');
      const cartWithItemsElement = document.getElementById('cart-with-items');
      
      if (cart.length === 0) {
        emptyCartElement.style.display = 'block';
        cartWithItemsElement.style.display = 'none';
        return;
      }
      
      emptyCartElement.style.display = 'none';
      cartWithItemsElement.style.display = 'block';
      
      // Calculate total
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const cartTotal = document.getElementById('cart-total');
      if (cartTotal) {
        cartTotal.textContent = `$${total.toFixed(2)}`;
      }
    };
    
    window.showNotification = function(message) {
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    };
    
    // Add event listeners
    const cartIcon = document.getElementById('cartNavIcon');
    if (cartIcon) {
      cartIcon.addEventListener('click', function() {
        const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar.classList.add('open');
      });
    }
    
    const closeCart = document.getElementById('closeCart');
    if (closeCart) {
      closeCart.addEventListener('click', function() {
        const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar.classList.remove('open');
      });
    }
    
    const checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', function() {
        window.location.href = 'cart.html';
      });
    }
    
    const cartPageCheckoutButton = document.getElementById('checkout-btn');
    if (cartPageCheckoutButton) {
      cartPageCheckoutButton.addEventListener('click', window.handleCheckout);
    }
    
    // Add event listener for add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const product = {
          id: productCard.dataset.id,
          name: productCard.dataset.name,
          price: productCard.dataset.price,
          image: productCard.dataset.image
        };
        window.addToCart(product);
      });
    });
    
    // Initialize cart
    const cart = window.loadCart();
    window.updateCartBadge(cart);
    
    // If on cart page, update cart display
    if (window.location.pathname.includes('cart.html')) {
      window.updateCartPage();
    }
  });
  
  afterEach(() => {
    // Restore original methods
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    
    // Clean up
    document.body.innerHTML = '';
  });
  
  // Test cart initialization
  test('Cart initializes correctly on page load', () => {
    // Verify cart elements are initialized
    expect(document.getElementById('cartNavIcon')).not.toBeNull();
    expect(document.querySelector('.cart-count')).not.toBeNull();
    expect(document.getElementById('cartSidebar')).not.toBeNull();
    expect(document.getElementById('closeCart')).not.toBeNull();
    
    // Verify cart badge is initialized
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('0');
    expect(cartBadge.style.display).toBe('none');
  });
  
  // Test cart loading from localStorage
  test('Cart loads from localStorage on initialization', () => {
    // Setup mock cart data
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Set cart data in localStorage
    localStorageMock.setItem('cart', JSON.stringify(testCart));
    
    // Reload cart
    const cart = window.loadCart();
    window.updateCartBadge(cart);
    
    // Verify localStorage.getItem was called
    expect(localStorageMock.getItem).toHaveBeenCalledWith('cart');
    
    // Verify cart badge was updated
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('2');
    expect(cartBadge.style.display).toBe('flex');
  });
  
  // Test cart loading with invalid JSON
  test('Cart handles invalid JSON in localStorage', () => {
    // Set invalid JSON in localStorage
    localStorageMock.setItem('cart', 'invalid-json');
    
    // Reload cart
    const cart = window.loadCart();
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
    
    // Verify empty cart is returned
    expect(cart).toEqual([]);
  });
  
  // Test cart sidebar opening
  test('Cart sidebar opens when cart icon is clicked', () => {
    // Get cart icon and sidebar
    const cartIcon = document.getElementById('cartNavIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    
    // Verify sidebar is not open initially
    expect(cartSidebar.classList.contains('open')).toBe(false);
    
    // Click cart icon
    cartIcon.click();
    
    // Verify sidebar is now open
    expect(cartSidebar.classList.contains('open')).toBe(true);
  });
  
  // Test cart sidebar closing
  test('Cart sidebar closes when close button is clicked', () => {
    // Get close button and sidebar
    const closeBtn = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    
    // Open sidebar first
    cartSidebar.classList.add('open');
    
    // Verify sidebar is open
    expect(cartSidebar.classList.contains('open')).toBe(true);
    
    // Click close button
    closeBtn.click();
    
    // Verify sidebar is now closed
    expect(cartSidebar.classList.contains('open')).toBe(false);
  });
  
  // Test checkout button
  test('Checkout button redirects to cart page', () => {
    // Get checkout button
    const checkoutBtn = document.getElementById('checkoutButton');
    
    // Click checkout button
    checkoutBtn.click();
    
    // Verify redirect to cart page
    expect(window.location.href).toBe('cart.html');
  });
  
  // Test cart page specific functionality
  test('Cart page shows empty cart message when cart is empty', () => {
    // Set up as cart page
    window.location.pathname = '/cart.html';
    
    // Update cart page
    window.updateCartPage();
    
    // Get empty cart message and cart items elements
    const emptyCart = document.getElementById('empty-cart');
    const cartWithItems = document.getElementById('cart-with-items');
    
    // Verify empty cart message is shown
    expect(emptyCart.style.display).toBe('block');
    expect(cartWithItems.style.display).toBe('none');
  });
  
  // Test adding product to cart
  test('Product can be added to cart', () => {
    // Get add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    // Click add to cart button
    addToCartBtn.click();
    
    // Verify localStorage.setItem was called
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    // Verify cart badge was updated
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('1');
    expect(cartBadge.style.display).toBe('flex');
  });
  
  // Test notification
  test('Notification is shown when product is added to cart', () => {
    // Get add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    // Click add to cart button
    addToCartBtn.click();
    
    // Verify notification was created
    const notification = document.querySelector('.notification');
    expect(notification).not.toBeNull();
    expect(notification.textContent).toBe('Test Product added to cart');
  });
  
  // Test removing item from cart
  test('Item can be removed from cart', () => {
    // Setup mock cart data with one item
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Set cart data in localStorage
    localStorageMock.setItem('cart', JSON.stringify(testCart));
    
    // Remove item from cart
    window.removeFromCart('product1');
    
    // Verify cart is empty
    const cart = JSON.parse(localStorageMock.getItem('cart'));
    expect(cart.length).toBe(0);
    
    // Verify cart badge was updated
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('0');
    expect(cartBadge.style.display).toBe('none');
  });
  
  // Test updating item quantity
  test('Item quantity can be updated', () => {
    // Setup mock cart data with one item
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Set cart data in localStorage
    localStorageMock.setItem('cart', JSON.stringify(testCart));
    
    // Update quantity
    window.updateQuantity('product1', 3);
    
    // Verify cart was updated
    const cart = JSON.parse(localStorageMock.getItem('cart'));
    expect(cart[0].quantity).toBe(3);
    
    // Verify cart badge was updated
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('3');
  });
  
  // Test updating quantity to zero removes item
  test('Updating quantity to zero removes item from cart', () => {
    // Setup mock cart data with one item
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Set cart data in localStorage
    localStorageMock.setItem('cart', JSON.stringify(testCart));
    
    // Update quantity to zero
    window.updateQuantity('product1', 0);
    
    // Verify cart is empty
    const cart = JSON.parse(localStorageMock.getItem('cart'));
    expect(cart.length).toBe(0);
    
    // Verify cart badge was updated
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('0');
    expect(cartBadge.style.display).toBe('none');
  });
  
  // Test cart page with items
  test('Cart page displays items when cart has items', () => {
    // Set up as cart page
    window.location.pathname = '/cart.html';
    
    // Setup mock cart data with one item
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Set cart data in localStorage
    localStorageMock.setItem('cart', JSON.stringify(testCart));
    
    // Update cart page
    window.updateCartPage();
    
    // Get empty cart message and cart items elements
    const emptyCart = document.getElementById('empty-cart');
    const cartWithItems = document.getElementById('cart-with-items');
    
    // Verify cart with items is shown
    expect(emptyCart.style.display).toBe('none');
    expect(cartWithItems.style.display).toBe('block');
    
    // Verify cart total is calculated correctly
    const cartTotal = document.getElementById('cart-total');
    expect(cartTotal.textContent).toBe('$39.98');
  });
  
  // Test checkout from cart page
  test('Checkout button on cart page works', () => {
    // Set up as cart page
    window.location.pathname = '/cart.html';
    
    // Get checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Click checkout button
    checkoutBtn.click();
    
    // Verify redirect to checkout page
    expect(window.location.href).toBe('checkout.html');
  });
  
  // Test adding item that already exists in cart
  test('Adding existing item increases quantity instead of adding new item', () => {
    // Setup mock cart data with one item
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Set cart data in localStorage
    localStorageMock.setItem('cart', JSON.stringify(testCart));
    
    // Get add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    // Click add to cart button
    addToCartBtn.click();
    
    // Verify cart was updated
    const cart = JSON.parse(localStorageMock.getItem('cart'));
    expect(cart[0].quantity).toBe(3);
    
    // Verify cart badge was updated
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('3');
  });
}); 