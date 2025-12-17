const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/juices', require('./routes/juices'));
app.use('/api/orders', require('./routes/orders'));

// MongoDB connection with caching (helps in serverless environments like Vercel)
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickjuice';
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

function connectToMongo() {
  if (global.__mongoConnectPromise) {
    return global.__mongoConnectPromise;
  }
  global.__mongoConnectPromise = mongoose.connect(mongoUri, mongooseOptions)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      // clear the promise so future attempts can retry
      delete global.__mongoConnectPromise;
      throw err;
    });
  return global.__mongoConnectPromise;
}

// Kick off initial connection (cold-start). For serverless platforms, the connection
// will be reused if the instance remains warm.
connectToMongo().catch(() => {});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'QuickJuice API is running!' });
});
// Only start the server when this file is run directly (node server.js).
// When required as a module (for example by a serverless wrapper) do not call listen()
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the Express app so serverless platforms (or tests) can import it
module.exports = app;
