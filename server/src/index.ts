// my-backend/src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
const mongoose = require('mongoose');
const router = require('./routes/router');
const bodyParser = require('body-parser');

dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/jotter', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error: any) => {
  console.error('MongoDB connection error:', error);
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static('uploads'));



// Define your API routes here
app.use('/', router);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

