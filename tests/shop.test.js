/**
 * @jest-environment jsdom
 */

// Mock Stripe globally
global.Stripe = jest.fn(() => ({
  redirectToCheckout: jest.fn().mockResolvedValue({ error: null })
}));

describe('Shop.js', () => {
  // Mock fetch
  global.fetch = jest.fn();
  
  // Original methods
  let originalDocumentAddEventListener;
  let originalGetElementById;
  
  beforeEach(() => {
    // Setup mock for fetch
    global.fetch.mockClear();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [
          { 
            id: 'product1',
            name: 'Test Product',
            price: 19.99,
            images: ['image.jpg'],
            category: 'category1',
            colors: ['red', 'blue'],
            description: 'Test description'
          }
        ],
        categories: [
          { id: 'category1', name: 'Test Category' }
        ]
      })
    });
    
    // Mock window.location
    delete window.location;
    window.location = {
      hostname: 'localhost',
      pathname: '/shop.html'
    };
    
    // Save original methods
    originalDocumentAddEventListener = document.addEventListener;
    originalGetElementById = document.getElementById;
    
    // Mock DOM elements
    const mockElements = {
      productsGrid: { innerHTML: '', addEventListener: jest.fn() },
      categoryList: { innerHTML: '' },
      productModal: { style: { display: 'none' }, innerHTML: '' },
      closeModal: { addEventListener: jest.fn() }
    };
    
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });
    
    document.getElementById = jest.fn(id => mockElements[id] || null);
    
    // Mock document.createElement
    document.createElement = jest.fn().mockImplementation(tag => {
      return {
        classList: { add: jest.fn() },
        dataset: {},
        style: {},
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        setAttribute: jest.fn()
      };
    });
    
    // Mock document.querySelector
    document.querySelector = jest.fn().mockReturnValue(null);
    
    // Load the shop module
    jest.resetModules();
    window.selectedColors = {};
    require('../shop.js');
  });
  
  afterEach(() => {
    // Restore original methods
    document.addEventListener = originalDocumentAddEventListener;
    document.getElementById = originalGetElementById;
    
    // Clear mocks
    jest.clearAllMocks();
  });
  
  test('DOMContentLoaded event handler is registered', () => {
    expect(document.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
  });
  
  test('fetchProducts is called on initialization', () => {
    // Verify fetch was called with the right URL
    expect(global.fetch).toHaveBeenCalled();
    expect(global.fetch.mock.calls[0][0]).toContain('/api/products');
  });
  
  test('closeModal adds event listener', () => {
    if (document.getElementById('closeModal')) {
      expect(document.getElementById('closeModal').addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    }
  });
  
  test('productsGrid adds event listener', () => {
    if (document.getElementById('productsGrid')) {
      expect(document.getElementById('productsGrid').addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    }
  });
  
  test('Stripe is initialized', () => {
    expect(global.Stripe).toHaveBeenCalled();
  });
}); 