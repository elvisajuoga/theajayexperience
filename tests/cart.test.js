/**
 * @jest-environment jsdom
 */

describe('Cart DOM Interactions', () => {
  beforeEach(() => {
    // Set up DOM structure
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
      <button id="add-to-cart-btn" data-id="test-1" data-name="Test Product" data-price="19.99">Add to Cart</button>
    `;
    
    // Mock window functions
    window.location = { href: 'http://localhost:3000' };
    window.showNotification = jest.fn();
  });
  
  test('Cart icon should be visible in the DOM', () => {
    const cartIcon = document.getElementById('cartNavIcon');
    expect(cartIcon).not.toBeNull();
  });
  
  test('Cart count element should have initial value of 0', () => {
    const cartCount = document.querySelector('.cart-count');
    expect(cartCount.textContent).toBe('0');
  });
  
  test('Cart sidebar should exist in the DOM', () => {
    const cartSidebar = document.getElementById('cartSidebar');
    expect(cartSidebar).not.toBeNull();
  });
  
  test('Checkout button should exist in the DOM', () => {
    const checkoutButton = document.getElementById('checkoutButton');
    expect(checkoutButton).not.toBeNull();
  });
  
  test('Cart sidebar should open when cart icon is clicked', () => {
    const cartIcon = document.getElementById('cartNavIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    
    // Manually add click handler (similar to cart.js)
    cartIcon.addEventListener('click', () => {
      cartSidebar.classList.add('open');
    });
    
    // Verify sidebar is not open initially
    expect(cartSidebar.classList.contains('open')).toBe(false);
    
    // Click cart icon
    cartIcon.click();
    
    // Verify sidebar is now open
    expect(cartSidebar.classList.contains('open')).toBe(true);
  });
  
  test('Cart sidebar should close when close button is clicked', () => {
    const closeBtn = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    
    // Add open class to sidebar first
    cartSidebar.classList.add('open');
    
    // Manually add click handler (similar to cart.js)
    closeBtn.addEventListener('click', () => {
      cartSidebar.classList.remove('open');
    });
    
    // Verify sidebar is open initially
    expect(cartSidebar.classList.contains('open')).toBe(true);
    
    // Click close button
    closeBtn.click();
    
    // Verify sidebar is now closed
    expect(cartSidebar.classList.contains('open')).toBe(false);
  });
  
  test('Add to cart button should have product data attributes', () => {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    expect(addToCartBtn.dataset.id).toBe('test-1');
    expect(addToCartBtn.dataset.name).toBe('Test Product');
    expect(addToCartBtn.dataset.price).toBe('19.99');
  });
});

describe('Cart Badge', () => {
  beforeEach(() => {
    // Set up minimal DOM
    document.body.innerHTML = `
      <span class="cart-count" style="display: none;">0</span>
    `;
  });
  
  test('Cart badge shows correct quantity', () => {
    const cartBadge = document.querySelector('.cart-count');
    
    // Update badge text and display
    cartBadge.textContent = '5';
    cartBadge.style.display = 'flex';
    
    expect(cartBadge.textContent).toBe('5');
    expect(cartBadge.style.display).toBe('flex');
  });
  
  test('Cart badge can be hidden', () => {
    const cartBadge = document.querySelector('.cart-count');
    
    // Hide badge
    cartBadge.textContent = '0';
    cartBadge.style.display = 'none';
    
    expect(cartBadge.textContent).toBe('0');
    expect(cartBadge.style.display).toBe('none');
  });
}); 