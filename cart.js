// Cart functionality for all pages
let cart = [];

// DOM Elements
let cartBtn;
let cartCountElement;
let cartSidebar;
let closeCart;
let cartItemsContainer;
let cartTotal;
let checkoutButton;

// Configuration
const cartConfig = {
    // This will automatically detect if we're in development or production
    apiBaseUrl: window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
        ? 'http://localhost:3003'  // Development
        : 'https://your-production-domain.com'  // Production - you'll need to update this
};

// Initialize cart functionality
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage
    loadCart();
    
    // Get DOM elements
    cartBtn = document.getElementById('cartNavIcon');
    cartCountElement = document.querySelector('.cart-count');
    cartSidebar = document.getElementById('cartSidebar');
    closeCart = document.querySelector('.close-cart');
    
    // For cart page specific elements
    const isCartPage = window.location.pathname.includes('cart.html');
    if (isCartPage) {
        // These elements are only on the cart page
        cartItemsContainer = document.getElementById('cart-items');
        cartTotal = document.getElementById('cart-total');
        checkoutButton = document.getElementById('checkout-btn');
        
        // Initialize cart page
        updateCartPage();
    } else {
        // These elements are on other pages
        // Check for cartItems first, then fallback to cartContent if needed
        cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) {
            // Fallback for pages that might have different container ID
            cartItemsContainer = document.getElementById('cartContent');
        }
        
        cartTotal = document.getElementById('cartTotal');
        checkoutButton = document.getElementById('checkoutButton');
        
        // Initialize cart sidebar on non-cart pages
        updateCart();
    }
    
    // Add event listeners if elements exist
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            if (cartSidebar) {
                cartSidebar.classList.add('open');
                // Update cart display when opening sidebar
                updateCart();
            }
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', () => {
            if (cartSidebar) {
                cartSidebar.classList.remove('open');
            }
        });
    }
    
    if (checkoutButton && !isCartPage) {
        checkoutButton.addEventListener('click', handleCheckout);
    }
    
    // Update cart badge
    updateCartBadge();
});

// Additional direct event handler for troubleshooting
document.addEventListener('DOMContentLoaded', function() {
    // Direct event handler for cart icon
    const cartIcon = document.getElementById('cartNavIcon');
    if (cartIcon) {
        console.log("Cart icon found, adding click listener");
        cartIcon.style.cursor = 'pointer';
        cartIcon.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            console.log("Cart icon clicked");
            const sidebar = document.getElementById('cartSidebar');
            if (sidebar) {
                console.log("Opening cart sidebar");
                sidebar.classList.add('open');
            } else {
                console.log("Cart sidebar not found");
            }
        });
    } else {
        console.log("Cart icon not found");
    }
});

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Error loading cart from localStorage:', e);
            cart = [];
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart badge count
function updateCartBadge() {
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        
        // Always show the badge, regardless of count
        cartCountElement.style.display = 'flex';
    }
}

// Update cart page - specific for the cart.html page
function updateCartPage() {
    const emptyCartMessage = document.getElementById('empty-cart');
    const cartWithItems = document.getElementById('cart-with-items');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    
    // Check if these elements exist (we're on the cart page)
    if (!emptyCartMessage || !cartWithItems || !cartItemsContainer) {
        return;
    }
    
    // Show/hide empty cart message
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartWithItems.style.display = 'none';
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    cartWithItems.style.display = 'block';
    
    // Clear and update cart items
    cartItemsContainer.innerHTML = '';
    
    // Calculate subtotal
    let subtotal = 0;
    
    // Add each item
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                ${item.variant ? `<p class="cart-item-variant">${item.variant}</p>` : ''}
                <p class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease-btn" data-index="${index}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-index="${index}">+</button>
                </div>
                <button class="cart-item-remove" data-index="${index}">Remove</button>
            </div>
            <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Update subtotal and total
    cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    cartTotal.textContent = `$${subtotal.toFixed(2)}`;
    
    // Add event listeners for quantity buttons and remove buttons
    document.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', increaseQuantity);
    });
    
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', removeCartItem);
    });
}

// Decrease quantity on cart page
function decreaseQuantity(e) {
    const index = parseInt(e.target.dataset.index);
    
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        saveCart();
        updateCartPage();
        updateCartBadge();
    }
}

// Increase quantity on cart page
function increaseQuantity(e) {
    const index = parseInt(e.target.dataset.index);
    
    cart[index].quantity++;
    saveCart();
    updateCartPage();
    updateCartBadge();
}

// Remove item on cart page
function removeCartItem(e) {
    const index = parseInt(e.target.dataset.index);
    
    cart.splice(index, 1);
    saveCart();
    updateCartPage();
    updateCartBadge();
}

// Function to update cart on non-cart pages
function updateCart() {
    // Update badge
    updateCartBadge();
    
    // Save to localStorage
    saveCart();
    
    // Update cart sidebar if it exists
    if (cartItemsContainer && cartTotal && !window.location.pathname.includes('cart.html')) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            cartTotal.textContent = '$0.00';
            return;
        }
        
        // Render cart items in sidebar
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="item-image">
                    <img src="${item.image || 'public/images/merch/placeholder.jpg'}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    ${item.variant ? `<p>${item.variant}</p>` : ''}
                    <p>$${parseFloat(item.price).toFixed(2)} × ${item.quantity}</p>
                </div>
                <div class="item-actions">
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item" data-index="${index}">×</button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                cart.splice(index, 1);
                updateCart();
            });
        });
        
        // Update total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
}

// Add item to cart
function addToCart(product) {
    // Check if product has all required fields
    if (!product || !product.id || !product.name || !product.price || !product.image) {
        console.error('Invalid product data:', product);
        return;
    }
    
    const quantity = product.quantity || 1;
    const variant = product.variant || null;
    
    // Find if product already exists in cart with same variant
    const existingItemIndex = cart.findIndex(item => 
        item.id === product.id && item.variant === variant
    );
    
    if (existingItemIndex !== -1) {
        // Update quantity of existing item
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            variant: variant,
            quantity: quantity
        });
    }
    
    // Update cart
    updateCart();
    
    // Show notification
    showNotification(`Added ${quantity} ${product.name} to cart`);
    
    // Open cart sidebar if it exists
    if (cartSidebar) {
        cartSidebar.classList.add('open');
    }
}

// Handle checkout
function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }
    
    // Redirect to checkout page or process
    window.location.href = 'cart.html';
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2500);
    }, 10);
}

// Make functions available globally
window.addToCart = addToCart;
window.updateCart = updateCart;
window.loadCart = loadCart;
window.saveCart = saveCart; 