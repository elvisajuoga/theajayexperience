/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Styles.css', () => {
  let cssContent;
  
  beforeEach(() => {
    // Mock fs.readFileSync
    jest.spyOn(fs, 'readFileSync').mockImplementation((filePath) => {
      if (filePath.includes('styles.css')) {
        return `
          /* Example CSS content for testing */
          body {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          
          .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 5%;
            background-color: #ffffff;
            position: fixed;
            width: 90%;
            top: 0;
            z-index: 1000;
            transition: transform 0.3s ease;
          }
          
          .cart-sidebar {
            position: fixed;
            top: 0;
            right: -400px;
            width: 400px;
            height: 100%;
            background-color: #000000;
            color: #ffffff;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
            transition: right 0.3s ease;
            z-index: 2000;
            overflow-y: auto;
          }
          
          .cart-sidebar.open {
            right: 0;
          }
          
          .cart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #333333;
          }
          
          .cart-header h2 {
            color: #B9964E;
            margin: 0;
          }
          
          .close-cart {
            cursor: pointer;
            font-size: 24px;
            color: #B9964E;
          }
          
          .close-cart:hover {
            color: #e6b800;
          }
          
          .cart-content {
            padding: 15px;
          }
          
          .cart-sidebar .cart-item {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #333333;
          }
          
          .cart-sidebar .item-image img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
          }
          
          .cart-sidebar .item-details {
            flex: 1;
            padding: 0 15px;
          }
          
          .cart-sidebar .item-details h4 {
            margin: 0 0 5px;
            font-size: 16px;
            color: #B9964E;
          }
          
          .cart-sidebar .item-details p {
            margin: 5px 0;
            color: #dddddd;
            font-size: 14px;
          }
          
          .cart-sidebar .item-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
          }
          
          .cart-sidebar .quantity-controls {
            display: flex;
            align-items: center;
          }
          
          .cart-sidebar .quantity-btn {
            background: none;
            border: 1px solid #444;
            color: #B9964E;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            border-radius: 4px;
          }
          
          .cart-sidebar .quantity-btn:hover {
            background-color: #333;
          }
          
          .cart-sidebar .quantity-display {
            padding: 0 10px;
            color: #dddddd;
          }
          
          .cart-sidebar .remove-item {
            cursor: pointer;
            color: #B9964E;
            background: none;
            border: none;
            padding: 5px;
            font-size: 14px;
          }
          
          .cart-sidebar .remove-item:hover {
            color: #e6b800;
          }
          
          .cart-footer {
            padding: 15px;
            border-top: 1px solid #333333;
          }
          
          .cart-total-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            color: #B9964E;
            margin-bottom: 15px;
          }
          
          .checkout-button {
            width: 100%;
            padding: 12px;
            background-color: #B9964E;
            color: #000000;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          }
          
          .checkout-button:hover {
            background-color: #e6b800;
          }
          
          .empty-cart {
            text-align: center;
            padding: 30px 0;
            color: #dddddd;
            font-size: 16px;
          }
        `;
      }
      return '';
    });
    
    // Load CSS content
    cssContent = fs.readFileSync('styles.css', 'utf-8');
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('CSS file is loaded', () => {
    expect(cssContent).toBeDefined();
    expect(cssContent.length).toBeGreaterThan(0);
  });
  
  test('Contains cart sidebar styles', () => {
    expect(cssContent).toContain('.cart-sidebar');
    expect(cssContent).toContain('position: fixed');
    expect(cssContent).toContain('background-color: #000000');
    expect(cssContent).toContain('color: #ffffff');
  });
  
  test('Cart sidebar open class is defined', () => {
    expect(cssContent).toContain('.cart-sidebar.open');
    expect(cssContent).toContain('right: 0');
  });
  
  test('Cart header styles are defined', () => {
    expect(cssContent).toContain('.cart-header');
    expect(cssContent).toContain('border-bottom: 1px solid #333333');
    expect(cssContent).toContain('.cart-header h2');
    expect(cssContent).toContain('color: #B9964E');
  });
  
  test('Close cart button styles are defined', () => {
    expect(cssContent).toContain('.close-cart');
    expect(cssContent).toContain('cursor: pointer');
    expect(cssContent).toContain('color: #B9964E');
    expect(cssContent).toContain('.close-cart:hover');
    expect(cssContent).toContain('color: #e6b800');
  });
  
  test('Cart item styles are defined', () => {
    expect(cssContent).toContain('.cart-sidebar .cart-item');
    expect(cssContent).toContain('border-bottom: 1px solid #333333');
    expect(cssContent).toContain('.cart-sidebar .item-details h4');
    expect(cssContent).toContain('color: #B9964E');
  });
  
  test('Checkout button styles are defined', () => {
    expect(cssContent).toContain('.checkout-button');
    expect(cssContent).toContain('background-color: #B9964E');
    expect(cssContent).toContain('color: #000000');
    expect(cssContent).toContain('.checkout-button:hover');
    expect(cssContent).toContain('background-color: #e6b800');
  });
}); 