const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const postRoute = require('./routes/posts');
const commentRoute = require('./routes/comments');

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Database is connected successfully!');
  } catch (err) {
    console.log(err);
  }
};

// Middlewares
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/comments', commentRoute);

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Image upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image provided!' });
  }

  // Upload the file buffer to Cloudinary
  cloudinary.uploader.upload_stream({ folder: 'blog_images' }, (error, result) => {
    if (error) {
      return res.status(500).json({ message: 'Cloudinary upload failed', error });
    }

    // Send back the Cloudinary URL of the uploaded image
    res.status(200).json({ url: result.secure_url });
  }).end(req.file.buffer); // Use the buffer from the memory storage
});

// Start the server
app.listen(process.env.PORT, () => {
  connectDB();
  console.log('App is running on port ' + process.env.PORT);
});
