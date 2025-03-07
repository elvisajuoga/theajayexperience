const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));

// CORS configuration
const allowedOrigins = [
    'http://127.0.0.1:5501',          // Local development
    'http://localhost:5501',           // Local development alternative
    'https://your-production-domain.com' // Your actual domain - update this
];

// Enable CORS for specific origins
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    }
    next();
});

// Initialize Stripe only if STRIPE_SECRET_KEY is available
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Serve products
app.get('/api/products', (req, res) => {
    // In production, this would typically fetch from a database
    const products = require('./products.json');
    res.json(products);
});

// Create checkout session
if (stripe) {
    app.post('/api/create-checkout-session', async (req, res) => {
        try {
            const { items } = req.body;
            
            const lineItems = items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: `Color: ${item.color}`,
                    },
                    unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
                },
                quantity: item.quantity,
            }));

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${req.headers.origin}/success.html`,
                cancel_url: `${req.headers.origin}/shop.html`,
                shipping_address_collection: {
                    allowed_countries: ['US'], // Add other countries as needed
                },
                shipping_options: [
                    {
                        shipping_rate_data: {
                            type: 'fixed_amount',
                            fixed_amount: {
                                amount: 500, // $5.00
                                currency: 'usd',
                            },
                            display_name: 'Standard Shipping',
                            delivery_estimate: {
                                minimum: {
                                    unit: 'business_day',
                                    value: 3,
                                },
                                maximum: {
                                    unit: 'business_day',
                                    value: 5,
                                },
                            },
                        },
                    },
                ],
            });

            res.json({ id: session.id });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error creating checkout session' });
        }
    });
}

// Handle successful payments
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = 'your_webhook_secret'; // Replace with your webhook secret

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            
            // Handle successful payment
            // Here you would:
            // 1. Update your order database
            // 2. Send confirmation email
            // 3. Update inventory
            console.log('Payment successful:', session);
        }

        res.json({received: true});
    } catch (err) {
        console.error('Webhook Error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// Subscribe endpoint
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email, imageUrl } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Create subscribers directory if it doesn't exist
        const subscribersDir = path.join(__dirname, 'data');
        await fs.mkdir(subscribersDir, { recursive: true });

        // Append email to subscribers.txt
        const subscribersFile = path.join(subscribersDir, 'subscribers.txt');
        const timestamp = new Date().toISOString();
        await fs.appendFile(
            subscribersFile,
            `${email},${timestamp},${imageUrl}\n`
        );

        res.json({ success: true, message: 'Subscription successful' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ error: 'Failed to save subscription' });
    }
});

// Gallery endpoints
app.get('/api/gallery/freeFridays', async (req, res) => {
    try {
        const galleryDir = path.join(__dirname, 'public/images/freeFridays');
        const files = await fs.readdir(galleryDir);
        const images = files
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
            .map(file => `/images/freeFridays/${file}`);
        res.json(images);
    } catch (error) {
        console.error('Gallery error:', error);
        res.status(500).json({ error: 'Failed to load gallery' });
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, eventType, date, message } = req.body;
        
        if (!name || !email || !eventType || !date || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create contacts directory if it doesn't exist
        const contactsDir = path.join(__dirname, 'data');
        await fs.mkdir(contactsDir, { recursive: true });

        // Append contact form submission to contacts.txt
        const contactsFile = path.join(contactsDir, 'contacts.txt');
        const timestamp = new Date().toISOString();
        const contactData = `${timestamp}\nName: ${name}\nEmail: ${email}\nEvent Type: ${eventType}\nDate: ${date}\nMessage: ${message}\n\n`;
        
        await fs.appendFile(contactsFile, contactData);

        // Here you would typically also send an email notification
        // Add email sending logic here if needed

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Handle checkout redirection
app.get('/api/checkout', (req, res) => {
    try {
        const { items } = req.query;
        if (!items) {
            return res.status(400).send('No items provided for checkout');
        }
        
        // In a real application, you would:
        // 1. Save the order to a database
        // 2. Create a Stripe checkout session
        // 3. Redirect to Stripe
        
        // For this demo, we'll redirect to a success page
        res.redirect('/checkout.html?success=true');
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).send('Error processing checkout');
    }
});

// Production security headers
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        res.header('X-Content-Type-Options', 'nosniff');
        res.header('X-Frame-Options', 'DENY');
        res.header('X-XSS-Protection', '1; mode=block');
        res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        next();
    });
}

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle all other routes by serving the corresponding HTML file
app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, page.endsWith('.html') ? page : `${page}.html`);
    res.sendFile(filePath);
});

// Improved server start with error handling
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Access the website at http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try these solutions:`);
        console.error('1. Stop any other servers running on this port');
        console.error('2. Choose a different port by setting the PORT environment variable');
        console.error('3. Run: lsof -i :3001 to see which process is using the port');
        console.error('4. Run: kill <PID> to stop the process');
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});
