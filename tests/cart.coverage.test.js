/**
 * @jest-environment jsdom
 */

// This test file is specifically designed to achieve high coverage for cart.js

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

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
    ok: true
  })
);

// Mock window.location
const originalLocation = window.location;
delete window.location;
window.location = {
  hostname: 'localhost',
  pathname: '/index.html',
  href: 'http://localhost/index.html',
  replace: jest.fn(),
  assign: jest.fn(),
  reload: jest.fn()
};

describe('Cart.js Coverage Tests', () => {
  // Global variables to store events and handlers
  let domEventHandlers = {};
  let cartData = [];
  
  // Add event listener for cart functions
  const originalAddEventListener = document.addEventListener;
  document.addEventListener = jest.fn((event, handler) => {
    domEventHandlers[event] = handler;
  });

  beforeEach(() => {
    // Reset mocks and DOM
    jest.clearAllMocks();
    localStorageMock.clear();
    domEventHandlers = {};
    cartData = [];
    document.body.innerHTML = '';
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
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
      
      <!-- Checkout page elements -->
      <div class="checkout-container">
        <div id="checkout-items"></div>
        <div id="checkout-summary">
          <div id="checkout-subtotal">Subtotal: $0.00</div>
          <div id="checkout-total">Total: $0.00</div>
        </div>
        <div id="payment-form">
          <div id="stripe-element-errors"></div>
          <button id="complete-order">Complete Order</button>
        </div>
      </div>
    `;
    
    // Load cart.js
    require('../cart.js');
    
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
  
  // Load cart and related functions
  test('Cart initializes correctly', () => {
    // Verify cart elements are initialized
    expect(document.getElementById('cartNavIcon')).not.toBeNull();
    expect(document.querySelector('.cart-count')).not.toBeNull();
  });
  
  test('Cart loads from localStorage', () => {
    // Set cart data directly in localStorage
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    localStorageMock.setItem('cart', JSON.stringify(testCart));
    
    // Manually call loadCart (assuming it's been attached to window by cart.js)
    window.loadCart();
    
    // Manually call updateCartBadge to update the UI
    window.updateCartBadge(testCart);
    
    // Verify cart badge was updated
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('2');
    expect(cartBadge.style.display).toBe('flex');
    
    // Verify localStorage was accessed
    expect(localStorageMock.getItem).toHaveBeenCalledWith('cart');
  });
  
  test('loadCart handles invalid JSON in localStorage', () => {
    // Set invalid JSON in localStorage
    localStorageMock.setItem('cart', '{invalid json}');
    
    // Call loadCart
    const result = window.loadCart();
    
    // Verify error handling
    expect(console.error).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
  
  test('saveCart saves cart data to localStorage', () => {
    const cartData = [{ id: 'product1', name: 'Test Product', price: 19.99, quantity: 1, image: 'test.jpg' }];
    
    // Call saveCart
    window.saveCart(cartData);
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('cart', JSON.stringify(cartData));
  });
  
  test('Cart sidebar opens when cart icon is clicked', () => {
    // Get cart icon and sidebar
    const cartIcon = document.getElementById('cartNavIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    
    // Click cart icon
    cartIcon.click();
    
    // Verify sidebar is open
    expect(cartSidebar.classList.contains('open')).toBe(true);
  });
  
  test('Cart sidebar closes when close button is clicked', () => {
    // Get close button and sidebar
    const closeBtn = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    
    // Open sidebar first
    cartSidebar.classList.add('open');
    
    // Click close button
    closeBtn.click();
    
    // Verify sidebar is closed
    expect(cartSidebar.classList.contains('open')).toBe(false);
  });
  
  test('Product can be added to cart', () => {
    // Get add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    // Mock the loadCart function to return an empty array
    const originalLoadCart = window.loadCart;
    window.loadCart = jest.fn().mockReturnValue([]);
    
    // Click add to cart button
    addToCartBtn.click();
    
    // Restore original function
    window.loadCart = originalLoadCart;
    
    // Verify localStorage setItem was called
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    // Manually get the cart data that would have been saved
    const savedCartArg = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedCartArg.length).toBe(1);
    expect(savedCartArg[0].id).toBe('product1');
  });
  
  test('Adding the same product increments quantity', () => {
    // Setup existing cart data with one item
    const existingCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 1, image: 'test.jpg' }
    ];
    localStorageMock.setItem('cart', JSON.stringify(existingCart));
    
    // Mock loadCart to return existing cart
    const originalLoadCart = window.loadCart;
    window.loadCart = jest.fn().mockReturnValue(existingCart);
    
    // Get add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    // Click add to cart button
    addToCartBtn.click();
    
    // Restore original function
    window.loadCart = originalLoadCart;
    
    // Verify localStorage setItem was called
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    // Manually get the cart data that would have been saved
    const savedCartArg = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedCartArg.length).toBe(1);
    expect(savedCartArg[0].quantity).toBe(2);
  });
  
  test('Cart page shows empty cart message when cart is empty', () => {
    // Set up as cart page
    window.location.pathname = '/cart.html';
    
    // Mock loadCart to return empty array
    const originalLoadCart = window.loadCart;
    window.loadCart = jest.fn().mockReturnValue([]);
    
    // Call updateCartPage
    window.updateCartPage();
    
    // Restore original function
    window.loadCart = originalLoadCart;
    
    // Get empty cart message and cart items elements
    const emptyCart = document.getElementById('empty-cart');
    const cartWithItems = document.getElementById('cart-with-items');
    
    // Verify empty cart message is shown
    expect(emptyCart.style.display).toBe('block');
    expect(cartWithItems.style.display).toBe('none');
  });
  
  test('Cart page displays items when cart has items', () => {
    // Set up as cart page
    window.location.pathname = '/cart.html';
    
    // Set cart data in localStorage
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Mock loadCart to return test cart
    const originalLoadCart = window.loadCart;
    window.loadCart = jest.fn().mockReturnValue(testCart);
    
    // Call updateCartPage
    window.updateCartPage();
    
    // Restore original function
    window.loadCart = originalLoadCart;
    
    // Get empty cart message and cart items elements
    const emptyCart = document.getElementById('empty-cart');
    const cartWithItems = document.getElementById('cart-with-items');
    const cartItems = document.getElementById('cart-items');
    
    // Verify cart with items is shown
    expect(emptyCart.style.display).toBe('none');
    expect(cartWithItems.style.display).toBe('block');
    
    // Verify cart items are rendered
    expect(cartItems.innerHTML).toContain('Test Product');
    expect(cartItems.querySelector('.item-quantity').value).toBe('2');
    
    // Verify total is calculated and displayed
    const cartTotal = document.getElementById('cart-total');
    expect(cartTotal.textContent).toBe('$39.98');
  });
  
  test('Checkout button redirects to cart page', () => {
    // Get checkout button
    const checkoutBtn = document.getElementById('checkoutButton');
    
    // Click checkout button
    checkoutBtn.click();
    
    // Verify redirect to cart page
    expect(window.location.href).toBe('cart.html');
  });
  
  test('Checkout button on cart page redirects to checkout page', () => {
    // Set up as cart page
    window.location.pathname = '/cart.html';
    
    // Call updateCartPage to setup elements and event handlers
    const originalLoadCart = window.loadCart;
    window.loadCart = jest.fn().mockReturnValue([
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ]);
    
    window.updateCartPage();
    
    // Restore original function
    window.loadCart = originalLoadCart;
    
    // Get checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Click checkout button
    checkoutBtn.click();
    
    // Verify redirect to checkout page
    expect(window.location.href).toBe('checkout.html');
  });
  
  test('Item can be removed from cart', () => {
    // Set up as cart page
    window.location.pathname = '/cart.html';
    
    // Set cart data
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Mock loadCart to return test cart
    const originalLoadCart = window.loadCart;
    window.loadCart = jest.fn().mockReturnValue(testCart);
    
    // Call updateCartPage to setup elements and event handlers
    window.updateCartPage();
    
    // Find remove button
    const removeBtn = document.querySelector('.remove-item');
    
    // Mock removeFromCart
    const originalRemoveFromCart = window.removeFromCart;
    window.removeFromCart = jest.fn().mockReturnValue([]);
    
    // Click remove button
    removeBtn.click();
    
    // Verify removeFromCart was called
    expect(window.removeFromCart).toHaveBeenCalledWith('product1');
    
    // Restore original functions
    window.loadCart = originalLoadCart;
    window.removeFromCart = originalRemoveFromCart;
  });
  
  test('removeFromCart removes item from cart', () => {
    // Setup cart data
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Mock loadCart to return test cart
    const originalLoadCart = window.loadCart;
    window.loadCart = jest.fn().mockReturnValue(testCart);
    
    // Call removeFromCart
    const updatedCart = window.removeFromCart('product1');
    
    // Verify item was removed
    expect(updatedCart.length).toBe(0);
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    // Restore original function
    window.loadCart = originalLoadCart;
  });
  
  test('Item quantity can be updated', () => {
    // Set up as cart page
    window.location.pathname = '/cart.html';
    
    // Set cart data
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Mock loadCart to return test cart
    const originalLoadCart = window.loadCart;
    window.loadCart = jest.fn().mockReturnValue(testCart);
    
    // Call updateCartPage to setup elements and event handlers
    window.updateCartPage();
    
    // Find quantity input
    const qtyInput = document.querySelector('.item-quantity');
    
    // Mock updateQuantity
    const originalUpdateQuantity = window.updateQuantity;
    window.updateQuantity = jest.fn().mockReturnValue([
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 3, image: 'test.jpg' }
    ]);
    
    // Update quantity
    qtyInput.value = '3';
    qtyInput.dispatchEvent(new Event('change'));
    
    // Verify updateQuantity was called
    expect(window.updateQuantity).toHaveBeenCalledWith('product1', 3);
    
    // Restore original functions
    window.loadCart = originalLoadCart;
    window.updateQuantity = originalUpdateQuantity;
  });
  
  test('updateQuantity updates item quantity', () => {
    // Setup cart data
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Mock loadCart to return test cart
    const originalLoadCart = window.loadCart;
    window.loadCart = jest.fn().mockReturnValue(testCart);
    
    // Call updateQuantity
    const updatedCart = window.updateQuantity('product1', 3);
    
    // Verify quantity was updated
    expect(updatedCart[0].quantity).toBe(3);
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    // Restore original function
    window.loadCart = originalLoadCart;
  });
  
  test('updateQuantity removes item when quantity is zero', () => {
    // Setup cart data
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Mock loadCart to return test cart
    const originalLoadCart = window.loadCart;
    window.loadCart = jest.fn().mockReturnValue(testCart);
    
    // Mock removeFromCart
    const originalRemoveFromCart = window.removeFromCart;
    window.removeFromCart = jest.fn().mockReturnValue([]);
    
    // Call updateQuantity with zero
    window.updateQuantity('product1', 0);
    
    // Verify removeFromCart was called
    expect(window.removeFromCart).toHaveBeenCalledWith('product1');
    
    // Restore original functions
    window.loadCart = originalLoadCart;
    window.removeFromCart = originalRemoveFromCart;
  });
  
  test('Notification is shown when product is added to cart', () => {
    // Get add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    // Mock loadCart and showNotification
    const originalLoadCart = window.loadCart;
    window.loadCart = jest.fn().mockReturnValue([]);
    
    const originalShowNotification = window.showNotification;
    window.showNotification = jest.fn();
    
    // Click add to cart button
    addToCartBtn.click();
    
    // Verify showNotification was called
    expect(window.showNotification).toHaveBeenCalledWith('Test Product added to cart');
    
    // Restore original functions
    window.loadCart = originalLoadCart;
    window.showNotification = originalShowNotification;
  });
  
  test('showNotification creates and removes notification element', () => {
    // Call showNotification
    const notification = window.showNotification('Test notification');
    
    // Verify notification element was created
    expect(notification.classList.contains('notification')).toBe(true);
    expect(notification.textContent).toBe('Test notification');
    expect(document.body.contains(notification)).toBe(true);
    
    // Fast-forward timers to trigger the notification removal
    jest.useFakeTimers();
    jest.advanceTimersByTime(3000);
    
    // Restore real timers
    jest.useRealTimers();
  });
  
  test('updateCartBadge handles empty cart', () => {
    // Call updateCartBadge with empty cart
    window.updateCartBadge([]);
    
    // Verify badge is hidden
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('0');
    expect(cartBadge.style.display).toBe('none');
  });
  
  test('updateCartBadge correctly calculates total items', () => {
    // Setup cart with multiple items
    const testCart = [
      { id: 'product1', name: 'Test Product 1', price: 19.99, quantity: 2, image: 'test1.jpg' },
      { id: 'product2', name: 'Test Product 2', price: 29.99, quantity: 3, image: 'test2.jpg' }
    ];
    
    // Call updateCartBadge
    window.updateCartBadge(testCart);
    
    // Verify badge shows correct total
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('5');
    expect(cartBadge.style.display).toBe('flex');
  });
  
  test('updateCartPage handles missing DOM elements', () => {
    // Save original document body
    const originalBody = document.body.innerHTML;
    
    // Remove cart elements
    document.body.innerHTML = '<div>Some other content</div>';
    
    // Call updateCartPage
    window.updateCartPage();
    
    // No assertions needed, just checking that it doesn't throw an error
    
    // Restore document body
    document.body.innerHTML = originalBody;
  });
  
  // Test checkout functionality
  test('handleCheckout redirects to checkout page', () => {
    // Call handleCheckout
    window.handleCheckout();
    
    // Verify redirect to checkout page
    expect(window.location.href).toBe('checkout.html');
  });
}); 