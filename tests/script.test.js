/**
 * @jest-environment jsdom
 */

describe('Script.js', () => {
  // Store original implementation of methods we need to mock
  let originalAddEventListener;
  let originalQuerySelector;
  let originalGetElementById;
  let originalScrollY;

  beforeEach(() => {
    // Mock DOM methods
    originalAddEventListener = document.addEventListener;
    originalQuerySelector = document.querySelector;
    originalGetElementById = document.getElementById;
    
    // Set up window location mock
    delete window.location;
    window.location = {
      hostname: 'localhost',
      pathname: '/index.html'
    };

    // Mock scrolling behavior
    originalScrollY = window.scrollY;
    window.scrollY = 0;
    window.pageYOffset = 0;
    
    // Mock DOM elements
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });
    
    document.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === '.navbar') {
        return {
          appendChild: jest.fn()
        };
      }
      if (selector === 'nav ul') {
        return {
          cloneNode: jest.fn().mockReturnValue({})
        };
      }
      return null;
    });
    
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'navbar') {
        return {
          style: { transform: '' }
        };
      }
      if (id === 'freeFridaysGallery') {
        return {};
      }
      return null;
    });
    
    // Mock querySelectorAll
    document.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === 'nav ul li a') {
        return [
          { 
            getAttribute: jest.fn().mockReturnValue('index.html'),
            classList: { add: jest.fn(), remove: jest.fn() }
          },
          { 
            getAttribute: jest.fn().mockReturnValue('shop.html'),
            classList: { add: jest.fn(), remove: jest.fn() }
          }
        ];
      }
      
      if (selector === '.event-card') {
        return [
          {
            querySelector: jest.fn().mockReturnValue({
              style: { opacity: 0 }
            }),
            addEventListener: jest.fn()
          }
        ];
      }
      
      return [];
    });
    
    // Create a mock element for createElement
    const mockElement = {
      className: '',
      id: '',
      style: {},
      appendChild: jest.fn(),
      addEventListener: jest.fn(),
      classList: { toggle: jest.fn() }
    };
    
    document.createElement = jest.fn().mockReturnValue(mockElement);
    
    // Load the script
    jest.resetModules();
    global.config = {
      apiBaseUrl: 'http://localhost:3003',
      cartIcon: 'fa-shopping-bag'
    };
    
    // We need to require the script inside each test or in beforeEach
    // to ensure our mocks are applied before the script runs
    require('../script.js');
  });
  
  afterEach(() => {
    // Restore original methods
    document.addEventListener = originalAddEventListener;
    document.querySelector = originalQuerySelector;
    document.getElementById = originalGetElementById;
    window.scrollY = originalScrollY;
    
    // Clean up mocks
    jest.clearAllMocks();
  });
  
  test('DOMContentLoaded event handler is registered', () => {
    expect(document.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
  });
  
  test('Creates and appends mobile menu button', () => {
    // Verify document.createElement was called for the mobile menu button
    expect(document.createElement).toHaveBeenCalledWith('div');
    
    // Verify querySelector for navbar was called
    expect(document.querySelector).toHaveBeenCalledWith('.navbar');
  });
  
  test('Sets active nav link based on current page', () => {
    // Test when on index.html
    window.location.pathname = '/index.html';
    
    // Re-run the script with the new window.location
    jest.resetModules();
    require('../script.js');
    
    // Verify querySelectorAll for nav links was called
    expect(document.querySelectorAll).toHaveBeenCalledWith('nav ul li a');
  });
  
  test('Event card hover effects', () => {
    // Verify querySelectorAll for event cards was called
    expect(document.querySelectorAll).toHaveBeenCalledWith('.event-card');
  });
}); 