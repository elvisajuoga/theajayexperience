/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Utility functions to load HTML files for testing
const loadHTMLFile = (filename) => {
  const filePath = path.resolve(__dirname, '../../', filename);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  document.documentElement.innerHTML = fileContent;
  return document;
};

describe('DOM Testing Utilities', () => {
  test('loadHTMLFile function loads HTML content', () => {
    // Mock fs.readFileSync
    const originalReadFileSync = fs.readFileSync;
    fs.readFileSync = jest.fn().mockReturnValue('<html><body><div id="test">Test Content</div></body></html>');
    
    // Call the function
    const doc = loadHTMLFile('test.html');
    
    // Check that the document has the expected content
    expect(doc.getElementById('test').textContent).toBe('Test Content');
    
    // Restore original function
    fs.readFileSync = originalReadFileSync;
  });
});

module.exports = {
  loadHTMLFile
}; 