import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { OpenAIApi, Configuration } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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


app.post('/api/dalle',cors(), async (req, res) => {
  try {
    const prompt = req.body.prompt;
   
    // const responseData = {
    //   imageUrl: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU", // Replace with your dummy image URL
    // };


    // // Make a request to the DALL·E API
    const dalleResponse = await openai.createImage({
      prompt: `${prompt}`,
      n: 1,
      size: '512x512',
    });

    // console.log(dalleResponse)
    // Extract only the necessary data from the response
    // Note: Adjust these fields based on the actual structure of the response
    const responseData = {
      imageUrl: dalleResponse.data.data[0].url,
      // Add any other relevant fields you need from the response
    };

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
