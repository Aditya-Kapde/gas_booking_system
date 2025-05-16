const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri, { useUnifiedTopology: true });

let db;

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db('gas_booking_system');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

app.use(cors());
app.use(express.json());

// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Example of a MongoDB integrated route
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

// Start server after connecting to MongoDB
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ Backend server is running at http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
