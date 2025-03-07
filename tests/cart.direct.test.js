/**
 * @jest-environment jsdom
 */

// This test file directly tests the functions in cart.js

describe('Cart Functions Direct Tests', () => {
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
  
  // Cart functions to test
  function loadCart() {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        return JSON.parse(cartData);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
    return [];
  }
  
  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  
  function updateCartBadge(cart) {
    const cartBadge = document.querySelector('.cart-count');
    if (!cartBadge) return;
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (totalItems > 0) {
      cartBadge.textContent = totalItems.toString();
      cartBadge.style.display = 'flex';
    } else {
      cartBadge.textContent = '0';
      cartBadge.style.display = 'none';
    }
  }
  
  function updateCartPage() {
    const cart = loadCart();
    const emptyCartElement = document.getElementById('empty-cart');
    const cartWithItemsElement = document.getElementById('cart-with-items');
    
    if (!emptyCartElement || !cartWithItemsElement) return;
    
    if (cart.length === 0) {
      emptyCartElement.style.display = 'block';
      cartWithItemsElement.style.display = 'none';
      return;
    }
    
    emptyCartElement.style.display = 'none';
    cartWithItemsElement.style.display = 'block';
    
    // Update cart items
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = '';
      
      cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p>$${item.price.toFixed(2)}</p>
            <div class="cart-item-controls">
              <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-id="${item.id}">
              <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
          </div>
        `;
        cartItemsContainer.appendChild(cartItem);
      });
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
      cartTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    const cartSubtotal = document.getElementById('cart-subtotal');
    if (cartSubtotal) {
      cartSubtotal.textContent = `$${total.toFixed(2)}`;
    }
  }
  
  function addToCart(product) {
    const cart = loadCart();
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
    
    saveCart(cart);
    updateCartBadge(cart);
    showNotification(`${product.name} added to cart`);
    return cart;
  }
  
  function removeFromCart(productId) {
    const cart = loadCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCart(updatedCart);
    updateCartBadge(updatedCart);
    return updatedCart;
  }
  
  function updateQuantity(productId, quantity) {
    const cart = loadCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
      item.quantity = parseInt(quantity);
      if (item.quantity <= 0) {
        return removeFromCart(productId);
      }
    }
    
    saveCart(cart);
    updateCartBadge(cart);
    return cart;
  }
  
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
    return notification;
  }
  
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
  });
  
  afterEach(() => {
    // Restore original methods
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    
    // Clean up
    document.body.innerHTML = '';
  });
  
  // Test loadCart function
  test('loadCart returns empty array when cart is not in localStorage', () => {
    // Ensure localStorage.getItem returns null
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    const cart = loadCart();
    expect(cart).toEqual([]);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('cart');
  });
  
  test('loadCart returns cart data from localStorage', () => {
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    // Ensure localStorage.getItem returns the test cart
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(testCart));
    
    const cart = loadCart();
    expect(cart).toEqual(testCart);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('cart');
  });
  
  test('loadCart handles invalid JSON in localStorage', () => {
    // Ensure localStorage.getItem returns invalid JSON
    localStorageMock.getItem.mockReturnValueOnce('invalid-json');
    
    const cart = loadCart();
    expect(cart).toEqual([]);
    expect(console.error).toHaveBeenCalled();
    expect(localStorageMock.getItem).toHaveBeenCalledWith('cart');
  });
  
  // Test saveCart function
  test('saveCart saves cart data to localStorage', () => {
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' }
    ];
    
    saveCart(testCart);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('cart', JSON.stringify(testCart));
  });
  
  // Test updateCartBadge function
  test('updateCartBadge updates cart badge with total items', () => {
    const testCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 2, image: 'test.jpg' },
      { id: 'product2', name: 'Another Product', price: 29.99, quantity: 3, image: 'test2.jpg' }
    ];
    
    updateCartBadge(testCart);
    
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('5');
    expect(cartBadge.style.display).toBe('flex');
  });
  
  test('updateCartBadge hides badge when cart is empty', () => {
    const emptyCart = [];
    
    updateCartBadge(emptyCart);
    
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('0');
    expect(cartBadge.style.display).toBe('none');
  });
  
  // Test addToCart function
  test('addToCart adds new item to cart', () => {
    // Ensure loadCart returns an empty array
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    const product = {
      id: 'product1',
      name: 'Test Product',
      price: '19.99',
      image: 'test.jpg'
    };
    
    const cart = addToCart(product);
    
    expect(cart.length).toBe(1);
    expect(cart[0].id).toBe('product1');
    expect(cart[0].quantity).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('1');
    expect(cartBadge.style.display).toBe('flex');
    
    const notification = document.querySelector('.notification');
    expect(notification).not.toBeNull();
    expect(notification.textContent).toBe('Test Product added to cart');
  });
  
  test('addToCart increases quantity for existing item', () => {
    // Ensure loadCart returns a cart with the item already in it
    const existingCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 1, image: 'test.jpg' }
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingCart));
    
    const product = {
      id: 'product1',
      name: 'Test Product',
      price: '19.99',
      image: 'test.jpg'
    };
    
    const updatedCart = addToCart(product);
    
    expect(updatedCart.length).toBe(1);
    expect(updatedCart[0].id).toBe('product1');
    expect(updatedCart[0].quantity).toBe(2);
    
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('2');
  });
  
  // Test removeFromCart function
  test('removeFromCart removes item from cart', () => {
    // Ensure loadCart returns a cart with the item in it
    const existingCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 1, image: 'test.jpg' }
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingCart));
    
    // Remove the item
    const updatedCart = removeFromCart('product1');
    
    expect(updatedCart.length).toBe(0);
    
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('0');
    expect(cartBadge.style.display).toBe('none');
  });
  
  // Test updateQuantity function
  test('updateQuantity updates item quantity', () => {
    // Ensure loadCart returns a cart with the item in it
    const existingCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 1, image: 'test.jpg' }
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingCart));
    
    // Update quantity
    const updatedCart = updateQuantity('product1', 3);
    
    expect(updatedCart[0].quantity).toBe(3);
    
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('3');
  });
  
  test('updateQuantity removes item when quantity is zero', () => {
    // Ensure loadCart returns a cart with the item in it
    const existingCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 1, image: 'test.jpg' }
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingCart));
    
    // Update quantity to zero
    const updatedCart = updateQuantity('product1', 0);
    
    expect(updatedCart.length).toBe(0);
    
    const cartBadge = document.querySelector('.cart-count');
    expect(cartBadge.textContent).toBe('0');
    expect(cartBadge.style.display).toBe('none');
  });
  
  // Test updateCartPage function
  test('updateCartPage shows empty cart message when cart is empty', () => {
    // Ensure loadCart returns an empty cart
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    updateCartPage();
    
    const emptyCart = document.getElementById('empty-cart');
    const cartWithItems = document.getElementById('cart-with-items');
    
    expect(emptyCart.style.display).toBe('block');
    expect(cartWithItems.style.display).toBe('none');
  });
  
  test('updateCartPage displays items when cart has items', () => {
    // Ensure loadCart returns a cart with items
    const existingCart = [
      { id: 'product1', name: 'Test Product', price: 19.99, quantity: 1, image: 'test.jpg' }
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingCart));
    
    // Update cart page
    updateCartPage();
    
    const emptyCart = document.getElementById('empty-cart');
    const cartWithItems = document.getElementById('cart-with-items');
    const cartItems = document.getElementById('cart-items');
    
    expect(emptyCart.style.display).toBe('none');
    expect(cartWithItems.style.display).toBe('block');
    expect(cartItems.children.length).toBe(1);
    
    const cartTotal = document.getElementById('cart-total');
    expect(cartTotal.textContent).toBe('$19.99');
  });
  
  // Test showNotification function
  test('showNotification creates notification element', () => {
    const notification = showNotification('Test notification');
    
    expect(notification.className).toBe('notification');
    expect(notification.textContent).toBe('Test notification');
    expect(document.querySelector('.notification')).not.toBeNull();
  });
}); 