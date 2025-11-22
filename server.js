const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// CORS SETUP
const allowedOrigins = [
  'http://localhost:4200',
  'https://blood-donor-fe.onrender.com',
];

// Dynamic origin check so both localhost + Render work
app.use(
  cors({
    origin: function (origin, callback) {
      // allow no-origin requests (like curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

// Handle preflight OPTIONS requests
app.options('*', cors());

// Parse JSON body
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test route
app.get('/', (req, res) => {
  res.send('API running');
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donors', require('./routes/donors'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
