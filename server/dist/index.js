"use strict";
// my-backend/src/server.ts
const express = require('express');
var path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const router = require('./routes/router');
const bodyParser = require('body-parser');
dotenv.config();
// Connect to MongoDB
mongoose.connect('mongodb+srv://vania:vania87214@cluster0.gkgbfjs.mongodb.net/jotter?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});
const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '../frontend/dist')));
// Define your API routes here
app.use('/', router);
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
