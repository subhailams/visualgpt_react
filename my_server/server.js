import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { OpenAIApi, Configuration } from 'openai';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';

import path from 'path';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Enable CORS
app.use(cors());


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use('/uploads', express.static('uploads'));


app.get('/fetch-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    const response = await fetch(imageUrl);
    const imageBuffer = await response.buffer();

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', response.headers.get('content-type'));
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Internal Server Error');
  }
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    // Use the original filename for the uploaded file
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// POST endpoint for uploading images
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      res.status(400).send('No file uploaded');
      return;
    }

    // Extract the file path from the request
    const filePath = req.file.path;

    // Construct the URL of the uploaded image
    const imageUrl = `${req.protocol}://${req.get('host')}/${filePath}`;

    // Respond with the URL of the uploaded image
    res.status(200).json({ imagePath: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Internal Server Error');
  }
});


// app.post('/api/dalle', async (req, res) => {
//   res.send("Endpoint is working");
// });
app.post('/api/dalle',cors(), async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const responseData = {
      imageUrl: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU", // Replace with your dummy image URL
      // Add any other relevant fields you need for the dummy response
    };

    // const dalleResponse = await openai.createImage({
    //   prompt: `${prompt}`,
    //   n: 1,
    //   size: '512x512',
    // });

    // const responseData = {
    //   imageUrl: dalleResponse.data.data[0].url,
    //   // Add any other relevant fields you need from the response
    // };

    console.log(responseData)

    // Send the simplified response back to the client
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
