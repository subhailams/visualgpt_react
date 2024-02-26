import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { OpenAIApi, Configuration } from 'openai';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import Replicate from "replicate";
import addBackgroundToPNG from './lib/add-background-to-png.js';
import bodyParser from "body-parser";
import axios from 'axios';


import path from 'path';
dotenv.config();


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN, // defaults to process.env.REPLICATE_API_TOKEN
});

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


const API_HOST = process.env.REPLICATE_API_HOST

app.use(cors());
app.use(express.json());

// Enable CORS
app.use(cors());


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use('/uploads', express.static('uploads'));


app.get('/fetch-image',cors(), async (req, res) => {
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
app.post('/upload', cors(), upload.single('image'), (req, res) => {
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


app.post('/text-only-predictions',cors(), async (req, res) => {
  // Remove null and undefined values

  console.log("___________________")
  console.log(req)
  console.log("___________________")
  try {
    const response = await fetch(
      `${API_HOST}/v1/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        input:  {
          prompt: req.body.prompt,

        },
      }),
    });

    if (response.status !== 201) {
      const error = await response.json();
      return res.status(500).json({ detail: error.detail });
    }

    const prediction = await response.json();
    res.status(201).json(prediction);
  } catch (error) {
    console.error('Error in /text-only-predictions:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




app.post('/predictions',cors(), async (req, res) => {
      // Remove null and undefined values
      req.body = Object.entries(req.body).reduce(
        (a, [k, v]) => (v == null ? a : ((a[k] = v), a)),
        {}
      );
    
      console.log("___________________")
      console.log(req)
      console.log("___________________")
      try {
        const response = await fetch(`${API_HOST}/v1/predictions`, {
          method: "POST",
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version: "be04660a5b93ef2aff61e3668dedb4cbeb14941e62a3fd5998364a32d613e35e",
            input: req.body,
          }),
        });
    
        if (response.status !== 201) {
          const error = await response.json();
          return res.status(500).json({ detail: error.detail });
        }
    
        const prediction = await response.json();
        res.status(201).json(prediction);
      } catch (error) {
        console.error('Error in /predictions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });







app.get('/predictions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${API_HOST}/v1/predictions/${id}`, {
      headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
    });
    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ message: error.detail });
    }
    const prediction = await response.json();
    res.json(prediction); // Return the current prediction status
  } catch (error) {
    console.error('Error polling prediction status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

    

app.post('/instruct', cors(), async (req, res) => {
  // Extract data from the incoming request
  const { image_url, prompt } = req.body; // Adjust based on what you're forwarding

  // Define the URL of your Django endpoint
  const djangoEndpoint = 'http://127.0.0.1:8000/instruct/api';

  try {
      // Forward the request to the Django endpoint
      const response = await axios.post(djangoEndpoint, {
          image_url: image_url, // Adjust these fields based on the expected Django request format
          prompt: prompt,
      });

      // Send the response back to the original client
      res.json(response.data);
  } catch (error) {
      console.error('Error calling Django app:', error.message);
      // Handle errors, such as by forwarding the error from the Django app or customizing the message
      res.status(500).json({ success: false, message: 'Failed to call Django app' });
  }
});

// app.post('/api/dalle', async (req, res) => {
//   res.send("Endpoint is working");
// });
app.post('/api/dalle',cors(), async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const responseData = {
      imageUrl: "https://replicate.delivery/pbxt/HtGQBfA5TrqFYZBf0UL18NTqHrzt8UiSIsAkUuMHtjvFDO6p/overture-creations-5sI6fQgYIuo.png", // Replace with your dummy image URL
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
