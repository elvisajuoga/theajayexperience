# Ajay Experience Website

This is the official website for Ajay Experience, featuring information about services, events, and merchandise.

## Features

- Responsive design for all devices
- Modern and elegant UI
- Shopping cart functionality
- Merchandise shop with Stripe integration
- Event information and gallery

## Technologies Used

- HTML5, CSS3, JavaScript
- Express.js for the backend
- Stripe for payment processing
- Jest for testing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ajay-experience-website.git
   cd ajay-experience-website
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3003
   ```

## Testing

The project uses Jest for testing. The testing setup includes:

- Unit tests for JavaScript files
- DOM testing for HTML files
- CSS testing
- Server API testing

### Running Tests

To run all tests:
```
npm test
```

To run tests with coverage report:
```
npm test -- --coverage
```

### Test Coverage

The current test coverage is:
- Statements: 21.93%
- Branches: 17.31%
- Functions: 13.72%
- Lines: 22.15%

## Project Structure

- `*.html` - HTML pages for the website
- `styles.css` - Main stylesheet
- `script.js` - Main JavaScript file for general functionality
- `cart.js` - Shopping cart functionality
- `shop.js` - Shop page functionality
- `server.js` - Express server for API endpoints
- `tests/` - Test files
- `__mocks__/` - Mock files for testing

## Deployment

To deploy the website to production:

1. Update the `apiBaseUrl` in `script.js`, `cart.js`, and `shop.js` to your production domain
2. Set up your environment variables for Stripe in a `.env` file
3. Build and deploy to your hosting provider

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Stripe](https://stripe.com/) for payment processing
- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for typography 