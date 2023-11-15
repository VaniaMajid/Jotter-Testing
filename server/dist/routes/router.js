"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Journals_1 = __importDefault(require("../models/Journals"));
const multer_1 = __importDefault(require("multer"));
const fs = require('fs');
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
dotenv_1.default.config();
const router = express_1.default.Router();
//GET METHODS
router.get('/', async (req, res) => {
    try {
        res.send('hello');
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});
router.get('/journals/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        // Use the JournalModel to find journals for the given user ID
        const journals = await Journals_1.default.find({ userId });
        res.json(journals);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});
//POST METHODS
// Route for user registration
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Check if the user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }
        else {
            // Create a new user document
            const newUser = new User_1.default({ username, email, password });
            // Save the user document to the database
            const doc = await newUser.save();
            // Send a success response with the user document
            res.status(201).json({ message: 'User registered successfully.', user: doc });
            console.log(doc);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});
// Login route
router.post('/login', [
    (0, express_validator_1.check)('email', 'Please provide a valid email').isEmail(),
    (0, express_validator_1.check)('password', 'Password is required').exists(),
], async (req, res) => {
    // Check for validation errors
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        // Check if the password is correct
        const isPasswordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }
        // Create a JWT token and send it to the client
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '90d', // Token expiration time
        });
        const username = user.username;
        res.json({ token, username });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Route for creating a new journal entry
router.post('/create-journal', upload.array('images', 3), async (req, res) => {
    const { userId, title, description, timestamp } = req.body;
    console.log('Received request body:', req.body);
    console.log('Received files:', req.body.images);
    if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: 'No files uploaded.' });
    }
    const images = req.files.map((file) => file.filename);
    try {
        // Create a new journal document
        const newJournal = new Journals_1.default({
            userId,
            title,
            description,
            images,
            timestamp,
        });
        const doc = await newJournal.save();
        res.status(201).json({ message: 'Journal created successfully.' });
        console.log(doc);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});
// Route for updating an existing journal entry
router.put('/update-journal/:journalId', upload.array('images', 3), async (req, res) => {
    const { userId, title, description, timestamp } = req.body;
    const journalId = req.params.journalId;
    console.log('Received request body:', req.body);
    console.log('Received files:', req.files);
    if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: 'No files uploaded.' });
    }
    try {
        // Find the existing journal document by ID
        const existingJournal = await Journals_1.default.findById(journalId);
        if (!existingJournal) {
            return res.status(404).json({ message: 'Journal not found.' });
        }
        // Remove existing images if requested
        if (existingJournal.images && existingJournal.images.length > 0) {
            existingJournal.images.forEach((filename) => {
                const filePath = `uploads/${filename}`;
                fs.unlinkSync(filePath); // Synchronously delete the file
            });
            // Clear the images array
            existingJournal.images = [];
        }
        // Only update images if new ones are provided
        const images = req.files.map((file) => file.filename);
        existingJournal.images = images;
        // Update the existing journal document
        existingJournal.userId = userId;
        existingJournal.title = title;
        existingJournal.description = description;
        existingJournal.timestamp = timestamp;
        const updatedJournal = await existingJournal.save();
        res.status(200).json({ message: 'Journal updated successfully.', updatedJournal });
        console.log(updatedJournal);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});
// Route for deleting a journal entry
router.delete('/delete-journal/:journalId', async (req, res) => {
    const journalId = req.params.journalId;
    try {
        // Find the journal entry by ID and delete it
        const deletedJournal = await Journals_1.default.findByIdAndDelete(journalId);
        if (!deletedJournal) {
            return res.status(404).json({ message: 'Journal not found.' });
        }
        res.status(200).json({ message: 'Journal deleted successfully.', deletedJournal });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});
module.exports = router;
