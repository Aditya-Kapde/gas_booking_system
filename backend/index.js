const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 5000;

// Configure CORS to allow requests from frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri, { useUnifiedTopology: true });

let db;

// Add some dummy Aadhar numbers for testing
const dummyAadharNumbers = [
    "123456789012",
    "234567890123",
    "345678901234",
    "456789012345",
    "567890123456"
];

// Store pending payments in memory (in production, use a database)
const pendingPayments = new Map();

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db('gas_booking_system');

        // Check if dummy Aadhar numbers exist, if not add them
        const aadharCollection = db.collection('aadhar_numbers');
        const count = await aadharCollection.countDocuments();
        
        if (count === 0) {
            await aadharCollection.insertMany(
                dummyAadharNumbers.map(number => ({ aadhar_number: number }))
            );
            console.log('Added dummy Aadhar numbers');
        }

        return db;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, aadharNumber } = req.body;

        // Check if Aadhar number exists in the valid Aadhar numbers collection
        const aadharCollection = db.collection('aadhar_numbers');
        const validAadhar = await aadharCollection.findOne({ aadhar_number: aadharNumber });

        if (!validAadhar) {
            return res.status(400).json({ message: 'Invalid Aadhar number' });
        }

        const usersCollection = db.collection('users');

        // Check if email already exists
        const existingUserByEmail = await usersCollection.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if Aadhar is already linked to another email
        const existingUserByAadhar = await usersCollection.findOne({ aadharNumber });
        if (existingUserByAadhar) {
            return res.status(400).json({ message: 'This Aadhar number is already registered with another email' });
        }

        // Create new user
        await usersCollection.insertOne({
            email,
            password, // Note: In a real application, you should hash the password
            aadharNumber,
            createdAt: new Date()
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Error during signup' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ email, password }); // Note: In real app, compare hashed passwords

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

// Example of a MongoDB integrated route for bookings
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = req.body;
        const collection = db.collection('bookings');
        const result = await collection.insertOne(booking);
        res.status(201).json({ message: 'Booking created successfully', bookingId: result.insertedId });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Error creating booking' });
    }
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const collection = db.collection('bookings');
        const bookings = await collection.find({}).toArray();
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

// Create order endpoint
app.post('/api/create-order', async (req, res) => {
    try {
        if (!db) {
            throw new Error('Database not initialized');
        }

        const { orderId, amount, bookingDetails, addressData, paymentMethod, customerUpiId, merchantUpiId, status } = req.body;

        // Create the order document
        const order = {
            orderId,
            amount,
            bookingDetails,
            addressData,
            paymentMethod,
            customerUpiId,
            merchantUpiId,
            status: paymentMethod === 'COD' ? 'confirmed' : (status || 'pending'),
            createdAt: new Date(),
            paymentConfirmed: paymentMethod === 'COD'
        };

        // Store in MongoDB
        const ordersCollection = db.collection('orders');
        const result = await ordersCollection.insertOne(order);

        if (!result.acknowledged) {
            throw new Error('Failed to insert order into database');
        }

        // If it's a UPI payment, also store in pending payments
        if (paymentMethod === 'UPI') {
            pendingPayments.set(orderId, order);
        }

        res.status(200).json({ 
            success: true, 
            message: 'Order created successfully',
            orderId 
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create order: ' + error.message 
        });
    }
});

// Verify payment endpoint
app.post('/api/verify-payment', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        // Get order details from pending payments
        const order = pendingPayments.get(orderId);
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found',
                status: 'not_found'
            });
        }

        // In production, this would make an API call to UPI payment gateway
        // For now, we'll keep the payment in pending state until manually confirmed
        res.status(200).json({
            success: true,
            message: 'Payment pending confirmation',
            status: 'pending'
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to verify payment',
            status: 'error'
        });
    }
});

// Endpoint to confirm successful UPI payment (this would be called by UPI gateway in production)
app.post('/api/confirm-payment', async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        const order = pendingPayments.get(orderId);
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        order.status = status;
        order.paymentConfirmed = status === 'completed';
        pendingPayments.set(orderId, order);

        res.status(200).json({ 
            success: true, 
            message: 'Payment status updated' 
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to confirm payment' 
        });
    }
});

// Cleanup old pending payments periodically (every hour)
setInterval(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [orderId, order] of pendingPayments.entries()) {
        if (order.createdAt < oneHourAgo && order.status === 'pending') {
            pendingPayments.delete(orderId);
        }
    }
}, 60 * 60 * 1000);

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        if (!db) {
            throw new Error('Database not initialized');
        }

        const collection = db.collection('orders');
        const orders = await collection.find({})
            .sort({ createdAt: -1 }) // Sort by newest first
            .toArray();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Submit a review
app.post('/api/reviews', async (req, res) => {
    try {
        if (!db) {
            throw new Error('Database not initialized');
        }

        const { orderId, rating, review } = req.body;

        if (!orderId || !rating || !review) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const ordersCollection = db.collection('orders');
        const order = await ordersCollection.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.review) {
            return res.status(400).json({ message: 'Review already exists for this order' });
        }

        await ordersCollection.updateOne(
            { orderId },
            {
                $set: {
                    review: {
                        rating,
                        review,
                        createdAt: new Date()
                    }
                }
            }
        );

        res.status(200).json({ message: 'Review submitted successfully' });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Error submitting review' });
    }
});

// Submit a complaint
app.post('/api/complaints', async (req, res) => {
    try {
        if (!db) {
            throw new Error('Database not initialized');
        }

        const { orderId, complaint } = req.body;

        if (!orderId || !complaint) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const ordersCollection = db.collection('orders');
        const order = await ordersCollection.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.complaint) {
            return res.status(400).json({ message: 'Complaint already exists for this order' });
        }

        await ordersCollection.updateOne(
            { orderId },
            {
                $set: {
                    complaint: {
                        text: complaint,
                        status: 'pending',
                        createdAt: new Date()
                    }
                }
            }
        );

        res.status(200).json({ message: 'Complaint submitted successfully' });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ message: 'Error submitting complaint' });
    }
});

// Initialize database and start server
async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
