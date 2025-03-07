const path = require('path');
const fs = require('fs');

// Mock environment variables
process.env.PORT = '3003';
process.env.STRIPE_SECRET_KEY = 'mock_stripe_key';
process.env.NODE_ENV = 'test';

// Mock console.log to prevent output during tests
console.log = jest.fn();
console.error = jest.fn();

// Mock express
jest.mock('express', () => {
  const mockServer = {
    on: jest.fn()
  };
  
  const expressMock = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    listen: jest.fn().mockImplementation((port, callback) => {
      callback && callback();
      return mockServer;
    })
  }));
  
  expressMock.static = jest.fn();
  expressMock.json = jest.fn();
  expressMock.raw = jest.fn().mockReturnValue((req, res, next) => next());
  
  return expressMock;
});

// Mock stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'test_session_id',
          url: 'https://test-checkout-url.com'
        })
      },
      webhooks: {
        constructEvent: jest.fn().mockReturnValue({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'test_session_id',
              customer_details: {
                email: 'test@example.com'
              },
              amount_total: 1999
            }
          }
        })
      }
    }
  }));
});

// Mock fs.promises
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    readFile: jest.fn().mockResolvedValue('{}'),
    writeFile: jest.fn().mockResolvedValue(),
    access: jest.fn().mockResolvedValue()
  }
}));

// Mock cors
jest.mock('cors', () => jest.fn(() => (req, res, next) => next()));

// Mock products.json
jest.mock('../products.json', () => ([
  { 
    id: 'test-product',
    name: 'Test Product',
    price: 19.99
  }
]), { virtual: true });

describe('Server.js', () => {
  let express;
  let app;
  let server;
  
  beforeEach(() => {
    // Reset module registry before each test
    jest.resetModules();
    
    // Get the express mock
    express = require('express');
    
    // Reload the server for each test
    server = require('../server.js');
    
    // Get the app instance
    app = express.mock.results[0].value;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('Server initializes express', () => {
    expect(express).toHaveBeenCalled();
  });
  
  test('Server uses middleware', () => {
    const cors = require('cors');
    expect(cors).toHaveBeenCalled();
    expect(app.use).toHaveBeenCalled();
    expect(express.json).toHaveBeenCalled();
  });
  
  test('Server serves static files', () => {
    expect(express.static).toHaveBeenCalled();
  });
  
  test('Server defines API routes', () => {
    expect(app.get).toHaveBeenCalledWith('/api/products', expect.any(Function));
    
    if (process.env.STRIPE_SECRET_KEY) {
      expect(app.post).toHaveBeenCalledWith('/api/create-checkout-session', expect.any(Function));
    }
  });
  
  test('Server defines webhook route', () => {
    expect(app.post).toHaveBeenCalledWith('/webhook', expect.any(Function), expect.any(Function));
    expect(express.raw).toHaveBeenCalledWith({type: 'application/json'});
  });
  
  test('Server listens on the configured port', () => {
    expect(app.listen).toHaveBeenCalledWith(
      expect.stringContaining('3003'),
      expect.any(Function)
    );
  });
}); 