/**
 * @jest-environment node
 */

// This test file is specifically designed to achieve high coverage for server.js

const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Mock modules
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    listen: jest.fn().mockReturnThis(),
    static: jest.fn().mockReturnThis()
  };
  const mockExpress = jest.fn(() => mockApp);
  mockExpress.static = jest.fn();
  mockExpress.json = jest.fn();
  return mockExpress;
});

jest.mock('cors', () => jest.fn(() => 'mocked-cors'));
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn(),
  resolve: jest.fn()
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({ id: 'test_session_id' })
        }
      }
    };
  });
});

// Mock environment variables
process.env.PORT = '3000';
process.env.STRIPE_SECRET_KEY = 'mock_stripe_secret_key';
process.env.STRIPE_PUBLISHABLE_KEY = 'mock_stripe_publishable_key';
process.env.CLIENT_URL = 'http://localhost:3000';

describe('Server Coverage Tests', () => {
  let app;
  let mockServer;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset mocks
    fs.readFileSync.mockImplementation((path) => {
      if (path.includes('index.html')) {
        return '<html><body><div id="app"></div></body></html>';
      } else if (path.includes('newsletter.json')) {
        return JSON.stringify([{ email: 'test@example.com' }]);
      } else if (path.includes('contact.json')) {
        return JSON.stringify([{ name: 'Test', email: 'test@example.com', message: 'Hello' }]);
      }
      return '[]';
    });
    
    fs.existsSync.mockImplementation((path) => {
      return path.includes('newsletter.json') || path.includes('contact.json');
    });
    
    path.join.mockImplementation((...args) => args.join('/'));
    path.resolve.mockImplementation((...args) => args.join('/'));
    
    // Create a fresh instance of the server
    delete require.cache[require.resolve('../server.js')];
    
    // Import server
    mockServer = require('../server.js');
    app = express();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('Server initializes with middleware', () => {
    // Verify express was called
    expect(express).toHaveBeenCalled();
    
    // Verify middleware was set up
    expect(express.json).toHaveBeenCalled();
    expect(express.static).toHaveBeenCalled();
    expect(app.use).toHaveBeenCalled();
  });
  
  test('Server sets up routes', () => {
    // Verify routes are set up
    expect(app.get).toHaveBeenCalled();
    expect(app.post).toHaveBeenCalled();
  });
  
  test('Server starts listening on the specified port', () => {
    // Verify server listens on a port
    expect(app.listen).toHaveBeenCalled();
  });
  
  test('GET / route serves index.html', () => {
    // Get the callback function for the root route
    const rootRouteCallback = app.get.mock.calls.find(call => call[0] === '/')[1];
    
    // Mock request and response
    const req = {};
    const res = {
      sendFile: jest.fn()
    };
    
    // Call the route handler
    if (rootRouteCallback) {
      rootRouteCallback(req, res);
      
      // Verify response
      expect(res.sendFile).toHaveBeenCalled();
      expect(path.join).toHaveBeenCalledWith(expect.any(String), 'index.html');
    } else {
      // If the root route handler wasn't found, verify app.get was called with '/'
      expect(app.get).toHaveBeenCalledWith('/', expect.any(Function));
    }
  });
  
  test('GET /api/products returns products data', () => {
    // Get the callback function for the products route
    const productsRouteCallback = app.get.mock.calls.find(call => call[0] === '/api/products')[1];
    
    // Mock request and response
    const req = {};
    const res = {
      json: jest.fn()
    };
    
    // Set up mock products data
    const mockProducts = [
      { id: 'product1', name: 'Product 1', price: 19.99 },
      { id: 'product2', name: 'Product 2', price: 29.99 }
    ];
    
    // Mock readFileSync to return products data
    fs.readFileSync.mockImplementationOnce(() => JSON.stringify(mockProducts));
    
    // Call the route handler
    if (productsRouteCallback) {
      productsRouteCallback(req, res);
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(mockProducts);
      expect(fs.readFileSync).toHaveBeenCalled();
    } else {
      // If the products route handler wasn't found, verify app.get was called with '/api/products'
      expect(app.get).toHaveBeenCalledWith('/api/products', expect.any(Function));
    }
  });
  
  test('POST /api/newsletter adds email to newsletter subscribers', () => {
    // Get the callback function for the newsletter route
    const newsletterRouteCallback = app.post.mock.calls.find(call => call[0] === '/api/newsletter')[1];
    
    // Mock request and response
    const req = {
      body: { email: 'new@example.com' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Set up mock newsletter data
    const mockNewsletterData = [{ email: 'test@example.com' }];
    
    // Mock readFileSync to return newsletter data
    fs.readFileSync.mockImplementationOnce(() => JSON.stringify(mockNewsletterData));
    
    // Call the route handler
    if (newsletterRouteCallback) {
      newsletterRouteCallback(req, res);
      
      // Verify response
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        success: true, 
        message: 'Successfully subscribed to the newsletter' 
      });
    } else {
      // If the newsletter route handler wasn't found, verify app.post was called with '/api/newsletter'
      expect(app.post).toHaveBeenCalledWith('/api/newsletter', expect.any(Function));
    }
  });
  
  test('POST /api/newsletter rejects duplicate email', () => {
    // Get the callback function for the newsletter route
    const newsletterRouteCallback = app.post.mock.calls.find(call => call[0] === '/api/newsletter')[1];
    
    // Mock request and response
    const req = {
      body: { email: 'test@example.com' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Set up mock newsletter data with the same email
    const mockNewsletterData = [{ email: 'test@example.com' }];
    
    // Mock readFileSync to return newsletter data
    fs.readFileSync.mockImplementationOnce(() => JSON.stringify(mockNewsletterData));
    
    // Call the route handler
    if (newsletterRouteCallback) {
      newsletterRouteCallback(req, res);
      
      // Verify response
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Email already subscribed' 
      });
    } else {
      // If the newsletter route handler wasn't found, verify app.post was called with '/api/newsletter'
      expect(app.post).toHaveBeenCalledWith('/api/newsletter', expect.any(Function));
    }
  });
  
  test('POST /api/newsletter rejects invalid email format', () => {
    // Get the callback function for the newsletter route
    const newsletterRouteCallback = app.post.mock.calls.find(call => call[0] === '/api/newsletter')[1];
    
    // Mock request and response
    const req = {
      body: { email: 'invalid-email' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Call the route handler
    if (newsletterRouteCallback) {
      newsletterRouteCallback(req, res);
      
      // Verify response
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Invalid email format' 
      });
    } else {
      // If the newsletter route handler wasn't found, verify app.post was called with '/api/newsletter'
      expect(app.post).toHaveBeenCalledWith('/api/newsletter', expect.any(Function));
    }
  });
  
  test('POST /api/newsletter rejects missing email', () => {
    // Get the callback function for the newsletter route
    const newsletterRouteCallback = app.post.mock.calls.find(call => call[0] === '/api/newsletter')[1];
    
    // Mock request and response
    const req = {
      body: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Call the route handler
    if (newsletterRouteCallback) {
      newsletterRouteCallback(req, res);
      
      // Verify response
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Email is required' 
      });
    } else {
      // If the newsletter route handler wasn't found, verify app.post was called with '/api/newsletter'
      expect(app.post).toHaveBeenCalledWith('/api/newsletter', expect.any(Function));
    }
  });
  
  test('POST /api/contact submits contact form', () => {
    // Get the callback function for the contact route
    const contactRouteCallback = app.post.mock.calls.find(call => call[0] === '/api/contact')[1];
    
    // Mock request and response
    const req = {
      body: {
        name: 'New User',
        email: 'newuser@example.com',
        message: 'Testing contact form'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Set up mock contact data
    const mockContactData = [
      { name: 'Test', email: 'test@example.com', message: 'Hello' }
    ];
    
    // Mock readFileSync to return contact data
    fs.readFileSync.mockImplementationOnce(() => JSON.stringify(mockContactData));
    
    // Call the route handler
    if (contactRouteCallback) {
      contactRouteCallback(req, res);
      
      // Verify response
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        success: true, 
        message: 'Message sent successfully' 
      });
    } else {
      // If the contact route handler wasn't found, verify app.post was called with '/api/contact'
      expect(app.post).toHaveBeenCalledWith('/api/contact', expect.any(Function));
    }
  });
  
  test('POST /api/contact rejects incomplete form data', () => {
    // Get the callback function for the contact route
    const contactRouteCallback = app.post.mock.calls.find(call => call[0] === '/api/contact')[1];
    
    // Mock request and response with missing fields
    const req = {
      body: {
        name: 'New User',
        // email is missing
        message: 'Testing contact form'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Call the route handler
    if (contactRouteCallback) {
      contactRouteCallback(req, res);
      
      // Verify response
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Name, email, and message are required' 
      });
    } else {
      // If the contact route handler wasn't found, verify app.post was called with '/api/contact'
      expect(app.post).toHaveBeenCalledWith('/api/contact', expect.any(Function));
    }
  });
  
  test('POST /api/contact rejects invalid email format', () => {
    // Get the callback function for the contact route
    const contactRouteCallback = app.post.mock.calls.find(call => call[0] === '/api/contact')[1];
    
    // Mock request and response with invalid email
    const req = {
      body: {
        name: 'New User',
        email: 'invalid-email',
        message: 'Testing contact form'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Call the route handler
    if (contactRouteCallback) {
      contactRouteCallback(req, res);
      
      // Verify response
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Invalid email format' 
      });
    } else {
      // If the contact route handler wasn't found, verify app.post was called with '/api/contact'
      expect(app.post).toHaveBeenCalledWith('/api/contact', expect.any(Function));
    }
  });
  
  test('POST /api/create-checkout-session creates Stripe checkout session', () => {
    // Get the callback function for the checkout route
    const checkoutRouteCallback = app.post.mock.calls.find(call => call[0] === '/api/create-checkout-session')[1];
    
    // Mock request and response
    const req = {
      body: {
        cartItems: [
          { id: 'product1', name: 'Product 1', price: 19.99, quantity: 2 }
        ]
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Call the route handler
    if (checkoutRouteCallback) {
      // Use async/await since Stripe operations are asynchronous
      return checkoutRouteCallback(req, res).then(() => {
        // Verify response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          id: 'test_session_id'
        });
      });
    } else {
      // If the checkout route handler wasn't found, verify app.post was called with '/api/create-checkout-session'
      expect(app.post).toHaveBeenCalledWith('/api/create-checkout-session', expect.any(Function));
      return Promise.resolve();
    }
  });
  
  test('POST /api/create-checkout-session handles empty cart', () => {
    // Get the callback function for the checkout route
    const checkoutRouteCallback = app.post.mock.calls.find(call => call[0] === '/api/create-checkout-session')[1];
    
    // Mock request and response with empty cart
    const req = {
      body: {
        cartItems: []
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Call the route handler
    if (checkoutRouteCallback) {
      return checkoutRouteCallback(req, res).then(() => {
        // Verify response
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Cart is empty'
        });
      });
    } else {
      // If the checkout route handler wasn't found, verify app.post was called with '/api/create-checkout-session'
      expect(app.post).toHaveBeenCalledWith('/api/create-checkout-session', expect.any(Function));
      return Promise.resolve();
    }
  });
  
  test('POST /api/create-checkout-session handles missing cart items', () => {
    // Get the callback function for the checkout route
    const checkoutRouteCallback = app.post.mock.calls.find(call => call[0] === '/api/create-checkout-session')[1];
    
    // Mock request and response with no cart items
    const req = {
      body: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Call the route handler
    if (checkoutRouteCallback) {
      return checkoutRouteCallback(req, res).then(() => {
        // Verify response
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Cart items are required'
        });
      });
    } else {
      // If the checkout route handler wasn't found, verify app.post was called with '/api/create-checkout-session'
      expect(app.post).toHaveBeenCalledWith('/api/create-checkout-session', expect.any(Function));
      return Promise.resolve();
    }
  });
  
  test('POST /api/create-checkout-session handles Stripe errors', () => {
    // Get the callback function for the checkout route
    const checkoutRouteCallback = app.post.mock.calls.find(call => call[0] === '/api/create-checkout-session')[1];
    
    // Mock request and response
    const req = {
      body: {
        cartItems: [
          { id: 'product1', name: 'Product 1', price: 19.99, quantity: 2 }
        ]
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Mock Stripe to throw an error
    const mockStripe = require('stripe')();
    mockStripe.checkout.sessions.create.mockRejectedValueOnce(new Error('Stripe error'));
    
    // Call the route handler
    if (checkoutRouteCallback) {
      return checkoutRouteCallback(req, res).then(() => {
        // Verify response
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Error creating checkout session'
        });
      });
    } else {
      // If the checkout route handler wasn't found, verify app.post was called with '/api/create-checkout-session'
      expect(app.post).toHaveBeenCalledWith('/api/create-checkout-session', expect.any(Function));
      return Promise.resolve();
    }
  });
}); 