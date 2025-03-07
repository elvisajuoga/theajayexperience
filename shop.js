// Initialize Stripe
const stripe = Stripe('pk_live_51On3lnQnakAmkLGyprFaahmuMjM6p5M4eourutekJaBfs5JEA4iIPLiwaxvou1o6k2powU9MvMuvr8VJC4xN9nKN00ykL4j2QX'); // Replace with your actual Stripe publishable key

// State management
let products = [];
let categories = [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const categoryList = document.getElementById('categoryList');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');

// Global object to store selected colors for each product
let selectedColors = {};

// Initialize the shop
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    
    // Set up event listeners for the modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            productModal.style.display = 'none';
        });
    }
    
    // Add product card click listeners
    if (productsGrid) {
        productsGrid.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard && !e.target.closest('.add-to-cart') && !e.target.closest('.color-option') && !e.target.closest('.quantity-btn')) {
                const productId = productCard.dataset.productId;
                openProductModal(productId);
            }
        });
    }
});

// Fetch products from your API
async function fetchProducts() {
    try {
        // Show loading state
        if (productsGrid) {
            productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
        }
        
        const apiBaseUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
            ? 'http://localhost:3003'  // Development
            : 'https://your-production-domain.com';  // Production
            
        const response = await fetch(`${apiBaseUrl}/api/products`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        products = data.products;
        categories = data.categories;
        
        renderProducts();
        renderCategories();
    } catch (error) {
        console.error('Error fetching products:', error);
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="error-message">
                    <p>Error loading products: ${error.message}</p>
                    <button onclick="fetchProducts()" class="retry-button">Retry</button>
                </div>`;
        }
    }
}

// Render products in grid
function renderProducts(categoryFilter = null) {
    if (!productsGrid) return;
    
    let filteredProducts = categoryFilter
        ? products.filter(p => p.categories.includes(categoryFilter))
        : products;

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}">
            </div>
            <div class="product-details">
                <div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <p class="product-description">${product.description}</p>
                </div>
                <div>
                    <div class="color-options">
                        ${product.variants.map((variant, index) => `
                            <div class="color-option ${index === 0 ? 'selected' : ''}" 
                                 data-color="${variant.color}"
                                 title="${variant.color}"
                                 onclick="selectColor('${product.id}', '${variant.color}')">
                            </div>
                        `).join('')}
                    </div>
                    <div class="cart-counter">
                        <button class="quantity-btn" onclick="updateQuantity('${product.id}', getQuantity('${product.id}') - 1)">-</button>
                        <span class="quantity-display" id="quantity-${product.id}">1</span>
                        <button class="quantity-btn" onclick="updateQuantity('${product.id}', getQuantity('${product.id}') + 1)">+</button>
                    </div>
                    <button class="add-to-cart" onclick="addToShopCart('${product.id}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Initialize color selection for each product
    products.forEach(product => {
        if (product.variants && product.variants.length > 0) {
            selectedColors[product.id] = product.variants[0].color;
        }
    });
}

// Render categories
function renderCategories() {
    if (!categoryList) return;
    
    categoryList.innerHTML = categories.map(category => `
        <li>
            <button onclick="filterByCategory('${category.id}')">${category.name}</button>
        </li>
    `).join('');
}

// Filter products by category
function filterByCategory(categoryId) {
    renderProducts(categoryId);
}

// Open product modal
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modalContent = document.getElementById('productDetails');
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <div class="modal-product">
            <div class="product-images">
                ${product.images.map(img => `
                    <img src="${img}" alt="${product.name}">
                `).join('')}
            </div>
            <div class="product-info">
                <h2>${product.name}</h2>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p>${product.description}</p>
                <div class="variant-selection">
                    <select id="productColor">
                        ${product.variants.map(v => `
                            <option value="${v.color}">${v.color}</option>
                        `).join('')}
                    </select>
                </div>
                <button onclick="addToShopCart('${product.id}', true)">Add to Cart</button>
            </div>
        </div>
    `;
    productModal.style.display = 'flex';
}

// Select color option
function selectColor(productId, color) {
    selectedColors[productId] = color;
    
    // Update UI
    document.querySelectorAll(`[data-product-id="${productId}"] .color-option`).forEach(option => {
        if (option.dataset.color === color) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// Get quantity
function getQuantity(productId) {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    return quantityElement ? parseInt(quantityElement.textContent) : 1;
}

// Update quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10;
    
    const quantityElement = document.getElementById(`quantity-${productId}`);
    if (quantityElement) {
        quantityElement.textContent = newQuantity;
    }
}

// Add to cart from shop page
function addToShopCart(productId, fromModal = false) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Get color selection
    let variant;
    
    // Check if we're in the modal
    if (fromModal) {
        const colorSelect = document.getElementById('productColor');
        variant = colorSelect ? colorSelect.value : product.variants[0].color;
    } else {
        // Use the selected color from the card
        variant = selectedColors[productId] || (product.variants && product.variants.length > 0 ? product.variants[0].color : 'Default');
    }
    
    // Get quantity
    const quantity = getQuantity(productId);
    
    // Format product data for cart
    const cartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        variant: variant,
        quantity: quantity
    };
    
    // Add to cart using the global cart function
    window.addToCart(cartProduct);
    
    // Close modal if we're in it
    if (fromModal) {
        productModal.style.display = 'none';
    }
}

// Initialize
fetchProducts(); 