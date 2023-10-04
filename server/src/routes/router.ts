
import express, { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User'; 
import JournalModel, { IJournal } from '../models/Journals';
import multer from 'multer';



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname)
  }
})

const upload = multer({ storage: storage })


dotenv.config();
const router = express.Router();

//GET METHODS
router.get('/journals/:userId', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      // Use the JournalModel to find journals for the given user ID
      const journals: IJournal[] = await JournalModel.find({ userId });
      res.json(journals);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  });
  

//POST METHODS
// Route for user registration
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }
        else {
            // Create a new user document
            const newUser = new User({ username, email, password });

            // Save the user document to the database
            const doc = await newUser.save();

            // Send a success response with the user document
            res.status(201).json({ message: 'User registered successfully.', user: doc });
            console.log(doc);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Login route
router.post(
    '/login',
    [
      check('email', 'Please provide a valid email').isEmail(),
      check('password', 'Password is required').exists(),
    ],
    async (req: Request, res: Response) => {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
  
      try {
        // Check if the user exists
        const user = await User.findOne({ email });
  
        if (!user) {
          return res.status(400).json({ message: 'User not found' });
        }
  
        // Check if the password is correct
        const isPasswordMatch = await bcrypt.compare(password, user.password);
  
        if (!isPasswordMatch) {
          return res.status(400).json({ message: 'Incorrect password' });
        }
  
        // Create a JWT token and send it to the client
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
          expiresIn: '90', // Token expiration time
        });
        const username = user.username; 
        res.json({ token, username });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );


  // Route for creating a new journal entry
router.post('/create-journal', upload.array('images', 3), async (req: Request, res: Response) => {
    const { userId, title, description, timestamp } = req.body;
    console.log('Received request body:', req.body);
console.log('Received files:', req.body.images);
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }


    const images: string[] = req.files.map((file: Express.Multer.File) => file.filename);

  try {
    // Create a new journal document
    const newJournal = new JournalModel({
      userId,
      title,
      description,
      images,
      timestamp,
    });

    const doc = await newJournal.save();

    res.status(201).json({ message: 'Journal created successfully.' });
    console.log(doc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});


module.exports = router;
